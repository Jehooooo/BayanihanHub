// ============================================================
// Bayanihan Hub — Profile Picture Store (Zustand + Persist)
// ============================================================

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ProfilePictureSubmission, ProfilePictureStatus, Notification } from '../types';
import { mockUsers, mockNotifications, getUserById, generateId } from '../data/mockData';
import { useAuthStore } from './authStore';
import { useNotificationStore } from './notificationStore';

// Initial seed submissions so Admin validation can be demonstrated immediately
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
  submitProfilePicture: (userId: string, imageUrl: string) => ProfilePictureSubmission;
  approveSubmission: (submissionId: string, reviewedBy?: string) => void;
  rejectSubmission: (submissionId: string, rejectionReason: string, reviewedBy?: string) => void;
  getSubmissionByUserId: (userId: string) => ProfilePictureSubmission | undefined;
  getPendingCount: () => number;
}

export const useProfilePictureStore = create<ProfilePictureState>()(
  persist(
    (set, get) => ({
      submissions: initialSubmissions,

      submitProfilePicture: (userId: string, imageUrl: string) => {
        const user = getUserById(userId) || useAuthStore.getState().user || undefined;
        const now = new Date().toISOString();

        // Check if there is an existing pending submission for this user
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

        // Update user state
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

      approveSubmission: (submissionId: string, reviewedBy = 'Admin User') => {
        const now = new Date().toISOString();
        const next = get().submissions.map((sub) => {
          if (sub.id === submissionId) {
            const updated = {
              ...sub,
              status: 'approved' as ProfilePictureStatus,
              reviewedAt: now,
              reviewedBy,
              rejectionReason: undefined,
            };

            // Update user's official avatar in mockUsers and authStore
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

            // Create notification for the user
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

      rejectSubmission: (submissionId: string, rejectionReason: string, reviewedBy = 'Admin User') => {
        const now = new Date().toISOString();
        const next = get().submissions.map((sub) => {
          if (sub.id === submissionId) {
            const updated = {
              ...sub,
              status: 'rejected' as ProfilePictureStatus,
              rejectionReason,
              reviewedAt: now,
              reviewedBy,
            };

            // Update in mockUsers and authStore
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

            // Create notification for the user
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
