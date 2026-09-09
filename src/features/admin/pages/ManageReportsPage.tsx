import AdminLayout from '@/components/layout/AdminLayout';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import SearchBar from '@/components/ui/SearchBar';
import Modal from '@/components/ui/Modal';
import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { getErrorMessage } from '@/utils/apiError';
import { adminService } from '@/services/admin.service';
import type { Report } from '@/types';
import {
  AlertOctagon,
  CheckCircle2,
  RefreshCw,
  ShieldCheck,
  ShieldAlert,
  Info,
} from 'lucide-react';

const RESOLUTION_ACTIONS = [
  'No violation found',
  'Warning issued',
  'Post removed',
  'Request removed',
  'User suspended',
  'User approved',
  'User rejected',
  'Other',
];

export default function ManageReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PENDING' | 'RESOLVED'>('ALL');

  // Modal state
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [isResolveModalOpen, setIsResolveModalOpen] = useState(false);
  const [selectedAction, setSelectedAction] = useState(RESOLUTION_ACTIONS[0]);
  const [adminMessage, setAdminMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchReports = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await adminService.getReports();
      setReports(data);
    } catch (err: any) {
      toast.error(getErrorMessage(err, 'Failed to load moderation reports. Please try again.'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const handleOpenResolveModal = (report: Report) => {
    setSelectedReport(report);
    setSelectedAction(RESOLUTION_ACTIONS[0]);
    setAdminMessage('');
    setIsResolveModalOpen(true);
  };

  const handleConfirmResolve = async () => {
    if (!selectedReport) return;
    setIsSubmitting(true);

    try {
      const res = await adminService.resolveReport({
        reportId: selectedReport.id,
        action: selectedAction,
        message: adminMessage.trim() || undefined,
      });

      toast.success(res.message || 'Report resolved successfully');
      setIsResolveModalOpen(false);
      setSelectedReport(null);
      await fetchReports();
    } catch (err: any) {
      toast.error(getErrorMessage(err, 'Failed to resolve report. Please try again.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const filtered = reports.filter((r) => {
    const q = search.toLowerCase();
    const matchesSearch =
      r.targetType.toLowerCase().includes(q) ||
      r.reason.toLowerCase().includes(q) ||
      r.description.toLowerCase().includes(q) ||
      r.targetId.toLowerCase().includes(q);

    if (!matchesSearch) return false;

    if (statusFilter === 'PENDING') return r.status === 'pending';
    if (statusFilter === 'RESOLVED') return r.status === 'resolved';
    return true;
  });

  const pendingCount = reports.filter((r) => r.status === 'pending').length;
  const resolvedCount = reports.filter((r) => r.status === 'resolved').length;

  return (
    <AdminLayout>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-neutral-900 tracking-tight m-0">
              Manage Community Reports & Moderation
            </h1>
            <p className="text-xs text-neutral-500 mt-1">
              Review community reports, apply corrective actions, and resolve disputes impartially
            </p>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={fetchReports}
            disabled={isLoading}
            className="w-full sm:w-auto shrink-0 justify-center"
            leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />}
          >
            Refresh Reports
          </Button>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1.5 scrollbar-none -mx-1 px-1">
          <button
            type="button"
            onClick={() => setStatusFilter('ALL')}
            style={{
              padding: '0.4rem 0.85rem',
              borderRadius: '9999px',
              fontSize: '0.75rem',
              fontWeight: 600,
              border: 'none',
              cursor: 'pointer',
              backgroundColor: statusFilter === 'ALL' ? 'var(--color-neutral-900)' : 'var(--color-neutral-100)',
              color: statusFilter === 'ALL' ? '#fff' : 'var(--color-neutral-600)',
              transition: 'all 0.15s ease',
            }}
          >
            All Reports ({reports.length})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('PENDING')}
            style={{
              padding: '0.4rem 0.85rem',
              borderRadius: '9999px',
              fontSize: '0.75rem',
              fontWeight: 600,
              border: 'none',
              cursor: 'pointer',
              backgroundColor: statusFilter === 'PENDING' ? '#d97706' : '#fef3c7',
              color: statusFilter === 'PENDING' ? '#fff' : '#b45309',
              transition: 'all 0.15s ease',
            }}
          >
            Pending Review ({pendingCount})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('RESOLVED')}
            style={{
              padding: '0.4rem 0.85rem',
              borderRadius: '9999px',
              fontSize: '0.75rem',
              fontWeight: 600,
              border: 'none',
              cursor: 'pointer',
              backgroundColor: statusFilter === 'RESOLVED' ? 'var(--color-primary-600)' : '#ecfdf5',
              color: statusFilter === 'RESOLVED' ? '#fff' : 'var(--color-primary-700)',
              transition: 'all 0.15s ease',
            }}
          >
            Resolved ({resolvedCount})
          </button>
        </div>

        {/* Search */}
        <SearchBar value={search} onChange={setSearch} placeholder="Search reports by target type, reason, target ID, or description..." />

        {/* Reports Table */}
        <Card padding="none" className="overflow-hidden border border-neutral-200">
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left text-xs border-collapse min-w-[700px]">
              <thead
                style={{
                  backgroundColor: 'var(--color-neutral-50)',
                  borderBottom: '1px solid var(--color-neutral-200)',
                  color: 'var(--color-neutral-500)',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}
              >
                <tr>
                  <th style={{ padding: '1rem' }}>Target</th>
                  <th style={{ padding: '1rem' }}>Report Reason</th>
                  <th style={{ padding: '1rem' }}>Description / Details</th>
                  <th style={{ padding: '1rem' }}>Reporter Privacy</th>
                  <th style={{ padding: '1rem' }}>Status</th>
                  <th style={{ padding: '1rem', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={6} style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-neutral-500)' }}>
                      <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-primary-600" />
                      <p style={{ margin: 0, fontWeight: 600 }}>Loading reports from database...</p>
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-neutral-400)' }}>
                      <ShieldCheck className="w-8 h-8 mx-auto mb-2 text-neutral-300" />
                      <p style={{ margin: 0, fontWeight: 700, color: 'var(--color-neutral-700)' }}>No reports found</p>
                      <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.75rem' }}>
                        All community reports are currently handled.
                      </p>
                    </td>
                  </tr>
                ) : (
                  filtered.map((r) => {
                    const isPending = r.status === 'pending';

                    return (
                      <tr
                        key={r.id}
                        style={{
                          borderBottom: '1px solid var(--color-neutral-100)',
                          backgroundColor: isPending ? undefined : 'rgba(249, 250, 251, 0.6)',
                        }}
                      >
                        {/* Target */}
                        <td style={{ padding: '1rem' }}>
                          <div>
                            <span
                              style={{
                                display: 'inline-block',
                                padding: '0.15rem 0.4rem',
                                borderRadius: '4px',
                                fontSize: '0.625rem',
                                fontWeight: 700,
                                textTransform: 'uppercase',
                                backgroundColor: '#e0e7ff',
                                color: '#3730a3',
                                marginBottom: '0.25rem',
                              }}
                            >
                              {r.targetType}
                            </span>
                            <p style={{ margin: 0, fontWeight: 700, color: 'var(--color-neutral-900)' }}>
                              Target ID: {r.targetId}
                            </p>
                          </div>
                        </td>

                        {/* Reason */}
                        <td style={{ padding: '1rem' }}>
                          <span style={{ fontWeight: 600, color: '#b91c1c' }}>
                            {r.reason}
                          </span>
                        </td>

                        {/* Description */}
                        <td style={{ padding: '1rem', color: 'var(--color-neutral-600)', maxWidth: '280px' }}>
                          <p style={{ margin: 0, fontSize: '0.75rem', lineHeight: '1.4' }}>
                            {r.description || 'No additional details provided'}
                          </p>
                          {r.resolution && (
                            <div style={{ marginTop: '0.35rem', padding: '0.35rem 0.5rem', backgroundColor: '#ecfdf5', borderRadius: '4px', color: '#047857', fontSize: '0.6875rem' }}>
                              <strong>Resolution:</strong> {r.resolution}
                            </div>
                          )}
                        </td>

                        {/* Reporter Privacy */}
                        <td style={{ padding: '1rem', color: 'var(--color-neutral-500)' }}>
                          <span style={{ fontSize: '0.6875rem', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                            <ShieldCheck className="w-3.5 h-3.5 text-primary-600" />
                            Confidential Member
                          </span>
                        </td>

                        {/* Status */}
                        <td style={{ padding: '1rem' }}>
                          <Badge variant={isPending ? 'warning' : 'success'}>
                            {r.status.toUpperCase()}
                          </Badge>
                        </td>

                        {/* Actions */}
                        <td style={{ padding: '1rem', textAlign: 'right' }}>
                          {isPending ? (
                            <Button
                              variant="primary"
                              size="sm"
                              onClick={() => handleOpenResolveModal(r)}
                            >
                              Resolve Report
                            </Button>
                          ) : (
                            <span style={{ fontSize: '0.6875rem', fontWeight: 600, color: 'var(--color-success)', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                              <CheckCircle2 className="w-3.5 h-3.5" /> Resolved
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Resolve Report Modal */}
      <Modal
        isOpen={isResolveModalOpen}
        onClose={() => !isSubmitting && setIsResolveModalOpen(false)}
        title="Resolve Community Report"
        size="md"
      >
        {selectedReport && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Report Summary */}
            <div
              style={{
                padding: '0.75rem',
                borderRadius: '8px',
                backgroundColor: 'var(--color-neutral-50)',
                border: '1px solid var(--color-neutral-200)',
                fontSize: '0.75rem',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                <span style={{ fontWeight: 700, color: 'var(--color-neutral-900)' }}>
                  Report #{selectedReport.id} &bull; Target: {selectedReport.targetType.toUpperCase()} ({selectedReport.targetId})
                </span>
                <span style={{ color: '#b91c1c', fontWeight: 700 }}>{selectedReport.reason}</span>
              </div>
              <p style={{ margin: 0, color: 'var(--color-neutral-600)' }}>
                {selectedReport.description}
              </p>
            </div>

            {/* Action Dropdown */}
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-neutral-700)', marginBottom: '0.5rem' }}>
                Moderation Action <span style={{ color: '#dc2626' }}>*</span>
              </label>
              <select
                value={selectedAction}
                onChange={(e) => setSelectedAction(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.625rem 0.75rem',
                  borderRadius: '6px',
                  border: '1px solid var(--color-neutral-300)',
                  fontSize: '0.75rem',
                  backgroundColor: '#fff',
                  outline: 'none',
                }}
              >
                {RESOLUTION_ACTIONS.map((act) => (
                  <option key={act} value={act}>
                    {act}
                  </option>
                ))}
              </select>
            </div>

            {/* Admin Message */}
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-neutral-700)', marginBottom: '0.5rem' }}>
                Resolution Notes / Message (Optional)
              </label>
              <textarea
                rows={3}
                value={adminMessage}
                onChange={(e) => setAdminMessage(e.target.value)}
                placeholder="Explain the outcome or moderation decision applied..."
                style={{
                  width: '100%',
                  padding: '0.625rem 0.75rem',
                  borderRadius: '6px',
                  border: '1px solid var(--color-neutral-300)',
                  fontSize: '0.75rem',
                  outline: 'none',
                  resize: 'vertical',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            {/* Privacy Guarantee Note */}
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.5rem',
                padding: '0.75rem',
                borderRadius: '6px',
                backgroundColor: '#eff6ff',
                border: '1px solid #dbeafe',
                fontSize: '0.6875rem',
                color: '#1e40af',
              }}
            >
              <ShieldCheck className="w-4 h-4 shrink-0 text-blue-600 mt-0.5" />
              <div>
                <strong>Reporter Privacy Protected:</strong> If this action notifies the reported user, the reporter's identity will NEVER be revealed. The notice will indicate an impartial review was conducted by administration.
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 mt-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsResolveModalOpen(false)}
                disabled={isSubmitting}
                className="w-full sm:w-auto justify-center"
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleConfirmResolve}
                disabled={isSubmitting}
                className="w-full sm:w-auto justify-center"
                leftIcon={isSubmitting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : undefined}
              >
                {isSubmitting ? 'Resolving...' : 'Confirm Resolution'}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </AdminLayout>
  );
}
