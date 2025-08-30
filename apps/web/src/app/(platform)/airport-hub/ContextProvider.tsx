'use client';

import { Airport, Contact, ServiceContract, User } from '@/drizzle/types';
import { getServiceContractsByAirport } from '@/services/contracts/service-contract-client';
import { getAirports } from '@/services/core/airport-client';
import { getContactsByAirport } from '@/services/vendors/contact-client';
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

  // Contacts
  contacts: Contact[];
  setContacts: (contacts: Contact[]) => void;
  selectedContact: Contact | null;
  setSelectedContact: (contact: Contact | null) => void;

  // Refresh, Update, Add, Remove contacts
  refreshContacts: () => Promise<void>;
  updateContact: (updatedContact: Contact) => void;
  addContact: (newContact: Contact) => void;
  removeContact: (contactId: string) => void;

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
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);

  // Cache to avoid refetching service contracts for the same airport
  const [serviceContractsCache, setServiceContractsCache] = useState<
    Record<string, ServiceContract[]>
  >({});

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
   * Load contacts for the selected airport (only when airport changes)
   */
  useEffect(() => {
    if (!selectedAirport) {
      setContacts([]);
      setSelectedContact(null);
      return;
    }

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
        const contacts = await getContactsByAirport(selectedAirport.id);
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
  }, [selectedAirport, contactsCache]); // Depend on selectedAirport and contactsCache

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
      const contacts = await getContactsByAirport(selectedAirport.id);
      setContacts(contacts);

      // Update cache with fresh data
      setContactsCache((prev) => ({
        ...prev,
        [selectedAirport.id]: contacts,
      }));

      // Preserve the currently selected contact if it still exists, otherwise select first
      if (selectedContact) {
        const updatedSelectedContact = contacts.find((c: Contact) => c.id === selectedContact.id);
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
      setContacts((prevContacts) => prevContacts.filter((contact) => contact.id !== contactId));

      if (selectedContact?.id === contactId) {
        setSelectedContact(null);
      }

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
    serviceContracts,
    setServiceContracts,
    selectedServiceContract,
    setSelectedServiceContract,
    refreshServiceContracts,
    updateServiceContract,
    addServiceContract,
    removeServiceContract,
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
