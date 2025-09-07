'use client';

import { Contract, ContractRule, Invoice, InvoiceLine } from '@/drizzle/types';
import { client as contractRulesClient } from '@/modules/contracts/contractRules';
import { client as contractClient } from '@/modules/contracts/contracts';
import { client as invoiceLinesClient } from '@/modules/invoices/invoice-lines';
import { client as invoicesClient } from '@/modules/invoices/invoices';
import React, { createContext, useContext, useEffect, useState } from 'react';

interface ContractContextType {
  // Contracts
  contract: Contract | null;
  setContract: (contract: Contract | null) => void;
  refreshContract: () => Promise<void>;
  updateContract: (updatedContract: Contract) => void;
  addContract: (newContract: Contract) => void;
  removeContract: (contractId: Contract['id']) => void;

  // Contract Rules
  contractRules: ContractRule[] | null;
  setContractRules: (contractRules: ContractRule[]) => void;
  refreshContractRules: () => Promise<void>;
  updateContractRule: (updatedContractRule: ContractRule) => void;
  addContractRule: (newContractRule: ContractRule) => void;
  removeContractRule: (contractRuleId: ContractRule['id']) => void;

  // Invoices
  invoices: Invoice[] | null;
  selectedInvoice: Invoice | null;
  setSelectedInvoice: (invoice: Invoice | null) => void;
  setInvoices: (invoices: Invoice[]) => void;
  refreshInvoices: () => Promise<void>;
  updateInvoice: (updatedInvoice: Invoice) => void;
  addInvoice: (newInvoice: Invoice) => void;
  removeInvoice: (invoiceId: Invoice['id']) => void;

  // Invoice Lines
  invoiceLines: InvoiceLine[] | null;
  setInvoiceLines: (invoiceLines: InvoiceLine[]) => void;
  refreshInvoiceLines: () => Promise<void>;
  updateInvoiceLine: (updatedInvoiceLine: InvoiceLine) => void;
  addInvoiceLine: (newInvoiceLine: InvoiceLine) => void;
  removeInvoiceLine: (invoiceLineId: InvoiceLine['id']) => void;

  // Loading and error states
  loading: boolean;
  error: string | null;
}

const ContractContext = createContext<ContractContextType | undefined>(undefined);

interface ContractContextProviderProps {
  children: React.ReactNode;
  contractId: string;
  initialContract?: Contract | null;
  initialContractRules?: ContractRule[] | null;
}

export default function ContractContextProvider({
  children,
  contractId,
  initialContract = null,
  initialContractRules = null,
}: ContractContextProviderProps) {
  const [contract, setContract] = useState<Contract | null>(initialContract);
  const [contractRules, setContractRules] = useState<ContractRule[] | null>(initialContractRules);
  const [invoices, setInvoices] = useState<Invoice[] | null>(null);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [invoiceLines, setInvoiceLines] = useState<InvoiceLine[] | null>(null);
  const [loading, setLoading] = useState(!initialContract);
  const [error, setError] = useState<string | null>(null);

  // Server data flags to prevent duplicate API calls
  const [hasServerContractData] = useState(initialContract !== null);
  const [hasServerContractRulesData] = useState(initialContractRules !== null);

  // Contracts
  const fetchContract = async () => {
    if (!contractId) return;
    try {
      setLoading(true);
      setError(null);
      const contractData = await contractClient.getContractById(contractId);
      setContract(contractData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch contract';
      setError(errorMessage);
      console.error('Error fetching contract:', err);
    } finally {
      setLoading(false);
    }
  };

  // Contract Rules
  const fetchContractRules = async () => {
    if (!contractId) return;
    try {
      setLoading(true);
      setError(null);
      const contractRulesData = await contractRulesClient.listContractRulesByContractId(contractId);
      setContractRules(contractRulesData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch contract rules';
      setError(errorMessage);
      console.error('Error fetching contract rules:', err);
    } finally {
      setLoading(false);
    }
  };

  // Invoices
  const fetchInvoices = async () => {
    if (!contractId) return;
    try {
      setLoading(true);
      setError(null);
      const invoicesData = await invoicesClient.listInvoicesByContract(contractId);
      setInvoices(invoicesData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch invoices';
      setError(errorMessage);
      console.error('Error fetching invoices:', err);
    } finally {
      setLoading(false);
    }
  };

  // Invoice Lines
  const fetchInvoiceLines = async (invoiceId?: string) => {
    const targetInvoiceId = invoiceId || selectedInvoice?.id;
    if (!targetInvoiceId) return;
    try {
      setLoading(true);
      setError(null);
      const invoiceLinesData =
        await invoiceLinesClient.listInvoiceLinesByInvoiceId(targetInvoiceId);
      setInvoiceLines(invoiceLinesData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch invoice lines';
      setError(errorMessage);
      console.error('Error fetching invoice lines:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch initial data
  useEffect(() => {
    if (!hasServerContractData) {
      fetchContract();
    }
  }, [contractId, hasServerContractData]);

  useEffect(() => {
    if (!hasServerContractRulesData) {
      fetchContractRules();
    }
  }, [contractId, hasServerContractRulesData]);

  useEffect(() => {
    fetchInvoices();
  }, [contractId]);

  // Fetch invoice lines when selectedInvoice changes
  useEffect(() => {
    if (selectedInvoice) {
      fetchInvoiceLines(selectedInvoice.id);
    } else {
      setInvoiceLines(null);
    }
  }, [selectedInvoice]);

  const value: ContractContextType = {
    contract,
    setContract,
    contractRules,
    setContractRules,
    selectedInvoice,
    setSelectedInvoice,
    invoices,
    setInvoices,
    invoiceLines,
    setInvoiceLines,
    loading,
    error,
    refreshContract: fetchContract,
    refreshContractRules: fetchContractRules,
    refreshInvoices: fetchInvoices,
    refreshInvoiceLines: fetchInvoiceLines,
    updateContract: (updatedContract: Contract) => {
      setContract(updatedContract);
    },
    addContract: (newContract: Contract) => {
      setContract(newContract);
    },
    removeContract: (contractId: Contract['id']) => {
      setContract(null);
    },
    updateContractRule: (updatedContractRule: ContractRule) => {
      setContractRules((prev) =>
        prev
          ? prev.map((rule) => (rule.id === updatedContractRule.id ? updatedContractRule : rule))
          : [updatedContractRule],
      );
    },
    addContractRule: (newContractRule: ContractRule) => {
      setContractRules((prev) => (prev ? [...prev, newContractRule] : [newContractRule]));
    },
    removeContractRule: (contractRuleId: ContractRule['id']) => {
      setContractRules((prev) => (prev ? prev.filter((rule) => rule.id !== contractRuleId) : null));
    },
    updateInvoice: (updatedInvoice: Invoice) => {
      setInvoices((prev) =>
        prev
          ? prev.map((invoice) => (invoice.id === updatedInvoice.id ? updatedInvoice : invoice))
          : [updatedInvoice],
      );
      // Update selectedInvoice if it's the one being updated
      if (selectedInvoice?.id === updatedInvoice.id) {
        setSelectedInvoice(updatedInvoice);
      }
    },
    addInvoice: (newInvoice: Invoice) => {
      setInvoices((prev) => (prev ? [...prev, newInvoice] : [newInvoice]));
    },
    removeInvoice: (invoiceId: Invoice['id']) => {
      setInvoices((prev) => (prev ? prev.filter((invoice) => invoice.id !== invoiceId) : null));
      // Clear selectedInvoice if it's the one being removed
      if (selectedInvoice?.id === invoiceId) {
        setSelectedInvoice(null);
      }
    },
    updateInvoiceLine: (updatedInvoiceLine: InvoiceLine) => {
      setInvoiceLines((prev) =>
        prev
          ? prev.map((line) => (line.id === updatedInvoiceLine.id ? updatedInvoiceLine : line))
          : [updatedInvoiceLine],
      );
    },
    addInvoiceLine: (newInvoiceLine: InvoiceLine) => {
      setInvoiceLines((prev) => (prev ? [...prev, newInvoiceLine] : [newInvoiceLine]));
    },
    removeInvoiceLine: (invoiceLineId: InvoiceLine['id']) => {
      setInvoiceLines((prev) => (prev ? prev.filter((line) => line.id !== invoiceLineId) : null));
    },
  };

  return <ContractContext.Provider value={value}>{children}</ContractContext.Provider>;
}

export function useContract() {
  const context = useContext(ContractContext);
  if (context === undefined) {
    throw new Error('useContract must be used within a ContractContextProvider');
  }
  return context;
}
