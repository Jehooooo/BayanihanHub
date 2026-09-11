import { useState, useEffect, useRef } from 'react';
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
  MoreVertical,
  Flag,
  Ban,
  ShieldAlert,
  AlertOctagon,
  CheckCircle2,
} from 'lucide-react';
import PageLayout from '@/components/layout/PageLayout';
import Card from '@/components/ui/Card';
import Avatar from '@/components/ui/Avatar';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Tabs from '@/components/ui/Tabs';
import Modal from '@/components/ui/Modal';
import ItemCard from '@/features/items/components/ItemCard';
import ProfilePictureUploadModal from '../components/ProfilePictureUploadModal';
import ReportModal from '@/features/moderation/components/ReportModal';
import { useAuthStore } from '@/stores/authStore';
import { useSavedItemsStore } from '@/stores/savedItemsStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { itemsService } from '@/services/items.service';
import { adminService } from '@/services/admin.service';
import type { User, Item } from '@/types';
import toast from 'react-hot-toast';

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
  const { blockUser, blockedUsers } = useSettingsStore();

  const isOwnProfile = !id || id === currentUser?.id;
  const [profileUser, setProfileUser] = useState<User | null>(isOwnProfile ? currentUser : null);
  const [userItems, setUserItems] = useState<Item[]>([]);
  const [savedItems, setSavedItems] = useState<Item[]>([]);
  const [activeTab, setActiveTab] = useState('posted');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // 3-dot overflow menu & modal states
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isBlockModalOpen, setIsBlockModalOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Admin moderation history states
  const isAdmin = currentUser?.role === 'admin';
  const [moderationHistory, setModerationHistory] = useState<any>(null);
  const [isLoadingModHistory, setIsLoadingModHistory] = useState(false);

  // Close overflow menu on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsMenuOpen(false);
      }
    }
    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMenuOpen]);

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
            } else {
              targetUser = null;
            }
          } else {
            targetUser = null;
          }
        } catch {
          targetUser = null;
        }
      }

      if (isMounted) {
        setProfileUser(targetUser);
      }

      try {
        const allItems = await itemsService.getItems();
        if (isMounted) {
          const targetId = String(targetUser?.id ?? (isOwnProfile ? currentUser?.id : (id ?? ''))).trim();

          const matched = allItems.filter((item) => {
            if (matchesUser(item, targetId)) return true;
            if (isOwnProfile) {
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
          setUserItems([]);
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

  // Load admin moderation history if viewing as admin
  useEffect(() => {
    if (!isAdmin || !profileUser?.id) return;

    let isMounted = true;
    setIsLoadingModHistory(true);
    adminService
      .getUserModerationHistory(profileUser.id)
      .then((data) => {
        if (isMounted) setModerationHistory(data);
      })
      .catch(() => {
        if (isMounted) {
          setModerationHistory({
            warnings: 0,
            suspensions: 0,
            removedPosts: 0,
            reportsReceived: 0,
            history: [],
          });
        }
      })
      .finally(() => {
        if (isMounted) setIsLoadingModHistory(false);
      });

    return () => {
      isMounted = false;
    };
  }, [isAdmin, profileUser?.id]);

  const displayedUser = profileUser || currentUser;
  const donationsCount = userItems.filter((i) => i.type === 'donation').length;
  const exchangesCount = userItems.filter((i) => i.type === 'exchange').length;
  const isBlocked = blockedUsers.some((b) => b.userId === displayedUser?.id);

  const handleConfirmBlock = () => {
    if (!displayedUser) return;
    blockUser({
      userId: displayedUser.id,
      fullName: displayedUser.fullName || 'Neighbor',
      username: displayedUser.username || `user_${displayedUser.id}`,
      avatar: displayedUser.avatar || '',
      blockedAt: new Date().toISOString(),
    });
    setIsBlockModalOpen(false);
    toast.success(`@${displayedUser.username || displayedUser.fullName} has been blocked.`);
  };

  return (
    <PageLayout>
      <div style={{ maxWidth: '56rem', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* Navigation Back Button */}
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

              {/* Right Side: Stats Pill Bar + 3-Dot Action Menu for Non-Self Profiles */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
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

                {/* 3-Dot Menu Button for Reporting / Blocking (Non-self only) */}
                {!isOwnProfile && (
                  <div style={{ position: 'relative' }} ref={menuRef}>
                    <button
                      type="button"
                      onClick={() => setIsMenuOpen((prev) => !prev)}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '2.5rem',
                        height: '2.5rem',
                        borderRadius: '9999px',
                        border: '1px solid var(--color-neutral-300)',
                        backgroundColor: '#ffffff',
                        cursor: 'pointer',
                        color: 'var(--color-neutral-700)',
                        transition: 'all 150ms ease',
                      }}
                      title="Profile Options"
                    >
                      <MoreVertical style={{ width: '1.125rem', height: '1.125rem' }} />
                    </button>

                    {isMenuOpen && (
                      <div
                        style={{
                          position: 'absolute',
                          right: 0,
                          top: '2.8rem',
                          width: '11.5rem',
                          backgroundColor: '#ffffff',
                          borderRadius: '0.5rem',
                          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
                          border: '1px solid var(--color-neutral-200)',
                          padding: '0.35rem',
                          zIndex: 50,
                        }}
                      >
                        <button
                          type="button"
                          onClick={() => {
                            setIsMenuOpen(false);
                            setIsReportModalOpen(true);
                          }}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            width: '100%',
                            padding: '0.5rem 0.75rem',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            color: '#b91c1c',
                            border: 'none',
                            borderRadius: '0.375rem',
                            backgroundColor: 'transparent',
                            cursor: 'pointer',
                            textAlign: 'left',
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#fef2f2')}
                          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                        >
                          <Flag style={{ width: '0.875rem', height: '0.875rem' }} />
                          <span>Report User</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setIsMenuOpen(false);
                            setIsBlockModalOpen(true);
                          }}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            width: '100%',
                            padding: '0.5rem 0.75rem',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            color: isBlocked ? '#d97706' : 'var(--color-neutral-700)',
                            border: 'none',
                            borderRadius: '0.375rem',
                            backgroundColor: 'transparent',
                            cursor: 'pointer',
                            textAlign: 'left',
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--color-neutral-100)')}
                          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                        >
                          <Ban style={{ width: '0.875rem', height: '0.875rem' }} />
                          <span>{isBlocked ? 'Blocked' : 'Block User'}</span>
                        </button>
                      </div>
                    )}
                  </div>
                )}
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

        {/* ── ADMIN MODERATION HISTORY SECTION (VISIBLE TO ADMINS ONLY) ── */}
        {isAdmin && !isOwnProfile && (
          <Card style={{ padding: '1.25rem', border: '1px solid #fed7aa', backgroundColor: '#fffaf5' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <ShieldAlert style={{ width: '1.125rem', height: '1.125rem', color: '#ea580c' }} />
                <h3 style={{ fontSize: '0.9375rem', fontWeight: 800, color: '#9a3412', margin: 0 }}>
                  Moderation History (Confidential &bull; Admin Access Only)
                </h3>
              </div>
              <span style={{ fontSize: '0.6875rem', fontWeight: 700, backgroundColor: '#ffedd5', color: '#c2410c', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>
                AUDITED
              </span>
            </div>

            {/* 4 Stat Counters */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
              <div style={{ padding: '0.75rem', backgroundColor: '#ffffff', borderRadius: '6px', border: '1px solid #fed7aa', textAlign: 'center' }}>
                <span style={{ fontSize: '0.6875rem', fontWeight: 700, color: '#9a3412', display: 'block' }}>Warnings</span>
                <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-neutral-900)' }}>
                  {moderationHistory?.warnings ?? 0}
                </span>
              </div>
              <div style={{ padding: '0.75rem', backgroundColor: '#ffffff', borderRadius: '6px', border: '1px solid #fed7aa', textAlign: 'center' }}>
                <span style={{ fontSize: '0.6875rem', fontWeight: 700, color: '#9a3412', display: 'block' }}>Suspensions</span>
                <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-neutral-900)' }}>
                  {moderationHistory?.suspensions ?? 0}
                </span>
              </div>
              <div style={{ padding: '0.75rem', backgroundColor: '#ffffff', borderRadius: '6px', border: '1px solid #fed7aa', textAlign: 'center' }}>
                <span style={{ fontSize: '0.6875rem', fontWeight: 700, color: '#9a3412', display: 'block' }}>Removed Posts</span>
                <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-neutral-900)' }}>
                  {moderationHistory?.removedPosts ?? 0}
                </span>
              </div>
              <div style={{ padding: '0.75rem', backgroundColor: '#ffffff', borderRadius: '6px', border: '1px solid #fed7aa', textAlign: 'center' }}>
                <span style={{ fontSize: '0.6875rem', fontWeight: 700, color: '#9a3412', display: 'block' }}>Reports Received</span>
                <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#b91c1c' }}>
                  {moderationHistory?.reportsReceived ?? 0}
                </span>
              </div>
            </div>

            {/* History Table */}
            <div className="bg-white rounded-md border border-neutral-200 overflow-x-auto w-full">
              <div style={{ padding: '0.5rem 0.75rem', borderBottom: '1px solid var(--color-neutral-100)', backgroundColor: 'var(--color-neutral-50)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--color-neutral-500)', textTransform: 'uppercase' }}>
                  Chronological Enforcement Log
                </span>
              </div>
              {isLoadingModHistory ? (
                <p style={{ padding: '1rem', margin: 0, fontSize: '0.75rem', color: 'var(--color-neutral-400)', textAlign: 'center' }}>
                  Loading moderation records...
                </p>
              ) : !moderationHistory?.history || moderationHistory.history.length === 0 ? (
                <div style={{ padding: '1.25rem', textAlign: 'center', color: 'var(--color-neutral-500)', fontSize: '0.75rem' }}>
                  <CheckCircle2 style={{ width: '1.25rem', height: '1.25rem', color: 'var(--color-success)', margin: '0 auto 0.25rem auto' }} />
                  <p style={{ margin: 0, fontWeight: 600 }}>Clean Moderation Record</p>
                  <p style={{ margin: '0.15rem 0 0 0', fontSize: '0.6875rem', color: 'var(--color-neutral-400)' }}>No infractions or formal actions recorded against this account.</p>
                </div>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.75rem', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--color-neutral-200)', color: 'var(--color-neutral-400)', fontSize: '0.6875rem' }}>
                      <th style={{ padding: '0.5rem 0.75rem' }}>Date</th>
                      <th style={{ padding: '0.5rem 0.75rem' }}>Action</th>
                      <th style={{ padding: '0.5rem 0.75rem' }}>Details / Reason</th>
                      <th style={{ padding: '0.5rem 0.75rem' }}>Admin</th>
                    </tr>
                  </thead>
                  <tbody>
                    {moderationHistory.history.map((h: any) => (
                      <tr key={h.id} style={{ borderBottom: '1px solid var(--color-neutral-100)' }}>
                        <td style={{ padding: '0.5rem 0.75rem', fontWeight: 600, color: 'var(--color-neutral-700)', whiteSpace: 'nowrap' }}>
                          {h.date}
                        </td>
                        <td style={{ padding: '0.5rem 0.75rem', fontWeight: 700, color: h.action.includes('SUSPEND') ? '#b91c1c' : '#d97706' }}>
                          {h.action}
                        </td>
                        <td style={{ padding: '0.5rem 0.75rem', color: 'var(--color-neutral-600)' }}>
                          {h.details || 'Administrative record'}
                        </td>
                        <td style={{ padding: '0.5rem 0.75rem', color: 'var(--color-neutral-400)', whiteSpace: 'nowrap' }}>
                          {h.admin}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </Card>
        )}

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
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
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
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
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

        {/* Upload Avatar Modal */}
        {isOwnProfile && (
          <ProfilePictureUploadModal
            isOpen={isUploadModalOpen}
            onClose={() => setIsUploadModalOpen(false)}
          />
        )}

        {/* Polymorphic Report Modal for User */}
        {!isOwnProfile && displayedUser && (
          <ReportModal
            isOpen={isReportModalOpen}
            onClose={() => setIsReportModalOpen(false)}
            targetType="user"
            targetId={displayedUser.id}
            targetTitle={`@${displayedUser.username || displayedUser.fullName || 'user'}`}
          />
        )}

        {/* Block User Confirmation Modal */}
        {!isOwnProfile && displayedUser && (
          <Modal
            isOpen={isBlockModalOpen}
            onClose={() => setIsBlockModalOpen(false)}
            title={`Block @${displayedUser.username || displayedUser.fullName}?`}
            size="sm"
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <p style={{ fontSize: '0.8125rem', color: 'var(--color-neutral-600)', margin: 0, lineHeight: 1.5 }}>
                Blocking this neighbor will prevent them from messaging you or proposing barter exchanges. You can unblock them at any time in Settings &gt; Data &amp; Privacy.
              </p>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.5rem' }}>
                <Button variant="ghost" size="sm" onClick={() => setIsBlockModalOpen(false)}>
                  Cancel
                </Button>
                <Button variant="danger" size="sm" onClick={handleConfirmBlock}>
                  Block Neighbor
                </Button>
              </div>
            </div>
          </Modal>
        )}
      </div>
    </PageLayout>
  );
}
