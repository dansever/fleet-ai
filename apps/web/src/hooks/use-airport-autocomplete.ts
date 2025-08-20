import { AirportDatasetItem } from '@/features/airports/types/AirportDataset';
import { useEffect, useState } from 'react';
import useDebounce from '../lib/hooks/use-debounce';

interface UseAirportAutocompleteProps {
  query: string;
  enabled?: boolean;
  limit?: number;
}

interface UseAirportAutocompleteReturn {
  suggestions: AirportDatasetItem[];
  isLoading: boolean;
  error: string | null;
}

export function useAirportAutocomplete({
  query,
  enabled = true,
  limit = 20,
}: UseAirportAutocompleteProps): UseAirportAutocompleteReturn {
  const [suggestions, setSuggestions] = useState<AirportDatasetItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const debouncedQuery = useDebounce(query, 300);

  useEffect(() => {
    const canSearch = enabled && debouncedQuery && debouncedQuery.length >= 2;

    if (!canSearch) {
      setSuggestions([]);
      setIsLoading(false);
      return;
    }

    let aborted = false;

    const fetchSuggestions = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const resp = await fetch(
          `/api/airports?dataset=true&q=${encodeURIComponent(debouncedQuery)}&limit=${limit}`,
        );
        if (!resp.ok) throw new Error('Failed to fetch airport suggestions');
        const data: AirportDatasetItem[] = await resp.json();
        if (!aborted) setSuggestions(data);
      } catch (err) {
        if (!aborted) {
          setError(err instanceof Error ? err.message : 'An error occurred');
          setSuggestions([]);
        }
      } finally {
        if (!aborted) setIsLoading(false);
      }
    };

    fetchSuggestions();
    return () => {
      aborted = true;
    };
  }, [debouncedQuery, enabled, limit]);

  return { suggestions, isLoading, error };
}
