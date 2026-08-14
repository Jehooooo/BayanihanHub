import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  PlusCircle,
  Search,
  HandHeart,
  ArrowLeftRight,
  TrendingUp,
  Package,
  Clock,
  Sparkles,
} from 'lucide-react';
import PageLayout from '@/components/layout/PageLayout';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import ItemCard from '@/features/items/components/ItemCard';
import { itemsService } from '@/services/items.service';
import { requestsService } from '@/services/requests.service';
import { useAuthStore } from '@/stores/authStore';
import type { Item, ItemRequest } from '@/types';

export default function DashboardPage() {
  const { user } = useAuthStore();

  const [recentItems, setRecentItems] = useState<Item[]>([]);
  const [activeRequests, setActiveRequests] = useState<ItemRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      itemsService.getItems({ sortBy: 'newest' }),
      requestsService.getRequests('active'),
    ]).then(([items, reqs]) => {
      setRecentItems(items.slice(0, 6));
      setActiveRequests(reqs.slice(0, 3));
      setIsLoading(false);
    });
  }, []);

  return (
    <PageLayout>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        {/* Welcome Hero Banner */}
        <div style={{ position: 'relative', overflow: 'hidden', background: 'linear-gradient(to bottom right, var(--color-primary-700), var(--color-primary-600), var(--color-primary-800))', borderRadius: 'var(--radius-xl)', padding: '1.5rem 2rem', color: '#fff', boxShadow: 'var(--shadow-elevated)' }}>
          <div style={{ position: 'relative', zIndex: 10, display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem', padding: '0.25rem 0.75rem', borderRadius: '9999px', backgroundColor: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(12px)', fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-primary-100)', width: 'fit-content' }}>
                <Sparkles style={{ width: '0.875rem', height: '0.875rem' }} /> Community Exchange & Donation
              </div>
              <h1 style={{ fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.025em' }}>
                Kumusta, {user?.fullName || 'Neighbor'}!
              </h1>
              <p style={{ fontSize: '0.8125rem', color: 'var(--color-primary-100)', maxWidth: '36rem', lineHeight: '1.6' }}>
                See what essential items your neighbors are sharing today, or post a request to get support from your barangay.
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexShrink: 0 }}>
              <Link to="/post">
                <Button
                  variant="secondary"
                  size="md"
                  className="font-bold text-xs"
                  leftIcon={<PlusCircle style={{ width: '1rem', height: '1rem' }} />}
                >
                  Post Item
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
          <Card padding="sm" style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
            <div style={{ width: '2.5rem', height: '2.5rem', borderRadius: 'var(--radius-md)', backgroundColor: '#ecfdf5', color: 'var(--color-primary-600)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Package style={{ width: '1.25rem', height: '1.25rem' }} />
            </div>
            <div>
              <p style={{ fontSize: '0.6875rem', color: 'var(--color-neutral-400)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Active Posts</p>
              <p style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--color-neutral-900)' }}>12</p>
            </div>
          </Card>

          <Card padding="sm" style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
            <div style={{ width: '2.5rem', height: '2.5rem', borderRadius: 'var(--radius-md)', backgroundColor: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <ArrowLeftRight style={{ width: '1.25rem', height: '1.25rem' }} />
            </div>
            <div>
              <p style={{ fontSize: '0.6875rem', color: 'var(--color-neutral-400)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Exchanges</p>
              <p style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--color-neutral-900)' }}>{user?.totalExchanges || 18}</p>
            </div>
          </Card>

          <Card padding="sm" style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
            <div style={{ width: '2.5rem', height: '2.5rem', borderRadius: 'var(--radius-md)', backgroundColor: '#fffbeb', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <HandHeart style={{ width: '1.25rem', height: '1.25rem' }} />
            </div>
            <div>
              <p style={{ fontSize: '0.6875rem', color: 'var(--color-neutral-400)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Donations</p>
              <p style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--color-neutral-900)' }}>{user?.totalDonations || 12}</p>
            </div>
          </Card>

          <Card padding="sm" style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
            <div style={{ width: '2.5rem', height: '2.5rem', borderRadius: 'var(--radius-md)', backgroundColor: '#faf5ff', color: '#9333ea', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <TrendingUp style={{ width: '1.25rem', height: '1.25rem' }} />
            </div>
            <div>
              <p style={{ fontSize: '0.6875rem', color: 'var(--color-neutral-400)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Rating</p>
              <p style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--color-neutral-900)' }}>★ {user?.rating || 4.8}</p>
            </div>
          </Card>
        </div>

        {/* Section: Nearby Donations & Exchanges */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <h2 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--color-neutral-900)' }}>Nearby Items & Donations</h2>
              <p style={{ fontSize: '0.75rem', color: 'var(--color-neutral-500)' }}>Recently listed in your area</p>
            </div>
            <Link to="/browse" style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-primary-600)', textDecoration: 'none' }}>
              View All →
            </Link>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.25rem' }}>
            {recentItems.map((item) => (
              <ItemCard key={item.id} item={item} />
            ))}
          </div>
        </div>

        {/* Section: Urgent Community Requests */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', paddingTop: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <h2 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--color-neutral-900)' }}>Urgent Community Requests</h2>
              <p style={{ fontSize: '0.75rem', color: 'var(--color-neutral-500)' }}>Items requested by neighbors needing help</p>
            </div>
            <Link to="/requests" style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-primary-600)', textDecoration: 'none' }}>
              See All Requests →
            </Link>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
            {activeRequests.map((req) => (
              <Card key={req.id} style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Badge variant={req.urgency === 'critical' ? 'danger' : 'warning'} size="sm">
                      {req.urgency.toUpperCase()}
                    </Badge>
                    <span style={{ fontSize: '0.625rem', color: 'var(--color-neutral-400)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <Clock style={{ width: '0.75rem', height: '0.75rem' }} /> Needed before {req.neededBefore}
                    </span>
                  </div>
                  <h3 style={{ fontWeight: 700, color: 'var(--color-neutral-900)', fontSize: '0.875rem' }}>{req.title}</h3>
                  <p style={{ fontSize: '0.75rem', color: 'var(--color-neutral-500)', lineHeight: '1.6', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{req.description}</p>
                </div>

                <div style={{ paddingTop: '0.75rem', borderTop: '1px solid var(--color-neutral-100)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.75rem' }}>
                  <span style={{ fontSize: '0.6875rem', color: 'var(--color-neutral-400)', fontWeight: 500 }}>
                    {req.location.barangay}, {req.location.municipality}
                  </span>
                  <Link to="/requests">
                    <Button variant="outline" size="sm">
                      Fulfill Request
                    </Button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
