// ============================================================
// Bayanihan Hub — Settings Store (Zustand + Persist)
// ============================================================

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { safeSetLocalStorageItem } from '../utils/imageCompression';

// ── Types ────────────────────────────────────────────────────

export interface NotificationPreferences {
  // In-App
  messages: boolean;
  replies: boolean;
  messageReactions: boolean;
  donationRequests: boolean;
  exchangeOffers: boolean;
  requestStatusUpdates: boolean;
  ratingsAndReviews: boolean;
  moderationUpdates: boolean;
  accountUpdates: boolean;
  urgentCommunityAlerts: boolean;
  // Email
  emailMessages: boolean;
  emailDonationUpdates: boolean;
  emailExchangeUpdates: boolean;
  emailAccountSecurity: boolean;
  // Frequency
  frequency: 'realtime' | 'daily_summary' | 'important_only';
}

export interface PrivacyPreferences {
  phoneVisibility: 'hidden' | 'verified_neighbors' | 'accepted_partners';
  showActiveStatus: boolean;
  showReadReceipts: boolean;
  showApproximateLocationOnly: boolean;
  newLoginAlerts: boolean;
}

export interface MessagingPreferences {
  allowFromVerifiedNeighbors: boolean;
  allowFromActiveExchangePartners: boolean;
  messageSound: boolean;
  typingIndicator: boolean;
  readReceipts: boolean;
}

export interface AppearancePreferences {
  theme: 'system' | 'light' | 'dark';
  compactMode: boolean;
  reducedMotion: boolean;
  textSize: 'small' | 'default' | 'large';
  language: 'en' | 'fil';
}

export interface DiscoveryPreferences {
  radius: 'barangay' | '5km' | '10km' | 'municipality' | 'whole_municipality';
  defaultCategory: string;
  defaultFeed: 'nearby' | 'all';
  showCompletedListings: boolean;
  showUnavailableItems: boolean;
}

export interface BlockedUser {
  userId: string;
  fullName: string;
  username: string;
  avatar: string;
  blockedAt: string;
}

export interface UserSession {
  id: string;
  device: string;
  browser: string;
  os: string;
  isCurrent: boolean;
  lastActive: string;
  location?: string;
}

// ── Defaults ─────────────────────────────────────────────────

const defaultNotificationPrefs: NotificationPreferences = {
  messages: true,
  replies: true,
  messageReactions: true,
  donationRequests: true,
  exchangeOffers: true,
  requestStatusUpdates: true,
  ratingsAndReviews: true,
  moderationUpdates: true,
  accountUpdates: true,
  urgentCommunityAlerts: true,
  emailMessages: true,
  emailDonationUpdates: true,
  emailExchangeUpdates: true,
  emailAccountSecurity: true,
  frequency: 'realtime',
};

const defaultPrivacyPrefs: PrivacyPreferences = {
  phoneVisibility: 'accepted_partners',
  showActiveStatus: true,
  showReadReceipts: true,
  showApproximateLocationOnly: false,
  newLoginAlerts: true,
};

const defaultMessagingPrefs: MessagingPreferences = {
  allowFromVerifiedNeighbors: true,
  allowFromActiveExchangePartners: true,
  messageSound: true,
  typingIndicator: true,
  readReceipts: true,
};

const defaultAppearancePrefs: AppearancePreferences = {
  theme: 'system',
  compactMode: false,
  reducedMotion: false,
  textSize: 'default',
  language: 'en',
};

const defaultDiscoveryPrefs: DiscoveryPreferences = {
  radius: 'municipality',
  defaultCategory: 'all',
  defaultFeed: 'nearby',
  showCompletedListings: false,
  showUnavailableItems: false,
};

const defaultSessions: UserSession[] = [
  {
    id: 'session-current',
    device: 'Desktop',
    browser: 'Chrome',
    os: 'Windows',
    isCurrent: true,
    lastActive: new Date().toISOString(),
    location: 'San Fernando, La Union',
  },
];

// ── Store Interface ───────────────────────────────────────────

interface SettingsState {
  notifications: NotificationPreferences;
  privacy: PrivacyPreferences;
  messaging: MessagingPreferences;
  appearance: AppearancePreferences;
  discovery: DiscoveryPreferences;
  blockedUsers: BlockedUser[];
  sessions: UserSession[];

  updateNotifications: (updates: Partial<NotificationPreferences>) => void;
  updatePrivacy: (updates: Partial<PrivacyPreferences>) => void;
  updateMessaging: (updates: Partial<MessagingPreferences>) => void;
  updateAppearance: (updates: Partial<AppearancePreferences>) => void;
  updateDiscovery: (updates: Partial<DiscoveryPreferences>) => void;
  blockUser: (user: BlockedUser) => void;
  unblockUser: (userId: string) => void;
  revokeSession: (sessionId: string) => void;
  revokeAllOtherSessions: () => void;
  resetAllSettings: () => void;
}

// ── Store ─────────────────────────────────────────────────────

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      notifications: defaultNotificationPrefs,
      privacy: defaultPrivacyPrefs,
      messaging: defaultMessagingPrefs,
      appearance: defaultAppearancePrefs,
      discovery: defaultDiscoveryPrefs,
      blockedUsers: [],
      sessions: defaultSessions,

      updateNotifications: (updates) =>
        set((state) => ({
          notifications: { ...state.notifications, ...updates },
        })),

      updatePrivacy: (updates) =>
        set((state) => ({
          privacy: { ...state.privacy, ...updates },
        })),

      updateMessaging: (updates) =>
        set((state) => ({
          messaging: { ...state.messaging, ...updates },
        })),

      updateAppearance: (updates) =>
        set((state) => ({
          appearance: { ...state.appearance, ...updates },
        })),

      updateDiscovery: (updates) =>
        set((state) => ({
          discovery: { ...state.discovery, ...updates },
        })),

      blockUser: (user) => {
        const { blockedUsers } = get();
        if (blockedUsers.some((b) => b.userId === user.userId)) return;
        set({ blockedUsers: [...blockedUsers, user] });
      },

      unblockUser: (userId) => {
        set((state) => ({
          blockedUsers: state.blockedUsers.filter((b) => b.userId !== userId),
        }));
      },

      revokeSession: (sessionId) => {
        set((state) => ({
          sessions: state.sessions.filter((s) => s.id !== sessionId),
        }));
      },

      revokeAllOtherSessions: () => {
        set((state) => ({
          sessions: state.sessions.filter((s) => s.isCurrent),
        }));
      },

      resetAllSettings: () => {
        set({
          notifications: defaultNotificationPrefs,
          privacy: defaultPrivacyPrefs,
          messaging: defaultMessagingPrefs,
          appearance: defaultAppearancePrefs,
          discovery: defaultDiscoveryPrefs,
          blockedUsers: [],
          sessions: defaultSessions,
        });
      },
    }),
    {
      name: 'bayanihan-settings',
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
