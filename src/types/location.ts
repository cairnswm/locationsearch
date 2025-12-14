export interface NominatimResult {
  place_id: number;
  display_name: string;
  type: string;
  class: string;
  address: {
    city?: string;
    town?: string;
    suburb?: string;
    village?: string;
    hamlet?: string;
    country?: string;
    country_code?: string;
  };
  lat: string;
  lon: string;
}

export interface LocationResult {
  id: number;
  displayText: string;
  type: 'city' | 'town' | 'suburb' | 'village' | 'hamlet';
  raw: NominatimResult;
}
