'use client';

import { Airport, Contract, FuelBid, FuelTender, Invoice, User } from '@/drizzle/types';
import { client as contractClient } from '@/modules/contracts';
import { client as fuelBidClient } from '@/modules/fuel/bids';
import { server as fuelTenderServer } from '@/modules/fuel/tenders';
import { client as invoiceClient } from '@/modules/invoices';
import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { ConversionProgress, convertBidsToTenderBase, ConvertedBid } from '../utils/bidConversion';
import { CACHE_KEYS, CACHE_TTL, cacheManager, createCacheKey } from '../utils/cacheManager';

// ============================================================================
// Types
// ============================================================================

interface FuelProcurementState {
  // Data
  airports: Airport[];
  tenders: FuelTender[];
  bids: FuelBid[];
  convertedBids: ConvertedBid[];
  contracts: Contract[];
  invoices: Invoice[];

  // Selections
  selectedAirport: Airport | null;
  selectedTender: FuelTender | null;
  selectedContract: Contract | null;

  // Loading states
  loadingAirports: boolean;
  loadingTenders: boolean;
  loadingBids: boolean;
  convertingBids: boolean;
  loadingContracts: boolean;
  loadingInvoices: boolean;
  uploadingDocument: boolean;

  // Errors
  airportsError: string | null;
  tendersError: string | null;
  bidsError: string | null;
  contractsError: string | null;
  invoicesError: string | null;
}

interface FuelProcurementContextType {
  // Data
  airports: Airport[];
  tenders: FuelTender[];
  bids: FuelBid[];
  convertedBids: ConvertedBid[];
  contracts: Contract[];
  invoices: Invoice[];

  // Selections
  selectedAirport: Airport | null;
  setSelectedAirport: (airport: Airport | null) => void;
  selectedTender: FuelTender | null;
  selectedContract: Contract | null;

  // Loading states (simple booleans)
  loading: {
    airports: boolean;
    tenders: boolean;
    bids: boolean;
    convertingBids: boolean;
    contracts: boolean;
    invoices: boolean;
    uploadDocument: boolean;
    any: boolean;
    initial: boolean; // Critical initial data
  };

  // Errors
  errors: {
    airports: string | null;
    tenders: string | null;
    bids: string | null;
    contracts: string | null;
    invoices: string | null;
    any: boolean;
  };

  // Conversion progress
  conversionProgress: ConversionProgress | null;

  // Actions
  selectAirport: (airport: Airport | null) => void;
  selectTender: (tender: FuelTender | null) => void;
  selectContract: (contract: Contract | null) => void;

  // Document upload
  setUploadDocument: (uploading: boolean) => void;

  // Refresh functions
  refreshTenders: () => Promise<void>;
  refreshBids: () => Promise<void>;
  refreshContracts: () => Promise<void>;
  refreshInvoices: () => Promise<void>;
  refreshAll: () => Promise<void>;

  // CRUD operations
  addTender: (tender: FuelTender) => void;
  updateTender: (tender: FuelTender) => void;
  removeTender: (tenderId: string) => void;
  addBid: (bid: FuelBid) => void;
  updateBid: (bid: FuelBid) => void;
  removeBid: (bidId: string) => void;
}

const FuelProcurementContext = createContext<FuelProcurementContextType | undefined>(undefined);

// ============================================================================
// Provider Component
// ============================================================================

export function FuelProcurementProvider({
  dbUser,
  initialAirports,
  hasServerData,
  children,
}: {
  dbUser: User;
  initialAirports: Airport[];
  hasServerData: boolean;
  children: React.ReactNode;
}) {
  // Sort airports helper
  const sortAirports = useCallback((airports: Airport[]) => {
    return [...airports].sort((a, b) => {
      if (a.isHub && !b.isHub) return -1;
      if (!a.isHub && b.isHub) return 1;
      return a.name.localeCompare(b.name);
    });
  }, []);

  // Initialize state
  const [state, setState] = useState<FuelProcurementState>(() => {
    const sorted = sortAirports(initialAirports);
    return {
      airports: sorted,
      tenders: [],
      bids: [],
      convertedBids: [],
      contracts: [],
      invoices: [],
      selectedAirport: sorted[0] || null,
      selectedTender: null,
      selectedContract: null,
      loadingAirports: false,
      loadingTenders: false,
      loadingBids: false,
      convertingBids: false,
      loadingContracts: false,
      loadingInvoices: false,
      uploadingDocument: false,
      airportsError: null,
      tendersError: null,
      bidsError: null,
      contractsError: null,
      invoicesError: null,
    };
  });

  // Conversion progress state
  const [conversionProgress, setConversionProgress] = useState<ConversionProgress | null>(null);

  // Helper to update state safely
  const updateState = useCallback((updates: Partial<FuelProcurementState>) => {
    setState((prev) => ({ ...prev, ...updates }));
  }, []);

  // Load tenders for selected airport with caching
  const loadTenders = useCallback(
    async (airportId: string, forceRefresh = false) => {
      const cacheKey = createCacheKey(CACHE_KEYS.TENDERS, airportId);

      // Check cache first (unless force refresh)
      if (!forceRefresh) {
        const cachedTenders = cacheManager.get<FuelTender[]>(cacheKey, CACHE_TTL.TENDERS);
        if (cachedTenders) {
          updateState({
            tenders: cachedTenders,
            loadingTenders: false,
            selectedTender: cachedTenders[0] || null,
            tendersError: null,
          });
          return;
        }
      }

      updateState({ loadingTenders: true, tendersError: null });
      try {
        const tenders = await fuelTenderServer.listFuelTendersByAirportId(airportId);

        // Cache the results
        cacheManager.set(cacheKey, tenders, CACHE_TTL.TENDERS);

        updateState({
          tenders,
          loadingTenders: false,
          selectedTender: tenders[0] || null, // Auto-select first tender
        });
      } catch (error) {
        updateState({
          tendersError: error instanceof Error ? error.message : 'Failed to load tenders',
          loadingTenders: false,
          tenders: [],
        });
      }
    },
    [updateState],
  );

  // Load bids for selected tender with caching and conversion
  const loadBids = useCallback(
    async (tenderId: string, forceRefresh = false) => {
      const cacheKey = createCacheKey(CACHE_KEYS.BIDS, tenderId);

      // Check cache first (unless force refresh)
      if (!forceRefresh) {
        const cachedBids = cacheManager.get<FuelBid[]>(cacheKey, CACHE_TTL.BIDS);
        if (cachedBids) {
          updateState({
            bids: cachedBids,
            loadingBids: false,
            bidsError: null,
          });

          // Trigger conversion if we have a selected tender
          const selectedTender = state.tenders.find((t) => t.id === tenderId);
          if (selectedTender && cachedBids.length > 0) {
            triggerBidConversion(cachedBids, selectedTender);
          }
          return;
        }
      }

      updateState({ loadingBids: true, bidsError: null });
      try {
        const bids = await fuelBidClient.listFuelBidsByTender(tenderId);

        // Cache the results
        cacheManager.set(cacheKey, bids, CACHE_TTL.BIDS);

        updateState({ bids, loadingBids: false });

        // Trigger conversion if we have a selected tender
        const selectedTender = state.tenders.find((t) => t.id === tenderId);
        if (selectedTender && bids.length > 0) {
          triggerBidConversion(bids, selectedTender);
        }
      } catch (error) {
        updateState({
          bidsError: error instanceof Error ? error.message : 'Failed to load bids',
          loadingBids: false,
          bids: [],
        });
      }
    },
    [updateState, state.tenders],
  );

  // Trigger bid conversion to tender base currency/UOM
  const triggerBidConversion = useCallback(
    async (bids: FuelBid[], tender: FuelTender) => {
      if (bids.length === 0) return;

      updateState({ convertingBids: true });
      setConversionProgress({
        total: bids.length,
        completed: 0,
        current: '',
        errors: [],
      });

      try {
        const convertedBids = await convertBidsToTenderBase(bids, tender, (progress) => {
          setConversionProgress(progress);
        });

        updateState({
          convertedBids,
          convertingBids: false,
        });
        setConversionProgress(null);
      } catch (error) {
        console.error('Error converting bids:', error);
        updateState({
          convertingBids: false,
          convertedBids: [],
        });
        setConversionProgress(null);
      }
    },
    [updateState],
  );

  // Load contracts for selected airport with caching
  const loadContracts = useCallback(
    async (airportId: string, forceRefresh = false) => {
      const cacheKey = createCacheKey(CACHE_KEYS.CONTRACTS, airportId);

      // Check cache first (unless force refresh)
      if (!forceRefresh) {
        const cachedContracts = cacheManager.get<Contract[]>(cacheKey, CACHE_TTL.CONTRACTS);
        if (cachedContracts) {
          updateState({
            contracts: cachedContracts,
            loadingContracts: false,
            contractsError: null,
          });
          return;
        }
      }

      updateState({ loadingContracts: true, contractsError: null });
      try {
        const contracts = await contractClient.listContractsByAirport(airportId);

        // Cache the results
        cacheManager.set(cacheKey, contracts, CACHE_TTL.CONTRACTS);

        updateState({ contracts, loadingContracts: false });
      } catch (error) {
        updateState({
          contractsError: error instanceof Error ? error.message : 'Failed to load contracts',
          loadingContracts: false,
          contracts: [],
        });
      }
    },
    [updateState],
  );

  // Load invoices for selected contract with caching
  const loadInvoices = useCallback(
    async (contractId: string, forceRefresh = false) => {
      const cacheKey = createCacheKey(CACHE_KEYS.INVOICES, contractId);

      // Check cache first (unless force refresh)
      if (!forceRefresh) {
        const cachedInvoices = cacheManager.get<Invoice[]>(cacheKey, CACHE_TTL.INVOICES);
        if (cachedInvoices) {
          updateState({
            invoices: cachedInvoices,
            loadingInvoices: false,
            invoicesError: null,
          });
          return;
        }
      }

      updateState({ loadingInvoices: true, invoicesError: null });
      try {
        const invoices = await invoiceClient.listInvoicesByContract(contractId);

        // Cache the results
        cacheManager.set(cacheKey, invoices, CACHE_TTL.INVOICES);

        updateState({ invoices, loadingInvoices: false });
      } catch (error) {
        updateState({
          invoicesError: error instanceof Error ? error.message : 'Failed to load invoices',
          loadingInvoices: false,
          invoices: [],
        });
      }
    },
    [updateState],
  );

  // Auto-load data when selections change
  useEffect(() => {
    if (state.selectedAirport?.id) {
      loadTenders(state.selectedAirport.id);
      loadContracts(state.selectedAirport.id);
    }
  }, [state.selectedAirport?.id, loadTenders, loadContracts]);

  useEffect(() => {
    if (state.selectedTender?.id) {
      loadBids(state.selectedTender.id);
    }
  }, [state.selectedTender?.id, loadBids]);

  useEffect(() => {
    if (state.selectedContract?.id) {
      loadInvoices(state.selectedContract.id);
    }
  }, [state.selectedContract?.id, loadInvoices]);

  // Context value
  const contextValue: FuelProcurementContextType = {
    // Data
    airports: state.airports,
    tenders: state.tenders,
    bids: state.bids,
    convertedBids: state.convertedBids,
    contracts: state.contracts,
    invoices: state.invoices,

    // Selections
    selectedAirport: state.selectedAirport,
    setSelectedAirport: (airport: Airport | null) => {
      updateState({ selectedAirport: airport });
    },
    selectedTender: state.selectedTender,
    selectedContract: state.selectedContract,

    // Loading states
    loading: {
      airports: state.loadingAirports,
      tenders: state.loadingTenders,
      bids: state.loadingBids,
      convertingBids: state.convertingBids,
      contracts: state.loadingContracts,
      invoices: state.loadingInvoices,
      uploadDocument: state.uploadingDocument,
      any:
        state.loadingTenders ||
        state.loadingBids ||
        state.convertingBids ||
        state.loadingContracts ||
        state.loadingInvoices ||
        state.uploadingDocument,
      initial: state.loadingTenders || state.loadingContracts, // Critical initial data
    },

    // Errors
    errors: {
      airports: state.airportsError,
      tenders: state.tendersError,
      bids: state.bidsError,
      contracts: state.contractsError,
      invoices: state.invoicesError,
      any: !!(
        state.airportsError ||
        state.tendersError ||
        state.bidsError ||
        state.contractsError ||
        state.invoicesError
      ),
    },

    // Conversion progress
    conversionProgress,

    // Actions
    selectAirport: (airport: Airport | null) => {
      updateState({
        selectedAirport: airport,
        selectedTender: null,
        selectedContract: null,
        tenders: [],
        bids: [],
        convertedBids: [],
        contracts: [],
        invoices: [],
      });
    },

    selectTender: (tender: FuelTender | null) => {
      updateState({
        selectedTender: tender,
        bids: [],
        convertedBids: [],
      });
    },

    selectContract: (contract: Contract | null) => {
      updateState({
        selectedContract: contract,
        invoices: [],
      });
    },

    // Document upload
    setUploadDocument: (uploading: boolean) => {
      updateState({ uploadingDocument: uploading });
    },

    // Refresh functions (force refresh to bypass cache)
    refreshTenders: () =>
      state.selectedAirport?.id ? loadTenders(state.selectedAirport.id, true) : Promise.resolve(),
    refreshBids: () =>
      state.selectedTender?.id ? loadBids(state.selectedTender.id, true) : Promise.resolve(),
    refreshContracts: () =>
      state.selectedAirport?.id ? loadContracts(state.selectedAirport.id, true) : Promise.resolve(),
    refreshInvoices: () =>
      state.selectedContract?.id
        ? loadInvoices(state.selectedContract.id, true)
        : Promise.resolve(),

    refreshAll: async () => {
      if (state.selectedAirport?.id) {
        await Promise.all([
          loadTenders(state.selectedAirport.id, true),
          loadContracts(state.selectedAirport.id, true),
        ]);
      }
      if (state.selectedTender?.id) {
        await loadBids(state.selectedTender.id, true);
      }
      if (state.selectedContract?.id) {
        await loadInvoices(state.selectedContract.id, true);
      }
    },

    // CRUD operations with cache invalidation
    addTender: (tender: FuelTender) => {
      try {
        // Invalidate tenders cache for the airport
        if (tender.airportId) {
          const cacheKey = createCacheKey(CACHE_KEYS.TENDERS, tender.airportId);
          cacheManager.delete(cacheKey);
        }
        updateState({ tenders: [tender, ...state.tenders] });
      } catch (error) {
        console.error('Error adding tender to context:', error);
        // Could add error state handling here if needed
      }
    },

    updateTender: (tender: FuelTender) => {
      try {
        // Invalidate tenders cache for the airport
        if (tender.airportId) {
          const cacheKey = createCacheKey(CACHE_KEYS.TENDERS, tender.airportId);
          cacheManager.delete(cacheKey);
        }
        updateState({
          tenders: state.tenders.map((t) => (t.id === tender.id ? tender : t)),
          selectedTender: state.selectedTender?.id === tender.id ? tender : state.selectedTender,
        });
      } catch (error) {
        console.error('Error updating tender in context:', error);
        // Could add error state handling here if needed
      }
    },

    removeTender: (tenderId: string) => {
      try {
        const tender = state.tenders.find((t) => t.id === tenderId);
        // Invalidate tenders cache for the airport
        if (tender?.airportId) {
          const cacheKey = createCacheKey(CACHE_KEYS.TENDERS, tender.airportId);
          cacheManager.delete(cacheKey);
        }
        updateState({
          tenders: state.tenders.filter((t) => t.id !== tenderId),
          selectedTender: state.selectedTender?.id === tenderId ? null : state.selectedTender,
        });
      } catch (error) {
        console.error('Error removing tender from context:', error);
        // Could add error state handling here if needed
      }
    },

    addBid: (bid: FuelBid) => {
      try {
        // Invalidate bids cache for the tender
        if (bid.tenderId) {
          const cacheKey = createCacheKey(CACHE_KEYS.BIDS, bid.tenderId);
          cacheManager.delete(cacheKey);
        }
        updateState({
          bids: [bid, ...state.bids],
          convertedBids: [], // Clear converted bids as they need to be recalculated
        });
      } catch (error) {
        console.error('Error adding bid to context:', error);
        // Could add error state handling here if needed
      }
    },

    updateBid: (bid: FuelBid) => {
      try {
        // Invalidate bids cache for the tender
        if (bid.tenderId) {
          const cacheKey = createCacheKey(CACHE_KEYS.BIDS, bid.tenderId);
          cacheManager.delete(cacheKey);
        }
        updateState({
          bids: state.bids.map((b) => (b.id === bid.id ? bid : b)),
          convertedBids: [], // Clear converted bids as they need to be recalculated
        });
      } catch (error) {
        console.error('Error updating bid in context:', error);
        // Could add error state handling here if needed
      }
    },

    removeBid: (bidId: string) => {
      try {
        const bid = state.bids.find((b) => b.id === bidId);
        // Invalidate bids cache for the tender
        if (bid?.tenderId) {
          const cacheKey = createCacheKey(CACHE_KEYS.BIDS, bid.tenderId);
          cacheManager.delete(cacheKey);
        }
        updateState({
          bids: state.bids.filter((b) => b.id !== bidId),
          convertedBids: state.convertedBids.filter((b) => b.id !== bidId),
        });
      } catch (error) {
        console.error('Error removing bid from context:', error);
        // Could add error state handling here if needed
      }
    },
  };

  return (
    <FuelProcurementContext.Provider value={contextValue}>
      {children}
    </FuelProcurementContext.Provider>
  );
}

// ============================================================================
// Hook
// ============================================================================

export function useFuelProcurement() {
  const context = useContext(FuelProcurementContext);
  if (!context) {
    throw new Error('useFuelProcurement must be used within a FuelProcurementProvider');
  }
  return context;
}
