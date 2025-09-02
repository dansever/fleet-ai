import { FuelTender } from '@/drizzle/types';
import { getFuelTendersByAirport } from '@/services/fuel/fuel-tender-client';
import { useCallback, useEffect, useState } from 'react';
import { cacheManager, createCacheKey } from '../utils/cacheManager';

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
    return cacheManager.get(key, CACHE_TTL) !== null;
  }, []);

  const loadTenders = useCallback(async () => {
    if (!airportId || !enabled) {
      setTenders([]);
      setSelectedTender(null);
      return;
    }

    const cacheKey = createCacheKey('tenders', airportId);

    // Check cache first
    const cachedData = cacheManager.get<FuelTender[]>(cacheKey, CACHE_TTL);
    if (cachedData) {
      setTenders(cachedData);
      setSelectedTender(cachedData.length > 0 ? cachedData[0] : null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await getFuelTendersByAirport(airportId);
      setTenders(data);
      setSelectedTender(data.length > 0 ? data[0] : null);

      // Update cache
      cacheManager.set(cacheKey, data, CACHE_TTL);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load fuel tenders');
      setTenders([]);
      setSelectedTender(null);
    } finally {
      setLoading(false);
    }
  }, [airportId, enabled]);

  // Clear data immediately when airportId changes
  useEffect(() => {
    if (!airportId || !enabled) {
      setTenders([]);
      setSelectedTender(null);
      setError(null);
      return;
    }

    // Clear current data immediately to prevent showing stale data
    setTenders([]);
    setSelectedTender(null);
    setError(null);
  }, [airportId, enabled]);

  const refreshTenders = useCallback(async () => {
    if (!airportId) return;

    const cacheKey = createCacheKey('tenders', airportId);
    cacheManager.delete(cacheKey); // Clear cache to force refresh
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
        const cacheKey = createCacheKey('tenders', airportId);
        const cachedData = cacheManager.get<FuelTender[]>(cacheKey, CACHE_TTL);
        if (cachedData) {
          const updatedData = cachedData.map((tender) =>
            tender.id === updatedTender.id ? updatedTender : tender,
          );
          cacheManager.set(cacheKey, updatedData, CACHE_TTL);
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
        const cacheKey = createCacheKey('tenders', airportId);
        const cachedData = cacheManager.get<FuelTender[]>(cacheKey, CACHE_TTL);
        if (cachedData) {
          cacheManager.set(cacheKey, [newTender, ...cachedData], CACHE_TTL);
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
        const cacheKey = createCacheKey('tenders', airportId);
        const cachedData = cacheManager.get<FuelTender[]>(cacheKey, CACHE_TTL);
        if (cachedData) {
          const filteredData = cachedData.filter((tender) => tender.id !== tenderId);
          cacheManager.set(cacheKey, filteredData, CACHE_TTL);
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
