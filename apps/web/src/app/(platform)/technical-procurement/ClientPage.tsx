'use client';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useSidebar } from '@/components/ui/sidebar';
import RfqDialog from '@/features/rfqs/RfqDialog';
import { formatDate } from '@/lib/core/formatters';
import { Button } from '@/stories/Button/Button';
import { ContentSection } from '@/stories/Card/Card';
import { PageLayout } from '@/stories/PageLayout/PageLayout';
import { ConfirmationPopover } from '@/stories/Popover/Popover';
import { KeyValuePair } from '@/stories/Utilities/KeyValuePair';
import { CalendarIcon, FileText, Plus, RefreshCw, TrashIcon } from 'lucide-react';
import { useTechnicalProcurement } from './ContextProvider';
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
    updateRfq,
    addRfq,
  } = useTechnicalProcurement();
  const { state } = useSidebar();
  const isCollapsed = state === 'collapsed';

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

  const getStatusDisplay = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Pending';
      case 'sent':
        return 'Sent';
      case 'quoted':
        return 'Quoted';
      case 'approved':
        return 'Approved';
      case 'rejected':
        return 'Rejected';
      default:
        return status;
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
              {getStatusDisplay(selectedRfq.status || 'pending')}
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
                      onConfirm={() => {}}
                      open={false}
                      onOpenChange={() => {}}
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
                <KeyValuePair
                  label="Quantity"
                  value={
                    <Badge className="bg-blue-100 text-blue-800 border-blue-300">
                      {selectedRfq.quantity || ''}
                    </Badge>
                  }
                  valueType="number"
                />
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
                  label="Contact Name"
                  value={selectedRfq.vendorContactName || ''}
                  valueType="string"
                />
                <KeyValuePair
                  label="Contact Email"
                  value={selectedRfq.vendorContactEmail || ''}
                  valueType="string"
                />
                <KeyValuePair
                  label="Contact Phone"
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
                    <h4>TBD</h4>
                  </div>
                }
              >
                <KeyValuePair
                  keyClassName="max-w-1/2"
                  label="Urgency"
                  value={selectedRfq.urgencyLevel || ''}
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

      {/* Quotes Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Received Quotes</CardTitle>
              <CardDescription>
                {selectedRfqQuotes.length} quote{selectedRfqQuotes.length !== 1 ? 's' : ''} received
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                intent="ghost"
                onClick={refreshSelectedRfqQuotes}
                disabled={isLoadingQuotes}
                icon={RefreshCw}
                className={`${isLoadingQuotes && 'animate-spin'}`}
              />
              <Button intent="secondary" text="Add Quote" icon={Plus} />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoadingQuotes ? (
            <div className="text-center text-muted-foreground py-8">
              <RefreshCw className="h-8 w-8 mx-auto mb-2 animate-spin" />
              <p>Loading quotes...</p>
            </div>
          ) : selectedRfqQuotes.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              <FileText className="h-8 w-8 mx-auto mb-2" />
              <p>No quotes received yet</p>
              <p className="text-sm">Quotes will appear here once vendors respond</p>
            </div>
          ) : (
            <div className="space-y-4">
              {selectedRfqQuotes.map((quote) => (
                <Card key={quote.id} className="border-l-4 border-l-blue-500">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-medium">Quote #{quote.id.slice(0, 8)}</h4>
                        <p className="text-sm text-muted-foreground">
                          Received: {formatDate(new Date(quote.createdAt))}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">Price: TBD</p>
                        <p className="text-sm text-muted-foreground">Valid until: TBD</p>
                      </div>
                    </div>
                    <Separator className="my-3" />
                    <div className="flex gap-2">
                      <Button intent="secondary" size="sm" text="View Details" />
                      <Button intent="secondary" size="sm" text="Compare" />
                      <Button intent="secondary" size="sm" text="Approve" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
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
