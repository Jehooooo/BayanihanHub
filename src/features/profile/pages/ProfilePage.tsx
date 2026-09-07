import { useState } from 'react';
import { ShieldCheck, MapPin, Camera, Clock, AlertTriangle, Star, Award, Repeat, Trophy } from 'lucide-react';
import PageLayout from '@/components/layout/PageLayout';
import Card from '@/components/ui/Card';
import Avatar from '@/components/ui/Avatar';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Tabs from '@/components/ui/Tabs';
import ItemCard from '@/features/items/components/ItemCard';
import ProfilePictureUploadModal from '../components/ProfilePictureUploadModal';
import { useAuthStore } from '@/stores/authStore';
import { mockItems } from '@/data/mockData';

function getBadgeIcon(nameOrIcon?: string) {
  switch (nameOrIcon?.toLowerCase()) {
    case 'award':
    case 'trusted donor':
      return <Award style={{ width: '0.875rem', height: '0.875rem' }} />;
    case 'star':
    case 'community star':
      return <Star style={{ width: '0.875rem', height: '0.875rem' }} />;
    case 'repeat':
    case 'active exchanger':
      return <Repeat style={{ width: '0.875rem', height: '0.875rem' }} />;
    case 'trophy':
    case 'top contributor':
      return <Trophy style={{ width: '0.875rem', height: '0.875rem' }} />;
    default:
      return <Award style={{ width: '0.875rem', height: '0.875rem' }} />;
  }
}

export default function ProfilePage() {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState('posted');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  const myItems = mockItems.filter((i) => i.ownerId === user?.id || i.ownerId === 'user-1');

  return (
    <PageLayout>
      <div style={{ maxWidth: '56rem', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* Profile Banner & User Info Card */}
        <Card padding="none" style={{ position: 'relative', overflow: 'hidden', border: '1px solid var(--color-neutral-200)' }}>
          <div style={{ height: '7rem', background: 'linear-gradient(to right, var(--color-primary-700), var(--color-primary-600), var(--color-primary-800))' }} />

          <div style={{ padding: '0 1.5rem 1.5rem 1.5rem', position: 'relative', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginTop: '-3rem', paddingBottom: '1rem', borderBottom: '1px solid var(--color-neutral-100)', gap: '1rem', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: '1rem' }}>
                <div style={{ position: 'relative' }}>
                  <Avatar
                    src={user?.avatar}
                    name={user?.fullName ?? 'User'}
                    size="xl"
                    style={{ width: '6rem', height: '6rem', border: '4px solid #fff', boxShadow: 'var(--shadow-elevated)' }}
                  />
                  <button
                    onClick={() => setIsUploadModalOpen(true)}
                    style={{ position: 'absolute', bottom: 0, right: 0, padding: '0.375rem', borderRadius: '9999px', backgroundColor: 'var(--color-primary-600)', color: '#fff', border: '2px solid #fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--shadow-card)' }}
                    title="Change Profile Picture"
                  >
                    <Camera style={{ width: '0.875rem', height: '0.875rem' }} />
                  </button>
                </div>

                <div style={{ paddingBottom: '0.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <h1 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-neutral-900)', margin: 0 }}>
                      {user?.fullName || 'Maria Santos'}
                    </h1>
                    {user?.isVerified && (
                      <span title="Verified Resident" style={{ display: 'inline-flex' }}>
                        <ShieldCheck style={{ width: '1.125rem', height: '1.125rem', color: 'var(--color-primary-600)' }} />
                      </span>
                    )}
                  </div>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--color-neutral-500)', margin: '0.125rem 0 0 0' }}>
                    @{user?.username || 'mariasantos'}
                  </p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--color-neutral-400)', display: 'flex', alignItems: 'center', gap: '0.25rem', margin: '0.25rem 0 0 0' }}>
                    <MapPin style={{ width: '0.75rem', height: '0.75rem' }} />
                    {user?.barangay || 'San Isidro'}, {user?.municipality || 'Quezon City'}
                  </p>
                </div>
              </div>

              {/* User Stats Pill Bar */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', textAlign: 'center', backgroundColor: 'var(--color-neutral-50)', padding: '0.75rem 1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-neutral-200)' }}>
                <div>
                  <span style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--color-neutral-900)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem' }}>
                    <Star style={{ width: '0.9375rem', height: '0.9375rem', fill: '#f59e0b', color: '#f59e0b' }} />
                    {user?.rating || 4.8}
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
                <Badge key={b.id} variant="primary" size="md" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem' }}>
                  {getBadgeIcon(b.icon || b.name)}
                  <span>{b.name}</span>
                </Badge>
              ))}
            </div>

            {/* Profile Photo Status Info Banner */}
            {user?.avatarStatus === 'pending' && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', backgroundColor: '#fffbeb', border: '1px solid #fde68a', gap: '1rem', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8125rem', color: '#92400e' }}>
                  <Clock style={{ width: '1rem', height: '1rem', flexShrink: 0 }} />
                  <span>Your profile photo was submitted and is pending administrator review.</span>
                </div>
                <Button variant="outline" size="sm" onClick={() => setIsUploadModalOpen(true)}>
                  Update Submission
                </Button>
              </div>
            )}

            {user?.avatarStatus === 'rejected' && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', backgroundColor: '#fef2f2', border: '1px solid #fecaca', gap: '1rem', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', fontSize: '0.8125rem', color: '#991b1b' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700 }}>
                    <AlertTriangle style={{ width: '1rem', height: '1rem', flexShrink: 0 }} />
                    <span>Your photo submission was declined by an administrator.</span>
                  </div>
                  {user.avatarRejectionReason && (
                    <span style={{ fontSize: '0.75rem', color: '#b91c1c' }}>Reason: "{user.avatarRejectionReason}"</span>
                  )}
                </div>
                <Button variant="danger" size="sm" onClick={() => setIsUploadModalOpen(true)}>
                  Upload New Photo
                </Button>
              </div>
            )}
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

        {activeTab === 'favorites' && (
          <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--color-neutral-400)' }}>
            <p>Saved items will appear here.</p>
          </div>
        )}

        {activeTab === 'reviews' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <Card style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', padding: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-neutral-900)' }}>Juan Dela Cruz</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <div style={{ display: 'flex', gap: '0.125rem' }}>
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star key={i} style={{ width: '0.75rem', height: '0.75rem', fill: '#f59e0b', color: '#f59e0b' }} />
                    ))}
                  </div>
                  <span style={{ fontSize: '0.75rem', color: '#f59e0b', fontWeight: 700, marginLeft: '0.25rem' }}>5.0</span>
                </div>
              </div>
              <p style={{ fontSize: '0.75rem', color: 'var(--color-neutral-600)', lineHeight: '1.6', margin: 0 }}>
                Very friendly and punctual! The textbooks were in excellent condition.
              </p>
              <span style={{ fontSize: '0.625rem', color: 'var(--color-neutral-400)', fontWeight: 500, display: 'block', paddingTop: '0.25rem' }}>June 15, 2026</span>
            </Card>
          </div>
        )}

        <ProfilePictureUploadModal
          isOpen={isUploadModalOpen}
          onClose={() => setIsUploadModalOpen(false)}
        />
      </div>
    </PageLayout>
  );
}

