'use client';

import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/stories/Button/Button';
import { FileUploadPopover } from '@/stories/Popover/Popover';
// import { MultiSelect, MultiSelectOption } from '@/components/ui/multi-select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Rfq } from '@/drizzle/types';
// import { RfqDialog } from '@/features/rfqs/components/RfqDialog';
// import { fromPydanticRfq } from '@/lib/converters/rfq-converter';
import { createRandomRfq } from '@/features/rfqs/utils';
import { formatCompactNumber } from '@/lib/core/formatters';
// import { extractRfqDataFromFile } from '@/services/technical/rfq-client';
import {
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  Clock,
  FileText,
  Hash,
  MapPin,
  MessageSquare,
  Package,
  Search,
  Upload,
  X,
  Zap,
} from 'lucide-react';
import { useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';

type UserLookup = {
  [userId: string]: {
    id: string;
    name: string;
    email: string;
  };
};

interface RfqListProps {
  rfqs: Rfq[];
  orgUsers: any[];
  selectedRfq: Rfq | null;
  onRfqSelect: (rfq: Rfq) => void;
  updateRfq: (rfqId: string, updates: Partial<Rfq>) => Promise<Rfq>;
  addRfq: (newRfq: Rfq) => Promise<Rfq>;
}

// Add RFQ Popover Component
function AddRfqPopover({
  updateRfq,
  addRfq,
}: {
  updateRfq: (rfqId: string, updates: Partial<Rfq>) => Promise<Rfq>;
  addRfq: (newRfq: Rfq) => Promise<Rfq>;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [isRfqDialogOpen, setIsRfqDialogOpen] = useState(false);
  const [extractedRfqData, setExtractedRfqData] = useState<Partial<Rfq> | null>(null);
  const [isReviewMode, setIsReviewMode] = useState(false);

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleUploadRfq = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    try {
      // const extractedRfq = await extractRfqDataFromFile(selectedFile);
      // const convertedRfq = fromPydanticRfq(extractedRfq.data);

      // Set the extracted data and open review dialog
      setExtractedRfqData(null);
      setIsReviewMode(true);
      setIsRfqDialogOpen(true);
      setIsPopoverOpen(false);
      setSelectedFile(null);

      toast.success('RFQ extracted successfully - please review and approve');
    } catch (error) {
      console.error('Upload failed:', error);
      toast.error('Failed to extract RFQ');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <>
      <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
        <PopoverTrigger asChild>
          <Button intent="add" text="Add RFQ" />
        </PopoverTrigger>
        <PopoverContent className="w-80 shadow-xl border-0 rounded-xl">
          <div className="space-y-4">
            <div className="space-y-2">
              <h4 className="font-medium leading-none">Add New RFQ</h4>
              <p className="text-sm text-muted-foreground">
                Upload a PDF file to create a new RFQ.
              </p>
            </div>
            {selectedFile ? (
              <div className="gap-4 flex flex-col border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                <p className="text-gray-600 text-sm flex flex-col">
                  <span className="font-bold">{selectedFile.name}</span>
                  <span className="text-gray-500">
                    {formatCompactNumber(selectedFile.size / 1024)} KB
                  </span>
                </p>
                <div className="flex flex-row gap-2 justify-center">
                  <Button
                    intent="secondary"
                    text={isUploading ? 'Uploading...' : 'Upload RFQ'}
                    onClick={handleUploadRfq}
                    disabled={isUploading}
                  />
                  <Button
                    intent="danger"
                    text="Remove File"
                    onClick={() => {
                      setIsPopoverOpen(false);
                      setSelectedFile(null);
                    }}
                  />
                </div>
              </div>
            ) : (
              <div className="gap-4 flex flex-col border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                <Upload className="text-gray-400 mx-auto" />
                <p className="text-gray-600">Drop your PDF here or click to browse</p>

                <Button
                  intent="primary"
                  text="Choose File"
                  onClick={() => fileInputRef.current?.click()}
                />

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="application/pdf"
                  className="hidden"
                  onChange={handleFileInputChange}
                />

                <p className="text-xs text-gray-500">Maximum file size: 10MB</p>
              </div>
            )}
            <div className="text-sm font-medium text-gray-600 text-center">OR</div>
            <div className="flex justify-center">
              <Button
                intent="secondary"
                text="Manually Add a New RFQ"
                onClick={() => {
                  setIsRfqDialogOpen(true);
                  setIsPopoverOpen(false);
                }}
              />
            </div>
          </div>
        </PopoverContent>
      </Popover>

      {/* RFQ Dialog for manual entry or review */}
      {/* <RfqDialog
        open={isRfqDialogOpen}
        onOpenChange={(open) => {
          setIsRfqDialogOpen(open);
          if (!open) {
            // Reset states when dialog closes
            setIsReviewMode(false);
            setExtractedRfqData(null);
          }
        }}
        rfq={isReviewMode ? extractedRfqData : null}
        isNewRfq={!isReviewMode}
        enableAddToDb={true}
        onUpdateRfq={updateRfq}
        onRfqSaved={(savedRfq) => {
          addRfq(savedRfq);
          // Reset review mode after successful save
          setIsReviewMode(false);
          setExtractedRfqData(null);
        }} */}
      {/* /> */}
    </>
  );
}

export default function RfqList({
  rfqs,
  orgUsers,
  selectedRfq,
  onRfqSelect,
  updateRfq,
  addRfq,
}: RfqListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<string>('All');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [timePeriod, setTimePeriod] = useState<number>(30); // Default to 30 days (1 month)
  const [sortBy, setSortBy] = useState<'date' | 'urgency' | 'rfqNumber'>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc'); // desc = newest first for date

  // Create user lookup map from orgUsers
  const userLookup = useMemo<UserLookup>(() => {
    const lookup: UserLookup = {};
    orgUsers.forEach((user) => {
      lookup[user.id] = {
        id: user.id,
        name: user.displayName || '',
        email: user.email || '',
      };
    });
    return lookup;
  }, [orgUsers]);

  // Get unique users from the data for multi-select
  const availableUsers = useMemo(() => {
    const userIds = [
      ...new Set(
        rfqs
          .map((item) => item.userId)
          .filter((userId): userId is string => userId !== null && userId !== undefined),
      ),
    ];
    return userIds
      .map((userId) => ({
        id: userId,
        name: userLookup[userId]?.name || userId,
        email: userLookup[userId]?.email || '',
      }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [rfqs, userLookup]);

  // Create user options for multi-select
  // const userOptions: MultiSelectOption[] = useMemo(() => {
  //   return availableUsers.map((user) => ({
  //     value: user.id,
  //     label: user.name || user.email,
  //   }));
  // }, [availableUsers]);

  // Get available priorities with counts
  const availablePriorities = useMemo(() => {
    const priorityCounts: Record<string, number> = {};

    rfqs.forEach((rfq) => {
      const priority = rfq.urgencyLevel;
      priorityCounts[priority || 'Routine'] = (priorityCounts[priority || 'Routine'] || 0) + 1;
    });

    // Define priority order for consistent display
    const priorityOrder = ['AOG', 'Critical', 'Urgent', 'Routine'];

    return priorityOrder
      .filter((priority) => priorityCounts[priority] > 0)
      .map((priority) => ({
        value: priority,
        label: priority,
        count: priorityCounts[priority],
      }));
  }, [rfqs]);

  // Filter and sort RFQs
  const filteredRfqs = useMemo(() => {
    let filtered = rfqs;

    // Apply time period filter
    if (timePeriod < 99999) {
      // 99999 is "All" option
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - timePeriod);

      filtered = filtered.filter((item) => {
        // Use sentAt if available, otherwise fall back to createdAt
        const dateToCheck = item.sentAt || item.createdAt;
        if (!dateToCheck) return true; // Include items without dates

        const itemDate = new Date(dateToCheck);
        return itemDate >= cutoffDate;
      });
    }

    // Apply priority filter
    if (priorityFilter !== 'All') {
      filtered = filtered.filter((item) => {
        const itemPriority = item.urgencyLevel?.toLowerCase();
        const filterPriority = priorityFilter.toLowerCase();
        return itemPriority === filterPriority;
      });
    }

    // Apply user filter
    if (selectedUsers.length > 0) {
      filtered = filtered.filter((item) => item.userId && selectedUsers.includes(item.userId));
    }

    // Apply search filter
    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase().trim();
      filtered = filtered.filter((item) => {
        return (
          (item.rfqNumber && item.rfqNumber.toLowerCase().includes(search)) ||
          (item.partNumber && item.partNumber.toLowerCase().includes(search)) ||
          (item.partDescription && item.partDescription.toLowerCase().includes(search))
        );
      });
    }

    // Sort based on selected sort criteria and direction
    return filtered.sort((a, b) => {
      let result = 0;

      switch (sortBy) {
        case 'date':
          // Sort by creation date
          const dateA = new Date(a.sentAt || a.createdAt || 0);
          const dateB = new Date(b.sentAt || b.createdAt || 0);
          result = dateA.getTime() - dateB.getTime();
          break;

        case 'urgency':
          // Sort by urgency level (AOG > Critical > Urgent > Routine)
          const urgencyOrder = { AOG: 0, Critical: 1, Urgent: 2, Routine: 3 };
          const urgencyA = urgencyOrder[a.urgencyLevel as keyof typeof urgencyOrder] ?? 3;
          const urgencyB = urgencyOrder[b.urgencyLevel as keyof typeof urgencyOrder] ?? 3;

          // If urgency levels are the same, sort by date (newest first)
          if (urgencyA === urgencyB) {
            const dateA = new Date(a.sentAt || a.createdAt || 0);
            const dateB = new Date(b.sentAt || b.createdAt || 0);
            result = dateB.getTime() - dateA.getTime();
          } else {
            result = urgencyA - urgencyB;
          }
          break;

        case 'rfqNumber':
          // Sort alphabetically by RFQ number
          const rfqA = a.rfqNumber || '';
          const rfqB = b.rfqNumber || '';
          result = rfqA.localeCompare(rfqB);
          break;

        default:
          return 0;
      }

      // Apply sort direction
      return sortDirection === 'desc' ? -result : result;
    });
  }, [rfqs, searchTerm, priorityFilter, selectedUsers, timePeriod, sortBy, sortDirection]);

  const clearFilters = () => {
    setSearchTerm('');
    setPriorityFilter('All');
    setSelectedUsers([]);
    setTimePeriod(30);
  };

  // Handle sort button clicks
  const handleSortClick = (sortType: 'date' | 'urgency' | 'rfqNumber') => {
    if (sortBy === sortType) {
      // Toggle direction if same sort type
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // Switch to new sort type with appropriate default direction
      setSortBy(sortType);
      setSortDirection(sortType === 'date' ? 'desc' : 'asc'); // Date defaults to newest first, others to A-Z/High-Low
    }
  };

  const hasActiveFilters =
    searchTerm || priorityFilter !== 'All' || selectedUsers.length > 0 || timePeriod !== 30;

  return (
    <div className="h-full flex flex-col">
      {/* Header with Title and Add Button */}
      <div className="flex-shrink-0 px-4 py-2 border-b border-border">
        <div className="flex flex-row justify-between">
          <h1 className="font-light italic">Sent RFQs</h1>
          <FileUploadPopover
            triggerButtonIntent="primary"
            triggerButtonText="Add RFQ"
            popoverContentAlign="start"
            onSend={() => {}}
            onManualUpload={() => {
              createRandomRfq().then((rfq) => {
                addRfq(rfq);
              });
            }}
            className="w-40"
          />
        </div>
        <p className="text-sm text-muted-foreground">{rfqs.length} RFQs</p>
      </div>

      {/* Search Input */}
      <div className="flex-shrink-0 px-4 py-2 border-b border-border flex flex-col gap-2">
        <h3 className="font-light">Filters</h3>

        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search RFQs"
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Country Filter */}
        <div className="relative">
          {/* <MultiSelect
            options={userOptions}
            selected={selectedUsers}
            onChange={setSelectedUsers}
            placeholder="Select users..."
            disabled={false}
            maxDisplay={3}
          /> */}
        </div>

        {/* Clear Filters */}
        {hasActiveFilters && (
          <Button
            intent="secondary"
            size="sm"
            onClick={clearFilters}
            text="Clear filters"
            icon={X}
            iconPosition="right"
          />
        )}

        {/* Results Count + Sort Buttons */}
        <div className="text-sm flex flex-row justify-between font-semibold">
          {filteredRfqs.length} of {rfqs.length} RFQs
          <div className="flex gap-1">
            <Button
              intent="ghost"
              size="sm"
              onClick={() => handleSortClick('date')}
              text="Date"
              icon={Clock}
              iconPosition="left"
            />
            {sortBy === 'date' &&
              (sortDirection === 'desc' ? (
                <ArrowDown className="h-3 w-3" />
              ) : (
                <ArrowUp className="h-3 w-3" />
              ))}
            <Button
              intent="ghost"
              size="sm"
              onClick={() => handleSortClick('urgency')}
              text="Urgency"
              icon={Zap}
              iconPosition="left"
            />
            {sortBy === 'urgency' &&
              (sortDirection === 'desc' ? (
                <ArrowDown className="h-3 w-3" />
              ) : (
                <ArrowUp className="h-3 w-3" />
              ))}
          </div>
        </div>
      </div>

      {/* RFQ List */}
      <div className="flex-1 min-h-0">
        <ScrollArea className="h-full">
          <div className="p-2 space-y-2">
            {filteredRfqs.map((rfq) => (
              <RfqListCard
                key={rfq.id}
                rfq={rfq}
                selectedRfq={selectedRfq}
                onRfqSelect={onRfqSelect}
              />
            ))}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}

interface RfqListCardProps {
  rfq: Rfq;
  selectedRfq: Rfq | null;
  onRfqSelect: (rfq: Rfq) => void;
}

function RfqListCard({ rfq, selectedRfq, onRfqSelect }: RfqListCardProps) {
  const getPriorityBadgeVariant = (priority: string | null) => {
    if (!priority) return 'outline';
    switch (priority.toUpperCase()) {
      case 'AOG':
        return 'destructive';
      case 'CRITICAL':
        return 'warning';
      case 'URGENT':
        return 'warning';
      default:
        return 'outline';
    }
  };

  const getPriorityIcon = (priority: string | null) => {
    if (!priority) return <Clock className="h-3 w-3" />;
    switch (priority.toUpperCase()) {
      case 'AOG':
        return <Zap className="h-3 w-3" />;
      case 'CRITICAL':
      case 'URGENT':
        return <AlertTriangle className="h-3 w-3" />;
      default:
        return <Clock className="h-3 w-3" />;
    }
  };

  const isActive = selectedRfq?.id === rfq.id;

  return (
    <Card
      className={`px-4 py-2 bg-accent/10 border-1 border-accent/20 shadow-none
        hover:border-accent hover:cursor-pointer
        rounded-lg transition-all duration-300
        ${isActive && 'bg-accent/40  hover:bg-accent/50 border-accent/40'}`}
      onClick={() => onRfqSelect(rfq)}
    >
      <CardHeader className="p-0">
        {/* Header Row */}
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-blue-600" />
            <span className="font-semibold text-sm text-gray-900">{rfq.rfqNumber}</span>
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge>
              <MessageSquare className="h-3 w-3 mr-1" />1{/* {rfq.quotesReceived || 0} */}
            </Badge>
            <Badge className="text-xs">
              {getPriorityIcon(rfq.urgencyLevel)}
              <span className="ml-1">{rfq.urgencyLevel}</span>
            </Badge>
          </div>
        </div>

        {/* Part Information */}
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Hash className="h-3 w-3 text-gray-500" />
            <span className="text-xs font-medium text-gray-700">
              {rfq.partNumber || 'No Part #'}
            </span>
          </div>

          {rfq.partDescription && (
            <p className="text-xs text-gray-600 line-clamp-2 leading-tight">
              {rfq.partDescription}
            </p>
          )}
        </div>

        {/* Quantity and Location */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Package className="h-3 w-3 text-gray-500" />
            <span className="text-xs text-gray-700">
              {rfq.quantity || 0} {rfq.unitOfMeasure || 'EA'}
              {rfq.partNumber || 'No Part #'}
            </span>
          </div>

          {rfq.partDescription && (
            <p className="text-xs text-gray-600 line-clamp-2 leading-tight">
              {rfq.partDescription}
            </p>
          )}
        </div>

        {/* Quantity and Location */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Package className="h-3 w-3 text-gray-500" />
            <span className="text-xs text-gray-700">
              {rfq.quantity || 0} {rfq.unitOfMeasure || 'EA'}
            </span>
          </div>

          {rfq.deliverTo && (
            <div className="flex items-center gap-1">
              <MapPin className="h-3 w-3 text-gray-500" />
              <span className="text-xs text-gray-600 truncate max-w-24">{rfq.deliverTo}</span>
            </div>
          )}
        </div>
      </CardHeader>
    </Card>
  );
}
