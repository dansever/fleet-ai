'use client';

import { LoadingComponent } from '@/components/miscellaneous/Loading';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useSidebar } from '@/components/ui/sidebar';
import { OrderDirection } from '@/drizzle/enums';
import { Rfq } from '@/drizzle/types';
import { createRandomRfq } from '@/features/rfqs/createRandomRfq';
import { convertPydanticToRfq, PydanticRFQ } from '@/features/rfqs/pydanticConverter';
import RfqDialog from '@/features/rfqs/RfqDialog';
import { formatDate } from '@/lib/core/formatters';
import { cn } from '@/lib/utils';
import { createRfq, extractRfq } from '@/services/technical/rfq-client';
import { Button } from '@/stories/Button/Button';
import { ListItemCard } from '@/stories/Card/Card';
import { ModernInput, ModernSelect } from '@/stories/Form/Form';
import { FileUploadPopover } from '@/stories/Popover/Popover';
import { StatusBadge } from '@/stories/StatusBadge/StatusBadge';
import { FileText, RefreshCw, Search, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';

interface RfqListProps {
  rfqs: Rfq[];
  onRfqSelect: (rfq: Rfq) => void;
  selectedRfq: Rfq | null;
  onRefresh: () => void;
  isLoading: boolean;
  isRefreshing?: boolean;
  InsertAddRfqButton?: boolean;
  onCreatedRfq?: () => void;
  rfqsDirection?: OrderDirection;
}

export default function RfqList({
  rfqs,
  onRfqSelect,
  selectedRfq,
  onRefresh,
  isLoading,
  isRefreshing = false,
  InsertAddRfqButton = true,
  onCreatedRfq,
  rfqsDirection = 'sent',
}: RfqListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [showAddRfqDialog, setShowAddRfqDialog] = useState(false);
  const { state } = useSidebar();
  const isCollapsed = state === 'collapsed';
  const [uploadRfqPopoverOpen, setUploadRfqPopoverOpen] = useState(false);

  const openAddRfqDialog = () => {
    setShowAddRfqDialog(true);
  };

  const handleSendRfqFile = async (file: File) => {
    try {
      const result = await extractRfq(file);
      const convertedRfq = convertPydanticToRfq(result as PydanticRFQ);
      const newRfq = await createRfq({ ...convertedRfq, direction: rfqsDirection });
      onCreatedRfq?.();
      toast.success('RFQ extracted successfully');
    } catch (error) {
      toast.error('Error extracting RFQ');
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

  // Create status options for multi-select
  const statusOptions = useMemo(() => {
    const uniqueStatuses = [...new Set(rfqs.map((rfq) => rfq.status || 'pending'))];
    return uniqueStatuses
      .map((status) => ({
        value: status,
        label: getStatusDisplay(status),
      }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [rfqs]);

  // Filter and sort RFQs
  const filteredRfqs = useMemo(() => {
    const filtered = rfqs.filter((rfq: Rfq) => {
      // Apply search filter
      const matchesSearch =
        !searchTerm ||
        rfq.rfqNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rfq.partNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rfq.vendorName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rfq.partDescription?.toLowerCase().includes(searchTerm.toLowerCase());

      // Apply status filter
      const matchesStatus =
        selectedStatuses.length === 0 || selectedStatuses.includes(rfq.status || 'pending');

      return matchesSearch && matchesStatus;
    });

    // Sort by creation date (newest first)
    return filtered.sort((a, b) => {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [rfqs, searchTerm, selectedStatuses]);

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedStatuses([]);
  };

  const hasActiveFilters = searchTerm || selectedStatuses.length > 0;

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex-shrink-0 px-4 py-2 border-b border-border">
        <div className="flex flex-row justify-between items-center">
          <h3 className="font-light italic">RFQs</h3>
          <StatusBadge status="secondary" text={rfqsDirection} />
          <div className="flex gap-2">
            <Button
              intent="ghost"
              icon={RefreshCw}
              size="md"
              className={`${isRefreshing ? 'animate-spin hover:bg-transparent' : ''}`}
              disabled={isLoading || isRefreshing}
              onClick={onRefresh}
            />
            {InsertAddRfqButton && (
              <>
                <FileUploadPopover
                  open={uploadRfqPopoverOpen}
                  onOpenChange={setUploadRfqPopoverOpen}
                  triggerIntent="add"
                  triggerText="RFQ"
                  triggerSize="md"
                  onSend={handleSendRfqFile}
                >
                  <div className="flex flex-col gap-2 text-sm">
                    <Button
                      intent="secondary"
                      text="Manually Add RFQ"
                      size="sm"
                      onClick={openAddRfqDialog}
                    />
                    <Button
                      intent="ghost"
                      text="Or generate random RFQ"
                      size="sm"
                      className="text-gray-500"
                      onClick={async () => {
                        const rfq = await createRandomRfq(rfqsDirection);
                        onCreatedRfq?.();
                        console.log('Time to close the popover');
                        setUploadRfqPopoverOpen(false);
                      }}
                    />
                  </div>
                </FileUploadPopover>
              </>
            )}
          </div>
        </div>
      </div>
      {/* Search Input */}
      <div className="flex-shrink-0 px-4 py-2 border-b border-border flex flex-col gap-2">
        <h3 className="font-light">Filters</h3>

        {/* Search Input */}
        <div className="relative">
          <ModernInput
            placeholder="Search RFQs"
            icon={<Search />}
            className="w-full"
            value={searchTerm}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Status Filter */}
        <div className="flex flex-row gap-2 items-center justify-between">
          <ModernSelect
            options={statusOptions}
            placeholder="Select Status"
            onValueChange={(value: string) => setSelectedStatuses(value.split(','))}
            value={selectedStatuses.join(',')}
          />

          {/* Clear Filters */}
          <Button
            intent="ghost"
            size="sm"
            icon={X}
            text="Clear"
            className="font-semibold hover:bg-transparent hover:underline"
            disabled={!hasActiveFilters}
            onClick={clearFilters}
          />
        </div>

        {/* Results Count */}
        <div className="text-sm text-muted-foreground">
          {filteredRfqs.length} of {rfqs.length} RFQs
        </div>
      </div>
      {/* RFQ List */}
      <div className="flex-1 min-h-0">
        <ScrollArea className="h-full overflow-y-auto">
          {/* Smoothly adjust inner padding as the sidebar width animates */}
          <div
            className={cn(
              'p-3 space-y-3 transition-[padding,opacity] duration-200 ease-in-out',
              !isCollapsed && 'pl-2',
            )}
          >
            {isLoading && filteredRfqs.length === 0 ? (
              // Loading state - use LoadingComponent
              <div className="flex justify-center py-8">
                <LoadingComponent size="sm" text="Loading RFQs..." />
              </div>
            ) : filteredRfqs.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                <FileText className="h-8 w-8 mx-auto mb-2" />
                <p>No RFQs found</p>
                {hasActiveFilters && (
                  <p className="text-sm">Try adjusting your search or filters</p>
                )}
              </div>
            ) : (
              filteredRfqs.map((rfq) => (
                <ListItemCard
                  key={rfq.id}
                  isSelected={selectedRfq?.id === rfq.id}
                  onClick={() => onRfqSelect(rfq)}
                  icon={<FileText />}
                  iconBackground="from-blue-400 to-blue-300"
                >
                  <div className="flex flex-row gap-1 overfl">
                    {/* Left side: main RFQ info */}
                    <div className="flex flex-col gap-1 flex-1 min-w-0 overflow-hidden">
                      <p className="text-sm font-semibold">{rfq.rfqNumber}</p>
                      <div>
                        <p className="text-xs font-medium">{rfq.partNumber}</p>
                        <p className="text-xs">{rfq.partDescription}</p>
                      </div>
                      <p className="text-xs">{formatDate(new Date(rfq.createdAt))}</p>
                    </div>
                    {/* Right side: badges */}
                    <div className="flex flex-col gap-2 items-end">
                      <StatusBadge
                        size="sm"
                        status="secondary"
                        text={getStatusDisplay(rfq.status || '')}
                      />
                      {rfq.quantity && (
                        <StatusBadge
                          size="sm"
                          status="secondary"
                          text={`Qty: ${rfq.quantity.toString()}`}
                        />
                      )}
                    </div>
                  </div>
                </ListItemCard>
              ))
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Add RFQ Dialog */}
      <RfqDialog
        rfq={null}
        DialogType="add"
        onChange={(rfq) => {
          onCreatedRfq?.();
          setShowAddRfqDialog(false);
        }}
        buttonSize="sm"
        triggerText="Add RFQ"
        open={showAddRfqDialog}
        onOpenChange={setShowAddRfqDialog}
        withTrigger={false}
      />
    </div>
  );
}
