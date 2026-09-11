// ============================================================
// DataPrivacySection — Download Data, Privacy Policy, Blocked Users
// ============================================================

import React, { useState } from 'react';
import { Database, FileText, UserX, Download, ExternalLink, Trash2, Check } from 'lucide-react';
import SettingsSection, { SettingsDivider } from './SettingsSection';
import Button from '@/components/ui/Button';
import Avatar from '@/components/ui/Avatar';
import Modal from '@/components/ui/Modal';
import { useSettingsStore } from '@/stores/settingsStore';
import { useAuthStore } from '@/stores/authStore';
import toast from 'react-hot-toast';

// ── Blocked Users List ────────────────────────────────────────

function BlockedUsersManager() {
  const { blockedUsers, unblockUser } = useSettingsStore();
  const [confirmUnblock, setConfirmUnblock] = useState<string | null>(null);

  if (blockedUsers.length === 0) {
    return (
      <div className="text-center py-6 text-neutral-400">
        <UserX className="w-8 h-8 mx-auto mb-2 opacity-40" />
        <p className="text-sm">You have not blocked any users.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {blockedUsers.map((blocked) => (
        <div
          key={blocked.userId}
          className="flex items-center justify-between gap-3 p-3 rounded-lg border border-neutral-200 bg-neutral-50"
        >
          <div className="flex items-center gap-2.5">
            <Avatar src={blocked.avatar} name={blocked.fullName} size="sm" />
            <div>
              <p className="text-sm font-medium text-neutral-800">{blocked.fullName}</p>
              <p className="text-xs text-neutral-400">@{blocked.username}</p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setConfirmUnblock(blocked.userId)}
            className="text-red-600 border-red-200 hover:bg-red-50 flex-shrink-0"
          >
            Unblock
          </Button>
        </div>
      ))}

      {/* Confirm Unblock Dialog */}
      <Modal
        isOpen={!!confirmUnblock}
        onClose={() => setConfirmUnblock(null)}
        title="Unblock User?"
        size="sm"
      >
        <p className="text-sm text-neutral-600 mb-4">
          This user will be able to message you and interact with your posts again.
        </p>
        <div className="flex justify-end gap-2">
          <Button variant="ghost" size="sm" onClick={() => setConfirmUnblock(null)}>
            Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              if (confirmUnblock) {
                unblockUser(confirmUnblock);
                toast.success('User unblocked.');
              }
              setConfirmUnblock(null);
            }}
          >
            Unblock
          </Button>
        </div>
      </Modal>
    </div>
  );
}

// ── Main Export ───────────────────────────────────────────────

export default function DataPrivacySection() {
  const { user } = useAuthStore();
  const [dataRequested, setDataRequested] = useState(false);
  const [isRequesting, setIsRequesting] = useState(false);

  const handleDataRequest = async () => {
    setIsRequesting(true);
    await new Promise((r) => setTimeout(r, 800));
    setDataRequested(true);
    setIsRequesting(false);
    toast.success('Data export request submitted. You will be notified when it is ready.');
  };

  return (
    <SettingsSection
      id="data-privacy"
      icon={<Database className="w-4 h-4" />}
      title="Data & Privacy"
      description="Manage your data, privacy settings, and user block list."
    >
      {/* Download My Data */}
      <div className="py-2">
        <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-2">
          Your Data
        </p>
        <div className="p-3 rounded-lg bg-neutral-50 border border-neutral-200">
          <p className="text-sm font-medium text-neutral-800 mb-1">Request My Data</p>
          <p className="text-xs text-neutral-500 mb-3">
            Download a copy of your BayanihanHub account data. This includes your profile information, listings, and activity history. Passwords, tokens, and private keys are never included.
          </p>
          {dataRequested ? (
            <div className="flex items-center gap-2 text-green-700">
              <Check className="w-4 h-4" />
              <span className="text-sm font-medium">Request submitted — you'll be notified when ready.</span>
            </div>
          ) : (
            <Button
              variant="outline"
              size="sm"
              isLoading={isRequesting}
              onClick={handleDataRequest}
              leftIcon={<Download className="w-4 h-4" />}
            >
              Request My Data
            </Button>
          )}
        </div>
      </div>

      <SettingsDivider />

      {/* Privacy Policy & Community Guidelines */}
      <div className="py-2">
        <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-2">
          Legal & Guidelines
        </p>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => toast('Privacy Policy document coming soon.', { icon: '📄' })}
            leftIcon={<FileText className="w-4 h-4" />}
            rightIcon={<ExternalLink className="w-3 h-3 opacity-50" />}
          >
            Privacy Policy
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => toast('Community Guidelines document coming soon.', { icon: '📋' })}
            leftIcon={<FileText className="w-4 h-4" />}
            rightIcon={<ExternalLink className="w-3 h-3 opacity-50" />}
          >
            Community Guidelines
          </Button>
        </div>
        <p className="text-xs text-neutral-400 mt-2">
          BayanihanHub complies with the Philippine Data Privacy Act of 2012 (RA 10173).
        </p>
      </div>

      <SettingsDivider />

      {/* Blocked Users */}
      <div className="py-2">
        <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-3">
          Blocked Users
        </p>
        <BlockedUsersManager />
      </div>
    </SettingsSection>
  );
}
