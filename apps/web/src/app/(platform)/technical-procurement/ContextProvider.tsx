'use client';

import { Quote, Rfq } from '@/drizzle/types';
import { getQuotesByRfq } from '@/services/technical/quote-client';
import { getRfqs } from '@/services/technical/rfq-client';
import { createContext, ReactNode, useContext, useEffect, useState } from 'react';

export interface TechnicalProcurementContextValue {
  // Data
  rfqs: Rfq[];
  selectedRfqId: string | null;

  // Computed data
  selectedRfq: Rfq | null;
  selectedRfqQuotes: Quote[];

  // Actions
  setSelectedRfqId: (id: string | null) => void;
  refreshRfqs: () => Promise<void>;
  refreshSelectedRfqQuotes: () => Promise<void>;
  refreshData: () => Promise<void>;
  clearQuotesCache: () => void;
  updateRfq: (updatedRfq: Rfq) => void;
  addRfq: (newRfq: Rfq) => void;

  // Loading states
  isLoadingRfqs: boolean;
  isLoadingQuotes: boolean;
  isLoading: boolean;
}

const TechnicalProcurementContext = createContext<TechnicalProcurementContextValue | null>(null);

export interface TechnicalProcurementContextProviderProps {
  children: ReactNode;
  initialRfqs: Rfq[];
  hasServerData: boolean;
}

export function TechnicalProcurementContextProvider({
  children,
  initialRfqs,
  hasServerData,
}: TechnicalProcurementContextProviderProps) {
  // Core state
  const [rfqs, setRfqs] = useState<Rfq[]>(initialRfqs);
  const [selectedRfqId, setSelectedRfqId] = useState<string | null>(
    initialRfqs.length > 0 ? initialRfqs[0].id : null,
  );

  // Quote caching - Map of rfqId -> quotes
  const [quotesCache, setQuotesCache] = useState<Map<string, Quote[]>>(new Map());
  const [loadingQuotesForRfq, setLoadingQuotesForRfq] = useState<Set<string>>(new Set());

  // Loading states
  const [isLoadingRfqs, setIsLoadingRfqs] = useState(false);

  // Computed values
  const selectedRfq = selectedRfqId ? rfqs.find((rfq) => rfq.id === selectedRfqId) || null : null;
  const selectedRfqQuotes = selectedRfqId ? quotesCache.get(selectedRfqId) || [] : [];
  const isLoadingQuotes = selectedRfqId ? loadingQuotesForRfq.has(selectedRfqId) : false;
  const isLoading = isLoadingRfqs || isLoadingQuotes;

  // Fetch quotes for a specific RFQ with caching
  const fetchQuotesForRfq = async (rfqId: string) => {
    // Check if already cached
    if (quotesCache.has(rfqId)) {
      return quotesCache.get(rfqId)!;
    }

    // Check if already loading
    if (loadingQuotesForRfq.has(rfqId)) {
      return [];
    }

    // Start loading
    setLoadingQuotesForRfq((prev) => new Set([...prev, rfqId]));

    try {
      const quotes = await getQuotesByRfq(rfqId);

      // Cache the results
      setQuotesCache((prev) => new Map(prev).set(rfqId, quotes));

      return quotes;
    } catch (error) {
      console.error(`Failed to fetch quotes for RFQ ${rfqId}:`, error);
      return [];
    } finally {
      // Remove from loading set
      setLoadingQuotesForRfq((prev) => {
        const newSet = new Set(prev);
        newSet.delete(rfqId);
        return newSet;
      });
    }
  };

  // Actions
  const refreshRfqs = async () => {
    setIsLoadingRfqs(true);
    try {
      const freshRfqs = await getRfqs();
      setRfqs(freshRfqs);

      // If selected RFQ no longer exists, select the first one or null
      if (selectedRfqId && !freshRfqs.find((rfq) => rfq.id === selectedRfqId)) {
        setSelectedRfqId(freshRfqs.length > 0 ? freshRfqs[0].id : null);
      }
    } catch (error) {
      console.error('Failed to refresh RFQs:', error);
    } finally {
      setIsLoadingRfqs(false);
    }
  };

  const refreshSelectedRfqQuotes = async () => {
    if (!selectedRfqId) return;

    // Remove from cache to force refresh
    setQuotesCache((prev) => {
      const newCache = new Map(prev);
      newCache.delete(selectedRfqId);
      return newCache;
    });

    // Fetch fresh quotes
    await fetchQuotesForRfq(selectedRfqId);
  };

  const refreshData = async () => {
    await refreshRfqs();
    // Refresh quotes for the currently selected RFQ after RFQ refresh
    if (selectedRfqId) {
      await refreshSelectedRfqQuotes();
    }
  };

  const clearQuotesCache = () => {
    setQuotesCache(new Map());
  };

  const updateRfq = (updatedRfq: Rfq) => {
    setRfqs((prev) => prev.map((rfq) => (rfq.id === updatedRfq.id ? updatedRfq : rfq)));
  };

  const addRfq = (newRfq: Rfq) => {
    setRfqs((prev) => [newRfq, ...prev]);
    // Auto-select the newly added RFQ
    setSelectedRfqId(newRfq.id);
  };

  // Client-side data fetching only if no server data provided
  useEffect(() => {
    if (!hasServerData) {
      refreshRfqs();
    }
  }, [hasServerData]);

  // Auto-select first RFQ if none selected and RFQs are available
  useEffect(() => {
    if (!selectedRfqId && rfqs.length > 0) {
      setSelectedRfqId(rfqs[0].id);
    }
  }, [rfqs, selectedRfqId]);

  // Fetch quotes when selectedRfqId changes
  useEffect(() => {
    if (selectedRfqId) {
      fetchQuotesForRfq(selectedRfqId);
    }
  }, [selectedRfqId]);

  const contextValue: TechnicalProcurementContextValue = {
    // Data
    rfqs,
    selectedRfqId,

    // Computed data
    selectedRfq,
    selectedRfqQuotes,

    // Actions
    setSelectedRfqId,
    refreshRfqs,
    refreshSelectedRfqQuotes,
    refreshData,
    clearQuotesCache,
    updateRfq,
    addRfq,

    // Loading states
    isLoadingRfqs,
    isLoadingQuotes,
    isLoading,
  };

  return (
    <TechnicalProcurementContext.Provider value={contextValue}>
      {children}
    </TechnicalProcurementContext.Provider>
  );
}

export function useTechnicalProcurement() {
  const context = useContext(TechnicalProcurementContext);
  if (!context) {
    throw new Error(
      'useTechnicalProcurement must be used within a TechnicalProcurementContextProvider',
    );
  }
  return context;
}
