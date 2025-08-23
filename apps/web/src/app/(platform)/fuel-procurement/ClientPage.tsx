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
  const { airports, selectedAirport, setSelectedAirport, loading, errors, clearError } =
    useFuelProcurement();
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
          InsertAddAirportButton={false}
        />
      }
      // <div className="space-y-4">
      //   {/* Airport Loading State */}
      //   {loading.airports && (
      //     <div className="flex items-center justify-center p-4">
      //       <Loader2 className="w-5 h-5 animate-spin mr-2" />
      //       <span className="text-sm text-gray-600">Loading airports...</span>
      //     </div>
      //   )}

      //   {/* Airport Error State */}
      //   {errors.airports && (
      //     <div className="bg-red-50 border border-red-200 rounded-lg p-3">
      //       <div className="flex items-start">
      //         <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 mr-2 flex-shrink-0" />
      //         <div className="flex-1">
      //           <p className="text-sm text-red-800">{errors.airports}</p>
      //           <button
      //             onClick={() => clearError('airports')}
      //             className="text-xs text-red-600 hover:text-red-800 mt-1"
      //           >
      //             Dismiss
      //           </button>
      //         </div>
      //       </div>
      //     </div>
      //   )}

      /* Airport List */
      // {!loading.airports && !errors.airports && (

      // )}
      // </div>
      // )}

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
