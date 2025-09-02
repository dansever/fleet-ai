import { Invoice, UpdateInvoice } from '@/drizzle/types';
import { getInvoicesByContract } from '@/services/contracts/invoice-client';
import { useCallback, useEffect, useState } from 'react';

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

// Simple in-memory cache
const invoicesCache = new Map<string, { data: Invoice[]; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export function useInvoices({ contractId, enabled = true }: UseInvoicesOptions): UseInvoicesReturn {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isCacheValid = useCallback((key: string) => {
    const cached = invoicesCache.get(key);
    if (!cached) return false;
    return Date.now() - cached.timestamp < CACHE_TTL;
  }, []);

  const loadInvoices = useCallback(async () => {
    if (!contractId || !enabled) {
      setInvoices([]);
      return;
    }

    const cacheKey = `invoices-${contractId}`;

    // Check cache first
    if (isCacheValid(cacheKey)) {
      const cached = invoicesCache.get(cacheKey);
      if (cached) {
        setInvoices(cached.data);
        return;
      }
    }

    setLoading(true);
    setError(null);

    try {
      const data = await getInvoicesByContract(contractId);
      setInvoices(data);

      // Update cache
      invoicesCache.set(cacheKey, { data, timestamp: Date.now() });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load invoices');
      setInvoices([]);
    } finally {
      setLoading(false);
    }
  }, [contractId, enabled, isCacheValid]);

  const refreshInvoices = useCallback(async () => {
    if (!contractId) return;

    const cacheKey = `invoices-${contractId}`;
    invoicesCache.delete(cacheKey); // Clear cache to force refresh
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
        const cacheKey = `invoices-${contractId}`;
        const cached = invoicesCache.get(cacheKey);
        if (cached) {
          invoicesCache.set(cacheKey, {
            data: cached.data.map((invoice) =>
              invoice.id === id ? { ...invoice, ...data } : invoice,
            ),
            timestamp: cached.timestamp,
          });
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
        const cacheKey = `invoices-${contractId}`;
        const cached = invoicesCache.get(cacheKey);
        if (cached) {
          invoicesCache.set(cacheKey, {
            data: [newInvoice, ...cached.data],
            timestamp: cached.timestamp,
          });
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
        const cacheKey = `invoices-${contractId}`;
        const cached = invoicesCache.get(cacheKey);
        if (cached) {
          invoicesCache.set(cacheKey, {
            data: cached.data.filter((invoice) => invoice.id !== invoiceId),
            timestamp: cached.timestamp,
          });
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
