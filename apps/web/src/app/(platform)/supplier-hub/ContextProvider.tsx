'use client';

import { Rfq } from '@/drizzle/types';
import { getRfqsByDirection } from '@/services/technical/rfq-client';
import { createContext, ReactNode, useCallback, useContext, useEffect, useState } from 'react';

export type LoadingState = {
  incomingRfqs: boolean;
  isRefreshing: boolean; // Indicates if current loading is from a refresh action
};

export type ErrorState = {
  incomingRfqs: string | null;
  general: string | null;
};

export interface SupplierHubContextValue {
  // Data
  orgId: string;
  incomingRfqs: Rfq[];
  selectedRfq: Rfq | null;

  // Actions
  setIncomingRfqs: (rfqs: Rfq[]) => void;
  setSelectedRfq: (rfq: Rfq | null) => void;
  refreshIncomingRfqs: (force?: boolean) => Promise<void>;
  updateRfq: (updatedRfq: Rfq) => void;
  addRfq: (newRfq: Rfq) => void;
  removeRfq: (rfqId: string) => void;
  selectRfqById: (rfqId: string) => void;

  // Loading and error states
  loading: LoadingState;
  errors: ErrorState;
  clearError: (errorType: keyof ErrorState) => void;
  clearAllErrors: () => void;
}

const SupplierHubContext = createContext<SupplierHubContextValue | null>(null);

export interface SupplierHubContextProviderProps {
  children: ReactNode;
  orgId: string;
  initialRfqs: Rfq[];
  hasServerData: boolean;
}

export function SupplierHubContextProvider({
  children,
  orgId,
  initialRfqs,
  hasServerData,
}: SupplierHubContextProviderProps) {
  // Core state
  const [incomingRfqs, setIncomingRfqs] = useState<Rfq[]>(initialRfqs);
  const [selectedRfq, setSelectedRfq] = useState<Rfq | null>(
    initialRfqs.length > 0 ? initialRfqs[0] : null,
  );

  // Cache to store fetched RFQs with timestamp
  const [rfqsCache, setRfqsCache] = useState<{
    data: Rfq[];
    timestamp: number;
  } | null>(hasServerData ? { data: initialRfqs, timestamp: Date.now() } : null);

  // Loading states
  const [loading, setLoading] = useState<LoadingState>({
    incomingRfqs: false,
    isRefreshing: false,
  });

  // Error states
  const [errors, setErrors] = useState<ErrorState>({
    incomingRfqs: null,
    general: null,
  });

  // Helper function to select adjacent RFQ when current one is removed
  const findAdjacentRfqId = useCallback((rfqList: Rfq[], removedRfqId: string): string | null => {
    if (rfqList.length === 0) return null;

    const currentIndex = rfqList.findIndex((rfq) => rfq.id === removedRfqId);
    if (currentIndex === -1) {
      // If the RFQ wasn't found, select the first one
      return rfqList[0].id;
    }

    // Try to select the next RFQ first (prefer going down the list)
    if (currentIndex < rfqList.length - 1) {
      return rfqList[currentIndex + 1].id;
    }

    // If we're at the end, select the previous RFQ
    if (currentIndex > 0) {
      return rfqList[currentIndex - 1].id;
    }

    // If there's only one RFQ and it's being deleted, return null
    return null;
  }, []);

  /**
   * Refresh incoming RFQs with caching
   */
  const refreshIncomingRfqs = useCallback(
    async (force = false) => {
      // Check cache first (cache valid for 5 minutes) - skip if force refresh
      const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
      if (!force && rfqsCache && Date.now() - rfqsCache.timestamp < CACHE_DURATION) {
        // Use cached data
        setIncomingRfqs(rfqsCache.data);
        if (!selectedRfq && rfqsCache.data.length > 0) {
          setSelectedRfq(rfqsCache.data[0]);
        }
        return;
      }

      // Use refreshing state if we already have data, otherwise use loading state
      const hasExistingData = incomingRfqs.length > 0;

      if (hasExistingData) {
        setLoading((prev) => ({ ...prev, isRefreshing: true }));
      } else {
        setLoading((prev) => ({ ...prev, incomingRfqs: true }));
      }

      setErrors((prev) => ({ ...prev, incomingRfqs: null }));

      try {
        const freshRfqs = await getRfqsByDirection('received');
        setIncomingRfqs(freshRfqs);

        // Update cache
        setRfqsCache({
          data: freshRfqs,
          timestamp: Date.now(),
        });

        // If selected RFQ no longer exists, select an adjacent one
        if (selectedRfq && !freshRfqs.find((rfq) => rfq.id === selectedRfq.id)) {
          const newSelectedId = findAdjacentRfqId(freshRfqs, selectedRfq.id);
          const newSelectedRfq = newSelectedId
            ? freshRfqs.find((rfq) => rfq.id === newSelectedId) || null
            : null;
          setSelectedRfq(newSelectedRfq);
        }
      } catch (error) {
        console.error('Failed to refresh incoming RFQs:', error);
        setErrors((prev) => ({
          ...prev,
          incomingRfqs: error instanceof Error ? error.message : 'Failed to refresh incoming RFQs',
        }));
      } finally {
        if (hasExistingData) {
          setLoading((prev) => ({ ...prev, isRefreshing: false }));
        } else {
          setLoading((prev) => ({ ...prev, incomingRfqs: false }));
        }
      }
    },
    [incomingRfqs.length, selectedRfq, findAdjacentRfqId, rfqsCache],
  );

  /**
   * Update RFQ
   */
  const updateRfq = useCallback(
    (updatedRfq: Rfq) => {
      setIncomingRfqs((prev) => prev.map((rfq) => (rfq.id === updatedRfq.id ? updatedRfq : rfq)));

      if (selectedRfq?.id === updatedRfq.id) {
        setSelectedRfq(updatedRfq);
      }
    },
    [selectedRfq],
  );

  /**
   * Add RFQ
   */
  const addRfq = useCallback((newRfq: Rfq) => {
    setIncomingRfqs((prev) => [newRfq, ...prev]);
    // Auto-select the newly added RFQ
    setSelectedRfq(newRfq);
  }, []);

  /**
   * Remove RFQ
   */
  const removeRfq = useCallback(
    (rfqId: string) => {
      const newSelectedId = findAdjacentRfqId(incomingRfqs, rfqId);
      const newSelectedRfq = newSelectedId
        ? incomingRfqs.find((rfq) => rfq.id === newSelectedId) || null
        : null;

      setIncomingRfqs((prev) => prev.filter((rfq) => rfq.id !== rfqId));
      setSelectedRfq(newSelectedRfq);
    },
    [incomingRfqs, findAdjacentRfqId],
  );

  /**
   * Select RFQ by ID without refetching (instant selection)
   */
  const selectRfqById = useCallback(
    (rfqId: string) => {
      const rfq = incomingRfqs.find((r) => r.id === rfqId);
      if (rfq) {
        setSelectedRfq(rfq);
      }
    },
    [incomingRfqs],
  );

  /**
   * Clear specific error
   */
  const clearError = useCallback((errorType: keyof ErrorState) => {
    setErrors((prev) => ({ ...prev, [errorType]: null }));
  }, []);

  /**
   * Clear all errors
   */
  const clearAllErrors = useCallback(() => {
    setErrors({
      incomingRfqs: null,
      general: null,
    });
  }, []);

  // Client-side data fetching only if no server data provided
  useEffect(() => {
    if (!hasServerData) {
      refreshIncomingRfqs();
    }
  }, [hasServerData, refreshIncomingRfqs]);

  // Auto-select first RFQ if none selected and RFQs are available
  useEffect(() => {
    if (!selectedRfq && incomingRfqs.length > 0) {
      setSelectedRfq(incomingRfqs[0]);
    }
  }, [incomingRfqs, selectedRfq]);

  const contextValue: SupplierHubContextValue = {
    // Data
    orgId,
    incomingRfqs,
    selectedRfq,

    // Actions
    setIncomingRfqs,
    setSelectedRfq,
    refreshIncomingRfqs,
    updateRfq,
    addRfq,
    removeRfq,
    selectRfqById,

    // Loading and error states
    loading,
    errors,
    clearError,
    clearAllErrors,
  };

  return <SupplierHubContext.Provider value={contextValue}>{children}</SupplierHubContext.Provider>;
}

export function useSupplierHub() {
  const context = useContext(SupplierHubContext);
  if (!context) {
    throw new Error('useSupplierHub must be used within a SupplierHubContextProvider');
  }
  return context;
}
