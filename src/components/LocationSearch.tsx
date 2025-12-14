import { useState, useEffect, useRef } from 'react';
import { Search, MapPin, Loader2, Navigation } from 'lucide-react';
import { NominatimResult, LocationResult } from '../types/location';

export interface LocationSearchProps {
  value?: string;
  onSelected?: (record: NominatimResult) => void;
  lat?: number;
  lng?: number;
}

const DEBOUNCE_DELAY = 500;
// IMPORTANT: Nominatim requires a valid User-Agent identifying the application and contact.
const USER_AGENT = 'LocationSearch/1.0 (cairnswm@gmail.com)';

export default function LocationSearch({ value, onSelected, lat, lng }: LocationSearchProps = {}) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<LocationResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lon: number } | null>(null);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Prefill input when parent provides value
  useEffect(() => {
    if (typeof value === 'string' && value.trim().length > 0) setQuery(value);
  }, [value]);

  // Resolve user location: prefer browser geolocation, fall back to provided lat/lng
  useEffect(() => {
    let cancelled = false;
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          if (cancelled) return;
          setUserLocation({ lat: position.coords.latitude, lon: position.coords.longitude });
        },
        (error) => {
          if (cancelled) return;
          console.log('Geolocation not available or denied:', error);
          if (typeof lat === 'number' && typeof lng === 'number') {
            setUserLocation({ lat, lon: lng });
          }
        }
      );
    } else if (typeof lat === 'number' && typeof lng === 'number') {
      setUserLocation({ lat, lon: lng });
    }

    return () => {
      cancelled = true;
    };
  }, [lat, lng]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);

    if (query.trim().length < 2) {
      setResults([]);
      setShowResults(false);
      return;
    }

    setIsLoading(true);
    debounceTimer.current = setTimeout(() => fetchLocations(query), DEBOUNCE_DELAY);

    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, [query]);

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const fetchLocations = async (searchQuery: string) => {
    try {
      const params: Record<string, string> = {
        q: searchQuery,
        format: 'json',
        addressdetails: '1',
        featureType: 'settlement',
      };

      if (userLocation) {
        params.lat = userLocation.lat.toString();
        params.lon = userLocation.lon.toString();
      }

      const response = await fetch(`https://nominatim.openstreetmap.org/search?` + new URLSearchParams(params), {
        headers: {
          'Accept': 'application/json',
          'User-Agent': USER_AGENT,
        },
      });

      if (!response.ok) throw new Error('Failed to fetch locations');

      const data: NominatimResult[] = await response.json();
      const filtered = processResults(data);
      setResults(filtered);
      setShowResults(true);
    } catch (error) {
      console.error('Error fetching locations:', error);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const processResults = (data: NominatimResult[]): LocationResult[] => {
    const processed: LocationResult[] = [];
    const allowedTypes = ['city', 'town', 'suburb', 'village', 'hamlet', 'administrative'];
    const searchLower = query.toLowerCase().trim();

    const normalizeParent = (val?: string) => {
      if (!val) return undefined;
      const lower = val.toLowerCase();
      if (lower.includes('ward') || lower.includes('municipality') || lower.includes('metropolitan')) return undefined;
      return val;
    };

    for (const item of data) {
      const { address } = item;
      if (item.class === 'highway' || item.class === 'road') continue;
      if (!allowedTypes.includes(item.type)) continue;
      if (!address || !address.country) continue;

      const suburb = address.suburb;
      const city = address.city || address.town || address.village;
      const town = address.town;
      const village = address.village;
      const hamlet = address.hamlet;
      const getAddr = (k: string) => (address as Record<string, string | undefined>)[k];
      const county = getAddr('county');
      const state = getAddr('state');

      const matchesQuery = (field?: string) => field && field.toLowerCase().includes(searchLower);
      if (!(matchesQuery(suburb) || matchesQuery(city) || matchesQuery(town) || matchesQuery(village) || matchesQuery(hamlet))) continue;

      let displayText = '';
      if (item.type === 'suburb') {
        const parent = normalizeParent(city) || normalizeParent(town) || normalizeParent(county) || normalizeParent(state);
        displayText = [suburb || city, parent || city, address.country].filter(Boolean).join(', ');
      } else if (item.type === 'town') {
        displayText = [town || city || village, address.country].filter(Boolean).join(', ');
      } else if (item.type === 'village' || item.type === 'hamlet') {
        // include city if available
        const parentCity = normalizeParent(city) || normalizeParent(town) || normalizeParent(county);
        displayText = [village || hamlet || city, parentCity, address.country].filter(Boolean).join(', ');
      } else if (item.type === 'city') {
        displayText = [city || suburb || village, address.country].filter(Boolean).join(', ');
      } else {
        displayText = [city || suburb || village || hamlet, address.country].filter(Boolean).join(', ');
      }

      let resolvedType: 'city' | 'town' | 'suburb' | 'village' | 'hamlet' = 'city';
      const rawType = String(item.type);
      if (['city', 'town', 'suburb', 'village', 'hamlet'].includes(rawType)) {
        resolvedType = rawType as 'city' | 'town' | 'suburb' | 'village' | 'hamlet';
      }

      processed.push({ id: item.place_id, displayText, type: resolvedType, raw: item });
    }

    if (userLocation) {
      processed.sort((a, b) => {
        const distA = calculateDistance(userLocation.lat, userLocation.lon, parseFloat(a.raw.lat), parseFloat(a.raw.lon));
        const distB = calculateDistance(userLocation.lat, userLocation.lon, parseFloat(b.raw.lat), parseFloat(b.raw.lon));
        return distA - distB;
      });
    }

    return processed;
  };

  const handleSelect = (result: LocationResult) => {
    setQuery(result.displayText);
    setShowResults(false);
    if (onSelected) onSelected(result.raw);
  };

  return (
    <div className="w-100" ref={searchContainerRef}>
      <div className="position-relative">
        <div className="position-relative">
          <div style={{ position: 'absolute', inset: '0 auto 0 0', paddingLeft: 16, display: 'flex', alignItems: 'center', pointerEvents: 'none' }}>
            <Search className="text-muted" />
          </div>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => results.length > 0 && setShowResults(true)}
            placeholder="Search for cities, suburbs, towns, villages, or hamlets..."
            className="form-control form-control-lg ps-5 pe-4"
          />
          {isLoading && (
            <div style={{ position: 'absolute', inset: '0 0 0 auto', paddingRight: 16, display: 'flex', alignItems: 'center', pointerEvents: 'none' }}>
              <Loader2 className="text-primary" />
            </div>
          )}
        </div>

        {showResults && results.length > 0 && (
          <div className="position-absolute w-100 mt-2 bg-white border rounded-xl shadow overflow-auto" style={{ maxHeight: '24rem', zIndex: 1050 }}>
            {userLocation && (
              <div className="px-3 py-2 bg-light border-bottom d-flex align-items-center text-sm text-primary">
                <Navigation className="me-2" />
                <span className="fw-medium">Sorted by distance from you</span>
              </div>
            )}
            {results.map((result) => {
              const distance = userLocation
                ? calculateDistance(userLocation.lat, userLocation.lon, parseFloat(result.raw.lat), parseFloat(result.raw.lon))
                : null;

              return (
                <button key={result.id} onClick={() => handleSelect(result)} className="list-group-item list-group-item-action d-flex align-items-start">
                  <div className="me-3 mt-1 text-muted">
                    <MapPin />
                  </div>
                  <div className="flex-fill">
                    <div className="fw-medium text-dark">{result.displayText}</div>
                    <div className="mt-1 d-flex align-items-center gap-2 flex-wrap small text-muted">
                      <span className={`badge rounded-pill text-bg-light`}>{result.type.charAt(0).toUpperCase() + result.type.slice(1)}</span>
                      {distance !== null && (
                        <span>{distance < 1 ? `${Math.round(distance * 1000)}m away` : `${Math.round(distance)}km away`}</span>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {showResults && results.length === 0 && !isLoading && query.trim().length >= 2 && (
          <div className="position-absolute w-100 mt-2 bg-white border rounded-xl shadow p-4 text-center" style={{ zIndex: 1050 }}>
            <div className="text-muted mb-2">
              <Search className="fs-1" />
            </div>
            <p className="fw-medium">No locations found</p>
            <p className="text-muted small mt-1">Try searching for a different location</p>
          </div>
        )}
      </div>
    </div>
  );
}
