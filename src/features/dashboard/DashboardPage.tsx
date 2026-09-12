import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  HandHeart,
  ArrowLeftRight,
  TrendingUp,
  Package,
  Clock,
  Sparkles,
  Star,
  ArrowRight,
} from 'lucide-react';
import PageLayout from '@/components/layout/PageLayout';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import ItemCard from '@/features/items/components/ItemCard';
import ScrollReveal from '@/components/common/ScrollReveal';
import FulfillRequestModal from '@/features/requests/components/FulfillRequestModal';
import { itemsService } from '@/services/items.service';
import { requestsService } from '@/services/requests.service';
import { useAuthStore } from '@/stores/authStore';
import BetaNoticeModal from '@/components/common/BetaNoticeModal';
import type { Item, ItemRequest } from '@/types';
import SEO from '@/components/common/SEO';

export default function DashboardPage() {
  const { user } = useAuthStore();

  const [recentItems, setRecentItems] = useState<Item[]>([]);
  const [totalItemsCount, setTotalItemsCount] = useState<number>(0);
  const [activeRequests, setActiveRequests] = useState<ItemRequest[]>([]);
  const [selectedRequestForFulfill, setSelectedRequestForFulfill] = useState<ItemRequest | null>(null);

  useEffect(() => {
    Promise.all([
      itemsService.getItems({ sortBy: 'newest' }),
      requestsService.getRequests('active'),
    ]).then(([items, reqs]) => {
      setTotalItemsCount(items.length);
      setRecentItems(items.slice(0, 6));
      setActiveRequests(reqs.slice(0, 3));
    }).catch(() => {
      // keep empty states
    });
  }, []);

  return (
    <PageLayout>
      <SEO title="Home" noindex={true} />
      <BetaNoticeModal />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', paddingBottom: '4.5rem' }}>
        {/* Welcome Hero Banner */}
        <ScrollReveal direction="down" duration={550}>
          <div className="relative overflow-hidden rounded-[var(--radius-xl)] p-5 sm:p-7 md:p-8 text-white shadow-[var(--shadow-elevated)] bg-gradient-to-br from-[var(--color-primary-700)] via-[var(--color-primary-600)] to-[var(--color-primary-800)]">
            <div className="relative z-10 flex flex-col gap-3">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-semibold text-[var(--color-primary-100)] w-fit">
                <Sparkles className="w-3.5 h-3.5" /> Community Exchange & Donation
              </div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight">
                Kumusta, {user?.fullName || 'Neighbor'}!
              </h1>
              <p className="text-xs sm:text-sm text-[var(--color-primary-100)] max-w-xl leading-relaxed">
                See what essential items your neighbors are sharing today, or post a request to get support from your barangay.
              </p>
            </div>
          </div>
        </ScrollReveal>

        {/* Quick Stats Grid with Staggered Scroll Animation */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <ScrollReveal delay={0} direction="up">
            <Card padding="sm" style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
              <div style={{ width: '2.5rem', height: '2.5rem', borderRadius: 'var(--radius-md)', backgroundColor: '#ecfdf5', color: 'var(--color-primary-600)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Package style={{ width: '1.25rem', height: '1.25rem' }} />
              </div>
              <div>
                <p style={{ fontSize: '0.6875rem', color: 'var(--color-neutral-400)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Active Posts</p>
                <p style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--color-neutral-900)' }}>{totalItemsCount}</p>
              </div>
            </Card>
          </ScrollReveal>

          <ScrollReveal delay={80} direction="up">
            <Card padding="sm" style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
              <div style={{ width: '2.5rem', height: '2.5rem', borderRadius: 'var(--radius-md)', backgroundColor: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <ArrowLeftRight style={{ width: '1.25rem', height: '1.25rem' }} />
              </div>
              <div>
                <p style={{ fontSize: '0.6875rem', color: 'var(--color-neutral-400)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Exchanges</p>
                <p style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--color-neutral-900)' }}>{user?.totalExchanges ?? 0}</p>
              </div>
            </Card>
          </ScrollReveal>

          <ScrollReveal delay={160} direction="up">
            <Card padding="sm" style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
              <div style={{ width: '2.5rem', height: '2.5rem', borderRadius: 'var(--radius-md)', backgroundColor: '#fffbeb', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <HandHeart style={{ width: '1.25rem', height: '1.25rem' }} />
              </div>
              <div>
                <p style={{ fontSize: '0.6875rem', color: 'var(--color-neutral-400)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Donations</p>
                <p style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--color-neutral-900)' }}>{user?.totalDonations ?? 0}</p>
              </div>
            </Card>
          </ScrollReveal>

          <ScrollReveal delay={240} direction="up">
            <Card padding="sm" style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
              <div style={{ width: '2.5rem', height: '2.5rem', borderRadius: 'var(--radius-md)', backgroundColor: '#faf5ff', color: '#9333ea', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <TrendingUp style={{ width: '1.25rem', height: '1.25rem' }} />
              </div>
              <div>
                <p style={{ fontSize: '0.6875rem', color: 'var(--color-neutral-400)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Rating</p>
                <p style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--color-neutral-900)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <Star style={{ width: '1rem', height: '1rem', fill: '#f59e0b', color: '#f59e0b' }} /> {user?.rating != null ? Number(user.rating).toFixed(1) : '5.0'}
                </p>
              </div>
            </Card>
          </ScrollReveal>
        </div>

        {/* Section: Nearby Donations & Exchanges */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <ScrollReveal direction="up" delay={50}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <h2 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--color-neutral-900)' }}>Nearby Items & Donations</h2>
                <p style={{ fontSize: '0.75rem', color: 'var(--color-neutral-500)' }}>Recently listed in your area</p>
              </div>
              <Link to="/browse" style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-primary-600)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                <span>View All</span> <ArrowRight style={{ width: '0.85rem', height: '0.85rem' }} />
              </Link>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {recentItems.map((item, idx) => (
              <ScrollReveal key={item.id} delay={idx * 70} direction="up">
                <ItemCard item={item} />
              </ScrollReveal>
            ))}
          </div>
        </div>

        {/* Section: Urgent Community Requests */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', paddingTop: '0.5rem' }}>
          <ScrollReveal direction="up" delay={50}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <h2 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--color-neutral-900)' }}>Urgent Community Requests</h2>
                <p style={{ fontSize: '0.75rem', color: 'var(--color-neutral-500)' }}>Items requested by neighbors needing help</p>
              </div>
              <Link to="/requests" style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-primary-600)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                <span>See All Requests</span> <ArrowRight style={{ width: '0.85rem', height: '0.85rem' }} />
              </Link>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeRequests.map((req, idx) => (
              <ScrollReveal key={req.id} delay={idx * 90} direction="up">
                <Card style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                      <Badge variant={req.urgency === 'critical' ? 'danger' : 'warning'} size="sm" solid style={{ alignSelf: 'flex-start' }}>
                        {req.urgency.toUpperCase()}
                      </Badge>
                      <span style={{ fontSize: '0.6rem', color: 'var(--color-neutral-400)', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                        <Clock style={{ width: '0.65rem', height: '0.65rem', flexShrink: 0 }} /> Needed before {req.neededBefore}
                      </span>
                    </div>
                    <h3 style={{ fontWeight: 700, color: 'var(--color-neutral-900)', fontSize: '0.875rem' }}>{req.title}</h3>
                    <p style={{ fontSize: '0.75rem', color: 'var(--color-neutral-500)', lineHeight: '1.6', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{req.description}</p>
                  </div>

                  <div style={{ paddingTop: '0.75rem', borderTop: '1px solid var(--color-neutral-100)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem', marginTop: '0.75rem' }}>
                    <span style={{ fontSize: '0.6875rem', color: 'var(--color-neutral-400)', fontWeight: 500, flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {req.location.barangay}, {req.location.municipality}
                    </span>
                    <button
                      type="button"
                      onClick={() => setSelectedRequestForFulfill(req)}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.45rem',
                        height: '2.125rem',
                        padding: '0 0.875rem',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        whiteSpace: 'nowrap',
                        borderRadius: '9999px',
                        backgroundColor: '#f0fdf4',
                        color: '#15803d',
                        border: '1.5px solid #86efac',
                        cursor: 'pointer',
                        boxShadow: '0 1px 3px rgba(22, 163, 74, 0.1)',
                        transition: 'all 200ms cubic-bezier(0.4, 0, 0.2, 1)',
                        flexShrink: 0,
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#16a34a';
                        e.currentTarget.style.color = '#ffffff';
                        e.currentTarget.style.borderColor = '#16a34a';
                        e.currentTarget.style.transform = 'translateY(-1.5px)';
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(22, 163, 74, 0.28)';
                        const icon = e.currentTarget.querySelector('svg');
                        if (icon) icon.style.color = '#ffffff';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = '#f0fdf4';
                        e.currentTarget.style.color = '#15803d';
                        e.currentTarget.style.borderColor = '#86efac';
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 1px 3px rgba(22, 163, 74, 0.1)';
                        const icon = e.currentTarget.querySelector('svg');
                        if (icon) icon.style.color = '#16a34a';
                      }}
                    >
                      <HandHeart style={{ width: '0.875rem', height: '0.875rem', color: '#16a34a', transition: 'color 200ms', flexShrink: 0 }} />
                      <span style={{ whiteSpace: 'nowrap' }}>Fulfill Request</span>
                    </button>
                  </div>
                </Card>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </div>

      <FulfillRequestModal
        isOpen={!!selectedRequestForFulfill}
        onClose={() => setSelectedRequestForFulfill(null)}
        request={selectedRequestForFulfill}
        onSuccess={() => {
          requestsService.getRequests('active').then((reqs) => {
            setActiveRequests(reqs.slice(0, 3));
          });
        }}
      />
    </PageLayout>
  );
}
