'use client';

import { Airport, Contact, Contract, User } from '@/drizzle/types';
import { server as contractServer } from '@/modules/contracts/contracts';
import { server as airportServer } from '@/modules/core/airports';
import { server as contactServer } from '@/modules/vendors/contacts';
import { createContext, useCallback, useContext, useEffect, useState } from 'react';

export type LoadingState = {
  airports: boolean;
  contracts: boolean;
  contacts: boolean;
  isRefreshing: boolean; // Indicates if current loading is from a refresh action
};

export type ErrorState = {
  airports: string | null;
  contracts: string | null;
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
  removeAirport: (airportId: Airport['id']) => void;

  // Contracts
  contracts: Contract[];
  setContracts: (contracts: Contract[]) => void;
  selectedContract: Contract | null;
  setSelectedContract: (contract: Contract | null) => void;
  refreshContracts: () => Promise<void>;
  updateContract: (updatedContract: Contract) => void;
  addContract: (newContract: Contract) => void;
  removeContract: (contractId: Contract['id']) => void;

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
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);

  // Cache to avoid refetching contracts for the same airport
  const [contractsCache, setContractsCache] = useState<Record<string, Contract[]>>({});

  // Cache to avoid refetching contacts for the same airport
  const [contactsCache, setContactsCache] = useState<Record<string, Contact[]>>({});

  // Loading states
  const [loading, setLoading] = useState<LoadingState>({
    airports: false,
    contracts: false,
    contacts: false,
    isRefreshing: false,
  });

  // Error states
  const [errors, setErrors] = useState<ErrorState>({
    airports: null,
    contracts: null,
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
        const contracts = await contractServer.listContractsByAirport(selectedAirport.id);
        setContracts(contracts);

        // Cache the service contracts for this airport
        setContractsCache((prev) => ({
          ...prev,
          [selectedAirport.id]: contracts,
        }));

        // Always set first contract as selected when loading contracts for a new airport
        setSelectedContract(contracts.length > 0 ? contracts[0] : null);
      } catch (error) {
        console.error('Error loading service contracts:', error);
        setErrors((prev) => ({
          ...prev,
          contracts: error instanceof Error ? error.message : 'Failed to load service contracts',
        }));
        setContracts([]);
        setSelectedContract(null);
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
        const contacts = await contactServer.listContactsByVendor(selectedAirport.id);
        setContacts(contacts);

        // Cache the contacts for this airport
        setContactsCache((prev) => ({
          ...prev,
          [selectedAirport.id]: contacts,
        }));

        // Always set first contact as selected when loading contacts for a new airport
        setSelectedContact(contacts.length > 0 ? contacts[0] : null);
      } catch (error) {
        console.error('Error loading contacts:', error);
        setErrors((prev) => ({
          ...prev,
          contacts: error instanceof Error ? error.message : 'Failed to load contacts',
        }));
        setContacts([]);
        setSelectedContact(null);
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
      const freshAirports = await airportServer.listAirportsByOrgId(dbUser.orgId);
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
      const contracts = await contractServer.listContractsByAirport(selectedAirport.id);
      setContracts(contracts);

      // Update cache with fresh data
      setContractsCache((prev) => ({
        ...prev,
        [selectedAirport.id]: contracts,
      }));

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
      setErrors((prev) => ({
        ...prev,
        contracts: error instanceof Error ? error.message : 'Failed to refresh service contracts',
      }));
    } finally {
      setLoading((prev) => ({ ...prev, contracts: false, isRefreshing: false }));
    }
  }, [selectedAirport, selectedContract]);

  /**
   * Select service contract by ID without refetching (instant selection)
   */
  const selectcontractById = useCallback(
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
      setAirports((prevAirports) => {
        const filteredAirports = prevAirports.filter((airport) => airport.id !== airportId);

        // If we're removing the currently selected airport, select the first available one
        if (selectedAirport?.id === airportId) {
          setSelectedAirport(filteredAirports.length > 0 ? filteredAirports[0] : null);
        }

        return filteredAirports;
      });
    },
    [selectedAirport],
  );

  /**
   * Update service contract
   */
  const updatecontract = useCallback(
    (updatedContract: Contract) => {
      setContracts((prevContracts) =>
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
   * Add service contract
   */
  const addContract = useCallback((newContract: Contract) => {
    setContracts((prevContracts) => [newContract, ...prevContracts]);
  }, []);

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
    },
    [selectedContract],
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
    },
    [selectedContract],
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
      const contacts = await contactServer.listContactsByVendor(selectedAirport.id);
      setContacts(contacts);

      // Update cache with fresh data
      setContactsCache((prev) => ({
        ...prev,
        [selectedAirport.id]: contacts,
      }));

      // Preserve the currently selected contact if it still exists, otherwise select first
      if (selectedContact) {
        const updatedSelectedContact = contacts.find((c) => c.id === selectedContact.id);
        setSelectedContact(updatedSelectedContact || (contacts.length > 0 ? contacts[0] : null));
      } else if (contacts.length > 0) {
        setSelectedContact(contacts[0]);
      }
    } catch (error) {
      console.error('Error refreshing contacts:', error);
      setErrors((prev) => ({
        ...prev,
        contacts: error instanceof Error ? error.message : 'Failed to refresh contacts',
      }));
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
        setContactsCache((prev) => ({
          ...prev,
          [selectedAirport.id]: [newContact, ...(prev[selectedAirport.id] || [])],
        }));
      }
    },
    [selectedAirport],
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
      contacts: null,
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
    contracts,
    setContracts,
    selectedContract,
    setSelectedContract,
    refreshContracts,
    updateContract,
    addContract,
    removeContract,
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
