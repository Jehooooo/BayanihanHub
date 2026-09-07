import { useNavigate } from 'react-router-dom';
import { Heart, MapPin, Tag, Gift, ArrowLeftRight, Sparkles } from 'lucide-react';
import type { Item } from '@/types';
import Card from '@/components/ui/Card';
import Avatar from '@/components/ui/Avatar';
import { getCategoryName } from '@/data/categories';

interface ItemCardProps {
  item: Item;
  onFavoriteToggle?: (id: string) => void;
}

export default function ItemCard({ item, onFavoriteToggle }: ItemCardProps) {
  const navigate = useNavigate();
  const isDonation = item.type === 'donation';

  const handleCardClick = () => {
    sessionStorage.setItem('browse-scroll-pos', String(window.scrollY));
    navigate(`/items/${item.id}`);
  };

  return (
    <div
      onClick={handleCardClick}
      style={{ cursor: 'pointer', height: '100%', textDecoration: 'none' }}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          handleCardClick();
        }
      }}
    >
      <Card
        hoverable
        padding="none"
        style={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          backgroundColor: '#fff',
          overflow: 'hidden',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--color-neutral-200)',
          transition: 'transform 180ms ease, box-shadow 180ms ease',
        }}
      >
        {/* Image / Thumbnail Container */}
        <div
          style={{
            position: 'relative',
            aspectRatio: '4/3',
            backgroundColor: 'var(--color-neutral-100)',
            overflow: 'hidden',
            flexShrink: 0,
            borderTopLeftRadius: 'calc(var(--radius-lg) - 1px)',
            borderTopRightRadius: 'calc(var(--radius-lg) - 1px)',
          }}
        >
          {item.images && item.images.length > 0 ? (
            <img
              src={item.images[0]}
              alt={item.title}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                borderTopLeftRadius: 'inherit',
                borderTopRightRadius: 'inherit',
              }}
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                const nextEl = e.currentTarget.nextElementSibling as HTMLElement | null;
                if (nextEl) nextEl.style.display = 'flex';
              }}
            />
          ) : null}

          <div
            style={{
              width: '100%',
              height: '100%',
              display: item.images?.length ? 'none' : 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: '#f1f5f9',
              color: 'var(--color-neutral-400)',
              padding: '1rem',
              textAlign: 'center',
              borderTopLeftRadius: 'inherit',
              borderTopRightRadius: 'inherit',
            }}
          >
            <Tag style={{ width: '1.75rem', height: '1.75rem', marginBottom: '0.25rem', color: 'var(--color-neutral-400)' }} />
            <span style={{ fontSize: '0.6875rem', color: 'var(--color-neutral-400)', fontWeight: 600 }}>{getCategoryName(item.category)}</span>
          </div>

          {/* Status / Type Badges */}
          <div
            style={{
              position: 'absolute',
              top: '0.75rem',
              left: '0.75rem',
              display: 'flex',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '0.45rem',
              zIndex: 10,
              maxWidth: 'calc(100% - 3.5rem)',
            }}
          >
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                padding: '0.28rem 0.65rem',
                fontSize: '0.7rem',
                fontWeight: 700,
                borderRadius: '9999px',
                backgroundColor: isDonation ? 'rgba(240, 253, 244, 0.95)' : 'rgba(239, 246, 255, 0.95)',
                color: isDonation ? '#15803d' : '#1d4ed8',
                border: isDonation ? '1px solid rgba(134, 239, 172, 0.85)' : '1px solid rgba(147, 197, 253, 0.85)',
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
                boxShadow: '0 2px 6px rgba(0, 0, 0, 0.1)',
                lineHeight: 1,
              }}
            >
              {isDonation ? (
                <>
                  <Gift style={{ width: '0.75rem', height: '0.75rem', color: '#16a34a' }} />
                  <span>Donation</span>
                </>
              ) : (
                <>
                  <ArrowLeftRight style={{ width: '0.75rem', height: '0.75rem', color: '#2563eb' }} />
                  <span>For Exchange</span>
                </>
              )}
            </span>

            {item.condition && (
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.3rem',
                  padding: '0.28rem 0.6rem',
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  borderRadius: '9999px',
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  color: '#334155',
                  border: '1px solid rgba(203, 213, 225, 0.9)',
                  backdropFilter: 'blur(8px)',
                  WebkitBackdropFilter: 'blur(8px)',
                  boxShadow: '0 2px 6px rgba(0, 0, 0, 0.08)',
                  lineHeight: 1,
                }}
              >
                <Sparkles style={{ width: '0.7rem', height: '0.7rem', color: '#64748b' }} />
                <span>{item.condition}</span>
              </span>
            )}
          </div>

          {/* Favorite Button */}
          {onFavoriteToggle && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                onFavoriteToggle(item.id);
              }}
              style={{
                position: 'absolute',
                top: '0.625rem',
                right: '0.625rem',
                padding: '0.5rem',
                borderRadius: '9999px',
                backgroundColor: item.isFavorited ? '#fef2f2' : 'rgba(255,255,255,0.9)',
                color: item.isFavorited ? 'var(--color-danger)' : 'var(--color-neutral-600)',
                border: 'none',
                cursor: 'pointer',
                zIndex: 20,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 6px rgba(0,0,0,0.12)',
              }}
              aria-label="Favorite item"
            >
              <Heart style={{ width: '1rem', height: '1rem', fill: item.isFavorited ? 'currentColor' : 'none' }} />
            </button>
          )}
        </div>

        {/* Card Content */}
        <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'space-between', gap: '0.75rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.6875rem', color: 'var(--color-neutral-500)', fontWeight: 600 }}>
              <span style={{ textTransform: 'uppercase', letterSpacing: '0.04em' }}>{getCategoryName(item.category)}</span>
              {item.distance && (
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.125rem', color: 'var(--color-neutral-400)' }}>
                  <MapPin style={{ width: '0.75rem', height: '0.75rem', color: 'var(--color-primary-600)' }} /> {item.distance} km away
                </span>
              )}
            </div>

            <h3 style={{ fontSize: '0.9375rem', fontWeight: 800, color: 'var(--color-neutral-900)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {item.title}
            </h3>

            <p style={{ fontSize: '0.75rem', color: 'var(--color-neutral-500)', lineHeight: '1.5', margin: 0, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
              {item.description}
            </p>
          </div>

          {/* Footer info: Owner & Barangay Location */}
          <div style={{ paddingTop: '0.75rem', borderTop: '1px solid var(--color-neutral-100)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            {item.owner && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: 0 }}>
                <Avatar src={item.owner.avatar} name={item.owner.fullName} size="xs" />
                <span style={{ fontSize: '0.75rem', color: 'var(--color-neutral-700)', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {item.owner.fullName}
                </span>
              </div>
            )}

            <span style={{ fontSize: '0.6875rem', color: 'var(--color-primary-700)', fontWeight: 700, backgroundColor: 'var(--color-primary-50)', padding: '0.2rem 0.5rem', borderRadius: 'var(--radius-sm)' }}>
              {item.location.barangay}
            </span>
          </div>
        </div>
      </Card>
    </div>
  );
}

