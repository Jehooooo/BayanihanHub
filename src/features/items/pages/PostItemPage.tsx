import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Upload, X, PackagePlus, ArrowLeft, MapPin, CheckCircle2,
  Gift, ArrowLeftRight, HandHelping, AlertCircle,
} from 'lucide-react';
import PageLayout from '@/components/layout/PageLayout';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Textarea from '@/components/ui/Textarea';
import Card from '@/components/ui/Card';
import { categories } from '@/data/categories';
import { itemsService } from '@/services/items.service';
import { useAuthStore } from '@/stores/authStore';
import type { ItemCondition, ItemType } from '@/types';
import toast from 'react-hot-toast';
import LiveLocationMap, { type LocationDetails } from '../components/LiveLocationMap';

// ─── Type selector config ───────────────────────────────────────────────────
const TYPE_OPTIONS = [
  {
    value: 'donation' as ItemType,
    label: 'Donation',
    desc: 'Give away items for free to those in need.',
    icon: <Gift style={{ width: '1.5rem', height: '1.5rem' }} />,
    accent: '#16a34a',
    bg: '#f0fdf4',
    border: '#bbf7d0',
    activeBg: '#dcfce7',
  },
  {
    value: 'request' as ItemType,
    label: 'Request',
    desc: 'Ask the community for an item you need.',
    icon: <HandHelping style={{ width: '1.5rem', height: '1.5rem' }} />,
    accent: '#2563eb',
    bg: '#eff6ff',
    border: '#bfdbfe',
    activeBg: '#dbeafe',
  },
  {
    value: 'exchange' as ItemType,
    label: 'Exchange',
    desc: 'Swap your item with something from someone else.',
    icon: <ArrowLeftRight style={{ width: '1.5rem', height: '1.5rem' }} />,
    accent: '#d97706',
    bg: '#fffbeb',
    border: '#fde68a',
    activeBg: '#fef3c7',
  },
] as const;

const CONDITION_OPTIONS = [
  { value: 'Brand New', label: 'Brand New' },
  { value: 'Like New', label: 'Like New' },
  { value: 'Good Condition', label: 'Good Condition' },
  { value: 'Fair', label: 'Fair' },
  { value: 'Poor', label: 'Poor' },
];

// ─── Location Card (shared) ──────────────────────────────────────────────────
function LocationCard({
  locationDetails,
  onOpenPicker,
}: {
  locationDetails: LocationDetails;
  onOpenPicker: () => void;
}) {
  return (
    <Card style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', padding: '1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <MapPin style={{ width: '1.1rem', height: '1.1rem', color: 'var(--color-primary-600)' }} />
            <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--color-neutral-900)', margin: 0 }}>Your Location</h3>
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--color-neutral-500)', margin: '0.25rem 0 0' }}>
            Provide your street, barangay, and municipality for community discovery.
          </p>
        </div>
        <Button type="button" variant="outline" size="sm" onClick={onOpenPicker} leftIcon={<MapPin style={{ width: '0.875rem', height: '0.875rem' }} />}>
          Choose on Map
        </Button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
        <Input label="Street / Landmark" value={locationDetails.street} readOnly helperText="Auto-filled from map" style={{ backgroundColor: 'var(--color-neutral-100)', cursor: 'default', color: 'var(--color-neutral-800)', fontWeight: 600 }} required />
        <Input label="Barangay" value={locationDetails.barangay} readOnly helperText="Auto-filled from map" style={{ backgroundColor: 'var(--color-neutral-100)', cursor: 'default', color: 'var(--color-neutral-800)', fontWeight: 600 }} required />
        <Input label="Municipality / City" value={locationDetails.municipality} readOnly helperText="Auto-filled from map" style={{ backgroundColor: 'var(--color-neutral-100)', cursor: 'default', color: 'var(--color-neutral-800)', fontWeight: 600 }} required />
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.85rem 1rem', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--color-neutral-50)', border: '1px solid var(--color-neutral-200)' }}>
        <CheckCircle2 style={{ width: '1.125rem', height: '1.125rem', color: '#16a34a', flexShrink: 0 }} />
        <div style={{ minWidth: 0, flex: 1 }}>
          <span style={{ fontSize: '0.6875rem', fontWeight: 800, color: 'var(--color-neutral-400)', textTransform: 'uppercase', display: 'block' }}>Location for Listing</span>
          <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--color-neutral-900)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block' }}>
            {locationDetails.street}, {locationDetails.barangay}, {locationDetails.municipality}, {locationDetails.province}
          </span>
        </div>
      </div>
    </Card>
  );
}

// ─── Photo Upload Card (shared by Donation & Exchange) ──────────────────────
function PhotoUploadCard({
  images,
  onAdd,
  onRemove,
}: {
  images: string[];
  onAdd: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemove: (idx: number) => void;
}) {
  return (
    <Card style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', padding: '1.5rem' }}>
      <div>
        <h3 style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--color-neutral-900)', margin: 0 }}>Item Photos</h3>
        <p style={{ fontSize: '0.75rem', color: 'var(--color-neutral-500)', margin: '0.125rem 0 0 0' }}>Attach up to 5 clear photos of your item.</p>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '0.75rem', paddingTop: '0.25rem' }}>
        {images.map((img, idx) => (
          <div key={idx} style={{ position: 'relative', aspectRatio: '1/1', borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '1px solid var(--color-neutral-200)' }}>
            <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            <button type="button" onClick={() => onRemove(idx)} style={{ position: 'absolute', top: '0.25rem', right: '0.25rem', padding: '0.25rem', backgroundColor: 'rgba(0,0,0,0.6)', color: '#fff', borderRadius: '9999px', border: 'none', cursor: 'pointer' }}>
              <X style={{ width: '0.875rem', height: '0.875rem' }} />
            </button>
          </div>
        ))}
        {images.length < 5 && (
          <label style={{ aspectRatio: '1/1', borderRadius: 'var(--radius-md)', border: '2px dashed var(--color-neutral-300)', backgroundColor: 'var(--color-neutral-50)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', padding: '0.5rem', textAlign: 'center' }}>
            <Upload style={{ width: '1.25rem', height: '1.25rem', color: 'var(--color-neutral-400)', marginBottom: '0.25rem' }} />
            <span style={{ fontSize: '0.625rem', fontWeight: 700, color: 'var(--color-neutral-600)' }}>Add Photo</span>
            <input type="file" accept="image/*" multiple onChange={onAdd} style={{ display: 'none' }} />
          </label>
        )}
      </div>
    </Card>
  );
}

// ─── Submit Row (shared) ─────────────────────────────────────────────────────
function SubmitRow({ isLoading, onCancel, label }: { isLoading: boolean; onCancel: () => void; label: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.75rem', paddingTop: '0.5rem' }}>
      <Button variant="secondary" type="button" onClick={onCancel}>Cancel</Button>
      <Button variant="primary" type="submit" isLoading={isLoading} leftIcon={<PackagePlus style={{ width: '1rem', height: '1rem' }} />}>
        {label}
      </Button>
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────
export default function PostItemPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const [selectedType, setSelectedType] = useState<ItemType | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);

  const defaultLocation: LocationDetails = {
    street: user?.address || 'San Nicolas',
    barangay: user?.barangay || 'San Joaquin Norte',
    municipality: user?.municipality || 'Agoo',
    province: user?.province || 'La Union',
    formattedAddress: `${user?.address || 'San Nicolas'}, ${user?.barangay || 'San Joaquin Norte'}, ${user?.municipality || 'Agoo'}, ${user?.province || 'La Union'}`,
    lat: 16.32,
    lng: 120.36,
  };

  const [locationDetails, setLocationDetails] = useState<LocationDetails>(defaultLocation);
  const [tempLocation, setTempLocation] = useState<LocationDetails | null>(null);

  // ── Donation state ──
  const [donationForm, setDonationForm] = useState({
    title: '', category: 'clothing', condition: 'Good Condition' as ItemCondition,
    description: '', pickupOptions: 'Meet up, Delivery', availability: 'Weekdays 9AM - 5PM',
  });

  // ── Request state ──
  const [requestForm, setRequestForm] = useState({
    title: '', category: 'clothing', preferredCondition: 'Good Condition' as ItemCondition,
    description: '', urgency: 'normal' as 'normal' | 'urgent',
  });

  // ── Exchange state ──
  const [exchangeForm, setExchangeForm] = useState({
    offerTitle: '', offerCategory: 'clothing', offerCondition: 'Good Condition' as ItemCondition,
    offerDescription: '', wantItem: '', wantCategory: 'clothing', meetupOptions: 'Meet up',
  });

  const handleAddImages = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newUrls = Array.from(e.target.files).map((file) => URL.createObjectURL(file));
      setImages((prev) => [...prev, ...newUrls].slice(0, 5));
      toast.success('Photos attached');
    }
  };

  const handleOpenLocationPicker = () => {
    setTempLocation(locationDetails);
    setIsLocationModalOpen(true);
  };

  const handleConfirmLocation = () => {
    if (tempLocation) setLocationDetails(tempLocation);
    setIsLocationModalOpen(false);
    toast.success('Location updated from map');
  };

  const locationPayload = {
    address: locationDetails.street || (user?.address ?? 'Main Street'),
    barangay: locationDetails.barangay || (user?.barangay ?? 'Poblacion'),
    municipality: locationDetails.municipality || (user?.municipality ?? 'San Fernando'),
    province: locationDetails.province || (user?.province ?? 'La Union'),
    lat: locationDetails.lat,
    lng: locationDetails.lng,
  };

  // ── Submit Handlers ──
  const handleDonationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!donationForm.title || !donationForm.description) { toast.error('Please complete all required fields.'); return; }
    setIsLoading(true);
    try {
      await itemsService.createItem({
        title: donationForm.title, category: donationForm.category,
        condition: donationForm.condition, type: 'donation', quantity: 1,
        description: donationForm.description,
        images: images.length > 0 ? images : ['/placeholder-appliance.jpg'],
        status: 'available', ownerId: user?.id ?? 'user-1',
        location: locationPayload,
        pickupOptions: donationForm.pickupOptions.split(',').map((s) => s.trim()),
        availability: donationForm.availability,
      });
      toast.success('Donation posted!');
      navigate('/browse');
    } catch { toast.error('Failed to post donation.'); }
    finally { setIsLoading(false); }
  };

  const handleRequestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!requestForm.title || !requestForm.description) { toast.error('Please complete all required fields.'); return; }
    setIsLoading(true);
    try {
      await itemsService.createItem({
        title: requestForm.title, category: requestForm.category,
        condition: requestForm.preferredCondition, type: 'request', quantity: 1,
        description: `[${requestForm.urgency === 'urgent' ? 'URGENT' : 'NORMAL'}] ${requestForm.description}`,
        images: ['/placeholder-appliance.jpg'],
        status: 'available', ownerId: user?.id ?? 'user-1',
        location: locationPayload,
        pickupOptions: ['Meet up'],
        availability: 'Flexible',
      });
      toast.success('Request posted!');
      navigate('/browse');
    } catch { toast.error('Failed to post request.'); }
    finally { setIsLoading(false); }
  };

  const handleExchangeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!exchangeForm.offerTitle || !exchangeForm.offerDescription || !exchangeForm.wantItem) { toast.error('Please complete all required fields.'); return; }
    setIsLoading(true);
    try {
      await itemsService.createItem({
        title: exchangeForm.offerTitle, category: exchangeForm.offerCategory,
        condition: exchangeForm.offerCondition, type: 'exchange', quantity: 1,
        description: `${exchangeForm.offerDescription}\n\n🔄 Looking for: ${exchangeForm.wantItem}`,
        images: images.length > 0 ? images : ['/placeholder-appliance.jpg'],
        status: 'available', ownerId: user?.id ?? 'user-1',
        location: locationPayload,
        pickupOptions: exchangeForm.meetupOptions.split(',').map((s) => s.trim()),
        availability: 'Flexible',
      });
      toast.success('Exchange listing posted!');
      navigate('/browse');
    } catch { toast.error('Failed to post exchange.'); }
    finally { setIsLoading(false); }
  };

  const selectedTypeInfo = TYPE_OPTIONS.find((t) => t.value === selectedType);
  const dividerColor = selectedTypeInfo?.accent ?? 'var(--color-neutral-300)';

  return (
    <PageLayout>
      <div style={{ maxWidth: '48rem', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <button
          onClick={() => navigate(-1)}
          style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-neutral-500)', display: 'inline-flex', alignItems: 'center', gap: '0.375rem', cursor: 'pointer', border: 'none', background: 'none', width: 'fit-content' }}
        >
          <ArrowLeft style={{ width: '1rem', height: '1rem' }} /> Cancel
        </button>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-neutral-900)', margin: 0 }}>Post a New Item</h1>
          <p style={{ fontSize: '0.75rem', color: 'var(--color-neutral-500)', margin: 0 }}>
            Donate, request, or exchange items with your local community.
          </p>
        </div>

        {/* ── Step 1: Type Selector ── */}
        <Card style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <h3 style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--color-neutral-900)', margin: 0 }}>What are you posting?</h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--color-neutral-500)', margin: '0.25rem 0 0' }}>Select the type of listing you want to create.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.875rem' }}>
            {TYPE_OPTIONS.map((opt) => {
              const isActive = selectedType === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => { setSelectedType(opt.value); setImages([]); }}
                  style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '0.5rem',
                    padding: '1rem', borderRadius: 'var(--radius-md)',
                    border: `2px solid ${isActive ? opt.accent : opt.border}`,
                    backgroundColor: isActive ? opt.activeBg : opt.bg,
                    cursor: 'pointer', textAlign: 'left',
                    transition: 'border-color 150ms, background-color 150ms, box-shadow 150ms',
                    boxShadow: isActive ? `0 0 0 3px ${opt.accent}22` : 'none',
                  }}
                >
                  <span style={{ color: opt.accent }}>{opt.icon}</span>
                  <div>
                    <div style={{ fontSize: '0.875rem', fontWeight: 700, color: isActive ? opt.accent : 'var(--color-neutral-800)' }}>{opt.label}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--color-neutral-500)', marginTop: '0.125rem', lineHeight: 1.4 }}>{opt.desc}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </Card>

        {/* ── Divider ── */}
        {selectedType && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ flex: 1, height: '2px', backgroundColor: dividerColor, opacity: 0.3 }} />
            <span style={{ fontSize: '0.72rem', fontWeight: 800, color: dividerColor, textTransform: 'uppercase', letterSpacing: '0.08em', whiteSpace: 'nowrap' }}>
              {selectedTypeInfo?.label} Details
            </span>
            <div style={{ flex: 1, height: '2px', backgroundColor: dividerColor, opacity: 0.3 }} />
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════
            DONATION FORM
        ══════════════════════════════════════════════════════════ */}
        {selectedType === 'donation' && (
          <form onSubmit={handleDonationSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <PhotoUploadCard images={images} onAdd={handleAddImages} onRemove={(i) => setImages((p) => p.filter((_, idx) => idx !== i))} />

            <Card style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', padding: '1.5rem' }}>
              <div style={{ borderBottom: '1px solid var(--color-neutral-100)', paddingBottom: '0.5rem' }}>
                <h3 style={{ fontSize: '0.875rem', fontWeight: 700, color: '#16a34a', margin: 0, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Gift style={{ width: '1rem', height: '1rem' }} /> Donation Details
                </h3>
              </div>
              <Input label="Item Title *" placeholder="e.g. Grade 10 Math Textbooks & Notebooks" value={donationForm.title} onChange={(e) => setDonationForm({ ...donationForm, title: e.target.value })} required />
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                <Select label="Category" options={categories.map((c) => ({ value: c.id, label: c.name }))} value={donationForm.category} onChange={(e) => setDonationForm({ ...donationForm, category: e.target.value })} />
                <Select label="Condition" options={CONDITION_OPTIONS} value={donationForm.condition} onChange={(e) => setDonationForm({ ...donationForm, condition: e.target.value as ItemCondition })} />
              </div>
              <Textarea label="Description *" placeholder="Describe the item's condition, size, any wear & tear, and why you're donating it..." value={donationForm.description} onChange={(e) => setDonationForm({ ...donationForm, description: e.target.value })} required rows={4} />
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                <Input label="Pickup / Delivery Options" value={donationForm.pickupOptions} onChange={(e) => setDonationForm({ ...donationForm, pickupOptions: e.target.value })} placeholder="Meet up, Delivery" />
                <Input label="Available Schedule" value={donationForm.availability} onChange={(e) => setDonationForm({ ...donationForm, availability: e.target.value })} placeholder="Weekdays after 5PM" />
              </div>
            </Card>

            <LocationCard locationDetails={locationDetails} onOpenPicker={handleOpenLocationPicker} />
            <SubmitRow isLoading={isLoading} onCancel={() => navigate('/browse')} label="Post Donation" />
          </form>
        )}

        {/* ══════════════════════════════════════════════════════════
            REQUEST FORM
        ══════════════════════════════════════════════════════════ */}
        {selectedType === 'request' && (
          <form onSubmit={handleRequestSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <Card style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', padding: '1.5rem' }}>
              <div style={{ borderBottom: '1px solid var(--color-neutral-100)', paddingBottom: '0.5rem' }}>
                <h3 style={{ fontSize: '0.875rem', fontWeight: 700, color: '#2563eb', margin: 0, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <HandHelping style={{ width: '1rem', height: '1rem' }} /> What Do You Need?
                </h3>
              </div>

              <Input label="Item You're Looking For *" placeholder="e.g. Second-hand school uniform, size M" value={requestForm.title} onChange={(e) => setRequestForm({ ...requestForm, title: e.target.value })} required />

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                <Select label="Category" options={categories.map((c) => ({ value: c.id, label: c.name }))} value={requestForm.category} onChange={(e) => setRequestForm({ ...requestForm, category: e.target.value })} />
                <Select label="Preferred Condition" options={[{ value: 'Any', label: 'Any Condition' }, ...CONDITION_OPTIONS]} value={requestForm.preferredCondition} onChange={(e) => setRequestForm({ ...requestForm, preferredCondition: e.target.value as ItemCondition })} />
              </div>

              <Textarea label="Why Do You Need This? *" placeholder="Briefly explain your situation and how this item will help you or your family..." value={requestForm.description} onChange={(e) => setRequestForm({ ...requestForm, description: e.target.value })} required rows={4} />

              {/* Urgency */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-neutral-700)' }}>Urgency</span>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  {([
                    { value: 'normal', label: 'Normal', desc: 'Needed within a few weeks', color: '#2563eb' },
                    { value: 'urgent', label: 'Urgent', desc: 'Needed as soon as possible', color: '#dc2626' },
                  ] as const).map((u) => {
                    const isActive = requestForm.urgency === u.value;
                    return (
                      <button
                        key={u.value}
                        type="button"
                        onClick={() => setRequestForm({ ...requestForm, urgency: u.value })}
                        style={{
                          display: 'flex', alignItems: 'center', gap: '0.625rem',
                          padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', textAlign: 'left', cursor: 'pointer',
                          border: `2px solid ${isActive ? u.color : 'var(--color-neutral-200)'}`,
                          backgroundColor: isActive ? `${u.color}11` : '#fff',
                          transition: 'all 150ms',
                        }}
                      >
                        <AlertCircle style={{ width: '1rem', height: '1rem', color: isActive ? u.color : 'var(--color-neutral-400)', flexShrink: 0 }} />
                        <div>
                          <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: isActive ? u.color : 'var(--color-neutral-700)' }}>{u.label}</div>
                          <div style={{ fontSize: '0.6875rem', color: 'var(--color-neutral-500)' }}>{u.desc}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </Card>

            <LocationCard locationDetails={locationDetails} onOpenPicker={handleOpenLocationPicker} />
            <SubmitRow isLoading={isLoading} onCancel={() => navigate('/browse')} label="Post Request" />
          </form>
        )}

        {/* ══════════════════════════════════════════════════════════
            EXCHANGE FORM
        ══════════════════════════════════════════════════════════ */}
        {selectedType === 'exchange' && (
          <form onSubmit={handleExchangeSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <PhotoUploadCard images={images} onAdd={handleAddImages} onRemove={(i) => setImages((p) => p.filter((_, idx) => idx !== i))} />

            {/* What you're offering */}
            <Card style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', padding: '1.5rem' }}>
              <div style={{ borderBottom: '1px solid var(--color-neutral-100)', paddingBottom: '0.5rem' }}>
                <h3 style={{ fontSize: '0.875rem', fontWeight: 700, color: '#d97706', margin: 0, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <ArrowLeftRight style={{ width: '1rem', height: '1rem' }} /> What Are You Offering?
                </h3>
              </div>
              <Input label="Item You're Offering *" placeholder="e.g. Portable Bluetooth Speaker" value={exchangeForm.offerTitle} onChange={(e) => setExchangeForm({ ...exchangeForm, offerTitle: e.target.value })} required />
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                <Select label="Category" options={categories.map((c) => ({ value: c.id, label: c.name }))} value={exchangeForm.offerCategory} onChange={(e) => setExchangeForm({ ...exchangeForm, offerCategory: e.target.value })} />
                <Select label="Condition" options={CONDITION_OPTIONS} value={exchangeForm.offerCondition} onChange={(e) => setExchangeForm({ ...exchangeForm, offerCondition: e.target.value as ItemCondition })} />
              </div>
              <Textarea label="Description of Your Item *" placeholder="Describe what you're offering — its features, condition, and any accessories included..." value={exchangeForm.offerDescription} onChange={(e) => setExchangeForm({ ...exchangeForm, offerDescription: e.target.value })} required rows={3} />
            </Card>

            {/* What you want in return */}
            <Card style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', padding: '1.5rem' }}>
              <div style={{ borderBottom: '1px solid var(--color-neutral-100)', paddingBottom: '0.5rem' }}>
                <h3 style={{ fontSize: '0.875rem', fontWeight: 700, color: '#d97706', margin: 0, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  🔄 What Do You Want in Return?
                </h3>
              </div>
              <Input label="Item You Want *" placeholder="e.g. School backpack for Grade 7, any color" value={exchangeForm.wantItem} onChange={(e) => setExchangeForm({ ...exchangeForm, wantItem: e.target.value })} required />
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                <Select label="Preferred Category" options={[{ value: 'any', label: 'Any Category' }, ...categories.map((c) => ({ value: c.id, label: c.name }))]} value={exchangeForm.wantCategory} onChange={(e) => setExchangeForm({ ...exchangeForm, wantCategory: e.target.value })} />
                <Input label="Meetup / Delivery Preference" value={exchangeForm.meetupOptions} onChange={(e) => setExchangeForm({ ...exchangeForm, meetupOptions: e.target.value })} placeholder="Meet up, Delivery" />
              </div>
            </Card>

            <LocationCard locationDetails={locationDetails} onOpenPicker={handleOpenLocationPicker} />
            <SubmitRow isLoading={isLoading} onCancel={() => navigate('/browse')} label="Post Exchange" />
          </form>
        )}
      </div>

      {/* Location Picker Modal */}
      {isLocationModalOpen && (
        <div
          role="dialog" aria-modal="true" aria-labelledby="location-picker-title"
          onMouseDown={(e) => { if (e.target === e.currentTarget) setIsLocationModalOpen(false); }}
          style={{ position: 'fixed', inset: 0, zIndex: 1000, backgroundColor: 'rgba(0,0,0,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}
        >
          <div style={{ width: 'min(52rem, 100%)', maxHeight: 'calc(100vh - 2rem)', backgroundColor: '#fff', borderRadius: '1rem', overflow: 'hidden', boxShadow: '0 24px 70px rgba(0,0,0,0.22)', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--color-neutral-200)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
              <div>
                <h2 id="location-picker-title" style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: 'var(--color-neutral-900)' }}>Choose Location on Map</h2>
                <p style={{ margin: '0.2rem 0 0', fontSize: '0.72rem', color: 'var(--color-neutral-500)' }}>Tap the map or drag the pin to set your Street, Barangay, and Municipality.</p>
              </div>
              <button type="button" onClick={() => setIsLocationModalOpen(false)} aria-label="Close" style={{ width: '2rem', height: '2rem', border: 'none', borderRadius: '9999px', backgroundColor: 'var(--color-neutral-100)', display: 'grid', placeItems: 'center', cursor: 'pointer' }}>
                <X style={{ width: '1rem', height: '1rem' }} />
              </button>
            </div>
            <div style={{ position: 'relative', flex: 1, minHeight: '22rem' }}>
              <LiveLocationMap location={tempLocation} onLocationChange={(details) => setTempLocation(details)} />
            </div>
            <div style={{ padding: '0.85rem 1.25rem', borderTop: '1px solid var(--color-neutral-200)', backgroundColor: '#fff' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ fontSize: '0.68rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--color-neutral-500)' }}>Selected Location</div>
                  <div style={{ marginTop: '0.15rem', fontSize: '0.8125rem', fontWeight: 700, color: 'var(--color-neutral-900)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {tempLocation ? `${tempLocation.street}, ${tempLocation.barangay}, ${tempLocation.municipality}` : 'Tap map to select'}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.6rem', marginLeft: 'auto' }}>
                  <Button type="button" variant="secondary" onClick={() => setIsLocationModalOpen(false)}>Cancel</Button>
                  <Button type="button" variant="primary" onClick={handleConfirmLocation}>Apply Location</Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </PageLayout>
  );
}