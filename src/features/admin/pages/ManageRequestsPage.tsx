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
import type { ItemRequest } from '@/types';
import SEO from '@/components/common/SEO';
import {
  Trash2,
  AlertTriangle,
  RefreshCw,
  HandHeart,
  ShieldAlert,
  Info,
} from 'lucide-react';

const REQUEST_REMOVAL_REASONS = [
  'Spam',
  'Duplicate request',
  'Invalid request',
  'Inappropriate content',
  'Request no longer allowed',
  'Community guidelines violation',
  'Other',
];

export default function ManageRequestsPage() {
  const [requests, setRequests] = useState<ItemRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'OPEN' | 'CANCELLED'>('ALL');

  // Modal State
  const [selectedRequest, setSelectedRequest] = useState<ItemRequest | null>(null);
  const [isRemoveModalOpen, setIsRemoveModalOpen] = useState(false);
  const [selectedReason, setSelectedReason] = useState(REQUEST_REMOVAL_REASONS[0]);
  const [adminMessage, setAdminMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchRequests = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await adminService.getRequests();
      setRequests(data);
    } catch (err: any) {
      toast.error(getErrorMessage(err, 'Failed to load community requests. Please try again.'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const handleOpenRemoveModal = (req: ItemRequest) => {
    setSelectedRequest(req);
    setSelectedReason(REQUEST_REMOVAL_REASONS[0]);
    setAdminMessage('');
    setIsRemoveModalOpen(true);
  };

  const handleConfirmRemove = async () => {
    if (!selectedRequest) return;
    setIsSubmitting(true);

    try {
      const res = await adminService.removeRequest({
        requestId: selectedRequest.id,
        reason: selectedReason,
        message: adminMessage.trim() || undefined,
      });

      toast.success(res.message || 'Request removed successfully');
      setIsRemoveModalOpen(false);
      setSelectedRequest(null);
      await fetchRequests();
    } catch (err: any) {
      toast.error(getErrorMessage(err, 'Failed to remove request. Please try again.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const filtered = requests.filter((r) => {
    const q = search.toLowerCase();
    const matchesSearch =
      r.title.toLowerCase().includes(q) ||
      (r.category && r.category.toLowerCase().includes(q)) ||
      (r.user && r.user.fullName.toLowerCase().includes(q));

    if (!matchesSearch) return false;

    if (statusFilter === 'OPEN') return r.status === 'active';
    if (statusFilter === 'CANCELLED') return r.status === 'cancelled';
    return true;
  });

  const openCount = requests.filter((r) => r.status === 'active').length;
  const cancelledCount = requests.filter((r) => r.status === 'cancelled').length;

  return (
    <AdminLayout>
      <SEO title="Manage Requests" noindex={true} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-neutral-900 tracking-tight m-0">
              Manage Community Requests
            </h1>
            <p className="text-xs text-neutral-500 mt-1">
              Review urgent neighbor requests, remove invalid listings, and dispatch notices
            </p>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={fetchRequests}
            disabled={isLoading}
            className="w-full sm:w-auto shrink-0 justify-center"
            leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />}
          >
            Refresh Requests
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
            All Requests ({requests.length})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('OPEN')}
            style={{
              padding: '0.4rem 0.85rem',
              borderRadius: '9999px',
              fontSize: '0.75rem',
              fontWeight: 600,
              border: 'none',
              cursor: 'pointer',
              backgroundColor: statusFilter === 'OPEN' ? 'var(--color-primary-600)' : '#ecfdf5',
              color: statusFilter === 'OPEN' ? '#fff' : 'var(--color-primary-700)',
              transition: 'all 0.15s ease',
            }}
          >
            Active & Open ({openCount})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('CANCELLED')}
            style={{
              padding: '0.4rem 0.85rem',
              borderRadius: '9999px',
              fontSize: '0.75rem',
              fontWeight: 600,
              border: 'none',
              cursor: 'pointer',
              backgroundColor: statusFilter === 'CANCELLED' ? '#dc2626' : '#fee2e2',
              color: statusFilter === 'CANCELLED' ? '#fff' : '#b91c1c',
              transition: 'all 0.15s ease',
            }}
          >
            Removed / Cancelled ({cancelledCount})
          </button>
        </div>

        {/* Search */}
        <SearchBar value={search} onChange={setSearch} placeholder="Search requests by title, category, or requester..." />

        {/* Requests Table */}
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
                  <th style={{ padding: '1rem' }}>Request Title</th>
                  <th style={{ padding: '1rem' }}>Requester</th>
                  <th style={{ padding: '1rem' }}>Urgency</th>
                  <th style={{ padding: '1rem' }}>Needed Before</th>
                  <th style={{ padding: '1rem' }}>Status</th>
                  <th style={{ padding: '1rem', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={6} style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-neutral-500)' }}>
                      <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-primary-600" />
                      <p style={{ margin: 0, fontWeight: 600 }}>Loading requests from database...</p>
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-neutral-400)' }}>
                      <HandHeart className="w-8 h-8 mx-auto mb-2 text-neutral-300" />
                      <p style={{ margin: 0, fontWeight: 700, color: 'var(--color-neutral-700)' }}>No requests found</p>
                      <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.75rem' }}>
                        Try adjusting your search criteria or filter.
                      </p>
                    </td>
                  </tr>
                ) : (
                  filtered.map((req) => {
                    const isCancelled = req.status === 'cancelled';

                    return (
                      <tr
                        key={req.id}
                        style={{
                          borderBottom: '1px solid var(--color-neutral-100)',
                          backgroundColor: isCancelled ? 'rgba(254, 242, 242, 0.4)' : undefined,
                        }}
                      >
                        {/* Title */}
                        <td style={{ padding: '1rem' }}>
                          <div>
                            <p style={{ fontWeight: 700, color: 'var(--color-neutral-900)', margin: 0 }}>
                              {req.title}
                            </p>
                            <span style={{ fontSize: '0.625rem', color: 'var(--color-neutral-400)' }}>
                              {req.category || 'General'} &bull; ID: {req.id}
                            </span>
                          </div>
                        </td>

                        {/* Requester */}
                        <td style={{ padding: '1rem', color: 'var(--color-neutral-700)' }}>
                          <div>
                            <p style={{ fontWeight: 600, margin: 0 }}>{req.user?.fullName || 'Community Member'}</p>
                            <p style={{ fontSize: '0.625rem', color: 'var(--color-neutral-400)', margin: 0 }}>
                              {req.user?.email || 'N/A'}
                            </p>
                          </div>
                        </td>

                        {/* Urgency */}
                        <td style={{ padding: '1rem' }}>
                          <Badge variant={req.urgency === 'critical' ? 'danger' : req.urgency === 'high' ? 'warning' : 'default'}>
                            {req.urgency.toUpperCase()}
                          </Badge>
                        </td>

                        {/* Needed Before */}
                        <td style={{ padding: '1rem', color: 'var(--color-neutral-600)' }}>
                          {req.neededBefore || 'Flexible'}
                        </td>

                        {/* Status */}
                        <td style={{ padding: '1rem' }}>
                          {isCancelled ? (
                            <Badge variant="danger">
                              REMOVED
                            </Badge>
                          ) : req.status === 'active' ? (
                            <Badge variant="success">
                              ACTIVE
                            </Badge>
                          ) : (
                            <Badge variant="default">
                              {req.status?.toUpperCase()}
                            </Badge>
                          )}
                        </td>

                        {/* Actions */}
                        <td style={{ padding: '1rem', textAlign: 'right' }}>
                          {isCancelled ? (
                            <span style={{ fontSize: '0.6875rem', color: '#b91c1c', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                              <ShieldAlert className="w-3.5 h-3.5" /> Removed by Admin
                            </span>
                          ) : (
                            <Button
                              variant="danger"
                              size="sm"
                              onClick={() => handleOpenRemoveModal(req)}
                              leftIcon={<Trash2 className="w-3.5 h-3.5" />}
                            >
                              Remove Request
                            </Button>
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

      {/* Remove Request Modal */}
      <Modal
        isOpen={isRemoveModalOpen}
        onClose={() => !isSubmitting && setIsRemoveModalOpen(false)}
        title="Remove Community Request"
        size="md"
      >
        {selectedRequest && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Target Request Info */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.75rem',
                borderRadius: '8px',
                backgroundColor: 'var(--color-neutral-50)',
                border: '1px solid var(--color-neutral-200)',
              }}
            >
              <div
                style={{
                  width: '2.5rem',
                  height: '2.5rem',
                  borderRadius: '6px',
                  backgroundColor: '#fee2e2',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#dc2626',
                  flexShrink: 0,
                }}
              >
                <HandHeart className="w-5 h-5" />
              </div>
              <div>
                <p style={{ margin: 0, fontWeight: 700, color: 'var(--color-neutral-900)' }}>
                  {selectedRequest.title}
                </p>
                <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--color-neutral-500)' }}>
                  Requester: {selectedRequest.user?.fullName || 'N/A'} ({selectedRequest.user?.email || 'N/A'})
                </p>
              </div>
            </div>

            {/* Predefined Reasons */}
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-neutral-700)', marginBottom: '0.5rem' }}>
                Reason for Removal <span style={{ color: '#dc2626' }}>*</span>
              </label>
              <select
                value={selectedReason}
                onChange={(e) => setSelectedReason(e.target.value)}
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
                {REQUEST_REMOVAL_REASONS.map((reason) => (
                  <option key={reason} value={reason}>
                    {reason}
                  </option>
                ))}
              </select>
            </div>

            {/* Additional Message */}
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-neutral-700)', marginBottom: '0.5rem' }}>
                Additional Message to Requester (Optional)
              </label>
              <textarea
                rows={3}
                value={adminMessage}
                onChange={(e) => setAdminMessage(e.target.value)}
                placeholder="Explain the reason or specify how the requester can resubmit..."
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

            {/* Moderation Warning */}
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.5rem',
                padding: '0.75rem',
                borderRadius: '6px',
                backgroundColor: '#fff7ed',
                border: '1px solid #ffedd5',
                fontSize: '0.6875rem',
                color: '#9a3412',
              }}
            >
              <ShieldAlert className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
              <div>
                <strong>Audit & Notification:</strong> The request will be removed from community browsing. An official notification will be dispatched to the requester with the reason provided.
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 mt-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsRemoveModalOpen(false)}
                disabled={isSubmitting}
                className="w-full sm:w-auto justify-center"
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={handleConfirmRemove}
                disabled={isSubmitting}
                className="w-full sm:w-auto justify-center"
                leftIcon={isSubmitting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
              >
                {isSubmitting ? 'Removing...' : 'Confirm Remove Request'}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </AdminLayout>
  );
}
