// ============================================================
// Bayanihan Hub — Notification Store (Zustand)
// ============================================================

import { create } from 'zustand';
import type { Notification } from '../types';
import { mockNotifications, generateId } from '../data/mockData';

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  fetchNotifications: (userId: string) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  deleteNotification: (id: string) => void;
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt'>) => void;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: false,

  fetchNotifications: (userId: string) => {
    set({ isLoading: true });
    
    // Simulate API call
    setTimeout(() => {
      const userNotifications = mockNotifications
        .filter((n) => n.userId === userId)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      set({
        notifications: userNotifications,
        unreadCount: userNotifications.filter((n) => !n.isRead).length,
        isLoading: false,
      });
    }, 300);
  },

  markAsRead: (id: string) => {
    const { notifications } = get();
    const updated = notifications.map((n) =>
      n.id === id ? { ...n, isRead: true } : n
    );
    set({
      notifications: updated,
      unreadCount: updated.filter((n) => !n.isRead).length,
    });
  },

  markAllAsRead: () => {
    const { notifications } = get();
    const updated = notifications.map((n) => ({ ...n, isRead: true }));
    set({ notifications: updated, unreadCount: 0 });
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
