'use client';

import { Airport, ServiceContract, User } from '@/drizzle/types';
import { getServiceContractsByAirport } from '@/services/contracts/service-contract-client';
import { getAirports } from '@/services/core/airport-client';
import { createContext, useCallback, useContext, useEffect, useState } from 'react';

export type LoadingState = {
  airports: boolean;
  contracts: boolean;
  isRefreshing: boolean; // Indicates if current loading is from a refresh action
};

export type ErrorState = {
  airports: string | null;
  contracts: string | null;
  general: string | null;
};

export type AirportHubContextType = {
  // User and airports
  dbUser: User;
  airports: Airport[];
  setAirports: (airports: Airport[]) => void;
  selectedAirport: Airport | null;
  setSelectedAirport: (airport: Airport | null) => void;

  // Refresh, Update, Add, Remove airports
  refreshAirports: () => Promise<void>;
  updateAirport: (updatedAirport: Airport) => void;
  addAirport: (newAirport: Airport) => void;
  removeAirport: (airportId: string) => void;

  // Service Contracts
  serviceContracts: ServiceContract[];
  setServiceContracts: (contracts: ServiceContract[]) => void;
  selectedServiceContract: ServiceContract | null;
  setSelectedServiceContract: (contract: ServiceContract | null) => void;

  // Refresh, Update, Add, Remove contracts
  refreshServiceContracts: () => Promise<void>;
  updateServiceContract: (updatedContract: ServiceContract) => void;
  addServiceContract: (newContract: ServiceContract) => void;
  removeServiceContract: (contractId: string) => void;

  // Loading and error states
  loading: LoadingState;
  errors: ErrorState;
  clearError: (errorType: keyof ErrorState) => void;
  clearAllErrors: () => void;
};

const AirportHubContext = createContext<AirportHubContextType | undefined>(undefined);

export default function AirportHubProvider({
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
  const [serviceContracts, setServiceContracts] = useState<ServiceContract[]>([]);
  const [selectedServiceContract, setSelectedServiceContract] = useState<ServiceContract | null>(
    null,
  );

  // Cache to avoid refetching service contracts for the same airport
  const [serviceContractsCache, setServiceContractsCache] = useState<
    Record<string, ServiceContract[]>
  >({});

  // Loading states
  const [loading, setLoading] = useState<LoadingState>({
    airports: false,
    contracts: false,
    isRefreshing: false,
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
    setAirports(sortedAirports);

    // Always set first airport as selected on initial load
    if (sortedAirports.length > 0) {
      setSelectedAirport(sortedAirports[0]);
    }
  }, [initialAirports, sortAirports]);

  /**
   * Load service contracts for the selected airport (only when airport changes)
   */
  useEffect(() => {
    if (!selectedAirport) {
      setServiceContracts([]);
      setSelectedServiceContract(null);
      return;
    }

    const loadServiceContracts = async () => {
      // Check cache first
      if (serviceContractsCache[selectedAirport.id]) {
        const cachedContracts = serviceContractsCache[selectedAirport.id];
        setServiceContracts(cachedContracts);
        setSelectedServiceContract(cachedContracts.length > 0 ? cachedContracts[0] : null);
        return;
      }

      setLoading((prev) => ({ ...prev, contracts: true, isRefreshing: false }));
      setErrors((prev) => ({ ...prev, contracts: null }));

      try {
        const contracts = await getServiceContractsByAirport(selectedAirport.id);
        setServiceContracts(contracts);

        // Cache the service contracts for this airport
        setServiceContractsCache((prev) => ({
          ...prev,
          [selectedAirport.id]: contracts,
        }));

        // Always set first contract as selected when loading contracts for a new airport
        setSelectedServiceContract(contracts.length > 0 ? contracts[0] : null);
      } catch (error) {
        console.error('Error loading service contracts:', error);
        setErrors((prev) => ({
          ...prev,
          contracts: error instanceof Error ? error.message : 'Failed to load service contracts',
        }));
        setServiceContracts([]);
        setSelectedServiceContract(null);
      } finally {
        setLoading((prev) => ({ ...prev, contracts: false, isRefreshing: false }));
      }
    };

    loadServiceContracts();
  }, [selectedAirport, serviceContractsCache]); // Depend on selectedAirport and serviceContractsCache

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
   * Refresh service contracts for the currently selected airport (clears cache)
   */
  const refreshServiceContracts = useCallback(async () => {
    if (!selectedAirport) return;

    // Clear cache for this airport to force fresh data
    setServiceContractsCache((prev) => {
      const updated = { ...prev };
      delete updated[selectedAirport.id];
      return updated;
    });

    setLoading((prev) => ({ ...prev, contracts: true, isRefreshing: true }));
    setErrors((prev) => ({ ...prev, contracts: null }));

    try {
      const contracts = await getServiceContractsByAirport(selectedAirport.id);
      setServiceContracts(contracts);

      // Update cache with fresh data
      setServiceContractsCache((prev) => ({
        ...prev,
        [selectedAirport.id]: contracts,
      }));

      // Preserve the currently selected contract if it still exists, otherwise select first
      if (selectedServiceContract) {
        const updatedSelectedContract = contracts.find((c) => c.id === selectedServiceContract.id);
        setSelectedServiceContract(
          updatedSelectedContract || (contracts.length > 0 ? contracts[0] : null),
        );
      } else if (contracts.length > 0) {
        setSelectedServiceContract(contracts[0]);
      }
    } catch (error) {
      console.error('Error refreshing service contracts:', error);
      setErrors((prev) => ({
        ...prev,
        contracts: error instanceof Error ? error.message : 'Failed to refresh service contracts',
      }));
    } finally {
      setLoading((prev) => ({ ...prev, contracts: false, isRefreshing: false }));
    }
  }, [selectedAirport, selectedServiceContract]);

  /**
   * Select service contract by ID without refetching (instant selection)
   */
  const selectServiceContractById = useCallback(
    (contractId: string) => {
      const contract = serviceContracts.find((c) => c.id === contractId);
      if (contract) {
        setSelectedServiceContract(contract);
      }
    },
    [serviceContracts],
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
   * Update service contract
   */
  const updateServiceContract = useCallback(
    (updatedContract: ServiceContract) => {
      setServiceContracts((prevContracts) =>
        prevContracts.map((contract) =>
          contract.id === updatedContract.id ? updatedContract : contract,
        ),
      );

      if (selectedServiceContract?.id === updatedContract.id) {
        setSelectedServiceContract(updatedContract);
      }
    },
    [selectedServiceContract],
  );

  /**
   * Add service contract
   */
  const addServiceContract = useCallback((newContract: ServiceContract) => {
    setServiceContracts((prevContracts) => [newContract, ...prevContracts]);
  }, []);

  /**
   * Remove service contract
   */
  const removeServiceContract = useCallback(
    (contractId: string) => {
      setServiceContracts((prevContracts) =>
        prevContracts.filter((contract) => contract.id !== contractId),
      );

      if (selectedServiceContract?.id === contractId) {
        setSelectedServiceContract(null);
      }
    },
    [selectedServiceContract],
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
  const value: AirportHubContextType = {
    dbUser,
    airports,
    setAirports,
    refreshAirports,
    updateAirport,
    addAirport,
    removeAirport,
    selectedAirport,
    setSelectedAirport,
    serviceContracts,
    setServiceContracts,
    selectedServiceContract,
    setSelectedServiceContract,
    refreshServiceContracts,
    updateServiceContract,
    addServiceContract,
    removeServiceContract,
    loading,
    errors,
    clearError,
    clearAllErrors,
  };

  return <AirportHubContext.Provider value={value}>{children}</AirportHubContext.Provider>;
}

export function useAirportHub() {
  const context = useContext(AirportHubContext);
  if (!context) {
    throw new Error('useAirportHub must be used within a AirportHubProvider');
  }
  return context;
}
