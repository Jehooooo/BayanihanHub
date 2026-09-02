import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bookmark, Trash2, ArrowLeft, PackageOpen } from 'lucide-react';
import PageLayout from '@/components/layout/PageLayout';
import { itemsService } from '@/services/items.service';
import { useSavedItemsStore } from '@/stores/savedItemsStore';
import Badge from '@/components/ui/Badge';
import Avatar from '@/components/ui/Avatar';
import type { Item } from '@/types';
import toast from 'react-hot-toast';

export default function SavedItemsPage() {
  const navigate = useNavigate();
  const { savedIds, unsaveItem } = useSavedItemsStore();
  const [items, setItems] = useState<Item[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      const results = await Promise.all(
        savedIds.map((id) => itemsService.getItemById(id))
      );
      setItems(results.filter(Boolean) as Item[]);
      setIsLoading(false);
    };
    load();
  }, [savedIds]);

  const handleUnsave = (id: string, title: string) => {
    unsaveItem(id);
    setItems((prev) => prev.filter((i) => i.id !== id));
    toast.success(`"${title}" removed from saved items`);
  };

  return (
    <PageLayout>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
              <Bookmark style={{ width: '1.5rem', height: '1.5rem', color: 'var(--color-primary-600)' }} />
              <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-neutral-900)', margin: 0 }}>
                Saved Items
              </h1>
            </div>
            <p style={{ fontSize: '0.875rem', color: 'var(--color-neutral-500)', margin: 0, marginLeft: '2.125rem' }}>
              {items.length} item{items.length !== 1 ? 's' : ''} saved
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate('/browse')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.375rem',
              fontSize: '0.75rem',
              fontWeight: 700,
              color: 'var(--color-neutral-600)',
              backgroundColor: '#ffffff',
              border: '1px solid var(--color-neutral-200)',
              borderRadius: 'var(--radius-md)',
              padding: '0.5rem 0.875rem',
              cursor: 'pointer',
            }}
          >
            <ArrowLeft style={{ width: '0.875rem', height: '0.875rem' }} />
            Browse Items
          </button>
        </div>

        {/* Content */}
        {isLoading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                style={{
                  height: '10rem',
                  backgroundColor: 'var(--color-neutral-100)',
                  borderRadius: 'var(--radius-lg)',
                  animation: 'pulse 1.5s ease-in-out infinite',
                }}
              />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '5rem 2rem',
              backgroundColor: '#ffffff',
              borderRadius: 'var(--radius-xl)',
              border: '1px solid var(--color-neutral-200)',
              gap: '1rem',
              textAlign: 'center',
            }}
          >
            <PackageOpen style={{ width: '3.5rem', height: '3.5rem', color: 'var(--color-neutral-300)' }} />
            <div>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--color-neutral-800)', margin: '0 0 0.375rem 0' }}>
                No saved items yet
              </h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--color-neutral-500)', margin: 0 }}>
                You haven't saved any items yet. Browse available items and click "Save Item" to add them here.
              </p>
            </div>
            <button
              type="button"
              onClick={() => navigate('/browse')}
              style={{
                marginTop: '0.5rem',
                padding: '0.625rem 1.5rem',
                fontSize: '0.875rem',
                fontWeight: 700,
                color: '#ffffff',
                backgroundColor: 'var(--color-primary-600)',
                border: 'none',
                borderRadius: 'var(--radius-md)',
                cursor: 'pointer',
              }}
            >
              Browse Items
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
            {items.map((item) => (
              <div
                key={item.id}
                style={{
                  backgroundColor: '#ffffff',
                  borderRadius: 'var(--radius-xl)',
                  border: '1px solid var(--color-neutral-200)',
                  boxShadow: 'var(--shadow-card)',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'box-shadow 180ms ease',
                }}
              >
                {/* Item image */}
                <div
                  style={{
                    position: 'relative',
                    aspectRatio: '16/9',
                    backgroundColor: 'var(--color-neutral-100)',
                    overflow: 'hidden',
                    flexShrink: 0,
                    cursor: 'pointer',
                  }}
                  onClick={() => navigate(`/items/${item.id}`)}
                >
                  {item.images && item.images.length > 0 ? (
                    <img
                      src={item.images[0]}
                      alt={item.title}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : (
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f1f5f9' }}>
                      <PackageOpen style={{ width: '2.5rem', height: '2.5rem', color: 'var(--color-neutral-300)' }} />
                    </div>
                  )}
                  <div style={{ position: 'absolute', top: '0.625rem', left: '0.625rem', display: 'flex', gap: '0.375rem' }}>
                    <Badge variant={item.type === 'donation' ? 'success' : 'primary'} size="sm">
                      {item.type === 'donation' ? 'Donation' : 'For Exchange'}
                    </Badge>
                    <Badge variant="default" size="sm">{item.condition}</Badge>
                  </div>
                </div>

                {/* Item content */}
                <div style={{ padding: '1rem 1.25rem', display: 'flex', flexDirection: 'column', flex: 1, gap: '0.75rem' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    <h3
                      style={{
                        fontSize: '0.9375rem',
                        fontWeight: 800,
                        color: 'var(--color-neutral-900)',
                        margin: 0,
                        cursor: 'pointer',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                      onClick={() => navigate(`/items/${item.id}`)}
                    >
                      {item.title}
                    </h3>
                    <p style={{ fontSize: '0.75rem', color: 'var(--color-neutral-500)', margin: 0, lineHeight: '1.5', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {item.description}
                    </p>
                  </div>

                  {/* Owner Row */}
                  {item.owner && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Avatar src={item.owner.avatar} name={item.owner.fullName} size="xs" />
                      <span style={{ fontSize: '0.75rem', color: 'var(--color-neutral-700)', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {item.owner.fullName}
                      </span>
                    </div>
                  )}

                  {/* Actions Footer */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.625rem',
                      paddingTop: '0.75rem',
                      borderTop: '1px solid var(--color-neutral-100)',
                      marginTop: 'auto',
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => navigate(`/items/${item.id}`)}
                      style={{
                        flex: 1,
                        padding: '0.5rem 0.875rem',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        color: '#ffffff',
                        backgroundColor: 'var(--color-primary-600)',
                        border: 'none',
                        borderRadius: 'var(--radius-md)',
                        cursor: 'pointer',
                      }}
                    >
                      View Details
                    </button>
                    <button
                      type="button"
                      onClick={() => handleUnsave(item.id, item.title)}
                      title="Remove from saved"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.375rem',
                        padding: '0.5rem 0.875rem',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        color: 'var(--color-danger)',
                        backgroundColor: '#fef2f2',
                        border: '1px solid #fecaca',
                        borderRadius: 'var(--radius-md)',
                        cursor: 'pointer',
                      }}
                    >
                      <Trash2 style={{ width: '0.875rem', height: '0.875rem' }} />
                      Unsave
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </PageLayout>
  );
}