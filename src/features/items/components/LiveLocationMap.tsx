import { useEffect, useRef, useState, useCallback } from 'react';
import { Navigation, LocateFixed, MapPin, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import 'leaflet/dist/leaflet.css';

export interface LiveLocationPoint {
  lat: number;
  lng: number;
}

interface LiveLocationMapProps {
  location: LiveLocationPoint | null;
  onLocationChange?: (location: LiveLocationPoint) => void;
  disabled?: boolean;
}

const DEFAULT_CENTER: LiveLocationPoint = { lat: 16.6159, lng: 120.3167 };

type GpsStatus = 'idle' | 'loading' | 'success' | 'denied' | 'error';

interface NominatimResult {
  display_name: string;
  address?: {
    city?: string;
    town?: string;
    village?: string;
    suburb?: string;
    neighbourhood?: string;
    county?: string;
    state?: string;
  };
}

async function reverseGeocode(lat: number, lng: number): Promise<string> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lng=${lng}&format=json`,
      { headers: { 'Accept-Language': 'en' } }
    );
    const data: NominatimResult = await res.json();
    const a = data.address;
    const parts = [
      a?.neighbourhood ?? a?.suburb,
      a?.village ?? a?.town ?? a?.city,
      a?.state,
    ].filter(Boolean);
    return parts.length > 0 ? parts.join(', ') : data.display_name.split(',').slice(0, 2).join(',').trim();
  } catch {
    return `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
  }
}

export default function LiveLocationMap({ location, onLocationChange, disabled = false }: LiveLocationMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<import('leaflet').Map | null>(null);
  const markerRef = useRef<import('leaflet').Marker | null>(null);
  const onChangeRef = useRef(onLocationChange);
  onChangeRef.current = onLocationChange;

  const [gpsStatus, setGpsStatus] = useState<GpsStatus>('idle');
  const [address, setAddress] = useState<string>('');
  const [isGeocoding, setIsGeocoding] = useState(false);

  const currentPoint = location ?? DEFAULT_CENTER;

  // Update address when location changes
  useEffect(() => {
    if (!location) return;
    setIsGeocoding(true);
    reverseGeocode(location.lat, location.lng).then((addr) => {
      setAddress(addr);
      setIsGeocoding(false);
    });
  }, [location]);

  // Initialize Leaflet map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    import('leaflet').then((L) => {
      if (!mapContainerRef.current || mapRef.current) return;

      // Fix default icon paths for bundlers
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
      });

      // Custom red pulsing icon like Instagram
      const customIcon = L.divIcon({
        className: '',
        html: `
          <div style="position:relative;width:36px;height:36px;display:flex;align-items:center;justify-content:center;">
            <div style="
              position:absolute;
              width:36px;height:36px;
              border-radius:50%;
              background:rgba(239,68,68,0.18);
              animation:liveMapPulse 1.8s ease-out infinite;
            "></div>
            <div style="
              position:absolute;
              width:20px;height:20px;
              border-radius:50%;
              background:rgba(239,68,68,0.32);
              animation:liveMapPulse 1.8s ease-out infinite 0.3s;
            "></div>
            <div style="
              width:14px;height:14px;
              border-radius:50%;
              background:#ef4444;
              border:2.5px solid #fff;
              box-shadow:0 2px 8px rgba(0,0,0,0.35);
              position:relative;z-index:2;
            "></div>
          </div>
        `,
        iconSize: [36, 36],
        iconAnchor: [18, 18],
      });

      const map = L.map(mapContainerRef.current, {
        center: [currentPoint.lat, currentPoint.lng],
        zoom: location ? 16 : 14,
        zoomControl: true,
        attributionControl: false,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
      }).addTo(map);

      // Attribution small
      L.control.attribution({ prefix: '© OpenStreetMap' }).addTo(map);

      const marker = L.marker([currentPoint.lat, currentPoint.lng], {
        icon: customIcon,
        draggable: !disabled,
      }).addTo(map);

      marker.on('dragend', () => {
        const pos = marker.getLatLng();
        onChangeRef.current?.({ lat: pos.lat, lng: pos.lng });
      });

      map.on('click', (e) => {
        if (disabled) return;
        const { lat, lng } = e.latlng;
        marker.setLatLng([lat, lng]);
        onChangeRef.current?.({ lat, lng });
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

  // Update marker when location changes externally
  useEffect(() => {
    if (!markerRef.current || !mapRef.current || !location) return;
    markerRef.current.setLatLng([location.lat, location.lng]);
    mapRef.current.setView([location.lat, location.lng], 16, { animate: true });
  }, [location]);

  const handleUseCurrentLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setGpsStatus('error');
      return;
    }
    setGpsStatus('loading');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const point = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        onChangeRef.current?.(point);
        setGpsStatus('success');
        // Fly map to location
        if (mapRef.current) {
          mapRef.current.flyTo([point.lat, point.lng], 17, { animate: true, duration: 1.2 });
        }
        if (markerRef.current) {
          markerRef.current.setLatLng([point.lat, point.lng]);
        }
      },
      (err) => {
        setGpsStatus(err.code === err.PERMISSION_DENIED ? 'denied' : 'error');
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 }
    );
  }, []);

  return (
    <>
      {/* Inject pulse keyframes once */}
      <style>{`
        @keyframes liveMapPulse {
          0% { transform: scale(0.6); opacity: 0.9; }
          100% { transform: scale(2.2); opacity: 0; }
        }
      `}</style>

      <div style={{ borderRadius: 'var(--radius-lg)', overflow: 'hidden', border: '1px solid var(--color-neutral-200)', position: 'relative', display: 'flex', flexDirection: 'column' }}>
        {/* Map */}
        <div ref={mapContainerRef} style={{ height: '22rem', width: '100%', backgroundColor: '#e5e7eb' }} />

        {/* Instagram-style "Use My Location" button — top right overlay */}
        <button
          type="button"
          onClick={handleUseCurrentLocation}
          disabled={gpsStatus === 'loading' || disabled}
          style={{
            position: 'absolute',
            top: '0.75rem',
            right: '0.75rem',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '0.5rem 0.875rem',
            backgroundColor: gpsStatus === 'loading' ? 'rgba(255,255,255,0.85)' : '#ffffff',
            border: '1px solid var(--color-neutral-200)',
            borderRadius: '9999px',
            fontSize: '0.75rem',
            fontWeight: 700,
            color: gpsStatus === 'denied' ? 'var(--color-danger)' : 'var(--color-primary-700)',
            cursor: gpsStatus === 'loading' ? 'not-allowed' : 'pointer',
            boxShadow: '0 2px 10px rgba(0,0,0,0.14)',
            backdropFilter: 'blur(6px)',
            transition: 'all 150ms',
          }}
        >
          {gpsStatus === 'loading' ? (
            <Loader2 style={{ width: '0.875rem', height: '0.875rem', animation: 'spin 0.8s linear infinite' }} />
          ) : gpsStatus === 'denied' ? (
            <AlertCircle style={{ width: '0.875rem', height: '0.875rem' }} />
          ) : (
            <LocateFixed style={{ width: '0.875rem', height: '0.875rem' }} />
          )}
          {gpsStatus === 'loading' ? 'Locating…' : gpsStatus === 'denied' ? 'Location Denied' : 'Use My Location'}
        </button>

        {/* Hint overlay bottom-left */}
        {!location && (
          <div style={{
            position: 'absolute',
            bottom: '3.5rem',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 1000,
            padding: '0.4rem 0.875rem',
            backgroundColor: 'rgba(0,0,0,0.62)',
            color: '#fff',
            fontSize: '0.6875rem',
            fontWeight: 600,
            borderRadius: '9999px',
            backdropFilter: 'blur(4px)',
            whiteSpace: 'nowrap',
            pointerEvents: 'none',
          }}>
            Tap on the map or drag the pin to set location
          </div>
        )}

        {/* Footer address bar — Instagram style */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.65rem 0.875rem',
          backgroundColor: '#fff',
          borderTop: '1px solid var(--color-neutral-100)',
          minHeight: '2.75rem',
        }}>
          {location ? (
            <>
              <CheckCircle2 style={{ width: '1rem', height: '1rem', color: '#16a34a', flexShrink: 0 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                {isGeocoding ? (
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-neutral-400)', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                    <Loader2 style={{ width: '0.75rem', height: '0.75rem', animation: 'spin 0.8s linear infinite' }} />
                    Getting address…
                  </span>
                ) : (
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-neutral-900)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block' }}>
                    {address}
                  </span>
                )}
                <span style={{ fontSize: '0.6875rem', color: 'var(--color-neutral-400)', fontFamily: 'monospace' }}>
                  {location.lat.toFixed(5)}, {location.lng.toFixed(5)}
                </span>
              </div>
            </>
          ) : (
            <>
              <MapPin style={{ width: '1rem', height: '1rem', color: 'var(--color-neutral-400)', flexShrink: 0 }} />
              <span style={{ fontSize: '0.75rem', color: 'var(--color-neutral-500)' }}>
                {gpsStatus === 'loading' ? 'Detecting your location…' : 'No location selected yet'}
              </span>
            </>
          )}
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '0.25rem', flexShrink: 0 }}>
            <Navigation style={{ width: '0.75rem', height: '0.75rem', color: 'var(--color-primary-500)' }} />
            <span style={{ fontSize: '0.625rem', fontWeight: 700, color: 'var(--color-primary-600)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Live</span>
          </div>
        </div>
      </div>
    </>
  );
}