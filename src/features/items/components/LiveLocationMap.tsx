import { useEffect, useRef, useState } from 'react';
import { MapPin, CheckCircle2, Loader2, Navigation } from 'lucide-react';
import 'leaflet/dist/leaflet.css';

export interface LocationDetails {
  lat?: number;
  lng?: number;
  street: string;
  barangay: string;
  municipality: string;
  province: string;
  formattedAddress: string;
}

interface LiveLocationMapProps {
  location: LocationDetails | null;
  onLocationChange?: (details: LocationDetails) => void;
  disabled?: boolean;
}

const DEFAULT_COORDS = { lat: 16.6159, lng: 120.3167 }; // San Fernando, La Union

interface NominatimAddress {
  house_number?: string;
  road?: string;
  street?: string;
  pedestrian?: string;
  path?: string;
  highway?: string;
  residential?: string;
  building?: string;
  neighbourhood?: string;
  suburb?: string;
  village?: string;
  quarter?: string;
  hamlet?: string;
  borough?: string;
  city?: string;
  town?: string;
  municipality?: string;
  county?: string;
  state?: string;
  province?: string;
  region?: string;
}

interface NominatimResponse {
  name?: string;
  display_name: string;
  address?: NominatimAddress;
}

export async function reverseGeocodeToLocation(lat: number, lng: number): Promise<LocationDetails> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lng=${lng}&format=json&addressdetails=1`,
      { headers: { 'Accept-Language': 'en' } }
    );
    const data: NominatimResponse = await res.json();
    const a = data.address || {};

    // 1. Street Name
    const rawStreet = [a.house_number, a.road || a.street || a.pedestrian || a.path || a.highway || a.residential || a.building]
      .filter(Boolean)
      .join(' ');
    const street = rawStreet || (data.name && data.name !== a.city && data.name !== a.town ? data.name : '') || 'Street / Road';

    // 2. Barangay Name
    const rawBarangay = a.neighbourhood || a.suburb || a.village || a.quarter || a.hamlet || a.borough || 'Poblacion';
    const barangay = rawBarangay.toLowerCase().startsWith('barangay') || rawBarangay.toLowerCase().startsWith('brgy')
      ? rawBarangay
      : `Barangay ${rawBarangay}`;

    // 3. Municipality / City Name
    const municipality = a.city || a.town || a.municipality || a.county || 'San Fernando';

    // 4. Province
    const province = a.state || a.province || a.region || 'La Union';

    const formattedAddress = [street, barangay, municipality, province].filter(Boolean).join(', ');

    return {
      lat,
      lng,
      street,
      barangay,
      municipality,
      province,
      formattedAddress,
    };
  } catch {
    return {
      lat,
      lng,
      street: 'Main Street',
      barangay: 'Barangay Poblacion',
      municipality: 'San Fernando',
      province: 'La Union',
      formattedAddress: 'Main Street, Barangay Poblacion, San Fernando, La Union',
    };
  }
}

export default function LiveLocationMap({ location, onLocationChange, disabled = false }: LiveLocationMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<import('leaflet').Map | null>(null);
  const markerRef = useRef<import('leaflet').Marker | null>(null);
  const onChangeRef = useRef(onLocationChange);
  onChangeRef.current = onLocationChange;

  const [isResolving, setIsResolving] = useState(false);

  const initialLat = location?.lat ?? DEFAULT_COORDS.lat;
  const initialLng = location?.lng ?? DEFAULT_COORDS.lng;

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    import('leaflet').then((L) => {
      if (!mapContainerRef.current || mapRef.current) return;

      // Fix icon paths
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
      });

      // Instagram-style pulsing marker icon
      const customIcon = L.divIcon({
        className: '',
        html: `
          <div style="position:relative;width:38px;height:38px;display:flex;align-items:center;justify-content:center;">
            <div style="
              position:absolute;
              width:38px;height:38px;
              border-radius:50%;
              background:rgba(239,68,68,0.22);
              animation:liveMapPulse 1.8s ease-out infinite;
            "></div>
            <div style="
              position:absolute;
              width:22px;height:22px;
              border-radius:50%;
              background:rgba(239,68,68,0.36);
              animation:liveMapPulse 1.8s ease-out infinite 0.35s;
            "></div>
            <div style="
              width:15px;height:15px;
              border-radius:50%;
              background:#ef4444;
              border:2.5px solid #fff;
              box-shadow:0 3px 10px rgba(0,0,0,0.35);
              position:relative;z-index:2;
            "></div>
          </div>
        `,
        iconSize: [38, 38],
        iconAnchor: [19, 19],
      });

      const map = L.map(mapContainerRef.current, {
        center: [initialLat, initialLng],
        zoom: location ? 16 : 14,
        zoomControl: true,
        attributionControl: false,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
      }).addTo(map);

      L.control.attribution({ prefix: '© OpenStreetMap' }).addTo(map);

      const marker = L.marker([initialLat, initialLng], {
        icon: customIcon,
        draggable: !disabled,
      }).addTo(map);

      const updateCoordinates = async (lat: number, lng: number) => {
        setIsResolving(true);
        const details = await reverseGeocodeToLocation(lat, lng);
        setIsResolving(false);
        onChangeRef.current?.(details);
      };

      marker.on('dragend', () => {
        const pos = marker.getLatLng();
        updateCoordinates(pos.lat, pos.lng);
      });

      map.on('click', (e) => {
        if (disabled) return;
        const { lat, lng } = e.latlng;
        marker.setLatLng([lat, lng]);
        updateCoordinates(lat, lng);
      });

      mapRef.current = map;
      markerRef.current = marker;
    });

    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update marker position when location coords change externally
  useEffect(() => {
    if (!markerRef.current || !mapRef.current || !location?.lat || !location?.lng) return;
    markerRef.current.setLatLng([location.lat, location.lng]);
    mapRef.current.setView([location.lat, location.lng], 16, { animate: true });
  }, [location?.lat, location?.lng]);

  return (
    <>
      <style>{`
        @keyframes liveMapPulse {
          0% { transform: scale(0.6); opacity: 0.9; }
          100% { transform: scale(2.2); opacity: 0; }
        }
      `}</style>

      <div style={{ borderRadius: 'var(--radius-lg)', overflow: 'hidden', border: '1px solid var(--color-neutral-200)', position: 'relative', display: 'flex', flexDirection: 'column' }}>
        {/* Leaflet Map Canvas */}
        <div ref={mapContainerRef} style={{ height: '22rem', width: '100%', backgroundColor: '#e5e7eb' }} />

        {/* Floating guidance hint banner */}
        <div style={{
          position: 'absolute',
          top: '0.75rem',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 1000,
          padding: '0.45rem 1rem',
          backgroundColor: 'rgba(255,255,255,0.94)',
          border: '1px solid var(--color-neutral-200)',
          borderRadius: '9999px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.12)',
          backdropFilter: 'blur(6px)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.4rem',
          fontSize: '0.75rem',
          fontWeight: 600,
          color: 'var(--color-neutral-800)',
          pointerEvents: 'none',
        }}>
          <MapPin style={{ width: '0.875rem', height: '0.875rem', color: '#ef4444' }} />
          <span>Tap anywhere on the map or drag the pin</span>
        </div>

        {/* Footer info displaying Street, Barangay, and Municipality */}
        <div style={{
          padding: '0.85rem 1rem',
          backgroundColor: '#ffffff',
          borderTop: '1px solid var(--color-neutral-200)',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.35rem',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <CheckCircle2 style={{ width: '1.1rem', height: '1.1rem', color: '#16a34a', flexShrink: 0 }} />
              <span style={{ fontSize: '0.8125rem', fontWeight: 800, color: 'var(--color-neutral-900)' }}>
                {isResolving ? 'Locating neighborhood…' : 'Selected Neighborhood Location'}
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', flexShrink: 0 }}>
              <Navigation style={{ width: '0.75rem', height: '0.75rem', color: 'var(--color-primary-600)' }} />
              <span style={{ fontSize: '0.625rem', fontWeight: 800, color: 'var(--color-primary-700)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Live Map</span>
            </div>
          </div>

          {isResolving ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', color: 'var(--color-neutral-500)', padding: '0.25rem 0' }}>
              <Loader2 style={{ width: '0.875rem', height: '0.875rem', animation: 'spin 0.8s linear infinite' }} />
              <span>Identifying Street, Barangay, and Municipality…</span>
            </div>
          ) : location ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', marginTop: '0.25rem', backgroundColor: 'var(--color-neutral-50)', padding: '0.6rem 0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-neutral-200)' }}>
              <div>
                <span style={{ fontSize: '0.625rem', fontWeight: 800, color: 'var(--color-neutral-400)', textTransform: 'uppercase', display: 'block' }}>Street / Road</span>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-neutral-900)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block' }}>
                  {location.street || 'Main Road'}
                </span>
              </div>
              <div>
                <span style={{ fontSize: '0.625rem', fontWeight: 800, color: 'var(--color-neutral-400)', textTransform: 'uppercase', display: 'block' }}>Barangay</span>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-neutral-900)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block' }}>
                  {location.barangay || 'Poblacion'}
                </span>
              </div>
              <div>
                <span style={{ fontSize: '0.625rem', fontWeight: 800, color: 'var(--color-neutral-400)', textTransform: 'uppercase', display: 'block' }}>Municipality / City</span>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-neutral-900)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block' }}>
                  {location.municipality || 'San Fernando'}
                </span>
              </div>
            </div>
          ) : (
            <span style={{ fontSize: '0.75rem', color: 'var(--color-neutral-500)' }}>
              Click anywhere on the map to set Street, Barangay, and Municipality.
            </span>
          )}
        </div>
      </div>
    </>
  );
}