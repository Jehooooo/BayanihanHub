import { useState, useEffect } from 'react';
import {
  Star,
  Trash2,
  Search,
  AlertCircle,
  Calendar,
  ArrowUpDown,
  Link as LinkIcon,
  ShieldCheck,
  Award,
  Trophy,
  Eye,
  EyeOff,
  RotateCcw,
  Clock,
  CheckCircle2,
  X,
  ExternalLink,
  MessageSquare,
  Sparkles,
  HelpCircle,
} from 'lucide-react';
import { Ring } from '@/components/ui/ring';
import { adminService } from '@/services/admin.service';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Avatar from '@/components/ui/Avatar';
import { Link } from 'react-router-dom';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import toast from 'react-hot-toast';
import SEO from '@/components/common/SEO';
import { format } from 'date-fns';

export default function ManageRatingsPage() {
  const [activeTab, setActiveTab] = useState<'ratings' | 'rankings'>('ratings');

  // --- Ratings Tab State ---
  const [ratings, setRatings] = useState<any[]>([]);
  const [isLoadingRatings, setIsLoadingRatings] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [scoreFilter, setScoreFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortField, setSortField] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');

  // Modals for Ratings
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [targetRating, setTargetRating] = useState<any | null>(null);
  const [targetNewStatus, setTargetNewStatus] = useState<'active' | 'hidden'>('hidden');
  const [moderationReason, setModerationReason] = useState('');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [ratingToDelete, setRatingToDelete] = useState<any | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // --- Rankings Tab State ---
  const [rankingsData, setRankingsData] = useState<{
    summary: {
      totalUsers: number;
      totalRatedUsers: number;
      totalRatings: number;
      platformAverageRating: number | null;
      topRatedUser: { name: string; average: number | null; ratings: number } | null;
    };
    rankings: any[];
  }>({
    summary: {
      totalUsers: 0,
      totalRatedUsers: 0,
      totalRatings: 0,
      platformAverageRating: null,
      topRatedUser: null,
    },
    rankings: [],
  });
  const [isLoadingRankings, setIsLoadingRankings] = useState(true);
  const [rankingSearch, setRankingSearch] = useState('');
  const [tierFilter, setTierFilter] = useState('all');
  const [rankingSortBy, setRankingSortBy] = useState('rank');

  // Badge Modals
  const [availableBadges, setAvailableBadges] = useState<any[]>([]);
  const [awardModalOpen, setAwardModalOpen] = useState(false);
  const [selectedUserForBadge, setSelectedUserForBadge] = useState<any | null>(null);
  const [selectedBadgeId, setSelectedBadgeId] = useState<number | null>(null);
  const [badgeReason, setBadgeReason] = useState('');
  const [isAwardingBadge, setIsAwardingBadge] = useState(false);

  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [selectedUserForHistory, setSelectedUserForHistory] = useState<any | null>(null);
  const [badgeHistory, setBadgeHistory] = useState<any[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [isRevokingBadge, setIsRevokingBadge] = useState<number | null>(null);

  // --- Data Fetching ---
  const fetchRatings = async () => {
    setIsLoadingRatings(true);
    try {
      const data = await adminService.getRatings({
        status: statusFilter !== 'all' ? statusFilter : undefined,
        score: scoreFilter !== 'all' ? parseInt(scoreFilter, 10) : undefined,
      });
      setRatings(Array.isArray(data) ? data : (data.ratings || []));
    } catch (err) {
      console.error(err);
      toast.error('Failed to load ratings');
    } finally {
      setIsLoadingRatings(false);
    }
  };

  const fetchRankings = async () => {
    setIsLoadingRankings(true);
    try {
      const res = await adminService.getRankings({
        search: rankingSearch || undefined,
        reputationLevel: tierFilter !== 'all' ? tierFilter : undefined,
        sortBy: rankingSortBy,
      });
      setRankingsData(res);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load user rankings');
    } finally {
      setIsLoadingRankings(false);
    }
  };

  const fetchBadges = async () => {
    try {
      const b = await adminService.getBadges();
      setAvailableBadges(b);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchRatings();
    fetchBadges();
  }, [statusFilter, scoreFilter]);

  useEffect(() => {
    if (activeTab === 'rankings') {
      fetchRankings();
    }
  }, [activeTab, rankingSortBy, tierFilter]);

  // Handle Search for Rankings on enter or debounce
  const handleRankingSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchRankings();
  };

  // --- Moderation Actions ---
  const openStatusChangeModal = (rating: any, newStatus: 'active' | 'hidden') => {
    setTargetRating(rating);
    setTargetNewStatus(newStatus);
    setModerationReason(
      newStatus === 'hidden'
        ? 'Inappropriate content or guideline violation'
        : 'Restored after admin review'
    );
    setStatusModalOpen(true);
  };

  const handleConfirmStatusChange = async () => {
    if (!targetRating) return;
    setIsUpdatingStatus(true);
    try {
      const res = await adminService.updateRatingStatus(
        targetRating.id,
        targetNewStatus,
        moderationReason
      );
      if (res.success) {
        toast.success(
          targetNewStatus === 'hidden'
            ? 'Rating hidden and excluded from public reputation'
            : 'Rating restored to active status'
        );
        setRatings((prev) =>
          prev.map((r) => (r.id === targetRating.id ? { ...r, status: targetNewStatus } : r))
        );
        setStatusModalOpen(false);
        // Refresh rankings summary if needed
        fetchRankings();
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to update rating status');
    } finally {
      setIsUpdatingStatus(false);
      setTargetRating(null);
    }
  };

  const handleDelete = async () => {
    if (!ratingToDelete) return;
    setIsDeleting(true);
    try {
      const success = await adminService.deleteRating(ratingToDelete.id, false);
      if (success) {
        toast.success('Rating moderated (status set to hidden)');
        setRatings((prev) =>
          prev.map((r) => (r.id === ratingToDelete.id ? { ...r, status: 'hidden' } : r))
        );
      } else {
        toast.error('Failed to moderate rating');
      }
    } catch (err) {
      toast.error('Error occurred while deleting rating');
    } finally {
      setIsDeleting(false);
      setDeleteModalOpen(false);
      setRatingToDelete(null);
    }
  };

  // --- Badge Awarding ---
  const openAwardModal = (user: any) => {
    setSelectedUserForBadge(user);
    setSelectedBadgeId(availableBadges[0]?.id || null);
    setBadgeReason('');
    setAwardModalOpen(true);
  };

  const handleAwardBadgeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserForBadge || !selectedBadgeId) return;
    setIsAwardingBadge(true);
    try {
      const res = await adminService.awardBadge(
        selectedUserForBadge.userId || selectedUserForBadge.id,
        selectedBadgeId,
        badgeReason || 'Awarded by administrator'
      );
      toast.success(res.message || 'Badge awarded successfully!');
      setAwardModalOpen(false);
      fetchRankings();
    } catch (err: any) {
      toast.error(err.message || 'Failed to award badge');
    } finally {
      setIsAwardingBadge(false);
    }
  };

  // --- Badge History & Revocation ---
  const openHistoryModal = async (user: any) => {
    setSelectedUserForHistory(user);
    setHistoryModalOpen(true);
    setIsLoadingHistory(true);
    try {
      const history = await adminService.getUserBadgeHistory(user.userId || user.id);
      setBadgeHistory(history);
    } catch (err) {
      toast.error('Failed to load badge history');
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const handleRevokeBadge = async (badgeId: number, badgeName: string) => {
    if (!selectedUserForHistory) return;
    const confirmRevoke = window.confirm(`Are you sure you want to revoke the '${badgeName}' badge?`);
    if (!confirmRevoke) return;

    setIsRevokingBadge(badgeId);
    try {
      const res = await adminService.revokeBadge(
        selectedUserForHistory.userId || selectedUserForHistory.id,
        badgeId,
        'Revoked by administrator'
      );
      toast.success(res.message || 'Badge revoked successfully');
      // Refresh modal list
      const updatedHistory = await adminService.getUserBadgeHistory(
        selectedUserForHistory.userId || selectedUserForHistory.id
      );
      setBadgeHistory(updatedHistory);
      fetchRankings();
    } catch (err: any) {
      toast.error(err.message || 'Failed to revoke badge');
    } finally {
      setIsRevokingBadge(null);
    }
  };

  // Filter & Sort Ratings
  const filteredRatings = ratings.filter((r) => {
    const term = searchTerm.toLowerCase();
    const raterMatch =
      r.rater?.fullName?.toLowerCase().includes(term) ||
      r.rater?.username?.toLowerCase().includes(term);
    const ratedMatch =
      r.ratedUser?.fullName?.toLowerCase().includes(term) ||
      r.ratedUser?.username?.toLowerCase().includes(term);
    const reviewMatch = r.review?.toLowerCase().includes(term);
    return raterMatch || ratedMatch || reviewMatch;
  });

  const sortedRatings = [...filteredRatings].sort((a, b) => {
    let valA: any;
    let valB: any;
    if (sortField === 'score') {
      valA = a.score;
      valB = b.score;
    } else {
      valA = new Date(a.createdAt).getTime();
      valB = new Date(b.createdAt).getTime();
    }
    if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
    if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const getTierColor = (tier: string) => {
    switch (tier?.toLowerCase()) {
      case 'outstanding':
        return { bg: '#fdf2f8', text: '#9d174d', border: '#fbcfe8' };
      case 'top contributor':
        return { bg: '#eff6ff', text: '#1d4ed8', border: '#bfdbfe' };
      case 'very trusted':
        return { bg: '#f0fdf4', text: '#15803d', border: '#bbf7d0' };
      case 'trusted':
        return { bg: '#ecfdf5', text: '#047857', border: '#a7f3d0' };
      default:
        return { bg: '#f8fafc', text: '#64748b', border: '#e2e8f0' };
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem', maxWidth: '1200px', margin: '0 auto', paddingBottom: '3rem' }}>
      <SEO title="Ratings & Reputation Management | Admin" noindex={true} />

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            <div style={{ width: '2.5rem', height: '2.5rem', borderRadius: '10px', backgroundColor: 'var(--color-primary-50)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-primary-600)' }}>
              <Star style={{ width: '1.375rem', height: '1.375rem', fill: 'var(--color-primary-100)' }} />
            </div>
            <h1 style={{ fontSize: '1.625rem', fontWeight: 800, color: 'var(--color-neutral-900)', margin: 0, letterSpacing: '-0.025em' }}>
              Ratings & Reputation Management
            </h1>
          </div>
          <p style={{ fontSize: '0.875rem', color: 'var(--color-neutral-500)', margin: '0.375rem 0 0 0' }}>
            Audit ratings, moderate feedback with complete history preservation, inspect Bayesian rankings, and award community badges.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              if (activeTab === 'ratings') fetchRatings();
              else fetchRankings();
            }}
          >
            <RotateCcw style={{ width: '0.875rem', height: '0.875rem', marginRight: '0.375rem' }} />
            Refresh Data
          </Button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
        <Card padding="md" style={{ borderRadius: '14px', border: '1px solid var(--color-neutral-200)', background: '#fff' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <p style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-neutral-500)', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>
                Total Verified Ratings
              </p>
              <h3 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--color-neutral-900)', margin: '0.25rem 0 0 0' }}>
                {rankingsData.summary.totalRatings || ratings.length}
              </h3>
            </div>
            <div style={{ width: '2.75rem', height: '2.75rem', borderRadius: '10px', backgroundColor: '#eef2ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4f46e5' }}>
              <MessageSquare style={{ width: '1.375rem', height: '1.375rem' }} />
            </div>
          </div>
          <div style={{ marginTop: '0.75rem', fontSize: '0.75rem', color: 'var(--color-neutral-500)' }}>
            Recorded from completed community interactions
          </div>
        </Card>

        <Card padding="md" style={{ borderRadius: '14px', border: '1px solid var(--color-neutral-200)', background: '#fff' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <p style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-neutral-500)', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>
                Platform Average Rating
              </p>
              <h3 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--color-neutral-900)', margin: '0.25rem 0 0 0', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                <Star style={{ width: '1.25rem', height: '1.25rem', color: '#f59e0b', fill: '#f59e0b' }} />
                {rankingsData.summary.platformAverageRating !== null
                  ? `${rankingsData.summary.platformAverageRating.toFixed(1)} / 5.0`
                  : 'N/A'}
              </h3>
            </div>
            <div style={{ width: '2.75rem', height: '2.75rem', borderRadius: '10px', backgroundColor: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#d97706' }}>
              <Sparkles style={{ width: '1.375rem', height: '1.375rem' }} />
            </div>
          </div>
          <div style={{ marginTop: '0.75rem', fontSize: '0.75rem', color: 'var(--color-neutral-500)' }}>
            Average of active verified feedback
          </div>
        </Card>

        <Card padding="md" style={{ borderRadius: '14px', border: '1px solid var(--color-neutral-200)', background: '#fff' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <p style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-neutral-500)', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>
                Rated Community Members
              </p>
              <h3 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--color-neutral-900)', margin: '0.25rem 0 0 0' }}>
                {rankingsData.summary.totalRatedUsers}
              </h3>
            </div>
            <div style={{ width: '2.75rem', height: '2.75rem', borderRadius: '10px', backgroundColor: '#ecfdf5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#059669' }}>
              <ShieldCheck style={{ width: '1.375rem', height: '1.375rem' }} />
            </div>
          </div>
          <div style={{ marginTop: '0.75rem', fontSize: '0.75rem', color: 'var(--color-neutral-500)' }}>
            Users with at least 1 verified rating
          </div>
        </Card>

        <Card padding="md" style={{ borderRadius: '14px', border: '1px solid var(--color-neutral-200)', background: '#fff' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <p style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-neutral-500)', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>
                Top Rated Member
              </p>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--color-neutral-900)', margin: '0.375rem 0 0 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '160px' }}>
                {rankingsData.summary.topRatedUser?.name || 'None'}
              </h3>
            </div>
            <div style={{ width: '2.75rem', height: '2.75rem', borderRadius: '10px', backgroundColor: '#faf5ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9333ea' }}>
              <Trophy style={{ width: '1.375rem', height: '1.375rem' }} />
            </div>
          </div>
          <div style={{ marginTop: '0.75rem', fontSize: '0.75rem', color: 'var(--color-neutral-500)' }}>
            {rankingsData.summary.topRatedUser?.average ? `★ ${rankingsData.summary.topRatedUser.average.toFixed(1)} (${rankingsData.summary.topRatedUser.ratings} ratings)` : 'No ratings recorded'}
          </div>
        </Card>
      </div>

      {/* Tabs Selector */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--color-neutral-200)', gap: '1.5rem' }}>
        <button
          onClick={() => setActiveTab('ratings')}
          style={{
            padding: '0.75rem 0.25rem',
            border: 'none',
            borderBottom: activeTab === 'ratings' ? '2px solid var(--color-primary-600)' : '2px solid transparent',
            background: 'none',
            fontWeight: activeTab === 'ratings' ? 700 : 500,
            fontSize: '0.9375rem',
            color: activeTab === 'ratings' ? 'var(--color-primary-700)' : 'var(--color-neutral-500)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            transition: 'all 150ms ease',
          }}
        >
          <Star style={{ width: '1rem', height: '1rem' }} />
          Ratings & Moderation
          <span style={{ fontSize: '0.75rem', padding: '0.125rem 0.5rem', borderRadius: '9999px', backgroundColor: activeTab === 'ratings' ? 'var(--color-primary-100)' : 'var(--color-neutral-100)', color: activeTab === 'ratings' ? 'var(--color-primary-800)' : 'var(--color-neutral-600)' }}>
            {ratings.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('rankings')}
          style={{
            padding: '0.75rem 0.25rem',
            border: 'none',
            borderBottom: activeTab === 'rankings' ? '2px solid var(--color-primary-600)' : '2px solid transparent',
            background: 'none',
            fontWeight: activeTab === 'rankings' ? 700 : 500,
            fontSize: '0.9375rem',
            color: activeTab === 'rankings' ? 'var(--color-primary-700)' : 'var(--color-neutral-500)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            transition: 'all 150ms ease',
          }}
        >
          <Trophy style={{ width: '1rem', height: '1rem' }} />
          User Rankings & Badges
          <span style={{ fontSize: '0.75rem', padding: '0.125rem 0.5rem', borderRadius: '9999px', backgroundColor: activeTab === 'rankings' ? 'var(--color-primary-100)' : 'var(--color-neutral-100)', color: activeTab === 'rankings' ? 'var(--color-primary-800)' : 'var(--color-neutral-600)' }}>
            Leaderboard
          </span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: RATINGS & MODERATION */}
      {/* ========================================================================= */}
      {activeTab === 'ratings' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Controls Bar */}
          <Card padding="md" style={{ borderRadius: '12px' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ position: 'relative', flex: '1 1 280px', maxWidth: '380px' }}>
                <Search style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', width: '1.125rem', height: '1.125rem', color: 'var(--color-neutral-400)' }} />
                <input
                  type="text"
                  placeholder="Search reviewer, recipient, or comment..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.5625rem 1rem 0.5625rem 2.5rem',
                    borderRadius: '8px',
                    border: '1px solid var(--color-neutral-300)',
                    fontSize: '0.875rem',
                    outline: 'none',
                  }}
                />
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center' }}>
                {/* Score Filter */}
                <select
                  value={scoreFilter}
                  onChange={(e) => setScoreFilter(e.target.value)}
                  style={{
                    padding: '0.5625rem 0.875rem',
                    borderRadius: '8px',
                    border: '1px solid var(--color-neutral-300)',
                    fontSize: '0.875rem',
                    backgroundColor: '#fff',
                    outline: 'none',
                  }}
                >
                  <option value="all">All Stars (1–5)</option>
                  <option value="5">5 Stars only</option>
                  <option value="4">4 Stars only</option>
                  <option value="3">3 Stars only</option>
                  <option value="2">2 Stars only</option>
                  <option value="1">1 Star only</option>
                </select>

                {/* Moderation Status Filter */}
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  style={{
                    padding: '0.5625rem 0.875rem',
                    borderRadius: '8px',
                    border: '1px solid var(--color-neutral-300)',
                    fontSize: '0.875rem',
                    backgroundColor: '#fff',
                    outline: 'none',
                  }}
                >
                  <option value="all">All Statuses</option>
                  <option value="active">Active only</option>
                  <option value="hidden">Hidden only</option>
                </select>
              </div>
            </div>
          </Card>

          {/* Ratings Table */}
          <Card padding="none" style={{ overflow: 'hidden', borderRadius: '12px', border: '1px solid var(--color-neutral-200)' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '780px' }}>
                <thead style={{ backgroundColor: 'var(--color-neutral-50)', borderBottom: '1px solid var(--color-neutral-200)' }}>
                  <tr>
                    <th style={{ padding: '0.875rem 1rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-neutral-500)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Author</th>
                    <th style={{ padding: '0.875rem 1rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-neutral-500)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Recipient</th>
                    <th
                      onClick={() => handleSort('score')}
                      style={{ cursor: 'pointer', padding: '0.875rem 1rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-neutral-500)', textTransform: 'uppercase', letterSpacing: '0.05em' }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        Score <ArrowUpDown style={{ width: '0.875rem', height: '0.875rem' }} />
                      </div>
                    </th>
                    <th style={{ padding: '0.875rem 1rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-neutral-500)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Review Comment</th>
                    <th style={{ padding: '0.875rem 1rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-neutral-500)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Context</th>
                    <th style={{ padding: '0.875rem 1rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-neutral-500)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Status</th>
                    <th
                      onClick={() => handleSort('date')}
                      style={{ cursor: 'pointer', padding: '0.875rem 1rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-neutral-500)', textTransform: 'uppercase', letterSpacing: '0.05em' }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        Date <ArrowUpDown style={{ width: '0.875rem', height: '0.875rem' }} />
                      </div>
                    </th>
                    <th style={{ padding: '0.875rem 1rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-neutral-500)', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'right' }}>Moderation</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoadingRatings ? (
                    <tr>
                      <td colSpan={8} style={{ padding: '3.5rem', textAlign: 'center' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                          <Ring className="w-8 h-8 text-primary-600" />
                          <span style={{ fontSize: '0.875rem', color: 'var(--color-neutral-500)', fontWeight: 500 }}>Loading verified ratings...</span>
                        </div>
                      </td>
                    </tr>
                  ) : sortedRatings.length === 0 ? (
                    <tr>
                      <td colSpan={8} style={{ padding: '4rem 2rem', textAlign: 'center' }}>
                        <AlertCircle style={{ width: '3rem', height: '3rem', color: 'var(--color-neutral-300)', margin: '0 auto 0.75rem auto' }} />
                        <h3 style={{ margin: '0 0 0.375rem 0', fontSize: '1.0625rem', fontWeight: 700, color: 'var(--color-neutral-800)' }}>No ratings found</h3>
                        <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--color-neutral-500)' }}>
                          No rating records match the specified search or filter criteria.
                        </p>
                      </td>
                    </tr>
                  ) : (
                    sortedRatings.map((rating) => (
                      <tr
                        key={rating.id}
                        style={{
                          borderBottom: '1px solid var(--color-neutral-100)',
                          backgroundColor: rating.status === 'hidden' ? '#fffbeb' : 'transparent',
                          transition: 'background-color 150ms ease',
                        }}
                      >
                        {/* Author */}
                        <td style={{ padding: '1rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                            <Avatar name={rating.rater?.fullName || 'User'} src={rating.rater?.avatar} size="sm" />
                            <div>
                              <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-neutral-900)' }}>
                                {rating.rater?.fullName || 'Neighbor'}
                              </div>
                              <div style={{ fontSize: '0.75rem', color: 'var(--color-neutral-500)' }}>
                                @{rating.rater?.username || 'user'}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Recipient */}
                        <td style={{ padding: '1rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                            <Avatar name={rating.ratedUser?.fullName || 'User'} src={rating.ratedUser?.avatar} size="sm" />
                            <div>
                              <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-neutral-900)' }}>
                                {rating.ratedUser?.fullName || 'Neighbor'}
                              </div>
                              <div style={{ fontSize: '0.75rem', color: 'var(--color-neutral-500)' }}>
                                @{rating.ratedUser?.username || 'user'}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Score */}
                        <td style={{ padding: '1rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            {[1, 2, 3, 4, 5].map((starVal) => (
                              <svg
                                key={starVal}
                                style={{
                                  width: '0.875rem',
                                  height: '0.875rem',
                                  color: starVal <= rating.score ? '#f59e0b' : '#e2e8f0',
                                  fill: starVal <= rating.score ? '#f59e0b' : 'none',
                                }}
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                              </svg>
                            ))}
                            <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--color-neutral-800)', marginLeft: '0.25rem' }}>
                              {rating.score}
                            </span>
                          </div>
                        </td>

                        {/* Review text */}
                        <td style={{ padding: '1rem', maxWidth: '240px' }}>
                          {rating.review ? (
                            <p
                              style={{
                                margin: 0,
                                fontSize: '0.8125rem',
                                color: 'var(--color-neutral-700)',
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden',
                                lineHeight: '1.4',
                              }}
                              title={rating.review}
                            >
                              "{rating.review}"
                            </p>
                          ) : (
                            <span style={{ fontSize: '0.75rem', color: 'var(--color-neutral-400)', fontStyle: 'italic' }}>
                              No written comment
                            </span>
                          )}
                        </td>

                        {/* Transaction Context */}
                        <td style={{ padding: '1rem' }}>
                          {rating.exchangeId ? (
                            <Link
                              to={`/exchanges/${rating.exchangeId}`}
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.25rem',
                                fontSize: '0.75rem',
                                fontWeight: 600,
                                color: 'var(--color-primary-700)',
                                textDecoration: 'none',
                                backgroundColor: 'var(--color-primary-50)',
                                padding: '0.25rem 0.5rem',
                                borderRadius: '6px',
                                border: '1px solid var(--color-primary-100)',
                              }}
                            >
                              <LinkIcon style={{ width: '0.75rem', height: '0.75rem' }} /> Deal #{rating.exchangeId}
                            </Link>
                          ) : (
                            <span style={{ fontSize: '0.75rem', color: 'var(--color-neutral-400)' }}>Direct</span>
                          )}
                        </td>

                        {/* Status */}
                        <td style={{ padding: '1rem' }}>
                          {rating.status === 'hidden' ? (
                            <span
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.25rem',
                                padding: '0.25rem 0.625rem',
                                borderRadius: '9999px',
                                fontSize: '0.75rem',
                                fontWeight: 600,
                                backgroundColor: '#fef3c7',
                                color: '#b45309',
                                border: '1px solid #fde68a',
                              }}
                            >
                              <EyeOff style={{ width: '0.75rem', height: '0.75rem' }} /> Hidden
                            </span>
                          ) : (
                            <span
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.25rem',
                                padding: '0.25rem 0.625rem',
                                borderRadius: '9999px',
                                fontSize: '0.75rem',
                                fontWeight: 600,
                                backgroundColor: '#ecfdf5',
                                color: '#047857',
                                border: '1px solid #a7f3d0',
                              }}
                            >
                              <CheckCircle2 style={{ width: '0.75rem', height: '0.75rem' }} /> Active
                            </span>
                          )}
                        </td>

                        {/* Date */}
                        <td style={{ padding: '1rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.75rem', color: 'var(--color-neutral-500)' }}>
                            <Calendar style={{ width: '0.8125rem', height: '0.8125rem' }} />
                            {rating.createdAt ? format(new Date(rating.createdAt), 'MMM d, yyyy') : 'N/A'}
                          </div>
                        </td>

                        {/* Actions */}
                        <td style={{ padding: '1rem', textAlign: 'right' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.5rem' }}>
                            {rating.status === 'hidden' ? (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => openStatusChangeModal(rating, 'active')}
                                style={{ padding: '0.3125rem 0.625rem', fontSize: '0.75rem', color: '#047857', borderColor: '#a7f3d0' }}
                              >
                                <Eye style={{ width: '0.75rem', height: '0.75rem', marginRight: '0.25rem' }} />
                                Restore
                              </Button>
                            ) : (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => openStatusChangeModal(rating, 'hidden')}
                                style={{ padding: '0.3125rem 0.625rem', fontSize: '0.75rem', color: '#b45309', borderColor: '#fde68a' }}
                              >
                                <EyeOff style={{ width: '0.75rem', height: '0.75rem', marginRight: '0.25rem' }} />
                                Hide
                              </Button>
                            )}

                            <Button
                              variant="danger"
                              size="sm"
                              onClick={() => {
                                setRatingToDelete(rating);
                                setDeleteModalOpen(true);
                              }}
                              style={{ padding: '0.3125rem 0.625rem', fontSize: '0.75rem' }}
                            >
                              <Trash2 style={{ width: '0.75rem', height: '0.75rem' }} />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: USER RANKINGS & BADGES */}
      {/* ========================================================================= */}
      {activeTab === 'rankings' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Controls Bar */}
          <Card padding="md" style={{ borderRadius: '12px' }}>
            <form onSubmit={handleRankingSearchSubmit} style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ position: 'relative', flex: '1 1 280px', maxWidth: '380px' }}>
                <Search style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', width: '1.125rem', height: '1.125rem', color: 'var(--color-neutral-400)' }} />
                <input
                  type="text"
                  placeholder="Search user name, @username, email..."
                  value={rankingSearch}
                  onChange={(e) => setRankingSearch(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.5625rem 1rem 0.5625rem 2.5rem',
                    borderRadius: '8px',
                    border: '1px solid var(--color-neutral-300)',
                    fontSize: '0.875rem',
                    outline: 'none',
                  }}
                />
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center' }}>
                {/* Reputation Tier Filter */}
                <select
                  value={tierFilter}
                  onChange={(e) => setTierFilter(e.target.value)}
                  style={{
                    padding: '0.5625rem 0.875rem',
                    borderRadius: '8px',
                    border: '1px solid var(--color-neutral-300)',
                    fontSize: '0.875rem',
                    backgroundColor: '#fff',
                    outline: 'none',
                  }}
                >
                  <option value="all">All Reputation Tiers</option>
                  <option value="Outstanding">Outstanding</option>
                  <option value="Top Contributor">Top Contributor</option>
                  <option value="Very Trusted">Very Trusted</option>
                  <option value="Trusted">Trusted</option>
                  <option value="New Member">New Member</option>
                </select>

                {/* Sort dropdown */}
                <select
                  value={rankingSortBy}
                  onChange={(e) => setRankingSortBy(e.target.value)}
                  style={{
                    padding: '0.5625rem 0.875rem',
                    borderRadius: '8px',
                    border: '1px solid var(--color-neutral-300)',
                    fontSize: '0.875rem',
                    backgroundColor: '#fff',
                    outline: 'none',
                  }}
                >
                  <option value="rank">Fair Bayesian Rank (Default)</option>
                  <option value="rating">Average Rating (Highest First)</option>
                  <option value="ratings_count">Rating Volume (Most Ratings)</option>
                  <option value="deals_count">Completed Deals Count</option>
                </select>

                <Button variant="primary" size="sm" type="submit">
                  Search
                </Button>
              </div>
            </form>
          </Card>

          {/* Explanation Banner */}
          <div style={{ padding: '0.75rem 1rem', borderRadius: '10px', backgroundColor: '#f0f9ff', border: '1px solid #bae6fd', display: 'flex', alignItems: 'center', gap: '0.625rem', fontSize: '0.8125rem', color: '#0369a1' }}>
            <HelpCircle style={{ width: '1.125rem', height: '1.125rem', flexShrink: 0 }} />
            <span>
              <strong>Fair Bayesian Ranking Model:</strong> Ranks balance rating average, total rating volume, and completed deals. This ensures high-volume contributors with 4.9★ reliably outrank accounts with just 1 single 5.0★ rating.
            </span>
          </div>

          {/* Leaderboard Table */}
          <Card padding="none" style={{ overflow: 'hidden', borderRadius: '12px', border: '1px solid var(--color-neutral-200)' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '850px' }}>
                <thead style={{ backgroundColor: 'var(--color-neutral-50)', borderBottom: '1px solid var(--color-neutral-200)' }}>
                  <tr>
                    <th style={{ padding: '0.875rem 1rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-neutral-500)', textTransform: 'uppercase', letterSpacing: '0.05em', width: '4rem' }}>Rank</th>
                    <th style={{ padding: '0.875rem 1rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-neutral-500)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>User</th>
                    <th style={{ padding: '0.875rem 1rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-neutral-500)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Reputation Tier</th>
                    <th style={{ padding: '0.875rem 1rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-neutral-500)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Average Rating</th>
                    <th style={{ padding: '0.875rem 1rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-neutral-500)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Completed Deals</th>
                    <th style={{ padding: '0.875rem 1rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-neutral-500)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Bayesian Score</th>
                    <th style={{ padding: '0.875rem 1rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-neutral-500)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Active Badges</th>
                    <th style={{ padding: '0.875rem 1rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-neutral-500)', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoadingRankings ? (
                    <tr>
                      <td colSpan={8} style={{ padding: '3.5rem', textAlign: 'center' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                          <Ring className="w-8 h-8 text-primary-600" />
                          <span style={{ fontSize: '0.875rem', color: 'var(--color-neutral-500)', fontWeight: 500 }}>Computing Bayesian leaderboard...</span>
                        </div>
                      </td>
                    </tr>
                  ) : rankingsData.rankings.length === 0 ? (
                    <tr>
                      <td colSpan={8} style={{ padding: '4rem 2rem', textAlign: 'center' }}>
                        <Trophy style={{ width: '3rem', height: '3rem', color: 'var(--color-neutral-300)', margin: '0 auto 0.75rem auto' }} />
                        <h3 style={{ margin: '0 0 0.375rem 0', fontSize: '1.0625rem', fontWeight: 700, color: 'var(--color-neutral-800)' }}>No users found</h3>
                        <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--color-neutral-500)' }}>
                          No users found matching the given filters.
                        </p>
                      </td>
                    </tr>
                  ) : (
                    rankingsData.rankings.map((user) => {
                      const tierStyle = getTierColor(user.reputationLevel);
                      return (
                        <tr
                          key={user.userId || user.id}
                          style={{
                            borderBottom: '1px solid var(--color-neutral-100)',
                            transition: 'background-color 150ms ease',
                          }}
                        >
                          {/* Rank */}
                          <td style={{ padding: '1rem' }}>
                            {user.rank === 1 ? (
                              <div style={{ width: '2rem', height: '2rem', borderRadius: '50%', backgroundColor: '#fef3c7', color: '#b45309', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.875rem', border: '1px solid #fde68a' }} title="Rank #1">
                                🥇
                              </div>
                            ) : user.rank === 2 ? (
                              <div style={{ width: '2rem', height: '2rem', borderRadius: '50%', backgroundColor: '#f1f5f9', color: '#475569', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.875rem', border: '1px solid #cbd5e1' }} title="Rank #2">
                                🥈
                              </div>
                            ) : user.rank === 3 ? (
                              <div style={{ width: '2rem', height: '2rem', borderRadius: '50%', backgroundColor: '#fff7ed', color: '#c2410c', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.875rem', border: '1px solid #ffedd5' }} title="Rank #3">
                                🥉
                              </div>
                            ) : (
                              <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--color-neutral-400)', paddingLeft: '0.5rem' }}>
                                #{user.rank}
                              </span>
                            )}
                          </td>

                          {/* User info */}
                          <td style={{ padding: '1rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                              <Avatar name={user.fullName} src={user.avatar} size="sm" />
                              <div>
                                <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-neutral-900)' }}>
                                  {user.fullName}
                                </div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--color-neutral-500)' }}>
                                  @{user.username} &bull; {user.email}
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Reputation Tier */}
                          <td style={{ padding: '1rem' }}>
                            <span
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                padding: '0.25rem 0.625rem',
                                borderRadius: '9999px',
                                fontSize: '0.75rem',
                                fontWeight: 700,
                                backgroundColor: tierStyle.bg,
                                color: tierStyle.text,
                                border: `1px solid ${tierStyle.border}`,
                              }}
                            >
                              {user.reputationLevel}
                            </span>
                          </td>

                          {/* Star Rating */}
                          <td style={{ padding: '1rem' }}>
                            {user.totalRatings > 0 ? (
                              <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                  <Star style={{ width: '0.9375rem', height: '0.9375rem', color: '#f59e0b', fill: '#f59e0b' }} />
                                  <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--color-neutral-900)' }}>
                                    {user.averageRating?.toFixed(1)}
                                  </span>
                                  <span style={{ fontSize: '0.75rem', color: 'var(--color-neutral-500)' }}>
                                    ({user.totalRatings})
                                  </span>
                                </div>
                              </div>
                            ) : (
                              <span style={{ fontSize: '0.75rem', color: 'var(--color-neutral-400)', fontStyle: 'italic' }}>
                                Unrated
                              </span>
                            )}
                          </td>

                          {/* Completed Deals */}
                          <td style={{ padding: '1rem' }}>
                            <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-neutral-800)' }}>
                              {user.completedDeals} deals
                            </div>
                          </td>

                          {/* Bayesian Score */}
                          <td style={{ padding: '1rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                              <span style={{ fontSize: '0.9375rem', fontWeight: 800, color: 'var(--color-primary-700)' }}>
                                {user.bayesianScore?.toFixed(2)}
                              </span>
                              <span style={{ fontSize: '0.75rem', color: 'var(--color-neutral-400)' }}>/ 5.0</span>
                            </div>
                          </td>

                          {/* Active Badges */}
                          <td style={{ padding: '1rem' }}>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}>
                              {user.badges && user.badges.length > 0 ? (
                                user.badges.map((b: any) => (
                                  <span
                                    key={b.id || b.code}
                                    title={`${b.name}: ${b.description}`}
                                    style={{
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: '0.25rem',
                                      padding: '0.1875rem 0.5rem',
                                      borderRadius: '6px',
                                      fontSize: '0.6875rem',
                                      fontWeight: 600,
                                      backgroundColor: '#f8fafc',
                                      color: '#334155',
                                      border: '1px solid #e2e8f0',
                                    }}
                                  >
                                    <span>{b.icon}</span>
                                    <span>{b.name}</span>
                                  </span>
                                ))
                              ) : (
                                <span style={{ fontSize: '0.75rem', color: 'var(--color-neutral-400)' }}>None</span>
                              )}
                            </div>
                          </td>

                          {/* Actions */}
                          <td style={{ padding: '1rem', textAlign: 'right' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.375rem' }}>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => openAwardModal(user)}
                                style={{ padding: '0.3125rem 0.625rem', fontSize: '0.75rem' }}
                                title="Award Community Badge"
                              >
                                <Award style={{ width: '0.8125rem', height: '0.8125rem', marginRight: '0.25rem', color: 'var(--color-primary-600)' }} />
                                Award
                              </Button>

                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => openHistoryModal(user)}
                                style={{ padding: '0.3125rem 0.5rem', fontSize: '0.75rem' }}
                                title="View Badge History & Moderation"
                              >
                                <Clock style={{ width: '0.8125rem', height: '0.8125rem' }} />
                              </Button>

                              <Link
                                to={`/profile/${user.id || `user-${user.userId}`}`}
                                target="_blank"
                                rel="noreferrer"
                                style={{
                                  padding: '0.3125rem 0.5rem',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  color: 'var(--color-neutral-500)',
                                  borderRadius: '6px',
                                }}
                                title="Open User Public Profile"
                              >
                                <ExternalLink style={{ width: '0.8125rem', height: '0.8125rem' }} />
                              </Link>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: STATUS CHANGE (HIDE / RESTORE) */}
      {/* ========================================================================= */}
      {statusModalOpen && targetRating && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0, 0, 0, 0.5)', zIndex: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div style={{ backgroundColor: '#fff', borderRadius: '16px', maxWidth: '480px', width: '100%', padding: '1.5rem', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                {targetNewStatus === 'hidden' ? (
                  <div style={{ width: '2.25rem', height: '2.25rem', borderRadius: '50%', backgroundColor: '#fffbeb', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#d97706' }}>
                    <EyeOff style={{ width: '1.25rem', height: '1.25rem' }} />
                  </div>
                ) : (
                  <div style={{ width: '2.25rem', height: '2.25rem', borderRadius: '50%', backgroundColor: '#ecfdf5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#059669' }}>
                    <Eye style={{ width: '1.25rem', height: '1.25rem' }} />
                  </div>
                )}
                <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 700, color: 'var(--color-neutral-900)' }}>
                  {targetNewStatus === 'hidden' ? 'Hide Inappropriate Rating' : 'Restore Rating to Active'}
                </h3>
              </div>
              <button
                onClick={() => setStatusModalOpen(false)}
                style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--color-neutral-400)', padding: '0.25rem' }}
              >
                <X style={{ width: '1.25rem', height: '1.25rem' }} />
              </button>
            </div>

            <p style={{ margin: '0 0 1rem 0', fontSize: '0.875rem', color: 'var(--color-neutral-600)', lineHeight: '1.5' }}>
              {targetNewStatus === 'hidden'
                ? `Hiding this rating will immediately exclude it from ${targetRating.ratedUser?.fullName}'s profile and reputation score. The record and reason will be safely archived for moderation logs.`
                : `Restoring this rating will include it back into public reputation calculations.`}
            </p>

            <div style={{ padding: '0.75rem', borderRadius: '8px', backgroundColor: 'var(--color-neutral-50)', border: '1px solid var(--color-neutral-200)', marginBottom: '1rem', fontSize: '0.8125rem' }}>
              <div style={{ fontWeight: 600, color: 'var(--color-neutral-800)', marginBottom: '0.25rem' }}>
                Rating Details:
              </div>
              <div style={{ color: 'var(--color-neutral-600)' }}>
                ★ {targetRating.score}/5 by {targetRating.rater?.fullName} for {targetRating.ratedUser?.fullName}
              </div>
              {targetRating.review && (
                <div style={{ marginTop: '0.25rem', fontStyle: 'italic', color: 'var(--color-neutral-700)' }}>
                  "{targetRating.review}"
                </div>
              )}
            </div>

            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-neutral-700)', marginBottom: '0.375rem' }}>
                Moderation Reason / Note
              </label>
              <textarea
                rows={3}
                value={moderationReason}
                onChange={(e) => setModerationReason(e.target.value)}
                placeholder="Explain reason for this moderation action..."
                style={{
                  width: '100%',
                  padding: '0.625rem',
                  borderRadius: '8px',
                  border: '1px solid var(--color-neutral-300)',
                  fontSize: '0.875rem',
                  outline: 'none',
                }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <Button variant="ghost" onClick={() => setStatusModalOpen(false)}>
                Cancel
              </Button>
              <Button
                variant={targetNewStatus === 'hidden' ? 'danger' : 'primary'}
                onClick={handleConfirmStatusChange}
                disabled={isUpdatingStatus}
              >
                {isUpdatingStatus ? 'Applying...' : targetNewStatus === 'hidden' ? 'Hide Rating' : 'Restore Rating'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: AWARD BADGE MODAL */}
      {/* ========================================================================= */}
      {awardModalOpen && selectedUserForBadge && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0, 0, 0, 0.5)', zIndex: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div style={{ backgroundColor: '#fff', borderRadius: '16px', maxWidth: '520px', width: '100%', padding: '1.5rem', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ width: '2.25rem', height: '2.25rem', borderRadius: '50%', backgroundColor: 'var(--color-primary-50)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-primary-600)' }}>
                  <Award style={{ width: '1.25rem', height: '1.25rem' }} />
                </div>
                <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 700, color: 'var(--color-neutral-900)' }}>
                  Award Reputation Badge
                </h3>
              </div>
              <button
                onClick={() => setAwardModalOpen(false)}
                style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--color-neutral-400)', padding: '0.25rem' }}
              >
                <X style={{ width: '1.25rem', height: '1.25rem' }} />
              </button>
            </div>

            <p style={{ margin: '0 0 1rem 0', fontSize: '0.875rem', color: 'var(--color-neutral-600)' }}>
              Award an official platform badge to recognized member <strong>{selectedUserForBadge.fullName}</strong> (@{selectedUserForBadge.username}).
            </p>

            <form onSubmit={handleAwardBadgeSubmit}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-neutral-700)', marginBottom: '0.375rem' }}>
                  Select Badge
                </label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '200px', overflowY: 'auto' }}>
                  {availableBadges.map((b) => (
                    <label
                      key={b.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        padding: '0.625rem 0.875rem',
                        borderRadius: '8px',
                        border: selectedBadgeId === b.id ? '2px solid var(--color-primary-600)' : '1px solid var(--color-neutral-200)',
                        backgroundColor: selectedBadgeId === b.id ? 'var(--color-primary-50)' : '#fff',
                        cursor: 'pointer',
                      }}
                    >
                      <input
                        type="radio"
                        name="badge"
                        value={b.id}
                        checked={selectedBadgeId === b.id}
                        onChange={() => setSelectedBadgeId(b.id)}
                        style={{ accentColor: 'var(--color-primary-600)' }}
                      />
                      <span style={{ fontSize: '1.25rem' }}>{b.icon}</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--color-neutral-900)' }}>
                          {b.name}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--color-neutral-500)' }}>
                          {b.description}
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-neutral-700)', marginBottom: '0.375rem' }}>
                  Reason / Commendation Note
                </label>
                <textarea
                  rows={3}
                  value={badgeReason}
                  onChange={(e) => setBadgeReason(e.target.value)}
                  placeholder="e.g. Demonstrated exceptional responsiveness and community generosity..."
                  style={{
                    width: '100%',
                    padding: '0.625rem',
                    borderRadius: '8px',
                    border: '1px solid var(--color-neutral-300)',
                    fontSize: '0.875rem',
                    outline: 'none',
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <Button variant="ghost" type="button" onClick={() => setAwardModalOpen(false)}>
                  Cancel
                </Button>
                <Button variant="primary" type="submit" disabled={isAwardingBadge || !selectedBadgeId}>
                  {isAwardingBadge ? 'Awarding...' : 'Award Badge'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: BADGE HISTORY MODAL */}
      {/* ========================================================================= */}
      {historyModalOpen && selectedUserForHistory && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0, 0, 0, 0.5)', zIndex: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div style={{ backgroundColor: '#fff', borderRadius: '16px', maxWidth: '560px', width: '100%', padding: '1.5rem', maxHeight: '85vh', display: 'flex', flexDirection: 'column', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', borderBottom: '1px solid var(--color-neutral-200)', paddingBottom: '0.75rem' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 700, color: 'var(--color-neutral-900)' }}>
                  Badge History & Audit Log
                </h3>
                <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.8125rem', color: 'var(--color-neutral-500)' }}>
                  User: {selectedUserForHistory.fullName} (@{selectedUserForHistory.username})
                </p>
              </div>
              <button
                onClick={() => setHistoryModalOpen(false)}
                style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--color-neutral-400)', padding: '0.25rem' }}
              >
                <X style={{ width: '1.25rem', height: '1.25rem' }} />
              </button>
            </div>

            <div style={{ overflowY: 'auto', flex: 1, paddingRight: '0.25rem' }}>
              {isLoadingHistory ? (
                <div style={{ padding: '2rem', textAlign: 'center' }}>
                  <Ring className="w-8 h-8 text-primary-600" />
                </div>
              ) : badgeHistory.length === 0 ? (
                <div style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--color-neutral-500)', fontSize: '0.875rem' }}>
                  No badges currently assigned or previously revoked for this user.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {badgeHistory.map((bh) => (
                    <div
                      key={bh.badgeId}
                      style={{
                        padding: '0.875rem',
                        borderRadius: '10px',
                        border: '1px solid var(--color-neutral-200)',
                        backgroundColor: bh.status === 'revoked' ? '#f8fafc' : '#fff',
                        display: 'flex',
                        alignItems: 'flex-start',
                        justifyContent: 'space-between',
                        gap: '0.75rem',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                        <span style={{ fontSize: '1.5rem', lineHeight: 1 }}>{bh.badge?.icon || '🎖️'}</span>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--color-neutral-900)' }}>
                              {bh.badge?.name || `Badge #${bh.badgeId}`}
                            </span>
                            {bh.status === 'revoked' ? (
                              <span style={{ fontSize: '0.6875rem', fontWeight: 700, color: '#dc2626', backgroundColor: '#fee2e2', padding: '0.125rem 0.375rem', borderRadius: '4px' }}>
                                REVOKED
                              </span>
                            ) : (
                              <span style={{ fontSize: '0.6875rem', fontWeight: 700, color: '#047857', backgroundColor: '#ecfdf5', padding: '0.125rem 0.375rem', borderRadius: '4px' }}>
                                ACTIVE
                              </span>
                            )}
                          </div>
                          <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.75rem', color: 'var(--color-neutral-600)' }}>
                            {bh.badge?.description}
                          </p>
                          <div style={{ marginTop: '0.375rem', fontSize: '0.6875rem', color: 'var(--color-neutral-400)' }}>
                            Earned: {bh.earnedAt ? format(new Date(bh.earnedAt), 'MMM d, yyyy') : 'N/A'}
                            {bh.awardedBy && ` &bull; By Admin #${bh.awardedBy}`}
                          </div>
                          {bh.reason && (
                            <div style={{ marginTop: '0.25rem', fontSize: '0.75rem', color: 'var(--color-neutral-700)', fontStyle: 'italic' }}>
                              Reason: "{bh.reason}"
                            </div>
                          )}
                          {bh.revokedAt && (
                            <div style={{ marginTop: '0.25rem', fontSize: '0.6875rem', color: '#dc2626' }}>
                              Revoked at: {format(new Date(bh.revokedAt), 'MMM d, yyyy')}
                            </div>
                          )}
                        </div>
                      </div>

                      {bh.status === 'active' && (
                        <Button
                          variant="danger"
                          size="sm"
                          disabled={isRevokingBadge === bh.badgeId}
                          onClick={() => handleRevokeBadge(bh.badgeId, bh.badge?.name)}
                          style={{ padding: '0.25rem 0.5rem', fontSize: '0.6875rem' }}
                        >
                          {isRevokingBadge === bh.badgeId ? 'Revoking...' : 'Revoke'}
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div style={{ marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid var(--color-neutral-200)', display: 'flex', justifyContent: 'flex-end' }}>
              <Button variant="ghost" onClick={() => setHistoryModalOpen(false)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete / Hard Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setRatingToDelete(null);
        }}
        onConfirm={handleDelete}
        title="Moderate Rating"
        message={
          ratingToDelete
            ? `Are you sure you want to moderate this rating from ${ratingToDelete.rater?.fullName}? This rating will be hidden from public view and excluded from reputation calculations.`
            : ''
        }
        confirmLabel="Moderate & Hide"
        cancelLabel="Cancel"
        variant="danger"
        isLoading={isDeleting}
      />
    </div>
  );
}
