import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, X, PackagePlus, ArrowLeft, MapPin, CheckCircle2 } from 'lucide-react';
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

export default function PostItemPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const [formData, setFormData] = useState({
    title: '',
    category: 'clothing',
    condition: 'Good Condition' as ItemCondition,
    type: 'donation' as ItemType,
    quantity: 1,
    description: '',
    pickupOptions: 'Meet up, Delivery',
    availability: 'Weekdays 9AM - 5PM',
  });

  const [images, setImages] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);

  // Structured location using Street, Barangay, and Municipality
  const [locationDetails, setLocationDetails] = useState<LocationDetails>({
    street: user?.address || 'San Nicolas',
    barangay: user?.barangay || 'San Joaquin Norte',
    municipality: user?.municipality || 'Agoo',
    province: user?.province || 'La Union',
    formattedAddress: `${user?.address || 'San Nicolas'}, ${user?.barangay || 'San Joaquin Norte'}, ${user?.municipality || 'Agoo'}, ${user?.province || 'La Union'}`,
    lat: 16.32,
    lng: 120.36,
  });

  const [tempLocation, setTempLocation] = useState<LocationDetails | null>(null);

  const handleSimulateImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newUrls = Array.from(e.target.files).map((file) => URL.createObjectURL(file));
      setImages((prev) => [...prev, ...newUrls].slice(0, 5));
      toast.success('Photos attached');
    }
  };

  const removeImage = (idx: number) => {
    setImages((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleOpenLocationPicker = () => {
    setTempLocation(locationDetails);
    setIsLocationModalOpen(true);
  };

  const handleConfirmLocation = () => {
    if (tempLocation) {
      setLocationDetails(tempLocation);
    }
    setIsLocationModalOpen(false);
    toast.success('Location updated from map');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.description) {
      toast.error('Please complete all required fields.');
      return;
    }

    setIsLoading(true);
    try {
      await itemsService.createItem({
        title: formData.title,
        category: formData.category,
        condition: formData.condition,
        type: formData.type,
        quantity: formData.quantity,
        description: formData.description,
        images: images.length > 0 ? images : ['/placeholder-appliance.jpg'],
        status: 'available',
        ownerId: user?.id ?? 'user-1',
        location: {
          address: locationDetails.street || (user?.address ?? 'Main Street'),
          barangay: locationDetails.barangay || (user?.barangay ?? 'Poblacion'),
          municipality: locationDetails.municipality || (user?.municipality ?? 'San Fernando'),
          province: locationDetails.province || (user?.province ?? 'La Union'),
          lat: locationDetails.lat,
          lng: locationDetails.lng,
        },
        pickupOptions: formData.pickupOptions.split(',').map((s) => s.trim()),
        availability: formData.availability,
      });

      toast.success('Item published successfully!');
      navigate('/browse');
    } catch {
      toast.error('Failed to post item.');
    } finally {
      setIsLoading(false);
    }
  };

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
            Offer an item for donation or propose an item swap to your local community.
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Photos Upload */}
          <Card style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', padding: '1.5rem' }}>
            <div>
              <h3 style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--color-neutral-900)', margin: 0 }}>Upload Item Photos</h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--color-neutral-500)', margin: '0.125rem 0 0 0' }}>Attach up to 5 clear photos of your item.</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '0.75rem', paddingTop: '0.25rem' }}>
              {images.map((img, idx) => (
                <div key={idx} style={{ position: 'relative', aspectRatio: '1/1', borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '1px solid var(--color-neutral-200)' }}>
                  <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <button
                    type="button"
                    onClick={() => removeImage(idx)}
                    style={{ position: 'absolute', top: '0.25rem', right: '0.25rem', padding: '0.25rem', backgroundColor: 'rgba(0,0,0,0.6)', color: '#fff', borderRadius: '9999px', border: 'none', cursor: 'pointer' }}
                  >
                    <X style={{ width: '0.875rem', height: '0.875rem' }} />
                  </button>
                </div>
              ))}

              {images.length < 5 && (
                <label style={{ aspectRatio: '1/1', borderRadius: 'var(--radius-md)', border: '2px dashed var(--color-neutral-300)', backgroundColor: 'var(--color-neutral-50)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', padding: '0.5rem', textAlign: 'center' }}>
                  <Upload style={{ width: '1.25rem', height: '1.25rem', color: 'var(--color-neutral-400)', marginBottom: '0.25rem' }} />
                  <span style={{ fontSize: '0.625rem', fontWeight: 700, color: 'var(--color-neutral-600)' }}>Add Photo</span>
                  <input type="file" accept="image/*" multiple onChange={handleSimulateImageUpload} style={{ display: 'none' }} />
                </label>
              )}
            </div>
          </Card>

          {/* Item Information */}
          <Card style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', padding: '1.5rem' }}>
            <div style={{ borderBottom: '1px solid var(--color-neutral-100)', paddingBottom: '0.5rem' }}>
              <h3 style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--color-neutral-900)', margin: 0 }}>
                Item Information
              </h3>
            </div>

            <Input
              label="Item Title"
              placeholder="e.g. Grade 10 Math Textbooks & Notebooks"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
              <Select
                label="Post Type"
                options={[
                  { value: 'donation', label: 'Free Donation' },
                  { value: 'exchange', label: 'For Exchange' },
                ]}
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as ItemType })}
              />

              <Select
                label="Category"
                options={categories.map((c) => ({ value: c.id, label: c.name }))}
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              />

              <Select
                label="Condition"
                options={[
                  { value: 'Brand New', label: 'Brand New' },
                  { value: 'Like New', label: 'Like New' },
                  { value: 'Good Condition', label: 'Good Condition' },
                  { value: 'Fair', label: 'Fair' },
                  { value: 'Poor', label: 'Poor' },
                ]}
                value={formData.condition}
                onChange={(e) => setFormData({ ...formData, condition: e.target.value as ItemCondition })}
              />
            </div>

            <Textarea
              label="Item Description"
              placeholder="Describe your item's state, features, and pickup preferences..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
              rows={4}
            />

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
              <Input
                label="Pickup / Delivery Options"
                value={formData.pickupOptions}
                onChange={(e) => setFormData({ ...formData, pickupOptions: e.target.value })}
                placeholder="Meet up, Delivery"
              />
              <Input
                label="Available Schedule"
                value={formData.availability}
                onChange={(e) => setFormData({ ...formData, availability: e.target.value })}
                placeholder="Weekdays after 5PM"
              />
            </div>
          </Card>

          {/* Location Card — Street, Barangay, Municipality */}
          <Card style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <MapPin style={{ width: '1.1rem', height: '1.1rem', color: 'var(--color-primary-600)' }} />
                  <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--color-neutral-900)', margin: 0 }}>Item Location</h3>
                </div>
                <p style={{ fontSize: '0.75rem', color: 'var(--color-neutral-500)', margin: '0.25rem 0 0' }}>
                  Provide the street, barangay, and municipality for local pickup and community discovery.
                </p>
              </div>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleOpenLocationPicker}
                leftIcon={<MapPin style={{ width: '0.875rem', height: '0.875rem' }} />}
              >
                Choose on Map
              </Button>
            </div>

            {/* Uneditable / Read-only Street, Barangay, and Municipality Fields driven by map */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
              <Input
                label="Street / Landmark"
                value={locationDetails.street}
                readOnly
                helperText="Auto-filled from map selection"
                style={{ backgroundColor: 'var(--color-neutral-100)', cursor: 'default', color: 'var(--color-neutral-800)', fontWeight: 600 }}
                required
              />
              <Input
                label="Barangay"
                value={locationDetails.barangay}
                readOnly
                helperText="Auto-filled from map selection"
                style={{ backgroundColor: 'var(--color-neutral-100)', cursor: 'default', color: 'var(--color-neutral-800)', fontWeight: 600 }}
                required
              />
              <Input
                label="Municipality / City"
                value={locationDetails.municipality}
                readOnly
                helperText="Auto-filled from map selection"
                style={{ backgroundColor: 'var(--color-neutral-100)', cursor: 'default', color: 'var(--color-neutral-800)', fontWeight: 600 }}
                required
              />
            </div>

            {/* Location Summary Box */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.85rem 1rem',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--color-neutral-50)',
                border: '1px solid var(--color-neutral-200)',
              }}
            >
              <CheckCircle2 style={{ width: '1.125rem', height: '1.125rem', color: '#16a34a', flexShrink: 0 }} />
              <div style={{ minWidth: 0, flex: 1 }}>
                <span style={{ fontSize: '0.6875rem', fontWeight: 800, color: 'var(--color-neutral-400)', textTransform: 'uppercase', display: 'block' }}>
                  Location for Listing
                </span>
                <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--color-neutral-900)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block' }}>
                  {locationDetails.street}, {locationDetails.barangay}, {locationDetails.municipality}, {locationDetails.province}
                </span>
              </div>
            </div>
          </Card>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.75rem', paddingTop: '0.5rem' }}>
            <Button variant="secondary" type="button" onClick={() => navigate('/browse')}>
              Cancel
            </Button>
            <Button
              variant="primary"
              type="submit"
              isLoading={isLoading}
              className="px-6 font-bold shadow-button"
              leftIcon={<PackagePlus style={{ width: '1rem', height: '1rem' }} />}
            >
              Publish Listing
            </Button>
          </div>
        </form>
      </div>

      {/* Location Picker Modal with Leaflet Map */}
      {isLocationModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="location-picker-title"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setIsLocationModalOpen(false);
          }}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 1000,
            backgroundColor: 'rgba(0,0,0,0.55)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
          }}
        >
          <div style={{ width: 'min(52rem, 100%)', maxHeight: 'calc(100vh - 2rem)', backgroundColor: '#fff', borderRadius: '1rem', overflow: 'hidden', boxShadow: '0 24px 70px rgba(0,0,0,0.22)', display: 'flex', flexDirection: 'column' }}>
            {/* Modal Header */}
            <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--color-neutral-200)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
              <div>
                <h2 id="location-picker-title" style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: 'var(--color-neutral-900)' }}>Choose Location on Map</h2>
                <p style={{ margin: '0.2rem 0 0', fontSize: '0.72rem', color: 'var(--color-neutral-500)' }}>Tap the map or drag the pin to set your neighborhood Street, Barangay, and Municipality.</p>
              </div>
              <button type="button" onClick={() => setIsLocationModalOpen(false)} aria-label="Close location picker" style={{ width: '2rem', height: '2rem', border: 'none', borderRadius: '9999px', backgroundColor: 'var(--color-neutral-100)', display: 'grid', placeItems: 'center', cursor: 'pointer' }}>
                <X style={{ width: '1rem', height: '1rem' }} />
              </button>
            </div>

            {/* Map Canvas */}
            <div style={{ position: 'relative', flex: 1, minHeight: '22rem' }}>
              <LiveLocationMap
                location={tempLocation}
                onLocationChange={(details) => setTempLocation(details)}
              />
            </div>

            {/* Modal Footer */}
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