'use client';

import { Airport, ServiceContract, User } from '@/drizzle/types';
import { getAirports } from '@/services/core/airport-client';
import { createContext, useCallback, useContext, useEffect, useState } from 'react';

export type LoadingState = {
  airports: boolean;
  contracts: boolean;
};

export type ErrorState = {
  airports: string | null;
  contracts: string | null;
  general: string | null;
};

export type FuelProcurementContextType = {
  // User and airports
  dbUser: User;
  // Airports
  airports: Airport[];
  setAirports: (airports: Airport[]) => void;
  // Selected airport
  selectedAirport: Airport | null;
  setSelectedAirport: (airport: Airport | null) => void;
  // Refresh, Update, Add, Remove airports
  refreshAirports: () => Promise<void>;
  updateAirport: (updatedAirport: Airport) => void;
  addAirport: (newAirport: Airport) => void;
  removeAirport: (airportId: string) => void;

  // Contracts
  airportContracts: ServiceContract[];
  setAirportContracts: (contracts: ServiceContract[]) => void;
  // Selected contract
  selectedContract: ServiceContract | null;
  setSelectedContract: (contract: ServiceContract | null) => void;
  // Refresh, Update, Add, Remove contracts
  refreshContracts: () => Promise<void>;
  updateContract: (updatedContract: ServiceContract) => void;
  addContract: (newContract: ServiceContract) => void;
  removeContract: (contractId: string) => void;

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
  const [airportContracts, setAirportContracts] = useState<ServiceContract[]>([]);
  const [selectedContract, setSelectedContract] = useState<ServiceContract | null>(null);

  // Cache to avoid refetching contracts for the same airport
  const [contractsCache, setContractsCache] = useState<Record<string, ServiceContract[]>>({});

  // Loading states
  const [loading, setLoading] = useState<LoadingState>({
    airports: false,
    contracts: false,
  });

  // Error states
  const [errors, setErrors] = useState<ErrorState>({
    airports: null,
    contracts: null,
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
   * Load ground handling contracts for the selected airport (only when airport changes)
   */
  useEffect(() => {
    if (!selectedAirport) {
      setAirportContracts([]);
      setSelectedContract(null);
      return;
    }

    const loadContracts = async () => {
      // Check cache first
      if (contractsCache[selectedAirport.id]) {
        const cachedContracts = contractsCache[selectedAirport.id];
        setAirportContracts(cachedContracts);
        setSelectedContract(cachedContracts.length > 0 ? cachedContracts[0] : null);
        return;
      }

      setLoading((prev) => ({ ...prev, tenders: true }));
      setErrors((prev) => ({ ...prev, tenders: null }));

      try {
        const contracts = await getServiceContractsByAirport(selectedAirport.id);
        setAirportContracts(contracts);

        // Cache the tenders for this airport
        setContractsCache((prev) => ({
          ...prev,
          [selectedAirport.id]: contracts,
        }));

        // Always set first tender as selected when loading tenders for a new airport
        setSelectedContract(contracts.length > 0 ? contracts[0] : null);
      } catch (error) {
        console.error('Error loading ground handling contracts:', error);
        setErrors((prev) => ({
          ...prev,
          tenders: error instanceof Error ? error.message : 'Failed to load fuel tenders',
        }));
        setAirportContracts([]);
        setSelectedContract(null);
      } finally {
        setLoading((prev) => ({ ...prev, tenders: false }));
      }
    };

    loadContracts();
  }, [selectedAirport, contractsCache]); // Depend on selectedAirport and contractsCache

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
  const refreshContracts = useCallback(async () => {
    if (!selectedAirport) return;

    // Clear cache for this airport to force fresh data
    setContractsCache((prev) => {
      const updated = { ...prev };
      delete updated[selectedAirport.id];
      return updated;
    });

    setLoading((prev) => ({ ...prev, tenders: true }));
    setErrors((prev) => ({ ...prev, tenders: null }));

    try {
      // const contracts = await getGroundHandlingContractsByAirport(selectedAirport.id);
      setAirportContracts([]);

      // Update cache with fresh data
      setContractsCache((prev) => ({
        ...prev,
        [selectedAirport.id]: [],
      }));

      // Preserve the currently selected tender if it still exists, otherwise select first
      if (selectedContract) {
        const updatedSelectedContract = airportContracts.find((t) => t.id === selectedContract.id);
        setSelectedContract(
          updatedSelectedContract || (airportContracts.length > 0 ? airportContracts[0] : null),
        );
      } else if (airportContracts.length > 0) {
        setSelectedContract(airportContracts[0]);
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
  }, [selectedAirport, selectedContract]);

  /**
   * Select contract by ID without refetching (instant selection)
   */
  const selectContractById = useCallback(
    (contractId: string) => {
      const contract = airportContracts.find((t) => t.id === contractId);
      if (contract) {
        setSelectedContract(contract);
      }
    },
    [airportContracts],
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
  const updateContract = useCallback(
    (updatedContract: ServiceContract) => {
      setAirportContracts((prevContracts) =>
        prevContracts.map((contract) =>
          contract.id === updatedContract.id ? updatedContract : contract,
        ),
      );

      if (selectedContract?.id === updatedContract.id) {
        setSelectedContract(updatedContract);
      }
    },
    [selectedContract],
  );

  /**
   * Add tender
   */
  const addContract = useCallback((newContract: ServiceContract) => {
    setAirportContracts((prevContracts) => [newContract, ...prevContracts]);
  }, []);

  /**
   * Remove tender
   */
  const removeContract = useCallback(
    (contractId: string) => {
      setAirportContracts((prevContracts) =>
        prevContracts.filter((contract) => contract.id !== contractId),
      );

      if (selectedContract?.id === contractId) {
        setSelectedContract(null);
      }
    },
    [selectedContract],
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
      contracts: null,
      general: null,
    });
  }, []);

  /**
   * Context value
   */
  const value: FuelProcurementContextType = {
    dbUser,
    airports,
    refreshAirports,
    updateAirport,
    addAirport,
    removeAirport,
    selectedAirport,
    setSelectedAirport,
    airportContracts,
    setAirportContracts,
    selectedContract,
    setSelectedContract,
    refreshContracts,
    updateContract,
    addContract,
    removeContract,
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
