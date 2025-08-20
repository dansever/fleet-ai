// hooks/use-country-map.ts
import { useEffect, useState } from 'react';

export type CountryMap = Record<string, string>;

export function useCountryMap() {
  const [map, setMap] = useState<CountryMap>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadCountries() {
      try {
        const resp = await fetch('/data/countries.csv'); // served from public
        const text = await resp.text();
        const lines = text.split(/\r?\n/).filter(Boolean);
        const result: CountryMap = {};
        for (const line of lines.slice(1)) {
          // skip header
          const [iso_2, name] = line.split(',');
          if (iso_2 && name) {
            result[iso_2.trim()] = name.trim();
          }
        }
        setMap(result);
      } finally {
        setIsLoading(false);
      }
    }
    loadCountries();
  }, []);

  return { map, isLoading };
}
