'use client';

import { useSidebar } from '@/components/ui/sidebar';
import { PageLayout } from '@/stories/PageLayout/PageLayout';
import AirportList from '../_components/AirportList';
import { useFuelProcurement } from './ContextProvider';
import FuelTendersPage from './subpages/FuelTenders';

export default function FuelProcurementClientPage() {
  const { airports, selectedAirport, setSelectedAirport } = useFuelProcurement();
  const { state } = useSidebar();
  const isCollapsed = state === 'collapsed';

  return (
    <PageLayout
      sidebarContent={
        <AirportList
          airports={airports}
          onAirportSelect={setSelectedAirport}
          selectedAirport={selectedAirport}
          InsertAddAirportButton={false}
        />
      }
      headerContent={<h2>{selectedAirport?.name}</h2>}
      mainContent={<FuelTendersPage />}
      sidebarWidth={isCollapsed ? '20rem' : '18rem'}
    />
  );
}
