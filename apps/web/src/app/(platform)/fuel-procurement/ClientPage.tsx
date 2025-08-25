'use client';

import { useSidebar } from '@/components/ui/sidebar';
import { TabsContent } from '@/components/ui/tabs';
import { PageLayout } from '@/stories/PageLayout/PageLayout';
import { Tabs } from '@/stories/Tabs/Tabs';
import { useState } from 'react';
import AirportList from '../_components/AirportList';
import { useFuelProcurement } from './ContextProvider';
import FuelTendersPage from './subpages/FuelTenders';

type TabValue = 'fuel-tenders' | 'manage-contracts';

export default function FuelProcurementClientPage() {
  const {
    airports,
    setAirports,
    selectedAirport,
    setSelectedAirport,
    loading,
    errors,
    clearError,
  } = useFuelProcurement();
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
  const [selectedTab, setSelectedTab] = useState<TabValue>('fuel-tenders');
  const { selectedAirport } = useFuelProcurement();

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
        { label: 'Fuel Tenders', value: 'fuel-tenders' },
        { label: 'Manage Contracts', value: 'manage-contracts' },
      ]}
      selectedTab={selectedTab}
      onTabChange={(tab) => setSelectedTab(tab as TabValue)}
      children={
        <>
          <TabsContent value="fuel-tenders">
            <FuelTendersPage />
          </TabsContent>
          <TabsContent value="manage-contracts">
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
