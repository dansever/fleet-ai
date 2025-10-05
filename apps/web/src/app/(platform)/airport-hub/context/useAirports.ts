import { Airport, User } from '@/drizzle/types';
import { client as airportClient } from '@/modules/core/airports';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { ErrorState, LoadingState } from './types';

type UseAirportsProps = {
  dbUser: User;
  initialAirports: Airport[];
  hasServerData: boolean;
  setLoading: React.Dispatch<React.SetStateAction<LoadingState>>;
  setErrors: React.Dispatch<React.SetStateAction<ErrorState>>;
  contractsCache: Record<string, any[]>;
  vendorContactsCache: Record<string, any[]>;
};

/**
 * Hook for managing airports state and operations
 */
export function useAirports({
  dbUser,
  initialAirports,
  hasServerData,
  setLoading,
  setErrors,
  contractsCache,
  vendorContactsCache,
}: UseAirportsProps) {
  const [airports, setAirports] = useState<Airport[]>(initialAirports);
  const [selectedAirport, setSelectedAirportState] = useState<Airport | null>(null);

  /**
   * Sort airports helper - hubs first, then alphabetically
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
      setSelectedAirportState(sortedAirports[0]);
    }

    // Set airports loading to false after initial processing
    if (hasServerData) {
      setLoading((prev) => ({ ...prev, airports: false }));
    }
  }, [initialAirports, sortAirports, hasServerData, setLoading]);

  /**
   * Refresh airports from server
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
  }, [dbUser.orgId, selectedAirport, sortAirports, setLoading, setErrors]);

  /**
   * Update airport in state
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
   * Add new airport to state
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
   * Delete airport from server and state
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
   * Custom setSelectedAirport that provides instant UI updates
   * and sets loading states for content that will need to be fetched
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
          vendorContacts: !vendorContactsCache[airport.id], // Only set loading if not cached
          documents: false, // Documents will be loaded when contract is selected
          isRefreshing: false,
        }));
      }
    },
    [contractsCache, vendorContactsCache, setLoading],
  );

  return {
    airports,
    setAirports,
    selectedAirport,
    setSelectedAirport,
    refreshAirports,
    updateAirport,
    addAirport,
    deleteAirport,
    sortAirports,
  };
}
