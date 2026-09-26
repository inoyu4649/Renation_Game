import { City, CountriesDataFile, Country, ReincarnationResultData } from '../types';
import { calculateHaversineDistance } from './haversine';

let cachedCountriesData: CountriesDataFile | null = null;
const cachedCitiesMap = new Map<string, City[]>();

function getBasePath(): string {
  const raw = import.meta.env.BASE_URL || './';
  return raw.endsWith('/') ? raw : `${raw}/`;
}

/**
 * Load countries metadata and statistics
 */
export async function loadCountriesData(): Promise<CountriesDataFile> {
  if (cachedCountriesData) {
    return cachedCountriesData;
  }
  const basePath = getBasePath();
  const response = await fetch(`${basePath}data/countries.json`);
  if (!response.ok) {
    throw new Error(`Failed to load countries data: ${response.statusText}`);
  }
  cachedCountriesData = await response.json();
  return cachedCountriesData!;
}

/**
 * Load city list for a specific country by ISO2 code
 */
export async function loadCountryCities(iso2: string): Promise<City[]> {
  if (cachedCitiesMap.has(iso2)) {
    return cachedCitiesMap.get(iso2)!;
  }
  const basePath = getBasePath();
  const response = await fetch(`${basePath}data/cities/${iso2}.json`);
  if (!response.ok) {
    throw new Error(`Failed to load cities for country ${iso2}: ${response.statusText}`);
  }
  const data = await response.json();
  const cities: City[] = data.cities || [];
  cachedCitiesMap.set(iso2, cities);
  return cities;
}

/**
 * Weighted random picker
 */
function weightedRandomChoice<T>(items: T[], weights: number[]): T {
  const totalWeight = weights.reduce((sum, w) => sum + Math.max(0, w), 0);
  let threshold = Math.random() * totalWeight;

  for (let i = 0; i < items.length; i++) {
    const weight = Math.max(0, weights[i]);
    if (threshold < weight) {
      return items[i];
    }
    threshold -= weight;
  }
  return items[items.length - 1];
}

/**
 * Execute reincarnation simulation
 */
export async function performReincarnation(
  mode: 'birth' | 'population' = 'birth'
): Promise<ReincarnationResultData> {
  const data = await loadCountriesData();
  const countries = data.countries;

  // 1. Pick country based on weighted criteria
  const weights = countries.map((c) => (mode === 'birth' ? c.births : c.population));
  const selectedCountry: Country = weightedRandomChoice(countries, weights);

  // 2. Load cities for selected country
  const cities = await loadCountryCities(selectedCountry.iso2);
  let selectedCity: City;
  let cityInCountryProbabilityPct = 100.0;

  if (cities && cities.length > 0) {
    const cityWeights = cities.map((c) => Math.max(c.weight || c.population || 500, 100));
    const totalCityWeight = cityWeights.reduce((sum, w) => sum + w, 0);
    
    selectedCity = weightedRandomChoice(cities, cityWeights);
    const selectedCityWeight = Math.max(selectedCity.weight || selectedCity.population || 500, 100);
    cityInCountryProbabilityPct = (selectedCityWeight / totalCityWeight) * 100;
  } else {
    // Fallback if no cities in country file
    selectedCity = {
      name: selectedCountry.country,
      name_ascii: selectedCountry.country,
      lat: selectedCountry.center[0],
      lng: selectedCountry.center[1],
      country: selectedCountry.country,
      iso2: selectedCountry.iso2,
      iso3: selectedCountry.iso3,
      admin: selectedCountry.country,
      capital: 'primary',
      population: selectedCountry.population,
      weight: selectedCountry.population,
      is_major_city: true,
      nearest_major_city: null,
      pro: selectedCountry.pro,
      con: selectedCountry.con,
    };
  }

  // Calculate Haversine distance if nearest_major_city exists
  let calculatedDist: number | null = null;
  if (selectedCity.nearest_major_city) {
    calculatedDist = calculateHaversineDistance(
      selectedCity.lat,
      selectedCity.lng,
      selectedCity.nearest_major_city.lat,
      selectedCity.nearest_major_city.lng
    );
  }

  const countryProbabilityPct =
    mode === 'birth' ? selectedCountry.birth_share_pct : selectedCountry.pop_share_pct;

  const globalCityProbabilityPct = (countryProbabilityPct * cityInCountryProbabilityPct) / 100;

  return {
    id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    timestamp: Date.now(),
    country: selectedCountry,
    city: selectedCity,
    mode,
    calculatedDistanceKm: calculatedDist,
    countryProbabilityPct: Number(countryProbabilityPct.toFixed(4)),
    cityInCountryProbabilityPct: Number(cityInCountryProbabilityPct.toFixed(3)),
    globalCityProbabilityPct: Number(globalCityProbabilityPct.toFixed(5)),
  };
}
