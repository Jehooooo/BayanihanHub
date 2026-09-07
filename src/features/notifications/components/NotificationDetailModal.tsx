import { useNavigate } from 'react-router-dom';
import {
  Bell,
  AlertTriangle,
  CheckCircle2,
  MessageSquare,
  Repeat,
  Heart,
  ExternalLink,
  Calendar,
  CheckCheck,
} from 'lucide-react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import type { Notification, NotificationType } from '@/types';

interface NotificationDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  notification: Notification | null;
}

function getNotificationMeta(type: NotificationType) {
  switch (type) {
    case 'profile_picture_approved':
      return {
        icon: <CheckCircle2 className="w-5 h-5 text-emerald-600" />,
        badgeVariant: 'success' as const,
        label: 'Profile Verification',
      };
    case 'profile_picture_rejected':
      return {
        icon: <AlertTriangle className="w-5 h-5 text-red-600" />,
        badgeVariant: 'danger' as const,
        label: 'Profile Notice',
      };
    case 'new_message':
      return {
        icon: <MessageSquare className="w-5 h-5 text-blue-600" />,
        badgeVariant: 'info' as const,
        label: 'Direct Message',
      };
    case 'exchange_request':
    case 'exchange_accepted':
    case 'exchange_completed':
      return {
        icon: <Repeat className="w-5 h-5 text-primary-600" />,
        badgeVariant: 'primary' as const,
        label: 'Community Exchange',
      };
    case 'post_removed':
    case 'account_suspended':
      return {
        icon: <AlertTriangle className="w-5 h-5 text-red-600" />,
        badgeVariant: 'danger' as const,
        label: 'Moderation Alert',
      };
    case 'request_removed':
      return {
        icon: <AlertTriangle className="w-5 h-5 text-amber-600" />,
        badgeVariant: 'warning' as const,
        label: 'Request Notice',
      };
    case 'report_resolved':
      return {
        icon: <CheckCircle2 className="w-5 h-5 text-blue-600" />,
        badgeVariant: 'info' as const,
        label: 'Report Resolved',
      };
    case 'account_unsuspended':
      return {
        icon: <CheckCircle2 className="w-5 h-5 text-emerald-600" />,
        badgeVariant: 'success' as const,
        label: 'Account Reinstated',
      };
    case 'item_favorited':
      return {
        icon: <Heart className="w-5 h-5 text-pink-600" />,
        badgeVariant: 'primary' as const,
        label: 'Favorite Notice',
      };
    default:
      return {
        icon: <Bell className="w-5 h-5 text-primary-600" />,
        badgeVariant: 'default' as const,
        label: 'Notification',
      };
  }
}

function formatDetailDate(isoString?: string): string {
  if (!isoString) return 'Recently';
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return 'Recently';
    return d.toLocaleString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  } catch {
    return 'Recently';
  }
}

export default function NotificationDetailModal({
  isOpen,
  onClose,
  notification,
}: NotificationDetailModalProps) {
  const navigate = useNavigate();

  if (!notification) return null;

  const meta = getNotificationMeta(notification.type);

  const handleActionClick = () => {
    if (notification.link) {
      onClose();
      navigate(notification.link);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Notification Details" size="md">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {/* Header row with icon, title, and badges */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
          <div
            style={{
              width: '3rem',
              height: '3rem',
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'var(--color-primary-50)',
              border: '1px solid var(--color-primary-100)',
              flexShrink: 0,
            }}
          >
            {meta.icon}
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.375rem' }}>
              <Badge variant={meta.badgeVariant} size="sm">
                {meta.label}
              </Badge>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                  fontSize: '0.6875rem',
                  color: 'var(--color-success)',
                  fontWeight: 600,
                  backgroundColor: '#f0fdf4',
                  padding: '0.125rem 0.5rem',
                  borderRadius: '9999px',
                  border: '1px solid #bbf7d0',
                }}
              >
                <CheckCheck style={{ width: '0.75rem', height: '0.75rem' }} /> Read
              </span>
            </div>

            <h3
              style={{
                fontSize: '1.125rem',
                fontWeight: 800,
                color: 'var(--color-neutral-900)',
                margin: 0,
                lineHeight: 1.35,
              }}
            >
              {notification.title}
            </h3>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.375rem',
                fontSize: '0.75rem',
                color: 'var(--color-neutral-500)',
                marginTop: '0.375rem',
              }}
            >
              <Calendar style={{ width: '0.8125rem', height: '0.8125rem' }} />
              <span>{formatDetailDate(notification.createdAt)}</span>
            </div>
          </div>
        </div>

        {/* Full Notification Content Box */}
        <div
          style={{
            backgroundColor: 'var(--color-neutral-50)',
            border: '1px solid var(--color-neutral-200)',
            borderRadius: 'var(--radius-lg)',
            padding: '1.25rem',
            fontSize: '0.9375rem',
            lineHeight: 1.65,
            color: 'var(--color-neutral-800)',
            whiteSpace: 'pre-wrap',
          }}
        >
          {notification.message}
        </div>

        {/* Modal Action Buttons */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            gap: '0.75rem',
            paddingTop: '0.5rem',
            borderTop: '1px solid var(--color-neutral-100)',
          }}
        >
          <Button
            variant="outline"
            size="md"
            onClick={onClose}
            style={{ padding: '0.55rem 1.25rem', fontWeight: 600 }}
          >
            Done Reading
          </Button>

          {notification.link && (
            <Button
              variant="primary"
              size="md"
              onClick={handleActionClick}
              rightIcon={<ExternalLink style={{ width: '1rem', height: '1rem' }} />}
              style={{ padding: '0.55rem 1.35rem', fontWeight: 700 }}
            >
              View Related Page
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
}
