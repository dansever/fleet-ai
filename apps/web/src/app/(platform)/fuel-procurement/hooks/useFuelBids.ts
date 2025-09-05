import { FuelBid } from '@/drizzle/types';
import { client as fuelBidClient } from '@/modules/fuel-mgmt/bids';
import { useCallback, useEffect, useState } from 'react';
import { cacheManager, createCacheKey } from '../utils/cacheManager';

interface UseFuelBidsOptions {
  tenderId: string | null;
  enabled?: boolean;
}

interface UseFuelBidsReturn {
  fuelBids: FuelBid[];
  loading: boolean;
  error: string | null;
  refreshFuelBids: () => Promise<void>;
  updateFuelBid: (updatedFuelBid: FuelBid) => void;
  addFuelBid: (newFuelBid: FuelBid) => void;
  removeFuelBid: (fuelBidId: string) => void;
}

const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export function useFuelBids({ tenderId, enabled = true }: UseFuelBidsOptions): UseFuelBidsReturn {
  const [fuelBids, setFuelBids] = useState<FuelBid[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isCacheValid = useCallback((key: string) => {
    return cacheManager.get(key, CACHE_TTL) !== null;
  }, []);

  const loadFuelBids = useCallback(async () => {
    if (!tenderId || !enabled) {
      setFuelBids([]);
      return;
    }

    const cacheKey = createCacheKey('fuelBids', tenderId);

    // Check cache first
    const cachedData = cacheManager.get<FuelBid[]>(cacheKey, CACHE_TTL);
    if (cachedData) {
      setFuelBids(cachedData);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await fuelBidClient.listFuelBidsByTender(tenderId);
      setFuelBids(data);

      // Update cache
      cacheManager.set(cacheKey, data, CACHE_TTL);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load fuel bids');
      setFuelBids([]);
    } finally {
      setLoading(false);
    }
  }, [tenderId, enabled]);

  // Clear data immediately when tenderId changes
  useEffect(() => {
    if (!tenderId || !enabled) {
      setFuelBids([]);
      setError(null);
      return;
    }

    // Clear current data immediately to prevent showing stale data
    setFuelBids([]);
    setError(null);
  }, [tenderId, enabled]);

  const refreshFuelBids = useCallback(async () => {
    if (!tenderId) return;

    const cacheKey = createCacheKey('fuelBids', tenderId);
    cacheManager.delete(cacheKey); // Clear cache to force refresh
    await loadFuelBids();
  }, [tenderId, loadFuelBids]);

  const updateFuelBid = useCallback(
    (updatedFuelBid: FuelBid) => {
      setFuelBids((prevFuelBids) =>
        prevFuelBids.map((fuelBid) =>
          fuelBid.id === updatedFuelBid.id ? updatedFuelBid : fuelBid,
        ),
      );

      // Update cache
      if (tenderId) {
        const cacheKey = createCacheKey('fuelBids', tenderId);
        const cachedData = cacheManager.get<FuelBid[]>(cacheKey, CACHE_TTL);
        if (cachedData) {
          const updatedData = cachedData.map((fuelBid) =>
            fuelBid.id === updatedFuelBid.id ? updatedFuelBid : fuelBid,
          );
          cacheManager.set(cacheKey, updatedData, CACHE_TTL);
        }
      }
    },
    [tenderId],
  );

  const addFuelBid = useCallback(
    (newFuelBid: FuelBid) => {
      setFuelBids((prevFuelBids) => [newFuelBid, ...prevFuelBids]);

      // Update cache
      if (tenderId) {
        const cacheKey = createCacheKey('fuelBids', tenderId);
        const cachedData = cacheManager.get<FuelBid[]>(cacheKey, CACHE_TTL);
        if (cachedData) {
          cacheManager.set(cacheKey, [newFuelBid, ...cachedData], CACHE_TTL);
        }
      }
    },
    [tenderId],
  );

  const removeFuelBid = useCallback(
    (fuelBidId: string) => {
      setFuelBids((prevFuelBids) => prevFuelBids.filter((fuelBid) => fuelBid.id !== fuelBidId));

      // Update cache
      if (tenderId) {
        const cacheKey = createCacheKey('fuelBids', tenderId);
        const cachedData = cacheManager.get<FuelBid[]>(cacheKey, CACHE_TTL);
        if (cachedData) {
          const filteredData = cachedData.filter((fuelBid) => fuelBid.id !== fuelBidId);
          cacheManager.set(cacheKey, filteredData, CACHE_TTL);
        }
      }
    },
    [tenderId],
  );

  useEffect(() => {
    loadFuelBids();
  }, [loadFuelBids]);

  return {
    fuelBids,
    loading,
    error,
    refreshFuelBids,
    updateFuelBid,
    addFuelBid,
    removeFuelBid,
  };
}
