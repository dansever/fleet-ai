'use client';

import { LoadingComponent } from '@/components/miscellaneous/Loading';
import { useSidebar } from '@/components/ui/sidebar';
import { TabsContent } from '@/components/ui/tabs';
import AirportDialog from '@/features/airports/AirportDialog';
import { Button } from '@/stories/Button/Button';
import { PageLayout } from '@/stories/PageLayout/PageLayout';
import { StatusBadge } from '@/stories/StatusBadge/StatusBadge';
import { Tabs } from '@/stories/Tabs/Tabs';
import { ChartBar, Eye, FileText, MapPin, RefreshCw, TrendingUpDown } from 'lucide-react';
import { useState } from 'react';
import AirportList from '../_components/AirportSidebar';
import { useFuelProcurement } from './contexts';
import AgreementsPage from './subpages/Agreements';
import HistoricalDataPage from './subpages/HistoricalData';
import TendersPage from './subpages/Tenders';

type TabValue = 'fuel-tenders' | 'fuel-agreements' | 'historical-data';

export default function FuelProcurementClientPage() {
  const { airports, selectedAirport, loading, errors, selectAirport, refreshAll } =
    useFuelProcurement();
  const { state } = useSidebar();
  const isCollapsed = state === 'collapsed';

  if (loading.airports) {
    return <LoadingComponent size="lg" text="Loading airports..." />;
  }

  if (errors.airports) {
    return (
      <div className="flex items-center justify-center h-64 text-red-500">
        Error: {errors.airports}
      </div>
    );
  }

  if (airports.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">No airports found</div>
    );
  }

  return (
    <PageLayout
      sidebarContent={
        <AirportList
          airports={airports}
          onAirportSelect={selectAirport}
          selectedAirport={selectedAirport}
          InsertAddAirportButton={false}
        />
      }
      headerContent={
        <div className="flex flex-row items-start gap-4 justify-between w-full">
          <div className="flex flex-col flex-1 min-w-0">
            <h1>{selectedAirport?.name}</h1>
            <div className="flex flex-row items-center gap-4">
              <div className="flex flex-row items-center gap-1">
                <StatusBadge status="secondary" text={selectedAirport?.icao || ''} />
                <StatusBadge status="secondary" text={selectedAirport?.iata || ''} />
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
          </div>
          <div className="flex gap-2 flex-shrink-0">
            <AirportDialog
              trigger={<Button intent="secondary" text="View Airport" icon={Eye} />}
              airport={selectedAirport}
              onChange={() => {}}
              DialogType="view"
            />
            <Button
              intent="ghost"
              text="Refresh"
              icon={RefreshCw}
              onClick={refreshAll}
              isLoading={loading.any}
            />
          </div>
        </div>
      }
      mainContent={<MainContentSection />}
      sidebarWidth={isCollapsed ? '20rem' : '18rem'}
    />
  );
}

function MainContentSection() {
  const [selectedTab, setSelectedTab] = useState<TabValue>('fuel-tenders');
  const { selectedAirport, loading } = useFuelProcurement();

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

  // Show loading state when switching airports or loading initial data
  if (loading.initial) {
    return <LoadingComponent size="md" text="Loading fuel procurement data..." />;
  }

  return (
    <Tabs
      tabs={[
        { label: 'Tenders', value: 'fuel-tenders', icon: <TrendingUpDown /> },
        { label: 'Agreements', value: 'fuel-agreements', icon: <FileText /> },
        { label: 'Historical Data', value: 'historical-data', icon: <ChartBar /> },
      ]}
      defaultTab="fuel-tenders"
      onTabChange={(tab) => setSelectedTab(tab as TabValue)}
    >
      <TabsContent value="fuel-tenders">
        <TendersPage />
      </TabsContent>
      <TabsContent value="fuel-agreements">
        <AgreementsPage />
      </TabsContent>
      <TabsContent value="historical-data">
        <HistoricalDataPage />
      </TabsContent>
    </Tabs>
  );
}
