import { useState, useEffect, useCallback } from 'react';
import { HandHeart, Plus, Clock, MessageSquare } from 'lucide-react';
import PageLayout from '@/components/layout/PageLayout';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Tabs from '@/components/ui/Tabs';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Textarea from '@/components/ui/Textarea';
import Avatar from '@/components/ui/Avatar';
import ScrollReveal from '@/components/common/ScrollReveal';
import { categories } from '@/data/categories';
import { requestsService } from '@/services/requests.service';
import { useAuthStore } from '@/stores/authStore';
import type { ItemRequest, RequestUrgency } from '@/types';
import FulfillRequestModal from '../components/FulfillRequestModal';
import toast from 'react-hot-toast';

export default function RequestsPage() {
  const { user } = useAuthStore();

  const [activeTab, setActiveTab] = useState('active');
  const [requests, setRequests] = useState<ItemRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [selectedRequestForFulfill, setSelectedRequestForFulfill] = useState<ItemRequest | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'school-supplies',
    urgency: 'medium' as RequestUrgency,
    neededBefore: '2026-08-20',
  });

  const loadRequests = useCallback(async () => {
    setIsLoading(true);
    const data = await requestsService.getRequests(activeTab);
    setRequests(data);
    setIsLoading(false);
  }, [activeTab]);

  useEffect(() => {
    loadRequests();
  }, [loadRequests]);

  const handleCreateRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.description) {
      toast.error('Please fill in all required fields');
      return;
    }

    await requestsService.createRequest({
      title: formData.title,
      description: formData.description,
      category: formData.category,
      urgency: formData.urgency as any,
      status: 'active',
      userId: user?.id || 'user-1',
      location: {
        address: user?.address || 'Community Center',
        barangay: user?.barangay || 'San Fernando',
        municipality: user?.municipality || 'City of San Fernando',
        province: user?.province || 'La Union',
      },
      neededBefore: formData.neededBefore,
      images: [],
    });

    toast.success('Request posted successfully!');
    setCreateModalOpen(false);
    setFormData({
      title: '',
      description: '',
      category: 'school-supplies',
      urgency: 'medium',
      neededBefore: '2026-08-20',
    });
    loadRequests();
  };

  return (
    <PageLayout>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', paddingBottom: '4.5rem' }}>
        <ScrollReveal direction="down" duration={500}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-neutral-900)', margin: 0 }}>Community Assistance Requests</h1>
              <p style={{ fontSize: '0.875rem', color: 'var(--color-neutral-500)', marginTop: '0.25rem' }}>
                Support neighbors in need of essential items or submit a community request.
              </p>
            </div>
            <Button
              variant="primary"
              size="md"
              leftIcon={<Plus style={{ width: '1.125rem', height: '1.125rem' }} />}
              onClick={() => setCreateModalOpen(true)}
              style={{
                borderRadius: '9999px',
                padding: '0.625rem 1.25rem',
                gap: '0.5rem',
                fontSize: '0.8125rem',
                fontWeight: 700,
                boxShadow: '0 2px 8px rgba(46, 125, 50, 0.25)',
              }}
            >
              Post a Request
            </Button>
          </div>
        </ScrollReveal>

        {/* Tab Filters */}
        <ScrollReveal direction="up" delay={50}>
          <Tabs
            tabs={[
              { id: 'active', label: 'Active Requests' },
              { id: 'in_progress', label: 'In Progress' },
              { id: 'completed', label: 'Fulfilled' },
            ]}
            activeTab={activeTab}
            onChange={setActiveTab}
          />
        </ScrollReveal>

        {/* Requests List */}
        {isLoading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ height: '8rem', backgroundColor: 'var(--color-neutral-100)', borderRadius: 'var(--radius-lg)' }} className="skeleton" />
            <div style={{ height: '8rem', backgroundColor: 'var(--color-neutral-100)', borderRadius: 'var(--radius-lg)' }} className="skeleton" />
          </div>
        ) : requests.length === 0 ? (
          <div style={{ padding: '3rem 1rem', textAlign: 'center', border: '1px dashed var(--color-neutral-300)', borderRadius: 'var(--radius-lg)', backgroundColor: '#fff' }}>
            <HandHeart style={{ width: '2.5rem', height: '2.5rem', color: 'var(--color-neutral-400)', margin: '0 auto 0.75rem auto' }} />
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-neutral-800)', margin: 0 }}>No requests in this category</h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--color-neutral-500)', marginTop: '0.25rem' }}>Post a new request to get help from generous neighbors.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.25rem' }}>
            {requests.map((req, idx) => (
              <ScrollReveal key={req.id} delay={idx * 70} direction="up">
                <Card style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '1rem', border: '1px solid var(--color-neutral-200)', height: '100%' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Badge
                        variant={
                          req.urgency === 'critical'
                            ? 'danger'
                            : req.urgency === 'high'
                            ? 'warning'
                            : 'primary'
                        }
                        size="sm"
                        style={{ padding: '0.35rem 0.75rem', letterSpacing: '0.02em' }}
                      >
                        Urgency: {req.urgency.toUpperCase()}
                      </Badge>
                      <span style={{ fontSize: '0.6875rem', color: 'var(--color-neutral-400)', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <Clock style={{ width: '0.875rem', height: '0.875rem' }} /> Needed before {req.neededBefore}
                      </span>
                    </div>

                    <div>
                      <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-neutral-900)', margin: 0 }}>{req.title}</h3>
                      <p style={{ fontSize: '0.75rem', color: 'var(--color-neutral-600)', marginTop: '0.25rem', lineHeight: '1.6', margin: '0.25rem 0 0 0' }}>{req.description}</p>
                    </div>
                  </div>

                  <div style={{ paddingTop: '0.75rem', borderTop: '1px solid var(--color-neutral-100)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    {req.user && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Avatar src={req.user.avatar} name={req.user.fullName} size="xs" />
                        <span style={{ fontSize: '0.75rem', color: 'var(--color-neutral-700)', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '120px' }}>
                          {req.user.fullName}
                        </span>
                      </div>
                    )}

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedRequestForFulfill(req)}
                      leftIcon={<MessageSquare style={{ width: '0.9375rem', height: '0.9375rem', color: 'var(--color-primary-600)' }} />}
                      style={{
                        padding: '0.45rem 1rem',
                        gap: '0.5rem',
                        fontSize: '0.8125rem',
                        fontWeight: 600,
                        borderRadius: 'var(--radius-md)',
                        borderColor: 'var(--color-neutral-300)',
                        backgroundColor: '#ffffff',
                      }}
                    >
                      Fulfill Request
                    </Button>
                  </div>
                </Card>
              </ScrollReveal>
            ))}
          </div>
        )}
      </div>

      {/* Create Request Modal */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Post Community Request"
      >
        <form onSubmit={handleCreateRequest} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <Input
            label="Request Title"
            placeholder="e.g. Textbooks (Grade 10)"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
          />

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem' }}>
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
            placeholder="Explain why you need this item and how it will help..."
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            required
            rows={3}
          />

          <div style={{ display: 'flex', gap: '0.75rem', paddingTop: '0.5rem' }}>
            <Button variant="secondary" fullWidth type="button" onClick={() => setCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" fullWidth type="submit" className="font-bold shadow-button">
              Submit Request
            </Button>
          </div>
        </form>
      </Modal>

      {/* Fulfill Request Modal */}
      <FulfillRequestModal
        isOpen={!!selectedRequestForFulfill}
        onClose={() => setSelectedRequestForFulfill(null)}
        request={selectedRequestForFulfill}
        onSuccess={loadRequests}
      />
    </PageLayout>
  );
}

