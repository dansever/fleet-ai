'use client';

import { Airport, User } from '@/drizzle/types';
import { createContext, useContext, useState } from 'react';

export type FuelProcurementContextType = {
  // User and airports
  dbUser: User;
  airports: Airport[];
  refreshAirports: () => Promise<void>;

  // Selected airport
  selectedAirport: Airport | null;
  setSelectedAirport: (airport: Airport | null) => void;
};

const FuelProcurementContext = createContext<FuelProcurementContextType | undefined>(undefined);

export default function FuelProcurementProvider({
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
  const [airports, setAirports] = useState<Airport[]>(() => {
    const sortedAirports = [...initialAirports].sort((a, b) => {
      if (a.isHub && !b.isHub) return -1;
      if (!a.isHub && b.isHub) return 1;
      return a.name.localeCompare(b.name);
    });
    return sortedAirports;
  });
  const [selectedAirport, setSelectedAirport] = useState<Airport | null>(null);

  // const refreshAirports = useCallback(async () => {
  //   const airports = await getAirports();
  //   setAirports(airports);
  // }, []);

  // useEffect(() => {
  //   if (hasServerData) {
  //     refreshAirports();
  //   }
  // }, [hasServerData, refreshAirports]);

  const value: FuelProcurementContextType = {
    dbUser,
    airports,
    refreshAirports: async () => {
      console.log('refreshAirports');
    },
    selectedAirport,
    setSelectedAirport,
  };

  return (
    <FuelProcurementContext.Provider value={value}>{children}</FuelProcurementContext.Provider>
  );
}

export function useFuelProcurement() {
  const context = useContext(FuelProcurementContext);
  if (!context) {
    throw new Error('useFuelProcurement must be used within a FuelProcurementProvider');
  }
  return context;
}
