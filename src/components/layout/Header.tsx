import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Bell,
  LogOut,
  User,
  Settings,
  Shield,
  ChevronDown,
} from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { useNotificationStore } from '@/stores/notificationStore';
import Avatar from '@/components/ui/Avatar';
import NotificationDetailModal from '@/features/notifications/components/NotificationDetailModal';
import type { Notification } from '@/types';

interface HeaderProps {
  fullWidth?: boolean;
}

export default function Header({ fullWidth = false }: HeaderProps) {
  const { user, isAuthenticated, logout } = useAuthStore();
  const { notifications, unreadCount, fetchNotifications, markAsRead, markAllAsRead } = useNotificationStore();
  const navigate = useNavigate();
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [notifMenuOpen, setNotifMenuOpen] = useState(false);
  const [selectedHeaderNotif, setSelectedHeaderNotif] = useState<Notification | null>(null);

  useEffect(() => {
    if (isAuthenticated && user?.id) {
      fetchNotifications(user.id);
    }
  }, [isAuthenticated, user?.id, fetchNotifications]);

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
      <div
        className={fullWidth ? 'w-full px-3.5 sm:px-6' : 'page-container'}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '4rem', gap: '0.75rem' }}>
          {/* Brand Logo */}
          <Link
            to={homePath}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0, textDecoration: 'none' }}
          >
            <img src="/Logo1Revise.png" alt="Bayanihan Hub Logo" style={{ height: '2.25rem', width: 'auto', objectFit: 'contain' }} />
            <span className="text-base sm:text-lg font-extrabold text-neutral-900 tracking-tight">
              Bayanihan Hub
            </span>
          </Link>

          {/* Right Navigation & Profile */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {isAuthenticated ? (
              <>
                {/* Notifications Dropdown */}
                <div style={{ position: 'relative' }}>
                  <button
                    type="button"
                    onClick={() => {
                      setNotifMenuOpen(!notifMenuOpen);
                      setProfileMenuOpen(false);
                    }}
                    style={{
                      position: 'relative',
                      padding: '0.5rem',
                      color: notifMenuOpen ? 'var(--color-primary-700)' : 'var(--color-neutral-600)',
                      backgroundColor: notifMenuOpen ? 'var(--color-primary-50)' : 'transparent',
                      border: 'none',
                      borderRadius: 'var(--radius-md)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 150ms',
                    }}
                    aria-label="Notifications"
                    title="Notifications"
                  >
                    <Bell style={{ width: '1.25rem', height: '1.25rem' }} />
                    {unreadCount > 0 && (
                      <span
                        style={{
                          position: 'absolute',
                          top: '0.25rem',
                          right: '0.25rem',
                          width: '1rem',
                          height: '1rem',
                          backgroundColor: 'var(--color-danger)',
                          color: '#fff',
                          fontSize: '0.625rem',
                          fontWeight: 800,
                          borderRadius: '9999px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </button>

                  {notifMenuOpen && (
                    <>
                      <div
                        style={{ position: 'fixed', inset: 0, zIndex: 40 }}
                        onClick={() => setNotifMenuOpen(false)}
                      />
                      <div
                        style={{
                          position: 'absolute',
                          right: 0,
                          top: '100%',
                          marginTop: '0.5rem',
                          width: '22rem',
                          maxWidth: 'calc(100vw - 2rem)',
                          backgroundColor: '#fff',
                          borderRadius: 'var(--radius-lg)',
                          boxShadow: 'var(--shadow-elevated)',
                          border: '1px solid var(--color-neutral-200)',
                          overflow: 'hidden',
                          zIndex: 50,
                          display: 'flex',
                          flexDirection: 'column',
                        }}
                      >
                        {/* Header */}
                        <div
                          style={{
                            padding: '0.75rem 1rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            borderBottom: '1px solid var(--color-neutral-100)',
                            backgroundColor: 'rgba(248,250,249,0.75)',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span style={{ fontSize: '0.875rem', fontWeight: 800, color: 'var(--color-neutral-900)' }}>
                              Notifications
                            </span>
                            {unreadCount > 0 && (
                              <span
                                style={{
                                  fontSize: '0.6875rem',
                                  fontWeight: 700,
                                  backgroundColor: 'var(--color-primary-100)',
                                  color: 'var(--color-primary-800)',
                                  padding: '0.125rem 0.375rem',
                                  borderRadius: '9999px',
                                }}
                              >
                                {unreadCount} new
                              </span>
                            )}
                          </div>
                          {unreadCount > 0 && (
                            <button
                              type="button"
                              onClick={() => markAllAsRead()}
                              style={{
                                background: 'none',
                                border: 'none',
                                fontSize: '0.75rem',
                                fontWeight: 600,
                                color: 'var(--color-primary-700)',
                                cursor: 'pointer',
                                padding: '0.125rem 0.25rem',
                              }}
                            >
                              Mark all read
                            </button>
                          )}
                        </div>

                        {/* Notifications List Preview */}
                        <div style={{ maxHeight: '20rem', overflowY: 'auto' }}>
                          {notifications.length === 0 ? (
                            <div style={{ padding: '2rem 1rem', textAlign: 'center', color: 'var(--color-neutral-500)' }}>
                              <Bell style={{ width: '2rem', height: '2rem', margin: '0 auto 0.5rem', color: 'var(--color-neutral-300)' }} />
                              <p style={{ fontSize: '0.8125rem', fontWeight: 600, margin: 0 }}>No notifications</p>
                              <p style={{ fontSize: '0.75rem', margin: '0.25rem 0 0', color: 'var(--color-neutral-400)' }}>You're all caught up</p>
                            </div>
                          ) : (
                            notifications.slice(0, 5).map((n) => (
                              <div
                                key={n.id}
                                onClick={() => {
                                  setSelectedHeaderNotif(n);
                                  setNotifMenuOpen(false);
                                  if (!n.isRead) {
                                    markAsRead(n.id);
                                  }
                                }}
                                style={{
                                  padding: '0.75rem 1rem',
                                  display: 'flex',
                                  alignItems: 'flex-start',
                                  gap: '0.75rem',
                                  borderBottom: '1px solid var(--color-neutral-100)',
                                  backgroundColor: !n.isRead ? '#f8fcf9' : '#fff',
                                  cursor: 'pointer',
                                  transition: 'background-color 150ms',
                                }}
                                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--color-neutral-50)')}
                                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = !n.isRead ? '#f8fcf9' : '#fff')}
                              >
                                {!n.isRead && (
                                  <span
                                    style={{
                                      width: '0.45rem',
                                      height: '0.45rem',
                                      borderRadius: '9999px',
                                      backgroundColor: 'var(--color-primary-600)',
                                      marginTop: '0.35rem',
                                      flexShrink: 0,
                                    }}
                                  />
                                )}
                                <div style={{ flex: 1, minWidth: 0 }}>
                                  <p style={{ fontSize: '0.8125rem', fontWeight: n.isRead ? 600 : 700, color: 'var(--color-neutral-900)', margin: 0, lineHeight: 1.3 }}>
                                    {n.title}
                                  </p>
                                  <p style={{ fontSize: '0.75rem', color: 'var(--color-neutral-500)', margin: '0.25rem 0 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                    {n.message}
                                  </p>
                                </div>
                              </div>
                            ))
                          )}
                        </div>

                        {/* Footer Link to Notifications Page */}
                        <div style={{ padding: '0.625rem', borderTop: '1px solid var(--color-neutral-100)', backgroundColor: '#fafbfc', textAlign: 'center' }}>
                          <Link
                            to="/notifications"
                            onClick={() => setNotifMenuOpen(false)}
                            style={{
                              fontSize: '0.8125rem',
                              fontWeight: 700,
                              color: 'var(--color-primary-700)',
                              textDecoration: 'none',
                              display: 'block',
                              padding: '0.25rem',
                            }}
                          >
                            View all in Notifications →
                          </Link>
                        </div>
                      </div>
                    </>
                  )}
                </div>

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

      {/* Modal for Full Notification Contents from Header */}
      <NotificationDetailModal
        isOpen={Boolean(selectedHeaderNotif)}
        onClose={() => setSelectedHeaderNotif(null)}
        notification={selectedHeaderNotif}
      />
    </header>
  );
}

