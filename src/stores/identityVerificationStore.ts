// ============================================================
// Bayanihan Hub — Identity Verification Store (Zustand + Persist)
// ============================================================

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { IdentityVerificationRecord, VerificationStatus } from '../types';
import { mockUsers, getUserById, generateId } from '../data/mockData';
import { maskIdNumber, verificationService } from '../services/verification.service';
import { safeSetLocalStorageItem } from '../utils/imageCompression';
import { useNotificationStore } from './notificationStore';

// Realistic sample seed verifications for immediate demonstration in Admin Moderation
const initialVerifications: IdentityVerificationRecord[] = [
  {
    id: 'verif-1',
    userId: 'user-1',
    user: mockUsers[0],
    idType: 'Philippine National ID / PhilSys ID',
    idNumber: '1234-5678-9012-3456',
    maskedIdNumber: '•••••••• 3456',
    fullNameOnId: 'Maria Santos',
    dob: '1992-05-14',
    idDocumentUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&auto=format&fit=crop&q=80',
    faceImageUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&auto=format&fit=crop&q=80',
    status: 'VERIFIED',
    provider: 'BayanihanHub-Biometric-Engine-v2',
    confidenceScore: 96,
    matchDetails: {
      faceMatch: true,
      nameMatch: true,
      livenessVerified: true,
    },
    submittedAt: '2026-08-01T09:30:00Z',
    verifiedAt: '2026-08-01T09:32:00Z',
    reviewedBy: 'Automated Biometric System',
  },
  {
    id: 'verif-2',
    userId: 'user-2',
    user: mockUsers[1],
    idType: "Driver's License",
    idNumber: 'N01-23-456789',
    maskedIdNumber: '•••••••• 6789',
    fullNameOnId: 'Juan Dela Cruz',
    dob: '1988-11-20',
    expirationDate: '2028-11-20',
    idDocumentUrl: 'https://images.unsplash.com/photo-1554415707-9e44264e402e?w=600&auto=format&fit=crop&q=80',
    faceImageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
    status: 'VERIFIED',
    provider: 'BayanihanHub-Biometric-Engine-v2',
    confidenceScore: 94,
    matchDetails: {
      faceMatch: true,
      nameMatch: true,
      livenessVerified: true,
    },
    submittedAt: '2026-08-02T14:15:00Z',
    verifiedAt: '2026-08-02T14:16:00Z',
    reviewedBy: 'Automated Biometric System',
  },
  {
    id: 'verif-3',
    userId: 'user-3',
    user: mockUsers[2],
    idType: 'Philippine Passport',
    idNumber: 'P8934521A',
    maskedIdNumber: '•••••••• 521A',
    fullNameOnId: 'Ana Reyes',
    dob: '1995-03-12',
    expirationDate: '2031-03-12',
    idDocumentUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=600&auto=format&fit=crop&q=80',
    faceImageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
    status: 'PENDING',
    provider: 'BayanihanHub-Biometric-Engine-v2',
    confidenceScore: 92,
    matchDetails: {
      faceMatch: true,
      nameMatch: true,
      livenessVerified: true,
    },
    submittedAt: '2026-08-06T10:00:00Z',
  },
  {
    id: 'verif-4',
    userId: 'user-4',
    user: mockUsers[3],
    idType: 'Postal ID',
    idNumber: 'PRN-99882211',
    maskedIdNumber: '•••••••• 2211',
    fullNameOnId: 'Marco Ramos',
    dob: '1990-07-04',
    expirationDate: '2027-07-04',
    idDocumentUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&auto=format&fit=crop&q=80',
    faceImageUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80',
    status: 'RETRY_REQUIRED',
    provider: 'BayanihanHub-Biometric-Engine-v2',
    confidenceScore: 68,
    matchDetails: {
      faceMatch: false,
      nameMatch: true,
      livenessVerified: true,
    },
    rejectionReason: 'ID photo capture was partly blurry with bottom-left corner cut off.',
    retryInstructions: 'Please lay your card on a flat, well-lit surface with all four corners visible.',
    submittedAt: '2026-08-05T16:20:00Z',
  },
];

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
      verifications: initialVerifications,
      isLoading: false,

      fetchVerifications: async () => {
        set({ isLoading: true });
        try {
          const res = await fetch('/api/verification/applications');
          if (res.ok) {
            const data = await res.json();
            if (data && Array.isArray(data.applications) && data.applications.length > 0) {
              set({ verifications: data.applications, isLoading: false });
              return;
            }
          }
        } catch (err) {
          console.warn('[VerificationStore] Backend fetch failed, keeping current verifications:', err);
        }
        set({ isLoading: false });
      },

      submitVerification: (data) => {
        const id = 'verif-' + generateId();
        const maskedIdNumber = maskIdNumber(data.idNumber);
        const user = data.user || getUserById(data.userId);

        const newRecord: IdentityVerificationRecord = {
          ...data,
          id,
          user,
          maskedIdNumber,
          submittedAt: new Date().toISOString(),
        };

        set((state) => {
          // Replace if user already had an active verification, or prepend new
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

        // Update target user account status in mock registry
        if (target) {
          const user = mockUsers.find((u) => u.id === target.userId);
          if (user) {
            user.account_status = 'APPROVED';
            user.isVerified = true;
            user.verificationStatus = 'APPROVED';
            user.facial_verification_status = 'PASSED';
            user.id_verification_status = 'VERIFIED';
          }

          // Send approval notification to the user
          useNotificationStore.getState().addNotification({
            userId: target.userId,
            type: 'system',
            title: 'Account Approved! 🛡️',
            message: 'Your Bayanihan Hub account has been approved! You can now log in and start using Bayanihan Hub.',
            isRead: false,
          });
        }

        // Sync with backend asynchronously
        await verificationService.approveApplication(verificationId, reviewedBy).catch(() => {});
        // Refresh from backend to get updated state
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

        // Update target user account status in mock registry
        if (target) {
          const user = mockUsers.find((u) => u.id === target.userId);
          if (user) {
            user.account_status = 'REJECTED';
            user.isVerified = false;
            user.verificationStatus = 'REJECTED';
          }

          // Send rejection notification to the user
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
        // Refresh from backend to get updated state
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

        // Sync with backend
        await verificationService.requestRetry(verificationId, reason, instructions, reviewedBy).catch(() => {});
        // Refresh from backend to get updated state
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
            return val ? JSON.parse(val) : null;
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
