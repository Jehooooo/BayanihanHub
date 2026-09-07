import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
  ShieldCheck,
  MapPin,
  Camera,
  Clock,
  AlertTriangle,
  Star,
  Award,
  Repeat,
  Trophy,
  ArrowLeft,
  Package,
} from 'lucide-react';
import PageLayout from '@/components/layout/PageLayout';
import Card from '@/components/ui/Card';
import Avatar from '@/components/ui/Avatar';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Tabs from '@/components/ui/Tabs';
import ItemCard from '@/features/items/components/ItemCard';
import ProfilePictureUploadModal from '../components/ProfilePictureUploadModal';
import { useAuthStore } from '@/stores/authStore';
import { useSavedItemsStore } from '@/stores/savedItemsStore';
import { mockItems, mockUsers, getUserById } from '@/data/mockData';
import { itemsService } from '@/services/items.service';
import type { User, Item } from '@/types';

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

function matchesUser(item: Item, targetUserId?: string | number): boolean {
  if (!targetUserId) return false;
  const targetStr = String(targetUserId).trim().toLowerCase();
  const targetBare = targetStr.replace('user-', '');

  const ownerStr = String(item.ownerId ?? '').trim().toLowerCase();
  const ownerBare = ownerStr.replace('user-', '');

  const ownerObjStr = String(item.owner?.id ?? '').trim().toLowerCase();
  const ownerObjBare = ownerObjStr.replace('user-', '');

  if (ownerStr === targetStr || ownerObjStr === targetStr) return true;
  if (targetBare && (ownerBare === targetBare || ownerObjBare === targetBare)) return true;

  return false;
}

export default function ProfilePage() {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { user: currentUser } = useAuthStore();
  const { savedIds } = useSavedItemsStore();

  const isOwnProfile = !id || id === currentUser?.id;
  const [profileUser, setProfileUser] = useState<User | null>(isOwnProfile ? currentUser : null);
  const [userItems, setUserItems] = useState<Item[]>([]);
  const [savedItems, setSavedItems] = useState<Item[]>([]);
  const [activeTab, setActiveTab] = useState('posted');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch target profile and listed items from backend and local store
  useEffect(() => {
    let isMounted = true;

    const loadProfileData = async () => {
      setIsLoading(true);

      let targetUser = currentUser;

      if (!isOwnProfile && id) {
        try {
          const res = await fetch(`/api/users/profile/${encodeURIComponent(id)}`);
          if (res.ok) {
            const data = await res.json();
            if (data && data.profile) {
              targetUser = data.profile;
            }
          }
        } catch {
          // ignore
        }

        if (!targetUser) {
          targetUser = getUserById(id) || mockUsers.find((u) => u.id === id || String(u.id).endsWith(id)) || null;
        }
      }

      if (isMounted) {
        setProfileUser(targetUser);
      }

      try {
        const allItems = await itemsService.getItems();
        if (isMounted) {
          const targetId = String(targetUser?.id ?? (isOwnProfile ? (currentUser?.id ?? 'user-1') : (id ?? ''))).trim();
          const targetBare = targetId.replace('user-', '');

          const matched = allItems.filter((item) => {
            if (matchesUser(item, targetId)) return true;
            if (isOwnProfile) {
              // Current user in local session or demo user
              if (targetBare === '1' && (matchesUser(item, 'user-1') || matchesUser(item, '1'))) return true;
              if (currentUser?.id && matchesUser(item, currentUser.id)) return true;
              if (currentUser?.email && item.owner?.email === currentUser.email) return true;
            }
            return false;
          });

          setUserItems(matched);

          // Also match saved items for this user
          const matchedSaved = allItems.filter((item) => {
            const normId = String(item.id).trim();
            const bareId = normId.replace('item-', '');
            return (
              savedIds.includes(normId) ||
              savedIds.includes(`item-${bareId}`) ||
              savedIds.includes(bareId) ||
              Boolean(item.isFavorited)
            );
          });
          setSavedItems(matchedSaved);
        }
      } catch {
        if (isMounted) {
          const fallback = mockItems.filter((i) => i.ownerId === currentUser?.id || i.ownerId === 'user-1');
          setUserItems(fallback);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadProfileData();

    return () => {
      isMounted = false;
    };
  }, [id, isOwnProfile, currentUser, savedIds]);

  const displayedUser = profileUser || currentUser;
  const donationsCount = userItems.filter((i) => i.type === 'donation').length;
  const exchangesCount = userItems.filter((i) => i.type === 'exchange').length;

  return (
    <PageLayout>
      <div style={{ maxWidth: '56rem', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* Navigation Back Button — returns to Item Details (Flow 3 Branch A) or previous view */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <button
            type="button"
            onClick={() => {
              if (location.state?.returnTo) {
                navigate(location.state.returnTo);
              } else {
                navigate(-1);
              }
            }}
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
            <ArrowLeft style={{ width: '1rem', height: '1rem' }} />
            <span>{location.state?.returnTo ? 'Back to Item Details' : 'Back'}</span>
          </button>

          {!isOwnProfile && (
            <span style={{ fontSize: '0.75rem', color: 'var(--color-neutral-400)', fontWeight: 600 }}>
              Viewing Public Neighbor Profile
            </span>
          )}
        </div>

        {/* Profile Banner & User Info Card */}
        <Card padding="none" style={{ position: 'relative', overflow: 'hidden', border: '1px solid var(--color-neutral-200)' }}>
          <div style={{ height: '7rem', background: 'linear-gradient(to right, var(--color-primary-700), var(--color-primary-600), var(--color-primary-800))' }} />

          <div style={{ padding: '0 1.5rem 1.5rem 1.5rem', position: 'relative', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginTop: '-3rem', paddingBottom: '1rem', borderBottom: '1px solid var(--color-neutral-100)', gap: '1rem', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: '1rem' }}>
                <div style={{ position: 'relative', width: '6rem', height: '6rem', flexShrink: 0 }}>
                  <Avatar
                    src={displayedUser?.avatar}
                    name={displayedUser?.fullName ?? 'User'}
                    size="xl"
                    style={{ width: '100%', height: '100%', border: '4px solid #ffffff', boxShadow: 'var(--shadow-elevated)' }}
                  />
                  {isOwnProfile && (
                    <button
                      onClick={() => setIsUploadModalOpen(true)}
                      style={{
                        position: 'absolute',
                        bottom: 0,
                        right: 0,
                        width: '2rem',
                        height: '2rem',
                        padding: 0,
                        borderRadius: '9999px',
                        backgroundColor: 'var(--color-primary-600)',
                        color: '#fff',
                        border: '2px solid #ffffff',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 2px 6px rgba(0, 0, 0, 0.18)',
                        zIndex: 2,
                      }}
                      title="Change Profile Picture"
                    >
                      <Camera style={{ width: '0.9375rem', height: '0.9375rem' }} />
                    </button>
                  )}
                </div>

                <div style={{ paddingBottom: '0.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <h1 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-neutral-900)', margin: 0 }}>
                      {displayedUser?.fullName || 'Resident Profile'}
                    </h1>
                    {displayedUser?.isVerified && (
                      <span title="Verified Resident" style={{ display: 'inline-flex' }}>
                        <ShieldCheck style={{ width: '1.125rem', height: '1.125rem', color: 'var(--color-primary-600)' }} />
                      </span>
                    )}
                  </div>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--color-neutral-500)', margin: '0.125rem 0 0 0' }}>
                    @{displayedUser?.username || 'neighbor'}
                  </p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--color-neutral-400)', display: 'flex', alignItems: 'center', gap: '0.25rem', margin: '0.25rem 0 0 0' }}>
                    <MapPin style={{ width: '0.75rem', height: '0.75rem' }} />
                    {displayedUser?.barangay || 'San Isidro'}, {displayedUser?.municipality || 'Quezon City'}
                  </p>
                </div>
              </div>

              {/* User Stats Pill Bar */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', textAlign: 'center', backgroundColor: 'var(--color-neutral-50)', padding: '0.75rem 1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-neutral-200)' }}>
                <div>
                  <span style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--color-neutral-900)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem' }}>
                    <Star style={{ width: '0.9375rem', height: '0.9375rem', fill: '#f59e0b', color: '#f59e0b' }} />
                    {displayedUser?.rating || 4.9}
                  </span>
                  <span style={{ fontSize: '0.6875rem', color: 'var(--color-neutral-400)', fontWeight: 500 }}>Rating</span>
                </div>
                <div style={{ width: '1px', height: '1.75rem', backgroundColor: 'var(--color-neutral-200)' }} />
                <div>
                  <span style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--color-neutral-900)', display: 'block' }}>
                    {Math.max(displayedUser?.totalExchanges || 0, exchangesCount)}
                  </span>
                  <span style={{ fontSize: '0.6875rem', color: 'var(--color-neutral-400)', fontWeight: 500 }}>Exchanges</span>
                </div>
                <div style={{ width: '1px', height: '1.75rem', backgroundColor: 'var(--color-neutral-200)' }} />
                <div>
                  <span style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--color-neutral-900)', display: 'block' }}>
                    {Math.max(displayedUser?.totalDonations || 0, donationsCount)}
                  </span>
                  <span style={{ fontSize: '0.6875rem', color: 'var(--color-neutral-400)', fontWeight: 500 }}>Donations</span>
                </div>
              </div>
            </div>

            {/* Earned Badges Row */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', paddingTop: '0.25rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-neutral-400)', textTransform: 'uppercase', letterSpacing: '0.05em', marginRight: '0.5rem' }}>Badges:</span>
              {(displayedUser?.badges && displayedUser.badges.length > 0
                ? displayedUser.badges
                : [
                    { id: 'b1', name: 'Trusted Donor', icon: 'award', description: 'Completed 10+ donations' },
                    { id: 'b2', name: 'Community Star', icon: 'star', description: 'Rated 4.5+ average' },
                  ]
              ).map((b) => (
                <Badge
                  key={typeof b === 'string' ? b : b.id}
                  variant="primary"
                  size="md"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.45rem',
                    padding: '0.35rem 0.85rem',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    whiteSpace: 'nowrap',
                  }}
                >
                  {getBadgeIcon(typeof b === 'string' ? b : (b.icon || b.name))}
                  <span>{typeof b === 'string' ? b : b.name}</span>
                </Badge>
              ))}
            </div>

            {/* Profile Photo Status Info Banner (Self Only) */}
            {isOwnProfile && currentUser?.avatarStatus === 'pending' && (
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

            {isOwnProfile && currentUser?.avatarStatus === 'rejected' && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', backgroundColor: '#fef2f2', border: '1px solid #fecaca', gap: '1rem', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', fontSize: '0.8125rem', color: '#991b1b' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700 }}>
                    <AlertTriangle style={{ width: '1rem', height: '1rem', flexShrink: 0 }} />
                    <span>Your photo submission was declined by an administrator.</span>
                  </div>
                  {currentUser.avatarRejectionReason && (
                    <span style={{ fontSize: '0.75rem', color: '#b91c1c' }}>Reason: "{currentUser.avatarRejectionReason}"</span>
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
            { id: 'posted', label: isOwnProfile ? 'My Listed Items' : 'Posted Items', count: userItems.length },
            ...(isOwnProfile ? [{ id: 'favorites', label: 'Saved Items', count: savedItems.length }] : []),
            { id: 'reviews', label: 'Reviews & Ratings' },
          ]}
          activeTab={activeTab}
          onChange={setActiveTab}
        />

        {/* Tab Views */}
        {activeTab === 'posted' && (
          <div>
            {userItems.length > 0 ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.25rem' }}>
                {userItems.map((item) => (
                  <ItemCard key={item.id} item={item} />
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--color-neutral-400)', backgroundColor: '#ffffff', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-neutral-200)' }}>
                <Package style={{ width: '2rem', height: '2rem', margin: '0 auto 0.5rem auto', color: 'var(--color-neutral-300)' }} />
                <p style={{ margin: 0, fontWeight: 600 }}>No listed items available yet.</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'favorites' && isOwnProfile && (
          <div>
            {savedItems.length > 0 ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.25rem' }}>
                {savedItems.map((item) => (
                  <ItemCard key={item.id} item={item} />
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--color-neutral-400)', backgroundColor: '#ffffff', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-neutral-200)' }}>
                <Package style={{ width: '2rem', height: '2rem', margin: '0 auto 0.5rem auto', color: 'var(--color-neutral-300)' }} />
                <p style={{ margin: 0, fontWeight: 600 }}>No saved items yet.</p>
              </div>
            )}
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
                Very friendly and punctual! The items were in excellent condition. Great neighbor!
              </p>
              <span style={{ fontSize: '0.625rem', color: 'var(--color-neutral-400)', fontWeight: 500, display: 'block', paddingTop: '0.25rem' }}>June 15, 2026</span>
            </Card>
          </div>
        )}

        {isOwnProfile && (
          <ProfilePictureUploadModal
            isOpen={isUploadModalOpen}
            onClose={() => setIsUploadModalOpen(false)}
          />
        )}
      </div>
    </PageLayout>
  );
}
