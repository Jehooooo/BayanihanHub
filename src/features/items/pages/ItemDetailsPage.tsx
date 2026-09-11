import { useState, useEffect, useRef } from 'react';
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
  Star,
  MoreVertical,
  Flag,
  AlertTriangle,
} from 'lucide-react';
import PageLayout from '@/components/layout/PageLayout';
import ImageGallery from '../components/ImageGallery';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Avatar from '@/components/ui/Avatar';
import Modal from '@/components/ui/Modal';
import Textarea from '@/components/ui/Textarea';
import ReportModal from '@/features/moderation/components/ReportModal';
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
  const { createChat, sendMessage, fetchChats, setActiveChat } = useChatStore();
  const { saveItem, unsaveItem, isSaved } = useSavedItemsStore();

  const [item, setItem] = useState<Item | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [exchangeModalOpen, setExchangeModalOpen] = useState(false);
  const [offerMessage, setOfferMessage] = useState('');
  const [selectedUserItem, setSelectedUserItem] = useState('');
  const [userItems, setUserItems] = useState<Item[]>([]);
  const [isRequestingDonation, setIsRequestingDonation] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [overflowMenuOpen, setOverflowMenuOpen] = useState(false);
  const overflowRef = useRef<HTMLDivElement>(null);

  // Close overflow menu on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (overflowRef.current && !overflowRef.current.contains(e.target as Node)) {
        setOverflowMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const [adminReportStatus, setAdminReportStatus] = useState<{
    hasReports: boolean;
    activeReportsCount: number;
    totalReportsCount: number;
    status: string;
  } | null>(null);

  useEffect(() => {
    if (id) {
      itemsService.getItemById(id).then((data) => {
        setItem(data);
        setIsLoading(false);
      });
    }
  }, [id]);

  useEffect(() => {
    if (user?.role === 'admin' && id) {
      fetch(`/api/reports/target-status/item/${encodeURIComponent(id)}`)
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data) setAdminReportStatus(data);
        })
        .catch(() => {});
    }
  }, [user?.role, id]);

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

  const handleRequestDonation = async () => {
    if (!isAuthenticated || !user) {
      toast.error('Please log in to request this donation item.');
      navigate('/login');
      return;
    }

    if (isOwner) {
      toast.error('You cannot request your own donation item.');
      return;
    }

    if (isRequestingDonation) return;
    setIsRequestingDonation(true);

    try {
      // 1. Call backend endpoint to retrieve owner, find/reuse conversation, and send automated message
      const res = await fetch(`/api/items/${encodeURIComponent(item.id)}/request-donation`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          posterId: item.ownerId,
          posterName: item.owner?.fullName || (item as any).posterName,
          itemTitle: item.title,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const chatId = data.conversationId;
        if (data.conversation) {
          useChatStore.getState().addChat(data.conversation);
        }
        await fetchChats(user.id);
        await setActiveChat(chatId);
        navigate(`/messages?chatId=${encodeURIComponent(chatId)}`, {
          state: { activeChatId: chatId, initialChat: data.conversation },
        });
        return;
      }
    } catch {
      // Fallback to client-side creation
    }

    // Client-side fallback if backend returns error or offline
    try {
      const chat = await createChat([user.id, item.ownerId]);
      const autoMessage = `Hi! I'm interested in requesting the donation item you posted: "${item.title}".`;
      await sendMessage(chat.id, user.id, autoMessage, 'text');
      await setActiveChat(chat.id);
      navigate(`/messages?chatId=${encodeURIComponent(chat.id)}`, {
        state: { activeChatId: chat.id, initialChat: chat },
      });
      return;
    } catch {
      toast.error('Unable to start the conversation. Please try again.');
    } finally {
      setIsRequestingDonation(false);
    }
  };

  const handleCreateExchange = async () => {
    if (!selectedUserItem) {
      toast.error('Please select an item to offer.');
      return;
    }
    const offItem = userItems.find((i) => i.id === selectedUserItem);
    await exchangeService.createExchange({
      offeredItemId: selectedUserItem,
      requestedItemId: item.id,
      offererId: user!.id,
      receiverId: item.ownerId,
      message: offerMessage || 'Hi, I would like to offer an exchange for your item!',
    });

    // Flow 2: PROPOSE EXCHANGE BUTTON -> SEND TO USERS INBOX -> STORE IN DATABASE -> END
    try {
      const chat = await createChat([user!.id, item.ownerId]);
      const proposalText = `🔄 Exchange Proposal for "${item.title}":\n\nI am offering "${offItem?.title || 'an item'}" in exchange.\n\nNote: ${offerMessage || 'Hi, I would like to offer an exchange for your item!'}`;
      await sendMessage(chat.id, user!.id, proposalText, 'text');
    } catch {
      // Continue
    }

    setExchangeModalOpen(false);
    toast.success(
      (t) => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
          <span style={{ fontWeight: 700 }}>Exchange proposal sent to owner's inbox!</span>
          <button
            onClick={() => {
              toast.dismiss(t.id);
              navigate('/messages');
            }}
            style={{
              alignSelf: 'flex-start',
              fontSize: '0.75rem',
              fontWeight: 700,
              color: '#16a34a',
              background: 'none',
              border: 'none',
              padding: '0.2rem 0',
              cursor: 'pointer',
              textDecoration: 'underline',
            }}
          >
            Go to Inbox →
          </button>
        </div>
      ),
      { duration: 5000 }
    );
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

        {/* Admin-Only Moderation Notice Banner (Section 19: Post-Level Report Status) */}
        {user?.role === 'admin' && adminReportStatus?.hasReports && (
          <div
            style={{
              padding: '0.75rem 1.25rem',
              borderRadius: '8px',
              backgroundColor: '#fff7ed',
              border: '1px solid #fed7aa',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '1rem',
              flexWrap: 'wrap',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: '#9a3412', fontSize: '0.8125rem' }}>
              <AlertTriangle style={{ width: '1.25rem', height: '1.25rem', color: '#ea580c', flexShrink: 0 }} />
              <span>
                <strong>Admin Moderation Notice:</strong> This post has <strong>{adminReportStatus.totalReportsCount} report(s)</strong> ({adminReportStatus.activeReportsCount} active). Status: <Badge variant="warning">{adminReportStatus.status.toUpperCase()}</Badge>
              </span>
            </div>
            <Link to="/admin/reports" style={{ textDecoration: 'none' }}>
              <Button variant="outline" size="sm">
                Review in Admin Console &rarr;
              </Button>
            </Link>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          {/* Left Column: Image Gallery & Detailed Description */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            <ImageGallery images={item.images} title={item.title} />

            <div className="bg-white p-4 sm:p-6 lg:p-7 rounded-[var(--radius-xl)] border border-neutral-200 shadow-[var(--shadow-card)] flex flex-col gap-5">
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
              <div className="pt-4 border-t border-neutral-100 grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.875rem 1.125rem', borderRadius: 'var(--radius-lg)', backgroundColor: 'var(--color-neutral-50)', border: '1px solid var(--color-neutral-200)' }}>
                  <div style={{ width: '2.75rem', height: '2.75rem', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--color-primary-100)', color: 'var(--color-primary-700)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Truck style={{ width: '1.35rem', height: '1.35rem' }} />
                  </div>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <span style={{ fontSize: '0.6875rem', fontWeight: 800, color: 'var(--color-neutral-400)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block' }}>Pickup Options</span>
                    <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--color-neutral-900)', display: 'block', marginTop: '0.15rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {item.pickupOptions.join(', ')}
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.875rem 1.125rem', borderRadius: 'var(--radius-lg)', backgroundColor: 'var(--color-neutral-50)', border: '1px solid var(--color-neutral-200)' }}>
                  <div style={{ width: '2.75rem', height: '2.75rem', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--color-primary-100)', color: 'var(--color-primary-700)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Calendar style={{ width: '1.35rem', height: '1.35rem' }} />
                  </div>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <span style={{ fontSize: '0.6875rem', fontWeight: 800, color: 'var(--color-neutral-400)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block' }}>Availability</span>
                    <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--color-neutral-900)', display: 'block', marginTop: '0.15rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {item.availability}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Title, Badges, Owner Card, CTAs */}
          <div className="lg:col-span-5 flex flex-col gap-6 lg:sticky lg:top-20">
            <div className="bg-white p-4 sm:p-6 lg:p-7 rounded-[var(--radius-xl)] border border-neutral-200 shadow-[var(--shadow-card)] flex flex-col gap-5">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                  <Badge variant={item.type === 'donation' ? 'success' : 'primary'} size="sm" solid>
                    {item.type === 'donation' ? 'Donation' : 'For Exchange'}
                  </Badge>
                  <Badge variant="default" size="sm">{item.condition}</Badge>
                </div>
                <h1 className="text-xl sm:text-2xl font-extrabold text-neutral-900 leading-tight tracking-tight">
                  {item.title}
                </h1>
                <p style={{ fontSize: '0.75rem', color: 'var(--color-neutral-500)', display: 'flex', alignItems: 'center', gap: '0.375rem', margin: 0, fontWeight: 500 }}>
                  <MapPin style={{ width: '0.875rem', height: '0.875rem', color: 'var(--color-primary-600)' }} />
                  <span>
                    {item.location.barangay}, {item.location.municipality}
                    {item.distance !== undefined && item.distance !== null ? ` • ${item.distance} km away` : ''}
                  </span>
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
                      <p style={{ margin: '0.125rem 0 0 0', fontSize: '0.6875rem', color: 'var(--color-neutral-500)', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <Star style={{ width: '0.75rem', height: '0.75rem', fill: '#f59e0b', color: '#f59e0b', flexShrink: 0 }} />
                        <span>{item.owner.rating.toFixed(1)} • {item.owner.totalExchanges} exchanges</span>
                      </p>
                    </div>
                  </div>
                  <Link
                    to={`/profile/${item.owner.id}`}
                    state={{ returnTo: `/items/${item.id}` }}
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      color: 'var(--color-primary-700)',
                      backgroundColor: '#ffffff',
                      border: '1px solid var(--color-neutral-200)',
                      borderRadius: '9999px',
                      padding: '0.45rem 0.95rem',
                      textDecoration: 'none',
                      flexShrink: 0,
                      transition: 'all 150ms',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--color-primary-50)';
                      e.currentTarget.style.borderColor = 'var(--color-primary-300)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#ffffff';
                      e.currentTarget.style.borderColor = 'var(--color-neutral-200)';
                    }}
                  >
                    View Profile
                  </Link>
                </div>
              )}

              {/* Action Buttons */}
              {!isOwner && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                  {item.type === 'exchange' ? (
                    <Button
                      variant="primary"
                      size="lg"
                      fullWidth
                      style={{ fontWeight: 800, fontSize: '0.9375rem', height: '3.125rem', gap: '0.625rem', borderRadius: 'var(--radius-md)' }}
                      onClick={() => {
                        if (!isAuthenticated) navigate('/login');
                        else setExchangeModalOpen(true);
                      }}
                      leftIcon={<ArrowLeftRight style={{ width: '1.2rem', height: '1.2rem' }} />}
                    >
                      Propose Exchange
                    </Button>
                  ) : (
                    <Button
                      variant="primary"
                      size="lg"
                      fullWidth
                      disabled={isRequestingDonation}
                      style={{ fontWeight: 800, fontSize: '0.9375rem', height: '3.125rem', gap: '0.625rem', borderRadius: 'var(--radius-md)' }}
                      onClick={handleRequestDonation}
                      leftIcon={<MessageCircle style={{ width: '1.2rem', height: '1.2rem' }} />}
                    >
                      {isRequestingDonation ? 'Opening conversation...' : 'Request Donation'}
                    </Button>
                  )}
                </div>
              )}

              {/* Share & Save Row */}
              <div style={{ paddingTop: '1.25rem', borderTop: '1px solid var(--color-neutral-100)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-neutral-500)' }}>
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
                    gap: '0.5rem',
                    background: 'none',
                    border: 'none',
                    color: isSaved(item.id) ? 'var(--color-danger)' : 'var(--color-neutral-600)',
                    cursor: 'pointer',
                    padding: '0.45rem 0.85rem',
                    borderRadius: 'var(--radius-md)',
                    transition: 'all 150ms',
                    fontWeight: 600,
                    fontSize: '0.8125rem',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--color-neutral-100)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <Heart
                    style={{
                      width: '1.125rem',
                      height: '1.125rem',
                      fill: isSaved(item.id) ? 'var(--color-danger)' : 'none',
                      color: isSaved(item.id) ? 'var(--color-danger)' : 'var(--color-neutral-600)',
                    }}
                  />
                  <span>{isSaved(item.id) ? 'Saved' : 'Save Item'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href);
                    toast.success('Item link copied!');
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    background: 'none',
                    border: 'none',
                    color: 'var(--color-neutral-600)',
                    cursor: 'pointer',
                    padding: '0.45rem 0.85rem',
                    borderRadius: 'var(--radius-md)',
                    transition: 'all 150ms',
                    fontWeight: 600,
                    fontSize: '0.8125rem',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--color-neutral-100)';
                    e.currentTarget.style.color = 'var(--color-neutral-900)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = 'var(--color-neutral-600)';
                  }}
                >
                  <Share2 style={{ width: '1.125rem', height: '1.125rem' }} /> <span>Share Link</span>
                </button>

                {/* ⋮ Overflow menu — shown only to authenticated non-owners */}
                {isAuthenticated && !isOwner && (
                  <div ref={overflowRef} style={{ position: 'relative' }}>
                    <button
                      type="button"
                      onClick={() => setOverflowMenuOpen((o) => !o)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: 'none',
                        border: 'none',
                        color: 'var(--color-neutral-500)',
                        cursor: 'pointer',
                        padding: '0.45rem',
                        borderRadius: 'var(--radius-md)',
                        transition: 'all 150ms',
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--color-neutral-100)'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                      aria-label="More options"
                    >
                      <MoreVertical style={{ width: '1.125rem', height: '1.125rem' }} />
                    </button>

                    {overflowMenuOpen && (
                      <div
                        style={{
                          position: 'absolute',
                          right: 0,
                          bottom: '110%',
                          backgroundColor: '#fff',
                          border: '1px solid var(--color-neutral-200)',
                          borderRadius: 'var(--radius-lg)',
                          boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                          zIndex: 50,
                          minWidth: '10rem',
                          overflow: 'hidden',
                        }}
                      >
                        <button
                          type="button"
                          onClick={() => {
                            setOverflowMenuOpen(false);
                            setReportModalOpen(true);
                          }}
                          style={{
                            width: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.625rem',
                            padding: '0.75rem 1rem',
                            fontSize: '0.8125rem',
                            fontWeight: 600,
                            color: '#dc2626',
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            textAlign: 'left',
                            transition: 'background 120ms',
                          }}
                          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#fef2f2'; }}
                          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                        >
                          <Flag style={{ width: '0.875rem', height: '0.875rem' }} />
                          Report Post
                        </button>
                      </div>
                    )}
                  </div>
                )}
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
              {userItems.map((uItem) => {
                const isSelected = selectedUserItem === uItem.id;
                return (
                  <label
                    key={uItem.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '12px 16px',
                      borderRadius: 'var(--radius-lg, 0.5rem)',
                      border: isSelected
                        ? '1.5px solid var(--color-primary-600)'
                        : '1px solid var(--color-neutral-200)',
                      backgroundColor: isSelected ? 'var(--color-primary-50)' : '#ffffff',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                    className="hover:border-primary-300 hover:bg-neutral-50/80"
                  >
                    <input
                      type="radio"
                      name="userItem"
                      value={uItem.id}
                      checked={isSelected}
                      onChange={(e) => setSelectedUserItem(e.target.value)}
                      style={{
                        margin: 0,
                        flexShrink: 0,
                        width: '1rem',
                        height: '1rem',
                        accentColor: 'var(--color-primary-600)',
                        cursor: 'pointer',
                      }}
                      className="text-primary-600 focus:ring-primary-500"
                    />
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', minWidth: 0 }}>
                      <p style={{ margin: 0, fontSize: '0.8125rem', fontWeight: 700, color: 'var(--color-neutral-900)' }}>
                        {uItem.title}
                      </p>
                      <p style={{ margin: 0, fontSize: '0.6875rem', color: 'var(--color-neutral-500)' }}>
                        {uItem.condition}
                      </p>
                    </div>
                  </label>
                );
              })}
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

      {/* Report Post Modal */}
      {item && (
        <ReportModal
          isOpen={reportModalOpen}
          onClose={() => setReportModalOpen(false)}
          targetType="item"
          targetId={item.id}
          targetTitle={item.title}
        />
      )}
    </PageLayout>
  );
}
