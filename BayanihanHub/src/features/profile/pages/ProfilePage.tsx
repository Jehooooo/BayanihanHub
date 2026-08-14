import { useState } from 'react';
import { ShieldCheck, MapPin } from 'lucide-react';
import PageLayout from '@/components/layout/PageLayout';
import Card from '@/components/ui/Card';
import Avatar from '@/components/ui/Avatar';
import Badge from '@/components/ui/Badge';
import Tabs from '@/components/ui/Tabs';
import ItemCard from '@/features/items/components/ItemCard';
import { useAuthStore } from '@/stores/authStore';
import { mockItems } from '@/data/mockData';

export default function ProfilePage() {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState('posted');

  const myItems = mockItems.filter((i) => i.ownerId === user?.id || i.ownerId === 'user-1');

  return (
    <PageLayout>
      <div style={{ maxWidth: '56rem', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* Profile Banner & User Info Card */}
        <Card padding="none" style={{ position: 'relative', overflow: 'hidden', border: '1px solid var(--color-neutral-200)' }}>
          <div style={{ height: '7rem', background: 'linear-gradient(to right, var(--color-primary-700), var(--color-primary-600), var(--color-primary-800))' }} />

          <div style={{ padding: '0 1.5rem 1.5rem 1.5rem', position: 'relative', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyBetween: 'space-between', justifyContent: 'space-between', marginTop: '-3rem', paddingBottom: '1rem', borderBottom: '1px solid var(--color-neutral-100)', gap: '1rem', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: '1rem' }}>
                <Avatar
                  src={user?.avatar}
                  name={user?.fullName || 'Maria Santos'}
                  size="xl"
                  style={{ border: '4px solid #fff', boxShadow: 'var(--shadow-card)', flexShrink: 0 }}
                />
                <div style={{ marginBottom: '0.25rem' }}>
                  <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-neutral-900)', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
                    {user?.fullName || 'Maria Santos'}
                    <ShieldCheck style={{ width: '1.25rem', height: '1.25rem', color: 'var(--color-primary-600)' }} />
                  </h1>
                  <p style={{ fontSize: '0.75rem', color: 'var(--color-neutral-500)', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.25rem', margin: 0 }}>
                    <MapPin style={{ width: '0.875rem', height: '0.875rem', color: 'var(--color-primary-600)' }} /> {user?.barangay}, {user?.municipality}, {user?.province}
                  </p>
                </div>
              </div>

              {/* User Stats Pill Bar */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', textAlign: 'center', backgroundColor: 'var(--color-neutral-50)', padding: '0.75rem 1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-neutral-200)' }}>
                <div>
                  <span style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--color-neutral-900)', display: 'block' }}>
                    ★ {user?.rating || 4.8}
                  </span>
                  <span style={{ fontSize: '0.6875rem', color: 'var(--color-neutral-400)', fontWeight: 500 }}>Rating</span>
                </div>
                <div style={{ width: '1px', height: '1.75rem', backgroundColor: 'var(--color-neutral-200)' }} />
                <div>
                  <span style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--color-neutral-900)', display: 'block' }}>
                    {user?.totalExchanges || 18}
                  </span>
                  <span style={{ fontSize: '0.6875rem', color: 'var(--color-neutral-400)', fontWeight: 500 }}>Exchanges</span>
                </div>
                <div style={{ width: '1px', height: '1.75rem', backgroundColor: 'var(--color-neutral-200)' }} />
                <div>
                  <span style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--color-neutral-900)', display: 'block' }}>
                    {user?.totalDonations || 12}
                  </span>
                  <span style={{ fontSize: '0.6875rem', color: 'var(--color-neutral-400)', fontWeight: 500 }}>Donations</span>
                </div>
              </div>
            </div>

            {/* Earned Badges Row */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', paddingTop: '0.25rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-neutral-400)', textTransform: 'uppercase', letterSpacing: '0.05em', marginRight: '0.5rem' }}>Badges:</span>
              {user?.badges?.map((b) => (
                <Badge key={b.id} variant="primary" size="md">
                  {b.icon} {b.name}
                </Badge>
              ))}
            </div>
          </div>
        </Card>

        {/* Navigation Tabs */}
        <Tabs
          tabs={[
            { id: 'posted', label: 'My Listed Items', count: myItems.length },
            { id: 'favorites', label: 'Saved Items' },
            { id: 'reviews', label: 'Reviews & Ratings' },
          ]}
          activeTab={activeTab}
          onChange={setActiveTab}
        />

        {/* Tab Views */}
        {activeTab === 'posted' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.25rem' }}>
            {myItems.map((item) => (
              <ItemCard key={item.id} item={item} />
            ))}
          </div>
        )}

        {activeTab === 'reviews' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <Card style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', padding: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-neutral-900)' }}>Juan Dela Cruz</span>
                <span style={{ fontSize: '0.75rem', color: '#f59e0b', fontWeight: 700 }}>★★★★★ 5.0</span>
              </div>
              <p style={{ fontSize: '0.75rem', color: 'var(--color-neutral-600)', lineHeight: '1.6', margin: 0 }}>
                Very friendly and punctual! The textbooks were in excellent condition.
              </p>
              <span style={{ fontSize: '0.625rem', color: 'var(--color-neutral-400)', fontWeight: 500, display: 'block', paddingTop: '0.25rem' }}>June 15, 2026</span>
            </Card>
          </div>
        )}
      </div>
    </PageLayout>
  );
}

