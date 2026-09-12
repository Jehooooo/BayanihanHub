// ============================================================
// Bayanihan Hub — Identity Verification Store (Zustand + Persist)
// ============================================================

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { IdentityVerificationRecord, VerificationStatus } from '../types';
import { generateId } from '../utils/id';
import { maskIdNumber, verificationService } from '../services/verification.service';
import { safeSetLocalStorageItem } from '../utils/imageCompression';
import { useNotificationStore } from './notificationStore';

interface IdentityVerificationState {
  verifications: IdentityVerificationRecord[];
  isLoading: boolean;
  fetchVerifications: () => Promise<void>;
  submitVerification: (
    data: Omit<IdentityVerificationRecord, 'id' | 'submittedAt' | 'maskedIdNumber'>
  ) => IdentityVerificationRecord;
  approveVerification: (verificationId: string, reviewedBy?: string) => Promise<void>;
  rejectVerification: (verificationId: string, reason: string, reviewedBy?: string) => Promise<void>;
  requestRetry: (
    verificationId: string,
    reason: string,
    instructions: string,
    reviewedBy?: string
  ) => Promise<void>;
  getRecordByUserId: (userId: string) => IdentityVerificationRecord | undefined;
  getPendingCount: () => number;
}

export const useIdentityVerificationStore = create<IdentityVerificationState>()(
  persist(
    (set, get) => ({
      verifications: [],
      isLoading: false,

      fetchVerifications: async () => {
        set({ isLoading: true });
        try {
          const res = await fetch('/api/verification/applications');
          if (res.ok) {
            const data = await res.json();
            if (data && Array.isArray(data.applications)) {
              const sanitized = data.applications
                .filter((a: any) => a.userId !== 'user-14' && a.userId !== '14' && !a.fullNameOnId?.toLowerCase().includes('jehosue'))
                .map((a: any) => ({
                  ...a,
                  faceImageUrl: '',
                  user: a.user ? { ...a.user, avatar: '' } : a.user,
                }));
              set({ verifications: sanitized, isLoading: false });
              return;
            }
          }
        } catch (err) {
          console.warn('[VerificationStore] Backend fetch failed:', err);
        }
        set({ isLoading: false });
      },

      submitVerification: (data) => {
        const id = 'verif-' + generateId();
        const maskedIdNumber = maskIdNumber(data.idNumber);

        const newRecord: IdentityVerificationRecord = {
          ...data,
          id,
          maskedIdNumber,
          submittedAt: new Date().toISOString(),
        };

        set((state) => {
          const existingIdx = state.verifications.findIndex((v) => v.userId === data.userId);
          if (existingIdx !== -1) {
            const updated = [...state.verifications];
            updated[existingIdx] = newRecord;
            return { verifications: updated };
          }
          return { verifications: [newRecord, ...state.verifications] };
        });

        return newRecord;
      },

      approveVerification: async (verificationId: string, reviewedBy = 'Admin') => {
        const target = get().verifications.find((v) => v.id === verificationId);

        set((state) => ({
          verifications: state.verifications.map((v) => {
            if (v.id !== verificationId) return v;
            return {
              ...v,
              status: 'APPROVED' as VerificationStatus,
              verifiedAt: new Date().toISOString(),
              reviewedBy,
              rejectionReason: undefined,
              retryInstructions: undefined,
            };
          }),
        }));

        if (target) {
          useNotificationStore.getState().addNotification({
            userId: target.userId,
            type: 'system',
            title: 'Account Approved!',
            message: 'Your Bayanihan Hub account has been approved! You can now log in and start using Bayanihan Hub.',
            isRead: false,
          });
        }

        // Sync with backend asynchronously
        await verificationService.approveApplication(verificationId, reviewedBy).catch(() => {});
        get().fetchVerifications().catch(() => {});
      },

      rejectVerification: async (verificationId: string, reason: string, reviewedBy = 'Admin') => {
        const target = get().verifications.find((v) => v.id === verificationId);

        set((state) => ({
          verifications: state.verifications.map((v) => {
            if (v.id !== verificationId) return v;
            return {
              ...v,
              status: 'REJECTED' as VerificationStatus,
              rejectionReason: reason,
              reviewedBy,
            };
          }),
        }));

        if (target) {
          useNotificationStore.getState().addNotification({
            userId: target.userId,
            type: 'system',
            title: 'Registration Rejected',
            message: `Your Bayanihan Hub registration was not approved. ${reason ? `Reason: ${reason}. ` : ''}Please review the provided information or contact an administrator.`,
            isRead: false,
          });
        }

        // Sync with backend asynchronously
        await verificationService.rejectApplication(verificationId, reason, reviewedBy).catch(() => {});
        get().fetchVerifications().catch(() => {});
      },

      requestRetry: async (verificationId: string, reason: string, instructions: string, reviewedBy = 'Admin') => {
        set((state) => ({
          verifications: state.verifications.map((v) => {
            if (v.id !== verificationId) return v;
            return {
              ...v,
              status: 'RETRY_REQUIRED' as VerificationStatus,
              rejectionReason: reason,
              retryInstructions: instructions,
              reviewedBy,
            };
          }),
        }));

        await verificationService.requestRetry(verificationId, reason, instructions, reviewedBy).catch(() => {});
        get().fetchVerifications().catch(() => {});
      },

      getRecordByUserId: (userId: string) => {
        return get().verifications.find((v) => v.userId === userId);
      },

      getPendingCount: () => {
        return get().verifications.filter((v) => v.status === 'PENDING').length;
      },
    }),
    {
      name: 'bayanihan-hub-identity-verifications',
      storage: {
        getItem: (name) => {
          try {
            const val = localStorage.getItem(name);
            if (!val) return null;
            const parsed = JSON.parse(val);
            if (parsed?.state?.verifications && Array.isArray(parsed.state.verifications)) {
              parsed.state.verifications = parsed.state.verifications
                .filter((v: any) => v.userId !== 'user-14' && v.userId !== '14' && !v.fullNameOnId?.toLowerCase().includes('jehosue'))
                .map((v: any) => ({ ...v, faceImageUrl: '', user: v.user ? { ...v.user, avatar: '' } : v.user }));
            }
            return parsed;
          } catch {
            return null;
          }
        },
        setItem: (name, value) => {
          safeSetLocalStorageItem(name, JSON.stringify(value));
        },
        removeItem: (name) => {
          try {
            localStorage.removeItem(name);
          } catch {}
        },
      },
    }
  )
);
