// ============================================================
// MessagingSection — Messaging Preferences
// ============================================================

import React from 'react';
import { MessageSquare } from 'lucide-react';
import SettingsSection, { SettingsDivider } from './SettingsSection';
import SettingsToggle from './SettingsToggle';
import { useSettingsStore } from '@/stores/settingsStore';
import type { MessagingPreferences } from '@/stores/settingsStore';
import toast from 'react-hot-toast';

export default function MessagingSection() {
  const { messaging, updateMessaging } = useSettingsStore();

  const handleToggle = (key: keyof MessagingPreferences, value: boolean) => {
    updateMessaging({ [key]: value } as any);
    toast.success('Messaging preference saved.');
  };

  return (
    <SettingsSection
      id="messaging"
      icon={<MessageSquare className="w-4 h-4" />}
      title="Messaging & Activity"
      description="Control who can message you and how your messaging experience works."
    >
      <SettingsToggle
        id="msg-verified-neighbors"
        label="Allow Messages from Verified Neighbors"
        description="Verified community members can initiate a conversation with you."
        checked={messaging.allowFromVerifiedNeighbors}
        onChange={(v) => handleToggle('allowFromVerifiedNeighbors', v)}
      />

      <SettingsDivider />

      <SettingsToggle
        id="msg-active-partners"
        label="Allow Messages from Active Exchange / Request Partners"
        description="Users you have an ongoing exchange or request with can always message you."
        checked={messaging.allowFromActiveExchangePartners}
        onChange={(v) => handleToggle('allowFromActiveExchangePartners', v)}
        locked
      />

      <SettingsDivider />

      <SettingsToggle
        id="msg-sound"
        label="Message Sound"
        description="Play a sound when you receive a new message."
        checked={messaging.messageSound}
        onChange={(v) => handleToggle('messageSound', v)}
      />

      <SettingsDivider />

      <SettingsToggle
        id="msg-typing"
        label="Typing Indicator"
        description='Show a "typing..." indicator to others when you compose a message.'
        checked={messaging.typingIndicator}
        onChange={(v) => handleToggle('typingIndicator', v)}
      />

      <SettingsDivider />

      <SettingsToggle
        id="msg-receipts"
        label="Read Receipts"
        description="Let others see when you have read their messages."
        checked={messaging.readReceipts}
        onChange={(v) => handleToggle('readReceipts', v)}
      />
    </SettingsSection>
  );
}
