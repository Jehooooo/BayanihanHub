import { useEffect, useRef, useState } from 'react';
import { MapPin, Plus, Minus, Navigation, Info } from 'lucide-react';

export interface LiveLocationPoint {
  lat: number;
  lng: number;
}

interface LiveLocationMapProps {
  location: LiveLocationPoint | null;
  onLocationChange?: (location: LiveLocationPoint) => void;
  disabled?: boolean;
}

const DEFAULT_CENTER: LiveLocationPoint = { lat: 16.6159, lng: 120.3167 }; // San Fernando, La Union
const DEFAULT_ZOOM = 14;
const GOOGLE_MAPS_SCRIPT_ID = 'bayanihan-google-maps-script';

interface GoogleMapsWindow {
  google?: {
    maps?: {
      Map: new (element: HTMLElement, options: Record<string, unknown>) => GoogleMapInstance;
      Marker: new (options: Record<string, unknown>) => GoogleMarkerInstance;
    };
  };
}

interface GoogleMapInstance {
  setCenter: (center: LiveLocationPoint) => void;
  setZoom: (zoom: number) => void;
  addListener: (eventName: string, handler: (event: { latLng?: { lat: () => number; lng: () => number } }) => void) => void;
}

interface GoogleMarkerInstance {
  setMap: (map: GoogleMapInstance | null) => void;
  setPosition: (position: LiveLocationPoint) => void;
}

const googleMapsWindow = window as unknown as GoogleMapsWindow;

function loadGoogleMaps(apiKey: string): Promise<void> {
  if (googleMapsWindow.google?.maps?.Map) return Promise.resolve();

  const existingScript = document.getElementById(GOOGLE_MAPS_SCRIPT_ID) as HTMLScriptElement | null;
  if (existingScript) {
    return new Promise((resolve, reject) => {
      existingScript.addEventListener('load', () => resolve(), { once: true });
      existingScript.addEventListener('error', () => reject(new Error('Google Maps could not be loaded.')), { once: true });
    });
  }

  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.id = GOOGLE_MAPS_SCRIPT_ID;
    script.async = true;
    script.defer = true;
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(apiKey)}`;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Google Maps could not be loaded.'));
    document.head.appendChild(script);
  });
}

export default function LiveLocationMap({ location, onLocationChange, disabled = false }: LiveLocationMapProps) {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  const mapElementRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<GoogleMapInstance | null>(null);
  const markerRef = useRef<GoogleMarkerInstance | null>(null);
  const onLocationChangeRef = useRef(onLocationChange);
  const disabledRef = useRef(disabled);

  // Fallback interactive map state
  const [zoomLevel, setZoomLevel] = useState(DEFAULT_ZOOM);
  const currentPoint = location ?? DEFAULT_CENTER;

  useEffect(() => {
    onLocationChangeRef.current = onLocationChange;
  }, [onLocationChange]);

  useEffect(() => {
    disabledRef.current = disabled;
  }, [disabled]);

  // Handle Google Maps initialization if API key is provided
  useEffect(() => {
    if (!apiKey || !mapElementRef.current) return;

    let cancelled = false;

    loadGoogleMaps(apiKey)
      .then(() => {
        if (cancelled || !mapElementRef.current || !googleMapsWindow.google?.maps?.Map) return;

        const maps = googleMapsWindow.google.maps;
        const initialCenter = location ?? DEFAULT_CENTER;
        const map = new maps.Map(mapElementRef.current, {
          center: initialCenter,
          zoom: location ? 16 : DEFAULT_ZOOM,
          clickableIcons: false,
          fullscreenControl: true,
          streetViewControl: false,
          mapTypeControl: false,
        });

        mapRef.current = map;

        map.addListener('click', (event) => {
          if (disabledRef.current || !event.latLng || !onLocationChangeRef.current) return;
          onLocationChangeRef.current({ lat: event.latLng.lat(), lng: event.latLng.lng() });
        });

        if (location) {
          markerRef.current = new maps.Marker({
            map,
            position: location,
            title: 'Live Location',
          });
        }
      })
      .catch(() => {
        // Fallback gracefully to interactive canvas
      });

    return () => {
      cancelled = true;
      if (markerRef.current) markerRef.current.setMap(null);
      markerRef.current = null;
      mapRef.current = null;
    };
  }, [apiKey, location]);

  useEffect(() => {
    if (!location || !mapRef.current || !googleMapsWindow.google?.maps?.Marker) return;

    mapRef.current.setCenter(location);
    mapRef.current.setZoom(16);

    if (!markerRef.current) {
      markerRef.current = new googleMapsWindow.google.maps.Marker({
        map: mapRef.current,
        position: location,
        title: 'Live Location',
      });
    } else {
      markerRef.current.setPosition(location);
    }
  }, [location]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (disabled || !onLocationChange) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5; // -0.5 to 0.5
    const y = (e.clientY - rect.top) / rect.height - 0.5; // -0.5 to 0.5

    // Adjust lat/lng based on click offset and zoom
    const spread = 0.05 / Math.pow(2, zoomLevel - 12);
    const newLat = currentPoint.lat - y * spread;
    const newLng = currentPoint.lng + x * spread;

    onLocationChange({
      lat: Number(newLat.toFixed(6)),
      lng: Number(newLng.toFixed(6)),
    });
  };

  // If Google Maps API key is configured and active, render container for Google Maps
  if (apiKey) {
    return (
      <div style={{ borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '1px solid var(--color-neutral-200)', position: 'relative' }}>
        <div ref={mapElementRef} style={{ height: '22rem', width: '100%', backgroundColor: 'var(--color-neutral-100)' }} />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.65rem 0.85rem', fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-neutral-700)', backgroundColor: '#fff', borderTop: '1px solid var(--color-neutral-200)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <MapPin style={{ width: '0.9rem', height: '0.9rem', color: 'var(--color-primary-600)' }} />
            {location ? `${location.lat.toFixed(5)}, ${location.lng.toFixed(5)}` : 'Click anywhere on map to place pin'}
          </div>
          <span style={{ fontSize: '0.6875rem', color: 'var(--color-neutral-400)' }}>Google Maps Live</span>
        </div>
      </div>
    );
  }

  // Interactive Styled Map Canvas Fallback
  return (
    <div style={{ borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '1px solid var(--color-neutral-200)', position: 'relative', display: 'flex', flexDirection: 'column' }}>
      {/* Interactive Map Canvas Container */}
      <div
        onClick={handleCanvasClick}
        style={{
          position: 'relative',
          height: '22rem',
          width: '100%',
          backgroundColor: '#e5e7eb',
          backgroundImage: `
            radial-gradient(#94a3b8 1.5px, transparent 1.5px),
            linear-gradient(to right, rgba(148, 163, 184, 0.15) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(148, 163, 184, 0.15) 1px, transparent 1px)
          `,
          backgroundSize: '24px 24px, 48px 48px, 48px 48px',
          cursor: disabled ? 'not-allowed' : 'crosshair',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          userSelect: 'none',
        }}
      >
        {/* Decorative Grid Roads / Geographic Features */}
        <svg
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.35, pointerEvents: 'none' }}
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M0,60 Q150,120 300,80 T600,140 T900,100" fill="none" stroke="#60a5fa" strokeWidth="8" />
          <path d="M120,0 Q180,150 140,300 T220,500" fill="none" stroke="#fbbf24" strokeWidth="6" />
          <path d="M0,220 C200,200 400,260 700,210" fill="none" stroke="#cbd5e1" strokeWidth="12" />
          <path d="M350,0 C380,180 320,320 360,500" fill="none" stroke="#cbd5e1" strokeWidth="10" />
          <circle cx="50%" cy="50%" r="80" fill="rgba(34, 197, 94, 0.08)" stroke="rgba(34, 197, 94, 0.3)" strokeWidth="2" strokeDasharray="4 4" />
        </svg>

        {/* Center Live Pin */}
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -100%)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            pointerEvents: 'none',
            zIndex: 10,
            transition: 'transform 120ms ease-out',
          }}
        >
          <div
            style={{
              padding: '0.25rem 0.5rem',
              backgroundColor: 'var(--color-primary-800)',
              color: '#fff',
              fontSize: '0.6875rem',
              fontWeight: 700,
              borderRadius: '9999px',
              boxShadow: '0 4px 10px rgba(0,0,0,0.25)',
              marginBottom: '0.25rem',
              whiteSpace: 'nowrap',
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem',
            }}
          >
            <Navigation style={{ width: '0.65rem', height: '0.65rem', transform: 'rotate(45deg)' }} />
            {location ? `${location.lat.toFixed(5)}, ${location.lng.toFixed(5)}` : 'Tap to pin location'}
          </div>

          <div style={{ position: 'relative' }}>
            <MapPin style={{ width: '2.5rem', height: '2.5rem', color: '#dc2626', fill: '#ef4444', filter: 'drop-shadow(0 3px 6px rgba(0,0,0,0.3))' }} />
          </div>
          <div style={{ width: '0.75rem', height: '0.25rem', backgroundColor: 'rgba(0,0,0,0.25)', borderRadius: '9999px', marginTop: '-0.1rem', filter: 'blur(1px)' }} />
        </div>

        {/* Zoom Controls */}
        <div style={{ position: 'absolute', right: '0.75rem', bottom: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.25rem', zIndex: 20 }}>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setZoomLevel((z) => Math.min(18, z + 1));
            }}
            style={{ width: '2rem', height: '2rem', borderRadius: 'var(--radius-sm)', backgroundColor: '#fff', border: '1px solid var(--color-neutral-300)', boxShadow: '0 2px 5px rgba(0,0,0,0.1)', display: 'grid', placeItems: 'center', cursor: 'pointer' }}
          >
            <Plus style={{ width: '1rem', height: '1rem', color: 'var(--color-neutral-700)' }} />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setZoomLevel((z) => Math.max(10, z - 1));
            }}
            style={{ width: '2rem', height: '2rem', borderRadius: 'var(--radius-sm)', backgroundColor: '#fff', border: '1px solid var(--color-neutral-300)', boxShadow: '0 2px 5px rgba(0,0,0,0.1)', display: 'grid', placeItems: 'center', cursor: 'pointer' }}
          >
            <Minus style={{ width: '1rem', height: '1rem', color: 'var(--color-neutral-700)' }} />
          </button>
        </div>

        {/* Informational overlay badge */}
        <div style={{ position: 'absolute', top: '0.75rem', left: '0.75rem', padding: '0.35rem 0.65rem', borderRadius: 'var(--radius-md)', backgroundColor: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(4px)', border: '1px solid var(--color-neutral-200)', display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.6875rem', color: 'var(--color-neutral-600)', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
          <Info style={{ width: '0.8rem', height: '0.8rem', color: 'var(--color-primary-600)' }} />
          <span>Click anywhere to adjust coordinates</span>
        </div>
      </div>

      {/* Footer info bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.65rem 0.85rem', fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-neutral-700)', backgroundColor: '#fff', borderTop: '1px solid var(--color-neutral-200)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <MapPin style={{ width: '0.9rem', height: '0.9rem', color: 'var(--color-primary-600)' }} />
          {location
            ? `Pin selected at: ${location.lat.toFixed(5)}, ${location.lng.toFixed(5)}`
            : 'Interactive map ready. Click to place your item pin.'}
        </div>
        <span style={{ fontSize: '0.6875rem', color: 'var(--color-neutral-400)' }}>
          Zoom: {zoomLevel}x
        </span>
      </div>
    </div>
  );
}
