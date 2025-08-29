'use client';

import { CopyableText } from '@/components/miscellaneous/CopyableText';
import { LoadingComponent } from '@/components/miscellaneous/Loading';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { getStatusDisplay } from '@/drizzle/schema/enums';
import { Quote } from '@/drizzle/types';
import QuoteDialog from '@/features/quotes/quoteDialog';
import { formatCurrency, formatDate } from '@/lib/core/formatters';
import { deleteQuote } from '@/services/technical/quote-client';
import { updateRfq } from '@/services/technical/rfq-client';
import { Button } from '@/stories/Button/Button';
import { Column, DataTable } from '@/stories/DataTable/DataTable';
import { ConfirmationPopover } from '@/stories/Popover/Popover';
import {
  Calendar,
  CheckCircle,
  Clock,
  Eye,
  FileText,
  MessageSquare,
  Package,
  Shield,
  Trash,
  Truck,
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { useTechnicalProcurement } from '../ContextProvider';

interface QuotesComparisonProps {
  isRefreshing?: boolean;
}

const getStatusBadge = (status: string | null) => {
  if (!status) return <Badge variant="secondary">Unknown</Badge>;

  const displayText = getStatusDisplay(status);

  switch (status.toLowerCase()) {
    case 'completed':
      return (
        <Badge variant="default" className="bg-green-100 text-green-800 border-green-200">
          <CheckCircle className="w-3 h-3 mr-1" />
          {displayText}
        </Badge>
      );
    case 'in_progress':
      return (
        <Badge variant="default" className="bg-blue-100 text-blue-800 border-blue-200">
          <Clock className="w-3 h-3 mr-1" />
          {displayText}
        </Badge>
      );
    case 'pending':
      return (
        <Badge variant="secondary">
          <Clock className="w-3 h-3 mr-1" />
          {displayText}
        </Badge>
      );
    case 'draft':
      return (
        <Badge variant="outline">
          <FileText className="w-3 h-3 mr-1" />
          {displayText}
        </Badge>
      );
    case 'closed':
      return (
        <Badge variant="secondary" className="bg-gray-100 text-gray-700 border-gray-200">
          {displayText}
        </Badge>
      );
    default:
      return <Badge variant="secondary">{displayText}</Badge>;
  }
};

const createQuoteColumns = (
  acceptedQuoteId: Quote['id'] | null,
  acceptingQuoteId: Quote['id'] | null,
  onDeleteQuote: (quoteId: string) => Promise<void>,
  onUpdateQuote: (quote: Quote) => void,
  onAcceptQuote: (quoteId: string) => Promise<void>,
): Column<Quote>[] => [
  {
    key: 'actions',
    header: 'Actions',
    accessor: (quote) => (
      <div className="flex flex-col gap-1.5">
        <Button
          intent={acceptedQuoteId === quote.id ? 'success' : 'secondary'}
          text={
            acceptedQuoteId === quote.id
              ? 'Accepted'
              : acceptingQuoteId === quote.id
                ? 'Accepting...'
                : 'Accept'
          }
          icon={CheckCircle}
          disabled={acceptedQuoteId === quote.id || acceptingQuoteId === quote.id}
          size="sm"
          onClick={() => onAcceptQuote(quote.id)}
          className="disabled:opacity-100 disabled:pointer-events-none w-full hover:bg-green-50 hover:text-green-700 hover:border-green-200"
        />

        <QuoteDialog
          quote={quote}
          onChange={onUpdateQuote}
          DialogType="view"
          triggerButtonText="View"
          triggerButtonIntent="secondary"
          triggerButtonIcon={Eye}
          TriggerButtonSize="sm"
        />
        <ConfirmationPopover
          trigger={
            <Button
              intent="secondary"
              icon={Trash}
              text="Delete"
              size="sm"
              onClick={() => {}}
              className="hover:bg-red-50 hover:text-red-700 hover:border-red-200"
            />
          }
          intent="danger"
          title="Delete Quote"
          description="Are you sure you want to delete this quote?"
          onConfirm={() => onDeleteQuote(quote.id)}
        />
      </div>
    ),
    align: 'center' as const,
  },
  {
    key: 'status',
    header: 'Status',
    accessor: (quote) => (
      <div className="min-w-[120px] flex flex-col gap-1">
        {getStatusBadge(quote.status)}
        {quote.sentAt && (
          <div className="text-xs text-slate-500">Received {formatDate(quote.sentAt)}</div>
        )}
      </div>
    ),
    sortable: true,
    align: 'left' as const,
  },
  {
    key: 'vendor',
    header: 'Vendor Information',
    accessor: (quote) => (
      <div className="min-w-[180px]">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
            {(quote.vendorName || 'U').charAt(0).toUpperCase()}
          </div>
          <div className="font-semibold text-slate-900 text-sm">
            {quote.vendorName || 'Unknown Vendor'}
          </div>
        </div>
        {quote.vendorContactName && (
          <div className="text-sm text-slate-600 ml-10">{quote.vendorContactName}</div>
        )}
        {quote.vendorContactEmail && (
          <div className="text-xs text-slate-500 ml-10">
            <CopyableText text={quote.vendorContactEmail} className="text-xs" />
          </div>
        )}
        {quote.vendorContactPhone && (
          <div className="text-xs text-slate-500 ml-10">{quote.vendorContactPhone}</div>
        )}
      </div>
    ),
    sortable: true,
    align: 'left' as const,
  },
  {
    key: 'part',
    header: 'Part Details',
    accessor: (quote) => (
      <div className="min-w-[200px]">
        <div className="flex items-start gap-2 mb-2">
          <Package className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
          <div>
            {quote.partNumber && (
              <div className="font-semibold text-slate-900 text-sm">{quote.partNumber}</div>
            )}
            {quote.partDescription && (
              <div className="text-sm text-slate-700 leading-tight">{quote.partDescription}</div>
            )}
          </div>
        </div>
        <div className="flex flex-wrap gap-1 ml-6">
          {quote.partCondition && (
            <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
              {quote.partCondition}
            </Badge>
          )}
          {quote.serialNumber && (
            <Badge variant="outline" className="text-xs">
              SN: {quote.serialNumber}
            </Badge>
          )}
          {quote.quantity && (
            <Badge variant="outline" className="text-xs bg-gray-50 text-gray-700">
              Qty: {quote.quantity} {quote.unitOfMeasure || 'EA'}
            </Badge>
          )}
        </div>
      </div>
    ),
    sortable: true,
    align: 'left' as const,
  },
  {
    key: 'pricing',
    header: 'Pricing',
    accessor: (quote) => (
      <div className="min-w-[140px] flex flex-col gap-2">
        <div className="flex items-center gap-2 mb-1 font-bold text-lg">
          {quote.price ? formatCurrency(Number(quote.price), quote.currency) : '-'}
        </div>

        {quote.pricingType && (
          <Badge variant="outline" className="text-xs bg-gray-50 text-gray-700">
            {quote.pricingType}
          </Badge>
        )}
        {quote.minimumOrderQuantity && (
          <Badge variant="outline" className="text-xs bg-gray-50 text-gray-700">
            MOQ: {quote.minimumOrderQuantity}
          </Badge>
        )}
      </div>
    ),
    sortable: true,
    align: 'left' as const,
  },
  {
    key: 'delivery',
    header: 'Delivery & Terms',
    accessor: (quote) => (
      <div className="min-w-[160px] text-sm">
        {quote.leadTime && (
          <div className="flex items-center gap-2 mb-1">
            <Clock className="w-3 h-3 text-orange-500" />
            <span className="text-slate-700">Lead: {quote.leadTime}</span>
          </div>
        )}
        {quote.deliveryTerms && (
          <div className="flex items-center gap-2 mb-1">
            <Truck className="w-3 h-3 text-blue-500" />
            <span className="text-slate-700">{quote.deliveryTerms}</span>
          </div>
        )}
        {quote.paymentTerms && (
          <div className="text-xs text-slate-600 mb-1">Payment: {quote.paymentTerms}</div>
        )}
        {quote.quoteExpirationDate && (
          <div className="flex items-center gap-1 text-xs text-amber-600">
            <Calendar className="w-3 h-3" />
            <span>Expires: {formatDate(quote.quoteExpirationDate)}</span>
          </div>
        )}
      </div>
    ),
    align: 'left' as const,
  },
  {
    key: 'compliance',
    header: 'Compliance & Quality',
    accessor: (quote) => (
      <div className="min-w-[160px] text-sm">
        {quote.warranty && (
          <div className="flex items-center gap-2 mb-1">
            <Shield className="w-3 h-3 text-green-500" />
            <span className="text-slate-700">{quote.warranty}</span>
          </div>
        )}
        {quote.certifications && quote.certifications.length > 0 && (
          <div className="mb-2">
            <div className="text-xs text-slate-600 mb-1">Certifications:</div>
            <div className="flex flex-wrap gap-1">
              {quote.certifications.slice(0, 3).map((cert, index) => (
                <Badge
                  key={index}
                  variant="outline"
                  className="text-xs bg-green-50 text-green-700 border-green-200"
                >
                  {cert}
                </Badge>
              ))}
              {quote.certifications.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{quote.certifications.length - 3} more
                </Badge>
              )}
            </div>
          </div>
        )}
        {quote.traceTo && (
          <div className="text-xs text-slate-600">
            <span className="font-medium">Trace to:</span> {quote.traceTo}
          </div>
        )}
        {quote.tagType && (
          <div className="text-xs text-slate-600">
            <span className="font-medium">Tag:</span> {quote.tagType}
            {quote.taggedBy && <span className="text-slate-500"> by {quote.taggedBy}</span>}
          </div>
        )}
      </div>
    ),
    align: 'left' as const,
  },
  {
    key: 'comments',
    header: 'Additional Information',
    accessor: (quote) => (
      <div className="min-w-[200px] text-sm">
        {quote.vendorComments && (
          <div className="mb-2">
            <div className="flex items-center gap-2 mb-1">
              <MessageSquare className="w-3 h-3 text-blue-500" />
              <span className="text-xs font-medium text-slate-600">Vendor Notes:</span>
            </div>
            <div className="text-slate-700 italic text-xs leading-relaxed bg-slate-50 p-2 rounded border-l-2 border-blue-200">
              {quote.vendorComments}
            </div>
          </div>
        )}
        {quote.coreDue && (
          <div className="text-xs text-slate-600 mb-1">
            <span className="font-medium">Core Due:</span> {quote.coreDue}
          </div>
        )}
        {quote.coreChange && (
          <div className="text-xs text-slate-600">
            <span className="font-medium">Core Change:</span> {quote.coreChange}
          </div>
        )}
      </div>
    ),
    align: 'left' as const,
  },
];

export default function QuotesComparison({ isRefreshing = false }: QuotesComparisonProps) {
  const {
    selectedRfq,
    selectedRfqQuotes,
    isLoadingQuotes,
    refreshSelectedRfqQuotes,
    deleteQuote: removeQuoteFromCache,
    updateQuote,
    refreshSelectedRfq,
    updateRfq: updateRfqLocal,
  } = useTechnicalProcurement();
  const [acceptingQuoteId, setAcceptingQuoteId] = useState<Quote['id'] | null>(null);

  const handleQuoteAccept = async (quoteId: string) => {
    try {
      if (!selectedRfq?.id) {
        toast.error('No RFQ selected');
        return;
      }
      setAcceptingQuoteId(quoteId);

      // Update on server
      await updateRfq(selectedRfq.id, { selectedQuoteId: quoteId });

      // Optimistically update local RFQ state
      updateRfqLocal({ ...selectedRfq, selectedQuoteId: quoteId });

      // Refresh quotes and RFQ in parallel for immediate consistency
      await Promise.all([refreshSelectedRfqQuotes(), refreshSelectedRfq()]);
      toast.success('Quote accepted successfully');
    } catch (error) {
      console.error('Error accepting quote:', error);
      toast.error('Failed to accept quote');
    }
    setAcceptingQuoteId(null);
  };

  // Handle quote deletion with optimistic updates
  const handleQuoteDelete = async (quoteId: string) => {
    try {
      // Optimistic update: remove from cache immediately
      removeQuoteFromCache(quoteId);

      // Delete from server
      await deleteQuote(quoteId);

      toast.success('Quote deleted successfully');
    } catch (error) {
      console.error('Error deleting quote:', error);
      toast.error('Failed to delete quote');

      // If deletion failed, refresh to restore the correct state
      await refreshSelectedRfqQuotes();
    }
  };

  // Create columns with the delete handler
  const quoteColumns = createQuoteColumns(
    selectedRfq?.selectedQuoteId || null,
    acceptingQuoteId,
    handleQuoteDelete,
    updateQuote,
    handleQuoteAccept,
  );

  if (!selectedRfq) {
    return (
      <Card className="bg-gradient-to-br from-white to-slate-100 border-slate-200 shadow-lg rounded-2xl">
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <Package className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <p className="text-slate-600">Select an RFQ to view quotes comparison</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Show loading message when initially loading quotes (no existing data) and NOT refreshing
  if (isLoadingQuotes && selectedRfqQuotes.length === 0 && !isRefreshing) {
    return <LoadingComponent text="Loading quotes..." />;
  }

  // Show "no quotes" message only when not loading/refreshing and no quotes exist
  if (selectedRfqQuotes.length === 0 && !isLoadingQuotes && !isRefreshing) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8 text-blue-500" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">No quotes yet</h3>
          <p className="text-slate-600 mb-4">Upload quote documents to start comparing offers</p>
        </div>
      </div>
    );
  }

  // Show table with subtle refreshing indicator
  return (
    <DataTable
      data={selectedRfqQuotes}
      columns={quoteColumns}
      searchable={true}
      filterable={true}
      pagination={true}
      pageSize={10}
      onRowClick={() => {}}
    />
  );
}
