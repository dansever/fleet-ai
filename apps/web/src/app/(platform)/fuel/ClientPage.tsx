'use client';

import { LoadingComponent } from '@/components/miscellaneous/Loading';
import { useSidebar } from '@/components/ui/sidebar';
import { Skeleton } from '@/components/ui/skeleton';
import { TabsContent } from '@/components/ui/tabs';
import AirportDialog from '@/features/airports/AirportDialog';
import { Button } from '@/stories/Button/Button';
import { PageLayout } from '@/stories/PageLayout/PageLayout';
import { StatusBadge } from '@/stories/StatusBadge/StatusBadge';
import { Tabs } from '@/stories/Tabs/Tabs';
import { ChartBar, Eye, FileText, MapPin, RefreshCw, Star, TrendingUpDown } from 'lucide-react';
import { useState } from 'react';
import AirportsDropdown from '../_components/AirportsDropdown';
import AirportsPanel from '../_components/AirportsPanel';
import { useFuelProcurement } from './contexts';
import AgreementsPage from './subpages/Agreements';
import HistoricalDataPage from './subpages/HistoricalData';
import TendersPage from './subpages/Tenders';

type TabValue = 'fuel-tenders' | 'fuel-agreements' | 'historical-data';

export default function FuelProcurementClientPage() {
  const { airports, selectedAirport, loading, errors, setSelectedAirport, refreshAll } =
    useFuelProcurement();
  const { state } = useSidebar();
  const isCollapsed = state === 'collapsed';

  const handleRefresh = () => {
    refreshAll();
  };

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
      headerContent={
        loading.airports ? (
          <div className="flex items-center space-x-4">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-[250px]" />
              <Skeleton className="h-4 w-[200px]" />
            </div>
          </div>
        ) : selectedAirport ? (
          <div className="flex flex-row items-start gap-4 justify-between w-full">
            <div className="flex flex-col gap-2 flex-1 min-w-0">
              <div className="flex flex-row items-center gap-4">
                <AirportsPanel
                  airports={airports}
                  selectedAirport={selectedAirport}
                  onAirportSelect={setSelectedAirport}
                  onAirportAdd={setSelectedAirport}
                />
                <AirportsDropdown
                  airports={airports}
                  selectedAirport={selectedAirport}
                  onAirportSelect={setSelectedAirport}
                />
              </div>
              <div className="flex items-center gap-2 text-gray-600 text-sm">
                <div className="flex flex-row items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  <span>
                    {selectedAirport.city}
                    {selectedAirport.state && ', ' + selectedAirport.state}
                    {selectedAirport.country && ', ' + selectedAirport.country}
                  </span>
                </div>
                <div className="flex flex-row items-center gap-1">
                  {selectedAirport.icao && (
                    <StatusBadge status="secondary" text={selectedAirport.icao} />
                  )}
                  {selectedAirport.iata && (
                    <StatusBadge status="secondary" text={selectedAirport.iata} />
                  )}
                  {selectedAirport.isHub && (
                    <div className="ml-2 px-2 flex flex-row gap-1 items-center rounded-lg border border-yellow-400 bg-gradient-to-br from-yellow-100 to-yellow-200 opacity-80">
                      <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                      Hub
                    </div>
                  )}
                </div>
                <AirportDialog
                  trigger={<Button intent="ghost" icon={Eye} text="View" size="sm" />}
                  airport={selectedAirport}
                  onChange={() => {}}
                  DialogType="view"
                />
              </div>
            </div>
            <div className="fixed top-2 right-36">
              <Button
                intent="glass"
                text="Refresh"
                icon={RefreshCw}
                onClick={handleRefresh}
                isLoading={loading.tenders || loading.bids}
              />
            </div>
          </div>
        ) : (
          <div className="flex flex-row items-center gap-4 justify-between w-full">
            <div className="flex flex-col">
              <h1 className="text-gray-400">No Airport Selected</h1>
              <p className="text-sm text-gray-500">
                Select an airport from the sidebar to continue
              </p>
            </div>
          </div>
        )
      }
      sidebarWidth={isCollapsed ? '20rem' : '18rem'}
    >
      <MainContentSection />
    </PageLayout>
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
