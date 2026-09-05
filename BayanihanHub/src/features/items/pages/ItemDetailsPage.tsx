import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Heart,
  Share2,
  MapPin,
  ArrowLeftRight,
  MessageCircle,
  ShieldCheck,
  ArrowLeft,
  Calendar,
  Truck,
} from 'lucide-react';
import PageLayout from '@/components/layout/PageLayout';
import ImageGallery from '../components/ImageGallery';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Avatar from '@/components/ui/Avatar';
import Modal from '@/components/ui/Modal';
import Textarea from '@/components/ui/Textarea';
import { itemsService } from '@/services/items.service';
import { exchangeService } from '@/services/exchange.service';
import { useAuthStore } from '@/stores/authStore';
import { useChatStore } from '@/stores/chatStore';
import { useSavedItemsStore } from '@/stores/savedItemsStore';
import type { Item } from '@/types';
import toast from 'react-hot-toast';

export default function ItemDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  const { createChat } = useChatStore();
  const { saveItem, unsaveItem, isSaved } = useSavedItemsStore();

  const [item, setItem] = useState<Item | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [exchangeModalOpen, setExchangeModalOpen] = useState(false);
  const [offerMessage, setOfferMessage] = useState('');
  const [selectedUserItem, setSelectedUserItem] = useState('');
  const [userItems, setUserItems] = useState<Item[]>([]);

  useEffect(() => {
    if (id) {
      itemsService.getItemById(id).then((data) => {
        setItem(data);
        setIsLoading(false);
      });
    }
  }, [id]);

  useEffect(() => {
    if (user) {
      itemsService.getItems({ status: 'available' }).then((all) => {
        setUserItems(all.filter((i) => i.ownerId === user.id));
      });
    }
  }, [user]);

  if (isLoading) {
    return (
      <PageLayout>
        <div className="animate-pulse space-y-6 max-w-5xl mx-auto">
          <div className="h-6 bg-neutral-200 rounded w-24" />
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-7 h-96 bg-neutral-200 rounded-lg" />
            <div className="lg:col-span-5 space-y-4">
              <div className="h-8 bg-neutral-200 rounded w-3/4" />
              <div className="h-32 bg-neutral-200 rounded" />
            </div>
          </div>
        </div>
      </PageLayout>
    );
  }

  if (!item) {
    return (
      <PageLayout>
        <div className="text-center py-16">
          <h2 className="text-xl font-bold text-neutral-800">Item not found</h2>
          <Button variant="outline" className="mt-4" onClick={() => navigate('/browse')}>
            Back to Browse
          </Button>
        </div>
      </PageLayout>
    );
  }

  const isOwner = user?.id === item.ownerId;

  const handleMessageOwner = () => {
    if (!isAuthenticated) {
      toast.error('Please log in to send a message.');
      navigate('/login');
      return;
    }
    if (item.owner) {
      createChat([user!.id, item.owner.id]);
      navigate('/messages');
    }
  };

  const handleCreateExchange = async () => {
    if (!selectedUserItem) {
      toast.error('Please select an item to offer.');
      return;
    }
    await exchangeService.createExchange({
      offeredItemId: selectedUserItem,
      requestedItemId: item.id,
      offererId: user!.id,
      receiverId: item.ownerId,
      message: offerMessage || 'Hi, I would like to offer an exchange for your item!',
    });
    setExchangeModalOpen(false);
    toast.success('Exchange offer submitted!');
  };

  return (
    <PageLayout>
      <div style={{ maxWidth: '72rem', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* Navigation Back Button — sticky so always visible */}
        <div
          style={{
            position: 'sticky',
            top: '4rem',
            zIndex: 10,
            backgroundColor: 'var(--color-neutral-50)',
            paddingTop: '0.5rem',
            paddingBottom: '0.5rem',
            marginTop: '-0.5rem',
          }}
        >
          <button
            type="button"
            onClick={() => navigate(-1)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '0.75rem',
              fontWeight: 700,
              color: 'var(--color-neutral-600)',
              backgroundColor: '#ffffff',
              border: '1px solid var(--color-neutral-200)',
              borderRadius: 'var(--radius-md)',
              padding: '0.5rem 0.875rem',
              cursor: 'pointer',
              transition: 'all 150ms',
              boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--color-neutral-100)';
              e.currentTarget.style.color = 'var(--color-primary-700)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#ffffff';
              e.currentTarget.style.color = 'var(--color-neutral-600)';
            }}
          >
            <ArrowLeft style={{ width: '1rem', height: '1rem' }} /> Back to Browse
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '2rem', alignItems: 'start' }}>
          {/* Left Column: Image Gallery & Detailed Description */}
          <div style={{ gridColumn: 'span 7 / span 7', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <ImageGallery images={item.images} title={item.title} />

            <div
              style={{
                backgroundColor: '#ffffff',
                padding: '1.75rem 2rem',
                borderRadius: 'var(--radius-xl)',
                border: '1px solid var(--color-neutral-200)',
                boxShadow: 'var(--shadow-card)',
                display: 'flex',
                flexDirection: 'column',
                gap: '1.5rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '0.875rem', borderBottom: '1px solid var(--color-neutral-100)' }}>
                <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--color-neutral-900)', margin: 0 }}>
                  Item Description
                </h3>
                <span style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--color-neutral-400)', backgroundColor: 'var(--color-neutral-100)', padding: '0.2rem 0.6rem', borderRadius: '9999px' }}>
                  ID: #{item.id}
                </span>
              </div>

              <p style={{ fontSize: '0.875rem', color: 'var(--color-neutral-700)', lineHeight: '1.7', margin: 0, whiteSpace: 'pre-line' }}>
                {item.description}
              </p>

              {/* Pickup & Availability Grid */}
              <div style={{ paddingTop: '1.25rem', borderTop: '1px solid var(--color-neutral-100)', display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', padding: '0.875rem 1rem', borderRadius: 'var(--radius-lg)', backgroundColor: 'var(--color-neutral-50)', border: '1px solid var(--color-neutral-200)' }}>
                  <div style={{ width: '2.5rem', height: '2.5rem', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--color-primary-100)', color: 'var(--color-primary-700)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Truck style={{ width: '1.25rem', height: '1.25rem' }} />
                  </div>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <span style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--color-neutral-400)', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block' }}>Pickup Options</span>
                    <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--color-neutral-800)', display: 'block', marginTop: '0.125rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {item.pickupOptions.join(', ')}
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', padding: '0.875rem 1rem', borderRadius: 'var(--radius-lg)', backgroundColor: 'var(--color-neutral-50)', border: '1px solid var(--color-neutral-200)' }}>
                  <div style={{ width: '2.5rem', height: '2.5rem', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--color-primary-100)', color: 'var(--color-primary-700)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Calendar style={{ width: '1.25rem', height: '1.25rem' }} />
                  </div>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <span style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--color-neutral-400)', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block' }}>Availability</span>
                    <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--color-neutral-800)', display: 'block', marginTop: '0.125rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {item.availability}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Title, Badges, Owner Card, CTAs */}
          <div style={{ gridColumn: 'span 5 / span 5', display: 'flex', flexDirection: 'column', gap: '1.5rem', position: 'sticky', top: '5rem' }}>
            <div
              style={{
                backgroundColor: '#ffffff',
                padding: '1.75rem 2rem',
                borderRadius: 'var(--radius-xl)',
                border: '1px solid var(--color-neutral-200)',
                boxShadow: 'var(--shadow-card)',
                display: 'flex',
                flexDirection: 'column',
                gap: '1.5rem',
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <Badge variant={item.type === 'donation' ? 'success' : 'primary'} size="sm">
                    {item.type === 'donation' ? 'Donation' : 'For Exchange'}
                  </Badge>
                  <Badge variant="default" size="sm">{item.condition}</Badge>
                </div>
                <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--color-neutral-900)', lineHeight: '1.2', margin: 0, letterSpacing: '-0.025em' }}>
                  {item.title}
                </h1>
                <p style={{ fontSize: '0.75rem', color: 'var(--color-neutral-500)', display: 'flex', alignItems: 'center', gap: '0.375rem', margin: 0, fontWeight: 500 }}>
                  <MapPin style={{ width: '0.875rem', height: '0.875rem', color: 'var(--color-primary-600)' }} />
                  <span>{item.location.barangay}, {item.location.municipality} • {item.distance} km away</span>
                </p>
              </div>

              {/* Owner Profile Card */}
              {item.owner && (
                <div
                  style={{
                    padding: '1rem 1.25rem',
                    borderRadius: 'var(--radius-lg)',
                    backgroundColor: 'var(--color-neutral-50)',
                    border: '1px solid var(--color-neutral-200)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '1rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', minWidth: 0, flex: 1 }}>
                    <Avatar src={item.owner.avatar} name={item.owner.fullName} size="md" />
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <h4 style={{ margin: 0, fontSize: '0.8125rem', fontWeight: 800, color: 'var(--color-neutral-900)', display: 'flex', alignItems: 'center', gap: '0.25rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.owner.fullName}</span>
                        {item.owner.isTrusted && (
                          <ShieldCheck style={{ width: '0.875rem', height: '0.875rem', color: 'var(--color-primary-600)', flexShrink: 0 }} />
                        )}
                      </h4>
                      <p style={{ margin: '0.125rem 0 0 0', fontSize: '0.6875rem', color: 'var(--color-neutral-500)', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        ★ {item.owner.rating.toFixed(1)} • {item.owner.totalExchanges} exchanges
                      </p>
                    </div>
                  </div>
                  <Link
                    to={`/profile/${item.owner.id}`}
                    style={{
                      fontSize: '0.6875rem',
                      fontWeight: 700,
                      color: 'var(--color-primary-700)',
                      backgroundColor: '#ffffff',
                      border: '1px solid var(--color-neutral-200)',
                      borderRadius: 'var(--radius-sm)',
                      padding: '0.375rem 0.75rem',
                      textDecoration: 'none',
                      flexShrink: 0,
                      transition: 'background-color 150ms',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--color-primary-50)')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#ffffff')}
                  >
                    View Profile
                  </Link>
                </div>
              )}

              {/* Action Buttons */}
              {!isOwner && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {item.type === 'exchange' ? (
                    <Button
                      variant="primary"
                      size="lg"
                      fullWidth
                      style={{ fontWeight: 800, fontSize: '0.875rem', height: '3rem' }}
                      onClick={() => {
                        if (!isAuthenticated) navigate('/login');
                        else setExchangeModalOpen(true);
                      }}
                      leftIcon={<ArrowLeftRight style={{ width: '1.125rem', height: '1.125rem' }} />}
                    >
                      Propose Exchange
                    </Button>
                  ) : (
                    <Button
                      variant="primary"
                      size="lg"
                      fullWidth
                      style={{ fontWeight: 800, fontSize: '0.875rem', height: '3rem' }}
                      onClick={() => {
                        if (!isAuthenticated) {
                          navigate('/login');
                        } else {
                          navigate(`/request/${item.id}`);
                        }
                      }}
                      leftIcon={<MessageCircle style={{ width: '1.125rem', height: '1.125rem' }} />}
                    >
                      Request Donation
                    </Button>
                  )}

                  <Button
                    variant="outline"
                    size="lg"
                    fullWidth
                    style={{ fontWeight: 700, fontSize: '0.875rem', height: '3rem' }}
                    onClick={handleMessageOwner}
                    leftIcon={<MessageCircle style={{ width: '1.125rem', height: '1.125rem' }} />}
                  >
                    Message Owner
                  </Button>
                </div>
              )}

              {/* Share & Save Row */}
              <div style={{ paddingTop: '1.25rem', borderTop: '1px solid var(--color-neutral-100)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-neutral-500)' }}>
                <button
                  type="button"
                  onClick={() => {
                    if (!isAuthenticated) {
                      toast.error('Please log in to save items.');
                      navigate('/login');
                      return;
                    }
                    if (isSaved(item.id)) {
                      unsaveItem(item.id);
                      toast.success('Removed from saved items');
                    } else {
                      saveItem(item.id);
                      toast.success('Saved! View in Saved Items.');
                    }
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.375rem',
                    background: 'none',
                    border: 'none',
                    color: isSaved(item.id) ? 'var(--color-danger)' : 'var(--color-neutral-600)',
                    cursor: 'pointer',
                    padding: '0.375rem 0.5rem',
                    borderRadius: 'var(--radius-sm)',
                    transition: 'all 150ms',
                    fontWeight: 600,
                    fontSize: '0.75rem',
                  }}
                >
                  <Heart
                    style={{
                      width: '1rem',
                      height: '1rem',
                      fill: isSaved(item.id) ? 'var(--color-danger)' : 'none',
                      color: isSaved(item.id) ? 'var(--color-danger)' : 'var(--color-neutral-600)',
                    }}
                  />
                  <span>{isSaved(item.id) ? 'Saved ✓' : 'Save Item'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href);
                    toast.success('Item link copied!');
                  }}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', background: 'none', border: 'none', color: 'var(--color-neutral-600)', cursor: 'pointer', padding: '0.375rem 0.5rem', borderRadius: 'var(--radius-sm)', transition: 'all 150ms' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--color-neutral-100)';
                    e.currentTarget.style.color = 'var(--color-neutral-900)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = 'var(--color-neutral-600)';
                  }}
                >
                  <Share2 style={{ width: '1rem', height: '1rem' }} /> <span>Share Link</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Exchange Proposal Modal */}
      <Modal
        isOpen={exchangeModalOpen}
        onClose={() => setExchangeModalOpen(false)}
        title="Offer an Exchange"
      >
        <div className="space-y-4">
          <p className="text-xs text-neutral-600">
            Select one of your active listings to offer in exchange for <strong>{item.title}</strong>:
          </p>

          {userItems.length === 0 ? (
            <div className="p-4 bg-amber-50 border border-amber-200 text-amber-800 text-xs rounded-[var(--radius-md)]">
              You haven't posted any active items to offer yet. Please post an item first!
            </div>
          ) : (
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {userItems.map((uItem) => (
                <label
                  key={uItem.id}
                  className={`
                    flex items-center gap-3 p-3 rounded-[var(--radius-md)] border cursor-pointer transition-all
                    ${selectedUserItem === uItem.id ? 'border-primary-500 bg-primary-50' : 'border-neutral-200 hover:bg-neutral-50'}
                  `}
                >
                  <input
                    type="radio"
                    name="userItem"
                    value={uItem.id}
                    checked={selectedUserItem === uItem.id}
                    onChange={(e) => setSelectedUserItem(e.target.value)}
                    className="text-primary-600 focus:ring-primary-500"
                  />
                  <div>
                    <p className="text-xs font-bold text-neutral-900">{uItem.title}</p>
                    <p className="text-[11px] text-neutral-500">{uItem.condition}</p>
                  </div>
                </label>
              ))}
            </div>
          )}

          <Textarea
            label="Message to Owner (Optional)"
            placeholder="Add a friendly message..."
            value={offerMessage}
            onChange={(e) => setOfferMessage(e.target.value)}
            rows={3}
          />

          <div className="flex gap-3 pt-2">
            <Button variant="secondary" fullWidth onClick={() => setExchangeModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              fullWidth
              disabled={!selectedUserItem}
              onClick={handleCreateExchange}
            >
              Submit Offer
            </Button>
          </div>
        </div>
      </Modal>
    </PageLayout>
  );
}
