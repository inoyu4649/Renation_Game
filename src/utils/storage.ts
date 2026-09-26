import { ReincarnationResultData } from '../types';

const STORAGE_KEY = 'renation_history_v1';

export function getHistory(): ReincarnationResultData[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: ReincarnationResultData[] = JSON.parse(raw);

    // Auto-migrate & backfill probability values for older records
    return parsed.map((item) => {
      const countryProb =
        item.countryProbabilityPct ??
        (item.mode === 'birth'
          ? item.country.birth_share_pct
          : item.country.pop_share_pct) ??
        1.0;

      const cityPop = item.city?.population || item.city?.weight || 1000;
      const countryPop = item.country?.population || 50000000;
      
      const cityInCountryProb =
        item.cityInCountryProbabilityPct !== undefined
          ? item.cityInCountryProbabilityPct
          : Math.min(100, Math.max(0.001, Number(((cityPop / countryPop) * 100).toFixed(3))));

      const globalProb =
        item.globalCityProbabilityPct !== undefined
          ? item.globalCityProbabilityPct
          : Number(((countryProb * cityInCountryProb) / 100).toFixed(5));

      return {
        ...item,
        countryProbabilityPct: countryProb,
        cityInCountryProbabilityPct: cityInCountryProb,
        globalCityProbabilityPct: globalProb,
      };
    });
  } catch (e) {
    console.error('Failed to load history from localStorage:', e);
    return [];
  }
}

export function saveHistory(record: ReincarnationResultData): ReincarnationResultData[] {
  try {
    const current = getHistory();
    const updated = [record, ...current].slice(0, 100); // Keep last 100 records
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch (e) {
    console.error('Failed to save record to localStorage:', e);
    return [];
  }
}

export function clearHistory(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.error('Failed to clear history from localStorage:', e);
  }
}
