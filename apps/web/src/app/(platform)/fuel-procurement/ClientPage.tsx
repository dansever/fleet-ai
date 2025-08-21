'use client';

import { useSidebar } from '@/components/ui/sidebar';
import { PageLayout } from '@/stories/PageLayout/PageLayout';
import AirportList from '../_components/AirportList';
import { useFuelProcurement } from './ContextProvider';

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
      headerContent={<div>Client Page</div>}
      mainContent={<div>{isCollapsed ? 'Collapsed' : 'Expanded'}</div>}
      sidebarWidth={isCollapsed ? '20rem' : '18rem'}
    />
  );
}
