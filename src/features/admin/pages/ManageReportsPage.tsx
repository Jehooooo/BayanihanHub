// ============================================================
// ManageReportsPage.tsx — Complete Admin Moderation System
// ============================================================

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import AdminLayout from '@/components/layout/AdminLayout';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import SearchBar from '@/components/ui/SearchBar';
import Modal from '@/components/ui/Modal';
import Avatar from '@/components/ui/Avatar';
import toast from 'react-hot-toast';
import { getErrorMessage } from '@/utils/apiError';
import { adminService } from '@/services/admin.service';
import type { Report, ReportStatus, ReportSeverity } from '@/types';
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  RefreshCw,
  ExternalLink,
  User,
  Package,
  HandHeart,
  Clock,
  CheckCircle2,
  XCircle,
  Eye,
  AlertOctagon,
  Ban,
  Flag,
} from 'lucide-react';

export default function ManageReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    underReview: 0,
    resolved: 0,
    dismissed: 0,
    highPriority: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  // Filters & search
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PENDING' | 'UNDER_REVIEW' | 'RESOLVED' | 'DISMISSED'>('ALL');
  const [targetTypeFilter, setTargetTypeFilter] = useState<'ALL' | 'item' | 'user' | 'request'>('ALL');
  const [severityFilter, setSeverityFilter] = useState<'ALL' | 'high' | 'medium' | 'low'>('ALL');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');

  // Investigation & Details Modal
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // Action / Confirmation Modal
  const [activeActionType, setActiveActionType] = useState<
    'remove_post' | 'restore_post' | 'warn_user' | 'suspend_user' | 'remove_request' | 'dismiss_report' | null
  >(null);
  const [actionReason, setActionReason] = useState('');
  const [actionMessage, setActionMessage] = useState('');
  const [notifyUser, setNotifyUser] = useState(true);
  const [suspendDuration, setSuspendDuration] = useState('7d');
  const [isExecutingAction, setIsExecutingAction] = useState(false);

  // Fetch reports and stats
  const fetchReports = useCallback(async () => {
    setIsLoading(true);
    try {
      const [reportsData, statsData] = await Promise.all([
        adminService.getReports(),
        adminService.getReportStats().catch(() => null),
      ]);
      setReports(reportsData);

      if (statsData) {
        setStats(statsData);
      } else {
        // Fallback compute stats from reports list
        const p = reportsData.filter((r) => r.status === 'pending').length;
        const ur = reportsData.filter((r) => r.status === 'under_review').length;
        const res = reportsData.filter((r) => r.status === 'resolved').length;
        const d = reportsData.filter((r) => r.status === 'dismissed').length;
        const hp = reportsData.filter((r) => r.severity === 'high' || r.severity === 'critical').length;
        setStats({
          total: reportsData.length,
          pending: p,
          underReview: ur,
          resolved: res,
          dismissed: d,
          highPriority: hp,
        });
      }
    } catch (err: any) {
      toast.error(getErrorMessage(err, 'Failed to load moderation reports.'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  // Handle status transition (e.g. mark under review)
  const handleUpdateStatus = async (newStatus: 'pending' | 'under_review' | 'dismissed') => {
    if (!selectedReport) return;
    try {
      await adminService.updateReportStatus(selectedReport.id, newStatus);
      toast.success(`Report #${selectedReport.id} marked as ${newStatus.replace('_', ' ')}.`);
      setSelectedReport((prev) => (prev ? { ...prev, status: newStatus } : null));
      await fetchReports();
    } catch (err: any) {
      toast.error(getErrorMessage(err, 'Failed to update report status.'));
    }
  };

  // Open action confirmation dialog
  const handleOpenActionModal = (
    action: 'remove_post' | 'restore_post' | 'warn_user' | 'suspend_user' | 'remove_request' | 'dismiss_report'
  ) => {
    setActiveActionType(action);
    setActionReason(
      action === 'remove_post'
        ? 'Violation of community guidelines (inappropriate or prohibited listing).'
        : action === 'warn_user'
        ? 'Formal warning regarding community standards.'
        : action === 'suspend_user'
        ? 'Account suspension for severe or repeated infractions.'
        : action === 'remove_request'
        ? 'Community assistance request removed for guideline violations.'
        : action === 'dismiss_report'
        ? 'No violation found after administrative investigation.'
        : ''
    );
    setActionMessage('');
    setNotifyUser(true);
    setSuspendDuration('7d');
  };

  // Execute moderation action with audit logging
  const handleExecuteAction = async () => {
    if (!selectedReport || !activeActionType) return;
    if (!actionReason.trim()) {
      toast.error('Please specify a reason for this moderation action.');
      return;
    }

    setIsExecutingAction(true);
    try {
      let actionLabel = 'Moderation Action Applied';
      let messagePayload = actionMessage.trim() || undefined;

      if (activeActionType === 'remove_post') {
        actionLabel = 'Post Removed';
        messagePayload = actionReason.trim() + (actionMessage ? ` Details: ${actionMessage.trim()}` : '');
      } else if (activeActionType === 'restore_post') {
        actionLabel = 'Post Restored';
      } else if (activeActionType === 'warn_user') {
        actionLabel = 'Warning Issued';
        messagePayload = actionReason.trim() + (actionMessage ? ` — ${actionMessage.trim()}` : '');
      } else if (activeActionType === 'suspend_user') {
        actionLabel = `User Suspended (${suspendDuration})`;
        messagePayload = actionReason.trim() + (actionMessage ? ` — ${actionMessage.trim()}` : '');
      } else if (activeActionType === 'remove_request') {
        actionLabel = 'Request Removed';
        messagePayload = actionReason.trim() + (actionMessage ? ` Details: ${actionMessage.trim()}` : '');
      } else if (activeActionType === 'dismiss_report') {
        actionLabel = 'Dismissed — No Violation Found';
      }

      await adminService.resolveReport({
        reportId: selectedReport.id,
        action: actionLabel,
        message: messagePayload,
      });

      toast.success(`Action applied: ${actionLabel}`);
      setActiveActionType(null);
      setIsDetailModalOpen(false);
      setSelectedReport(null);
      await fetchReports();
    } catch (err: any) {
      toast.error(getErrorMessage(err, 'Failed to apply moderation action.'));
    } finally {
      setIsExecutingAction(false);
    }
  };

  // Filter and sort reports
  const filteredReports = useMemo(() => {
    return reports.filter((r) => {
      // 1. Search filter
      const q = search.trim().toLowerCase();
      if (q) {
        const matchesQuery =
          r.id.toLowerCase().includes(q) ||
          r.targetId.toLowerCase().includes(q) ||
          r.reason.toLowerCase().includes(q) ||
          r.description.toLowerCase().includes(q) ||
          r.reporter?.fullName?.toLowerCase().includes(q) ||
          r.reporter?.username?.toLowerCase().includes(q) ||
          r.reportedUser?.fullName?.toLowerCase().includes(q) ||
          r.reportedUser?.username?.toLowerCase().includes(q) ||
          r.targetDetails?.title?.toLowerCase().includes(q);
        if (!matchesQuery) return false;
      }

      // 2. Status filter
      if (statusFilter === 'PENDING' && r.status !== 'pending') return false;
      if (statusFilter === 'UNDER_REVIEW' && r.status !== 'under_review') return false;
      if (statusFilter === 'RESOLVED' && r.status !== 'resolved') return false;
      if (statusFilter === 'DISMISSED' && r.status !== 'dismissed') return false;

      // 3. Target Type filter
      if (targetTypeFilter !== 'ALL' && r.targetType !== targetTypeFilter) return false;

      // 4. Severity filter
      if (severityFilter !== 'ALL') {
        if (severityFilter === 'high' && r.severity !== 'high' && r.severity !== 'critical') return false;
        if (severityFilter === 'medium' && r.severity !== 'medium') return false;
        if (severityFilter === 'low' && r.severity !== 'low') return false;
      }

      return true;
    }).sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime() || 0;
      const dateB = new Date(b.createdAt).getTime() || 0;
      return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
    });
  }, [reports, search, statusFilter, targetTypeFilter, severityFilter, sortOrder]);

  const getSeverityBadge = (severity?: ReportSeverity) => {
    switch (severity) {
      case 'critical':
      case 'high':
        return <Badge variant="danger">HIGH PRIORITY</Badge>;
      case 'medium':
        return <Badge variant="warning">MEDIUM</Badge>;
      case 'low':
      default:
        return <Badge variant="default">LOW</Badge>;
    }
  };

  const getStatusBadge = (status: ReportStatus) => {
    switch (status) {
      case 'pending':
        return (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', padding: '0.2rem 0.5rem', borderRadius: '9999px', fontSize: '0.6875rem', fontWeight: 700, backgroundColor: '#fef3c7', color: '#b45309' }}>
            <Clock style={{ width: '0.75rem', height: '0.75rem' }} /> PENDING
          </span>
        );
      case 'under_review':
        return (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', padding: '0.2rem 0.5rem', borderRadius: '9999px', fontSize: '0.6875rem', fontWeight: 700, backgroundColor: '#e0e7ff', color: '#4338ca' }}>
            <Eye style={{ width: '0.75rem', height: '0.75rem' }} /> UNDER REVIEW
          </span>
        );
      case 'resolved':
        return (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', padding: '0.2rem 0.5rem', borderRadius: '9999px', fontSize: '0.6875rem', fontWeight: 700, backgroundColor: '#ecfdf5', color: '#047857' }}>
            <CheckCircle2 style={{ width: '0.75rem', height: '0.75rem' }} /> RESOLVED
          </span>
        );
      case 'dismissed':
        return (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', padding: '0.2rem 0.5rem', borderRadius: '9999px', fontSize: '0.6875rem', fontWeight: 700, backgroundColor: '#f3f4f6', color: '#4b5563' }}>
            <XCircle style={{ width: '0.75rem', height: '0.75rem' }} /> DISMISSED
          </span>
        );
      default:
        return <Badge variant="default">{status}</Badge>;
    }
  };

  return (
    <AdminLayout>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* Header Title + Stats Strip */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-neutral-900 tracking-tight m-0">
              Community Moderation &amp; Reports Center
            </h1>
            <p className="text-xs text-neutral-500 mt-1">
              Review flagged items, investigate user behavior, and apply impartial disciplinary actions.
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
            Refresh Data
          </Button>
        </div>

        {/* 5 Stats Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <Card padding="sm" style={{ backgroundColor: '#ffffff', border: '1px solid var(--color-neutral-200)', textAlign: 'center' }}>
            <span style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--color-neutral-400)', textTransform: 'uppercase' }}>Total Reports</span>
            <p style={{ margin: '0.25rem 0 0 0', fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-neutral-900)' }}>{stats.total}</p>
          </Card>

          <Card padding="sm" style={{ backgroundColor: '#fffbeb', border: '1px solid #fde68a', textAlign: 'center' }}>
            <span style={{ fontSize: '0.6875rem', fontWeight: 700, color: '#b45309', textTransform: 'uppercase' }}>Pending</span>
            <p style={{ margin: '0.25rem 0 0 0', fontSize: '1.5rem', fontWeight: 800, color: '#d97706' }}>{stats.pending}</p>
          </Card>

          <Card padding="sm" style={{ backgroundColor: '#eef2ff', border: '1px solid #c7d2fe', textAlign: 'center' }}>
            <span style={{ fontSize: '0.6875rem', fontWeight: 700, color: '#4338ca', textTransform: 'uppercase' }}>Under Review</span>
            <p style={{ margin: '0.25rem 0 0 0', fontSize: '1.5rem', fontWeight: 800, color: '#4f46e5' }}>{stats.underReview}</p>
          </Card>

          <Card padding="sm" style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', textAlign: 'center' }}>
            <span style={{ fontSize: '0.6875rem', fontWeight: 700, color: '#047857', textTransform: 'uppercase' }}>Resolved</span>
            <p style={{ margin: '0.25rem 0 0 0', fontSize: '1.5rem', fontWeight: 800, color: '#10b981' }}>{stats.resolved}</p>
          </Card>

          <Card padding="sm" style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', textAlign: 'center' }}>
            <span style={{ fontSize: '0.6875rem', fontWeight: 700, color: '#b91c1c', textTransform: 'uppercase' }}>High Priority</span>
            <p style={{ margin: '0.25rem 0 0 0', fontSize: '1.5rem', fontWeight: 800, color: '#ef4444' }}>{stats.highPriority}</p>
          </Card>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {[
            { id: 'ALL', label: `All Reports (${stats.total})` },
            { id: 'PENDING', label: `Pending (${stats.pending})` },
            { id: 'UNDER_REVIEW', label: `Under Review (${stats.underReview})` },
            { id: 'RESOLVED', label: `Resolved (${stats.resolved})` },
            { id: 'DISMISSED', label: `Dismissed (${stats.dismissed})` },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setStatusFilter(tab.id as any)}
              style={{
                padding: '0.4rem 0.85rem',
                borderRadius: '9999px',
                fontSize: '0.75rem',
                fontWeight: 700,
                border: 'none',
                cursor: 'pointer',
                backgroundColor: statusFilter === tab.id ? 'var(--color-neutral-900)' : 'var(--color-neutral-100)',
                color: statusFilter === tab.id ? '#ffffff' : 'var(--color-neutral-600)',
                transition: 'all 0.15s ease',
                whiteSpace: 'nowrap',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Filter & Search Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 items-center">
          <SearchBar
            value={search}
            onChange={setSearch}
            placeholder="Search reports by ID, reason, reporter, or target..."
          />

          <select
            value={targetTypeFilter}
            onChange={(e) => setTargetTypeFilter(e.target.value as any)}
            style={{
              padding: '0.625rem 0.75rem',
              borderRadius: '6px',
              border: '1px solid var(--color-neutral-300)',
              fontSize: '0.75rem',
              backgroundColor: '#ffffff',
              outline: 'none',
            }}
          >
            <option value="ALL">All Target Types</option>
            <option value="item">Posts / Items</option>
            <option value="user">User Accounts</option>
            <option value="request">Community Requests</option>
          </select>

          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value as any)}
            style={{
              padding: '0.625rem 0.75rem',
              borderRadius: '6px',
              border: '1px solid var(--color-neutral-300)',
              fontSize: '0.75rem',
              backgroundColor: '#ffffff',
              outline: 'none',
            }}
          >
            <option value="ALL">All Severities</option>
            <option value="high">High / Critical</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>

          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value as any)}
            style={{
              padding: '0.625rem 0.75rem',
              borderRadius: '6px',
              border: '1px solid var(--color-neutral-300)',
              fontSize: '0.75rem',
              backgroundColor: '#ffffff',
              outline: 'none',
            }}
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
          </select>
        </div>

        {/* Reports Table */}
        <Card padding="none" className="overflow-hidden border border-neutral-200">
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left text-xs border-collapse min-w-[850px]">
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
                  <th style={{ padding: '0.85rem 1rem' }}>Target Entity</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Report Reason &amp; Severity</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Reported Party</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Confidential Reporter</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Status</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Date</th>
                  <th style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={7} style={{ padding: '3.5rem', textAlign: 'center', color: 'var(--color-neutral-500)' }}>
                      <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-primary-600" />
                      <p style={{ margin: 0, fontWeight: 600 }}>Loading moderation reports...</p>
                    </td>
                  </tr>
                ) : filteredReports.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ padding: '3.5rem', textAlign: 'center', color: 'var(--color-neutral-400)' }}>
                      <ShieldCheck className="w-8 h-8 mx-auto mb-2 text-neutral-300" />
                      <p style={{ margin: 0, fontWeight: 700, color: 'var(--color-neutral-700)' }}>No moderation reports found</p>
                      <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.75rem' }}>All community flagged content is resolved.</p>
                    </td>
                  </tr>
                ) : (
                  filteredReports.map((rep) => {
                    const isPending = rep.status === 'pending';
                    const isUnderReview = rep.status === 'under_review';

                    return (
                      <tr
                        key={rep.id}
                        style={{
                          borderBottom: '1px solid var(--color-neutral-100)',
                          backgroundColor: isPending
                            ? '#fffcf2'
                            : isUnderReview
                            ? '#fbfdff'
                            : undefined,
                        }}
                      >
                        {/* Target Entity */}
                        <td style={{ padding: '0.85rem 1rem' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                              <span
                                style={{
                                  padding: '0.125rem 0.375rem',
                                  borderRadius: '4px',
                                  fontSize: '0.625rem',
                                  fontWeight: 700,
                                  textTransform: 'uppercase',
                                  backgroundColor:
                                    rep.targetType === 'item' ? '#dbeafe' : rep.targetType === 'user' ? '#f3e8ff' : '#fef3c7',
                                  color:
                                    rep.targetType === 'item' ? '#1e40af' : rep.targetType === 'user' ? '#6b21a8' : '#92400e',
                                }}
                              >
                                {rep.targetType}
                              </span>
                              {rep.targetReportsCount && rep.targetReportsCount > 1 && (
                                <span
                                  style={{
                                    padding: '0.125rem 0.35rem',
                                    borderRadius: '4px',
                                    fontSize: '0.625rem',
                                    fontWeight: 700,
                                    backgroundColor: '#fee2e2',
                                    color: '#b91c1c',
                                  }}
                                  title={`${rep.targetReportsCount} reports submitted against this target`}
                                >
                                  ⚠ {rep.targetReportsCount} Reports
                                </span>
                              )}
                            </div>
                            <span style={{ fontWeight: 700, color: 'var(--color-neutral-900)' }}>
                              {rep.targetDetails?.title || rep.targetId}
                            </span>
                          </div>
                        </td>

                        {/* Reason & Severity */}
                        <td style={{ padding: '0.85rem 1rem' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                            <span style={{ fontWeight: 700, color: '#b91c1c' }}>
                              {rep.reason.replace(/_/g, ' ')}
                            </span>
                            <div>{getSeverityBadge(rep.severity)}</div>
                          </div>
                        </td>

                        {/* Reported Party */}
                        <td style={{ padding: '0.85rem 1rem' }}>
                          {rep.reportedUser ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <Avatar src={rep.reportedUser.avatar || undefined} name={rep.reportedUser.fullName} size="xs" />
                              <div>
                                <p style={{ margin: 0, fontWeight: 700, color: 'var(--color-neutral-800)' }}>
                                  {rep.reportedUser.fullName}
                                </p>
                                <p style={{ margin: 0, fontSize: '0.6875rem', color: 'var(--color-neutral-400)' }}>
                                  @{rep.reportedUser.username}
                                </p>
                              </div>
                            </div>
                          ) : (
                            <span style={{ color: 'var(--color-neutral-400)' }}>—</span>
                          )}
                        </td>

                        {/* Confidential Reporter */}
                        <td style={{ padding: '0.85rem 1rem' }}>
                          {rep.reporter ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <Avatar src={rep.reporter.avatar || undefined} name={rep.reporter.fullName} size="xs" />
                              <div>
                                <p style={{ margin: 0, fontWeight: 600, color: 'var(--color-neutral-700)' }}>
                                  {rep.reporter.fullName}
                                </p>
                                <p style={{ margin: 0, fontSize: '0.625rem', color: '#6b7280' }}>
                                  @{rep.reporter.username}
                                </p>
                              </div>
                            </div>
                          ) : (
                            <span style={{ color: 'var(--color-neutral-400)' }}>Confidential User</span>
                          )}
                        </td>

                        {/* Status */}
                        <td style={{ padding: '0.85rem 1rem' }}>
                          {getStatusBadge(rep.status)}
                        </td>

                        {/* Date */}
                        <td style={{ padding: '0.85rem 1rem', color: 'var(--color-neutral-500)', whiteSpace: 'nowrap' }}>
                          {rep.createdAt ? new Date(rep.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Recent'}
                        </td>

                        {/* Actions */}
                        <td style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>
                          <Button
                            variant={isPending || isUnderReview ? 'primary' : 'outline'}
                            size="sm"
                            onClick={() => {
                              setSelectedReport(rep);
                              setIsDetailModalOpen(true);
                            }}
                          >
                            {isPending || isUnderReview ? 'Review & Moderate' : 'View Details'}
                          </Button>
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

      {/* ── REPORT INVESTIGATION & MODERATION MODAL ── */}
      {selectedReport && (
        <Modal
          isOpen={isDetailModalOpen}
          onClose={() => setIsDetailModalOpen(false)}
          title={`Moderation Investigation: Report #${selectedReport.id}`}
          size="lg"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Reporter Privacy Shield Banner */}
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.6rem',
                padding: '0.75rem',
                borderRadius: '6px',
                backgroundColor: '#eff6ff',
                border: '1px solid #bfdbfe',
                fontSize: '0.75rem',
                color: '#1e40af',
              }}
            >
              <ShieldCheck className="w-4 h-4 shrink-0 text-blue-600 mt-0.5" />
              <div>
                <strong>Confidential Report:</strong> Reporter identity is protected and strictly confidential.
                When taking moderation action, notifications sent to reported users will never reveal the reporter's name or details.
              </div>
            </div>

            {/* Quick Status Bar */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem', backgroundColor: 'var(--color-neutral-50)', borderRadius: '6px', border: '1px solid var(--color-neutral-200)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-neutral-700)' }}>Status:</span>
                {getStatusBadge(selectedReport.status)}
                {getSeverityBadge(selectedReport.severity)}
              </div>

              {/* Status Transition buttons */}
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {selectedReport.status === 'pending' && (
                  <Button variant="outline" size="sm" onClick={() => handleUpdateStatus('under_review')}>
                    Mark Under Review
                  </Button>
                )}
                {selectedReport.status === 'under_review' && (
                  <Button variant="ghost" size="sm" onClick={() => handleUpdateStatus('pending')}>
                    Return to Pending
                  </Button>
                )}
              </div>
            </div>

            {/* Two-Column Investigation Area */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Card 1: Target Content Investigation */}
              <div style={{ padding: '1rem', border: '1px solid var(--color-neutral-200)', borderRadius: '8px', backgroundColor: '#ffffff', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <h4 style={{ margin: 0, fontSize: '0.8125rem', fontWeight: 800, color: 'var(--color-neutral-900)' }}>
                    Target Content Preview
                  </h4>
                  <span style={{ fontSize: '0.625rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-neutral-500)' }}>
                    {selectedReport.targetType}
                  </span>
                </div>

                {/* Target Type Specific Preview */}
                {selectedReport.targetType === 'item' && selectedReport.targetDetails && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.75rem' }}>
                    {selectedReport.targetDetails.image && (
                      <img
                        src={selectedReport.targetDetails.image}
                        alt="Target post preview"
                        style={{ width: '100%', height: '140px', objectFit: 'cover', borderRadius: '6px' }}
                      />
                    )}
                    <p style={{ margin: 0, fontWeight: 800, color: 'var(--color-neutral-900)' }}>
                      {selectedReport.targetDetails.title}
                    </p>
                    <p style={{ margin: 0, color: 'var(--color-neutral-600)', lineHeight: '1.4' }}>
                      {selectedReport.targetDetails.description}
                    </p>
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.25rem' }}>
                      <Badge variant="primary">{selectedReport.targetDetails.category}</Badge>
                      <Badge variant="default">{selectedReport.targetDetails.condition}</Badge>
                      <Badge variant={selectedReport.targetDetails.status === 'active' ? 'success' : 'danger'}>
                        {selectedReport.targetDetails.status}
                      </Badge>
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                      <a
                        href={`/items/${selectedReport.targetDetails.itemId}`}
                        target="_blank"
                        rel="noreferrer"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.6875rem', fontWeight: 700, color: 'var(--color-primary-600)', textDecoration: 'none' }}
                      >
                        View Post In New Tab <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                )}

                {selectedReport.targetType === 'user' && selectedReport.reportedUser && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.75rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <Avatar src={selectedReport.reportedUser.avatar || undefined} name={selectedReport.reportedUser.fullName} size="lg" />
                      <div>
                        <h4 style={{ margin: 0, fontSize: '0.875rem', fontWeight: 800 }}>{selectedReport.reportedUser.fullName}</h4>
                        <p style={{ margin: 0, color: 'var(--color-neutral-500)' }}>@{selectedReport.reportedUser.username}</p>
                        <p style={{ margin: '0.15rem 0 0 0', color: 'var(--color-neutral-400)', fontSize: '0.6875rem' }}>{selectedReport.reportedUser.location || 'Resident'}</p>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <Badge variant="warning">★ {selectedReport.reportedUser.rating || 5.0} Rating</Badge>
                      <Badge variant={selectedReport.reportedUser.isVerified ? 'success' : 'default'}>
                        {selectedReport.reportedUser.isVerified ? 'Verified Resident' : 'Unverified'}
                      </Badge>
                    </div>

                    <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.25rem' }}>
                      <a
                        href={`/profile/${selectedReport.reportedUser.id}`}
                        target="_blank"
                        rel="noreferrer"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.6875rem', fontWeight: 700, color: 'var(--color-primary-600)', textDecoration: 'none' }}
                      >
                        View Profile <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                )}

                {selectedReport.targetType === 'request' && selectedReport.targetDetails && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.75rem' }}>
                    <p style={{ margin: 0, fontWeight: 800, color: 'var(--color-neutral-900)' }}>
                      {selectedReport.targetDetails.title}
                    </p>
                    <p style={{ margin: 0, color: 'var(--color-neutral-600)', lineHeight: '1.4' }}>
                      {selectedReport.targetDetails.description}
                    </p>
                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem' }}>
                      <Badge variant={selectedReport.targetDetails.urgency === 'critical' ? 'danger' : 'warning'}>
                        Urgency: {selectedReport.targetDetails.urgency}
                      </Badge>
                    </div>
                    <a
                      href="/requests"
                      target="_blank"
                      rel="noreferrer"
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.6875rem', fontWeight: 700, color: 'var(--color-primary-600)', textDecoration: 'none', marginTop: '0.25rem' }}
                    >
                      View Community Requests <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}
              </div>

              {/* Card 2: Report Reasons & Reporter Statement */}
              <div style={{ padding: '1rem', border: '1px solid var(--color-neutral-200)', borderRadius: '8px', backgroundColor: '#ffffff', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <h4 style={{ margin: 0, fontSize: '0.8125rem', fontWeight: 800, color: 'var(--color-neutral-900)' }}>
                  Report Violation Statement
                </h4>

                <div style={{ fontSize: '0.75rem' }}>
                  <span style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--color-neutral-500)', display: 'block' }}>Reported Reason:</span>
                  <p style={{ margin: '0.15rem 0 0.5rem 0', fontWeight: 700, color: '#b91c1c' }}>
                    {selectedReport.reason.replace(/_/g, ' ').toUpperCase()}
                  </p>

                  <span style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--color-neutral-500)', display: 'block' }}>Reporter Description:</span>
                  <div style={{ padding: '0.6rem', borderRadius: '6px', backgroundColor: 'var(--color-neutral-50)', border: '1px solid var(--color-neutral-200)', color: 'var(--color-neutral-700)', marginTop: '0.25rem', lineHeight: '1.5' }}>
                    {selectedReport.description}
                  </div>

                  <div style={{ marginTop: '0.75rem', paddingTop: '0.5rem', borderTop: '1px solid var(--color-neutral-100)', display: 'flex', justifyContent: 'space-between', color: 'var(--color-neutral-400)', fontSize: '0.6875rem' }}>
                    <span>Reporter: {selectedReport.reporter?.fullName || 'Confidential Member'}</span>
                    <span>{new Date(selectedReport.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Existing Resolution Note if Resolved */}
            {selectedReport.resolutionNote && (
              <div style={{ padding: '0.75rem', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '6px', fontSize: '0.75rem', color: '#166534' }}>
                <strong>Current Resolution:</strong> {selectedReport.resolutionNote}
              </div>
            )}

            {/* Moderation Actions Toolbar */}
            <div style={{ borderTop: '1px solid var(--color-neutral-200)', paddingTop: '1rem' }}>
              <p style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--color-neutral-800)', margin: '0 0 0.75rem 0' }}>
                Enforce Disciplinary Moderation Actions:
              </p>

              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {/* Actions for Items */}
                {selectedReport.targetType === 'item' && (
                  <>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleOpenActionModal('remove_post')}
                      leftIcon={<AlertOctagon className="w-3.5 h-3.5" />}
                    >
                      Remove Post
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenActionModal('restore_post')}
                    >
                      Restore Post
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenActionModal('warn_user')}
                    >
                      Warn Poster
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenActionModal('suspend_user')}
                    >
                      Suspend Poster
                    </Button>
                  </>
                )}

                {/* Actions for Users */}
                {selectedReport.targetType === 'user' && (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenActionModal('warn_user')}
                      leftIcon={<Flag className="w-3.5 h-3.5" />}
                    >
                      Warn User
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleOpenActionModal('suspend_user')}
                      leftIcon={<Ban className="w-3.5 h-3.5" />}
                    >
                      Suspend User
                    </Button>
                  </>
                )}

                {/* Actions for Requests */}
                {selectedReport.targetType === 'request' && (
                  <>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleOpenActionModal('remove_request')}
                      leftIcon={<AlertOctagon className="w-3.5 h-3.5" />}
                    >
                      Remove Request
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenActionModal('warn_user')}
                    >
                      Warn Requester
                    </Button>
                  </>
                )}

                {/* Dismiss Report Option */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleOpenActionModal('dismiss_report')}
                >
                  Dismiss Report (No Violation)
                </Button>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* ── DESTRUCTIVE ACTION CONFIRMATION MODAL ── */}
      {activeActionType && selectedReport && (
        <Modal
          isOpen={Boolean(activeActionType)}
          onClose={() => !isExecutingAction && setActiveActionType(null)}
          title={`Confirm Action: ${activeActionType.replace('_', ' ').toUpperCase()}`}
          size="md"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <p style={{ fontSize: '0.75rem', color: 'var(--color-neutral-600)', margin: 0, lineHeight: 1.5 }}>
              You are applying a formal administrative moderation enforcement on{' '}
              <strong>{selectedReport.targetDetails?.title || selectedReport.targetId}</strong>.
              This action will be recorded in the permanent audit logs.
            </p>

            {/* Suspension Duration selector if suspending */}
            {activeActionType === 'suspend_user' && (
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-neutral-700)', marginBottom: '0.35rem' }}>
                  Suspension Duration <span style={{ color: '#dc2626' }}>*</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: '1d', label: '1 Day' },
                    { id: '3d', label: '3 Days' },
                    { id: '7d', label: '7 Days' },
                    { id: '14d', label: '14 Days' },
                    { id: '30d', label: '30 Days' },
                    { id: '60d', label: '60 Days' },
                    { id: '90d', label: '90 Days' },
                    { id: 'permanent', label: 'Permanent' },
                  ].map((dur) => (
                    <button
                      key={dur.id}
                      type="button"
                      onClick={() => setSuspendDuration(dur.id)}
                      style={{
                        padding: '0.4rem',
                        borderRadius: '6px',
                        fontSize: '0.6875rem',
                        fontWeight: 700,
                        border: '1px solid',
                        borderColor: suspendDuration === dur.id ? '#b91c1c' : 'var(--color-neutral-200)',
                        backgroundColor: suspendDuration === dur.id ? '#fef2f2' : '#ffffff',
                        color: suspendDuration === dur.id ? '#b91c1c' : 'var(--color-neutral-700)',
                        cursor: 'pointer',
                      }}
                    >
                      {dur.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Mandatory Reason */}
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-neutral-700)', marginBottom: '0.35rem' }}>
                Moderation Reason / Violation Rule <span style={{ color: '#dc2626' }}>*</span>
              </label>
              <input
                type="text"
                value={actionReason}
                onChange={(e) => setActionReason(e.target.value)}
                placeholder="e.g. Prohibited sale item / Harassment in messages"
                style={{
                  width: '100%',
                  padding: '0.625rem 0.75rem',
                  borderRadius: '6px',
                  border: '1px solid var(--color-neutral-300)',
                  fontSize: '0.75rem',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            {/* Optional message to reported user */}
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-neutral-700)', marginBottom: '0.35rem' }}>
                Administrator Message to User (Optional)
              </label>
              <textarea
                rows={2}
                value={actionMessage}
                onChange={(e) => setActionMessage(e.target.value)}
                placeholder="Message displayed to the account holder explaining the decision..."
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

            {/* Action buttons */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.5rem' }}>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setActiveActionType(null)}
                disabled={isExecutingAction}
              >
                Cancel
              </Button>
              <Button
                variant={activeActionType === 'dismiss_report' ? 'primary' : 'danger'}
                size="sm"
                onClick={handleExecuteAction}
                disabled={isExecutingAction}
                leftIcon={isExecutingAction ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : undefined}
              >
                {isExecutingAction ? 'Executing...' : 'Confirm & Apply Action'}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </AdminLayout>
  );
}
