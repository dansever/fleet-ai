import { Contract, UpdateContract } from '@/drizzle/types';
import { getContractsByAirport } from '@/services/contracts/contract-client';
import { useCallback, useEffect, useState } from 'react';
import { cacheManager, createCacheKey } from '../utils/cacheManager';

interface UseContractsOptions {
  airportId: string | null;
  enabled?: boolean;
}

interface UseContractsReturn {
  contracts: Contract[];
  loading: boolean;
  error: string | null;
  refreshContracts: () => Promise<void>;
  updateContract: (id: Contract['id'], data: UpdateContract) => Promise<void>;
  addContract: (newContract: Contract) => void;
  removeContract: (contractId: string) => void;
}

const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export function useContracts({
  airportId,
  enabled = true,
}: UseContractsOptions): UseContractsReturn {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadContracts = useCallback(async () => {
    if (!airportId || !enabled) {
      setContracts([]);
      return;
    }

    const cacheKey = createCacheKey('contracts', airportId);

    // Check cache first
    const cachedData = cacheManager.get<Contract[]>(cacheKey, CACHE_TTL);
    if (cachedData) {
      setContracts(cachedData);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await getContractsByAirport(airportId);
      setContracts(data);

      // Update cache
      cacheManager.set(cacheKey, data, CACHE_TTL);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load contracts');
      setContracts([]);
    } finally {
      setLoading(false);
    }
  }, [airportId, enabled]);

  const refreshContracts = useCallback(async () => {
    if (!airportId) return;

    const cacheKey = createCacheKey('contracts', airportId);
    cacheManager.delete(cacheKey); // Clear cache to force refresh
    await loadContracts();
  }, [airportId, loadContracts]);

  const updateContract = useCallback(
    async (id: Contract['id'], data: UpdateContract) => {
      // Note: This would typically call an API to update the contract
      // For now, we'll simulate the update by finding and updating the local state
      // In a real implementation, you'd call an API like updateContractClient(id, data)

      setContracts((prev) =>
        prev.map((contract) => (contract.id === id ? { ...contract, ...data } : contract)),
      );

      // Update cache
      if (airportId) {
        const cacheKey = createCacheKey('contracts', airportId);
        const cachedData = cacheManager.get<Contract[]>(cacheKey, CACHE_TTL);
        if (cachedData) {
          const updatedData = cachedData.map((contract) =>
            contract.id === id ? { ...contract, ...data } : contract,
          );
          cacheManager.set(cacheKey, updatedData, CACHE_TTL);
        }
      }
    },
    [airportId],
  );

  const addContract = useCallback(
    (newContract: Contract) => {
      setContracts((prevContracts) => [newContract, ...prevContracts]);

      // Update cache
      if (airportId) {
        const cacheKey = createCacheKey('contracts', airportId);
        const cachedData = cacheManager.get<Contract[]>(cacheKey, CACHE_TTL);
        if (cachedData) {
          cacheManager.set(cacheKey, [newContract, ...cachedData], CACHE_TTL);
        }
      }
    },
    [airportId],
  );

  const removeContract = useCallback(
    (contractId: string) => {
      setContracts((prevContracts) =>
        prevContracts.filter((contract) => contract.id !== contractId),
      );

      // Update cache
      if (airportId) {
        const cacheKey = createCacheKey('contracts', airportId);
        const cachedData = cacheManager.get<Contract[]>(cacheKey, CACHE_TTL);
        if (cachedData) {
          const filteredData = cachedData.filter((contract) => contract.id !== contractId);
          cacheManager.set(cacheKey, filteredData, CACHE_TTL);
        }
      }
    },
    [airportId],
  );

  // Clear data immediately when airportId changes
  useEffect(() => {
    if (!airportId || !enabled) {
      setContracts([]);
      setError(null);
      return;
    }

    // Clear current data immediately to prevent showing stale data
    setContracts([]);
    setError(null);
  }, [airportId, enabled]);

  useEffect(() => {
    loadContracts();
  }, [loadContracts]);

  return {
    contracts,
    loading,
    error,
    refreshContracts,
    updateContract,
    addContract,
    removeContract,
  };
}
