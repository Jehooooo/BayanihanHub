import { type ReactNode } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Package,
  HandHeart,
  AlertOctagon,
  Star,
  Settings,
  ArrowLeft,
  LogOut,
  FolderTree,
} from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';

interface AdminLayoutProps {
  children: ReactNode;
}

const adminNavItems = [
  { to: '/admin', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/admin/users', icon: Users, label: 'Users' },
  { to: '/admin/posts', icon: Package, label: 'Posts' },
  { to: '/admin/requests', icon: HandHeart, label: 'Requests' },
  { to: '/admin/reports', icon: AlertOctagon, label: 'Reports' },
  { to: '/admin/categories', icon: FolderTree, label: 'Categories' },
  { to: '/rate', icon: Star, label: 'Ratings' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

export default function AdminLayout({ children }: AdminLayoutProps) {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  return (
    <div style={{ minHeight: '100vh', display: 'flex', backgroundColor: '#f1f5f3' }}>
      {/* Admin Sidebar */}
      <aside
        style={{
          width: '16rem',
          backgroundColor: '#0f172a',
          color: '#fff',
          display: 'flex',
          flexDirection: 'column',
          flexShrink: 0,
          position: 'sticky',
          top: 0,
          height: '100vh',
          borderRight: '1px solid #1e293b',
        }}
      >
        <div style={{ padding: '1.25rem', borderBottom: '1px solid #1e293b', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', textDecoration: 'none' }}>
            <img src="/Logo1Revise.png" alt="Bayanihan Hub Logo" style={{ height: '2rem', width: 'auto', objectFit: 'contain' }} />
            <div>
              <span style={{ fontWeight: 700, fontSize: '0.875rem', color: '#fff', display: 'block', margin: 0 }}>Bayanihan Hub</span>
              <span style={{ fontSize: '0.625rem', color: 'var(--color-primary-400)', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', display: 'block' }}>Admin Panel</span>
            </div>
          </Link>
        </div>

        <nav style={{ flex: 1, padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.25rem', overflowY: 'auto' }}>
          {adminNavItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.625rem 0.875rem',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.8125rem',
                fontWeight: isActive ? 700 : 600,
                textDecoration: 'none',
                backgroundColor: isActive ? 'var(--color-primary-600)' : 'transparent',
                color: isActive ? '#ffffff' : '#94a3b8',
                transition: 'all 150ms ease-in-out',
              })}
            >
              <item.icon style={{ width: '1rem', height: '1rem', flexShrink: 0 }} />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div style={{ padding: '1rem', borderTop: '1px solid #1e293b', display: 'flex', flexDirection: 'column', gap: '0.5rem', flexShrink: 0 }}>
          <Link
            to="/dashboard"
            style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-md)', fontSize: '0.75rem', color: '#94a3b8', textDecoration: 'none', fontWeight: 500 }}
          >
            <ArrowLeft style={{ width: '1rem', height: '1rem' }} />
            Back to Main App
          </Link>
          <button
            onClick={() => {
              logout();
              navigate('/login');
            }}
            style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', width: '100%', padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-md)', fontSize: '0.75rem', color: '#f87171', backgroundColor: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left', fontWeight: 600 }}
          >
            <LogOut style={{ width: '1rem', height: '1rem' }} />
            Logout ({user?.fullName?.split(' ')[0]})
          </button>
        </div>
      </aside>

      {/* Main Admin Content */}
      <main style={{ flex: 1, minWidth: 0, padding: '2rem', overflowY: 'auto' }}>
        {children}
      </main>
    </div>
  );
}

