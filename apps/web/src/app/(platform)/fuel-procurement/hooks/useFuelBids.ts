import { FuelBid } from '@/drizzle/types';
import { getFuelBidsByTender } from '@/services/fuel/fuel-bid-client';
import { useCallback, useEffect, useState } from 'react';

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

// Simple in-memory cache
const fuelBidsCache = new Map<string, { data: FuelBid[]; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export function useFuelBids({ tenderId, enabled = true }: UseFuelBidsOptions): UseFuelBidsReturn {
  const [fuelBids, setFuelBids] = useState<FuelBid[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isCacheValid = useCallback((key: string) => {
    const cached = fuelBidsCache.get(key);
    if (!cached) return false;
    return Date.now() - cached.timestamp < CACHE_TTL;
  }, []);

  const loadFuelBids = useCallback(async () => {
    if (!tenderId || !enabled) {
      setFuelBids([]);
      return;
    }

    const cacheKey = `fuelBids-${tenderId}`;

    // Check cache first
    if (isCacheValid(cacheKey)) {
      const cached = fuelBidsCache.get(cacheKey);
      if (cached) {
        setFuelBids(cached.data);
        return;
      }
    }

    setLoading(true);
    setError(null);

    try {
      const data = await getFuelBidsByTender(tenderId);
      setFuelBids(data);

      // Update cache
      fuelBidsCache.set(cacheKey, { data, timestamp: Date.now() });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load fuel bids');
      setFuelBids([]);
    } finally {
      setLoading(false);
    }
  }, [tenderId, enabled, isCacheValid]);

  const refreshFuelBids = useCallback(async () => {
    if (!tenderId) return;

    const cacheKey = `fuelBids-${tenderId}`;
    fuelBidsCache.delete(cacheKey); // Clear cache to force refresh
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
        const cacheKey = `fuelBids-${tenderId}`;
        const cached = fuelBidsCache.get(cacheKey);
        if (cached) {
          fuelBidsCache.set(cacheKey, {
            data: cached.data.map((fuelBid) =>
              fuelBid.id === updatedFuelBid.id ? updatedFuelBid : fuelBid,
            ),
            timestamp: cached.timestamp,
          });
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
        const cacheKey = `fuelBids-${tenderId}`;
        const cached = fuelBidsCache.get(cacheKey);
        if (cached) {
          fuelBidsCache.set(cacheKey, {
            data: [newFuelBid, ...cached.data],
            timestamp: cached.timestamp,
          });
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
        const cacheKey = `fuelBids-${tenderId}`;
        const cached = fuelBidsCache.get(cacheKey);
        if (cached) {
          fuelBidsCache.set(cacheKey, {
            data: cached.data.filter((fuelBid) => fuelBid.id !== fuelBidId),
            timestamp: cached.timestamp,
          });
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
