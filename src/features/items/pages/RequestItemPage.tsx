import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, HandHeart, MapPin } from 'lucide-react';
import PageLayout from '@/components/layout/PageLayout';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Textarea from '@/components/ui/Textarea';
import Badge from '@/components/ui/Badge';
import Avatar from '@/components/ui/Avatar';
import { itemsService } from '@/services/items.service';
import { requestsService } from '@/services/requests.service';
import { useAuthStore } from '@/stores/authStore';
import { categories } from '@/data/categories';
import type { Item, RequestUrgency } from '@/types';
import toast from 'react-hot-toast';

export default function RequestItemPage() {
  const { itemId } = useParams<{ itemId: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const [item, setItem] = useState<Item | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'school-supplies',
    urgency: 'medium' as RequestUrgency,
    neededBefore: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
  });

  useEffect(() => {
    if (itemId) {
      itemsService.getItemById(itemId).then((data) => {
        setItem(data);
        if (data) {
          setFormData((prev) => ({
            ...prev,
            title: `Request for: ${data.title}`,
            category: data.category,
          }));
        }
        setIsLoading(false);
      });
    }
  }, [itemId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.description.trim()) {
      toast.error('Please fill in all required fields.');
      return;
    }
    setIsSubmitting(true);
    try {
      await requestsService.createRequest({
        title: formData.title,
        description: formData.description,
        category: formData.category,
        urgency: formData.urgency,
        status: 'active',
        userId: user?.id ?? 'user-1',
        location: {
          address: user?.address ?? '',
          barangay: user?.barangay ?? 'Poblacion',
          municipality: user?.municipality ?? 'San Fernando',
          province: user?.province ?? 'La Union',
        },
        neededBefore: formData.neededBefore,
        images: [],
      });
      toast.success('Request submitted successfully!');
      navigate('/requests');
    } catch {
      toast.error('Failed to submit request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <PageLayout>
        <div style={{ maxWidth: '48rem', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ height: '2.5rem', backgroundColor: 'var(--color-neutral-200)', borderRadius: 'var(--radius-md)', width: '8rem' }} />
          <div style={{ height: '6rem', backgroundColor: 'var(--color-neutral-200)', borderRadius: 'var(--radius-lg)' }} />
          <div style={{ height: '24rem', backgroundColor: 'var(--color-neutral-200)', borderRadius: 'var(--radius-lg)' }} />
        </div>
      </PageLayout>
    );
  }

  if (!item) {
    return (
      <PageLayout>
        <div style={{ textAlign: 'center', padding: '4rem' }}>
          <h2 style={{ color: 'var(--color-neutral-800)' }}>Item not found</h2>
          <Button variant="outline" onClick={() => navigate('/browse')} style={{ marginTop: '1rem' }}>
            Back to Browse
          </Button>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div style={{ maxWidth: '48rem', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* Back button */}
        <div>
          <button
            type="button"
            onClick={() => navigate(`/items/${itemId}`)}
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
            <ArrowLeft style={{ width: '1rem', height: '1rem' }} /> Back to Item Details
          </button>
        </div>

        {/* Page title */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '0.375rem' }}>
            <HandHeart style={{ width: '1.5rem', height: '1.5rem', color: 'var(--color-primary-600)' }} />
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-neutral-900)', margin: 0 }}>
              Request Item
            </h1>
          </div>
          <p style={{ fontSize: '0.875rem', color: 'var(--color-neutral-500)', margin: 0, marginLeft: '2.125rem' }}>
            Submit a request to the community for this item. Generous neighbors will be able to fulfill it.
          </p>
        </div>

        {/* Item Preview Card */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            padding: '1rem 1.25rem',
            backgroundColor: 'var(--color-primary-50)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--color-primary-100)',
          }}
        >
          {item.images && item.images.length > 0 ? (
            <img
              src={item.images[0]}
              alt={item.title}
              style={{
                width: '4rem',
                height: '4rem',
                borderRadius: 'var(--radius-md)',
                objectFit: 'cover',
                flexShrink: 0,
                border: '1px solid var(--color-primary-200)',
              }}
            />
          ) : (
            <div style={{ width: '4rem', height: '4rem', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--color-primary-100)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <HandHeart style={{ width: '1.5rem', height: '1.5rem', color: 'var(--color-primary-600)' }} />
            </div>
          )}
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem', flexWrap: 'wrap' }}>
              <Badge variant={item.type === 'donation' ? 'success' : 'primary'} size="sm">
                {item.type === 'donation' ? 'Donation' : 'For Exchange'}
              </Badge>
              <Badge variant="default" size="sm">{item.condition}</Badge>
            </div>
            <h3 style={{ margin: 0, fontSize: '0.9375rem', fontWeight: 800, color: 'var(--color-primary-900)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {item.title}
            </h3>
            {item.owner && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', marginTop: '0.25rem' }}>
                <Avatar src={item.owner.avatar} name={item.owner.fullName} size="xs" />
                <span style={{ fontSize: '0.6875rem', color: 'var(--color-primary-700)', fontWeight: 600 }}>
                  by {item.owner.fullName}
                </span>
                <span style={{ fontSize: '0.6875rem', color: 'var(--color-primary-500)' }}>•</span>
                <MapPin style={{ width: '0.6875rem', height: '0.6875rem', color: 'var(--color-primary-500)' }} />
                <span style={{ fontSize: '0.6875rem', color: 'var(--color-primary-600)', fontWeight: 500 }}>
                  {item.location.barangay}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Request Form */}
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: 'var(--radius-xl)',
            border: '1px solid var(--color-neutral-200)',
            boxShadow: 'var(--shadow-card)',
            padding: '1.75rem 2rem',
          }}
        >
          <h2 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--color-neutral-900)', margin: '0 0 1.25rem 0', paddingBottom: '0.75rem', borderBottom: '1px solid var(--color-neutral-100)' }}>
            Request Details
          </h2>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.125rem' }}>
            <Input
              label="Request Title"
              placeholder="e.g. Looking for Rice (5kg)"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
              <Select
                label="Category"
                options={categories.map((c) => ({ value: c.id, label: c.name }))}
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              />
              <Select
                label="Urgency Level"
                options={[
                  { value: 'low', label: 'Low' },
                  { value: 'medium', label: 'Medium' },
                  { value: 'high', label: 'High' },
                  { value: 'critical', label: 'Critical' },
                ]}
                value={formData.urgency}
                onChange={(e) => setFormData({ ...formData, urgency: e.target.value as RequestUrgency })}
              />
            </div>

            <Input
              label="Needed Before Date"
              type="date"
              value={formData.neededBefore}
              onChange={(e) => setFormData({ ...formData, neededBefore: e.target.value })}
              required
            />

            <Textarea
              label="Description & Details"
              placeholder="Explain why you need this item, how many, and how it will help you or your family..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
              rows={4}
            />

            {/* Form Actions */}
            <div style={{ display: 'flex', gap: '0.875rem', paddingTop: '0.5rem', borderTop: '1px solid var(--color-neutral-100)', marginTop: '0.25rem' }}>
              <button
                type="button"
                onClick={() => navigate(`/items/${itemId}`)}
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  fontSize: '0.875rem',
                  fontWeight: 700,
                  color: 'var(--color-neutral-700)',
                  backgroundColor: 'var(--color-neutral-100)',
                  border: '1px solid var(--color-neutral-200)',
                  borderRadius: 'var(--radius-md)',
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                style={{
                  flex: 2,
                  padding: '0.75rem',
                  fontSize: '0.875rem',
                  fontWeight: 800,
                  color: '#ffffff',
                  backgroundColor: isSubmitting ? 'var(--color-neutral-400)' : 'var(--color-primary-600)',
                  border: 'none',
                  borderRadius: 'var(--radius-md)',
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  boxShadow: '0 2px 8px rgba(46,125,50,0.3)',
                }}
              >
                {isSubmitting ? 'Submitting...' : 'Submit Request'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </PageLayout>
  );
}