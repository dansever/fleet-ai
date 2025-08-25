'use client';

import { Quote, Rfq } from '@/drizzle/types';
import { getQuotesByRfq } from '@/services/technical/quote-client';
import { deleteRfq, getRfqs } from '@/services/technical/rfq-client';
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
  addQuote: (newQuote: Partial<Quote>) => void;
  deleteRfqAndSelectAdjacent: (rfqId: string) => Promise<void>;

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

  // Helper function to select adjacent RFQ when current one is removed
  const findAdjacentRfqId = (rfqList: Rfq[], removedRfqId: string): string | null => {
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
  };

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

      // If selected RFQ no longer exists, select an adjacent one
      if (selectedRfqId && !freshRfqs.find((rfq) => rfq.id === selectedRfqId)) {
        const newSelectedId = findAdjacentRfqId(freshRfqs, selectedRfqId);
        setSelectedRfqId(newSelectedId);
      }
    } catch (error) {
      console.error('Failed to refresh RFQs:', error);
    } finally {
      setIsLoadingRfqs(false);
    }
  };

  const refreshSelectedRfqQuotes = async () => {
    if (!selectedRfqId) return;

    // Start loading immediately
    setLoadingQuotesForRfq((prev) => new Set([...prev, selectedRfqId]));

    try {
      // Remove from cache to force refresh
      setQuotesCache((prev) => {
        const newCache = new Map(prev);
        newCache.delete(selectedRfqId);
        return newCache;
      });

      // Fetch fresh quotes directly (bypass cache check)
      const quotes = await getQuotesByRfq(selectedRfqId);

      // Cache the results
      setQuotesCache((prev) => new Map(prev).set(selectedRfqId, quotes));
    } catch (error) {
      console.error(`Failed to refresh quotes for RFQ ${selectedRfqId}:`, error);
    } finally {
      // Remove from loading set
      setLoadingQuotesForRfq((prev) => {
        const newSet = new Set(prev);
        newSet.delete(selectedRfqId);
        return newSet;
      });
    }
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

  const addQuote = (newQuote: Partial<Quote>) => {
    // Ensure the quote has an rfqId
    if (!newQuote.rfqId) {
      console.error('Cannot add quote without rfqId');
      return;
    }

    // Add the quote to the cache for the appropriate RFQ
    setQuotesCache((prev) => {
      const newCache = new Map(prev);
      const existingQuotes = newCache.get(newQuote.rfqId!) || [];

      // Add the new quote to the beginning of the array (most recent first)
      const updatedQuotes = [newQuote as Quote, ...existingQuotes];
      newCache.set(newQuote.rfqId!, updatedQuotes);

      return newCache;
    });
  };

  const deleteRfqAndSelectAdjacent = async (rfqId: string) => {
    try {
      // Delete from the server
      await deleteRfq(rfqId);

      // Find the adjacent RFQ before removing the current one
      const newSelectedRfqId = findAdjacentRfqId(rfqs, rfqId);

      // Remove from local state
      setRfqs((prev) => prev.filter((rfq) => rfq.id !== rfqId));

      // Clear quotes cache for the deleted RFQ
      setQuotesCache((prev) => {
        const newCache = new Map(prev);
        newCache.delete(rfqId);
        return newCache;
      });

      // Update selected RFQ to adjacent one
      setSelectedRfqId(newSelectedRfqId);
    } catch (error) {
      console.error('Failed to delete RFQ:', error);
      throw error; // Re-throw so the UI can handle the error
    }
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
    addQuote,
    deleteRfqAndSelectAdjacent,

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
