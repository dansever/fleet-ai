'use client';

import { useSidebar } from '@/components/ui/sidebar';
import { TabsContent } from '@/components/ui/tabs';
import { PageLayout } from '@/stories/PageLayout/PageLayout';
import { Tabs } from '@/stories/Tabs/Tabs';
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
      mainContent={<AirportContentPage />}
      sidebarWidth={isCollapsed ? '20rem' : '18rem'}
    />
  );
}

function AirportContentPage() {
  return (
    <div>
      <Tabs
        tabs={[
          { label: 'Fuel Tenders', value: 'fuel-tenders' },
          { label: 'Manage Contracts', value: 'manage-contracts' },
        ]}
        selectedTab={'fuel-tenders'}
        onTabChange={() => {}}
        children={
          <>
            <TabsContent value="fuel-tenders">
              <FuelTendersPage />
            </TabsContent>
            <TabsContent value="manage-contracts">Manage Contracts</TabsContent>
          </>
        }
      />
    </div>
  );
}
