'use client';

import { Badge } from '@/components/ui/badge';
import { useSidebar } from '@/components/ui/sidebar';
import { TabsContent } from '@/components/ui/tabs';
import { PageLayout } from '@/stories/PageLayout/PageLayout';
import { Tabs } from '@/stories/Tabs/Tabs';
import { MapPin } from 'lucide-react';
import { useState } from 'react';
import AirportList from '../_components/AirportSidebar';
import { useAirportHub } from './ContextProvider';
import ContactsAndProviders from './subpages/ContactsAndProviders';
import ManageAirport from './subpages/ManageAirport';
import ServiceContracts from './subpages/ServiceContracts';

type TabValue = 'service-agreements' | 'contacts-and-providers' | 'manage-airport';

export default function AirportHubClientPage() {
  const {
    airports,
    setAirports,
    selectedAirport,
    setSelectedAirport,
    addAirport,
    loading,
    errors,
    clearError,
  } = useAirportHub();
  const { state } = useSidebar();
  const isCollapsed = state === 'collapsed';

  if (loading.airports) {
    return <div>Loading...</div>;
  }

  if (errors.airports) {
    return <div>Error: {errors.airports}</div>;
  }

  if (!airports) {
    return <div>No airports found</div>;
  }

  return (
    <PageLayout
      sidebarContent={
        <AirportList
          airports={airports}
          onAirportSelect={setSelectedAirport}
          selectedAirport={selectedAirport}
          InsertAddAirportButton={true}
          onAirportAdd={addAirport}
        />
      }
      headerContent={
        <div className="flex flex-row items-center gap-4 justify-between">
          <div className="flex flex-col">
            <div className="flex flex-row items-center gap-4">
              <h3 className="text-2xl font-bold text-gray-900">{selectedAirport?.name}</h3>
              <div className="flex flex-row items-center gap-2">
                <Badge>{selectedAirport?.icao}</Badge>
                <Badge>{selectedAirport?.iata}</Badge>
              </div>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <MapPin className="w-4 h-4" />
              <span>
                {selectedAirport?.city}
                {selectedAirport?.state && ', ' + selectedAirport?.state}
                {selectedAirport?.country && ', ' + selectedAirport?.country}
              </span>
            </div>
          </div>
        </div>
      }
      mainContent={<MainContentSection />}
      sidebarWidth={isCollapsed ? '20rem' : '18rem'}
    />
  );
}

function MainContentSection() {
  const [selectedTab, setSelectedTab] = useState<TabValue>('service-agreements');
  const { selectedAirport } = useAirportHub();

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
        { label: 'Service Agreements', value: 'service-agreements' },
        { label: 'Contacts & Providers', value: 'contacts-and-providers' },
        { label: 'Manage Airport', value: 'manage-airport' },
      ]}
      selectedTab={selectedTab}
      onTabChange={(tab) => setSelectedTab(tab as TabValue)}
    >
      <TabsContent value="service-agreements">
        <ServiceContracts />
      </TabsContent>
      <TabsContent value="contacts-and-providers">
        <ContactsAndProviders />
      </TabsContent>
      <TabsContent value="manage-airport">
        <ManageAirport />
      </TabsContent>
    </Tabs>
  );
}
