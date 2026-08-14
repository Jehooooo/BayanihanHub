import { Link } from 'react-router-dom';
import { Heart, MapPin, Tag } from 'lucide-react';
import type { Item } from '@/types';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Avatar from '@/components/ui/Avatar';
import { getCategoryName } from '@/data/categories';

interface ItemCardProps {
  item: Item;
  onFavoriteToggle?: (id: string) => void;
}

export default function ItemCard({ item, onFavoriteToggle }: ItemCardProps) {
  const isDonation = item.type === 'donation';

  return (
    <Card hoverable padding="none" style={{ display: 'flex', flexDirection: 'column', height: '100%', backgroundColor: '#fff', overflow: 'hidden' }}>
      {/* Image / Thumbnail Container */}
      <div style={{ position: 'relative', aspectRatio: '4/3', backgroundColor: 'var(--color-neutral-100)', overflow: 'hidden', flexShrink: 0 }}>
        {item.images && item.images.length > 0 ? (
          <img
            src={item.images[0]}
            alt={item.title}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              const nextEl = e.currentTarget.nextElementSibling as HTMLElement | null;
              if (nextEl) nextEl.style.display = 'flex';
            }}
          />
        ) : null}

        <div style={{ width: '100%', height: '100%', display: item.images?.length ? 'none' : 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f1f5f9', color: 'var(--color-neutral-400)', padding: '1rem', textAlign: 'center' }}>
          <Tag style={{ width: '1.75rem', height: '1.75rem', marginBottom: '0.25rem', color: 'var(--color-neutral-400)' }} />
          <span style={{ fontSize: '0.6875rem', color: 'var(--color-neutral-400)', fontWeight: 600 }}>{getCategoryName(item.category)}</span>
        </div>

        {/* Status / Type Badges */}
        <div style={{ position: 'absolute', top: '0.625rem', left: '0.625rem', display: 'flex', alignItems: 'center', gap: '0.375rem', zIndex: 10 }}>
          <Badge variant={isDonation ? 'success' : 'primary'} size="sm">
            {isDonation ? 'Donation' : 'For Exchange'}
          </Badge>
          <Badge variant="default" size="sm">
            {item.condition}
          </Badge>
        </div>

        {/* Favorite Button */}
        {onFavoriteToggle && (
          <button
            onClick={(e) => {
              e.preventDefault();
              onFavoriteToggle(item.id);
            }}
            style={{
              position: 'absolute',
              top: '0.625rem',
              right: '0.625rem',
              padding: '0.5rem',
              borderRadius: '9999px',
              backgroundColor: item.isFavorited ? '#fef2f2' : 'rgba(255,255,255,0.85)',
              color: item.isFavorited ? 'var(--color-danger)' : 'var(--color-neutral-600)',
              border: 'none',
              cursor: 'pointer',
              zIndex: 10,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            aria-label="Favorite item"
          >
            <Heart style={{ width: '1rem', height: '1rem', fill: item.isFavorited ? 'currentColor' : 'none' }} />
          </button>
        )}
      </div>

      {/* Card Content */}
      <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'space-between', gap: '0.75rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.6875rem', color: 'var(--color-neutral-400)', fontWeight: 500 }}>
            <span>{getCategoryName(item.category)}</span>
            {item.distance && (
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.125rem' }}>
                <MapPin style={{ width: '0.75rem', height: '0.75rem' }} /> {item.distance} km
              </span>
            )}
          </div>

          <Link to={`/items/${item.id}`} style={{ textDecoration: 'none' }}>
            <h3 style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--color-neutral-900)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {item.title}
            </h3>
          </Link>

          <p style={{ fontSize: '0.75rem', color: 'var(--color-neutral-500)', lineHeight: '1.5', margin: 0, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {item.description}
          </p>
        </div>

        {/* Footer info: Owner & Details Link */}
        <div style={{ paddingTop: '0.75rem', borderTop: '1px solid var(--color-neutral-100)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {item.owner && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Avatar src={item.owner.avatar} name={item.owner.fullName} size="xs" />
              <span style={{ fontSize: '0.75rem', color: 'var(--color-neutral-700)', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '110px' }}>
                {item.owner.fullName}
              </span>
            </div>
          )}

          <Link
            to={`/items/${item.id}`}
            style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-primary-600)', textDecoration: 'none' }}
          >
            View Details →
          </Link>
        </div>
      </div>
    </Card>
  );
}

