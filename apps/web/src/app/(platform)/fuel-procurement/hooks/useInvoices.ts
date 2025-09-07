import { Invoice, UpdateInvoice } from '@/drizzle/types';
import { client as invoiceClient } from '@/modules/invoices/invoices';
import { useCallback, useEffect, useState } from 'react';
import { cacheManager, createCacheKey } from '../utils/cacheManager';

interface UseInvoicesOptions {
  contractId: string | null;
  enabled?: boolean;
}

interface UseInvoicesReturn {
  invoices: Invoice[];
  loading: boolean;
  error: string | null;
  refreshInvoices: () => Promise<void>;
  updateInvoice: (id: Invoice['id'], data: UpdateInvoice) => Promise<void>;
  addInvoice: (newInvoice: Invoice) => void;
  removeInvoice: (invoiceId: string) => void;
}

const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export function useInvoices({ contractId, enabled = true }: UseInvoicesOptions): UseInvoicesReturn {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isCacheValid = useCallback((key: string) => {
    return cacheManager.get(key, CACHE_TTL) !== null;
  }, []);

  const loadInvoices = useCallback(async () => {
    if (!contractId || !enabled) {
      setInvoices([]);
      return;
    }

    const cacheKey = createCacheKey('invoices', contractId);

    // Check cache first
    const cachedData = cacheManager.get<Invoice[]>(cacheKey, CACHE_TTL);
    if (cachedData) {
      setInvoices(cachedData);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await invoiceClient.listInvoicesByContract(contractId);
      setInvoices(data);

      // Update cache
      cacheManager.set(cacheKey, data, CACHE_TTL);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load invoices');
      setInvoices([]);
    } finally {
      setLoading(false);
    }
  }, [contractId, enabled]);

  const refreshInvoices = useCallback(async () => {
    if (!contractId) return;

    const cacheKey = createCacheKey('invoices', contractId);
    cacheManager.delete(cacheKey); // Clear cache to force refresh
    await loadInvoices();
  }, [contractId, loadInvoices]);

  const updateInvoice = useCallback(
    async (id: Invoice['id'], data: UpdateInvoice) => {
      // Note: This would typically call an API to update the invoice
      // For now, we'll simulate the update by finding and updating the local state
      // In a real implementation, you'd call an API like updateInvoiceClient(id, data)

      setInvoices((prev) =>
        prev.map((invoice) => (invoice.id === id ? { ...invoice, ...data } : invoice)),
      );

      // Update cache
      if (contractId) {
        const cacheKey = createCacheKey('invoices', contractId);
        const cachedData = cacheManager.get<Invoice[]>(cacheKey, CACHE_TTL);
        if (cachedData) {
          const updatedData = cachedData.map((invoice) =>
            invoice.id === id ? { ...invoice, ...data } : invoice,
          );
          cacheManager.set(cacheKey, updatedData, CACHE_TTL);
        }
      }
    },
    [contractId],
  );

  const addInvoice = useCallback(
    (newInvoice: Invoice) => {
      setInvoices((prevInvoices) => [newInvoice, ...prevInvoices]);

      // Update cache
      if (contractId) {
        const cacheKey = createCacheKey('invoices', contractId);
        const cachedData = cacheManager.get<Invoice[]>(cacheKey, CACHE_TTL);
        if (cachedData) {
          cacheManager.set(cacheKey, [newInvoice, ...cachedData], CACHE_TTL);
        }
      }
    },
    [contractId],
  );

  const removeInvoice = useCallback(
    (invoiceId: string) => {
      setInvoices((prevInvoices) => prevInvoices.filter((invoice) => invoice.id !== invoiceId));

      // Update cache
      if (contractId) {
        const cacheKey = createCacheKey('invoices', contractId);
        const cachedData = cacheManager.get<Invoice[]>(cacheKey, CACHE_TTL);
        if (cachedData) {
          const filteredData = cachedData.filter((invoice) => invoice.id !== invoiceId);
          cacheManager.set(cacheKey, filteredData, CACHE_TTL);
        }
      }
    },
    [contractId],
  );

  useEffect(() => {
    loadInvoices();
  }, [loadInvoices]);

  return {
    invoices,
    loading,
    error,
    refreshInvoices,
    updateInvoice,
    addInvoice,
    removeInvoice,
  };
}
