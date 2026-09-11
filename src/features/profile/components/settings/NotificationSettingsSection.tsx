// ============================================================
// NotificationSettingsSection — In-App + Email + Frequency
// ============================================================

import React from 'react';
import { Bell } from 'lucide-react';
import SettingsSection, { SettingsDivider, SettingsRow } from './SettingsSection';
import SettingsToggle from './SettingsToggle';
import { useSettingsStore } from '@/stores/settingsStore';
import type { NotificationPreferences } from '@/stores/settingsStore';
import toast from 'react-hot-toast';

type NotifKey = keyof NotificationPreferences;

interface ToggleDef {
  key: NotifKey;
  label: string;
  description?: string;
  locked?: boolean;
}

const IN_APP_TOGGLES: ToggleDef[] = [
  { key: 'messages', label: 'Messages', description: 'Notify when you receive a new message.' },
  { key: 'replies', label: 'Replies', description: 'When someone replies to your post or message.' },
  { key: 'messageReactions', label: 'Message Reactions', description: 'When someone reacts to your message.' },
  { key: 'donationRequests', label: 'Donation Requests', description: 'New requests on your donated items.' },
  { key: 'exchangeOffers', label: 'Exchange Offers', description: 'New exchange proposals on your listings.' },
  { key: 'requestStatusUpdates', label: 'Request Status Updates', description: 'When your request status changes.' },
  { key: 'ratingsAndReviews', label: 'Ratings & Reviews', description: 'When you receive a new community rating.' },
  { key: 'moderationUpdates', label: 'Reports / Moderation Updates', description: 'Admin actions related to your posts or account.' },
  { key: 'accountUpdates', label: 'Account Updates', description: 'Changes to your account or verification status.', locked: true },
  { key: 'urgentCommunityAlerts', label: 'Urgent Community Aid Alerts', description: 'Critical help requests within your discovery area.' },
];

const EMAIL_TOGGLES: ToggleDef[] = [
  { key: 'emailMessages', label: 'Message Notifications', description: 'Email when you receive messages.' },
  { key: 'emailDonationUpdates', label: 'Donation / Request Updates', description: 'Email for donation and request activity.' },
  { key: 'emailExchangeUpdates', label: 'Exchange Updates', description: 'Email for exchange offers and completions.' },
  { key: 'emailAccountSecurity', label: 'Account & Security Alerts', description: 'Login alerts and account security notices.', locked: true },
];

const FREQUENCY_OPTIONS = [
  { value: 'realtime', label: 'Real-time', description: 'Receive notifications as they happen.' },
  { value: 'daily_summary', label: 'Daily Summary', description: 'Get a once-daily digest of your notifications.' },
  { value: 'important_only', label: 'Important Only', description: 'Only urgent and security-related notifications.' },
] as const;

export default function NotificationSettingsSection() {
  const { notifications, updateNotifications } = useSettingsStore();

  const handleToggle = (key: NotifKey, value: boolean) => {
    updateNotifications({ [key]: value } as any);
    toast.success('Notification preference saved.');
  };

  return (
    <SettingsSection
      id="notifications"
      icon={<Bell className="w-4 h-4" />}
      title="Notification Preferences"
      description="Control which notifications you receive in-app and by email."
    >
      {/* In-App */}
      <div className="py-1">
        <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-1">
          In-App Notifications
        </p>
        {IN_APP_TOGGLES.map((t) => (
          <SettingsToggle
            key={t.key}
            id={`notif-${t.key}`}
            label={t.label}
            description={t.description}
            checked={notifications[t.key] as boolean}
            onChange={(v) => handleToggle(t.key, v)}
            locked={t.locked}
          />
        ))}
      </div>

      <SettingsDivider />

      {/* Email */}
      <div className="py-1">
        <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-1">
          Email Notifications
        </p>
        {EMAIL_TOGGLES.map((t) => (
          <SettingsToggle
            key={t.key}
            id={`email-${t.key}`}
            label={t.label}
            description={t.description}
            checked={notifications[t.key] as boolean}
            onChange={(v) => handleToggle(t.key, v)}
            locked={t.locked}
          />
        ))}
      </div>

      <SettingsDivider />

      {/* Frequency */}
      <div className="py-2">
        <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-3">
          Notification Frequency
        </p>
        <div className="space-y-2">
          {FREQUENCY_OPTIONS.map((opt) => (
            <label
              key={opt.value}
              className={`
                flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all
                ${notifications.frequency === opt.value
                  ? 'border-primary-400 bg-primary-50 ring-1 ring-primary-300'
                  : 'border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50'
                }
              `}
            >
              <input
                type="radio"
                name="notif-frequency"
                value={opt.value}
                checked={notifications.frequency === opt.value}
                onChange={() => {
                  updateNotifications({ frequency: opt.value });
                  toast.success('Notification frequency updated.');
                }}
                className="mt-0.5 accent-primary-600 flex-shrink-0"
              />
              <div>
                <span className="text-sm font-medium text-neutral-800">{opt.label}</span>
                <p className="text-xs text-neutral-500 mt-0.5">{opt.description}</p>
              </div>
            </label>
          ))}
        </div>
      </div>
    </SettingsSection>
  );
}
