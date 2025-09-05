'use client';

import { User } from '@/drizzle/types';
import { createContext, useContext } from 'react';
import { useContracts } from '../hooks/useContracts';
import { useFuelBids } from '../hooks/useFuelBids';
import { useFuelTenders } from '../hooks/useFuelTenders';
import { useInvoices } from '../hooks/useInvoices';
import { AirportProvider, useAirport } from './AirportContext';

type FuelProcurementContextType = {
  // User
  dbUser: User;

  // Airport context
  airports: ReturnType<typeof useAirport>;

  // Fuel tenders hook
  tenders: ReturnType<typeof useFuelTenders>;

  // Fuel bids hook
  fuelBids: ReturnType<typeof useFuelBids>;

  // Invoices hook
  invoices: ReturnType<typeof useInvoices>;
};

const FuelProcurementContext = createContext<FuelProcurementContextType | undefined>(undefined);

export function FuelProcurementProvider({
  dbUser,
  initialAirports,
  hasServerData,
  children,
}: {
  dbUser: User;
  initialAirports: any[];
  hasServerData: boolean;
  children: React.ReactNode;
}) {
  return (
    <AirportProvider initialAirports={initialAirports} hasServerData={hasServerData}>
      <FuelProcurementInnerProvider dbUser={dbUser} hasServerData={hasServerData}>
        {children}
      </FuelProcurementInnerProvider>
    </AirportProvider>
  );
}

function FuelProcurementInnerProvider({
  dbUser,
  hasServerData,
  children,
}: {
  dbUser: User;
  hasServerData: boolean;
  children: React.ReactNode;
}) {
  const airports = useAirport();
  const tenders = useFuelTenders({
    airportId: airports.selectedAirport?.id || null,
    enabled: !!airports.selectedAirport,
  });
  const fuelBids = useFuelBids({
    tenderId: tenders.selectedTender?.id || null,
    enabled: !!tenders.selectedTender,
  });
  const contracts = useContracts({
    airportId: airports.selectedAirport?.id || null,
    enabled: !!airports.selectedAirport,
  });
  const invoices = useInvoices({
    contractId: null, // This would be set based on selected contract
    enabled: false, // Disabled for now, can be enabled when contract selection is implemented
  });

  const value: FuelProcurementContextType = {
    dbUser,
    airports,
    tenders,
    fuelBids,
    invoices,
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
