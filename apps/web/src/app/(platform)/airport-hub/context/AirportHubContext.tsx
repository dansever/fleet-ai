'use client';

import { Airport, User } from '@/drizzle/types';
import { createContext, useContext } from 'react';
import { AirportHubContextType } from './types';
import { useAirports } from './useAirports';
import { useCache } from './useCache';
import { useContracts } from './useContracts';
import { useDocuments } from './useDocuments';
import { useLoadingErrors } from './useLoadingErrors';
import { useVendorContacts } from './useVendorContacts';

const AirportHubContext = createContext<AirportHubContextType | undefined>(undefined);

type AirportHubProviderProps = {
  dbUser: User;
  initialAirports: Airport[];
  hasServerData: boolean;
  children: React.ReactNode;
};

/**
 * Main Airport Hub Provider
 * Orchestrates all domain-specific hooks and provides unified context
 */
export function AirportHubProvider({
  dbUser,
  initialAirports,
  hasServerData,
  children,
}: AirportHubProviderProps) {
  // Initialize loading and error states
  const { loading, setLoading, errors, setErrors, clearError, clearAllErrors, setUploadLoading } =
    useLoadingErrors(hasServerData);

  // Initialize cache management
  const {
    contractsCache,
    setContractsCache,
    documentsCache,
    setDocumentsCache,
    vendorContactsCache,
    setVendorContactsCache,
    cleanupCache,
    clearAllCaches,
  } = useCache();

  // Initialize airports management
  const {
    airports,
    setAirports,
    selectedAirport,
    setSelectedAirport,
    refreshAirports,
    updateAirport,
    addAirport,
    deleteAirport,
  } = useAirports({
    dbUser,
    initialAirports,
    hasServerData,
    setLoading,
    setErrors,
    contractsCache,
    vendorContactsCache,
  });

  // Initialize contracts management
  const {
    contracts,
    setContracts,
    selectedContract,
    setSelectedContract,
    refreshContracts,
    updateContract,
    addContract,
    removeContract,
  } = useContracts({
    selectedAirport,
    setLoading,
    setErrors,
    contractsCache,
    setContractsCache,
    cleanupCache,
  });

  // Initialize documents management
  const {
    documents,
    setDocuments,
    selectedDocument,
    setSelectedDocument,
    refreshDocuments,
    updateDocument,
    addDocument,
    removeDocument,
  } = useDocuments({
    selectedContract,
    setLoading,
    setErrors,
    documentsCache,
    setDocumentsCache,
    cleanupCache,
  });

  // Initialize vendor contacts management
  const {
    vendorContacts,
    setVendorContacts,
    selectedVendorContact,
    setSelectedVendorContact,
    refreshVendorContacts,
    updateVendorContact,
    addVendorContact,
    removeVendorContact,
  } = useVendorContacts({
    selectedAirport,
    setLoading,
    setErrors,
    vendorContactsCache,
    setVendorContactsCache,
    cleanupCache,
  });

  // Combine all values into unified context
  const value: AirportHubContextType = {
    // User
    dbUser,

    // Airports
    airports,
    setAirports,
    selectedAirport,
    setSelectedAirport,
    refreshAirports,
    updateAirport,
    addAirport,
    deleteAirport,

    // Contracts
    contracts,
    setContracts,
    selectedContract,
    setSelectedContract,
    refreshContracts,
    updateContract,
    addContract,
    removeContract,

    // Documents
    documents,
    setDocuments,
    selectedDocument,
    setSelectedDocument,
    refreshDocuments,
    updateDocument,
    addDocument,
    removeDocument,

    // Vendor Contacts
    vendorContacts,
    setVendorContacts,
    selectedVendorContact,
    setSelectedVendorContact,
    refreshVendorContacts,
    updateVendorContact,
    addVendorContact,
    removeVendorContact,

    // Loading and error states
    loading,
    errors,
    clearError,
    clearAllErrors,
    setUploadLoading,

    // Cache management
    clearAllCaches,
  };

  return <AirportHubContext.Provider value={value}>{children}</AirportHubContext.Provider>;
}

/**
 * Hook to access Airport Hub context
 * Must be used within AirportHubProvider
 */
export function useAirportHub() {
  const context = useContext(AirportHubContext);
  if (!context) {
    throw new Error('useAirportHub must be used within a AirportHubProvider');
  }
  return context;
}
