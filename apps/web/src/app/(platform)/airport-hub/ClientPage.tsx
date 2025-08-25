'use client';

import { useSidebar } from '@/components/ui/sidebar';
import { TabsContent } from '@/components/ui/tabs';
import { PageLayout } from '@/stories/PageLayout/PageLayout';
import { Tabs } from '@/stories/Tabs/Tabs';
import { useState } from 'react';
import AirportList from '../_components/AirportList';
import { useAirportHub } from './ContextProvider';

type TabValue = 'service-contracts' | 'contacts-and-agreements';

export default function AirportHubClientPage() {
  const {
    airports,
    setAirports,
    selectedAirport,
    setSelectedAirport,
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
        />
      }
      headerContent={
        <h2 className="text-xl font-semibold">
          {selectedAirport ? selectedAirport.name : 'Select an Airport'}
        </h2>
      }
      mainContent={<MainContentSection />}
      sidebarWidth={isCollapsed ? '20rem' : '18rem'}
    />
  );
}

function MainContentSection() {
  const [selectedTab, setSelectedTab] = useState<TabValue>('service-contracts');
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
        { label: 'Service Contracts', value: 'service-contracts' },
        { label: 'Contacts & Agreements', value: 'contacts-and-agreements' },
      ]}
      selectedTab={selectedTab}
      onTabChange={(tab) => setSelectedTab(tab as TabValue)}
      children={
        <>
          <TabsContent value="service-contracts">{/* <ServiceContractsPage /> */}</TabsContent>
          <TabsContent value="contacts-and-agreements">
            <div className="flex flex-col items-center justify-center h-64 text-gray-500">
              <div className="text-center">
                <h3 className="text-lg font-medium mb-2">Manage Contracts</h3>
                <p className="text-sm">Contract management functionality coming soon...</p>
              </div>
            </div>
          </TabsContent>
        </>
      }
    />
  );
}
