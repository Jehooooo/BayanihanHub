// ============================================================
// AdminDashboardPage.tsx — Integrated Live Moderation Stats
// ============================================================

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AdminLayout from '@/components/layout/AdminLayout';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { useProfilePictureStore } from '@/stores/profilePictureStore';
import { useIdentityVerificationStore } from '@/stores/identityVerificationStore';
import { adminService } from '@/services/admin.service';
import { ShieldAlert, AlertTriangle, ArrowRight, CheckCircle2 } from 'lucide-react';
import BetaNoticeModal from '@/components/common/BetaNoticeModal';
import SEO from '@/components/common/SEO';

export default function AdminDashboardPage() {
  const { getPendingCount: getPendingPhotoCount } = useProfilePictureStore();
  const { getPendingCount: getPendingVerifCount } = useIdentityVerificationStore();
  const pendingApprovals = getPendingPhotoCount() + getPendingVerifCount();

  const [systemStats, setSystemStats] = useState({
    totalUsers: 0,
    totalPosts: 0,
    activeRequests: 0,
    totalExchanges: 0,
    completedExchanges: 0,
    pendingVerifications: 0,
  });

  const [reportStats, setReportStats] = useState({
    total: 0,
    pending: 0,
    underReview: 0,
    resolved: 0,
    dismissed: 0,
    highPriority: 0,
  });

  useEffect(() => {
    adminService
      .getSystemStats()
      .then((data) => {
        if (data) setSystemStats(data);
      })
      .catch(() => {
        // keep fallback 0s
      });

    adminService
      .getReportStats()
      .then((data) => {
        if (data) setReportStats(data);
      })
      .catch(() => {
        // keep fallback 0s
      });
  }, []);

  const hasUrgentReports = reportStats.pending > 0 || reportStats.highPriority > 0;

  return (
    <AdminLayout>
      <SEO title="Admin Dashboard" noindex={true} />
      <BetaNoticeModal />
      <div style={{ maxWidth: '72rem', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--color-neutral-900)', margin: 0 }}>System Overview</h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--color-neutral-500)', margin: '0.25rem 0 0 0' }}>Bayanihan Hub live operational community stats, reports, and moderation queue.</p>
        </div>

        {/* Urgent Reports Alert Banner if pending or high-priority reports exist */}
        {hasUrgentReports && (
          <div
            style={{
              padding: '1rem 1.25rem',
              borderRadius: '8px',
              backgroundColor: '#fffbeb',
              border: '1px solid #fde68a',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '1rem',
              flexWrap: 'wrap',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <ShieldAlert style={{ width: '1.5rem', height: '1.5rem', color: '#d97706', flexShrink: 0 }} />
              <div>
                <h4 style={{ margin: 0, fontSize: '0.875rem', fontWeight: 800, color: '#92400e' }}>
                  Action Required: Moderation Reports Awaiting Review
                </h4>
                <p style={{ margin: '0.15rem 0 0 0', fontSize: '0.75rem', color: '#b45309' }}>
                  There are {reportStats.pending} pending reports ({reportStats.highPriority} high priority) flagged by community residents.
                </p>
              </div>
            </div>

            <Link to="/admin/reports" style={{ textDecoration: 'none' }}>
              <Button variant="primary" size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                Review Reports Queue
              </Button>
            </Link>
          </div>
        )}

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
          <Card padding="sm" style={{ backgroundColor: '#fff', border: '1px solid var(--color-neutral-200)', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <p style={{ fontSize: '0.75rem', color: 'var(--color-neutral-400)', fontWeight: 700, margin: 0 }}>Total Users</p>
            <p style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-neutral-900)', margin: '0.25rem 0 0 0' }}>{systemStats.totalUsers}</p>
          </Card>

          <Card padding="sm" style={{ backgroundColor: '#fff', border: '1px solid var(--color-neutral-200)', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <p style={{ fontSize: '0.75rem', color: 'var(--color-neutral-400)', fontWeight: 700, margin: 0 }}>Total Posts</p>
            <p style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-neutral-900)', margin: '0.25rem 0 0 0' }}>{systemStats.totalPosts}</p>
          </Card>

          <Card padding="sm" style={{ backgroundColor: '#fff', border: '1px solid var(--color-neutral-200)', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <p style={{ fontSize: '0.75rem', color: 'var(--color-neutral-400)', fontWeight: 700, margin: 0 }}>Active Requests</p>
            <p style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-neutral-900)', margin: '0.25rem 0 0 0' }}>{systemStats.activeRequests}</p>
          </Card>

          <Link to="/admin/approvals" style={{ textDecoration: 'none' }}>
            <Card padding="sm" style={{ backgroundColor: '#fffbeb', border: '1px solid #fde68a', display: 'flex', flexDirection: 'column', justifyContent: 'center', cursor: 'pointer', transition: 'transform 120ms ease-in-out' }}>
              <p style={{ fontSize: '0.75rem', color: '#92400e', fontWeight: 700, margin: 0 }}>Pending Approvals</p>
              <p style={{ fontSize: '1.5rem', fontWeight: 800, color: '#d97706', margin: '0.25rem 0 0 0' }}>{pendingApprovals + systemStats.pendingVerifications}</p>
            </Card>
          </Link>

          <Card padding="sm" style={{ backgroundColor: '#fff', border: '1px solid var(--color-neutral-200)', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <p style={{ fontSize: '0.75rem', color: 'var(--color-neutral-400)', fontWeight: 700, margin: 0 }}>Completed Exchanges</p>
            <p style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-primary-600)', margin: '0.25rem 0 0 0' }}>{systemStats.completedExchanges}</p>
          </Card>
        </div>

        {/* Reports & Moderation Dashboard Card */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <Card style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '1.5rem', border: '1px solid var(--color-neutral-200)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <h3 style={{ fontWeight: 800, color: 'var(--color-neutral-900)', fontSize: '1.05rem', margin: 0 }}>
                  Reports &amp; Moderation
                </h3>
                <p style={{ margin: '0.15rem 0 0 0', fontSize: '0.75rem', color: 'var(--color-neutral-500)' }}>
                  Live moderation status and disciplinary queue
                </p>
              </div>

              <Link to="/admin/reports" style={{ textDecoration: 'none' }}>
                <Button variant="outline" size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                  Review Reports
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-2">
              <div style={{ padding: '0.75rem', backgroundColor: '#fffbeb', borderRadius: '6px', border: '1px solid #fde68a', textAlign: 'center' }}>
                <span style={{ fontSize: '0.6875rem', fontWeight: 700, color: '#92400e', display: 'block' }}>Pending</span>
                <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#d97706' }}>{reportStats.pending}</span>
              </div>

              <div style={{ padding: '0.75rem', backgroundColor: '#eef2ff', borderRadius: '6px', border: '1px solid #c7d2fe', textAlign: 'center' }}>
                <span style={{ fontSize: '0.6875rem', fontWeight: 700, color: '#4338ca', display: 'block' }}>Under Review</span>
                <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#4f46e5' }}>{reportStats.underReview}</span>
              </div>

              <div style={{ padding: '0.75rem', backgroundColor: '#f0fdf4', borderRadius: '6px', border: '1px solid #bbf7d0', textAlign: 'center' }}>
                <span style={{ fontSize: '0.6875rem', fontWeight: 700, color: '#047857', display: 'block' }}>Resolved</span>
                <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#10b981' }}>{reportStats.resolved}</span>
              </div>

              <div style={{ padding: '0.75rem', backgroundColor: '#fef2f2', borderRadius: '6px', border: '1px solid #fecaca', textAlign: 'center' }}>
                <span style={{ fontSize: '0.6875rem', fontWeight: 700, color: '#b91c1c', display: 'block' }}>High Priority</span>
                <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ef4444' }}>{reportStats.highPriority}</span>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.5rem', borderTop: '1px solid var(--color-neutral-100)', fontSize: '0.75rem' }}>
              <span style={{ color: 'var(--color-neutral-500)' }}>
                {reportStats.dismissed} dismissed reports archived
              </span>
              <Link to="/admin/reports" style={{ color: 'var(--color-primary-600)', fontWeight: 700, textDecoration: 'none' }}>
                Open Full Moderation Console &rarr;
              </Link>
            </div>
          </Card>

          {/* Recent Activity */}
          <Card style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '1.5rem', border: '1px solid var(--color-neutral-200)' }}>
            <h3 style={{ fontWeight: 800, color: 'var(--color-neutral-900)', fontSize: '1.05rem', margin: 0 }}>Recent Moderation &amp; Activity</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.75rem' }}>
              <div style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--color-neutral-50)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--color-neutral-700)' }}>Moderation report resolved by administrator</span>
                <span style={{ color: 'var(--color-neutral-400)', fontSize: '0.625rem' }}>Today</span>
              </div>
              <div style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--color-neutral-50)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--color-neutral-700)' }}>User identity verification approved: Carlo M.</span>
                <span style={{ color: 'var(--color-neutral-400)', fontSize: '0.625rem' }}>1 hour ago</span>
              </div>
              <div style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--color-neutral-50)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--color-neutral-700)' }}>Exchange marked completed (#exc-3)</span>
                <span style={{ color: 'var(--color-neutral-400)', fontSize: '0.625rem' }}>2 hours ago</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}
