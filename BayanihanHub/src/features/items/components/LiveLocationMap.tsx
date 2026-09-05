import { useEffect, useRef, useState, useCallback } from 'react';
import * as maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { MapPin, CheckCircle2, Loader2, Navigation, Search } from 'lucide-react';

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

export const LA_UNION_TOWNS: Array<{ name: string; lat: number; lng: number; zip?: string }> = [
  { name: 'Agoo', lat: 16.3224, lng: 120.3670, zip: '2504' },
  { name: 'Aringay', lat: 16.3983, lng: 120.3556, zip: '2503' },
  { name: 'Bacnotan', lat: 16.7194, lng: 120.3528, zip: '2516' },
  { name: 'Bagulin', lat: 16.6000, lng: 120.4500, zip: '2512' },
  { name: 'Balaoan', lat: 16.8222, lng: 120.4000, zip: '2518' },
  { name: 'Bangar', lat: 16.8944, lng: 120.4250, zip: '2520' },
  { name: 'Bauang', lat: 16.5333, lng: 120.3333, zip: '2501' },
  { name: 'Burgos', lat: 16.5167, lng: 120.4500, zip: '2511' },
  { name: 'Caba', lat: 16.4439, lng: 120.3444, zip: '2502' },
  { name: 'Luna', lat: 16.8556, lng: 120.3750, zip: '2519' },
  { name: 'Naguilian', lat: 16.5333, lng: 120.4000, zip: '2510' },
  { name: 'Pugo', lat: 16.3167, lng: 120.4667, zip: '2508' },
  { name: 'Rosario', lat: 16.2289, lng: 120.4878, zip: '2506' },
  { name: 'San Fernando', lat: 16.6159, lng: 120.3167, zip: '2500' },
  { name: 'San Gabriel', lat: 16.6833, lng: 120.4167, zip: '2513' },
  { name: 'San Juan', lat: 16.6749, lng: 120.3392, zip: '2515' },
  { name: 'Santo Tomas', lat: 16.2861, lng: 120.3844, zip: '2505' },
  { name: 'Santol', lat: 16.7667, lng: 120.4500, zip: '2514' },
  { name: 'Sudipen', lat: 16.9000, lng: 120.4667, zip: '2521' },
  { name: 'Tubao', lat: 16.3500, lng: 120.4167, zip: '2507' },
];

const DEFAULT_COORDS = { lat: 16.3224, lng: 120.3670 }; // Agoo, La Union

export function findNearestMunicipality(lat: number, lng: number, postcode?: string): string {
  if (postcode) {
    const byZip = LA_UNION_TOWNS.find((t) => t.zip === postcode);
    if (byZip) return byZip.name;
  }
  let closest = LA_UNION_TOWNS[0];
  let minDistance = Infinity;
  for (const t of LA_UNION_TOWNS) {
    const d = Math.hypot(t.lat - lat, t.lng - lng);
    if (d < minDistance) {
      minDistance = d;
      closest = t;
    }
  }
  return closest.name;
}

interface NominatimSearchResult {
  display_name: string;
  lat: string;
  lon: string;
  address?: {
    house_number?: string;
    road?: string;
    street?: string;
    pedestrian?: string;
    highway?: string;
    residential?: string;
    building?: string;
    neighbourhood?: string;
    suburb?: string;
    village?: string;
    quarter?: string;
    hamlet?: string;
    city?: string;
    town?: string;
    municipality?: string;
    county?: string;
    state?: string;
    postcode?: string;
  };
}

export async function reverseGeocodeLocation(lat: number, lng: number): Promise<LocationDetails> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1`,
      {
        headers: {
          'Accept-Language': 'en',
        },
      }
    );

    if (!res.ok) throw new Error('Geocoding request failed');

    const data = await res.json();
    const a = data.address || {};

    // 1. Determine Municipality
    let municipality = a.town || a.city || a.municipality || a.county || '';
    if (!municipality || municipality.toLowerCase().includes('la union')) {
      municipality = findNearestMunicipality(lat, lng, a.postcode);
    }

    // 2. Determine Barangay
    let rawBarangay =
      a.village ||
      a.quarter ||
      a.neighbourhood ||
      a.suburb ||
      a.hamlet ||
      '';

    if (!rawBarangay && data.display_name) {
      const parts = data.display_name.split(',').map((s: string) => s.trim());
      for (const p of parts) {
        if (p.toLowerCase() !== municipality.toLowerCase() && !p.toLowerCase().includes('la union') && !p.toLowerCase().includes('philippines')) {
          rawBarangay = p;
          break;
        }
      }
    }

    const barangay = rawBarangay
      ? rawBarangay.toLowerCase().startsWith('barangay') || rawBarangay.toLowerCase().startsWith('brgy')
        ? rawBarangay
        : `Barangay ${rawBarangay}`
      : 'Barangay Poblacion';

    // 3. Determine Street / Landmark
    const streetParts = [
      a.house_number,
      a.road || a.street || a.pedestrian || a.highway || a.residential || a.building,
    ].filter(Boolean);

    const street =
      streetParts.join(' ') ||
      (a.quarter && a.quarter !== a.village ? a.quarter : '') ||
      'Main Street';

    const province = a.state || 'La Union';
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
  } catch (err) {
    console.error('Reverse geocode error:', err);
    const municipality = findNearestMunicipality(lat, lng);
    return {
      lat,
      lng,
      street: 'Main Street',
      barangay: 'Barangay Poblacion',
      municipality,
      province: 'La Union',
      formattedAddress: `Main Street, Barangay Poblacion, ${municipality}, La Union`,
    };
  }
}

export default function LiveLocationMap({ location, onLocationChange, disabled = false }: LiveLocationMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markerRef = useRef<maplibregl.Marker | null>(null);
  const onChangeRef = useRef(onLocationChange);
  onChangeRef.current = onLocationChange;

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<NominatimSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isResolving, setIsResolving] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const initialLat = location?.lat ?? DEFAULT_COORDS.lat;
  const initialLng = location?.lng ?? DEFAULT_COORDS.lng;

  // Initialize MapLibre Map (mapcn component)
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    // Custom shadcn-styled animated marker element
    const el = document.createElement('div');
    el.className = 'mapcn-marker';
    el.style.width = '42px';
    el.style.height = '42px';
    el.style.position = 'relative';
    el.style.display = 'flex';
    el.style.alignItems = 'center';
    el.style.justifyContent = 'center';
    el.style.cursor = disabled ? 'default' : 'grab';

    el.innerHTML = `
      <div style="
        position:absolute;
        width:42px;height:42px;
        border-radius:50%;
        background:rgba(239,68,68,0.22);
        animation:liveMapPulse 1.8s ease-out infinite;
      "></div>
      <div style="
        position:absolute;
        width:26px;height:26px;
        border-radius:50%;
        background:rgba(239,68,68,0.38);
        animation:liveMapPulse 1.8s ease-out infinite 0.35s;
      "></div>
      <div style="
        width:16px;height:16px;
        border-radius:50%;
        background:#ef4444;
        border:2.5px solid #fff;
        box-shadow:0 3px 12px rgba(0,0,0,0.4);
        position:relative;z-index:2;
      "></div>
    `;

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: {
        version: 8,
        sources: {
          'osm-tiles': {
            type: 'raster',
            tiles: [
              'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
            ],
            tileSize: 256,
            attribution: '© OpenStreetMap contributors | mapcn',
          },
        },
        layers: [
          {
            id: 'osm-tiles-layer',
            type: 'raster',
            source: 'osm-tiles',
            minzoom: 0,
            maxzoom: 19,
          },
        ],
      },
      center: [initialLng, initialLat],
      zoom: location ? 15 : 13.5,
    });

    // Add navigation controls (Zoom in, Zoom out, Compass)
    map.addControl(new maplibregl.NavigationControl({ showCompass: true }), 'top-right');

    // Create draggable marker
    const marker = new maplibregl.Marker({
      element: el,
      draggable: !disabled,
    })
      .setLngLat([initialLng, initialLat])
      .addTo(map);

    const handleCoordsUpdate = async (lat: number, lng: number) => {
      setIsResolving(true);
      const details = await reverseGeocodeLocation(lat, lng);
      setIsResolving(false);
      onChangeRef.current?.(details);
    };

    marker.on('dragend', () => {
      const pos = marker.getLngLat();
      handleCoordsUpdate(pos.lat, pos.lng);
    });

    map.on('click', (e: maplibregl.MapMouseEvent) => {
      if (disabled) return;
      const { lng, lat } = e.lngLat;
      marker.setLngLat([lng, lat]);
      handleCoordsUpdate(lat, lng);
    });

    mapRef.current = map;
    markerRef.current = marker;

    return () => {
      map.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update marker position when coords change externally
  useEffect(() => {
    if (!markerRef.current || !mapRef.current || !location?.lat || !location?.lng) return;
    markerRef.current.setLngLat([location.lng, location.lat]);
  }, [location?.lat, location?.lng]);

  const handleSearch = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }
    setIsSearching(true);
    setShowDropdown(true);

    try {
      const q = query.includes('La Union') || query.includes('Philippines') ? query : `${query}, La Union, Philippines`;
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&addressdetails=1&limit=5`,
        { headers: { 'Accept-Language': 'en' } }
      );
      const data: NominatimSearchResult[] = await res.json();
      setSearchResults(data);
    } catch (err) {
      console.error('Search failed:', err);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  const handleSelectResult = async (item: NominatimSearchResult) => {
    const lat = parseFloat(item.lat);
    const lng = parseFloat(item.lon);

    if (mapRef.current && markerRef.current) {
      mapRef.current.flyTo({ center: [lng, lat], zoom: 15.5, essential: true });
      markerRef.current.setLngLat([lng, lat]);
    }

    setShowDropdown(false);
    setSearchQuery('');
    setIsResolving(true);

    const details = await reverseGeocodeLocation(lat, lng);
    setIsResolving(false);
    onChangeRef.current?.(details);
  };

  const handleTownChipClick = (town: { name: string; lat: number; lng: number }) => {
    if (mapRef.current && markerRef.current) {
      mapRef.current.flyTo({ center: [town.lng, town.lat], zoom: 14.5, essential: true });
      markerRef.current.setLngLat([town.lng, town.lat]);
    }

    setIsResolving(true);
    reverseGeocodeLocation(town.lat, town.lng).then((details) => {
      setIsResolving(false);
      onChangeRef.current?.({
        ...details,
        municipality: town.name,
      });
    });
  };

  return (
    <>
      <style>{`
        @keyframes liveMapPulse {
          0% { transform: scale(0.6); opacity: 0.9; }
          100% { transform: scale(2.2); opacity: 0; }
        }
        .maplibregl-ctrl-attrib {
          font-size: 10px !important;
          opacity: 0.85;
        }
      `}</style>

      <div style={{ borderRadius: 'var(--radius-lg)', overflow: 'hidden', border: '1px solid var(--color-neutral-200)', position: 'relative', display: 'flex', flexDirection: 'column' }}>
        {/* Search Bar & Town Chips (mapcn header) */}
        <div style={{
          position: 'relative',
          padding: '0.65rem 0.85rem',
          backgroundColor: '#ffffff',
          borderBottom: '1px solid var(--color-neutral-200)',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem',
          zIndex: 1000,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <Search style={{ width: '0.875rem', height: '0.875rem', color: 'var(--color-neutral-400)', position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  handleSearch(e.target.value);
                }}
                onFocus={() => {
                  if (searchQuery) setShowDropdown(true);
                }}
                placeholder="Search municipality, barangay, or street (e.g. Agoo, San Nicolas, San Juan)..."
                style={{
                  width: '100%',
                  padding: '0.5rem 0.75rem 0.5rem 2.2rem',
                  fontSize: '0.78rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--color-neutral-300)',
                  outline: 'none',
                  backgroundColor: 'var(--color-neutral-50)',
                }}
              />
              {isSearching && (
                <Loader2 style={{ width: '0.875rem', height: '0.875rem', color: 'var(--color-primary-600)', animation: 'spin 0.8s linear infinite', position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)' }} />
              )}
            </div>
          </div>

          {/* Quick Town Selection Badges */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', overflowX: 'auto', paddingBottom: '0.15rem' }}>
            <span style={{ fontSize: '0.625rem', fontWeight: 800, color: 'var(--color-neutral-400)', textTransform: 'uppercase', flexShrink: 0 }}>
              Towns:
            </span>
            {LA_UNION_TOWNS.map((town) => {
              const isSelected = location?.municipality?.toLowerCase() === town.name.toLowerCase();
              return (
                <button
                  key={town.name}
                  type="button"
                  onClick={() => handleTownChipClick(town)}
                  style={{
                    padding: '0.2rem 0.55rem',
                    borderRadius: '9999px',
                    fontSize: '0.6875rem',
                    fontWeight: isSelected ? 800 : 600,
                    backgroundColor: isSelected ? 'var(--color-primary-600)' : 'var(--color-neutral-100)',
                    color: isSelected ? '#ffffff' : 'var(--color-neutral-700)',
                    border: '1px solid ' + (isSelected ? 'var(--color-primary-600)' : 'var(--color-neutral-200)'),
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    flexShrink: 0,
                    transition: 'all 120ms',
                  }}
                >
                  {town.name}
                </button>
              );
            })}
          </div>

          {/* Search Autocomplete Dropdown */}
          {showDropdown && searchResults.length > 0 && (
            <div style={{
              position: 'absolute',
              top: '100%',
              left: '0.85rem',
              right: '0.85rem',
              marginTop: '0.25rem',
              backgroundColor: '#ffffff',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-neutral-300)',
              boxShadow: '0 8px 24px rgba(0,0,0,0.18)',
              maxHeight: '14rem',
              overflowY: 'auto',
              zIndex: 2000,
            }}>
              {searchResults.map((res, i) => (
                <div
                  key={i}
                  onClick={() => handleSelectResult(res)}
                  style={{
                    padding: '0.6rem 0.85rem',
                    borderBottom: i === searchResults.length - 1 ? 'none' : '1px solid var(--color-neutral-100)',
                    cursor: 'pointer',
                    fontSize: '0.75rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    transition: 'background-color 100ms',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--color-primary-50)')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  <MapPin style={{ width: '0.875rem', height: '0.875rem', color: 'var(--color-primary-600)', flexShrink: 0 }} />
                  <span style={{ color: 'var(--color-neutral-800)', fontWeight: 600 }}>{res.display_name}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* MapLibre Container */}
        <div ref={mapContainerRef} style={{ height: '20rem', width: '100%', backgroundColor: '#e5e7eb' }} />

        {/* Floating guidance banner */}
        <div style={{
          position: 'absolute',
          top: '4.75rem',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 800,
          padding: '0.4rem 0.85rem',
          backgroundColor: 'rgba(255,255,255,0.95)',
          border: '1px solid var(--color-neutral-200)',
          borderRadius: '9999px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.12)',
          backdropFilter: 'blur(6px)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.4rem',
          fontSize: '0.72rem',
          fontWeight: 600,
          color: 'var(--color-neutral-800)',
          pointerEvents: 'none',
        }}>
          <MapPin style={{ width: '0.8rem', height: '0.8rem', color: '#ef4444' }} />
          <span>Tap anywhere on the map or drag the pin</span>
        </div>

        {/* Read-only Location Summary Badges */}
        <div style={{
          padding: '0.85rem 1rem',
          backgroundColor: '#ffffff',
          borderTop: '1px solid var(--color-neutral-200)',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <CheckCircle2 style={{ width: '1.1rem', height: '1.1rem', color: '#16a34a', flexShrink: 0 }} />
              <span style={{ fontSize: '0.8125rem', fontWeight: 800, color: 'var(--color-neutral-900)' }}>
                {isResolving ? 'Resolving neighborhood from map…' : 'Selected Location (Auto-detected from Map)'}
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', flexShrink: 0 }}>
              <Navigation style={{ width: '0.75rem', height: '0.75rem', color: 'var(--color-primary-600)' }} />
              <span style={{ fontSize: '0.625rem', fontWeight: 800, color: 'var(--color-primary-700)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>mapcn</span>
            </div>
          </div>

          {isResolving ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', color: 'var(--color-neutral-500)', padding: '0.25rem 0' }}>
              <Loader2 style={{ width: '0.875rem', height: '0.875rem', animation: 'spin 0.8s linear infinite' }} />
              <span>Locating accurate Street, Barangay, and Municipality…</span>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', marginTop: '0.25rem' }}>
              <div style={{ backgroundColor: 'var(--color-neutral-50)', padding: '0.55rem 0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-neutral-200)' }}>
                <span style={{ fontSize: '0.625rem', fontWeight: 800, color: 'var(--color-neutral-400)', textTransform: 'uppercase', display: 'block' }}>
                  Street / Landmark
                </span>
                <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--color-neutral-900)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block', marginTop: '0.15rem' }}>
                  {location?.street || 'Main Street'}
                </span>
              </div>
              <div style={{ backgroundColor: 'var(--color-neutral-50)', padding: '0.55rem 0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-neutral-200)' }}>
                <span style={{ fontSize: '0.625rem', fontWeight: 800, color: 'var(--color-neutral-400)', textTransform: 'uppercase', display: 'block' }}>
                  Barangay
                </span>
                <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--color-neutral-900)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block', marginTop: '0.15rem' }}>
                  {location?.barangay || 'Poblacion'}
                </span>
              </div>
              <div style={{ backgroundColor: 'var(--color-neutral-50)', padding: '0.55rem 0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-neutral-200)' }}>
                <span style={{ fontSize: '0.625rem', fontWeight: 800, color: 'var(--color-neutral-400)', textTransform: 'uppercase', display: 'block' }}>
                  Municipality / City
                </span>
                <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--color-neutral-900)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block', marginTop: '0.15rem' }}>
                  {location?.municipality || 'Agoo'}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}