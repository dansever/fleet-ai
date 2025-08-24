'use client';

import { Airport, FuelBid, FuelTender, User } from '@/drizzle/types';
import { getAirports } from '@/services/core/airport-client';
import { getFuelBidsByTender } from '@/services/fuel/fuel-bid-client';
import { getFuelTendersByAirport } from '@/services/fuel/fuel-tender-client';
import { createContext, useCallback, useContext, useEffect, useState } from 'react';

export type LoadingState = {
  airports: boolean;
  tenders: boolean;
  fuelBids: boolean;
};

export type ErrorState = {
  airports: string | null;
  tenders: string | null;
  fuelBids: string | null;
  general: string | null;
};

export type FuelProcurementContextType = {
  // User and airports
  dbUser: User;
  airports: Airport[];
  setAirports: (airports: Airport[]) => void;
  refreshAirports: () => Promise<void>;
  updateAirport: (updatedAirport: Airport) => void;
  addAirport: (newAirport: Airport) => void;
  removeAirport: (airportId: string) => void;

  // Selected airport
  selectedAirport: Airport | null;
  setSelectedAirport: (airport: Airport | null) => void;

  // Tenders
  airportTenders: FuelTender[];
  selectedTender: FuelTender | null;
  setSelectedTender: (tender: FuelTender | null) => void;
  selectTenderById: (tenderId: string) => void; // New optimized tender selection
  refreshTenders: () => Promise<void>;
  updateTender: (updatedTender: FuelTender) => void;
  addTender: (newTender: FuelTender) => void;
  removeTender: (tenderId: string) => void;

  // Fuel Bids
  fuelBids: FuelBid[];
  setFuelBids: (fuelBids: FuelBid[]) => void;
  refreshFuelBids: () => Promise<void>;
  updateFuelBid: (updatedFuelBid: FuelBid) => void;
  addFuelBid: (newFuelBid: FuelBid) => void;
  removeFuelBid: (fuelBidId: string) => void;

  // Loading and error states
  loading: LoadingState;
  errors: ErrorState;
  clearError: (errorType: keyof ErrorState) => void;
  clearAllErrors: () => void;
};

const FuelProcurementContext = createContext<FuelProcurementContextType | undefined>(undefined);

export default function FuelProcurementProvider({
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
  const [airports, setAirports] = useState<Airport[]>(initialAirports);
  const [selectedAirport, setSelectedAirport] = useState<Airport | null>(null);
  const [airportTenders, setAirportTenders] = useState<FuelTender[]>([]);
  const [selectedTender, setSelectedTender] = useState<FuelTender | null>(null);
  const [fuelBids, setFuelBids] = useState<FuelBid[]>([]);

  // Cache to avoid refetching tenders for the same airport
  const [tendersCache, setTendersCache] = useState<Record<string, FuelTender[]>>({});

  // Cache to avoid refetching fuel bids for the same tender
  const [fuelBidsCache, setFuelBidsCache] = useState<Record<string, FuelBid[]>>({});

  // Loading states
  const [loading, setLoading] = useState<LoadingState>({
    airports: false,
    tenders: false,
    fuelBids: false,
  });

  // Error states
  const [errors, setErrors] = useState<ErrorState>({
    airports: null,
    tenders: null,
    fuelBids: null,
    general: null,
  });

  /**
   * Sort airports helper
   */
  const sortAirports = useCallback((airportsToSort: Airport[]) => {
    return [...airportsToSort].sort((a, b) => {
      if (a.isHub && !b.isHub) return -1;
      if (!a.isHub && b.isHub) return 1;
      return a.name.localeCompare(b.name);
    });
  }, []);

  /**
   * Sort airports on initial load and set first as selected
   */
  useEffect(() => {
    const sortedAirports = sortAirports(initialAirports);
    console.log('sortedAirports', sortedAirports);
    setAirports(sortedAirports);

    // Always set first airport as selected on initial load
    if (sortedAirports.length > 0) {
      setSelectedAirport(sortedAirports[0]);
    }
  }, [initialAirports, sortAirports]);

  /**
   * Load fuel tenders for the selected airport (only when airport changes)
   */
  useEffect(() => {
    if (!selectedAirport) {
      setAirportTenders([]);
      setSelectedTender(null);
      return;
    }

    const loadTenders = async () => {
      // Check cache first
      if (tendersCache[selectedAirport.id]) {
        const cachedTenders = tendersCache[selectedAirport.id];
        setAirportTenders(cachedTenders);
        setSelectedTender(cachedTenders.length > 0 ? cachedTenders[0] : null);
        return;
      }

      setLoading((prev) => ({ ...prev, tenders: true }));
      setErrors((prev) => ({ ...prev, tenders: null }));

      try {
        const tenders = await getFuelTendersByAirport(selectedAirport.id);
        setAirportTenders(tenders);

        // Cache the tenders for this airport
        setTendersCache((prev) => ({
          ...prev,
          [selectedAirport.id]: tenders,
        }));

        // Always set first tender as selected when loading tenders for a new airport
        setSelectedTender(tenders.length > 0 ? tenders[0] : null);
      } catch (error) {
        console.error('Error loading fuel tenders:', error);
        setErrors((prev) => ({
          ...prev,
          tenders: error instanceof Error ? error.message : 'Failed to load fuel tenders',
        }));
        setAirportTenders([]);
        setSelectedTender(null);
      } finally {
        setLoading((prev) => ({ ...prev, tenders: false }));
      }
    };

    loadTenders();
  }, [selectedAirport, tendersCache]); // Depend on selectedAirport and tendersCache

  /**
   * Refresh airports
   */
  const refreshAirports = useCallback(async () => {
    if (!dbUser.orgId) return;

    setLoading((prev) => ({ ...prev, airports: true }));
    setErrors((prev) => ({ ...prev, airports: null }));

    try {
      const freshAirports = await getAirports();
      const sortedAirports = sortAirports(freshAirports);
      setAirports(sortedAirports);

      // Update selected airport if it still exists
      if (selectedAirport) {
        const updatedSelectedAirport = sortedAirports.find((a) => a.id === selectedAirport.id);
        if (updatedSelectedAirport) {
          setSelectedAirport(updatedSelectedAirport);
        } else {
          // Selected airport was deleted, select first available
          setSelectedAirport(sortedAirports[0] || null);
        }
      }
    } catch (error) {
      console.error('Error refreshing airports:', error);
      setErrors((prev) => ({
        ...prev,
        airports: error instanceof Error ? error.message : 'Failed to refresh airports',
      }));
    } finally {
      setLoading((prev) => ({ ...prev, airports: false }));
    }
  }, [dbUser.orgId, selectedAirport, sortAirports]);

  /**
   * Refresh tenders for the currently selected airport (clears cache)
   */
  const refreshTenders = useCallback(async () => {
    if (!selectedAirport) return;

    // Clear cache for this airport to force fresh data
    setTendersCache((prev) => {
      const updated = { ...prev };
      delete updated[selectedAirport.id];
      return updated;
    });

    setLoading((prev) => ({ ...prev, tenders: true }));
    setErrors((prev) => ({ ...prev, tenders: null }));

    try {
      const tenders = await getFuelTendersByAirport(selectedAirport.id);
      setAirportTenders(tenders);

      // Update cache with fresh data
      setTendersCache((prev) => ({
        ...prev,
        [selectedAirport.id]: tenders,
      }));

      // Preserve the currently selected tender if it still exists, otherwise select first
      if (selectedTender) {
        const updatedSelectedTender = tenders.find((t) => t.id === selectedTender.id);
        setSelectedTender(updatedSelectedTender || (tenders.length > 0 ? tenders[0] : null));
      } else if (tenders.length > 0) {
        setSelectedTender(tenders[0]);
      }
    } catch (error) {
      console.error('Error refreshing fuel tenders:', error);
      setErrors((prev) => ({
        ...prev,
        tenders: error instanceof Error ? error.message : 'Failed to refresh fuel tenders',
      }));
    } finally {
      setLoading((prev) => ({ ...prev, tenders: false }));
    }
  }, [selectedAirport, selectedTender]);

  /**
   * Load fuel bids for the selected tender (only when tender changes)
   */
  useEffect(() => {
    if (!selectedTender) {
      setFuelBids([]);
      return;
    }

    const loadFuelBids = async () => {
      // Check cache first
      if (fuelBidsCache[selectedTender.id]) {
        const cachedFuelBids = fuelBidsCache[selectedTender.id];
        setFuelBids(cachedFuelBids);
        return;
      }

      setLoading((prev) => ({ ...prev, fuelBids: true }));
      setErrors((prev) => ({ ...prev, fuelBids: null }));

      try {
        const fuelBids = await getFuelBidsByTender(selectedTender.id);
        setFuelBids(fuelBids);

        // Cache the fuel bids for this tender
        setFuelBidsCache((prev) => ({
          ...prev,
          [selectedTender.id]: fuelBids,
        }));
      } catch (error) {
        console.error('Error loading fuel bids:', error);
        setErrors((prev) => ({
          ...prev,
          fuelBids: error instanceof Error ? error.message : 'Failed to load fuel bids',
        }));
        setFuelBids([]);
      } finally {
        setLoading((prev) => ({ ...prev, fuelBids: false }));
      }
    };

    loadFuelBids();
  }, [selectedTender, fuelBidsCache]);

  /**
   * Select tender by ID without refetching (instant selection)
   */
  const selectTenderById = useCallback(
    (tenderId: string) => {
      const tender = airportTenders.find((t) => t.id === tenderId);
      if (tender) {
        setSelectedTender(tender);
      }
    },
    [airportTenders],
  );

  /**
   * Update airport
   */
  const updateAirport = useCallback(
    (updatedAirport: Airport) => {
      setAirports((prevAirports) => {
        const updated = prevAirports.map((airport) =>
          airport.id === updatedAirport.id ? updatedAirport : airport,
        );
        return sortAirports(updated);
      });

      if (selectedAirport?.id === updatedAirport.id) {
        setSelectedAirport(updatedAirport);
      }
    },
    [selectedAirport, sortAirports],
  );

  /**
   * Add airport
   */
  const addAirport = useCallback(
    (newAirport: Airport) => {
      setAirports((prevAirports) => {
        const updated = [...prevAirports, newAirport];
        return sortAirports(updated);
      });
    },
    [sortAirports],
  );

  /**
   * Remove airport
   */
  const removeAirport = useCallback(
    (airportId: string) => {
      setAirports((prevAirports) => prevAirports.filter((airport) => airport.id !== airportId));

      if (selectedAirport?.id === airportId) {
        // Select first available airport or null
        setSelectedAirport(airports.find((a) => a.id !== airportId) || null);
      }
    },
    [selectedAirport, airports],
  );

  /**
   * Update tender
   */
  const updateTender = useCallback(
    (updatedTender: FuelTender) => {
      setAirportTenders((prevTenders) =>
        prevTenders.map((tender) => (tender.id === updatedTender.id ? updatedTender : tender)),
      );

      // Update the cache for the current airport
      if (selectedAirport) {
        setTendersCache((prev) => ({
          ...prev,
          [selectedAirport.id]:
            prev[selectedAirport.id]?.map((tender) =>
              tender.id === updatedTender.id ? updatedTender : tender,
            ) || [],
        }));
      }

      if (selectedTender?.id === updatedTender.id) {
        setSelectedTender(updatedTender);
      }
    },
    [selectedTender, selectedAirport],
  );

  /**
   * Add tender
   */
  const addTender = useCallback(
    (newTender: FuelTender) => {
      setAirportTenders((prevTenders) => [newTender, ...prevTenders]);

      // Update the cache for the current airport
      if (selectedAirport) {
        setTendersCache((prev) => ({
          ...prev,
          [selectedAirport.id]: [newTender, ...(prev[selectedAirport.id] || [])],
        }));
      }
    },
    [selectedAirport],
  );

  /**
   * Remove tender
   */
  const removeTender = useCallback(
    (tenderId: string) => {
      setAirportTenders((prevTenders) => prevTenders.filter((tender) => tender.id !== tenderId));

      if (selectedTender?.id === tenderId) {
        setSelectedTender(null);
      }
    },
    [selectedTender],
  );

  /**
   * Refresh fuel bids (clears cache)
   */
  const refreshFuelBids = useCallback(async () => {
    if (!selectedTender) return;

    // Clear cache for this tender to force fresh data
    setFuelBidsCache((prev) => {
      const updated = { ...prev };
      delete updated[selectedTender.id];
      return updated;
    });

    setLoading((prev) => ({ ...prev, fuelBids: true }));
    setErrors((prev) => ({ ...prev, fuelBids: null }));

    try {
      const fuelBids = await getFuelBidsByTender(selectedTender.id);
      setFuelBids(fuelBids);

      // Update cache with fresh data
      setFuelBidsCache((prev) => ({
        ...prev,
        [selectedTender.id]: fuelBids,
      }));
    } catch (error) {
      console.error('Error refreshing fuel bids:', error);
      setErrors((prev) => ({
        ...prev,
        fuelBids: error instanceof Error ? error.message : 'Failed to refresh fuel bids',
      }));
    } finally {
      setLoading((prev) => ({ ...prev, fuelBids: false }));
    }
  }, [selectedTender]);

  /**
   * Update fuel bid
   */
  const updateFuelBid = useCallback(
    (updatedFuelBid: FuelBid) => {
      setFuelBids((prevFuelBids) =>
        prevFuelBids.map((fuelBid) =>
          fuelBid.id === updatedFuelBid.id ? updatedFuelBid : fuelBid,
        ),
      );

      // Update the cache for the current tender
      if (selectedTender) {
        setFuelBidsCache((prev) => ({
          ...prev,
          [selectedTender.id]:
            prev[selectedTender.id]?.map((fuelBid) =>
              fuelBid.id === updatedFuelBid.id ? updatedFuelBid : fuelBid,
            ) || [],
        }));
      }
    },
    [selectedTender],
  );

  /**
   * Add fuel bid
   */
  const addFuelBid = useCallback(
    (newFuelBid: FuelBid) => {
      setFuelBids((prevFuelBids) => [newFuelBid, ...prevFuelBids]);

      // Update the cache for the current tender
      if (selectedTender) {
        setFuelBidsCache((prev) => ({
          ...prev,
          [selectedTender.id]: [newFuelBid, ...(prev[selectedTender.id] || [])],
        }));
      }
    },
    [selectedTender],
  );

  /**
   * Remove fuel bid
   */
  const removeFuelBid = useCallback(
    (fuelBidId: string) => {
      setFuelBids((prevFuelBids) => prevFuelBids.filter((fuelBid) => fuelBid.id !== fuelBidId));

      // Update the cache for the current tender
      if (selectedTender) {
        setFuelBidsCache((prev) => ({
          ...prev,
          [selectedTender.id]: (prev[selectedTender.id] || []).filter(
            (fuelBid) => fuelBid.id !== fuelBidId,
          ),
        }));
      }
    },
    [selectedTender],
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
      airports: null,
      tenders: null,
      fuelBids: null,
      general: null,
    });
  }, []);

  /**
   * Context value
   */
  const value: FuelProcurementContextType = {
    dbUser,
    airports,
    setAirports,
    refreshAirports,
    updateAirport,
    addAirport,
    removeAirport,
    selectedAirport,
    setSelectedAirport,
    airportTenders,
    selectedTender,
    setSelectedTender,
    selectTenderById,
    refreshTenders,
    updateTender,
    addTender,
    removeTender,
    fuelBids,
    setFuelBids,
    refreshFuelBids,
    updateFuelBid,
    addFuelBid,
    removeFuelBid,
    loading,
    errors,
    clearError,
    clearAllErrors,
  };

  return (
    <FuelProcurementContext.Provider value={value}>{children}</FuelProcurementContext.Provider>
  );
}

export function useFuelProcurement() {
  const context = useContext(FuelProcurementContext);
  if (!context) {
    throw new Error('useFuelProcurement must be used within a FuelProcurementProvider');
  }
  return context;
}
