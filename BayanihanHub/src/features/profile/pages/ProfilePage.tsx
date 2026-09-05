import { useState } from 'react';
import { ShieldCheck, MapPin, Camera, Clock, AlertTriangle } from 'lucide-react';
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
                <div style={{ position: 'relative', display: 'inline-flex', borderRadius: '9999px' }}>
                  <Avatar
                    src={user?.avatar || (user?.avatarStatus === 'pending' ? user?.pendingAvatar : undefined)}
                    name={user?.fullName || 'Maria Santos'}
                    size="xl"
                    style={{ borderRadius: '9999px', flexShrink: 0 }}
                  />
                  <button
                    type="button"
                    onClick={() => setIsUploadModalOpen(true)}
                    title="Change Profile Picture"
                    style={{
                      position: 'absolute',
                      bottom: '2px',
                      right: '2px',
                      width: '1.875rem',
                      height: '1.875rem',
                      borderRadius: '9999px',
                      backgroundColor: 'var(--color-primary-600)',
                      color: '#fff',
                      border: '2px solid #fff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
                      transition: 'transform 120ms ease-in-out',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.1)')}
                    onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                  >
                    <Camera style={{ width: '0.9rem', height: '0.9rem' }} />
                  </button>
                </div>

                <div style={{ marginBottom: '0.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-neutral-900)', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
                      {user?.fullName || 'Maria Santos'}
                      <ShieldCheck style={{ width: '1.25rem', height: '1.25rem', color: 'var(--color-primary-600)' }} />
                    </h1>

                    {user?.avatarStatus === 'pending' && (
                      <Badge variant="warning" size="sm">
                        <Clock style={{ width: '0.75rem', height: '0.75rem', marginRight: '0.25rem' }} /> Photo Pending Approval
                      </Badge>
                    )}
                    {user?.avatarStatus === 'rejected' && (
                      <Badge variant="danger" size="sm">
                        <AlertTriangle style={{ width: '0.75rem', height: '0.75rem', marginRight: '0.25rem' }} /> Photo Rejected
                      </Badge>
                    )}
                  </div>
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

        <ProfilePictureUploadModal
          isOpen={isUploadModalOpen}
          onClose={() => setIsUploadModalOpen(false)}
        />
      </div>
    </PageLayout>
  );
}

