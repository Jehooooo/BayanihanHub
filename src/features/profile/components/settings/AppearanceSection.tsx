// ============================================================
// AppearanceSection — Theme, Compact Mode, Accessibility, Language
// ============================================================

import React from 'react';
import { Palette, Monitor, Sun, Moon } from 'lucide-react';
import SettingsSection, { SettingsDivider, SettingsRow } from './SettingsSection';
import SettingsToggle from './SettingsToggle';
import { useSettingsStore } from '@/stores/settingsStore';
import type { AppearancePreferences } from '@/stores/settingsStore';
import toast from 'react-hot-toast';

const THEME_OPTIONS = [
  { value: 'system', label: 'System Default', icon: <Monitor className="w-4 h-4" />, description: 'Follows your device settings.' },
  { value: 'light', label: 'Light', icon: <Sun className="w-4 h-4" />, description: 'Always use light mode.' },
  { value: 'dark', label: 'Dark', icon: <Moon className="w-4 h-4" />, description: 'Always use dark mode.' },
] as const;

const TEXT_SIZE_OPTIONS = [
  { value: 'small', label: 'Small' },
  { value: 'default', label: 'Default' },
  { value: 'large', label: 'Large' },
] as const;

export default function AppearanceSection() {
  const { appearance, updateAppearance } = useSettingsStore();

  const handleToggle = (key: keyof AppearancePreferences, value: boolean) => {
    updateAppearance({ [key]: value } as any);
    toast.success('Appearance preference saved.');
  };

  return (
    <SettingsSection
      id="appearance"
      icon={<Palette className="w-4 h-4" />}
      title="Appearance & Accessibility"
      description="Customize the look, feel, and accessibility of BayanihanHub."
    >
      {/* Theme */}
      <div className="py-2">
        <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-3">
          Theme
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {THEME_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => {
                updateAppearance({ theme: opt.value });
                toast.success(`Theme set to ${opt.label}.`);
              }}
              className={`
                flex flex-col items-center gap-2 p-4 rounded-xl border-2 text-center transition-all
                ${appearance.theme === opt.value
                  ? 'border-primary-500 bg-primary-50 text-primary-700'
                  : 'border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50 text-neutral-600'
                }
              `}
            >
              <span className={appearance.theme === opt.value ? 'text-primary-600' : 'text-neutral-400'}>
                {opt.icon}
              </span>
              <div>
                <p className="text-sm font-semibold">{opt.label}</p>
                <p className="text-xs text-neutral-500 mt-0.5">{opt.description}</p>
              </div>
            </button>
          ))}
        </div>
        <p className="text-xs text-neutral-400 mt-2">
          Note: Full dark mode theming is available in the next release. Your preference is saved.
        </p>
      </div>

      <SettingsDivider />

      {/* Compact Mode */}
      <SettingsToggle
        id="compact-mode"
        label="Compact Layout"
        description="Reduce spacing in lists, cards, and notifications for a denser view."
        checked={appearance.compactMode}
        onChange={(v) => handleToggle('compactMode', v)}
      />

      <SettingsDivider />

      {/* Reduced Motion */}
      <SettingsToggle
        id="reduced-motion"
        label="Reduce Animations"
        description="Minimize transitions and animations. Recommended for motion sensitivity."
        checked={appearance.reducedMotion}
        onChange={(v) => handleToggle('reducedMotion', v)}
      />

      <SettingsDivider />

      {/* Text Size */}
      <div className="py-2">
        <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-3">
          Text Size
        </p>
        <div className="flex items-center gap-2 flex-wrap">
          {TEXT_SIZE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => {
                updateAppearance({ textSize: opt.value });
                toast.success(`Text size set to ${opt.label}.`);
              }}
              className={`
                px-4 py-2 rounded-lg border text-sm font-medium transition-all
                ${appearance.textSize === opt.value
                  ? 'border-primary-500 bg-primary-50 text-primary-700'
                  : 'border-neutral-200 hover:border-neutral-300 text-neutral-600'
                }
                ${opt.value === 'small' ? 'text-xs' : opt.value === 'large' ? 'text-base' : 'text-sm'}
              `}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <SettingsDivider />

      {/* Language */}
      <SettingsRow
        label="Language"
        description="Interface language. Additional languages will be added in future updates."
      >
        <select
          value={appearance.language}
          onChange={(e) => {
            updateAppearance({ language: e.target.value as 'en' | 'fil' });
            toast.success('Language preference saved.');
          }}
          className="text-sm rounded-lg border border-neutral-300 bg-white px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <option value="en">English</option>
          <option value="fil">Filipino (coming soon)</option>
        </select>
      </SettingsRow>
    </SettingsSection>
  );
}
