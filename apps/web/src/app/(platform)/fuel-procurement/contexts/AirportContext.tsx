'use client';

import { Airport } from '@/drizzle/types';
import { getAirports } from '@/services/core/airport-client';
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

type AirportContextType = {
  airports: Airport[];
  selectedAirport: Airport | null;
  loading: boolean;
  error: string | null;
  setSelectedAirport: (airport: Airport | null) => void;
  refreshAirports: () => Promise<void>;
  updateAirport: (updatedAirport: Airport) => void;
  addAirport: (newAirport: Airport) => void;
  removeAirport: (airportId: string) => void;
};

const AirportContext = createContext<AirportContextType | undefined>(undefined);

export function AirportProvider({
  initialAirports,
  hasServerData,
  children,
}: {
  initialAirports: Airport[];
  hasServerData: boolean;
  children: React.ReactNode;
}) {
  const [airports, setAirports] = useState<Airport[]>(initialAirports);
  const [selectedAirport, setSelectedAirport] = useState<Airport | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sortAirports = useCallback((airportsToSort: Airport[]) => {
    return [...airportsToSort].sort((a, b) => {
      if (a.isHub && !b.isHub) return -1;
      if (!a.isHub && b.isHub) return 1;
      return a.name.localeCompare(b.name);
    });
  }, []);

  // Initialize airports and select first one
  useEffect(() => {
    const sortedAirports = sortAirports(initialAirports);
    setAirports(sortedAirports);
    if (sortedAirports.length > 0) {
      setSelectedAirport(sortedAirports[0]);
    }
  }, [initialAirports, sortAirports]);

  const refreshAirports = useCallback(async () => {
    setLoading(true);
    setError(null);
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
          setSelectedAirport(sortedAirports[0] || null);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to refresh airports');
    } finally {
      setLoading(false);
    }
  }, [selectedAirport, sortAirports]);

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

  const addAirport = useCallback(
    (newAirport: Airport) => {
      setAirports((prevAirports) => {
        const updated = [...prevAirports, newAirport];
        return sortAirports(updated);
      });
    },
    [sortAirports],
  );

  const removeAirport = useCallback(
    (airportId: string) => {
      setAirports((prevAirports) => prevAirports.filter((airport) => airport.id !== airportId));

      if (selectedAirport?.id === airportId) {
        setSelectedAirport(airports.find((a) => a.id !== airportId) || null);
      }
    },
    [selectedAirport, airports],
  );

  const value = useMemo(
    () => ({
      airports,
      selectedAirport,
      loading,
      error,
      setSelectedAirport,
      refreshAirports,
      updateAirport,
      addAirport,
      removeAirport,
    }),
    [
      airports,
      selectedAirport,
      loading,
      error,
      refreshAirports,
      updateAirport,
      addAirport,
      removeAirport,
    ],
  );

  return <AirportContext.Provider value={value}>{children}</AirportContext.Provider>;
}

export function useAirport() {
  const context = useContext(AirportContext);
  if (!context) {
    throw new Error('useAirport must be used within an AirportProvider');
  }
  return context;
}
