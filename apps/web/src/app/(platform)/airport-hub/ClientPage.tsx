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
import { Eye, FileText, MapPin, RefreshCw, Star, Users } from 'lucide-react';
import { useState } from 'react';
import AirportsPanel from '../_components/AirportsPanel';
import { useAirportHub } from './context';
import AirportPage from './subpages/Airport';
import ContractsPage from './subpages/ServiceAgreements';
import VendorsPage from './subpages/Vendors';

type TabValue = 'manage-contracts' | 'contacts-and-providers' | 'manage-airport';

export default function AirportHubClientPage() {
  const {
    airports,
    setAirports,
    selectedAirport,
    refreshAirports,
    setSelectedAirport,
    addAirport,
    updateAirport,
    refreshContracts,
    refreshDocuments,
    refreshVendorContacts,
    loading,
    errors,
    clearError,
  } = useAirportHub();
  const { state } = useSidebar();
  const isCollapsed = state === 'collapsed';

  if (loading.airports) {
    return <LoadingComponent size="lg" text="Loading airports..." />;
  }

  /**
   * Refresh all except airports
   */
  const handleRefresh = () => {
    refreshContracts();
    refreshDocuments();
    refreshVendorContacts();
  };

  if (errors.airports) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-500">
        <div className="text-center">
          <h3 className="text-lg font-medium mb-2 text-red-600">Error Loading Airports</h3>
          <p className="text-sm mb-4">{errors.airports}</p>
          <Button
            intent="primary"
            text="Retry"
            onClick={() => {
              clearError('airports');
              window.location.reload();
            }}
          />
        </div>
      </div>
    );
  }

  if (!airports || airports.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-500">
        <div className="text-center">
          <h3 className="text-lg font-medium mb-2">No Airports Found</h3>
          <p className="text-sm">No airports have been added to your organization yet.</p>
        </div>
      </div>
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
            <div className="flex flex-col flex-1 min-w-0 gap-1">
              <div className="flex flex-row items-center gap-4">
                <AirportsPanel
                  airports={airports}
                  selectedAirport={selectedAirport}
                  onAirportSelect={setSelectedAirport}
                  onAirportAdd={setSelectedAirport}
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
                  onChange={updateAirport}
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
                isLoading={loading.contracts || loading.documents || loading.vendorContacts}
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
      sidebarWidth={isCollapsed ? '18rem' : '18rem'}
    >
      <MainContentSection />
    </PageLayout>
  );
}

function MainContentSection() {
  const [selectedTab, setSelectedTab] = useState<TabValue>('manage-contracts');
  const { selectedAirport, loading, airports } = useAirportHub();

  // Show loading state if we're still loading airports
  if (loading.airports) {
    return <LoadingComponent size="md" text="Loading airports..." />;
  }

  // Show empty state if no airports exist
  if (airports.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-500">
        <div className="text-center">
          <h3 className="text-lg font-medium mb-2">No Airports Found</h3>
          <p className="text-sm">No airports have been added to your organization yet.</p>
        </div>
      </div>
    );
  }

  // Show empty state if no airport is selected
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

  return (
    <Tabs
      tabs={[
        { label: 'Service Agreements', value: 'service-agreements', icon: <FileText /> },
        { label: 'Contacts & Providers', value: 'contacts-and-providers', icon: <Users /> },
        { label: 'Manage Airport', value: 'manage-airport', icon: <MapPin /> },
      ]}
      defaultTab="service-agreements"
      onTabChange={(tab) => setSelectedTab(tab as TabValue)}
    >
      <TabsContent value="service-agreements">
        <ContractsPage />
      </TabsContent>
      <TabsContent value="contacts-and-providers">
        <VendorsPage />
      </TabsContent>
      <TabsContent value="manage-airport">
        <AirportPage />
      </TabsContent>
    </Tabs>
  );
}
