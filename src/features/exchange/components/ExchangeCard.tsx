import { useState } from 'react';
import { CheckCircle2, Star } from 'lucide-react';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Avatar from '@/components/ui/Avatar';
import RatingModal from '@/features/ratings/components/RatingModal';
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
  const [isRatingModalOpen, setIsRatingModalOpen] = useState(false);
  const [userRating, setUserRating] = useState<number | null>(null);

  const isOfferer = exchange.offererId === currentUserId;
  const partner = isOfferer ? exchange.receiver : exchange.offerer;
  const partnerName = partner?.fullName || partner?.username || 'Neighbor';
  const rawExchangeId = exchange.id.replace('exc-', '');

  return (
    <>
      <Card style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', padding: '1.5rem' }}>
        {/* Header: Partner Info & Status Badge */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '0.75rem', borderBottom: '1px solid var(--color-neutral-100)' }}>
          {partner && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Avatar src={partner.avatar} name={partnerName} size="sm" />
              <div>
                <p style={{ fontSize: '0.6875rem', color: 'var(--color-neutral-400)', fontWeight: 500, margin: 0 }}>Exchange with</p>
                <h4 style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--color-neutral-900)', margin: 0 }}>{partnerName}</h4>
              </div>
            </div>
          )}

          <Badge variant={statusBadges[exchange.status]?.variant || 'default'}>
            {statusBadges[exchange.status]?.label || exchange.status}
          </Badge>
        </div>

        {/* Item Swap Comparison Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 p-3.5 sm:p-4 rounded-[var(--radius-lg)] bg-neutral-50 border border-neutral-200">
          {/* Offered Item */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <span style={{ fontSize: '0.625rem', fontWeight: 800, color: 'var(--color-primary-700)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>You Offer</span>
            <div style={{ fontWeight: 700, color: 'var(--color-neutral-900)', fontSize: '0.875rem' }}>{exchange.offeredItem?.title || 'Offered Item'}</div>
            <span style={{ fontSize: '0.75rem', color: 'var(--color-neutral-500)' }}>{exchange.offeredItem?.condition}</span>
          </div>

          {/* Requested Item */}
          <div className="flex flex-col gap-1 border-t sm:border-t-0 sm:border-l border-neutral-200 pt-2.5 sm:pt-0 sm:pl-4">
            <span style={{ fontSize: '0.625rem', fontWeight: 800, color: 'var(--color-neutral-500)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>They Offer</span>
            <div style={{ fontWeight: 700, color: 'var(--color-neutral-900)', fontSize: '0.875rem' }}>{exchange.requestedItem?.title || 'Requested Item'}</div>
            <span style={{ fontSize: '0.75rem', color: 'var(--color-neutral-500)' }}>{exchange.requestedItem?.condition}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ paddingTop: '0.5rem', display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', alignItems: 'center', flexWrap: 'wrap' }}>
          {exchange.status === 'pending' && !isOfferer && (
            <>
              <Button
                variant="danger"
                size="sm"
                style={{ padding: '0.5rem 1rem', fontWeight: 600 }}
                onClick={() => onStatusUpdate(exchange.id, 'rejected')}
              >
                Decline
              </Button>
              <Button
                variant="primary"
                size="sm"
                style={{ padding: '0.5rem 1.125rem', fontWeight: 700 }}
                className="font-bold"
                onClick={() => onStatusUpdate(exchange.id, 'accepted')}
              >
                Accept Exchange
              </Button>
            </>
          )}

          {exchange.status === 'accepted' && (
            <Button
              variant="primary"
              size="sm"
              style={{ padding: '0.5rem 1.125rem', fontWeight: 700 }}
              className="font-bold"
              onClick={() => onStatusUpdate(exchange.id, 'completed')}
            >
              Mark Completed
            </Button>
          )}

          {exchange.status === 'completed' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--color-success)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                <CheckCircle2 style={{ width: '1rem', height: '1rem' }} /> Deal Completed
              </span>

              {userRating ? (
                <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded border border-amber-200 inline-flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" /> Rated {userRating}/5
                </span>
              ) : (
                <Button
                  variant="primary"
                  size="sm"
                  style={{ padding: '0.375rem 0.875rem', fontWeight: 700 }}
                  onClick={() => setIsRatingModalOpen(true)}
                >
                  <Star className="w-3.5 h-3.5 mr-1 fill-white" /> Rate Partner
                </Button>
              )}
            </div>
          )}
        </div>
      </Card>

      {/* Rating Modal for Completed Deal */}
      <RatingModal
        isOpen={isRatingModalOpen}
        onClose={() => setIsRatingModalOpen(false)}
        exchangeId={rawExchangeId}
        partnerName={partnerName}
        partnerId={partner?.id}
        partnerAvatar={partner?.avatar}
        itemTitle={exchange.offeredItem?.title || exchange.requestedItem?.title}
        onSuccess={(ratingData) => {
          if (ratingData?.score) {
            setUserRating(ratingData.score);
          }
        }}
      />
    </>
  );
}
