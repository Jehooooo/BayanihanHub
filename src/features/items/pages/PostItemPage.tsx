import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, X, PackagePlus, ArrowLeft, LocateFixed, MapPin, CheckCircle2, AlertCircle } from 'lucide-react';
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
import LiveLocationMap, { type LiveLocationPoint } from '../components/LiveLocationMap';

type LocationStatus = 'idle' | 'loading' | 'success' | 'denied' | 'unavailable' | 'timeout' | 'unsupported';

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
  const [liveLocation, setLiveLocation] = useState<LiveLocationPoint | null>(null);
  const [locationStatus, setLocationStatus] = useState<LocationStatus>('idle');
  const [locationMessage, setLocationMessage] = useState('No location detected yet.');
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);

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
    setIsLocationModalOpen(true);
  };

  const handleConfirmLocation = () => {
    if (!liveLocation) {
      toast.error('Please choose a location first.');
      return;
    }
    setIsLocationModalOpen(false);
    toast.success('Location selected for this item');
  };

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationStatus('unsupported');
      setLocationMessage('Your browser does not support location services.');
      toast.error('Location services are not supported by this browser.');
      return;
    }

    setLocationStatus('loading');
    setLocationMessage('Requesting your current location…');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const nextLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        setLiveLocation(nextLocation);
        setLocationStatus('success');
        setLocationMessage('Current location detected successfully.');
        toast.success('Current location detected');
      },
      (error) => {
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setLocationStatus('denied');
            setLocationMessage('Location permission was denied. Allow location access in your browser settings and try again.');
            break;
          case error.POSITION_UNAVAILABLE:
            setLocationStatus('unavailable');
            setLocationMessage('Your location could not be determined right now. Check your device location services and try again.');
            break;
          case error.TIMEOUT:
            setLocationStatus('timeout');
            setLocationMessage('The location request timed out. Please try again.');
            break;
          default:
            setLocationStatus('unavailable');
            setLocationMessage('We could not detect your location. Please try again.');
        }
        toast.error('Unable to detect your current location');
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      }
    );
  };

  const handleMapLocationChange = (location: LiveLocationPoint) => {
    setLiveLocation(location);
    setLocationStatus('success');
    setLocationMessage('Location selected on the map.');
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
          address: liveLocation ? 'Current detected location' : (user?.address ?? 'Main St.'),
          barangay: user?.barangay ?? 'Poblacion',
          municipality: user?.municipality ?? 'San Fernando',
          province: user?.province ?? 'La Union',
          ...(liveLocation ? { lat: liveLocation.lat, lng: liveLocation.lng } : {}),
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

  const isLocationSuccess = locationStatus === 'success';
  const isLocationError = ['denied', 'unavailable', 'timeout', 'unsupported'].includes(locationStatus);

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

          <Card style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <MapPin style={{ width: '1.1rem', height: '1.1rem', color: 'var(--color-primary-600)' }} />
                  <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--color-neutral-900)', margin: 0 }}>Live Location</h3>
                </div>
                <p style={{ fontSize: '0.75rem', color: 'var(--color-neutral-500)', margin: '0.25rem 0 0' }}>
                  Attach your current neighborhood location so nearby neighbors can easily find this listing.
                </p>
              </div>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleUseCurrentLocation}
                isLoading={locationStatus === 'loading'}
                leftIcon={<LocateFixed style={{ width: '0.9rem', height: '0.9rem' }} />}
              >
                Use Current Location
              </Button>
            </div>

            <button
              type="button"
              onClick={handleOpenLocationPicker}
              style={{
                width: '100%',
                minHeight: '4.25rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '1rem',
                padding: '0.85rem 1rem',
                border: '1px solid var(--color-neutral-200)',
                borderRadius: 'var(--radius-md)',
                backgroundColor: '#fff',
                cursor: 'pointer',
                textAlign: 'left',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', minWidth: 0 }}>
                <div style={{ width: '2.5rem', height: '2.5rem', borderRadius: '9999px', backgroundColor: isLocationSuccess ? '#f0fdf4' : 'var(--color-neutral-100)', display: 'grid', placeItems: 'center', flex: '0 0 auto' }}>
                  <MapPin style={{ width: '1.1rem', height: '1.1rem', color: isLocationSuccess ? '#16a34a' : 'var(--color-neutral-600)' }} />
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--color-neutral-900)' }}>
                    {liveLocation ? 'Location coordinates attached' : 'Select or view location on map'}
                  </div>
                  <div style={{ marginTop: '0.15rem', fontSize: '0.72rem', color: 'var(--color-neutral-500)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {liveLocation
                      ? `Latitude: ${liveLocation.lat.toFixed(5)}, Longitude: ${liveLocation.lng.toFixed(5)}`
                      : 'Tap to open interactive map or use current location'}
                  </div>
                </div>
              </div>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-primary-700)', flex: '0 0 auto' }}>
                {liveLocation ? 'Open Map / Change' : 'Open Map'}
              </span>
            </button>

            <div
              role="status"
              aria-live="polite"
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.5rem',
                padding: '0.65rem 0.75rem',
                borderRadius: 'var(--radius-md)',
                backgroundColor: isLocationSuccess ? '#f0fdf4' : isLocationError ? '#fef2f2' : 'var(--color-neutral-50)',
                color: isLocationSuccess ? '#166534' : isLocationError ? '#991b1b' : 'var(--color-neutral-600)',
                fontSize: '0.75rem',
              }}
            >
              {isLocationSuccess ? (
                <CheckCircle2 style={{ width: '1rem', height: '1rem', flex: '0 0 auto' }} />
              ) : isLocationError ? (
                <AlertCircle style={{ width: '1rem', height: '1rem', flex: '0 0 auto' }} />
              ) : (
                <LocateFixed style={{ width: '1rem', height: '1rem', flex: '0 0 auto' }} />
              )}
              <span>{locationMessage}</span>
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
            <div style={{ padding: '1rem 1.1rem', borderBottom: '1px solid var(--color-neutral-200)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
              <div>
                <h2 id="location-picker-title" style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: 'var(--color-neutral-900)' }}>Select Location</h2>
                <p style={{ margin: '0.2rem 0 0', fontSize: '0.72rem', color: 'var(--color-neutral-500)' }}>Move the map, tap a point, or use your current location.</p>
              </div>
              <button type="button" onClick={() => setIsLocationModalOpen(false)} aria-label="Close location picker" style={{ width: '2rem', height: '2rem', border: 'none', borderRadius: '9999px', backgroundColor: 'var(--color-neutral-100)', display: 'grid', placeItems: 'center', cursor: 'pointer' }}>
                <X style={{ width: '1rem', height: '1rem' }} />
              </button>
            </div>

            <div style={{ position: 'relative', flex: 1, minHeight: '24rem' }}>
              <LiveLocationMap location={liveLocation} onLocationChange={handleMapLocationChange} disabled={locationStatus === 'loading'} />

              <div style={{ position: 'absolute', top: '0.8rem', right: '0.8rem' }}>
                <Button
                  type="button"
                  variant="primary"
                  onClick={handleUseCurrentLocation}
                  isLoading={locationStatus === 'loading'}
                  leftIcon={<LocateFixed style={{ width: '1rem', height: '1rem' }} />}
                >
                  Use Current Location
                </Button>
              </div>
            </div>

            <div style={{ padding: '0.85rem 1rem', borderTop: '1px solid var(--color-neutral-200)', backgroundColor: '#fff' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: '0.68rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--color-neutral-500)' }}>Selected location</div>
                  <div style={{ marginTop: '0.2rem', fontSize: '0.78rem', color: 'var(--color-neutral-800)', fontFamily: liveLocation ? 'monospace' : 'inherit' }}>
                    {liveLocation ? `${liveLocation.lat.toFixed(6)}, ${liveLocation.lng.toFixed(6)}` : 'No location selected'}
                  </div>
                  <div style={{ marginTop: '0.2rem', fontSize: '0.7rem', color: isLocationSuccess ? '#166534' : isLocationError ? '#991b1b' : 'var(--color-neutral-500)' }}>{locationMessage}</div>
                </div>
                <div style={{ display: 'flex', gap: '0.6rem', marginLeft: 'auto' }}>
                  <Button type="button" variant="secondary" onClick={() => setIsLocationModalOpen(false)}>Cancel</Button>
                  <Button type="button" variant="primary" onClick={handleConfirmLocation} disabled={!liveLocation}>Confirm Location</Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </PageLayout>
  );
}
