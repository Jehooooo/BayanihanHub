import { useRef, useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { Heart, MapPin, Tag, Gift, ArrowLeftRight, Sparkles, MoreVertical, Flag, Trash2 } from 'lucide-react';
import type { Item } from '@/types';
import Card from '@/components/ui/Card';
import Avatar from '@/components/ui/Avatar';
import ReportModal from '@/features/moderation/components/ReportModal';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import ImageWithSkeleton from '@/components/feedback/ImageWithSkeleton';
import { getCategoryName } from '@/data/categories';
import { useAuthStore } from '@/stores/authStore';
import { itemsService } from '@/services/items.service';
import toast from 'react-hot-toast';
import { formatDistanceToNowStrict } from 'date-fns';

interface ItemCardProps {
  item: Item;
  onFavoriteToggle?: (id: string) => void;
  /** If provided, the 3-dot report menu will be hidden (e.g. on own profile) */
  currentUserId?: string;
}

export default function ItemCard({ item, onFavoriteToggle, currentUserId }: ItemCardProps) {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const isDonation = item.type === 'donation';
  const [reportOpen, setReportOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeleted, setIsDeleted] = useState(false);
  
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const isOwner = (currentUserId || user?.id) === item.ownerId ||
    (currentUserId || user?.id) === item.owner?.id;
  const canReport = user && !isOwner;
  const showMenu = canReport || isOwner;

  const handleCardClick = () => {
    sessionStorage.setItem('browse-scroll-pos', String(window.scrollY));
    navigate(`/items/${item.id}`);
  };

  const openMenu = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    let top = rect.bottom + window.scrollY;
    let left = rect.right - 144 + window.scrollX; // 144px is minWidth of 9rem

    // Viewport edge detection
    if (rect.bottom + 100 > window.innerHeight) {
       top = rect.top - 50 + window.scrollY; // Open upward
    }
    if (rect.right - 144 < 0) {
       left = rect.left + window.scrollX; // Open rightward if clipped on left
    }

    setMenuPosition({ top, left });
    setMenuOpen(true);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node) && 
          buttonRef.current && !buttonRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMenuOpen(false);
    };
    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [menuOpen]);

  const handleDelete = async () => {
    if (!user) return;
    setIsDeleting(true);
    try {
      const success = await itemsService.deleteItem(item.id);
      if (success) {
        toast.success('Post deleted successfully');
        setIsDeleted(true);
      } else {
        toast.error('Failed to delete post');
      }
    } catch {
      toast.error('Error deleting post');
    } finally {
      setIsDeleting(false);
      setIsDeleteModalOpen(false);
    }
  };

  if (isDeleted) return null;

  return (<>
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
            overflow: 'hidden',
            flexShrink: 0,
            borderTopLeftRadius: 'calc(var(--radius-lg) - 1px)',
            borderTopRightRadius: 'calc(var(--radius-lg) - 1px)',
          }}
        >
          <ImageWithSkeleton
            src={item.images && item.images.length > 0 ? item.images[0] : undefined}
            alt={item.title}
            aspectRatio="4/3"
            fallbackIcon={<Tag style={{ width: '1.75rem', height: '1.75rem', marginBottom: '0.25rem', color: 'var(--color-neutral-400)' }} />}
            fallbackText={getCategoryName(item.category)}
            containerClassName="w-full h-full"
          />

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
                /* Solid filled — same as Badge solid prop */
                backgroundColor: isDonation ? '#16a34a' : '#2563eb',
                color: '#ffffff',
                border: 'none',
                boxShadow: isDonation
                  ? '0 2px 8px rgba(22,163,74,0.35)'
                  : '0 2px 8px rgba(37,99,235,0.35)',
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
                lineHeight: 1,
              }}
            >
              {isDonation ? (
                <>
                  <Gift style={{ width: '0.75rem', height: '0.75rem', color: '#ffffff' }} />
                  <span>Donation</span>
                </>
              ) : (
                <>
                  <ArrowLeftRight style={{ width: '0.75rem', height: '0.75rem', color: '#ffffff' }} />
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

          {/* ⋮ Context menu — for reporting or deleting */}
          {showMenu && (
            <div
              style={{ position: 'absolute', top: '0.625rem', right: onFavoriteToggle ? '2.5rem' : '0.625rem', zIndex: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                ref={buttonRef}
                type="button"
                onClick={openMenu}
                style={{
                  padding: '0.4rem',
                  borderRadius: '9999px',
                  backgroundColor: 'rgba(255,255,255,0.9)',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.12)',
                  color: 'var(--color-neutral-600)',
                }}
                aria-label="More options"
              >
                <MoreVertical style={{ width: '0.875rem', height: '0.875rem' }} />
              </button>

              {menuOpen && createPortal(
                <div
                  ref={menuRef}
                  style={{
                    position: 'absolute',
                    top: menuPosition.top,
                    left: menuPosition.left,
                    backgroundColor: '#fff',
                    border: '1px solid var(--color-neutral-200)',
                    borderRadius: 'var(--radius-lg)',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                    zIndex: 99999,
                    minWidth: '9rem',
                    overflow: 'hidden',
                  }}
                >
                  {canReport && (
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); setMenuOpen(false); setReportOpen(true); }}
                      style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.625rem 0.875rem',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        color: '#dc2626',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        textAlign: 'left',
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#fef2f2'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                    >
                      <Flag style={{ width: '0.75rem', height: '0.75rem' }} /> Report Post
                    </button>
                  )}
                  {isOwner && (
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); setMenuOpen(false); setIsDeleteModalOpen(true); }}
                      style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.625rem 0.875rem',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        color: '#dc2626',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        textAlign: 'left',
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#fef2f2'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                    >
                      <Trash2 style={{ width: '0.75rem', height: '0.75rem' }} /> Delete Post
                    </button>
                  )}
                </div>,
                document.body
              )}
            </div>
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
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-neutral-700)', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {item.owner.fullName}
                  </span>
                  {item.createdAt && (
                    <span style={{ fontSize: '0.65rem', color: 'var(--color-neutral-400)', fontWeight: 500 }}>
                      {formatDistanceToNowStrict(new Date(item.createdAt))} ago
                    </span>
                  )}
                </div>
              </div>
            )}

            <span style={{ fontSize: '0.6875rem', color: 'var(--color-primary-700)', fontWeight: 700, backgroundColor: 'var(--color-primary-50)', padding: '0.2rem 0.5rem', borderRadius: 'var(--radius-sm)' }}>
              {item.location.barangay}
            </span>
          </div>
        </div>
      </Card>
    </div>

    {/* Report Modal */}
    <ReportModal
      isOpen={reportOpen}
      onClose={() => setReportOpen(false)}
      targetType="item"
      targetId={item.id}
      targetTitle={item.title}
    />
    
    {/* Delete Confirmation Modal */}
    {isOwner && (
      <ConfirmDialog
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="Delete Item"
        message={`Are you sure you want to delete "${item.title}"? This action cannot be undone.`}
        confirmLabel={isDeleting ? 'Deleting post...' : 'Delete'}
        cancelLabel="Cancel"
        variant="danger"
        isLoading={isDeleting}
      />
    )}
  </>);
}
