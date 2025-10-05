interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

class CacheManager {
  private cache = new Map<string, CacheEntry<any>>();
  private defaultTTL = 5 * 60 * 1000; // 5 minutes
  private storagePrefix = 'fuel-cache-';
  private useLocalStorage = typeof window !== 'undefined' && window.localStorage;

  constructor() {
    // Load cache from localStorage on initialization
    if (this.useLocalStorage) {
      this.loadFromLocalStorage();
    }
  }

  private loadFromLocalStorage(): void {
    try {
      const keys = Object.keys(localStorage);
      for (const key of keys) {
        if (key.startsWith(this.storagePrefix)) {
          const cacheKey = key.substring(this.storagePrefix.length);
          const item = localStorage.getItem(key);
          if (item) {
            const entry = JSON.parse(item) as CacheEntry<any>;
            this.cache.set(cacheKey, entry);
          }
        }
      }
    } catch (error) {
      console.error('Failed to load cache from localStorage:', error);
    }
  }

  private saveToLocalStorage(key: string, entry: CacheEntry<any>): void {
    if (!this.useLocalStorage) return;
    try {
      localStorage.setItem(this.storagePrefix + key, JSON.stringify(entry));
    } catch (error) {
      console.error('Failed to save cache to localStorage:', error);
    }
  }

  private removeFromLocalStorage(key: string): void {
    if (!this.useLocalStorage) return;
    try {
      localStorage.removeItem(this.storagePrefix + key);
    } catch (error) {
      console.error('Failed to remove cache from localStorage:', error);
    }
  }

  set<T>(key: string, data: T, ttl?: number): void {
    const entry = {
      data,
      timestamp: Date.now(),
    };
    this.cache.set(key, entry);
    this.saveToLocalStorage(key, entry);
  }

  get<T>(key: string, ttl?: number): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    const maxAge = ttl || this.defaultTTL;
    if (Date.now() - entry.timestamp > maxAge) {
      this.delete(key);
      return null;
    }

    return entry.data;
  }

  delete(key: string): void {
    this.cache.delete(key);
    this.removeFromLocalStorage(key);
  }

  clear(): void {
    // Clear in-memory cache
    this.cache.clear();

    // Clear localStorage
    if (this.useLocalStorage) {
      try {
        const keys = Object.keys(localStorage);
        for (const key of keys) {
          if (key.startsWith(this.storagePrefix)) {
            localStorage.removeItem(key);
          }
        }
      } catch (error) {
        console.error('Failed to clear cache from localStorage:', error);
      }
    }
  }

  clearExpired(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];

    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > this.defaultTTL) {
        keysToDelete.push(key);
      }
    }

    for (const key of keysToDelete) {
      this.delete(key);
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
  CONVERSIONS: 60 * 60 * 1000, // 60 minutes (1 hour) - longer since conversions are expensive
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
