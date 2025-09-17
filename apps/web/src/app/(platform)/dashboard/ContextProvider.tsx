'use client';

import { Airport, Rfq, User } from '@/drizzle/types';
import { createContext, ReactNode, useContext } from 'react';

interface DashboardContextType {
  user: User;
  airports: Airport[];
  rfqs: Rfq[];
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

interface DashboardContextProviderProps {
  children: ReactNode;
  user: User;
  airports: Airport[];
  rfqs: Rfq[];
}

export function DashboardContextProvider({
  children,
  user,
  airports,
  rfqs,
}: DashboardContextProviderProps) {
  return (
    <DashboardContext.Provider value={{ user, airports, rfqs }}>
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboardContext() {
  const context = useContext(DashboardContext);
  if (context === undefined) {
    throw new Error('useDashboardContext must be used within a DashboardContextProvider');
  }
  return context;
}
