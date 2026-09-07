// ============================================================
// Bayanihan Hub — Profile Picture Store (Zustand + Persist)
// ============================================================

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ProfilePictureSubmission, ProfilePictureStatus, Notification } from '../types';
import { mockUsers, mockNotifications, getUserById, generateId } from '../data/mockData';
import { useAuthStore } from './authStore';
import { useNotificationStore } from './notificationStore';

const initialSubmissions: ProfilePictureSubmission[] = [
  {
    id: 'sub-1',
    userId: 'user-2',
    user: mockUsers[1],
    imageUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&auto=format&fit=crop&q=80',
    status: 'pending',
    submittedAt: '2026-08-06T08:30:00Z',
  },
  {
    id: 'sub-2',
    userId: 'user-4',
    user: mockUsers[3],
    imageUrl: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=400&auto=format&fit=crop&q=80',
    status: 'pending',
    submittedAt: '2026-08-06T09:15:00Z',
  },
  {
    id: 'sub-3',
    userId: 'user-3',
    user: mockUsers[2],
    imageUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&auto=format&fit=crop&q=80',
    status: 'approved',
    submittedAt: '2026-08-04T10:00:00Z',
    reviewedAt: '2026-08-04T11:00:00Z',
    reviewedBy: 'Admin User',
  },
];

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
      submissions: initialSubmissions,

      fetchSubmissions: async () => {
        try {
          const res = await fetch('/api/admin/avatars');
          if (res.ok) {
            const data = await res.json();
            if (data.submissions && Array.isArray(data.submissions)) {
              set({ submissions: data.submissions });
              return;
            }
          }
        } catch {
          // Fallback
        }
      },

      submitProfilePicture: async (userId: string, imageUrl: string) => {
        const user = getUserById(userId) || useAuthStore.getState().user || undefined;
        const now = new Date().toISOString();

        // Backend sync
        try {
          await fetch('/api/users/profile/avatar', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, imageUrl }),
          });
        } catch {
          // Fallback
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
            user,
            imageUrl,
            status: 'pending',
            submittedAt: now,
          };
          set({ submissions: [submission, ...get().submissions] });
        }

        // Update auth user state
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
          // Fallback
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

            const targetUser = mockUsers.find((u) => u.id === sub.userId);
            if (targetUser) {
              targetUser.avatar = sub.imageUrl;
              targetUser.pendingAvatar = undefined;
              targetUser.avatarStatus = 'approved';
              targetUser.avatarRejectionReason = undefined;
            }

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
            mockNotifications.unshift(notif);
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
          // Fallback
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

            const targetUser = mockUsers.find((u) => u.id === sub.userId);
            if (targetUser) {
              targetUser.pendingAvatar = undefined;
              targetUser.avatarStatus = 'rejected';
              targetUser.avatarRejectionReason = rejectionReason;
            }

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
            mockNotifications.unshift(notif);
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
    }
  )
);
