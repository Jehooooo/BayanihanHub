// ============================================================
// Bayanihan Hub — Profile Picture Store (Zustand + Persist)
// ============================================================

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ProfilePictureSubmission, ProfilePictureStatus, Notification } from '../types';
import { generateId } from '../utils/id';
import { useAuthStore } from './authStore';
import { useNotificationStore } from './notificationStore';

interface ProfilePictureState {
  submissions: ProfilePictureSubmission[];
  fetchSubmissions: () => Promise<void>;
  submitProfilePicture: (userId: string, imageUrl: string) => Promise<ProfilePictureSubmission>;
  approveSubmission: (submissionId: string, reviewedBy?: string) => Promise<void>;
  rejectSubmission: (submissionId: string, rejectionReason: string, reviewedBy?: string) => Promise<void>;
  getSubmissionByUserId: (userId: string) => ProfilePictureSubmission | undefined;
  getPendingCount: () => number;
}

export const useProfilePictureStore = create<ProfilePictureState>()(
  persist(
    (set, get) => ({
      submissions: [],

      fetchSubmissions: async () => {
        try {
          const res = await fetch('/api/admin/avatars');
          if (res.ok) {
            const data = await res.json();
            if (data.submissions && Array.isArray(data.submissions)) {
              const sanitized = data.submissions.filter(
                (s: any) => s.userId !== 'user-14' && s.userId !== '14' && !s.user?.fullName?.toLowerCase().includes('jehosue')
              );
              set({ submissions: sanitized });
              return;
            }
          }
        } catch (err) {
          console.error('[ProfilePictureStore] Error fetching avatars:', err);
        }
      },

      submitProfilePicture: async (userId: string, imageUrl: string) => {
        const now = new Date().toISOString();

        try {
          await fetch('/api/users/profile/avatar', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, imageUrl }),
          });
        } catch {
          // Best effort
        }

        const existingIdx = get().submissions.findIndex(
          (s) => s.userId === userId && s.status === 'pending'
        );

        let submission: ProfilePictureSubmission;

        if (existingIdx !== -1) {
          submission = {
            ...get().submissions[existingIdx],
            imageUrl,
            submittedAt: now,
          };
          const next = [...get().submissions];
          next[existingIdx] = submission;
          set({ submissions: next });
        } else {
          submission = {
            id: `sub-${generateId()}`,
            userId,
            imageUrl,
            status: 'pending',
            submittedAt: now,
          };
          set({ submissions: [submission, ...get().submissions] });
        }

        const authUser = useAuthStore.getState().user;
        if (authUser && authUser.id === userId) {
          useAuthStore.getState().updateProfile({
            pendingAvatar: imageUrl,
            avatarStatus: 'pending',
            avatarRejectionReason: undefined,
          });
        }

        return submission;
      },

      approveSubmission: async (submissionId: string, reviewedBy = 'Admin User') => {
        const now = new Date().toISOString();

        try {
          await fetch(`/api/admin/avatars/${encodeURIComponent(submissionId)}/approve`, {
            method: 'POST',
          });
        } catch {
          // Best effort
        }

        const next = get().submissions.map((sub) => {
          if (sub.id === submissionId) {
            const updated = {
              ...sub,
              status: 'approved' as ProfilePictureStatus,
              reviewedAt: now,
              reviewedBy,
              rejectionReason: undefined,
            };

            const currentAuthUser = useAuthStore.getState().user;
            if (currentAuthUser && currentAuthUser.id === sub.userId) {
              useAuthStore.getState().updateProfile({
                avatar: sub.imageUrl,
                pendingAvatar: undefined,
                avatarStatus: 'approved',
                avatarRejectionReason: undefined,
              });
            }

            const notif: Notification = {
              id: `notif-${generateId()}`,
              userId: sub.userId,
              type: 'profile_picture_approved',
              title: 'Profile Picture Approved',
              message: 'Your profile picture has been approved by an administrator and is now active across Bayanihan Hub!',
              link: '/profile',
              isRead: false,
              createdAt: now,
            };
            useNotificationStore.getState().addNotification(notif);

            return updated;
          }
          return sub;
        });

        set({ submissions: next });
      },

      rejectSubmission: async (submissionId: string, rejectionReason: string, reviewedBy = 'Admin User') => {
        const now = new Date().toISOString();

        try {
          await fetch(`/api/admin/avatars/${encodeURIComponent(submissionId)}/reject`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ reason: rejectionReason }),
          });
        } catch {
          // Best effort
        }

        const next = get().submissions.map((sub) => {
          if (sub.id === submissionId) {
            const updated = {
              ...sub,
              status: 'rejected' as ProfilePictureStatus,
              rejectionReason,
              reviewedAt: now,
              reviewedBy,
            };

            const currentAuthUser = useAuthStore.getState().user;
            if (currentAuthUser && currentAuthUser.id === sub.userId) {
              useAuthStore.getState().updateProfile({
                pendingAvatar: undefined,
                avatarStatus: 'rejected',
                avatarRejectionReason: rejectionReason,
              });
            }

            const notif: Notification = {
              id: `notif-${generateId()}`,
              userId: sub.userId,
              type: 'profile_picture_rejected',
              title: 'Profile Picture Declined',
              message: `Your profile photo submission was declined: "${rejectionReason}". Please upload a new photo.`,
              link: '/profile',
              isRead: false,
              createdAt: now,
            };
            useNotificationStore.getState().addNotification(notif);

            return updated;
          }
          return sub;
        });

        set({ submissions: next });
      },

      getSubmissionByUserId: (userId: string) => {
        return get().submissions.find((s) => s.userId === userId);
      },

      getPendingCount: () => {
        return get().submissions.filter((s) => s.status === 'pending').length;
      },
    }),
    {
      name: 'bayanihan-profile-submissions',
      storage: {
        getItem: (name) => {
          try {
            const val = localStorage.getItem(name);
            if (!val) return null;
            const parsed = JSON.parse(val);
            if (parsed?.state?.submissions && Array.isArray(parsed.state.submissions)) {
              parsed.state.submissions = parsed.state.submissions.filter(
                (s: any) => s.userId !== 'user-14' && s.userId !== '14' && !s.user?.fullName?.toLowerCase().includes('jehosue')
              );
            }
            return parsed;
          } catch {
            return null;
          }
        },
        setItem: (name, value) => {
          try {
            localStorage.setItem(name, JSON.stringify(value));
          } catch {}
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
