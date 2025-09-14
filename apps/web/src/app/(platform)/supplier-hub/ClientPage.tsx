'use client';

import { LoadingComponent } from '@/components/miscellaneous/Loading';
import { CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useSidebar } from '@/components/ui/sidebar';
import { TabsContent } from '@/components/ui/tabs';
import { getUrgencyLevelDisplay, ProcessStatus, processStatusDisplayMap } from '@/drizzle/enums';
import { generateRandomQuote } from '@/features/generateRandomObjects/quote';
import { convertPydanticToQuote } from '@/features/quotes/pydanticConverter';
import RfqDialog from '@/features/rfqs/RfqDialog';
import { formatDate } from '@/lib/core/formatters';
import { client as quoteClient } from '@/modules/quotes';
import { Button } from '@/stories/Button/Button';
import { BaseCard } from '@/stories/Card/Card';
import { KeyValuePair } from '@/stories/KeyValuePair/KeyValuePair';
import { PageLayout } from '@/stories/PageLayout/PageLayout';
import { ConfirmationPopover, FileUploadPopover } from '@/stories/Popover/Popover';
import { StatusBadge } from '@/stories/StatusBadge/StatusBadge';
import { Tabs } from '@/stories/Tabs/Tabs';
import {
  ChartBarIcon,
  Eye,
  FileText,
  Package,
  Pencil,
  RefreshCw,
  Sparkles,
  TrashIcon,
  Upload,
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import RfqList from '../_components/RfqSidebar';
import { useTechnicalProcurement } from './ContextProvider';
import QuoteAnalysis from './_components/QuoteAnalysis';
import QuotesComparison from './_components/QuotesComparison';

export default function TechnicalProcurementClientPage() {
  const {
    rfqs,
    selectedRfq,
    selectedRfqQuotes,
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
      rfqsDirection={'received'}
      onCreatedRfq={addRfq}
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
            text={processStatusDisplayMap[selectedRfq.processStatus as ProcessStatus] || ''}
          />
          {selectedRfq.sentAt && <span>Sent: {formatDate(new Date(selectedRfq.sentAt))}</span>}
        </div>
      </div>

      <div className="flex gap-2">
        <RfqDialog
          key={selectedRfq?.id}
          rfq={selectedRfq}
          onChange={updateRfq}
          trigger={<Button intent="secondary" text="View RFQ" icon={Eye} />}
          DialogType="view"
        />
      </div>
    </div>
  ) : (
    <div> </div>
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
    <div className="space-y-6">
      <div>
        {/* RFQ Details */}
        {selectedRfq && (
          <BaseCard
            title={selectedRfq.rfqNumber || 'N/A'}
            subtitle={selectedRfq.buyerComments || 'No buyer comments available'}
            actions={
              <div className="flex gap-2">
                <RfqDialog
                  key={selectedRfq.id}
                  rfq={selectedRfq}
                  onChange={updateRfq}
                  DialogType="edit"
                  trigger={<Button intent="secondaryInverted" icon={Pencil} />}
                />

                <ConfirmationPopover
                  trigger={<Button intent="secondaryInverted" icon={TrashIcon} />}
                  popoverIntent="danger"
                  title="Delete RFQ"
                  onConfirm={handleDeleteRfq}
                />
              </div>
            }
          >
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
              {/* Tender Information */}
              <BaseCard neutralHeader={true} title="Details">
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
              </BaseCard>
              {/* Timeline */}
              <BaseCard title="Vendor Information" neutralHeader={true}>
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
              </BaseCard>

              {/* Quick Stats */}
              <BaseCard title="General" neutralHeader={true}>
                <KeyValuePair
                  label="Status"
                  value={processStatusDisplayMap[selectedRfq.processStatus as ProcessStatus] || ''}
                  valueType="string"
                />
                <KeyValuePair
                  label="Urgency"
                  value={getUrgencyLevelDisplay(selectedRfq.urgencyLevel)}
                  valueType="string"
                />
                <KeyValuePair
                  label="Deliver To"
                  value={selectedRfq.deliverTo || ''}
                  valueType="string"
                />
                <KeyValuePair
                  label="Buyer Comments"
                  value={selectedRfq.buyerComments || ''}
                  valueType="string"
                />
              </BaseCard>
            </div>
          </BaseCard>
        )}
      </div>

      <Tabs
        tabs={[
          { label: 'Quotes', value: 'quotes', icon: <FileText /> },
          { label: 'Analysis', value: 'analysis', icon: <ChartBarIcon /> },
        ]}
        defaultTab="quotes"
        onTabChange={() => {}}
      >
        <TabsContent value="quotes">
          <BaseCard>
            <CardHeader className="flex items-start justify-between">
              {/* Left Side - Title and Description */}
              <div>
                <CardTitle className="text-xl font-bold text-slate-900 flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl">
                    <Package className="w-6 h-6 text-white" />
                  </div>
                  Technical Quotes Comparison
                </CardTitle>
                <p className="text-slate-600 mt-2 ml-12">
                  Compare and evaluate quotes for{' '}
                  <span className="font-semibold text-slate-800">{selectedRfq?.rfqNumber}</span>
                </p>
                <div className="flex items-center gap-4 mt-2 ml-12 text-sm text-slate-500">
                  <span>Total Quotes: {selectedRfqQuotes.length}</span>
                </div>
              </div>
              {/* Right Side - Actions */}
              <div className="flex gap-2">
                <Button
                  intent="ghost"
                  onClick={refreshSelectedRfqQuotes}
                  disabled={isLoadingQuotes}
                  icon={RefreshCw}
                  className={`${isRefreshingQuotes ? 'animate-spin' : ''}`}
                />
                <Button
                  intent="primary"
                  icon={Sparkles}
                  text="Analyze"
                  onClick={handleAnalyzeQuotes}
                />
                <FileUploadPopover
                  open={uploadQuotePopoverOpen}
                  onOpenChange={setUploadQuotePopoverOpen}
                  trigger={<Button intent="secondary" icon={Upload} text="Upload Quote" />}
                  onSend={() => {}}
                >
                  <div className="flex flex-col gap-2 text-sm">
                    <Button
                      intent="secondary"
                      text="Manually Add Quote"
                      size="sm"
                      onClick={() => {}}
                    />
                    <Button
                      intent="ghost"
                      text="Or generate random Quote"
                      size="sm"
                      className="text-gray-500"
                      onClick={async () => {
                        const quote = await generateRandomQuote('received', selectedRfq.id);
                        addQuote(quote);
                        console.log('Time to close the popover');
                        setUploadQuotePopoverOpen(false);
                      }}
                    />
                  </div>
                </FileUploadPopover>
              </div>
            </CardHeader>
            <CardContent>
              <QuotesComparison isRefreshing={isRefreshingQuotes} />
            </CardContent>
          </BaseCard>
        </TabsContent>
        <TabsContent value="analysis">
          <QuoteAnalysis isRefreshing={isRefreshingQuotes} />
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
