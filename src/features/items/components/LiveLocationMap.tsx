import { useEffect, useRef, useState } from 'react';
import { setOptions, importLibrary } from '@googlemaps/js-api-loader';
import { MapPin, CheckCircle2, Loader2, Navigation } from 'lucide-react';

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

const DEFAULT_COORDS = { lat: 16.3218, lng: 120.3644 }; // Agoo, La Union

export default function LiveLocationMap({ location, onLocationChange, disabled = false }: LiveLocationMapProps) {
  const mapElementRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const markerRef = useRef<google.maps.Marker | null>(null);
  const geocoderRef = useRef<google.maps.Geocoder | null>(null);
  const onChangeRef = useRef(onLocationChange);
  onChangeRef.current = onLocationChange;

  const [isResolving, setIsResolving] = useState(false);

  const initialLat = location?.lat ?? DEFAULT_COORDS.lat;
  const initialLng = location?.lng ?? DEFAULT_COORDS.lng;

  // Initialize Google Maps
  useEffect(() => {
    if (!mapElementRef.current || mapRef.current) return;

    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

    setOptions({
      key: apiKey,
      v: 'weekly',
      region: 'PH',
      language: 'en',
    });

    let isMounted = true;

    Promise.all([
      importLibrary('maps'),
      importLibrary('geocoding'),
      importLibrary('marker'),
    ])
      .then(([mapsLib, geocodingLib, markerLib]) => {
        if (!isMounted || !mapElementRef.current) return;

        const { Map } = mapsLib;
        const { Geocoder } = geocodingLib;
        const { Marker } = markerLib;

        const geocoder = new Geocoder();
        geocoderRef.current = geocoder;

        const map = new Map(mapElementRef.current, {
          center: { lat: initialLat, lng: initialLng },
          zoom: location ? 16 : 14,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
          zoomControl: true,
          clickableIcons: false,
        });

        // Marker for pin location
        const marker = new Marker({
          position: { lat: initialLat, lng: initialLng },
          map,
          draggable: !disabled,
          animation: google.maps.Animation.DROP,
          title: 'Selected Location',
        });

        const geocodePosition = (lat: number, lng: number) => {
          if (!geocoderRef.current) return;
          setIsResolving(true);

          geocoderRef.current.geocode(
            { location: { lat, lng } },
            (results, status) => {
              setIsResolving(false);
              if (String(status) === 'OK' && results && results[0]) {
                const components = results[0].address_components;

                let streetNumber = '';
                let route = '';
                let barangay = '';
                let municipality = '';
                let province = '';

                for (const c of components) {
                  const types = c.types;
                  if (types.includes('street_number')) streetNumber = c.long_name;
                  if (types.includes('route')) route = c.long_name;
                  if (
                    types.includes('sublocality_level_1') ||
                    types.includes('neighborhood') ||
                    types.includes('sublocality') ||
                    types.includes('administrative_area_level_5')
                  ) {
                    if (!barangay) barangay = c.long_name;
                  }
                  if (
                    types.includes('locality') ||
                    types.includes('administrative_area_level_2') ||
                    types.includes('administrative_area_level_3')
                  ) {
                    if (!municipality) municipality = c.long_name;
                  }
                  if (types.includes('administrative_area_level_1')) {
                    province = c.long_name;
                  }
                }

                // Fallback parsing from formatted address
                const addressParts = results[0].formatted_address.split(',').map((p: string) => p.trim());
                if (!barangay && addressParts.length > 2) {
                  barangay = addressParts[0];
                }
                if (!municipality && addressParts.length > 3) {
                  municipality = addressParts[1];
                }

                const street = [streetNumber, route].filter(Boolean).join(' ') || route || addressParts[0] || 'Main Street';

                const formattedBarangay = barangay
                  ? barangay.toLowerCase().startsWith('barangay') || barangay.toLowerCase().startsWith('brgy')
                    ? barangay
                    : `Barangay ${barangay}`
                  : 'Barangay Poblacion';

                const details: LocationDetails = {
                  lat,
                  lng,
                  street,
                  barangay: formattedBarangay,
                  municipality: municipality || 'Agoo',
                  province: province || 'La Union',
                  formattedAddress: results[0].formatted_address,
                };

                onChangeRef.current?.(details);
              }
            }
          );
        };

        map.addListener('click', (e: google.maps.MapMouseEvent) => {
          if (disabled || !e.latLng) return;
          const clickedLat = e.latLng.lat();
          const clickedLng = e.latLng.lng();
          marker.setPosition({ lat: clickedLat, lng: clickedLng });
          geocodePosition(clickedLat, clickedLng);
        });

        marker.addListener('dragend', () => {
          const pos = marker.getPosition();
          if (pos) {
            geocodePosition(pos.lat(), pos.lng());
          }
        });

        mapRef.current = map;
        markerRef.current = marker;
      })
      .catch((err: unknown) => {
        console.error('Google Maps failed to load:', err);
      });

    return () => {
      isMounted = false;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update marker position when location coords change externally
  useEffect(() => {
    if (!markerRef.current || !mapRef.current || !location?.lat || !location?.lng) return;
    const newPos = { lat: location.lat, lng: location.lng };
    markerRef.current.setPosition(newPos);
    mapRef.current.panTo(newPos);
  }, [location?.lat, location?.lng]);

  return (
    <div style={{ borderRadius: 'var(--radius-lg)', overflow: 'hidden', border: '1px solid var(--color-neutral-200)', position: 'relative', display: 'flex', flexDirection: 'column' }}>
      {/* Google Maps Container */}
      <div
        ref={mapElementRef}
        style={{
          height: '22rem',
          width: '100%',
          backgroundColor: '#e5e7eb',
        }}
      />

      {/* Floating guidance banner */}
      <div style={{
        position: 'absolute',
        top: '0.75rem',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 10,
        padding: '0.45rem 1rem',
        backgroundColor: 'rgba(255,255,255,0.95)',
        border: '1px solid var(--color-neutral-200)',
        borderRadius: '9999px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.15)',
        backdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'center',
        gap: '0.4rem',
        fontSize: '0.75rem',
        fontWeight: 600,
        color: 'var(--color-neutral-800)',
        pointerEvents: 'none',
      }}>
        <MapPin style={{ width: '0.875rem', height: '0.875rem', color: '#ea4335' }} />
        <span>Tap anywhere on Google Maps or drag the pin</span>
      </div>

      {/* Footer address info displaying Street, Barangay, and Municipality */}
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
              {isResolving ? 'Locating neighborhood with Google Maps…' : 'Selected Neighborhood Location'}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', flexShrink: 0 }}>
            <Navigation style={{ width: '0.75rem', height: '0.75rem', color: 'var(--color-primary-600)' }} />
            <span style={{ fontSize: '0.625rem', fontWeight: 800, color: 'var(--color-primary-700)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Google Maps</span>
          </div>
        </div>

        {isResolving ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', color: 'var(--color-neutral-500)', padding: '0.25rem 0' }}>
            <Loader2 style={{ width: '0.875rem', height: '0.875rem', animation: 'spin 0.8s linear infinite' }} />
            <span>Resolving accurate Street, Barangay, and Municipality…</span>
          </div>
        ) : location ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', marginTop: '0.25rem', backgroundColor: 'var(--color-neutral-50)', padding: '0.6rem 0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-neutral-200)' }}>
            <div>
              <span style={{ fontSize: '0.625rem', fontWeight: 800, color: 'var(--color-neutral-400)', textTransform: 'uppercase', display: 'block' }}>Street / Landmark</span>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-neutral-900)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block' }}>
                {location.street || 'Main Street'}
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
                {location.municipality || 'Agoo'}
              </span>
            </div>
          </div>
        ) : (
          <span style={{ fontSize: '0.75rem', color: 'var(--color-neutral-500)' }}>
            Click anywhere on the Google Map to set Street, Barangay, and Municipality.
          </span>
        )}
      </div>
    </div>
  );
}