import { useState, useEffect } from 'react';
import { Star, Trash2, Search, AlertCircle, Calendar, ArrowUpDown, Link as LinkIcon } from 'lucide-react';
import { adminService } from '@/services/admin.service';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Avatar from '@/components/ui/Avatar';
import { Link } from 'react-router-dom';
import Badge from '@/components/ui/Badge';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import toast from 'react-hot-toast';
import SEO from '@/components/common/SEO';
import { format } from 'date-fns';

export default function ManageRatingsPage() {
  const [ratings, setRatings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [ratingToDelete, setRatingToDelete] = useState<any | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchRatings = async () => {
    setIsLoading(true);
    const data = await adminService.getRatings();
    setRatings(data);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchRatings();
  }, []);

  const handleDelete = async () => {
    if (!ratingToDelete) return;
    setIsDeleting(true);
    const success = await adminService.deleteRating(ratingToDelete.id);
    if (success) {
      toast.success('Rating deleted successfully');
      setRatings(prev => prev.filter(r => r.id !== ratingToDelete.id));
    } else {
      toast.error('Failed to delete rating');
    }
    setIsDeleting(false);
    setDeleteModalOpen(false);
    setRatingToDelete(null);
  };

  const filteredRatings = ratings.filter(r => 
    r.rater?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.ratedUser?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.review?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedRatings = [...filteredRatings].sort((a, b) => {
    let valA, valB;
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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <SEO title="Manage Ratings | Admin" noindex={true} />
      
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-neutral-900)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Star style={{ width: '1.5rem', height: '1.5rem', color: 'var(--color-primary-600)' }} />
            Manage User Ratings
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--color-neutral-500)', margin: '0.25rem 0 0 0' }}>
            Review user feedback and moderate inappropriate ratings.
          </p>
        </div>
      </div>

      {/* Search */}
      <Card padding="md">
        <div style={{ position: 'relative', width: '100%', maxWidth: '30rem' }}>
          <Search style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', width: '1.25rem', height: '1.25rem', color: 'var(--color-neutral-400)' }} />
          <input
            type="text"
            placeholder="Search by user, reviewer, or keyword..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '0.625rem 1rem 0.625rem 2.75rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-neutral-300)',
              fontSize: '0.875rem',
              outline: 'none',
              transition: 'border-color 150ms ease',
            }}
            onFocus={(e) => e.target.style.borderColor = 'var(--color-primary-500)'}
            onBlur={(e) => e.target.style.borderColor = 'var(--color-neutral-300)'}
          />
        </div>
      </Card>

      {/* Table */}
      <Card padding="none" style={{ overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '600px' }}>
            <thead style={{ backgroundColor: 'var(--color-neutral-50)', borderBottom: '1px solid var(--color-neutral-200)' }}>
              <tr>
                <th style={{ padding: '1rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-neutral-500)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Rater (Author)</th>
                <th style={{ padding: '1rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-neutral-500)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Rated User (Target)</th>
                <th onClick={() => handleSort('score')} style={{ cursor: 'pointer', padding: '1rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-neutral-500)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>Score <ArrowUpDown style={{ width: '0.875rem', height: '0.875rem' }} /></div>
                </th>
                <th style={{ padding: '1rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-neutral-500)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Context</th>
                <th style={{ padding: '1rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-neutral-500)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Review</th>
                <th onClick={() => handleSort('date')} style={{ cursor: 'pointer', padding: '1rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-neutral-500)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>Date <ArrowUpDown style={{ width: '0.875rem', height: '0.875rem' }} /></div>
                </th>
                <th style={{ padding: '1rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-neutral-500)', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={7} style={{ padding: '2rem', textAlign: 'center' }}>
                    <div className="animate-pulse flex flex-col items-center gap-2">
                      <div className="w-8 h-8 border-4 border-neutral-200 border-t-primary-600 rounded-full animate-spin" />
                      <span className="text-sm text-neutral-500">Loading ratings...</span>
                    </div>
                  </td>
                </tr>
              ) : sortedRatings.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: '4rem 2rem', textAlign: 'center' }}>
                    <AlertCircle style={{ width: '3rem', height: '3rem', color: 'var(--color-neutral-300)', margin: '0 auto 1rem auto' }} />
                    <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1rem', fontWeight: 600, color: 'var(--color-neutral-800)' }}>No ratings found</h3>
                    <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--color-neutral-500)' }}>
                      There are no ratings matching your criteria.
                    </p>
                  </td>
                </tr>
              ) : (
                sortedRatings.map((rating) => (
                  <tr key={rating.id} style={{ borderBottom: '1px solid var(--color-neutral-100)', transition: 'background-color 150ms ease' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--color-neutral-50)'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                    
                    <td style={{ padding: '1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <Avatar name={rating.rater.fullName} size="sm" />
                        <div>
                          <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-neutral-900)' }}>{rating.rater.fullName}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--color-neutral-500)' }}>@{rating.rater.username}</div>
                        </div>
                      </div>
                    </td>

                    <td style={{ padding: '1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <Avatar name={rating.ratedUser.fullName} size="sm" />
                        <div>
                          <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-neutral-900)' }}>{rating.ratedUser.fullName}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--color-neutral-500)' }}>@{rating.ratedUser.username}</div>
                        </div>
                      </div>
                    </td>

                    <td style={{ padding: '1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <Star style={{ width: '1rem', height: '1rem', color: 'var(--color-warning)', fill: 'var(--color-warning)' }} />
                        <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--color-neutral-900)' }}>{rating.score}</span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--color-neutral-500)' }}>/ 5</span>
                      </div>
                    </td>

                    <td style={{ padding: '1rem' }}>
                      <Link to={`/exchanges/${rating.exchangeId}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-primary-600)', textDecoration: 'none', backgroundColor: 'var(--color-primary-50)', padding: '0.25rem 0.5rem', borderRadius: '4px' }}>
                        <LinkIcon style={{ width: '0.75rem', height: '0.75rem' }} /> Exchange
                      </Link>
                    </td>

                    <td style={{ padding: '1rem', maxWidth: '15rem' }}>
                      <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--color-neutral-700)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }} title={rating.review}>
                        {rating.review}
                      </p>
                    </td>

                    <td style={{ padding: '1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.75rem', color: 'var(--color-neutral-500)' }}>
                        <Calendar style={{ width: '0.875rem', height: '0.875rem' }} />
                        {format(new Date(rating.createdAt), 'MMM d, yyyy')}
                      </div>
                    </td>

                    <td style={{ padding: '1rem', textAlign: 'right' }}>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => {
                          setRatingToDelete(rating);
                          setDeleteModalOpen(true);
                        }}
                        style={{ padding: '0.375rem 0.75rem' }}
                      >
                        <Trash2 style={{ width: '0.875rem', height: '0.875rem', marginRight: '0.375rem' }} />
                        Delete
                      </Button>
                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <ConfirmDialog
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setRatingToDelete(null);
        }}
        onConfirm={handleDelete}
        title="Delete Rating"
        message={ratingToDelete ? `Are you sure you want to delete this rating from ${ratingToDelete.rater.fullName}? This action cannot be undone.` : ''}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        variant="danger"
        isLoading={isDeleting}
      />
    </div>
  );
}
