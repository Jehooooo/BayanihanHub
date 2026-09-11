import { useState, useEffect } from 'react';
import { Bell, Check, Trash2, AlertTriangle, CheckCircle2, MessageSquare, Repeat, Heart } from 'lucide-react';
import PageLayout from '@/components/layout/PageLayout';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { useNotificationStore } from '@/stores/notificationStore';
import { useAuthStore } from '@/stores/authStore';
import type { Notification, NotificationType } from '@/types';
import NotificationDetailModal from '../components/NotificationDetailModal';

function getNotificationIcon(type: NotificationType) {
  switch (type) {
    case 'profile_picture_approved':
      return <CheckCircle2 className="w-4 h-4 text-emerald-600" />;
    case 'profile_picture_rejected':
      return <AlertTriangle className="w-4 h-4 text-red-600" />;
    case 'new_message':
      return <MessageSquare className="w-4 h-4 text-blue-600" />;
    case 'exchange_request':
    case 'exchange_accepted':
    case 'exchange_completed':
      return <Repeat className="w-4 h-4 text-primary-600" />;
    case 'post_removed':
    case 'account_suspended':
      return <AlertTriangle className="w-4 h-4 text-red-600" />;
    case 'request_removed':
      return <AlertTriangle className="w-4 h-4 text-amber-600" />;
    case 'report_resolved':
      return <CheckCircle2 className="w-4 h-4 text-blue-600" />;
    case 'account_unsuspended':
      return <CheckCircle2 className="w-4 h-4 text-emerald-600" />;
    case 'item_favorited':
      return <Heart className="w-4 h-4 text-pink-600" />;
    default:
      return <Bell className="w-4 h-4 text-primary-600" />;
  }
}

function formatNotificationTime(isoString?: string): string {
  if (!isoString) return 'Recently';
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return 'Recently';
    return d.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  } catch {
    return 'Recently';
  }
}

export default function NotificationsPage() {
  const { user } = useAuthStore();
  const { notifications, unreadCount, fetchNotifications, markAsRead, markAllAsRead, deleteNotification } =
    useNotificationStore();

  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);

  useEffect(() => {
    if (user?.id) {
      fetchNotifications(user.id);
    }
  }, [user?.id, fetchNotifications]);

  const handleNotificationClick = (n: Notification) => {
    setSelectedNotification(n);
    if (!n.isRead) {
      markAsRead(n.id);
    }
  };

  return (
    <PageLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-2xl font-extrabold text-neutral-900 tracking-tight">Notifications</h1>
            <p className="text-xs text-neutral-500">
              Stay updated with your exchange requests, profile verifications, and community activity.
            </p>
          </div>

          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="text-xs font-semibold text-primary-600"
              onClick={markAllAsRead}
              leftIcon={<Check className="w-4 h-4" />}
            >
              Mark all as read
            </Button>
          )}
        </div>

        {notifications.length === 0 ? (
          <Card className="text-center py-12 border border-neutral-200">
            <Bell className="w-10 h-10 text-neutral-300 mx-auto mb-2" />
            <h3 className="text-base font-bold text-neutral-800">No notifications</h3>
            <p className="text-xs text-neutral-500">You're all caught up!</p>
          </Card>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
            {notifications.map((n) => (
              <Card
                key={n.id}
                onClick={() => handleNotificationClick(n)}
                style={{
                  padding: '1.125rem 1.25rem',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '1rem',
                  borderRadius: 'var(--radius-lg)',
                  border: !n.isRead ? '1px solid var(--color-primary-300)' : '1px solid var(--color-neutral-200)',
                  backgroundColor: !n.isRead ? '#f6fbf7' : '#ffffff',
                  boxShadow: !n.isRead ? '0 2px 6px rgba(46, 125, 50, 0.08)' : '0 1px 2px rgba(0,0,0,0.02)',
                  transition: 'all 150ms ease-in-out',
                  cursor: 'pointer',
                }}
                className="hover:border-primary-400 hover:shadow-md transition-all"
              >
                {/* Notification Icon */}
                <div
                  style={{
                    width: '2.625rem',
                    height: '2.625rem',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    marginTop: '0.125rem',
                  }}
                  className={
                    n.type === 'profile_picture_rejected' || n.type === 'post_removed' || n.type === 'account_suspended'
                      ? 'bg-red-100 text-red-700'
                      : n.type === 'request_removed'
                        ? 'bg-amber-100 text-amber-700'
                        : n.type === 'report_resolved'
                          ? 'bg-blue-100 text-blue-700'
                          : n.type === 'account_unsuspended'
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-primary-100 text-primary-700'
                  }
                >
                  {getNotificationIcon(n.type)}
                </div>

                {/* Content */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      {!n.isRead && (
                        <span
                          style={{
                            width: '0.5rem',
                            height: '0.5rem',
                            borderRadius: '9999px',
                            backgroundColor: 'var(--color-primary-600)',
                            display: 'inline-block',
                            flexShrink: 0,
                          }}
                        />
                      )}
                      <h4
                        style={{
                          fontSize: '0.875rem',
                          fontWeight: n.isRead ? 600 : 800,
                          color: 'var(--color-neutral-900)',
                          margin: 0,
                        }}
                      >
                        {n.title}
                      </h4>
                    </div>

                    <span style={{ fontSize: '0.6875rem', color: 'var(--color-neutral-400)', fontWeight: 500, flexShrink: 0 }}>
                      {formatNotificationTime(n.createdAt)}
                    </span>
                  </div>

                  <p
                    style={{
                      fontSize: '0.8125rem',
                      color: n.isRead ? 'var(--color-neutral-500)' : 'var(--color-neutral-700)',
                      margin: '0.375rem 0 0 0',
                      lineHeight: '1.55',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                    }}
                  >
                    {n.message}
                  </p>

                  <span
                    style={{
                      display: 'inline-block',
                      marginTop: '0.5rem',
                      fontSize: '0.6875rem',
                      fontWeight: 600,
                      color: 'var(--color-primary-700)',
                    }}
                  >
                    Click to read full notification →
                  </span>
                </div>

                {/* Actions */}
                <div
                  style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', flexShrink: 0, marginLeft: '0.5rem' }}
                  onClick={(e) => e.stopPropagation()}
                >
                  {!n.isRead && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        markAsRead(n.id);
                      }}
                      style={{
                        padding: '0.45rem',
                        color: 'var(--color-primary-600)',
                        backgroundColor: 'transparent',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'background-color 150ms',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--color-primary-100)')}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                      title="Mark as read"
                      aria-label="Mark as read"
                    >
                      <Check style={{ width: '1.05rem', height: '1.05rem' }} />
                    </button>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteNotification(n.id);
                    }}
                    style={{
                      padding: '0.45rem',
                      color: 'var(--color-neutral-400)',
                      backgroundColor: 'transparent',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 150ms',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#fee2e2';
                      e.currentTarget.style.color = '#dc2626';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                      e.currentTarget.style.color = 'var(--color-neutral-400)';
                    }}
                    title="Delete"
                    aria-label="Delete notification"
                  >
                    <Trash2 style={{ width: '1.05rem', height: '1.05rem' }} />
                  </button>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Modal for Full Notification Contents */}
        <NotificationDetailModal
          isOpen={Boolean(selectedNotification)}
          onClose={() => setSelectedNotification(null)}
          notification={selectedNotification}
        />
      </div>
    </PageLayout>
  );
}
