import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Bell,
  LogOut,
  User,
  Settings,
  Shield,
  ChevronDown,
  LayoutDashboard,
} from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { useNotificationStore } from '@/stores/notificationStore';
import Avatar from '@/components/ui/Avatar';

export default function Header() {
  const { user, isAuthenticated, logout } = useAuthStore();
  const { unreadCount } = useNotificationStore();
  const navigate = useNavigate();
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

  const homePath = isAuthenticated ? (user?.role === 'admin' ? '/admin' : '/dashboard') : '/';

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 40,
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--color-neutral-200)',
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
      }}
    >
      <div className="page-container">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '4rem', gap: '1rem' }}>
          {/* Brand Logo */}
          <Link
            to={homePath}
            style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', flexShrink: 0, textDecoration: 'none' }}
          >
            <img src="/Logo1Revise.png" alt="Bayanihan Hub Logo" style={{ height: '2.25rem', width: 'auto', objectFit: 'contain' }} />
            <span style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--color-neutral-900)', letterSpacing: '-0.025em' }}>
              Bayanihan Hub
            </span>
          </Link>

          {/* Right Navigation & Profile */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {isAuthenticated ? (
              <>
                {/* Quick Dashboard link */}
                <Link
                  to={user?.role === 'admin' ? '/admin' : '/dashboard'}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.375rem',
                    padding: '0.375rem 0.75rem',
                    fontSize: '0.8125rem',
                    fontWeight: 600,
                    color: 'var(--color-primary-700)',
                    backgroundColor: 'var(--color-primary-50)',
                    borderRadius: 'var(--radius-md)',
                    textDecoration: 'none',
                    border: '1px solid var(--color-primary-200)',
                    transition: 'all 150ms',
                  }}
                >
                  <LayoutDashboard style={{ width: '0.9375rem', height: '0.9375rem' }} />
                  <span>Dashboard</span>
                </Link>

                {/* Notifications Link */}
                <Link
                  to="/notifications"
                  style={{ position: 'relative', padding: '0.5rem', color: 'var(--color-neutral-600)', borderRadius: 'var(--radius-md)', textDecoration: 'none', display: 'flex', alignItems: 'center' }}
                  aria-label="Notifications"
                >
                  <Bell style={{ width: '1.25rem', height: '1.25rem' }} />
                  {unreadCount > 0 && (
                    <span style={{ position: 'absolute', top: '0.25rem', right: '0.25rem', width: '1rem', height: '1rem', backgroundColor: 'var(--color-danger)', color: '#fff', fontSize: '0.625rem', fontWeight: 800, borderRadius: '9999px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </Link>

                {/* Profile Dropdown */}
                <div style={{ position: 'relative' }}>
                  <button
                    onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '0.25rem 0.625rem 0.25rem 0.375rem',
                      borderRadius: '9999px',
                      border: '1px solid var(--color-neutral-200)',
                      backgroundColor: '#fff',
                      cursor: 'pointer',
                    }}
                    aria-label="User menu"
                  >
                    <Avatar
                      src={user?.avatar}
                      name={user?.fullName ?? 'User'}
                      size="sm"
                    />
                    <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-neutral-700)', maxWidth: '100px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {user?.fullName?.split(' ')[0]}
                    </span>
                    <ChevronDown style={{ width: '0.875rem', height: '0.875rem', color: 'var(--color-neutral-400)' }} />
                  </button>

                  {profileMenuOpen && (
                    <>
                      <div
                        style={{ position: 'fixed', inset: 0, zIndex: 40 }}
                        onClick={() => setProfileMenuOpen(false)}
                      />
                      <div style={{
                        position: 'absolute',
                        right: 0,
                        top: '100%',
                        marginTop: '0.5rem',
                        width: '15rem',
                        backgroundColor: '#fff',
                        borderRadius: 'var(--radius-lg)',
                        boxShadow: 'var(--shadow-elevated)',
                        border: '1px solid var(--color-neutral-200)',
                        padding: '0.375rem 0',
                        zIndex: 50,
                      }}>
                        <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--color-neutral-100)', backgroundColor: 'rgba(248,250,249,0.5)' }}>
                          <p style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--color-neutral-900)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {user?.fullName}
                          </p>
                          <p style={{ fontSize: '0.75rem', color: 'var(--color-neutral-500)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {user?.email}
                          </p>
                        </div>
                        <div style={{ padding: '0.25rem 0' }}>
                          <Link
                            to={user?.role === 'admin' ? '/admin' : '/dashboard'}
                            style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.5rem 1rem', fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-primary-700)', textDecoration: 'none' }}
                            onClick={() => setProfileMenuOpen(false)}
                          >
                            <LayoutDashboard style={{ width: '1rem', height: '1rem', color: 'var(--color-primary-600)' }} />
                            {user?.role === 'admin' ? 'Admin Dashboard' : 'Dashboard'}
                          </Link>
                          <Link
                            to="/profile"
                            style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.5rem 1rem', fontSize: '0.75rem', fontWeight: 500, color: 'var(--color-neutral-700)', textDecoration: 'none' }}
                            onClick={() => setProfileMenuOpen(false)}
                          >
                            <User style={{ width: '1rem', height: '1rem', color: 'var(--color-neutral-500)' }} />
                            My Profile
                          </Link>
                          <Link
                            to="/settings"
                            style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.5rem 1rem', fontSize: '0.75rem', fontWeight: 500, color: 'var(--color-neutral-700)', textDecoration: 'none' }}
                            onClick={() => setProfileMenuOpen(false)}
                          >
                            <Settings style={{ width: '1rem', height: '1rem', color: 'var(--color-neutral-500)' }} />
                            Settings
                          </Link>
                          {user?.role === 'admin' && (
                            <Link
                              to="/admin"
                              style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.5rem 1rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-primary-600)', textDecoration: 'none' }}
                              onClick={() => setProfileMenuOpen(false)}
                            >
                              <Shield style={{ width: '1rem', height: '1rem', color: 'var(--color-primary-600)' }} />
                              Admin Panel
                            </Link>
                          )}
                        </div>
                        <div style={{ borderTop: '1px solid var(--color-neutral-100)', paddingTop: '0.25rem' }}>
                          <button
                            onClick={() => {
                              logout();
                              setProfileMenuOpen(false);
                              navigate('/');
                            }}
                            style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', width: '100%', padding: '0.5rem 1rem', fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-danger)', background: 'none', border: 'none', cursor: 'pointer' }}
                          >
                            <LogOut style={{ width: '1rem', height: '1rem' }} />
                            Log Out
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Link
                  to="/login"
                  style={{ padding: '0.375rem 0.875rem', fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-neutral-700)', textDecoration: 'none', borderRadius: 'var(--radius-md)' }}
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  style={{ padding: '0.375rem 0.875rem', fontSize: '0.75rem', fontWeight: 600, color: '#fff', backgroundColor: 'var(--color-primary-600)', textDecoration: 'none', borderRadius: 'var(--radius-md)' }}
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

