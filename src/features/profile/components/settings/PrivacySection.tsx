// ============================================================
// PrivacySection — Phone Visibility, Activity, Read Receipts, Location
// ============================================================

import React from 'react';
import { Eye, EyeOff, MapPin, Shield } from 'lucide-react';
import SettingsSection, { SettingsDivider, SettingsRow } from './SettingsSection';
import SettingsToggle from './SettingsToggle';
import { useSettingsStore } from '@/stores/settingsStore';
import type { PrivacyPreferences } from '@/stores/settingsStore';
import toast from 'react-hot-toast';

const PHONE_VISIBILITY_OPTIONS = [
  {
    value: 'hidden',
    label: 'Hidden',
    description: 'No one can see your phone number.',
  },
  {
    value: 'verified_neighbors',
    label: 'Verified Neighbors Only',
    description: 'Visible only to community-verified members.',
  },
  {
    value: 'accepted_partners',
    label: 'Accepted Exchange / Request Partners Only',
    description: 'Visible only to people you have an active exchange or request with.',
  },
] as const;

export default function PrivacySection() {
  const { privacy, updatePrivacy } = useSettingsStore();

  const handleToggle = (key: keyof PrivacyPreferences, value: boolean) => {
    updatePrivacy({ [key]: value } as any);
    toast.success('Privacy setting saved.');
  };

  return (
    <SettingsSection
      id="privacy"
      icon={<Shield className="w-4 h-4" />}
      title="Privacy & Neighbor Trust"
      description="Control who can see your personal information and activity."
    >
      {/* Phone Number Visibility */}
      <div className="py-2">
        <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-1">
          Phone Number Visibility
        </p>
        <p className="text-xs text-neutral-500 mb-3">
          Control who can see your phone number. This is enforced by the platform — not just hidden visually.
        </p>
        <div className="space-y-2">
          {PHONE_VISIBILITY_OPTIONS.map((opt) => (
            <label
              key={opt.value}
              className={`
                flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all
                ${privacy.phoneVisibility === opt.value
                  ? 'border-primary-400 bg-primary-50 ring-1 ring-primary-300'
                  : 'border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50'
                }
              `}
            >
              <input
                type="radio"
                name="phone-visibility"
                value={opt.value}
                checked={privacy.phoneVisibility === opt.value}
                onChange={() => {
                  updatePrivacy({ phoneVisibility: opt.value });
                  toast.success('Phone visibility updated.');
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

      <SettingsDivider />

      {/* Online / Activity Status */}
      <SettingsToggle
        id="show-active-status"
        label="Show Active Status"
        description='Allow other community members to see "Active Now" or your last active time.'
        checked={privacy.showActiveStatus}
        onChange={(v) => handleToggle('showActiveStatus', v)}
      />

      <SettingsDivider />

      {/* Read Receipts */}
      <SettingsToggle
        id="show-read-receipts"
        label="Show Read Receipts"
        description="Let other users see when you've read their messages."
        checked={privacy.showReadReceipts}
        onChange={(v) => handleToggle('showReadReceipts', v)}
      />

      <SettingsDivider />

      {/* Approximate Location */}
      <div>
        <SettingsToggle
          id="approx-location"
          label="Show Approximate Location Only"
          description='Instead of your exact address, show only your Barangay and Municipality on public listings (e.g. "Brgy. San Antonio, San Fernando").'
          checked={privacy.showApproximateLocationOnly}
          onChange={(v) => handleToggle('showApproximateLocationOnly', v)}
        />
        {privacy.showApproximateLocationOnly && (
          <div className="ml-0 mt-1 flex items-center gap-2 p-2.5 rounded-lg bg-amber-50 border border-amber-200">
            <MapPin className="w-4 h-4 text-amber-600 flex-shrink-0" />
            <p className="text-xs text-amber-700">
              Exact address will not appear on public listings. Only Barangay and Municipality will be shown.
            </p>
          </div>
        )}
      </div>

      <SettingsDivider />

      {/* New Login Alerts */}
      <SettingsToggle
        id="login-alerts"
        label="New Login Alerts"
        description="Receive a notification when a new device or session logs into your account."
        checked={privacy.newLoginAlerts}
        onChange={(v) => handleToggle('newLoginAlerts', v)}
        locked
      />
    </SettingsSection>
  );
}
