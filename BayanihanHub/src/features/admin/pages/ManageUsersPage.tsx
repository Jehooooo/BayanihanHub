import AdminLayout from '@/components/layout/AdminLayout';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Avatar from '@/components/ui/Avatar';
import SearchBar from '@/components/ui/SearchBar';
import Modal from '@/components/ui/Modal';
import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { adminService } from '@/services/admin.service';
import type { User } from '@/types';
import {
  Ban,
  CheckCircle2,
  Clock,
  AlertTriangle,
  RefreshCw,
  ShieldAlert,
  Calendar,
  Info,
} from 'lucide-react';

const PREDEFINED_DURATIONS = [
  { id: '1_day', label: '1 Day', days: 1 },
  { id: '3_days', label: '3 Days', days: 3 },
  { id: '7_days', label: '7 Days', days: 7 },
  { id: '14_days', label: '14 Days', days: 14 },
  { id: '30_days', label: '30 Days', days: 30 },
  { id: '60_days', label: '60 Days', days: 60 },
  { id: '90_days', label: '90 Days', days: 90 },
  { id: 'custom', label: 'Custom Duration', days: 0 },
  { id: 'permanent', label: 'Permanent', days: -1 },
];

const SUSPENSION_REASONS = [
  'Community guidelines violation',
  'Spam or fraudulent activity',
  'Inappropriate behavior or harassment',
  'Prohibited items or false requests',
  'Repeated policy infractions',
  'Safety or identity concerns',
  'Other violation',
];

export default function ManageUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'SUSPENDED' | 'REJECTED'>('ALL');

  // Suspend modal state
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isSuspendModalOpen, setIsSuspendModalOpen] = useState(false);
  const [selectedDuration, setSelectedDuration] = useState('7_days');
  const [customDays, setCustomDays] = useState<number | ''>(15);
  const [selectedReason, setSelectedReason] = useState(SUSPENSION_REASONS[0]);
  const [adminMessage, setAdminMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Unsuspend state
  const [unsuspendUserTarget, setUnsuspendUserTarget] = useState<User | null>(null);
  const [isUnsuspendModalOpen, setIsUnsuspendModalOpen] = useState(false);

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await adminService.getUsers();
      setUsers(data);
    } catch (err: any) {
      toast.error(err.message || 'Failed to fetch registered users');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Open suspend modal
  const handleOpenSuspend = (user: User) => {
    setSelectedUser(user);
    setSelectedDuration('7_days');
    setCustomDays(15);
    setSelectedReason(SUSPENSION_REASONS[0]);
    setAdminMessage('');
    setValidationError(null);
    setIsSuspendModalOpen(true);
  };

  // Submit suspension
  const handleConfirmSuspend = async () => {
    if (!selectedUser) return;

    if (selectedDuration === 'custom') {
      const numDays = Number(customDays);
      if (!customDays || isNaN(numDays) || numDays <= 0) {
        setValidationError('Custom duration must be a positive number greater than 0.');
        return;
      }
      if (numDays > 3650) {
        setValidationError('Custom duration cannot exceed 3,650 days (10 years). Use Permanent instead.');
        return;
      }
    }

    setValidationError(null);
    setIsSubmitting(true);

    try {
      const targetId = selectedUser.userId || selectedUser.id;
      const res = await adminService.suspendUser({
        userId: targetId,
        duration: selectedDuration,
        customDays: selectedDuration === 'custom' ? Number(customDays) : undefined,
        reason: selectedReason,
        message: adminMessage.trim() || undefined,
      });

      toast.success(res.message || 'User suspended successfully');
      setIsSuspendModalOpen(false);
      setSelectedUser(null);
      await fetchUsers();
    } catch (err: any) {
      toast.error(err.message || 'Failed to suspend user');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submit unsuspend
  const handleConfirmUnsuspend = async () => {
    if (!unsuspendUserTarget) return;
    setIsSubmitting(true);
    try {
      const targetId = unsuspendUserTarget.userId || unsuspendUserTarget.id;
      const res = await adminService.unsuspendUser(targetId);
      toast.success(res.message || 'Suspension lifted successfully');
      setIsUnsuspendModalOpen(false);
      setUnsuspendUserTarget(null);
      await fetchUsers();
    } catch (err: any) {
      toast.error(err.message || 'Failed to unsuspend user');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filtered = users.filter((u) => {
    const matchesSearch =
      u.fullName.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      (u.municipality && u.municipality.toLowerCase().includes(search.toLowerCase())) ||
      (u.barangay && u.barangay.toLowerCase().includes(search.toLowerCase())) ||
      (u.username && u.username.toLowerCase().includes(search.toLowerCase()));

    if (!matchesSearch) return false;

    const userStatus = (u.account_status || (u.isSuspended ? 'SUSPENDED' : 'PENDING')).toUpperCase();
    if (statusFilter === 'ALL') return true;
    if (statusFilter === 'SUSPENDED') return u.isSuspended || userStatus === 'SUSPENDED';
    if (statusFilter === 'PENDING') return !u.isSuspended && userStatus === 'PENDING';
    if (statusFilter === 'APPROVED') return !u.isSuspended && userStatus === 'APPROVED';
    if (statusFilter === 'REJECTED') return userStatus === 'REJECTED';

    return true;
  });

  const countPending = users.filter((u) => !u.isSuspended && (u.account_status === 'PENDING' || (!u.account_status && !u.isSuspended))).length;
  const countApproved = users.filter((u) => !u.isSuspended && u.account_status === 'APPROVED').length;
  const countSuspended = users.filter((u) => u.isSuspended || u.account_status === 'SUSPENDED').length;
  const countRejected = users.filter((u) => u.account_status === 'REJECTED').length;

  return (
    <AdminLayout>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-neutral-900 tracking-tight m-0">
              Manage Registered Users
            </h1>
            <p className="text-xs text-neutral-500 mt-1">
              View and moderate all registered accounts in MySQL across all verification and moderation states
            </p>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={fetchUsers}
            disabled={isLoading}
            className="w-full sm:w-auto shrink-0 justify-center"
            leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />}
          >
            Refresh Users
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
            All Users ({users.length})
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
            Pending ({countPending})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('APPROVED')}
            style={{
              padding: '0.4rem 0.85rem',
              borderRadius: '9999px',
              fontSize: '0.75rem',
              fontWeight: 600,
              border: 'none',
              cursor: 'pointer',
              backgroundColor: statusFilter === 'APPROVED' ? 'var(--color-primary-600)' : '#ecfdf5',
              color: statusFilter === 'APPROVED' ? '#fff' : 'var(--color-primary-700)',
              transition: 'all 0.15s ease',
            }}
          >
            Approved ({countApproved})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('SUSPENDED')}
            style={{
              padding: '0.4rem 0.85rem',
              borderRadius: '9999px',
              fontSize: '0.75rem',
              fontWeight: 600,
              border: 'none',
              cursor: 'pointer',
              backgroundColor: statusFilter === 'SUSPENDED' ? '#dc2626' : '#fee2e2',
              color: statusFilter === 'SUSPENDED' ? '#fff' : '#b91c1c',
              transition: 'all 0.15s ease',
            }}
          >
            Suspended ({countSuspended})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('REJECTED')}
            style={{
              padding: '0.4rem 0.85rem',
              borderRadius: '9999px',
              fontSize: '0.75rem',
              fontWeight: 600,
              border: 'none',
              cursor: 'pointer',
              backgroundColor: statusFilter === 'REJECTED' ? '#4b5563' : '#f3f4f6',
              color: statusFilter === 'REJECTED' ? '#fff' : '#374151',
              transition: 'all 0.15s ease',
            }}
          >
            Rejected ({countRejected})
          </button>
        </div>

        {/* Search */}
        <SearchBar value={search} onChange={setSearch} placeholder="Search users by name, email, municipality, or role..." />

        {/* Users Table */}
        <Card padding="none" className="overflow-hidden border border-neutral-200">
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left text-xs border-collapse min-w-[720px]">
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
                  <th style={{ padding: '1rem' }}>User</th>
                  <th style={{ padding: '1rem' }}>Location</th>
                  <th style={{ padding: '1rem' }}>Role</th>
                  <th style={{ padding: '1rem' }}>Account Status</th>
                  <th style={{ padding: '1rem' }}>Moderation / Details</th>
                  <th style={{ padding: '1rem', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={6} style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-neutral-500)' }}>
                      <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-primary-600" />
                      <p style={{ margin: 0, fontWeight: 600 }}>Loading canonical registered users from database...</p>
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-neutral-400)' }}>
                      <Info className="w-8 h-8 mx-auto mb-2 text-neutral-300" />
                      <p style={{ margin: 0, fontWeight: 700, color: 'var(--color-neutral-700)' }}>No users found</p>
                      <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.75rem' }}>
                        Try adjusting your search query or filter selection.
                      </p>
                    </td>
                  </tr>
                ) : (
                  filtered.map((u) => {
                    const isSuspended = u.isSuspended || u.account_status === 'SUSPENDED';
                    const status = (u.account_status || 'PENDING').toUpperCase();

                    return (
                      <tr
                        key={u.id}
                        style={{
                          borderBottom: '1px solid var(--color-neutral-100)',
                          backgroundColor: isSuspended ? 'rgba(254, 242, 242, 0.4)' : undefined,
                        }}
                      >
                        {/* User Info */}
                        <td style={{ padding: '1rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <Avatar src={u.avatar} name={u.fullName} size="sm" />
                            <div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                                <p style={{ fontWeight: 700, color: 'var(--color-neutral-900)', margin: 0 }}>
                                  {u.fullName}
                                </p>
                                {u.isTrusted && (
                                  <span title="Verified ID">
                                    <CheckCircle2 className="w-3.5 h-3.5 text-primary-600 inline" />
                                  </span>
                                )}
                              </div>
                              <p style={{ fontSize: '0.625rem', color: 'var(--color-neutral-400)', margin: 0 }}>
                                {u.email}
                              </p>
                              {u.phone && (
                                <p style={{ fontSize: '0.625rem', color: 'var(--color-neutral-400)', margin: 0 }}>
                                  {u.phone}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Location */}
                        <td style={{ padding: '1rem', color: 'var(--color-neutral-600)' }}>
                          <div>
                            <span>{u.barangay ? `${u.barangay}, ` : ''}{u.municipality || 'N/A'}</span>
                            {u.province && (
                              <span style={{ display: 'block', fontSize: '0.65rem', color: 'var(--color-neutral-400)' }}>
                                {u.province}
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Role */}
                        <td style={{ padding: '1rem' }}>
                          <span
                            style={{
                              display: 'inline-block',
                              padding: '0.2rem 0.5rem',
                              borderRadius: '4px',
                              fontSize: '0.65rem',
                              fontWeight: 700,
                              textTransform: 'uppercase',
                              backgroundColor: u.role === 'admin' ? '#e0e7ff' : '#f3f4f6',
                              color: u.role === 'admin' ? '#3730a3' : '#374151',
                            }}
                          >
                            {u.role}
                          </span>
                        </td>

                        {/* Status */}
                        <td style={{ padding: '1rem' }}>
                          {isSuspended ? (
                            <Badge variant="danger">
                              SUSPENDED
                            </Badge>
                          ) : status === 'APPROVED' ? (
                            <Badge variant="success">
                              APPROVED
                            </Badge>
                          ) : status === 'REJECTED' ? (
                            <Badge variant="danger">
                              REJECTED
                            </Badge>
                          ) : (
                            <Badge variant="warning">
                              PENDING
                            </Badge>
                          )}
                        </td>

                        {/* Moderation Details */}
                        <td style={{ padding: '1rem' }}>
                          {isSuspended && u.suspension ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#b91c1c', fontWeight: 700 }}>
                                <Clock className="w-3 h-3" />
                                <span>
                                  {u.suspension.isPermanent
                                    ? 'Suspended permanently'
                                    : `Until: ${u.suspension.expiresAtFormatted || u.suspension.expiresAt}`}
                                </span>
                              </div>
                              <span style={{ fontSize: '0.65rem', color: 'var(--color-neutral-500)' }}>
                                Reason: {u.suspension.reason}
                              </span>
                            </div>
                          ) : status === 'PENDING' ? (
                            <span style={{ fontSize: '0.6875rem', color: '#b45309', fontWeight: 500 }}>
                              Awaiting identity/photo verification
                            </span>
                          ) : (
                            <span style={{ fontSize: '0.6875rem', color: 'var(--color-neutral-400)' }}>
                              Good standing
                            </span>
                          )}
                        </td>

                        {/* Actions */}
                        <td style={{ padding: '1rem', textAlign: 'right' }}>
                          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                            {isSuspended ? (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setUnsuspendUserTarget(u);
                                  setIsUnsuspendModalOpen(true);
                                }}
                                style={{ borderColor: 'var(--color-primary-600)', color: 'var(--color-primary-700)' }}
                              >
                                Unsuspend
                              </Button>
                            ) : (
                              <Button
                                variant="danger"
                                size="sm"
                                onClick={() => handleOpenSuspend(u)}
                                leftIcon={<Ban className="w-3.5 h-3.5" />}
                              >
                                Suspend
                              </Button>
                            )}
                          </div>
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

      {/* Suspend Confirmation Modal */}
      <Modal
        isOpen={isSuspendModalOpen}
        onClose={() => !isSubmitting && setIsSuspendModalOpen(false)}
        title="Suspend User Account"
        size="md"
      >
        {selectedUser && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Target User Card */}
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
              <Avatar src={selectedUser.avatar} name={selectedUser.fullName} size="md" />
              <div>
                <p style={{ margin: 0, fontWeight: 700, color: 'var(--color-neutral-900)' }}>
                  {selectedUser.fullName}
                </p>
                <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--color-neutral-500)' }}>
                  {selectedUser.email} &bull; ID: {selectedUser.userId || selectedUser.id}
                </p>
              </div>
            </div>

            {/* Duration Selector */}
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-neutral-700)', marginBottom: '0.5rem' }}>
                Suspension Duration <span style={{ color: '#dc2626' }}>*</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {PREDEFINED_DURATIONS.map((dur) => {
                  const isSelected = selectedDuration === dur.id;
                  return (
                    <button
                      key={dur.id}
                      type="button"
                      onClick={() => {
                        setSelectedDuration(dur.id);
                        setValidationError(null);
                      }}
                      style={{
                        padding: '0.625rem 0.5rem',
                        borderRadius: '6px',
                        fontSize: '0.75rem',
                        fontWeight: isSelected ? 700 : 500,
                        border: isSelected ? '2px solid #dc2626' : '1px solid var(--color-neutral-200)',
                        backgroundColor: isSelected ? '#fef2f2' : '#fff',
                        color: isSelected ? '#b91c1c' : 'var(--color-neutral-800)',
                        cursor: 'pointer',
                        textAlign: 'center',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      {dur.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Custom Duration Input */}
            {selectedDuration === 'custom' && (
              <div
                style={{
                  padding: '0.75rem',
                  borderRadius: '6px',
                  backgroundColor: '#fffbeb',
                  border: '1px solid #fde68a',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.5rem',
                }}
              >
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#92400e' }}>
                  Specify Number of Days
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <input
                    type="number"
                    min="1"
                    max="3650"
                    value={customDays}
                    onChange={(e) => {
                      const val = e.target.value === '' ? '' : parseInt(e.target.value, 10);
                      setCustomDays(val);
                      setValidationError(null);
                    }}
                    placeholder="e.g. 15"
                    style={{
                      padding: '0.5rem 0.75rem',
                      borderRadius: '6px',
                      border: '1px solid #d1d5db',
                      fontSize: '0.875rem',
                      width: '120px',
                      outline: 'none',
                    }}
                  />
                  <span style={{ fontSize: '0.75rem', color: '#92400e', fontWeight: 600 }}>Days</span>
                </div>
                <p style={{ margin: 0, fontSize: '0.6875rem', color: '#b45309' }}>
                  Must be a positive whole number greater than 0.
                </p>
              </div>
            )}

            {/* Reason Selector */}
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-neutral-700)', marginBottom: '0.5rem' }}>
                Suspension Reason <span style={{ color: '#dc2626' }}>*</span>
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
                {SUSPENSION_REASONS.map((reason) => (
                  <option key={reason} value={reason}>
                    {reason}
                  </option>
                ))}
              </select>
            </div>

            {/* Additional Message */}
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-neutral-700)', marginBottom: '0.5rem' }}>
                Additional Admin Message (Optional)
              </label>
              <textarea
                rows={3}
                value={adminMessage}
                onChange={(e) => setAdminMessage(e.target.value)}
                placeholder="Include specific guidance, violations noted, or instructions for the user upon notification..."
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

            {/* Validation Alert */}
            {validationError && (
              <div
                style={{
                  padding: '0.625rem 0.75rem',
                  borderRadius: '6px',
                  backgroundColor: '#fee2e2',
                  border: '1px solid #fecaca',
                  color: '#991b1b',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}
              >
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{validationError}</span>
              </div>
            )}

            {/* Warning Banner */}
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
                <strong>Enforcement & Notification:</strong> The user will be blocked from logging in on backend validation until this suspension expires. An official notification with the selected duration and reason will be dispatched to their account.
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 mt-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsSuspendModalOpen(false)}
                disabled={isSubmitting}
                className="w-full sm:w-auto justify-center"
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={handleConfirmSuspend}
                disabled={isSubmitting}
                className="w-full sm:w-auto justify-center"
                leftIcon={isSubmitting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Ban className="w-3.5 h-3.5" />}
              >
                {isSubmitting ? 'Suspending...' : 'Confirm Suspension'}
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Unsuspend Confirmation Modal */}
      <Modal
        isOpen={isUnsuspendModalOpen}
        onClose={() => !isSubmitting && setIsUnsuspendModalOpen(false)}
        title="Lift User Suspension"
        size="sm"
      >
        {unsuspendUserTarget && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <p style={{ margin: 0, fontSize: '0.8125rem', color: 'var(--color-neutral-700)' }}>
              Are you sure you want to lift the suspension for <strong>{unsuspendUserTarget.fullName}</strong> ({unsuspendUserTarget.email})?
            </p>
            <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--color-neutral-500)' }}>
              The account status will be restored to APPROVED. The user will be able to log in and participate in community listings immediately, and will receive a restoration notification.
            </p>

            <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 mt-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsUnsuspendModalOpen(false)}
                disabled={isSubmitting}
                className="w-full sm:w-auto justify-center"
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleConfirmUnsuspend}
                disabled={isSubmitting}
                className="w-full sm:w-auto justify-center"
              >
                {isSubmitting ? 'Restoring...' : 'Confirm Lift Suspension'}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </AdminLayout>
  );
}
