import { FuelTender } from '@/drizzle/types';
import { getFuelTendersByAirport } from '@/services/fuel/fuel-tender-client';
import { useCallback, useEffect, useState } from 'react';

interface UseFuelTendersOptions {
  airportId: string | null;
  enabled?: boolean;
  cacheKey?: string;
}

interface UseFuelTendersReturn {
  tenders: FuelTender[];
  selectedTender: FuelTender | null;
  loading: boolean;
  error: string | null;
  setSelectedTender: (tender: FuelTender | null) => void;
  refreshTenders: () => Promise<void>;
  updateTender: (updatedTender: FuelTender) => void;
  addTender: (newTender: FuelTender) => void;
  removeTender: (tenderId: string) => void;
}

// Simple in-memory cache
const tenderCache = new Map<string, { data: FuelTender[]; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export function useFuelTenders({
  airportId,
  enabled = true,
  cacheKey,
}: UseFuelTendersOptions): UseFuelTendersReturn {
  const [tenders, setTenders] = useState<FuelTender[]>([]);
  const [selectedTender, setSelectedTender] = useState<FuelTender | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isCacheValid = useCallback((key: string) => {
    const cached = tenderCache.get(key);
    if (!cached) return false;
    return Date.now() - cached.timestamp < CACHE_TTL;
  }, []);

  const loadTenders = useCallback(async () => {
    if (!airportId || !enabled) {
      setTenders([]);
      setSelectedTender(null);
      return;
    }

    const cacheKey = `tenders-${airportId}`;

    // Check cache first
    if (isCacheValid(cacheKey)) {
      const cached = tenderCache.get(cacheKey);
      if (cached) {
        setTenders(cached.data);
        setSelectedTender(cached.data.length > 0 ? cached.data[0] : null);
        return;
      }
    }

    setLoading(true);
    setError(null);

    try {
      const data = await getFuelTendersByAirport(airportId);
      setTenders(data);
      setSelectedTender(data.length > 0 ? data[0] : null);

      // Update cache
      tenderCache.set(cacheKey, { data, timestamp: Date.now() });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load fuel tenders');
      setTenders([]);
      setSelectedTender(null);
    } finally {
      setLoading(false);
    }
  }, [airportId, enabled, isCacheValid]);

  const refreshTenders = useCallback(async () => {
    if (!airportId) return;

    const cacheKey = `tenders-${airportId}`;
    tenderCache.delete(cacheKey); // Clear cache to force refresh
    await loadTenders();
  }, [airportId, loadTenders]);

  const updateTender = useCallback(
    (updatedTender: FuelTender) => {
      setTenders((prevTenders) =>
        prevTenders.map((tender) => (tender.id === updatedTender.id ? updatedTender : tender)),
      );

      if (selectedTender?.id === updatedTender.id) {
        setSelectedTender(updatedTender);
      }

      // Update cache
      if (airportId) {
        const cacheKey = `tenders-${airportId}`;
        const cached = tenderCache.get(cacheKey);
        if (cached) {
          tenderCache.set(cacheKey, {
            data: cached.data.map((tender) =>
              tender.id === updatedTender.id ? updatedTender : tender,
            ),
            timestamp: cached.timestamp,
          });
        }
      }
    },
    [selectedTender, airportId],
  );

  const addTender = useCallback(
    (newTender: FuelTender) => {
      setTenders((prevTenders) => [newTender, ...prevTenders]);

      // Update cache
      if (airportId) {
        const cacheKey = `tenders-${airportId}`;
        const cached = tenderCache.get(cacheKey);
        if (cached) {
          tenderCache.set(cacheKey, {
            data: [newTender, ...cached.data],
            timestamp: cached.timestamp,
          });
        }
      }
    },
    [airportId],
  );

  const removeTender = useCallback(
    (tenderId: string) => {
      setTenders((prevTenders) => prevTenders.filter((tender) => tender.id !== tenderId));

      if (selectedTender?.id === tenderId) {
        setSelectedTender(null);
      }

      // Update cache
      if (airportId) {
        const cacheKey = `tenders-${airportId}`;
        const cached = tenderCache.get(cacheKey);
        if (cached) {
          tenderCache.set(cacheKey, {
            data: cached.data.filter((tender) => tender.id !== tenderId),
            timestamp: cached.timestamp,
          });
        }
      }
    },
    [selectedTender, airportId],
  );

  useEffect(() => {
    loadTenders();
  }, [loadTenders]);

  return {
    tenders,
    selectedTender,
    loading,
    error,
    setSelectedTender,
    refreshTenders,
    updateTender,
    addTender,
    removeTender,
  };
}
