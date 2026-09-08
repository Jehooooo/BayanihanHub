// ============================================================
// Bayanihan Hub — Notification Store (Zustand)
// ============================================================

import { create } from 'zustand';
import type { Notification } from '../types';
import { mockNotifications, generateId } from '../data/mockData';

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  readIds: Set<string>;
  isLoading: boolean;
  currentUserId: string | null;
  fetchNotifications: (userId: string) => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: string) => void;
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt'>) => void;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  readIds: new Set<string>(),
  isLoading: false,
  currentUserId: null,

  fetchNotifications: async (userId: string) => {
    set({ isLoading: true, currentUserId: userId });
    const currentReadIds = get().readIds;

    try {
      const res = await fetch(`/api/notifications?userId=${encodeURIComponent(userId)}&user_id=${encodeURIComponent(userId)}`);
      if (res.ok) {
        const data = await res.json();
        const apiNotifs: Notification[] = (data.notifications || [])
          .filter((n: any) => {
            if (!n.userId) return true;
            const normN = String(n.userId).replace('user-', '');
            const normU = String(userId).replace('user-', '');
            return normN === normU || (normU === '1' && normN === '6') || (normU === '6' && normN === '1');
          })
          .map((n: any) => ({
            id: String(n.id),
            userId: String(n.userId || userId),
            type: n.type,
            title: n.title,
            message: n.message,
            link: n.link,
            isRead: Boolean(n.isRead) || currentReadIds.has(String(n.id)),
            createdAt: n.createdAt,
          }));

        // Also merge mock notifications for any demo items that don't collide
        const userMockNotifs = mockNotifications.filter((n) => n.userId === userId);
        const existingIds = new Set(apiNotifs.map((n) => n.id));
        const combined = [
          ...apiNotifs,
          ...userMockNotifs.filter((n) => !existingIds.has(n.id)),
        ]
          .map((n) => (currentReadIds.has(n.id) ? { ...n, isRead: true } : n))
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

        set({
          notifications: combined,
          unreadCount: combined.filter((n) => !n.isRead).length,
          isLoading: false,
        });
        return;
      }
    } catch {
      // Graceful fallback to mock data on network error
    }

    const fallback = mockNotifications
      .filter((n) => n.userId === userId)
      .map((n) => (currentReadIds.has(n.id) ? { ...n, isRead: true } : n))
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    set({
      notifications: fallback,
      unreadCount: fallback.filter((n) => !n.isRead).length,
      isLoading: false,
    });
  },

  markAsRead: async (id: string) => {
    const { notifications, readIds } = get();
    const updatedReadIds = new Set(readIds);
    updatedReadIds.add(id);

    const updated = notifications.map((n) =>
      n.id === id ? { ...n, isRead: true } : n
    );
    const newUnread = updated.filter((n) => !n.isRead).length;

    set({
      readIds: updatedReadIds,
      notifications: updated,
      unreadCount: newUnread,
    });

    try {
      await fetch(`/api/notifications/${encodeURIComponent(id)}/read`, { method: 'PATCH' });
    } catch {
      // Best-effort
    }
  },

  markAllAsRead: async () => {
    const { notifications, currentUserId, readIds } = get();
    const updatedReadIds = new Set(readIds);
    notifications.forEach((n) => updatedReadIds.add(n.id));

    const updated = notifications.map((n) => ({ ...n, isRead: true }));
    set({
      readIds: updatedReadIds,
      notifications: updated,
      unreadCount: 0,
    });

    if (currentUserId) {
      try {
        await fetch(`/api/notifications/read-all?userId=${encodeURIComponent(currentUserId)}&user_id=${encodeURIComponent(currentUserId)}`, { method: 'PATCH' });
      } catch {
        // Best-effort
      }
    }
  },

  deleteNotification: (id: string) => {
    const { notifications } = get();
    const updated = notifications.filter((n) => n.id !== id);
    set({
      notifications: updated,
      unreadCount: updated.filter((n) => !n.isRead).length,
    });
  },

  addNotification: (notification) => {
    const newNotif: Notification = {
      ...notification,
      id: generateId(),
      createdAt: new Date().toISOString(),
    };
    const { notifications } = get();
    set({
      notifications: [newNotif, ...notifications],
      unreadCount: get().unreadCount + (newNotif.isRead ? 0 : 1),
    });
  },
}));
