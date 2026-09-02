import { useState } from 'react';
import {
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  Eye,
  Camera,
  MapPin,
  Calendar,
} from 'lucide-react';
import AdminLayout from '@/components/layout/AdminLayout';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Avatar from '@/components/ui/Avatar';
import Modal from '@/components/ui/Modal';
import { useProfilePictureStore } from '@/stores/profilePictureStore';
import type { ProfilePictureSubmission, ProfilePictureStatus } from '@/types';
import toast from 'react-hot-toast';

export default function ManageApprovalsPage() {
  const { submissions, approveSubmission, rejectSubmission } = useProfilePictureStore();

  const [activeTab, setActiveTab] = useState<'all' | ProfilePictureStatus>('pending');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubmission, setSelectedSubmission] = useState<ProfilePictureSubmission | null>(null);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [previewModalOpen, setPreviewModalOpen] = useState(false);

  const pendingCount = submissions.filter((s) => s.status === 'pending').length;
  const approvedCount = submissions.filter((s) => s.status === 'approved').length;
  const rejectedCount = submissions.filter((s) => s.status === 'rejected').length;

  const filteredSubmissions = submissions.filter((sub) => {
    const matchesTab = activeTab === 'all' || sub.status === activeTab;
    const userName = sub.user?.fullName || 'User';
    const userEmail = sub.user?.email || '';
    const matchesSearch =
      userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      userEmail.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const handleApprove = (submission: ProfilePictureSubmission) => {
    approveSubmission(submission.id);
    toast.success(`Approved profile picture for ${submission.user?.fullName || 'User'}`);
    if (selectedSubmission?.id === submission.id) {
      setSelectedSubmission(null);
    }
  };

  const openRejectModal = (submission: ProfilePictureSubmission) => {
    setSelectedSubmission(submission);
    setRejectionReason('Image does not meet community guidelines (e.g. unclear or inappropriate photo).');
    setIsRejectModalOpen(true);
  };

  const handleConfirmReject = () => {
    if (!selectedSubmission) return;
    rejectSubmission(selectedSubmission.id, rejectionReason.trim());
    toast.success(`Rejected submission for ${selectedSubmission.user?.fullName || 'User'}`);
    setIsRejectModalOpen(false);
    setSelectedSubmission(null);
  };

  const openImagePreview = (submission: ProfilePictureSubmission) => {
    setSelectedSubmission(submission);
    setPreviewModalOpen(true);
  };

  return (
    <AdminLayout>
      <div style={{ maxWidth: '72rem', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
          <div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--color-neutral-900)', margin: 0 }}>
              Profile Picture Validation
            </h1>
            <p style={{ fontSize: '0.875rem', color: 'var(--color-neutral-500)', margin: '0.25rem 0 0 0' }}>
              Review, approve, or reject user profile picture submissions to maintain community safety and authenticity.
            </p>
          </div>
        </div>

        {/* Top Summary Metric Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
          <Card padding="md" style={{ backgroundColor: '#fff', border: '1px solid var(--color-neutral-200)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ width: '3rem', height: '3rem', borderRadius: 'var(--radius-md)', backgroundColor: '#fffbeb', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Clock style={{ width: '1.5rem', height: '1.5rem' }} />
            </div>
            <div>
              <p style={{ fontSize: '0.75rem', color: 'var(--color-neutral-400)', fontWeight: 700, margin: 0 }}>Pending Review</p>
              <p style={{ fontSize: '1.5rem', fontWeight: 800, color: '#d97706', margin: '0.125rem 0 0 0' }}>{pendingCount}</p>
            </div>
          </Card>

          <Card padding="md" style={{ backgroundColor: '#fff', border: '1px solid var(--color-neutral-200)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ width: '3rem', height: '3rem', borderRadius: 'var(--radius-md)', backgroundColor: '#f0fdf4', color: 'var(--color-primary-600)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CheckCircle2 style={{ width: '1.5rem', height: '1.5rem' }} />
            </div>
            <div>
              <p style={{ fontSize: '0.75rem', color: 'var(--color-neutral-400)', fontWeight: 700, margin: 0 }}>Approved Photos</p>
              <p style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-primary-600)', margin: '0.125rem 0 0 0' }}>{approvedCount}</p>
            </div>
          </Card>

          <Card padding="md" style={{ backgroundColor: '#fff', border: '1px solid var(--color-neutral-200)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ width: '3rem', height: '3rem', borderRadius: 'var(--radius-md)', backgroundColor: '#fef2f2', color: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <XCircle style={{ width: '1.5rem', height: '1.5rem' }} />
            </div>
            <div>
              <p style={{ fontSize: '0.75rem', color: 'var(--color-neutral-400)', fontWeight: 700, margin: 0 }}>Declined Submissions</p>
              <p style={{ fontSize: '1.5rem', fontWeight: 800, color: '#dc2626', margin: '0.125rem 0 0 0' }}>{rejectedCount}</p>
            </div>
          </Card>
        </div>

        {/* Filter Toolbar & Search */}
        <Card style={{ padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
          {/* Tabs */}
          <div style={{ display: 'flex', gap: '0.5rem', backgroundColor: 'var(--color-neutral-100)', padding: '0.25rem', borderRadius: 'var(--radius-md)' }}>
            {[
              { id: 'pending', label: `Pending (${pendingCount})` },
              { id: 'approved', label: `Approved (${approvedCount})` },
              { id: 'rejected', label: `Rejected (${rejectedCount})` },
              { id: 'all', label: `All (${submissions.length})` },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                style={{
                  padding: '0.4rem 0.875rem',
                  fontSize: '0.8125rem',
                  fontWeight: activeTab === tab.id ? 700 : 500,
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: activeTab === tab.id ? '#fff' : 'transparent',
                  color: activeTab === tab.id ? 'var(--color-neutral-900)' : 'var(--color-neutral-600)',
                  boxShadow: activeTab === tab.id ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 120ms ease-in-out',
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div style={{ position: 'relative', width: '18rem', maxWidth: '100%' }}>
            <Search style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', width: '1rem', height: '1rem', color: 'var(--color-neutral-400)' }} />
            <input
              type="text"
              placeholder="Search user by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '0.5rem 0.75rem 0.5rem 2.25rem',
                fontSize: '0.8125rem',
                border: '1px solid var(--color-neutral-200)',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--color-neutral-50)',
                outline: 'none',
              }}
            />
          </div>
        </Card>

        {/* Submissions List */}
        {filteredSubmissions.length === 0 ? (
          <Card style={{ padding: '4rem 1.5rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
            <Camera style={{ width: '3rem', height: '3rem', color: 'var(--color-neutral-300)' }} />
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-neutral-800)', margin: 0 }}>No submissions found</h3>
            <p style={{ fontSize: '0.8125rem', color: 'var(--color-neutral-500)', margin: 0, maxWidth: '24rem' }}>
              {activeTab === 'pending'
                ? 'All pending profile pictures have been reviewed! New user submissions will appear here.'
                : 'No profile picture submissions match the current filter or search criteria.'}
            </p>
          </Card>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(22rem, 1fr))', gap: '1.25rem' }}>
            {filteredSubmissions.map((sub) => {
              const user = sub.user;
              return (
                <Card
                  key={sub.id}
                  style={{
                    padding: '1.25rem',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: '1.25rem',
                    border: '1px solid var(--color-neutral-200)',
                  }}
                >
                  {/* Header: User details & Status */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.75rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <Avatar src={user?.avatar} name={user?.fullName || 'User'} size="md" />
                      <div>
                        <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--color-neutral-900)', margin: 0 }}>
                          {user?.fullName || 'Community Member'}
                        </h3>
                        <p style={{ fontSize: '0.75rem', color: 'var(--color-neutral-500)', margin: '0.125rem 0 0 0' }}>
                          {user?.email || 'user@example.com'}
                        </p>
                      </div>
                    </div>

                    <Badge
                      variant={
                        sub.status === 'approved'
                          ? 'success'
                          : sub.status === 'rejected'
                          ? 'danger'
                          : 'warning'
                      }
                    >
                      {sub.status.toUpperCase()}
                    </Badge>
                  </div>

                  {/* Image Preview & Details Card */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '1rem',
                      padding: '0.875rem',
                      backgroundColor: 'var(--color-neutral-50)',
                      borderRadius: 'var(--radius-lg)',
                      border: '1px solid var(--color-neutral-200)',
                    }}
                  >
                    <div
                      onClick={() => openImagePreview(sub)}
                      style={{
                        position: 'relative',
                        width: '5rem',
                        height: '5rem',
                        borderRadius: 'var(--radius-md)',
                        overflow: 'hidden',
                        cursor: 'pointer',
                        flexShrink: 0,
                        border: '2px solid var(--color-neutral-300)',
                      }}
                      title="Click to zoom preview"
                    >
                      <img
                        src={sub.imageUrl}
                        alt="Uploaded submission"
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                      <div
                        style={{
                          position: 'absolute',
                          inset: 0,
                          backgroundColor: 'rgba(0,0,0,0.3)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          opacity: 0,
                          transition: 'opacity 150ms ease-in-out',
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
                        onMouseLeave={(e) => (e.currentTarget.style.opacity = '0')}
                      >
                        <Eye style={{ width: '1.25rem', height: '1.25rem', color: '#fff' }} />
                      </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', fontSize: '0.75rem', color: 'var(--color-neutral-600)', minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                        <MapPin style={{ width: '0.875rem', height: '0.875rem', color: 'var(--color-primary-600)', flexShrink: 0 }} />
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {user?.barangay || 'Poblacion'}, {user?.municipality || 'San Fernando'}
                        </span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', color: 'var(--color-neutral-400)' }}>
                        <Calendar style={{ width: '0.875rem', height: '0.875rem', flexShrink: 0 }} />
                        <span>Submitted {new Date(sub.submittedAt).toLocaleDateString()}</span>
                      </div>

                      {sub.status === 'rejected' && sub.rejectionReason && (
                        <div style={{ marginTop: '0.25rem', color: '#dc2626', fontSize: '0.6875rem', fontStyle: 'italic', lineHeight: '1.4' }}>
                          Reason: "{sub.rejectionReason}"
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.625rem', borderTop: '1px solid var(--color-neutral-100)', paddingTop: '0.75rem' }}>
                    {sub.status === 'pending' ? (
                      <>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => openRejectModal(sub)}
                          leftIcon={<XCircle style={{ width: '0.875rem', height: '0.875rem' }} />}
                        >
                          Reject
                        </Button>
                        <Button
                          variant="primary"
                          size="sm"
                          className="font-bold"
                          onClick={() => handleApprove(sub)}
                          leftIcon={<CheckCircle2 style={{ width: '0.875rem', height: '0.875rem' }} />}
                        >
                          Approve Photo
                        </Button>
                      </>
                    ) : sub.status === 'approved' ? (
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => openRejectModal(sub)}
                      >
                        Revoke Approval
                      </Button>
                    ) : (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleApprove(sub)}
                      >
                        Re-Approve Photo
                      </Button>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        )}

        {/* Reject Modal with Reason */}
        <Modal
          isOpen={isRejectModalOpen}
          onClose={() => setIsRejectModalOpen(false)}
          title="Decline Profile Picture"
          size="md"
        >
          {selectedSubmission && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {/* User and Image info banner */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.875rem',
                  padding: '0.75rem 1rem',
                  backgroundColor: 'var(--color-neutral-50)',
                  borderRadius: 'var(--radius-lg)',
                  border: '1px solid var(--color-neutral-200)',
                }}
              >
                <img
                  src={selectedSubmission.imageUrl}
                  alt="Submission"
                  style={{
                    width: '3rem',
                    height: '3rem',
                    borderRadius: '9999px',
                    objectFit: 'cover',
                    border: '2px solid #fff',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
                    flexShrink: 0,
                  }}
                />
                <div style={{ minWidth: 0, flex: 1 }}>
                  <h4 style={{ margin: 0, fontSize: '0.875rem', fontWeight: 800, color: 'var(--color-neutral-900)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {selectedSubmission.user?.fullName || 'User'}
                  </h4>
                  <p style={{ margin: '0.125rem 0 0 0', fontSize: '0.75rem', color: 'var(--color-neutral-500)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {selectedSubmission.user?.email || 'user@example.com'}
                  </p>
                </div>
              </div>

              <p style={{ margin: 0, fontSize: '0.8125rem', color: 'var(--color-neutral-600)', lineHeight: '1.5' }}>
                Specify why this image was declined. The user will receive an instant notification with this reason and will be asked to upload a compliant photo.
              </p>

              {/* Quick Reasons Selection */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-neutral-800)' }}>
                  Quick Select Reasons
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.625rem' }}>
                  {[
                    'Unclear or blurry photo',
                    'Inappropriate content',
                    'Not a real person / avatar',
                    'Contains advertisement',
                  ].map((reason) => {
                    const isSelected = rejectionReason === reason;
                    return (
                      <button
                        key={reason}
                        type="button"
                        onClick={() => setRejectionReason(reason)}
                        style={{
                          padding: '0.625rem 0.875rem',
                          fontSize: '0.75rem',
                          fontWeight: isSelected ? 700 : 500,
                          borderRadius: 'var(--radius-md)',
                          border: isSelected ? '1.5px solid var(--color-danger)' : '1px solid var(--color-neutral-200)',
                          backgroundColor: isSelected ? '#fee2e2' : '#ffffff',
                          color: isSelected ? '#b91c1c' : 'var(--color-neutral-700)',
                          cursor: 'pointer',
                          textAlign: 'left',
                          transition: 'all 150ms ease-in-out',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          boxShadow: isSelected ? '0 0 0 2px rgba(239,68,68,0.15)' : 'none',
                        }}
                      >
                        <span>{reason}</span>
                        {isSelected && <span style={{ color: '#b91c1c', fontWeight: 800, fontSize: '0.875rem' }}>✓</span>}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Rejection Reason Input */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-neutral-800)' }}>
                  Rejection Reason <span style={{ color: 'var(--color-danger)' }}>*</span>
                </label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  rows={3}
                  required
                  style={{
                    width: '100%',
                    padding: '0.625rem 0.875rem',
                    fontSize: '0.8125rem',
                    border: '1px solid var(--color-neutral-300)',
                    borderRadius: 'var(--radius-md)',
                    outline: 'none',
                    resize: 'vertical',
                    minHeight: '4.5rem',
                    fontFamily: 'inherit',
                  }}
                />
              </div>

              {/* Modal Actions Footer */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'flex-end',
                  gap: '0.75rem',
                  paddingTop: '1rem',
                  borderTop: '1px solid var(--color-neutral-100)',
                  marginTop: '0.25rem',
                }}
              >
                <button
                  type="button"
                  onClick={() => setIsRejectModalOpen(false)}
                  style={{
                    padding: '0.625rem 1.25rem',
                    fontSize: '0.8125rem',
                    fontWeight: 700,
                    color: 'var(--color-neutral-700)',
                    backgroundColor: 'var(--color-neutral-100)',
                    border: '1px solid var(--color-neutral-200)',
                    borderRadius: 'var(--radius-md)',
                    cursor: 'pointer',
                    transition: 'background-color 150ms',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--color-neutral-200)')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'var(--color-neutral-100)')}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmReject}
                  style={{
                    padding: '0.625rem 1.5rem',
                    fontSize: '0.8125rem',
                    fontWeight: 800,
                    color: '#ffffff',
                    backgroundColor: 'var(--color-danger)',
                    border: 'none',
                    borderRadius: 'var(--radius-md)',
                    cursor: 'pointer',
                    boxShadow: '0 2px 8px rgba(211,47,47,0.3)',
                    transition: 'opacity 150ms',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.9')}
                  onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
                >
                  Confirm Rejection
                </button>
              </div>
            </div>
          )}
        </Modal>

        {/* Full Image Preview Modal */}
        <Modal
          isOpen={previewModalOpen}
          onClose={() => setPreviewModalOpen(false)}
          title="Photo Preview"
          size="md"
        >
          {selectedSubmission && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
              <div style={{ width: '100%', maxHeight: '24rem', borderRadius: 'var(--radius-lg)', overflow: 'hidden', backgroundColor: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <img
                  src={selectedSubmission.imageUrl}
                  alt="Full size preview"
                  style={{ maxWidth: '100%', maxHeight: '24rem', objectFit: 'contain' }}
                />
              </div>

              <div style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <h4 style={{ margin: 0, fontSize: '0.875rem', fontWeight: 700, color: 'var(--color-neutral-900)' }}>
                    {selectedSubmission.user?.fullName}
                  </h4>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-neutral-500)' }}>
                    Status: {selectedSubmission.status.toUpperCase()}
                  </span>
                </div>

                {selectedSubmission.status === 'pending' && (
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => {
                        setPreviewModalOpen(false);
                        openRejectModal(selectedSubmission);
                      }}
                    >
                      Reject
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => {
                        handleApprove(selectedSubmission);
                        setPreviewModalOpen(false);
                      }}
                    >
                      Approve
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}
        </Modal>
      </div>
    </AdminLayout>
  );
}
