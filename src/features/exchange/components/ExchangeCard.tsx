import { CheckCircle2 } from 'lucide-react';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Avatar from '@/components/ui/Avatar';
import type { Exchange, ExchangeStatus } from '@/types';

interface ExchangeCardProps {
  exchange: Exchange;
  currentUserId: string;
  onStatusUpdate: (id: string, status: ExchangeStatus) => void;
}

const statusBadges: Record<ExchangeStatus, { label: string; variant: any }> = {
  pending: { label: 'Pending Response', variant: 'warning' },
  accepted: { label: 'Accepted', variant: 'info' },
  meeting_scheduled: { label: 'Meeting Scheduled', variant: 'primary' },
  completed: { label: 'Completed', variant: 'success' },
  rejected: { label: 'Declined', variant: 'danger' },
  cancelled: { label: 'Cancelled', variant: 'default' },
};

export default function ExchangeCard({ exchange, currentUserId, onStatusUpdate }: ExchangeCardProps) {
  const isOfferer = exchange.offererId === currentUserId;
  const partner = isOfferer ? exchange.receiver : exchange.offerer;

  return (
    <Card style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', padding: '1.5rem' }}>
      {/* Header: Partner Info & Status Badge */}
      <div style={{ display: 'flex', alignItems: 'center', justifyBetween: 'space-between', justifyContent: 'space-between', paddingBottom: '0.75rem', borderBottom: '1px solid var(--color-neutral-100)' }}>
        {partner && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Avatar src={partner.avatar} name={partner.fullName} size="sm" />
            <div>
              <p style={{ fontSize: '0.6875rem', color: 'var(--color-neutral-400)', fontWeight: 500, margin: 0 }}>Exchange with</p>
              <h4 style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--color-neutral-900)', margin: 0 }}>{partner.fullName}</h4>
            </div>
          </div>
        )}

        <Badge variant={statusBadges[exchange.status].variant}>
          {statusBadges[exchange.status].label}
        </Badge>
      </div>

      {/* Item Swap Comparison Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', padding: '1rem', borderRadius: 'var(--radius-lg)', backgroundColor: 'var(--color-neutral-50)', border: '1px solid var(--color-neutral-200)' }}>
        {/* Offered Item */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          <span style={{ fontSize: '0.625rem', fontWeight: 800, color: 'var(--color-primary-700)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>You Offer</span>
          <div style={{ fontWeight: 700, color: 'var(--color-neutral-900)', fontSize: '0.875rem' }}>{exchange.offeredItem?.title || 'Offered Item'}</div>
          <span style={{ fontSize: '0.75rem', color: 'var(--color-neutral-500)' }}>{exchange.offeredItem?.condition}</span>
        </div>

        {/* Requested Item */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', borderLeft: '1px solid var(--color-neutral-200)', paddingLeft: '1rem' }}>
          <span style={{ fontSize: '0.625rem', fontWeight: 800, color: 'var(--color-neutral-500)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>They Offer</span>
          <div style={{ fontWeight: 700, color: 'var(--color-neutral-900)', fontSize: '0.875rem' }}>{exchange.requestedItem?.title || 'Requested Item'}</div>
          <span style={{ fontSize: '0.75rem', color: 'var(--color-neutral-500)' }}>{exchange.requestedItem?.condition}</span>
        </div>
      </div>

      {/* Message snippet */}
      {exchange.message && (
        <div style={{ backgroundColor: '#fff', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-neutral-200)', fontSize: '0.75rem', color: 'var(--color-neutral-600)', fontStyle: 'italic', lineHeight: '1.6' }}>
          "{exchange.message}"
        </div>
      )}

      {/* Action Buttons */}
      <div style={{ paddingTop: '0.5rem', display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', alignItems: 'center' }}>
        {exchange.status === 'pending' && !isOfferer && (
          <>
            <Button variant="danger" size="sm" onClick={() => onStatusUpdate(exchange.id, 'rejected')}>
              Decline
            </Button>
            <Button variant="primary" size="sm" className="font-bold" onClick={() => onStatusUpdate(exchange.id, 'accepted')}>
              Accept Exchange
            </Button>
          </>
        )}

        {exchange.status === 'accepted' && (
          <Button variant="primary" size="sm" className="font-bold" onClick={() => onStatusUpdate(exchange.id, 'completed')}>
            Mark Completed
          </Button>
        )}

        {exchange.status === 'completed' && (
          <span style={{ fontSize: '0.75rem', color: 'var(--color-success)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.375rem', padding: '0.25rem 0' }}>
            <CheckCircle2 style={{ width: '1rem', height: '1rem' }} /> Exchange Completed
          </span>
        )}
      </div>
    </Card>
  );
}

