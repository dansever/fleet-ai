'use client';

import { LoadingComponent } from '@/components/miscellaneous/Loading';
import { useSidebar } from '@/components/ui/sidebar';
import { TabsContent } from '@/components/ui/tabs';
import AirportDialog from '@/features/airports/AirportDialog';
import { Button } from '@/stories/Button/Button';
import { PageLayout } from '@/stories/PageLayout/PageLayout';
import { StatusBadge } from '@/stories/StatusBadge/StatusBadge';
import { Tabs } from '@/stories/Tabs/TabsNew';
import { Eye, MapPin } from 'lucide-react';
import { useState } from 'react';
import AirportList from '../_components/AirportSidebar';
import { useFuelProcurement } from './contexts';
import FuelAgreementsPage from './subpages/FuelAgreements';
import FuelTendersPage from './subpages/FuelTenders';
import HistoricalDataPage from './subpages/HistoricalData';

type TabValue = 'fuel-tenders' | 'fuel-agreements' | 'historical-data';

export default function FuelProcurementClientPage() {
  const { airports } = useFuelProcurement();
  const { selectedAirport, setSelectedAirport, loading, error } = airports;
  const { state } = useSidebar();
  const isCollapsed = state === 'collapsed';

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!airports.airports || airports.airports.length === 0) {
    return <div>No airports found</div>;
  }

  return (
    <PageLayout
      sidebarContent={
        <AirportList
          airports={airports.airports}
          onAirportSelect={setSelectedAirport}
          selectedAirport={selectedAirport}
          InsertAddAirportButton={false}
        />
      }
      headerContent={
        <div className="flex flex-row items-center gap-4 justify-between w-full">
          <div className="flex flex-col">
            <div className="flex flex-row items-center gap-4">
              <h1>{selectedAirport?.name}</h1>
              <div className="flex flex-row items-center gap-1">
                <StatusBadge status="secondary" text={selectedAirport?.icao || ''} />
                <StatusBadge status="secondary" text={selectedAirport?.iata || ''} />
              </div>
            </div>
            <div className="flex items-center gap-2 text-gray-600 text-sm">
              <MapPin className="w-4 h-4" />
              <span>
                {selectedAirport?.city}
                {selectedAirport?.state && ', ' + selectedAirport?.state}
                {selectedAirport?.country && ', ' + selectedAirport?.country}
              </span>
            </div>
          </div>
          <AirportDialog
            trigger={<Button intent="secondary" text="View Airport" icon={Eye} />}
            airport={selectedAirport}
            onChange={() => {}}
            DialogType="view"
          />
        </div>
      }
      mainContent={<MainContentSection />}
      sidebarWidth={isCollapsed ? '20rem' : '18rem'}
    />
  );
}

function MainContentSection() {
  const [selectedTab, setSelectedTab] = useState<TabValue>('fuel-tenders');
  const { airports, tenders, fuelBids } = useFuelProcurement();
  const { selectedAirport } = airports;
  const { loading: tendersLoading } = tenders;
  const { loading: bidsLoading } = fuelBids;

  if (!selectedAirport) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-500">
        <div className="text-center">
          <h3 className="text-lg font-medium mb-2">No Airport Selected</h3>
          <p className="text-sm">
            Please select an airport from the sidebar to view fuel procurement data.
          </p>
        </div>
      </div>
    );
  }

  // Show loading state when switching airports
  const isLoadingData = tendersLoading || bidsLoading;
  if (isLoadingData) {
    return <LoadingComponent size="md" text="Loading fuel procurement data..." />;
  }

  return (
    <Tabs
      tabs={[
        { label: 'Fuel Tenders', value: 'fuel-tenders' },
        { label: 'Fuel Agreements', value: 'fuel-agreements' },
        { label: 'Historical Data', value: 'historical-data' },
      ]}
      defaultTab="fuel-tenders"
      onTabChange={(tab) => setSelectedTab(tab as TabValue)}
    >
      <TabsContent value="fuel-tenders">
        <FuelTendersPage />
      </TabsContent>
      <TabsContent value="fuel-agreements">
        <FuelAgreementsPage />
      </TabsContent>
      <TabsContent value="historical-data">
        <HistoricalDataPage />
      </TabsContent>
    </Tabs>
  );
}
