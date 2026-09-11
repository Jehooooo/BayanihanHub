// ============================================================
// ReportModal — Polymorphic report modal (Post / User / Request)
// ============================================================

import React, { useState, useEffect } from 'react';
import { Flag, CheckCircle, ShieldCheck, AlertTriangle } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import { reportService } from '@/services/report.service';
import { useAuthStore } from '@/stores/authStore';
import type { ReportTargetType, ReportReason } from '@/types';
import toast from 'react-hot-toast';

// ── Reason configs ────────────────────────────────────────────

interface ReasonOption {
  value: ReportReason;
  label: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

const ITEM_REASONS: ReasonOption[] = [
  { value: 'scam_fraud',          label: 'Scam or fraud',          severity: 'critical' },
  { value: 'prohibited_item',     label: 'Prohibited item',        severity: 'high' },
  { value: 'misleading_information', label: 'Misleading information', severity: 'medium' },
  { value: 'spam',                label: 'Spam',                   severity: 'low' },
  { value: 'inappropriate_content', label: 'Inappropriate content', severity: 'high' },
  { value: 'harassment',          label: 'Harassment',             severity: 'high' },
  { value: 'duplicate_post',      label: 'Duplicate post',         severity: 'low' },
  { value: 'wrong_category',      label: 'Wrong category',         severity: 'low' },
  { value: 'other',               label: 'Other',                  severity: 'medium' },
];

const USER_REASONS: ReasonOption[] = [
  { value: 'scam_fraud',           label: 'Scam or fraud',           severity: 'critical' },
  { value: 'harassment',           label: 'Harassment',              severity: 'high' },
  { value: 'fake_identity',        label: 'Fake identity',           severity: 'high' },
  { value: 'inappropriate_behavior', label: 'Inappropriate behavior', severity: 'medium' },
  { value: 'spam',                 label: 'Spam',                    severity: 'low' },
  { value: 'suspicious_activity',  label: 'Suspicious activity',     severity: 'medium' },
  { value: 'other',                label: 'Other',                   severity: 'medium' },
];

const REQUEST_REASONS: ReasonOption[] = [
  { value: 'scam_fraud',           label: 'Scam or fraud',         severity: 'critical' },
  { value: 'false_information',    label: 'False information',     severity: 'medium' },
  { value: 'spam',                 label: 'Spam',                  severity: 'low' },
  { value: 'inappropriate_request', label: 'Inappropriate request', severity: 'high' },
  { value: 'harassment',           label: 'Harassment',            severity: 'high' },
  { value: 'prohibited_request',   label: 'Prohibited request',    severity: 'high' },
  { value: 'other',                label: 'Other',                 severity: 'medium' },
];

function getReasonsForType(type: ReportTargetType): ReasonOption[] {
  if (type === 'user') return USER_REASONS;
  if (type === 'request') return REQUEST_REASONS;
  return ITEM_REASONS;
}

function getModalTitle(type: ReportTargetType): string {
  if (type === 'user') return 'Report User';
  if (type === 'request') return 'Report Request';
  return 'Report Post';
}

// ── Props ─────────────────────────────────────────────────────

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetType: ReportTargetType;
  targetId: string;
  /** Display name shown in the modal header */
  targetTitle?: string;
}

// ── Component ─────────────────────────────────────────────────

type ModalStep = 'form' | 'success';

export default function ReportModal({
  isOpen,
  onClose,
  targetType,
  targetId,
  targetTitle,
}: ReportModalProps) {
  const { user } = useAuthStore();
  const [step, setStep] = useState<ModalStep>('form');
  const [selectedReason, setSelectedReason] = useState<ReportReason | null>(null);
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const reasons = getReasonsForType(targetType);

  // Reset on open
  useEffect(() => {
    if (isOpen) {
      setStep('form');
      setSelectedReason(null);
      setDescription('');
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReason) {
      toast.error('Please select a reason for your report.');
      return;
    }
    if (!user) {
      toast.error('You must be logged in to submit a report.');
      return;
    }

    setIsSubmitting(true);
    try {
      await reportService.submitReport({
        targetType,
        targetId,
        reason: selectedReason,
        description: description.trim() || undefined,
        reporterId: user.id,
      });
      setStep('success');
    } catch (err: any) {
      toast.error(err.message || 'Failed to submit report. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    onClose();
    // Delay reset so animation doesn't flash
    setTimeout(() => {
      setStep('form');
      setSelectedReason(null);
      setDescription('');
    }, 300);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={!isSubmitting ? handleClose : () => {}}
      title={step === 'success' ? '' : getModalTitle(targetType)}
      size="sm"
      showClose={!isSubmitting}
    >
      {step === 'success' ? (
        // ── Success Screen ──────────────────────────────────────
        <div className="flex flex-col items-center gap-4 py-4 text-center">
          <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center">
            <CheckCircle className="w-7 h-7 text-green-600" />
          </div>
          <div>
            <p className="text-base font-bold text-neutral-900">Report Submitted</p>
            <p className="text-xs text-neutral-500 mt-1 max-w-xs">
              Your report has been received. Our administrators will review it impartially.
              We'll notify you when it has been reviewed.
            </p>
          </div>
          <div className="flex items-start gap-2 p-3 rounded-lg bg-blue-50 border border-blue-100 text-left w-full">
            <ShieldCheck className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-blue-700">
              <strong>Your identity is protected.</strong> The reported{' '}
              {targetType === 'user' ? 'user' : 'content owner'} will not be told who filed this
              report.
            </p>
          </div>
          <Button variant="primary" size="sm" fullWidth onClick={handleClose}>
            Done
          </Button>
        </div>
      ) : (
        // ── Report Form ─────────────────────────────────────────
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Target info */}
          {targetTitle && (
            <div className="flex items-start gap-2.5 p-2.5 rounded-lg bg-neutral-50 border border-neutral-200">
              <Flag className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
              <div className="min-w-0">
                <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wide">
                  You are reporting
                </p>
                <p className="text-sm font-bold text-neutral-800 truncate">{targetTitle}</p>
              </div>
            </div>
          )}

          {/* Reasons */}
          <div>
            <p className="text-xs font-semibold text-neutral-700 mb-2">
              Why are you reporting this?{' '}
              <span className="text-red-500">*</span>
            </p>
            <div className="space-y-1.5">
              {reasons.map((r) => (
                <label
                  key={r.value}
                  className={`flex items-center gap-3 p-2.5 rounded-lg border cursor-pointer transition-all ${
                    selectedReason === r.value
                      ? 'border-red-400 bg-red-50 ring-1 ring-red-300'
                      : 'border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="report-reason"
                    value={r.value}
                    checked={selectedReason === r.value}
                    onChange={() => setSelectedReason(r.value)}
                    className="accent-red-600 flex-shrink-0"
                  />
                  <span className="text-sm text-neutral-800">{r.label}</span>
                  {(r.severity === 'high' || r.severity === 'critical') && (
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-500 ml-auto flex-shrink-0" />
                  )}
                </label>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1">
              Additional Details{' '}
              <span className="text-neutral-400 font-normal">(optional)</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the issue in more detail..."
              rows={3}
              maxLength={500}
              className="w-full text-sm px-3 py-2 rounded-lg border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-red-400 resize-none"
              style={{ boxSizing: 'border-box' }}
            />
            <p className="text-right text-xs text-neutral-400 mt-0.5">
              {description.length}/500
            </p>
          </div>

          {/* Privacy note */}
          <div className="flex items-start gap-2 p-2.5 rounded-lg bg-neutral-50 border border-neutral-200 text-xs text-neutral-500">
            <ShieldCheck className="w-3.5 h-3.5 text-primary-600 flex-shrink-0 mt-0.5" />
            <span>Your identity will never be revealed to the reported party.</span>
          </div>

          {/* Buttons */}
          <div className="flex gap-2 pt-1">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              fullWidth
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="danger"
              size="sm"
              fullWidth
              isLoading={isSubmitting}
              disabled={!selectedReason || isSubmitting}
            >
              Submit Report
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
}
