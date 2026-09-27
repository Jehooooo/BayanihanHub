// ============================================================
// AccountSecuritySection — Email, Password, Sessions, 2FA, Verification
// ============================================================

import React, { useState } from 'react';
import {
  Lock, Mail, Shield, CheckCircle, Clock, XCircle, Monitor,
  LogOut, Smartphone, KeyRound, AlertTriangle
} from 'lucide-react';
import SettingsSection, { SettingsDivider } from './SettingsSection';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';
import { useAuthStore } from '@/stores/authStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { getAuthHeaders } from '@/services/authHeader';
import toast from 'react-hot-toast';

// ── Verification Status Card ──────────────────────────────────

function VerificationStatusCard() {
  const { user } = useAuthStore();

  const verificationStatus = user?.verificationStatus;
  const isVerified = verificationStatus === 'VERIFIED' || verificationStatus === 'APPROVED';
  const isPending = verificationStatus === 'PENDING';

  let statusBadge;
  if (isVerified) {
    statusBadge = (
      <div className="flex items-center gap-2 text-green-700">
        <CheckCircle className="w-5 h-5 flex-shrink-0" />
        <div>
          <p className="text-sm font-semibold">Identity Verified</p>
          <p className="text-xs text-green-600">Your identity has been confirmed by BayanihanHub.</p>
        </div>
      </div>
    );
  } else if (isPending) {
    statusBadge = (
      <div className="flex items-center gap-2 text-amber-700">
        <Clock className="w-5 h-5 flex-shrink-0" />
        <div>
          <p className="text-sm font-semibold">Verification Pending</p>
          <p className="text-xs text-amber-600">Your verification is currently being reviewed by our team.</p>
        </div>
      </div>
    );
  } else {
    statusBadge = (
      <div className="flex items-center gap-2 text-neutral-600">
        <XCircle className="w-5 h-5 flex-shrink-0" />
        <div>
          <p className="text-sm font-semibold">Not Verified</p>
          <p className="text-xs text-neutral-500">Complete identity verification to unlock trusted member features.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-3 rounded-lg bg-neutral-50 border border-neutral-200">
      {statusBadge}
      {!isVerified && !isPending && (
        <div className="mt-3">
          <Button variant="primary" size="sm" onClick={() => toast('Identity verification will open a secure verification flow. Feature available in the full release.', { icon: '🔐' })}>
            Start Verification
          </Button>
        </div>
      )}
    </div>
  );
}

// ── Change Password Form ──────────────────────────────────────

function ChangePasswordForm() {
  const [form, setForm] = useState({ current: '', newPass: '', confirm: '' });
  const [isSaving, setIsSaving] = useState(false);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [successBanner, setSuccessBanner] = useState<string | null>(null);
  const { updateProfile } = useAuthStore();

  const validate = () => {
    if (!form.current) return 'Current password is required.';
    if (form.newPass.length < 8) return 'New password must be at least 8 characters.';
    if (!/[A-Za-z]/.test(form.newPass)) return 'Password must include at least one letter.';
    if (!/[0-9!@#$%^&*(),.?":{}|<>]/.test(form.newPass)) return 'Password must include at least one number or special character.';
    if (form.newPass !== form.confirm) return 'New passwords do not match.';
    if (form.current === form.newPass) return 'New password cannot be the same as your current password.';
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSaving) return; // Prevent duplicate submissions

    const err = validate();
    if (err) {
      toast.error(err);
      return;
    }

    setIsSaving(true);
    setSuccessBanner(null);

    try {
      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
        credentials: 'include',
        body: JSON.stringify({
          currentPassword: form.current,
          newPassword: form.newPass,
          confirmPassword: form.confirm,
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        let errorMsg = 'Unable to update password. Please check your credentials and try again.';
        if (data.detail) {
          if (typeof data.detail === 'string') {
            errorMsg = data.detail;
          } else if (data.detail.message) {
            errorMsg = data.detail.message;
          }
        } else if (data.message) {
          errorMsg = data.message;
        }
        toast.error(errorMsg);
        return;
      }

      // Password changed successfully
      const successMsg = data.message || 'Password changed successfully.';
      toast.success(successMsg);
      setSuccessBanner('✓ Password changed successfully. A security confirmation email has been sent to your email address.');
      setForm({ current: '', newPass: '', confirm: '' });

      if (data.token) {
        updateProfile({ token: data.token });
      }

      setShowLogoutDialog(true);
    } catch (networkErr) {
      console.error('[ChangePassword] Error:', networkErr);
      toast.error('Unable to connect to server. Please check your connection and try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-3">
        {successBanner && (
          <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs font-semibold">
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successBanner}</span>
          </div>
        )}

        <Input
          label="Current Password"
          type="password"
          placeholder="••••••••"
          value={form.current}
          onChange={(e) => {
            setForm({ ...form, current: e.target.value });
            if (successBanner) setSuccessBanner(null);
          }}
          autoComplete="current-password"
          disabled={isSaving}
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="New Password"
            type="password"
            placeholder="••••••••"
            value={form.newPass}
            onChange={(e) => {
              setForm({ ...form, newPass: e.target.value });
              if (successBanner) setSuccessBanner(null);
            }}
            autoComplete="new-password"
            helperText="Min 8 chars, 1 letter, 1 number or special character."
            disabled={isSaving}
          />
          <Input
            label="Confirm New Password"
            type="password"
            placeholder="••••••••"
            value={form.confirm}
            onChange={(e) => {
              setForm({ ...form, confirm: e.target.value });
              if (successBanner) setSuccessBanner(null);
            }}
            autoComplete="new-password"
            disabled={isSaving}
          />
        </div>
        <div className="flex justify-end pt-1">
          <Button
            type="submit"
            variant="primary"
            size="sm"
            isLoading={isSaving}
            loadingText="Changing Password..."
            disabled={isSaving}
            leftIcon={<KeyRound className="w-4 h-4" />}
          >
            Change Password
          </Button>
        </div>
      </form>

      {/* Post-password-change: Logout other sessions */}
      <Modal
        isOpen={showLogoutDialog}
        onClose={() => setShowLogoutDialog(false)}
        title="Log Out Other Sessions?"
        size="sm"
      >
        <p className="text-sm text-neutral-600 mb-4">
          Your password was changed successfully. Would you like to log out all other active sessions for extra security?
        </p>
        <div className="flex justify-end gap-2">
          <Button variant="ghost" size="sm" onClick={() => setShowLogoutDialog(false)}>
            Keep Sessions
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={() => {
              useSettingsStore.getState().revokeAllOtherSessions();
              toast.success('All other sessions have been logged out.');
              setShowLogoutDialog(false);
            }}
          >
            Log Out Other Sessions
          </Button>
        </div>
      </Modal>
    </>
  );
}

// ── Active Sessions ───────────────────────────────────────────

function ActiveSessionsCard() {
  const { sessions, revokeSession, revokeAllOtherSessions } = useSettingsStore();

  const getDeviceIcon = (device: string) => {
    if (device.toLowerCase().includes('android') || device.toLowerCase().includes('mobile') || device.toLowerCase().includes('smartphone')) {
      return <Smartphone className="w-4 h-4 text-neutral-500" />;
    }
    return <Monitor className="w-4 h-4 text-neutral-500" />;
  };

  const otherSessions = sessions.filter((s) => !s.isCurrent);

  return (
    <div className="space-y-2">
      {sessions.map((session) => (
        <div
          key={session.id}
          className={`flex items-start justify-between gap-3 p-3 rounded-lg border ${
            session.isCurrent
              ? 'border-primary-200 bg-primary-50/40'
              : 'border-neutral-200 bg-white'
          }`}
        >
          <div className="flex items-start gap-2.5">
            {getDeviceIcon(session.device)}
            <div>
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium text-neutral-800">
                  {session.device} • {session.browser}
                </p>
                {session.isCurrent && (
                  <Badge variant="success" size="sm">Current</Badge>
                )}
              </div>
              <p className="text-xs text-neutral-500 mt-0.5">
                {session.os}{session.location ? ` • ${session.location}` : ''}
              </p>
              <p className="text-xs text-neutral-400 mt-0.5">
                Last active: {session.isCurrent ? 'Now' : new Date(session.lastActive).toLocaleString('en-PH', { dateStyle: 'medium', timeStyle: 'short' })}
              </p>
            </div>
          </div>
          {!session.isCurrent && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                revokeSession(session.id);
                toast.success('Session revoked.');
              }}
              className="text-red-600 hover:text-red-700 hover:bg-red-50 flex-shrink-0"
              leftIcon={<LogOut className="w-3.5 h-3.5" />}
            >
              Log Out
            </Button>
          )}
        </div>
      ))}

      {otherSessions.length > 0 && (
        <div className="flex justify-end pt-1">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              revokeAllOtherSessions();
              toast.success('All other sessions have been logged out.');
            }}
            leftIcon={<LogOut className="w-3.5 h-3.5" />}
            className="text-red-600 border-red-200 hover:bg-red-50"
          >
            Log Out All Other Sessions
          </Button>
        </div>
      )}

      {sessions.length === 1 && (
        <p className="text-xs text-neutral-400 text-center py-2">
          No other active sessions found.
        </p>
      )}
    </div>
  );
}

// ── Main Export ───────────────────────────────────────────────

export default function AccountSecuritySection() {
  const { user } = useAuthStore();

  return (
    <SettingsSection
      id="account-security"
      icon={<Lock className="w-4 h-4" />}
      title="Account & Security"
      description="Manage your email, password, active sessions, and account security."
    >
      {/* Identity Verification */}
      <div className="py-1">
        <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-2">
          Identity Verification
        </p>
        <VerificationStatusCard />
      </div>

      <SettingsDivider />

      {/* Email */}
      <div className="py-1">
        <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-2">
          Email Address
        </p>
        <div className="flex items-center justify-between gap-3 p-3 rounded-lg bg-neutral-50 border border-neutral-200">
          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4 text-neutral-400 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-neutral-800">{user?.email || 'Not set'}</p>
              <div className="flex items-center gap-1 mt-0.5">
                <CheckCircle className="w-3 h-3 text-green-500" />
                <span className="text-xs text-green-600">Verified</span>
              </div>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => toast('Email change requires re-verification. This feature will be available in the full release.', { icon: '📧' })}
          >
            Change Email
          </Button>
        </div>
      </div>

      <SettingsDivider />

      {/* Change Password */}
      <div className="py-1">
        <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-3">
          Change Password
        </p>
        <ChangePasswordForm />
      </div>

      <SettingsDivider />

      {/* Active Sessions */}
      <div className="py-1">
        <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-3">
          Active Sessions
        </p>
        <ActiveSessionsCard />
      </div>

      <SettingsDivider />

      {/* 2FA — Coming Soon */}
      <div className="py-2">
        <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-2">
          Two-Factor Authentication
        </p>
        <div className="flex items-start justify-between gap-3 p-3 rounded-lg bg-neutral-50 border border-neutral-200 border-dashed">
          <div className="flex items-start gap-2.5">
            <Shield className="w-4 h-4 text-neutral-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-neutral-700">Two-Factor Authentication</p>
              <p className="text-xs text-neutral-500 mt-0.5">
                Add an extra layer of security to your account. Coming in a future update.
              </p>
            </div>
          </div>
          <Badge variant="default" size="sm">Coming Soon</Badge>
        </div>
      </div>
    </SettingsSection>
  );
}
