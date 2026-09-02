import { Link } from 'react-router-dom';
import AdminLayout from '@/components/layout/AdminLayout';
import Card from '@/components/ui/Card';
import { mockAdminStats } from '@/data/mockData';
import { useProfilePictureStore } from '@/stores/profilePictureStore';

export default function AdminDashboardPage() {
  const { getPendingCount } = useProfilePictureStore();
  const pendingApprovals = getPendingCount();

  return (
    <AdminLayout>
      <div style={{ maxWidth: '72rem', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--color-neutral-900)', margin: 0 }}>System Overview</h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--color-neutral-500)', margin: '0.25rem 0 0 0' }}>Bayanihan Hub live operational community stats and reports.</p>
        </div>

        {/* Quick Stats Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '1rem' }}>
          <Card padding="sm" style={{ backgroundColor: '#fff', border: '1px solid var(--color-neutral-200)', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <p style={{ fontSize: '0.75rem', color: 'var(--color-neutral-400)', fontWeight: 700, margin: 0 }}>Total Users</p>
            <p style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-neutral-900)', margin: '0.25rem 0 0 0' }}>{mockAdminStats.totalUsers}</p>
          </Card>

          <Card padding="sm" style={{ backgroundColor: '#fff', border: '1px solid var(--color-neutral-200)', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <p style={{ fontSize: '0.75rem', color: 'var(--color-neutral-400)', fontWeight: 700, margin: 0 }}>Total Posts</p>
            <p style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-neutral-900)', margin: '0.25rem 0 0 0' }}>{mockAdminStats.totalPosts}</p>
          </Card>

          <Card padding="sm" style={{ backgroundColor: '#fff', border: '1px solid var(--color-neutral-200)', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <p style={{ fontSize: '0.75rem', color: 'var(--color-neutral-400)', fontWeight: 700, margin: 0 }}>Active Requests</p>
            <p style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-neutral-900)', margin: '0.25rem 0 0 0' }}>{mockAdminStats.totalRequests}</p>
          </Card>

          <Link to="/admin/approvals" style={{ textDecoration: 'none' }}>
            <Card padding="sm" style={{ backgroundColor: '#fffbeb', border: '1px solid #fde68a', display: 'flex', flexDirection: 'column', justifyContent: 'center', cursor: 'pointer', transition: 'transform 120ms ease-in-out' }}>
              <p style={{ fontSize: '0.75rem', color: '#92400e', fontWeight: 700, margin: 0 }}>Pending Approvals</p>
              <p style={{ fontSize: '1.5rem', fontWeight: 800, color: '#d97706', margin: '0.25rem 0 0 0' }}>{pendingApprovals}</p>
            </Card>
          </Link>

          <Card padding="sm" style={{ backgroundColor: '#fff', border: '1px solid var(--color-neutral-200)', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <p style={{ fontSize: '0.75rem', color: 'var(--color-neutral-400)', fontWeight: 700, margin: 0 }}>Completed Exchanges</p>
            <p style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-primary-600)', margin: '0.25rem 0 0 0' }}>{mockAdminStats.completedExchanges}</p>
          </Card>
        </div>

        {/* Reports & Quick Actions Block */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem' }}>
          <Card style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '1.5rem' }}>
            <h3 style={{ fontWeight: 700, color: 'var(--color-neutral-900)', fontSize: '1rem', margin: 0 }}>Reports & Moderation Summary</h3>
            <div style={{ display: 'flex', flexDirection: 'column', fontSize: '0.75rem' }}>
              <div style={{ padding: '0.75rem 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--color-neutral-100)' }}>
                <span>Reported Posts</span>
                <span style={{ fontWeight: 700, color: 'var(--color-neutral-900)' }}>23</span>
              </div>
              <div style={{ padding: '0.75rem 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--color-neutral-100)' }}>
                <span>Reported Users</span>
                <span style={{ fontWeight: 700, color: 'var(--color-neutral-900)' }}>8</span>
              </div>
              <div style={{ padding: '0.75rem 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span>Pending Post Approvals</span>
                <span style={{ fontWeight: 700, color: '#d97706' }}>15</span>
              </div>
            </div>
          </Card>

          {/* Recent Activity */}
          <Card style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '1.5rem' }}>
            <h3 style={{ fontWeight: 700, color: 'var(--color-neutral-900)', fontSize: '1rem', margin: 0 }}>Recent Community Activity</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.75rem' }}>
              <div style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--color-neutral-50)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--color-neutral-700)' }}>User Maria S. reported a post</span>
                <span style={{ color: 'var(--color-neutral-400)', fontSize: '0.625rem' }}>10 min ago</span>
              </div>
              <div style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--color-neutral-50)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--color-neutral-700)' }}>New user registered: Carlo M.</span>
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

