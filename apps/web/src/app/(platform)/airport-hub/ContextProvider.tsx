'use client';

import { Airport, Contact, Contract, Document, User } from '@/drizzle/types';
import { client as contractClient } from '@/modules/contracts';
import { client as airportClient } from '@/modules/core/airports';
import { client as documentClient } from '@/modules/documents';
import { client as contactClient } from '@/modules/vendors/vendor-contacts';
import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { toast } from 'sonner';

export type LoadingState = {
  airports: boolean;
  contracts: boolean;
  documents: boolean;
  contacts: boolean;
  isRefreshing: boolean; // Indicates if current loading is from a refresh action
};

export type ErrorState = {
  airports: string | null;
  contracts: string | null;
  documents: string | null;
  contacts: string | null;
  general: string | null;
};

export type AirportHubContextType = {
  // User
  dbUser: User;

  // Airports
  airports: Airport[];
  setAirports: (airports: Airport[]) => void;
  selectedAirport: Airport | null;
  setSelectedAirport: (airport: Airport | null) => void;
  refreshAirports: () => Promise<void>;
  updateAirport: (updatedAirport: Airport) => void;
  addAirport: (newAirport: Airport) => void;
  deleteAirport: (airportId: Airport['id']) => Promise<void>;

  // Contracts
  contracts: Contract[];
  setContracts: (contracts: Contract[]) => void;
  selectedContract: Contract | null;
  setSelectedContract: (contract: Contract | null) => void;
  refreshContracts: () => Promise<void>;
  updateContract: (updatedContract: Contract) => void;
  addContract: (newContract: Contract) => void;
  removeContract: (contractId: Contract['id']) => void;

  // Documents
  documents: Document[];
  setDocuments: (documents: Document[]) => void;
  selectedDocument: Document | null;
  setSelectedDocument: (document: Document | null) => void;
  refreshDocuments: () => Promise<void>;
  updateDocument: (updatedDocument: Document) => void;
  addDocument: (newDocument: Document) => void;
  removeDocument: (documentId: Document['id']) => void;

  // Contacts
  contacts: Contact[];
  setContacts: (contacts: Contact[]) => void;
  selectedContact: Contact | null;
  setSelectedContact: (contact: Contact | null) => void;
  refreshContacts: () => Promise<void>;
  updateContact: (updatedContact: Contact) => void;
  addContact: (newContact: Contact) => void;
  removeContact: (contactId: Contact['id']) => void;

  // Loading and error states
  loading: LoadingState;
  errors: ErrorState;
  clearError: (errorType: keyof ErrorState) => void;
  clearAllErrors: () => void;

  // Cache management
  clearAllCaches: () => void;
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
  // Airports
  const [airports, setAirports] = useState<Airport[]>(initialAirports);
  const [selectedAirport, setSelectedAirportState] = useState<Airport | null>(null);

  // Contracts
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);
  const [contractsCache, setContractsCache] = useState<Record<string, Contract[]>>({});

  // Documents
  const [documents, setDocuments] = useState<Document[]>([]);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [documentsCache, setDocumentsCache] = useState<Record<string, Document[]>>({});

  // Contacts
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [contactsCache, setContactsCache] = useState<Record<string, Contact[]>>({});

  // Cache cleanup configuration
  const MAX_CACHE_SIZE = 20; // Maximum number of airports to cache
  const CACHE_CLEANUP_THRESHOLD = 40; // Start cleanup when we reach this many cached items

  // Loading states
  const [loading, setLoading] = useState<LoadingState>({
    airports: !hasServerData, // Start with true if no server data provided
    contracts: false,
    documents: false,
    contacts: false,
    isRefreshing: false,
  });

  // Error states
  const [errors, setErrors] = useState<ErrorState>({
    airports: null,
    contracts: null,
    documents: null,
    contacts: null,
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
   * Clean up cache when it gets too large to prevent memory issues during long sessions
   */
  const cleanupCache = useCallback(
    <T,>(cache: Record<string, T>, currentAirportId?: string): Record<string, T> => {
      const cacheKeys = Object.keys(cache);

      if (cacheKeys.length <= CACHE_CLEANUP_THRESHOLD) {
        return cache;
      }

      // Always keep the current airport's cache
      const keysToKeep = currentAirportId ? [currentAirportId] : [];

      // Keep the most recently accessed airports (approximate by keeping current selection)
      const remainingSlots = MAX_CACHE_SIZE - keysToKeep.length;
      const keysToRemove = cacheKeys.filter((key) => !keysToKeep.includes(key));

      // Remove oldest entries (simple approach - remove from beginning of keys array)
      const keysToDelete = keysToRemove.slice(0, Math.max(0, keysToRemove.length - remainingSlots));

      const cleanedCache = { ...cache };
      keysToDelete.forEach((key) => {
        delete cleanedCache[key];
      });

      console.log(
        `Cache cleanup: Removed ${keysToDelete.length} entries, ${Object.keys(cleanedCache).length} remaining`,
      );
      return cleanedCache;
    },
    [MAX_CACHE_SIZE, CACHE_CLEANUP_THRESHOLD],
  );

  /**
   * Cleanup both caches periodically
   */
  const performCacheCleanup = useCallback(() => {
    setContractsCache((prev) => cleanupCache(prev, selectedAirport?.id));
    setContactsCache((prev) => cleanupCache(prev, selectedAirport?.id));
  }, [cleanupCache, selectedAirport?.id]);

  /**
   * Manually clear all caches (useful for troubleshooting or memory management)
   */
  const clearAllCaches = useCallback(() => {
    setContractsCache({});
    setContactsCache({});
    console.log('All caches cleared manually');
    toast.success('Cache cleared successfully');
  }, []);

  /**
   * Sort airports on initial load and set first as selected
   */
  useEffect(() => {
    const sortedAirports = sortAirports(initialAirports);
    setAirports(sortedAirports);

    // Always set first airport as selected on initial load
    if (sortedAirports.length > 0) {
      setSelectedAirportState(sortedAirports[0]);
    }

    // Set airports loading to false after initial processing
    if (hasServerData) {
      setLoading((prev) => ({ ...prev, airports: false }));
    }
  }, [initialAirports, sortAirports, hasServerData]);

  /**
   * Periodic cache cleanup to prevent memory issues during long sessions
   */
  useEffect(() => {
    const cleanupInterval = setInterval(
      () => {
        performCacheCleanup();
      },
      5 * 60 * 1000,
    ); // Cleanup every 5 minutes

    // Optional: Log cache statistics for monitoring
    const statsInterval = setInterval(
      () => {
        const contractsCacheSize = Object.keys(contractsCache).length;
        const contactsCacheSize = Object.keys(contactsCache).length;

        if (contractsCacheSize > 20 || contactsCacheSize > 20) {
          console.log(
            `Cache stats - Contracts: ${contractsCacheSize}, Contacts: ${contactsCacheSize}`,
          );
        }
      },
      2 * 60 * 1000,
    ); // Log every 2 minutes if caches are getting large

    return () => {
      clearInterval(cleanupInterval);
      clearInterval(statsInterval);
    };
  }, [performCacheCleanup, contractsCache, contactsCache]);

  /**
   * Load service contracts for the selected airport (only when airport changes)
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
      if (contractsCache[selectedAirport.id]) {
        const cachedContracts = contractsCache[selectedAirport.id];
        setContracts(cachedContracts);
        setSelectedContract(cachedContracts.length > 0 ? cachedContracts[0] : null);
        return;
      }

      setLoading((prev) => ({ ...prev, contracts: true, isRefreshing: false }));
      setErrors((prev) => ({ ...prev, contracts: null }));

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
  }, [selectedAirport]); // Remove contractsCache dependency to avoid unnecessary re-runs

  /**
   * Load contacts for the selected airport (only when airport changes)
   */
  useEffect(() => {
    if (!selectedAirport) {
      setContacts([]);
      setSelectedContact(null);
      return;
    }

    // Immediately clear contacts when switching airports to prevent stale data
    setContacts([]);
    setSelectedContact(null);

    const loadContacts = async () => {
      // Check cache first
      if (contactsCache[selectedAirport.id]) {
        const cachedContacts = contactsCache[selectedAirport.id];
        setContacts(cachedContacts);
        setSelectedContact(cachedContacts.length > 0 ? cachedContacts[0] : null);
        return;
      }

      setLoading((prev) => ({ ...prev, contacts: true, isRefreshing: false }));
      setErrors((prev) => ({ ...prev, contacts: null }));

      try {
        const contacts = await contactClient.listContactsByVendor(selectedAirport.id);
        setContacts(contacts);

        // Cache the contacts for this airport
        setContactsCache((prev) => {
          const updated = {
            ...prev,
            [selectedAirport.id]: contacts,
          };
          return cleanupCache(updated, selectedAirport.id);
        });

        // Always set first contact as selected when loading contacts for a new airport
        setSelectedContact(contacts.length > 0 ? contacts[0] : null);
      } catch (error) {
        console.error('Error loading contacts:', error);
        const errorMessage = error instanceof Error ? error.message : 'Failed to load contacts';
        setErrors((prev) => ({
          ...prev,
          contacts: errorMessage,
        }));
        setContacts([]);
        setSelectedContact(null);

        // Show user-friendly toast notification
        toast.error(`Failed to load contacts: ${errorMessage}`);
      } finally {
        setLoading((prev) => ({ ...prev, contacts: false, isRefreshing: false }));
      }
    };

    loadContacts();
  }, [selectedAirport]); // Remove contactsCache dependency to avoid unnecessary re-runs

  /**
   * Refresh airports
   */
  const refreshAirports = useCallback(async () => {
    if (!dbUser.orgId) return;

    setLoading((prev) => ({ ...prev, airports: true }));
    setErrors((prev) => ({ ...prev, airports: null }));

    try {
      const freshAirports = await airportClient.listAirports();
      const sortedAirports = sortAirports(freshAirports);
      setAirports(sortedAirports);

      // Update selected airport if it still exists
      if (selectedAirport) {
        const updatedSelectedAirport = sortedAirports.find((a) => a.id === selectedAirport.id);
        if (updatedSelectedAirport) {
          setSelectedAirportState(updatedSelectedAirport);
        } else {
          // Selected airport was deleted, select first available
          setSelectedAirportState(sortedAirports[0] || null);
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
  }, [selectedAirport, selectedContract]);

  /**
   * Select service contract by ID without refetching (instant selection)
   */
  const selectContractById = useCallback(
    (contractId: string) => {
      const contract = contracts.find((c) => c.id === contractId);
      if (contract) {
        setSelectedContract(contract);
      }
    },
    [contracts],
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
        setSelectedAirportState(updatedAirport);
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
   * Delete airport
   */
  const deleteAirport = useCallback(
    async (airportId: string) => {
      try {
        // Delete from the server
        await airportClient.deleteAirport(airportId);

        // Remove from local state
        setAirports((prevAirports) => {
          const filteredAirports = prevAirports.filter((airport) => airport.id !== airportId);

          // If we're deleting the currently selected airport, select the first available one
          if (selectedAirport?.id === airportId) {
            setSelectedAirportState(filteredAirports.length > 0 ? filteredAirports[0] : null);
          }

          return filteredAirports;
        });

        toast.success('Airport deleted successfully');
      } catch (error) {
        console.error('Failed to delete airport:', error);
        toast.error('Failed to delete airport');
        throw error; // Re-throw so the UI can handle the error
      }
    },
    [selectedAirport],
  );

  /**
   * Add service contract
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
    [selectedAirport, cleanupCache],
  );

  /**
   * Remove service contract
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
    [selectedContract, selectedAirport],
  );

  /**
   * Update service contract
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
    [selectedContract, selectedAirport],
  );

  /**
   * Refresh contacts for the currently selected airport (clears cache)
   */
  const refreshContacts = useCallback(async () => {
    if (!selectedAirport) return;

    // Clear cache for this airport to force fresh data
    setContactsCache((prev) => {
      const updated = { ...prev };
      delete updated[selectedAirport.id];
      return updated;
    });

    setLoading((prev) => ({ ...prev, contacts: true, isRefreshing: true }));
    setErrors((prev) => ({ ...prev, contacts: null }));

    try {
      const contacts = await contactClient.listContactsByVendor(selectedAirport.id);
      setContacts(contacts);

      // Update cache with fresh data
      setContactsCache((prev) => {
        const updated = {
          ...prev,
          [selectedAirport.id]: contacts,
        };
        return cleanupCache(updated, selectedAirport.id);
      });

      // Preserve the currently selected contact if it still exists, otherwise select first
      if (selectedContact) {
        const updatedSelectedContact = contacts.find((c) => c.id === selectedContact.id);
        setSelectedContact(updatedSelectedContact || (contacts.length > 0 ? contacts[0] : null));
      } else if (contacts.length > 0) {
        setSelectedContact(contacts[0]);
      }
    } catch (error) {
      console.error('Error refreshing contacts:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to refresh contacts';
      setErrors((prev) => ({
        ...prev,
        contacts: errorMessage,
      }));

      // Show user-friendly toast notification
      toast.error(`Failed to refresh contacts: ${errorMessage}`);
    } finally {
      setLoading((prev) => ({ ...prev, contacts: false, isRefreshing: false }));
    }
  }, [selectedAirport, selectedContact]);

  /**
   * Update contact
   */
  const updateContact = useCallback(
    (updatedContact: Contact) => {
      setContacts((prevContacts) =>
        prevContacts.map((contact) =>
          contact.id === updatedContact.id ? updatedContact : contact,
        ),
      );

      if (selectedContact?.id === updatedContact.id) {
        setSelectedContact(updatedContact);
      }

      // Update cache as well
      if (selectedAirport) {
        setContactsCache((prev) => ({
          ...prev,
          [selectedAirport.id]:
            prev[selectedAirport.id]?.map((contact) =>
              contact.id === updatedContact.id ? updatedContact : contact,
            ) || [],
        }));
      }
    },
    [selectedContact, selectedAirport],
  );

  /**
   * Add contact
   */
  const addContact = useCallback(
    (newContact: Contact) => {
      setContacts((prevContacts) => [newContact, ...prevContacts]);

      // Update cache as well
      if (selectedAirport) {
        setContactsCache((prev) => {
          const updated = {
            ...prev,
            [selectedAirport.id]: [newContact, ...(prev[selectedAirport.id] || [])],
          };
          return cleanupCache(updated, selectedAirport.id);
        });
      }
    },
    [selectedAirport, cleanupCache],
  );

  /**
   * Remove contact
   */
  const removeContact = useCallback(
    (contactId: string) => {
      setContacts((prevContacts) => {
        const filteredContacts = prevContacts.filter((contact) => contact.id !== contactId);

        // If we're removing the currently selected contact, select the first available one
        if (selectedContact?.id === contactId) {
          setSelectedContact(filteredContacts.length > 0 ? filteredContacts[0] : null);
        }

        return filteredContacts;
      });

      // Update cache as well
      if (selectedAirport) {
        setContactsCache((prev) => ({
          ...prev,
          [selectedAirport.id]:
            prev[selectedAirport.id]?.filter((contact) => contact.id !== contactId) || [],
        }));
      }
    },
    [selectedContact, selectedAirport],
  );

  /**
   * Refresh documents for the currently selected contract (clears cache)
   */
  const refreshDocuments = useCallback(async () => {
    if (!selectedContract) return;

    // Clear cache for this contract to force fresh data
    setDocumentsCache((prev) => {
      const updated = { ...prev };
      delete updated[selectedContract.id];
      return updated;
    });

    setLoading((prev) => ({ ...prev, documents: true, isRefreshing: true }));
    setErrors((prev) => ({ ...prev, documents: null }));

    try {
      const documents = await documentClient.listDocumentsByContract(selectedContract.id);
      // setDocuments(documents);
    } catch (error) {
      console.error('Error refreshing documents:', error);
    }
  }, [selectedContract]);

  /**
   * Update document
   */
  const updateDocument = useCallback((updatedDocument: Document) => {
    setDocuments((prevDocuments) =>
      prevDocuments.map((document) =>
        document.id === updatedDocument.id ? updatedDocument : document,
      ),
    );
  }, []);

  /**
   * Add document
   */
  const addDocument = useCallback((newDocument: Document) => {
    setDocuments((prevDocuments) => [newDocument, ...prevDocuments]);
  }, []);

  /**
   * Remove document
   */
  const removeDocument = useCallback((documentId: string) => {
    setDocuments((prevDocuments) => prevDocuments.filter((document) => document.id !== documentId));
  }, []);

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
      documents: null,
      contacts: null,
      general: null,
    });
  }, []);

  /**
   * Custom setSelectedAirport that provides instant UI updates
   */
  const setSelectedAirport = useCallback(
    (airport: Airport | null) => {
      // Immediately update the selected airport for instant UI feedback
      setSelectedAirportState(airport);

      if (airport) {
        // Set loading states for content that will need to be fetched
        setLoading((prev) => ({
          ...prev,
          contracts: !contractsCache[airport.id], // Only set loading if not cached
          contacts: !contactsCache[airport.id], // Only set loading if not cached
          isRefreshing: false,
        }));
      }
    },
    [contractsCache, contactsCache],
  );

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
    deleteAirport,
    selectedAirport,
    setSelectedAirport,
    contracts,
    setContracts,
    selectedContract,
    setSelectedContract,
    refreshContracts,
    updateContract,
    addContract,
    removeContract,
    documents,
    setDocuments,
    selectedDocument,
    setSelectedDocument,
    refreshDocuments,
    updateDocument,
    addDocument,
    removeDocument,
    contacts,
    setContacts,
    selectedContact,
    setSelectedContact,
    refreshContacts,
    updateContact,
    addContact,
    removeContact,
    loading,
    errors,
    clearError,
    clearAllErrors,
    clearAllCaches,
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
