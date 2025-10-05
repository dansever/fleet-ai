import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';

/**
 * Cache configuration
 */
export const MAX_CACHE_SIZE = 20; // Maximum number of items to cache per domain
export const CACHE_CLEANUP_THRESHOLD = 40; // Start cleanup when we reach this many cached items

/**
 * Hook for managing caches across different data domains
 * Provides cache state, cleanup utilities, and periodic maintenance
 */
export function useCache<T = any>() {
  const [contractsCache, setContractsCache] = useState<Record<string, T[]>>({});
  const [documentsCache, setDocumentsCache] = useState<Record<string, T[]>>({});
  const [vendorContactsCache, setVendorContactsCache] = useState<Record<string, T[]>>({});

  /**
   * Clean up cache when it gets too large to prevent memory issues during long sessions
   */
  const cleanupCache = useCallback(
    <TCacheItem>(
      cache: Record<string, TCacheItem>,
      currentItemId?: string,
    ): Record<string, TCacheItem> => {
      const cacheKeys = Object.keys(cache);

      if (cacheKeys.length <= CACHE_CLEANUP_THRESHOLD) {
        return cache;
      }

      // Always keep the current item's cache
      const keysToKeep = currentItemId ? [currentItemId] : [];

      // Keep the most recently accessed items (approximate by keeping current selection)
      const remainingSlots = MAX_CACHE_SIZE - keysToKeep.length;
      const keysToRemove = cacheKeys.filter((key) => !keysToKeep.includes(key));

      // Remove oldest entries (simple approach - remove from beginning of keys array)
      const keysToDelete = keysToRemove.slice(0, Math.max(0, keysToRemove.length - remainingSlots));

      const cleanedCache = { ...cache };
      keysToDelete.forEach((key) => {
        delete cleanedCache[key];
      });

      console.log(
        `Cache cleanup: Removed ${keysToDelete.length} entries, ${Object.keys(cleanedCache).length} remaining`,
      );
      return cleanedCache;
    },
    [],
  );

  /**
   * Cleanup all caches periodically based on current selections
   */
  const performCacheCleanup = useCallback(
    (selectedAirportId?: string, selectedContractId?: string) => {
      setContractsCache((prev) => cleanupCache(prev, selectedAirportId));
      setVendorContactsCache((prev) => cleanupCache(prev, selectedAirportId));
      setDocumentsCache((prev) => cleanupCache(prev, selectedContractId));
    },
    [cleanupCache],
  );

  /**
   * Manually clear all caches (useful for troubleshooting or memory management)
   */
  const clearAllCaches = useCallback(() => {
    setContractsCache({});
    setVendorContactsCache({});
    setDocumentsCache({});
    console.log('All caches cleared manually');
    toast.success('Cache cleared successfully');
  }, []);

  /**
   * Periodic cache cleanup to prevent memory issues during long sessions
   */
  useEffect(() => {
    const cleanupInterval = setInterval(
      () => {
        performCacheCleanup();
      },
      5 * 60 * 1000,
    ); // Cleanup every 5 minutes

    // Optional: Log cache statistics for monitoring
    const statsInterval = setInterval(
      () => {
        const contractsCacheSize = Object.keys(contractsCache).length;
        const vendorContactsCacheSize = Object.keys(vendorContactsCache).length;
        const documentsCacheSize = Object.keys(documentsCache).length;

        if (contractsCacheSize > 20 || vendorContactsCacheSize > 20 || documentsCacheSize > 20) {
          console.log(
            `Cache stats - Contracts: ${contractsCacheSize}, Vendor Contacts: ${vendorContactsCacheSize}, Documents: ${documentsCacheSize}`,
          );
        }
      },
      2 * 60 * 1000,
    ); // Log every 2 minutes if caches are getting large

    return () => {
      clearInterval(cleanupInterval);
      clearInterval(statsInterval);
    };
  }, [performCacheCleanup, contractsCache, vendorContactsCache, documentsCache]);

  return {
    // Cache states
    contractsCache,
    setContractsCache,
    documentsCache,
    setDocumentsCache,
    vendorContactsCache,
    setVendorContactsCache,

    // Cache utilities
    cleanupCache,
    performCacheCleanup,
    clearAllCaches,
  };
}
