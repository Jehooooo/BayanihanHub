// ============================================================
// DangerZoneSection — Account Deactivation + Deletion
// ============================================================

import React, { useState } from 'react';
import { AlertTriangle, Trash2, PauseCircle } from 'lucide-react';
import SettingsSection, { SettingsDivider } from './SettingsSection';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import { useAuthStore } from '@/stores/authStore';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

export default function DangerZoneSection() {
  const { logout } = useAuthStore();
  const navigate = useNavigate();

  const [showDeactivateModal, setShowDeactivateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // ── Deactivation ─────────────────────────────────────────────

  const handleDeactivate = async () => {
    setIsProcessing(true);
    try {
      await new Promise((r) => setTimeout(r, 600));
      toast.success('Your account has been temporarily deactivated. You have been logged out.');
      logout();
      navigate('/');
    } catch {
      toast.error('Unable to deactivate account. Please try again.');
    } finally {
      setIsProcessing(false);
      setShowDeactivateModal(false);
    }
  };

  // ── Deletion ──────────────────────────────────────────────────

  const handleDelete = async () => {
    if (deleteConfirmText !== 'DELETE') {
      toast.error('Please type DELETE to confirm.');
      return;
    }
    setIsProcessing(true);
    try {
      await new Promise((r) => setTimeout(r, 800));
      toast.success('Your account deletion request has been submitted. You will receive a confirmation email.');
      logout();
      navigate('/');
    } catch {
      toast.error('Unable to process deletion request. Please try again.');
    } finally {
      setIsProcessing(false);
      setShowDeleteModal(false);
    }
  };

  return (
    <>
      <SettingsSection
        id="danger-zone"
        icon={<AlertTriangle className="w-4 h-4" />}
        title="Danger Zone"
        description="Irreversible account actions. Please read carefully before proceeding."
        danger
      >
        {/* Temporarily Deactivate */}
        <div className="py-2">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <PauseCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                <p className="text-sm font-semibold text-neutral-800">Temporarily Deactivate Account</p>
              </div>
              <p className="text-xs text-neutral-500">
                Your account will be temporarily inactive. Your data will be retained, but your public activity may be hidden according to platform rules. You can reactivate by logging back in.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowDeactivateModal(true)}
              className="text-amber-700 border-amber-300 hover:bg-amber-50 flex-shrink-0"
              leftIcon={<PauseCircle className="w-4 h-4" />}
            >
              Deactivate Account
            </Button>
          </div>
        </div>

        <SettingsDivider />

        {/* Delete Account */}
        <div className="py-2">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <Trash2 className="w-4 h-4 text-red-600 flex-shrink-0" />
                <p className="text-sm font-semibold text-neutral-800">Delete Account</p>
              </div>
              <p className="text-xs text-neutral-500">
                This action may permanently remove your account and associated data according to BayanihanHub's data retention policy. This action cannot be easily undone.
              </p>
            </div>
            <Button
              variant="danger"
              size="sm"
              onClick={() => setShowDeleteModal(true)}
              className="flex-shrink-0"
              leftIcon={<Trash2 className="w-4 h-4" />}
            >
              Delete Account
            </Button>
          </div>
        </div>
      </SettingsSection>

      {/* Deactivation Confirmation Modal */}
      <Modal
        isOpen={showDeactivateModal}
        onClose={() => setShowDeactivateModal(false)}
        title="Temporarily Deactivate Account?"
        size="sm"
      >
        <div className="space-y-3">
          <div className="flex items-start gap-2.5 p-3 rounded-lg bg-amber-50 border border-amber-200">
            <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-amber-800">
              Your account will be paused and hidden from the community. Your data will be retained. You can reactivate simply by logging back in.
            </p>
          </div>
          <p className="text-sm text-neutral-600">
            Are you sure you want to temporarily deactivate your account?
          </p>
        </div>
        <div className="flex justify-end gap-2 mt-4">
          <Button variant="ghost" size="sm" onClick={() => setShowDeactivateModal(false)}>
            Cancel
          </Button>
          <Button
            variant="outline"
            size="sm"
            isLoading={isProcessing}
            onClick={handleDeactivate}
            className="text-amber-700 border-amber-300 hover:bg-amber-50"
          >
            Yes, Deactivate
          </Button>
        </div>
      </Modal>

      {/* Deletion Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Account?"
        size="sm"
      >
        <div className="space-y-3">
          <div className="flex items-start gap-2.5 p-3 rounded-lg bg-red-50 border border-red-200">
            <Trash2 className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-800">
              This action may permanently remove your account and all associated data according to BayanihanHub's retention policy. Active exchanges and listings may be cancelled.
            </p>
          </div>
          <p className="text-sm text-neutral-600 font-medium">
            Type <span className="font-bold text-red-600">DELETE</span> to confirm:
          </p>
          <Input
            placeholder="Type DELETE to confirm"
            value={deleteConfirmText}
            onChange={(e) => setDeleteConfirmText(e.target.value)}
            autoFocus
          />
        </div>
        <div className="flex justify-end gap-2 mt-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setShowDeleteModal(false);
              setDeleteConfirmText('');
            }}
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            size="sm"
            isLoading={isProcessing}
            onClick={handleDelete}
            disabled={deleteConfirmText !== 'DELETE'}
          >
            Delete Account
          </Button>
        </div>
      </Modal>
    </>
  );
}
