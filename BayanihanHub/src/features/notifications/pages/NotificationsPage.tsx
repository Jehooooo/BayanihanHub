import { useEffect } from 'react';
import { Bell, Check, Trash2, MessageSquare, Heart, RefreshCw, AlertCircle } from 'lucide-react';
import PageLayout from '@/components/layout/PageLayout';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { useNotificationStore } from '@/stores/notificationStore';
import { useAuthStore } from '@/stores/authStore';

export default function NotificationsPage() {
  const { user } = useAuthStore();
  const { notifications, unreadCount, fetchNotifications, markAsRead, markAllAsRead, deleteNotification } =
    useNotificationStore();

  useEffect(() => {
    fetchNotifications(user?.id ?? 'user-1');
  }, [user]);

  return (
    <PageLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-2xl font-extrabold text-neutral-900 tracking-tight">Notifications</h1>
            <p className="text-xs text-neutral-500">
              Stay updated with your exchange requests, messages, and community activity.
            </p>
          </div>

          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" className="text-xs font-semibold text-primary-600" onClick={markAllAsRead} leftIcon={<Check className="w-4 h-4" />}>
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
          <div className="space-y-3">
            {notifications.map((n) => (
              <Card
                key={n.id}
                padding="sm"
                className={`flex items-start gap-4 transition-colors border border-neutral-200 ${
                  !n.isRead ? 'bg-primary-50/40 border-primary-200/80 shadow-sm' : 'bg-white'
                }`}
              >
                <div className="w-9 h-9 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                  <Bell className="w-4 h-4" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-neutral-900">{n.title}</h4>
                    <span className="text-[10px] text-neutral-400 font-medium">Recently</span>
                  </div>
                  <p className="text-xs text-neutral-600 mt-0.5 leading-relaxed">{n.message}</p>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  {!n.isRead && (
                    <button
                      onClick={() => markAsRead(n.id)}
                      className="p-1.5 text-primary-600 hover:bg-primary-100 rounded cursor-pointer transition-colors"
                      title="Mark as read"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={() => deleteNotification(n.id)}
                    className="p-1.5 text-neutral-400 hover:text-danger hover:bg-red-50 rounded cursor-pointer transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </PageLayout>
  );
}
