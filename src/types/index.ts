export type TierCode = 'SSS' | 'S' | 'A' | 'B' | 'C' | 'D' | 'F';

export interface NearestMajorCity {
  name: string;
  lat: number;
  lng: number;
  population: number;
  distance_km: number;
}

export interface City {
  name: string;
  name_ascii: string;
  lat: number;
  lng: number;
  country: string;
  iso2: string;
  iso3: string;
  admin: string;
  capital: string;
  population: number;
  weight: number;
  is_capital?: boolean;
  is_largest_city?: boolean;
  is_major_city?: boolean;
  city_rank?: number;
  nearest_major_city: NearestMajorCity | null;
  pro: string;
  con: string;
}

export interface Country {
  country: string;
  country_ko: string;
  iso2: string;
  iso3: string;
  continent: string;
  tier: string;
  tier_code: string;
  births: number;
  source_year: number;
  population: number;
  homicide: number;
  gini: number;
  gdp_capita: number;
  center: [number, number];
  city_count: number;
  pro: string;
  con: string;
  birth_share_pct: number;
  pop_share_pct: number;
}

export interface ReincarnationResultData {
  id: string;
  timestamp: number;
  country: Country;
  city: City;
  mode: 'birth' | 'population';
  calculatedDistanceKm: number | null;
  countryProbabilityPct: number;
  cityInCountryProbabilityPct: number;
  globalCityProbabilityPct: number;
}

export interface CountriesDataFile {
  metadata: {
    title: string;
    description: string;
    total_world_births: number;
    total_world_population: number;
    updated_at: string;
  };
  countries: Country[];
}
