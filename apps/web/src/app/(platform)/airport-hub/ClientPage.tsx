'use client';

import { LoadingComponent } from '@/components/miscellaneous/Loading';
import { StatusIndicator } from '@/components/miscellaneous/StatusIndicator';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty';
import { useSidebar } from '@/components/ui/sidebar';
import { Skeleton } from '@/components/ui/skeleton';
import { TabsContent } from '@/components/ui/tabs';
import AirportDialog from '@/features/airports/AirportDialog';
import { Button } from '@/stories/Button/Button';
import { PageLayout } from '@/stories/PageLayout/PageLayout';
import { StatusBadge } from '@/stories/StatusBadge/StatusBadge';
import { Tabs } from '@/stories/Tabs/Tabs';
import {
  AssistantMessageStyle,
  HeaderStyle,
  UserMessageStyle,
} from '@/styles/copilotKitPopupStyles';
import { CopilotKitCSSProperties, CopilotPopup } from '@copilotkit/react-ui';
import '@copilotkit/react-ui/styles.css';
import { Eye, FileText, MapPin, Plane, RefreshCw, Star, Users } from 'lucide-react';
import Image from 'next/image';
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
      <PageLayout
        headerContent={
          <div className="flex items-center space-x-4">
            <Skeleton className="h-12 w-[180px] rounded-lg" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-[250px]" />
              <Skeleton className="h-4 w-[200px]" />
            </div>
          </div>
        }
        sidebarWidth={isCollapsed ? '18rem' : '18rem'}
      >
        <div className="flex items-center justify-center h-[calc(100vh-200px)]">
          <Card className="max-w-md w-full mx-4">
            <CardHeader className="text-center space-y-4">
              <div className="flex justify-center">
                <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                  <MapPin className="w-12 h-12 text-gray-500" />
                </div>
              </div>
              <div className="space-y-2">
                <CardTitle className="text-2xl">No Airports Found</CardTitle>
                <CardDescription className="text-base">
                  No airports have been added to your organization yet. Add your first airport to
                  get started.
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <AirportDialog
                airport={null}
                DialogType="add"
                trigger={<Button intent="primary" text="Add Airport" icon={MapPin} />}
                onChange={(newAirport) => {
                  addAirport(newAirport);
                }}
              />
              <div className="flex justify-center pt-4">
                <Image
                  src="/logos/fleet-ai-logo.svg"
                  alt="FleetAI Logo"
                  width={120}
                  height={40}
                  className="opacity-40"
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout
      headerContent={
        loading.airports ? (
          <div className="flex items-center space-x-4">
            <Skeleton className="h-12 w-[180px] rounded-lg" />
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
            <div className="flex flex-row gap-4">
              <Button
                intent="glass"
                text="Refresh"
                icon={RefreshCw}
                onClick={handleRefresh}
                isLoading={loading.contracts || loading.documents || loading.vendorContacts}
              />
              <StatusIndicator />
            </div>
          </div>
        ) : (
          <div className="flex flex-row items-center gap-4">
            <AirportsPanel
              airports={airports}
              selectedAirport={null}
              onAirportSelect={setSelectedAirport}
              onAirportAdd={setSelectedAirport}
            />
            <div className="flex flex-col gap-1">
              <Skeleton className="h-4 w-[200px]" />
              <Skeleton className="h-3 w-[150px]" />
            </div>
          </div>
        )
      }
      sidebarWidth={isCollapsed ? '18rem' : '18rem'}
    >
      <MainContentSection />
      <div
        style={
          {
            '--copilot-kit-primary-color': 'var(--color-primary)',
            '--copilot-kit-contrast-color': 'white',
          } as CopilotKitCSSProperties
        }
      >
        <CopilotPopup
          Header={HeaderStyle}
          AssistantMessage={AssistantMessageStyle}
          UserMessage={UserMessageStyle}
          observabilityHooks={{
            onChatExpanded: () => {
              console.log('Popup opened');
            },
            onChatMinimized: () => {
              console.log('Popup closed');
            },
          }}
          onThumbsUp={() => {
            console.log('Thumbs up');
          }}
          onThumbsDown={() => {
            console.log('Thumbs down');
          }}
          instructions={
            'You are assisting the user as best as you can. Answer in the best way possible given the data you have.'
          }
          labels={{
            title: 'FleetAI AI Assistant',
            initial: 'Hi! 👋 How can I assist you today?',
            stopGenerating: 'Stop',
            regenerateResponse: 'Regenerate',
          }}
        />
      </div>
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
      <div className="flex items-center justify-center h-[calc(100vh-300px)]">
        <Card className="max-w-md w-full mx-4">
          <CardHeader className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                <MapPin className="w-12 h-12 text-gray-500" />
              </div>
            </div>
            <div className="space-y-2">
              <CardTitle className="text-2xl">No Airports Found</CardTitle>
              <CardDescription className="text-base">
                No airports have been added to your organization yet.
              </CardDescription>
            </div>
          </CardHeader>
        </Card>
      </div>
    );
  }

  // Show empty state if no airport is selected
  if (!selectedAirport) {
    return (
      <div className="mt-20 flex items-center justify-center">
        <Empty className="max-w-md border border-dashed shadow-lg bg-white">
          <EmptyHeader>
            <EmptyMedia className="bg-blue-100 p-4 rounded-full">
              <Plane className="w-12 h-12 text-blue-600" />
            </EmptyMedia>
            <EmptyTitle>No Airport Selected</EmptyTitle>
            <EmptyDescription>Please select an airport from the sidebar.</EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Image src="/logos/fleet-ai-logo.svg" alt="FleetAI Logo" width={120} height={40} />
          </EmptyContent>
        </Empty>
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
