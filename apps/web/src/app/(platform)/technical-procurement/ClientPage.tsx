'use client';

import { LoadingComponent } from '@/components/miscellaneous/Loading';
import { useSidebar } from '@/components/ui/sidebar';
import { TabsContent } from '@/components/ui/tabs';
import { getUrgencyLevelDisplay, Status, statusDisplayMap } from '@/drizzle/enums';
import { convertPydanticToQuote } from '@/features/quotes/pydanticConverter';
import RfqDialog from '@/features/rfqs/RfqDialog';
import { formatDate } from '@/lib/core/formatters';
import { client as quoteClient } from '@/modules/quotes';
import { Button } from '@/stories/Button/Button';
import { MainCard } from '@/stories/Card/Card';
import { KeyValuePair } from '@/stories/KeyValuePair/KeyValuePair';
import { PageLayout } from '@/stories/PageLayout/PageLayout';
import { ConfirmationPopover } from '@/stories/Popover/Popover';
import { StatusBadge } from '@/stories/StatusBadge/StatusBadge';
import { Tabs } from '@/stories/Tabs/Tabs';
import { ChartBar, FileText, TrashIcon } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import RfqList from '../_components/RfqSidebar';
import { useTechnicalProcurement } from './ContextProvider';
import QuoteAnalysis from './subpages/QuoteAnalysis';
import QuotesComparison from './subpages/QuoteComparison';

export default function TechnicalProcurementClientPage() {
  const {
    rfqs,
    selectedRfq,
    setSelectedRfqId,
    refreshData,
    isLoading,
    refreshSelectedRfqQuotes,
    isLoadingQuotes,
    isRefreshing,
    isRefreshingQuotes,
    updateRfq,
    addRfq,
    addQuote,
    deleteRfqAndSelectAdjacent,
    quoteComparisonResult,
    setQuoteComparisonResult,
    refreshRfqs,
  } = useTechnicalProcurement();
  const { state } = useSidebar();
  const isCollapsed = state === 'collapsed';
  const [uploadQuotePopoverOpen, setUploadQuotePopoverOpen] = useState(false);

  const handleDeleteRfq = async () => {
    if (!selectedRfq) {
      toast.error('Please select an RFQ first');
      return;
    }
    try {
      await deleteRfqAndSelectAdjacent(selectedRfq.id);
      toast.success('RFQ deleted successfully');
    } catch (error) {
      console.error('Error deleting RFQ:', error);
      toast.error('Error deleting RFQ');
    }
  };

  // Handle file upload for quote extraction
  const handleQuoteFileUpload = async (file: File) => {
    if (!selectedRfq) {
      toast.error('Please select an RFQ first');
      return;
    }

    try {
      toast.info('Extracting quote from file...');

      // Extract quote data from file
      const extractedData = await quoteClient.extractQuoteFromFile(file);

      // Convert to database format
      const convertedQuote = convertPydanticToQuote(extractedData as any, selectedRfq.id);

      // Create the quote in the database
      const newQuote = await quoteClient.createQuote({ ...convertedQuote }, selectedRfq.id);

      // Add to local cache
      addQuote(newQuote);

      toast.success('Quote extracted and added successfully');
    } catch (error) {
      console.error('Error extracting quote:', error);
      toast.error('Error extracting quote from file');
    }
  };

  const handleAnalyzeQuotes = async () => {
    if (!selectedRfq) {
      toast.error('Please select an RFQ first');
      return;
    }
    try {
      const res = await quoteClient.compareQuotesByRfqId(selectedRfq.id);
      setQuoteComparisonResult(res as unknown as JSON);
      toast.success('Quotes analyzed successfully');
    } catch (error) {
      console.error('Error analyzing quotes:', error);
      toast.error('Error analyzing quotes');
    }
  };

  // Sidebar content - RFQ List
  const sidebarContent = (
    <RfqList
      rfqs={rfqs}
      selectedRfq={selectedRfq}
      onRfqSelect={(rfq) => setSelectedRfqId(rfq.id)}
      onRefresh={refreshData}
      isLoading={isLoading}
      isRefreshing={isRefreshing}
      InsertAddRfqButton={true}
      rfqsDirection={'sent'}
      onCreatedRfq={refreshRfqs}
    />
  );

  // Header content
  const headerContent = selectedRfq ? (
    <div className="flex items-center justify-between w-full">
      <div>
        <h1 className="text-xl font-semibold mb-1">
          {selectedRfq.rfqNumber || `RFQ-${selectedRfq.id.slice(0, 8)}`}
        </h1>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <StatusBadge
            status="default"
            size="sm"
            text={statusDisplayMap[selectedRfq.status as Status] || ''}
          />
          {selectedRfq.sentAt && <span>Sent: {formatDate(new Date(selectedRfq.sentAt))}</span>}
        </div>
      </div>

      <div className="flex gap-2">
        <RfqDialog
          key={selectedRfq?.id}
          rfq={selectedRfq}
          onChange={updateRfq}
          triggerText="View Details"
          triggerIntent="secondary"
          DialogType="view"
        />
      </div>
    </div>
  ) : (
    <div className="flex items-center justify-between w-full">
      <h1 className="text-xl font-semibold">Technical Procurement</h1>
      <p className="text-sm text-muted-foreground">Select an RFQ to view details</p>
    </div>
  );

  // Show loading component when initially loading (no data yet)
  if (isLoading && rfqs.length === 0) {
    return (
      <PageLayout
        sidebarContent={sidebarContent}
        headerContent={
          <div className="flex items-center justify-between w-full">
            <h1 className="text-xl font-semibold">Technical Procurement</h1>
            <p className="text-sm text-muted-foreground">Loading RFQs...</p>
          </div>
        }
        mainContent={<LoadingComponent text="Loading Technical Procurement data..." />}
        sidebarWidth={isCollapsed ? '20rem' : '18rem'}
      />
    );
  }

  // Main content
  const mainContent = selectedRfq ? (
    <div className="space-y-2">
      <div>
        {/* RFQ Details */}
        {selectedRfq && (
          <MainCard
            title={selectedRfq.rfqNumber || 'N/A'}
            subtitle={selectedRfq.buyerComments || 'No buyer comments available'}
            actions={
              <div className="flex gap-2">
                <RfqDialog
                  key={selectedRfq.id}
                  rfq={selectedRfq}
                  onChange={updateRfq}
                  triggerText="Edit"
                  DialogType="edit"
                  triggerIntent="secondaryInverted"
                />

                <ConfirmationPopover
                  trigger={
                    <Button
                      intent="secondaryInverted"
                      icon={TrashIcon}
                      text="Delete"
                      className="bg-white/20 text-white-700 hover:border-red-500 hover:bg-red-500"
                    />
                  }
                  popoverIntent="danger"
                  title="Delete RFQ"
                  onConfirm={handleDeleteRfq}
                />
              </div>
            }
          >
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Tender Information */}
              <MainCard neutralHeader={true} title="Details">
                <KeyValuePair
                  label="Part Number"
                  value={selectedRfq.partNumber || ''}
                  valueType="string"
                />
                <KeyValuePair
                  label="Alt. Part Number"
                  value={selectedRfq.altPartNumber || ''}
                  valueType="string"
                />

                <KeyValuePair
                  label="Description"
                  value={selectedRfq.partDescription || ''}
                  valueType="string"
                />
                <KeyValuePair
                  label="Quantity"
                  value={selectedRfq.quantity || ''}
                  valueType="number"
                />
              </MainCard>
              {/* Timeline */}
              <MainCard title="Vendor Information" neutralHeader={true}>
                <KeyValuePair
                  label="Name"
                  value={selectedRfq.vendorName || ''}
                  valueType="string"
                />
                <KeyValuePair
                  label="Address"
                  value={selectedRfq.vendorAddress || ''}
                  valueType="string"
                />

                <KeyValuePair
                  label="Contact"
                  value={selectedRfq.vendorContactName || ''}
                  valueType="string"
                />
                <KeyValuePair
                  label="Email"
                  value={selectedRfq.vendorContactEmail || ''}
                  valueType="email"
                />
                <KeyValuePair
                  label="Phone"
                  value={selectedRfq.vendorContactPhone || ''}
                  valueType="string"
                />
              </MainCard>

              {/* Quick Stats */}
              <MainCard title="General" neutralHeader={true}>
                <KeyValuePair
                  keyClassName="max-w-1/2"
                  label="Status"
                  value={statusDisplayMap[selectedRfq.status as Status] || ''}
                  valueType="string"
                />
                <KeyValuePair
                  keyClassName="max-w-1/2"
                  label="Urgency"
                  value={getUrgencyLevelDisplay(selectedRfq.urgencyLevel)}
                  valueType="string"
                />
                <KeyValuePair
                  keyClassName="max-w-1/2"
                  label="Deliver To"
                  value={selectedRfq.deliverTo || ''}
                  valueType="string"
                />
                <KeyValuePair
                  keyClassName="max-w-1/2"
                  label="Buyer Comments"
                  value={selectedRfq.buyerComments || ''}
                  valueType="string"
                />
              </MainCard>
            </div>
          </MainCard>
        )}
      </div>

      <Tabs
        tabs={[
          { label: 'Quotes', value: 'quotes', icon: <FileText /> },
          { label: 'Analysis', value: 'analysis', icon: <ChartBar /> },
        ]}
        defaultTab="quotes"
        onTabChange={() => {}}
      >
        <TabsContent value="quotes">
          <QuotesComparison />
        </TabsContent>
        <TabsContent value="analysis">
          <QuoteAnalysis />
        </TabsContent>
      </Tabs>
    </div>
  ) : (
    // No RFQ selected
    <div className="flex-1 flex items-center justify-center text-muted-foreground">
      <div className="text-center">
        <FileText className="h-12 w-12 mx-auto mb-4" />
        <h2 className="text-lg font-medium mb-2">No RFQ Selected</h2>
        <p>Select an RFQ from the sidebar to view details and manage quotes</p>
      </div>
    </div>
  );

  return (
    <PageLayout
      sidebarContent={sidebarContent}
      headerContent={headerContent}
      mainContent={mainContent}
      sidebarWidth={isCollapsed ? '20rem' : '18rem'}
    />
  );
}
