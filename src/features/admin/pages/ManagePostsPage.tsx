import AdminLayout from '@/components/layout/AdminLayout';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import SearchBar from '@/components/ui/SearchBar';
import Modal from '@/components/ui/Modal';
import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { getErrorMessage } from '@/utils/apiError';
import { adminService } from '@/services/admin.service';
import type { Item } from '@/types';
import SEO from '@/components/common/SEO';
import {
  Trash2,
  AlertTriangle,
  RefreshCw,
  Package,
  ShieldAlert,
  Info,
  CheckCircle,
} from 'lucide-react';

const POST_REMOVAL_REASONS = [
  'Incorrect or misleading information',
  'Prohibited item',
  'Duplicate post',
  'Spam',
  'Inappropriate content',
  'Fraudulent/suspicious post',
  'Community guidelines violation',
  'Other',
];

export default function ManagePostsPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'AVAILABLE' | 'REMOVED'>('ALL');

  // Modal State
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [isRemoveModalOpen, setIsRemoveModalOpen] = useState(false);
  const [selectedReason, setSelectedReason] = useState(POST_REMOVAL_REASONS[0]);
  const [adminMessage, setAdminMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchPosts = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await adminService.getPosts();
      setItems(data);
    } catch (err: any) {
      toast.error(getErrorMessage(err, 'Failed to load posts. Please try again.'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const handleOpenRemoveModal = (item: Item) => {
    setSelectedItem(item);
    setSelectedReason(POST_REMOVAL_REASONS[0]);
    setAdminMessage('');
    setIsRemoveModalOpen(true);
  };

  const handleConfirmRemove = async () => {
    if (!selectedItem) return;
    setIsSubmitting(true);

    try {
      const res = await adminService.removePost({
        itemId: selectedItem.id,
        reason: selectedReason,
        message: adminMessage.trim() || undefined,
      });

      toast.success(res.message || 'Post removed successfully');
      setIsRemoveModalOpen(false);
      setSelectedItem(null);
      await fetchPosts();
    } catch (err: any) {
      toast.error(getErrorMessage(err, 'Failed to remove post. Please try again.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const filtered = items.filter((i) => {
    const q = search.toLowerCase();
    const matchesSearch =
      i.title.toLowerCase().includes(q) ||
      i.category.toLowerCase().includes(q) ||
      (i.owner && i.owner.fullName.toLowerCase().includes(q));

    if (!matchesSearch) return false;

    if (statusFilter === 'AVAILABLE') return i.status !== 'removed';
    if (statusFilter === 'REMOVED') return i.status === 'removed';
    return true;
  });

  const availableCount = items.filter((i) => i.status !== 'removed').length;
  const removedCount = items.filter((i) => i.status === 'removed').length;

  return (
    <AdminLayout>
      <SEO title="Manage Posts" noindex={true} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-neutral-900 tracking-tight m-0">
              Manage Posts & Item Listings
            </h1>
            <p className="text-xs text-neutral-500 mt-1">
              Review, moderate, and manage community item listings with notification dispatches
            </p>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={fetchPosts}
            disabled={isLoading}
            className="w-full sm:w-auto shrink-0 justify-center"
            leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />}
          >
            Refresh Posts
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
            All Listings ({items.length})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('AVAILABLE')}
            style={{
              padding: '0.4rem 0.85rem',
              borderRadius: '9999px',
              fontSize: '0.75rem',
              fontWeight: 600,
              border: 'none',
              cursor: 'pointer',
              backgroundColor: statusFilter === 'AVAILABLE' ? 'var(--color-primary-600)' : '#ecfdf5',
              color: statusFilter === 'AVAILABLE' ? '#fff' : 'var(--color-primary-700)',
              transition: 'all 0.15s ease',
            }}
          >
            Active & Available ({availableCount})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('REMOVED')}
            style={{
              padding: '0.4rem 0.85rem',
              borderRadius: '9999px',
              fontSize: '0.75rem',
              fontWeight: 600,
              border: 'none',
              cursor: 'pointer',
              backgroundColor: statusFilter === 'REMOVED' ? '#dc2626' : '#fee2e2',
              color: statusFilter === 'REMOVED' ? '#fff' : '#b91c1c',
              transition: 'all 0.15s ease',
            }}
          >
            Removed ({removedCount})
          </button>
        </div>

        {/* Search */}
        <SearchBar value={search} onChange={setSearch} placeholder="Search posts by title, category, or owner name..." />

        {/* Posts Table */}
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
                  <th style={{ padding: '1rem' }}>Item Details</th>
                  <th style={{ padding: '1rem' }}>Owner</th>
                  <th style={{ padding: '1rem' }}>Type</th>
                  <th style={{ padding: '1rem' }}>Condition</th>
                  <th style={{ padding: '1rem' }}>Status</th>
                  <th style={{ padding: '1rem', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={6} style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-neutral-500)' }}>
                      <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-primary-600" />
                      <p style={{ margin: 0, fontWeight: 600 }}>Loading listings from database...</p>
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-neutral-400)' }}>
                      <Package className="w-8 h-8 mx-auto mb-2 text-neutral-300" />
                      <p style={{ margin: 0, fontWeight: 700, color: 'var(--color-neutral-700)' }}>No listings found</p>
                      <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.75rem' }}>
                        Try adjusting your search criteria or filter.
                      </p>
                    </td>
                  </tr>
                ) : (
                  filtered.map((item) => {
                    const isRemoved = item.status === 'removed';

                    return (
                      <tr
                        key={item.id}
                        style={{
                          borderBottom: '1px solid var(--color-neutral-100)',
                          backgroundColor: isRemoved ? 'rgba(254, 242, 242, 0.4)' : undefined,
                        }}
                      >
                        {/* Item Details */}
                        <td style={{ padding: '1rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            {item.images && item.images.length > 0 ? (
                              <img
                                src={item.images[0]}
                                alt={item.title}
                                style={{
                                  width: '2.5rem',
                                  height: '2.5rem',
                                  borderRadius: '6px',
                                  objectFit: 'cover',
                                  border: '1px solid var(--color-neutral-200)',
                                }}
                              />
                            ) : (
                              <div
                                style={{
                                  width: '2.5rem',
                                  height: '2.5rem',
                                  borderRadius: '6px',
                                  backgroundColor: 'var(--color-neutral-100)',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  color: 'var(--color-neutral-400)',
                                }}
                              >
                                <Package className="w-4 h-4" />
                              </div>
                            )}
                            <div>
                              <p style={{ fontWeight: 700, color: 'var(--color-neutral-900)', margin: 0 }}>
                                {item.title}
                              </p>
                              <span style={{ fontSize: '0.625rem', color: 'var(--color-neutral-400)', textTransform: 'capitalize' }}>
                                {item.category} &bull; ID: {item.id}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Owner */}
                        <td style={{ padding: '1rem', color: 'var(--color-neutral-700)' }}>
                          <div>
                            <p style={{ fontWeight: 600, margin: 0 }}>{item.owner?.fullName || 'Community Member'}</p>
                            <p style={{ fontSize: '0.625rem', color: 'var(--color-neutral-400)', margin: 0 }}>
                              {item.owner?.email || 'N/A'}
                            </p>
                          </div>
                        </td>

                        {/* Type */}
                        <td style={{ padding: '1rem' }}>
                          <Badge variant={item.type === 'donation' ? 'success' : 'primary'}>
                            {item.type === 'donation' ? 'Donation' : 'Exchange'}
                          </Badge>
                        </td>

                        {/* Condition */}
                        <td style={{ padding: '1rem', color: 'var(--color-neutral-600)' }}>
                          {item.condition}
                        </td>

                        {/* Status */}
                        <td style={{ padding: '1rem' }}>
                          {isRemoved ? (
                            <Badge variant="danger">
                              REMOVED
                            </Badge>
                          ) : item.status === 'available' ? (
                            <Badge variant="success">
                              AVAILABLE
                            </Badge>
                          ) : (
                            <Badge variant="default">
                              {item.status?.toUpperCase() || 'ACTIVE'}
                            </Badge>
                          )}
                        </td>

                        {/* Actions */}
                        <td style={{ padding: '1rem', textAlign: 'right' }}>
                          {isRemoved ? (
                            <span style={{ fontSize: '0.6875rem', color: '#b91c1c', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                              <ShieldAlert className="w-3.5 h-3.5" /> Removed by Admin
                            </span>
                          ) : (
                            <Button
                              variant="danger"
                              size="sm"
                              onClick={() => handleOpenRemoveModal(item)}
                              leftIcon={<Trash2 className="w-3.5 h-3.5" />}
                            >
                              Remove Post
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

      {/* Remove Post Confirmation Modal */}
      <Modal
        isOpen={isRemoveModalOpen}
        onClose={() => !isSubmitting && setIsRemoveModalOpen(false)}
        title="Remove Post from Community"
        size="md"
      >
        {selectedItem && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Target Item Card */}
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
                  width: '3rem',
                  height: '3rem',
                  borderRadius: '6px',
                  backgroundColor: 'var(--color-neutral-200)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--color-neutral-500)',
                  overflow: 'hidden',
                  flexShrink: 0,
                }}
              >
                {selectedItem.images && selectedItem.images[0] ? (
                  <img src={selectedItem.images[0]} alt={selectedItem.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <Package className="w-5 h-5" />
                )}
              </div>
              <div>
                <p style={{ margin: 0, fontWeight: 700, color: 'var(--color-neutral-900)' }}>
                  {selectedItem.title}
                </p>
                <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--color-neutral-500)' }}>
                  Owner: {selectedItem.owner?.fullName || 'N/A'} ({selectedItem.owner?.email || 'N/A'})
                </p>
              </div>
            </div>

            {/* Predefined Reason Dropdown */}
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-neutral-700)', marginBottom: '0.5rem' }}>
                Removal Reason <span style={{ color: '#dc2626' }}>*</span>
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
                {POST_REMOVAL_REASONS.map((reason) => (
                  <option key={reason} value={reason}>
                    {reason}
                  </option>
                ))}
              </select>
            </div>

            {/* Additional Message (Optional) */}
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-neutral-700)', marginBottom: '0.5rem' }}>
                Additional Message to User (Optional)
              </label>
              <textarea
                rows={3}
                value={adminMessage}
                onChange={(e) => setAdminMessage(e.target.value)}
                placeholder="Explain the reason or corrective action required before relisting..."
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
                <strong>Audit & User Notification:</strong> The post status will be set to REMOVED, hiding it from public search. An official notification will be immediately dispatched to the owner detailing the violation.
              </div>
            </div>

            {/* Action Buttons */}
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
                {isSubmitting ? 'Removing...' : 'Confirm Remove Post'}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </AdminLayout>
  );
}
