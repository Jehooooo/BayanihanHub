// ============================================================
// report.service.ts — User-facing report submission
// ============================================================

import type { ReportTargetType, ReportReason } from '@/types';

export interface SubmitReportPayload {
  targetType: ReportTargetType;
  targetId: string;
  reason: ReportReason;
  description?: string;
  reporterId?: string;
}

// Duplicate prevention: track recently submitted (targetId+reason) with 60s TTL
const recentlySubmitted = new Map<string, number>();
const DUPE_TTL_MS = 60_000;

function isDuplicate(targetId: string, reason: string): boolean {
  const key = `${targetId}::${reason}`;
  const ts = recentlySubmitted.get(key);
  if (ts && Date.now() - ts < DUPE_TTL_MS) return true;
  return false;
}

function markSubmitted(targetId: string, reason: string): void {
  const key = `${targetId}::${reason}`;
  recentlySubmitted.set(key, Date.now());
}

export const reportService = {
  async submitReport(
    payload: SubmitReportPayload
  ): Promise<{ success: boolean; reportId?: string; message: string }> {
    // Duplicate check
    if (isDuplicate(payload.targetId, payload.reason)) {
      throw new Error(
        'You already submitted a similar report for this content. Please allow some time before submitting again.'
      );
    }

    const res = await fetch('/api/reports', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        target_type: payload.targetType,
        target_id: payload.targetId,
        reason: payload.reason,
        description: payload.description?.trim() || null,
        reporter_id: payload.reporterId,
      }),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      throw new Error(
        data.detail || data.message || `Failed to submit report (${res.status})`
      );
    }

    markSubmitted(payload.targetId, payload.reason);

    return {
      success: true,
      reportId: data.report_id || data.id,
      message: data.message || 'Report submitted successfully.',
    };
  },
};
