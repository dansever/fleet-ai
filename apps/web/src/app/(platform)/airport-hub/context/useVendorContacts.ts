import { Airport, VendorContact } from '@/drizzle/types';
import { client as vendorContactClient } from '@/modules/vendors/vendor-contacts';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { ErrorState, LoadingState } from './types';

type UseVendorContactsProps = {
  selectedAirport: Airport | null;
  setLoading: React.Dispatch<React.SetStateAction<LoadingState>>;
  setErrors: React.Dispatch<React.SetStateAction<ErrorState>>;
  vendorContactsCache: Record<string, VendorContact[]>;
  setVendorContactsCache: React.Dispatch<React.SetStateAction<Record<string, VendorContact[]>>>;
  cleanupCache: <T>(cache: Record<string, T>, currentItemId?: string) => Record<string, T>;
};

/**
 * Hook for managing vendor contacts state and operations
 */
export function useVendorContacts({
  selectedAirport,
  setLoading,
  setErrors,
  vendorContactsCache,
  setVendorContactsCache,
  cleanupCache,
}: UseVendorContactsProps) {
  const [vendorContacts, setVendorContacts] = useState<VendorContact[]>([]);
  const [selectedVendorContact, setSelectedVendorContact] = useState<VendorContact | null>(null);

  /**
   * Load contacts for the selected airport (only when airport changes)
   */
  useEffect(() => {
    if (!selectedAirport) {
      setVendorContacts([]);
      setSelectedVendorContact(null);
      return;
    }

    // Immediately clear contacts when switching airports to prevent stale data
    setVendorContacts([]);
    setSelectedVendorContact(null);

    const loadContacts = async () => {
      // Check cache first
      if (vendorContactsCache[selectedAirport.id] !== undefined) {
        const cachedContacts = vendorContactsCache[selectedAirport.id];
        setVendorContacts(cachedContacts);
        setSelectedVendorContact(cachedContacts.length > 0 ? cachedContacts[0] : null);
        // Ensure loading state is cleared when loading from cache
        setLoading((prev) => ({ ...prev, vendorContacts: false, isRefreshing: false }));
        console.log(
          `Loaded ${cachedContacts.length} vendor contacts from cache for airport ${selectedAirport.id}`,
        );
        return;
      }

      setLoading((prev) => ({ ...prev, vendorContacts: true, isRefreshing: false }));
      setErrors((prev) => ({ ...prev, vendorContacts: null }));

      try {
        const contacts = await vendorContactClient.listVendorContactsByVendor(selectedAirport.id);
        setVendorContacts(contacts);

        // Cache the contacts for this airport
        setVendorContactsCache((prev) => {
          const updated = {
            ...prev,
            [selectedAirport.id]: contacts,
          };
          return cleanupCache(updated, selectedAirport.id);
        });

        // Always set first contact as selected when loading contacts for a new airport
        setSelectedVendorContact(contacts.length > 0 ? contacts[0] : null);
      } catch (error) {
        console.error('Error loading contacts:', error);
        const errorMessage = error instanceof Error ? error.message : 'Failed to load contacts';
        setErrors((prev) => ({
          ...prev,
          vendorContacts: errorMessage,
        }));
        setVendorContacts([]);
        setSelectedVendorContact(null);

        // Show user-friendly toast notification
        toast.error(`Failed to load contacts: ${errorMessage}`);
      } finally {
        setLoading((prev) => ({ ...prev, vendorContacts: false, isRefreshing: false }));
      }
    };

    loadContacts();
  }, [
    selectedAirport,
    cleanupCache,
    setLoading,
    setErrors,
    vendorContactsCache,
    setVendorContactsCache,
  ]);

  /**
   * Refresh contacts for the currently selected airport (clears cache)
   */
  const refreshVendorContacts = useCallback(async () => {
    if (!selectedAirport) return;

    // Clear cache for this airport to force fresh data
    setVendorContactsCache((prev) => {
      const updated = { ...prev };
      delete updated[selectedAirport.id];
      return updated;
    });

    setLoading((prev) => ({ ...prev, vendorContacts: true, isRefreshing: true }));
    setErrors((prev) => ({ ...prev, vendorContacts: null }));

    try {
      const contacts = await vendorContactClient.listVendorContactsByVendor(selectedAirport.id);
      setVendorContacts(contacts);

      // Update cache with fresh data
      setVendorContactsCache((prev) => {
        const updated = {
          ...prev,
          [selectedAirport.id]: contacts,
        };
        return cleanupCache(updated, selectedAirport.id);
      });

      // Preserve the currently selected contact if it still exists, otherwise select first
      if (selectedVendorContact) {
        const updatedSelectedContact = contacts.find((c) => c.id === selectedVendorContact.id);
        setSelectedVendorContact(
          updatedSelectedContact || (contacts.length > 0 ? contacts[0] : null),
        );
      } else if (contacts.length > 0) {
        setSelectedVendorContact(contacts[0]);
      }
    } catch (error) {
      console.error('Error refreshing contacts:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to refresh contacts';
      setErrors((prev) => ({
        ...prev,
        vendorContacts: errorMessage,
      }));

      // Show user-friendly toast notification
      toast.error(`Failed to refresh contacts: ${errorMessage}`);
    } finally {
      setLoading((prev) => ({ ...prev, vendorContacts: false, isRefreshing: false }));
    }
  }, [
    selectedAirport,
    selectedVendorContact,
    setLoading,
    setErrors,
    setVendorContactsCache,
    cleanupCache,
  ]);

  /**
   * Update vendor contact in state and cache
   */
  const updateVendorContact = useCallback(
    (updatedVendorContact: VendorContact) => {
      setVendorContacts((prevContacts) =>
        prevContacts.map((vendorContact) =>
          vendorContact.id === updatedVendorContact.id ? updatedVendorContact : vendorContact,
        ),
      );

      if (selectedVendorContact?.id === updatedVendorContact.id) {
        setSelectedVendorContact(updatedVendorContact);
      }

      // Update cache as well
      if (selectedAirport) {
        setVendorContactsCache((prev) => ({
          ...prev,
          [selectedAirport.id]:
            prev[selectedAirport.id]?.map((contact) =>
              contact.id === updatedVendorContact.id ? updatedVendorContact : contact,
            ) || [],
        }));
      }
    },
    [selectedVendorContact, selectedAirport, setVendorContactsCache],
  );

  /**
   * Add vendor contact to state and cache
   */
  const addVendorContact = useCallback(
    (newVendorContact: VendorContact) => {
      setVendorContacts((prevContacts) => [newVendorContact, ...prevContacts]);

      // Update cache as well
      if (selectedAirport) {
        setVendorContactsCache((prev) => {
          const updated = {
            ...prev,
            [selectedAirport.id]: [newVendorContact, ...(prev[selectedAirport.id] || [])],
          };
          return cleanupCache(updated, selectedAirport.id);
        });
      }
    },
    [selectedAirport, cleanupCache, setVendorContactsCache],
  );

  /**
   * Remove vendor contact from state and cache
   */
  const removeVendorContact = useCallback(
    (vendorContactId: string) => {
      setVendorContacts((prevContacts) => {
        const filteredContacts = prevContacts.filter((contact) => contact.id !== vendorContactId);

        // If we're removing the currently selected contact, select the first available one
        if (selectedVendorContact?.id === vendorContactId) {
          setSelectedVendorContact(filteredContacts.length > 0 ? filteredContacts[0] : null);
        }

        return filteredContacts;
      });

      // Update cache as well
      if (selectedAirport) {
        setVendorContactsCache((prev) => ({
          ...prev,
          [selectedAirport.id]:
            prev[selectedAirport.id]?.filter((contact) => contact.id !== vendorContactId) || [],
        }));
      }
    },
    [selectedVendorContact, selectedAirport, setVendorContactsCache],
  );

  return {
    vendorContacts,
    setVendorContacts,
    selectedVendorContact,
    setSelectedVendorContact,
    refreshVendorContacts,
    updateVendorContact,
    addVendorContact,
    removeVendorContact,
  };
}
