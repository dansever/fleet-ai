import { Airport, Contract } from '@/drizzle/types';
import { client as contractClient } from '@/modules/contracts';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { ErrorState, LoadingState } from './types';

type UseContractsProps = {
  selectedAirport: Airport | null;
  setLoading: React.Dispatch<React.SetStateAction<LoadingState>>;
  setErrors: React.Dispatch<React.SetStateAction<ErrorState>>;
  contractsCache: Record<string, Contract[]>;
  setContractsCache: React.Dispatch<React.SetStateAction<Record<string, Contract[]>>>;
  cleanupCache: <T>(cache: Record<string, T>, currentItemId?: string) => Record<string, T>;
};

/**
 * Hook for managing contracts state and operations
 */
export function useContracts({
  selectedAirport,
  setLoading,
  setErrors,
  contractsCache,
  setContractsCache,
  cleanupCache,
}: UseContractsProps) {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);

  /**
   * Load service contracts for the selected airport (only when airport changes)
   *
   * Flow:
   * 1. Check cache for contracts
   * 2. If found, set contracts and select first contract (triggers documents load)
   * 3. If not found, fetch from server, cache, and select first contract
   */
  useEffect(() => {
    if (!selectedAirport) {
      setContracts([]);
      setSelectedContract(null);
      return;
    }

    // Immediately clear contracts when switching airports to prevent stale data
    setContracts([]);
    setSelectedContract(null);

    const loadContracts = async () => {
      // Check cache first
      if (contractsCache[selectedAirport.id] !== undefined) {
        const cachedContracts = contractsCache[selectedAirport.id];
        setContracts(cachedContracts);
        setSelectedContract(cachedContracts.length > 0 ? cachedContracts[0] : null);
        // Ensure loading state is cleared when loading from cache
        setLoading((prev) => ({ ...prev, contracts: false, isRefreshing: false }));
        console.log(
          `Loaded ${cachedContracts.length} contracts from cache for airport ${selectedAirport.id}`,
        );
        return;
      }

      setLoading((prev) => ({ ...prev, contracts: true, isRefreshing: false }));
      setErrors((prev) => ({ ...prev, contracts: null }));

      console.log(`Loading contracts for airport ${selectedAirport.id}...`);

      try {
        const contracts = await contractClient.listContractsByAirport(selectedAirport.id);
        setContracts(contracts);

        // Cache the service contracts for this airport
        setContractsCache((prev) => {
          const updated = {
            ...prev,
            [selectedAirport.id]: contracts,
          };
          return cleanupCache(updated, selectedAirport.id);
        });

        // Always set first contract as selected when loading contracts for a new airport
        setSelectedContract(contracts.length > 0 ? contracts[0] : null);
        console.log(
          `Successfully loaded ${contracts.length} contracts for airport ${selectedAirport.id}`,
        );
      } catch (error) {
        console.error('Error loading service contracts:', error);
        const errorMessage =
          error instanceof Error ? error.message : 'Failed to load service contracts';
        setErrors((prev) => ({
          ...prev,
          contracts: errorMessage,
        }));
        setContracts([]);
        setSelectedContract(null);

        // Show user-friendly toast notification
        toast.error(`Failed to load contracts: ${errorMessage}`);
      } finally {
        setLoading((prev) => ({ ...prev, contracts: false, isRefreshing: false }));
      }
    };

    loadContracts();
  }, [selectedAirport, cleanupCache, setLoading, setErrors, contractsCache, setContractsCache]);

  /**
   * Refresh service contracts for the currently selected airport (clears cache)
   */
  const refreshContracts = useCallback(async () => {
    if (!selectedAirport) return;

    // Clear cache for this airport to force fresh data
    setContractsCache((prev) => {
      const updated = { ...prev };
      delete updated[selectedAirport.id];
      return updated;
    });

    setLoading((prev) => ({ ...prev, contracts: true, isRefreshing: true }));
    setErrors((prev) => ({ ...prev, contracts: null }));

    try {
      const contracts = await contractClient.listContractsByAirport(selectedAirport.id);
      setContracts(contracts);

      // Update cache with fresh data
      setContractsCache((prev) => {
        const updated = {
          ...prev,
          [selectedAirport.id]: contracts,
        };
        return cleanupCache(updated, selectedAirport.id);
      });

      // Preserve the currently selected contract if it still exists, otherwise select first
      if (selectedContract) {
        const updatedSelectedContract = contracts.find(
          (c: Contract) => c.id === selectedContract.id,
        );
        setSelectedContract(
          updatedSelectedContract || (contracts.length > 0 ? contracts[0] : null),
        );
      } else if (contracts.length > 0) {
        setSelectedContract(contracts[0]);
      }
    } catch (error) {
      console.error('Error refreshing service contracts:', error);
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to refresh service contracts';
      setErrors((prev) => ({
        ...prev,
        contracts: errorMessage,
      }));

      // Show user-friendly toast notification
      toast.error(`Failed to refresh contracts: ${errorMessage}`);
    } finally {
      setLoading((prev) => ({ ...prev, contracts: false, isRefreshing: false }));
    }
  }, [selectedAirport, selectedContract, setLoading, setErrors, setContractsCache, cleanupCache]);

  /**
   * Update contract in state and cache
   */
  const updateContract = useCallback(
    (updatedContract: Contract) => {
      setContracts((prevContracts) =>
        prevContracts.map((contract) =>
          contract.id === updatedContract.id ? updatedContract : contract,
        ),
      );

      if (selectedContract?.id === updatedContract.id) {
        setSelectedContract(updatedContract);
      }

      // Update cache as well
      if (selectedAirport) {
        setContractsCache((prev) => ({
          ...prev,
          [selectedAirport.id]:
            prev[selectedAirport.id]?.map((contract) =>
              contract.id === updatedContract.id ? updatedContract : contract,
            ) || [],
        }));
      }
    },
    [selectedContract, selectedAirport, setContractsCache],
  );

  /**
   * Add service contract to state and cache
   */
  const addContract = useCallback(
    (newContract: Contract) => {
      setContracts((prevContracts) => [newContract, ...prevContracts]);

      // Update cache as well
      if (selectedAirport && selectedAirport.id === newContract.airportId) {
        setContractsCache((prev) => {
          const updated = {
            ...prev,
            [selectedAirport.id]: [newContract, ...(prev[selectedAirport.id] || [])],
          };
          return cleanupCache(updated, selectedAirport.id);
        });
      }
    },
    [selectedAirport, cleanupCache, setContractsCache],
  );

  /**
   * Remove service contract from state and cache
   */
  const removeContract = useCallback(
    (contractId: string) => {
      setContracts((prevContracts) => {
        const filteredContracts = prevContracts.filter((contract) => contract.id !== contractId);

        // If we're removing the currently selected contract, select the first available one
        if (selectedContract?.id === contractId) {
          setSelectedContract(filteredContracts.length > 0 ? filteredContracts[0] : null);
        }

        return filteredContracts;
      });

      // Update cache as well
      if (selectedAirport) {
        setContractsCache((prev) => ({
          ...prev,
          [selectedAirport.id]:
            prev[selectedAirport.id]?.filter((contract) => contract.id !== contractId) || [],
        }));
      }
    },
    [selectedContract, selectedAirport, setContractsCache],
  );

  return {
    contracts,
    setContracts,
    selectedContract,
    setSelectedContract,
    refreshContracts,
    updateContract,
    addContract,
    removeContract,
  };
}
