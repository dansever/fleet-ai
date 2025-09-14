interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

class CacheManager {
  private cache = new Map<string, CacheEntry<any>>();
  private defaultTTL = 5 * 60 * 1000; // 5 minutes

  set<T>(key: string, data: T, ttl?: number): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    });
  }

  get<T>(key: string, ttl?: number): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    const maxAge = ttl || this.defaultTTL;
    if (Date.now() - entry.timestamp > maxAge) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  clearExpired(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > this.defaultTTL) {
        this.cache.delete(key);
      }
    }
  }

  has(key: string): boolean {
    return this.cache.has(key);
  }

  size(): number {
    return this.cache.size;
  }
}

// Singleton instance
export const cacheManager = new CacheManager();

// ============================================================================
// Cache Configuration
// ============================================================================

export const CACHE_TTL = {
  TENDERS: 5 * 60 * 1000, // 5 minutes
  BIDS: 3 * 60 * 1000, // 3 minutes
  CONTRACTS: 10 * 60 * 1000, // 10 minutes
  INVOICES: 5 * 60 * 1000, // 5 minutes
} as const;

export const CACHE_KEYS = {
  TENDERS: 'tenders',
  BIDS: 'bids',
  CONTRACTS: 'contracts',
  INVOICES: 'invoices',
} as const;

// ============================================================================
// Utility Functions
// ============================================================================

export const createCacheKey = (prefix: string, id: string): string => `${prefix}-${id}`;

export const isCacheValid = (key: string, ttl?: number): boolean => {
  return cacheManager.get(key, ttl) !== null;
};
