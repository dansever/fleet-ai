'use client';

import { LoadingComponent } from '@/components/miscellaneous/Loading';
import { Badge } from '@/components/ui/badge';
import { CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useSidebar } from '@/components/ui/sidebar';
import { TabsContent } from '@/components/ui/tabs';
import { getUrgencyLevelDisplay } from '@/drizzle/schema/enums';
import { Quote } from '@/drizzle/types';
import { convertPydanticToQuote } from '@/features/quotes/pydanticConverter';
import { createRandomQuote } from '@/features/quotes/utils';
import RfqDialog from '@/features/rfqs/RfqDialog';
import { formatDate } from '@/lib/core/formatters';
import { analyzeQuotes, createQuote, extractQuote } from '@/services/technical/quote-client';
import { Button } from '@/stories/Button/Button';
import { BaseCard, ContentSection } from '@/stories/Card/Card';
import { PageLayout } from '@/stories/PageLayout/PageLayout';
import { ConfirmationPopover, FileUploadPopover } from '@/stories/Popover/Popover';
import { Tabs } from '@/stories/Tabs/Tabs';
import { KeyValuePair } from '@/stories/Utilities/KeyValuePair';
import { CalendarIcon, FileText, Package, RefreshCw, Sparkles, TrashIcon } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { CopyableText } from '../_components/CopyableText';
import { useTechnicalProcurement } from './ContextProvider';
import QuoteAnalysis from './_components/QuoteAnalysis';
import QuotesComparison from './_components/QuotesComparison';
import RfqList from './_components/RfqList';

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
      const extractedData = await extractQuote(file);

      // Convert to database format
      const convertedQuote = convertPydanticToQuote(extractedData as any, selectedRfq.id);

      // Create the quote in the database
      const newQuote = await createQuote({ ...convertedQuote, sentAt: null });

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
      toast.info('Analyzing quotes...');
      const res = await analyzeQuotes(selectedRfq.id);
      console.log(res);
      toast.success('Quotes analyzed successfully');
    } catch (error) {
      console.error('Error analyzing quotes:', error);
      toast.error('Error analyzing quotes');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'sent':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'quoted':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'approved':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
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
      onAddRfq={addRfq}
    />
  );

  // Header content
  const headerContent = selectedRfq ? (
    <div className="flex items-start justify-between w-full">
      <div>
        <h1 className="text-xl font-semibold mb-1">
          {selectedRfq.rfqNumber || `RFQ-${selectedRfq.id.slice(0, 8)}`}
        </h1>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span>
            Status:{' '}
            <Badge className={getStatusColor(selectedRfq.status || 'pending')}>
              {selectedRfq.status || 'pending'}
            </Badge>
          </span>
          <span>Created: {formatDate(new Date(selectedRfq.createdAt))}</span>
          {selectedRfq.sentAt && <span>Sent: {formatDate(new Date(selectedRfq.sentAt))}</span>}
        </div>
      </div>

      <div className="flex gap-2">
        <RfqDialog
          rfq={selectedRfq}
          onChange={() => {}}
          triggerText="View"
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
    <div className="space-y-6">
      <div className="">
        {/* RFQ Details */}
        {selectedRfq && (
          <ContentSection
            header={
              <div className="flex flex-col gap-2">
                <div className="flex items-start gap-2 justify-between">
                  <h3>{selectedRfq.rfqNumber}</h3>
                  {/* Buttons */}
                  <div className="flex gap-2">
                    <RfqDialog
                      rfq={selectedRfq}
                      onChange={updateRfq}
                      triggerText="Edit"
                      DialogType="edit"
                      triggerClassName="bg-white/20 text-white-700"
                    />

                    <ConfirmationPopover
                      trigger={
                        <Button
                          intent="secondary"
                          icon={TrashIcon}
                          text="Delete"
                          className="bg-white/20 text-white-700 hover:border-red-500 hover:bg-red-500"
                        />
                      }
                      intent="danger"
                      title="Delete RFQ"
                      onConfirm={handleDeleteRfq}
                    />
                  </div>
                </div>
                <p className="text-blue-100">
                  {selectedRfq.buyerComments || 'No buyer comments available'}
                </p>
              </div>
            }
          >
            <div className="grid grid-cols-3 gap-4">
              {/* Tender Information */}
              <ContentSection
                className="col-span-1 bg-gradient-to-br from-blue-50 to-blue-100/50 border-blue-200/50"
                headerGradient="none"
                header={
                  <div className="flex items-start gap-2 text-foreground">
                    <div className="p-2 bg-blue-600 rounded-xl">
                      <CalendarIcon className="w-5 h-5 text-white" />
                    </div>
                    <h4>Details</h4>
                  </div>
                }
              >
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
                <div className="flex justify-between items-center py-1">
                  <span className="text-sm text-muted-foreground">Quantity</span>
                  <Badge className="bg-blue-100 text-blue-800 border-blue-300">
                    {selectedRfq.quantity || ''}
                  </Badge>
                </div>
              </ContentSection>
              {/* Timeline */}
              <ContentSection
                className="col-span-1 bg-gradient-to-br from-purple-50 to-purple-100/50 border-purple-200/50"
                headerGradient="none"
                header={
                  <div className="flex items-start gap-2 text-foreground">
                    <div className="p-2 bg-purple-600 rounded-xl">
                      <CalendarIcon className="w-5 h-5 text-white" />
                    </div>
                    <h4>Vendor Information</h4>
                  </div>
                }
              >
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
                {selectedRfq.vendorContactEmail && (
                  <div className="flex justify-between items-center py-1">
                    <span className="text-sm text-muted-foreground">Email</span>
                    <CopyableText text={selectedRfq.vendorContactEmail} />
                  </div>
                )}
                <KeyValuePair
                  label="Phone"
                  value={selectedRfq.vendorContactPhone || ''}
                  valueType="string"
                />
              </ContentSection>

              {/* Quick Stats */}
              <ContentSection
                className="col-span-1 bg-gradient-to-br from-orange-50 to-orange-100/50 border-orange-200/50"
                headerGradient="none"
                header={
                  <div className="flex items-start gap-2 text-foreground">
                    <div className="p-2 bg-orange-600 rounded-xl">
                      <CalendarIcon className="w-5 h-5 text-white" />
                    </div>
                    <h4>General</h4>
                  </div>
                }
              >
                <KeyValuePair
                  keyClassName="max-w-1/2"
                  label="Status"
                  value={selectedRfq.status || ''}
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
              </ContentSection>
            </div>
          </ContentSection>
        )}
      </div>

      <Tabs
        tabs={[
          { label: 'Quotes', value: 'quotes' },
          { label: 'Analysis', value: 'analysis' },
          { label: 'Logistics', value: 'logistics' },
        ]}
        selectedTab="quotes"
        onTabChange={() => {}}
      >
        <TabsContent value="quotes">
          <BaseCard
            title="Technical Quotes Comparison"
            description="Compare and evaluate quotes for {selectedRfq?.rfqNumber}"
          >
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
                  {selectedRfqQuotes.filter((q: Quote) => q.status === 'pending').length > 0 && (
                    <span>
                      Pending:{' '}
                      {selectedRfqQuotes.filter((q: Quote) => q.status === 'pending').length}
                    </span>
                  )}
                  {selectedRfqQuotes.filter((q: Quote) => q.status === 'completed').length > 0 && (
                    <span className="text-green-600">
                      Accepted:{' '}
                      {selectedRfqQuotes.filter((q: Quote) => q.status === 'completed').length}
                    </span>
                  )}
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
                  triggerButtonIntent="add"
                  triggerButtonText="Upload Quote"
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
                        const quote = await createRandomQuote(selectedRfq.id);
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
        <TabsContent value="logistics">
          <div className="flex items-center justify-center h-full">
            <p className="text-muted-foreground">Coming Soon</p>
          </div>
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
