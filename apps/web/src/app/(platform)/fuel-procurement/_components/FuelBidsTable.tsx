import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FuelBid, FuelTender } from '@/drizzle/types';
import { Button } from '@/stories/Button/Button';
import { Column, DataTable } from '@/stories/DataTable/DataTable';
import { FileUploadPopover } from '@/stories/Popover/Popover';
import { CheckCircle, Clock, FileText, RefreshCw, XCircle } from 'lucide-react';

interface FuelBidsTableProps {
  fuelBids: FuelBid[];
  tender: FuelTender;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

const formatCurrency = (amount: string | number | null, currency = 'USD') => {
  if (!amount) return '-';
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 4,
  }).format(num);
};

const formatDate = (date: string | Date | null) => {
  if (!date) return '-';
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
};

const getDecisionBadge = (decision: string | null) => {
  if (!decision) return <Badge variant="secondary">Pending</Badge>;

  switch (decision.toLowerCase()) {
    case 'accepted':
    case 'winner':
      return (
        <Badge variant="default" className="bg-green-100 text-green-800 border-green-200">
          <CheckCircle className="w-3 h-3 mr-1" />
          Accepted
        </Badge>
      );
    case 'rejected':
      return (
        <Badge variant="destructive">
          <XCircle className="w-3 h-3 mr-1" />
          Rejected
        </Badge>
      );
    default:
      return (
        <Badge variant="secondary">
          <Clock className="w-3 h-3 mr-1" />
          Under Review
        </Badge>
      );
  }
};

const fuelBidColumns: Column<FuelBid>[] = [
  {
    key: 'vendor',
    header: 'Vendor',
    accessor: (bid) => (
      <div className="min-w-[200px]">
        <div className="font-semibold text-slate-900">{bid.vendorName || 'Unknown Vendor'}</div>
        {bid.vendorContactName && (
          <div className="text-sm text-slate-600">{bid.vendorContactName}</div>
        )}
        {bid.vendorContactEmail && (
          <div className="text-xs text-slate-500">{bid.vendorContactEmail}</div>
        )}
        {bid.vendorContactPhone && (
          <div className="text-xs text-slate-500">{bid.vendorContactPhone}</div>
        )}
      </div>
    ),
    sortable: true,
    align: 'left' as const,
  },
  {
    key: 'pricing',
    header: 'Base Pricing',
    accessor: (bid) => (
      <div className="min-w-[180px]">
        <div className="font-semibold text-lg text-slate-900">
          {bid.normalizedUnitPriceUsdPerUsg
            ? formatCurrency(bid.normalizedUnitPriceUsdPerUsg, 'USD')
            : bid.baseUnitPrice
              ? formatCurrency(bid.baseUnitPrice, bid.currency || 'USD')
              : '-'}
        </div>
        <div className="text-sm text-slate-600">
          {bid.normalizedUnitPriceUsdPerUsg
            ? 'USD/USG (normalized)'
            : `${bid.currency || 'USD'}/${bid.uom || 'USG'}`}
        </div>
        {bid.priceType && (
          <Badge variant="outline" className="text-xs mt-1">
            {bid.priceType === 'index_formula' ? 'Index-Linked' : 'Fixed Price'}
          </Badge>
        )}
      </div>
    ),
    sortable: true,
    align: 'left' as const,
  },
  {
    key: 'indexPricing',
    header: 'Index Details',
    accessor: (bid) => (
      <div className="min-w-[160px] text-sm">
        {bid.priceType === 'index_formula' ? (
          <>
            {bid.indexName && <div className="text-slate-900 font-medium">{bid.indexName}</div>}
            {bid.indexLocation && <div className="text-slate-600">{bid.indexLocation}</div>}
            {bid.differential && (
              <div className="text-slate-700">
                {parseFloat(bid.differential) >= 0 ? '+' : ''}
                {formatCurrency(bid.differential, bid.currency || 'USD')}
                {bid.differentialUnit && ` ${bid.differentialUnit}`}
              </div>
            )}
            {bid.formulaNotes && (
              <div className="text-xs text-slate-500 mt-1 italic">{bid.formulaNotes}</div>
            )}
          </>
        ) : (
          <span className="text-slate-400">Fixed pricing</span>
        )}
      </div>
    ),
    align: 'left' as const,
  },
  {
    key: 'fees',
    header: 'Fees & Charges',
    accessor: (bid) => (
      <div className="min-w-[140px] text-sm">
        {bid.intoPlaneFee && (
          <div className="text-slate-700">
            Into-plane: {formatCurrency(bid.intoPlaneFee, bid.currency || 'USD')}
          </div>
        )}
        {bid.handlingFee && (
          <div className="text-slate-700">
            Handling: {formatCurrency(bid.handlingFee, bid.currency || 'USD')}
          </div>
        )}
        {bid.otherFee && (
          <div className="text-slate-700">
            {bid.otherFeeDescription || 'Other'}:{' '}
            {formatCurrency(bid.otherFee, bid.currency || 'USD')}
          </div>
        )}
        {!bid.intoPlaneFee && !bid.handlingFee && !bid.otherFee && (
          <span className="text-slate-400">No additional fees</span>
        )}
      </div>
    ),
    align: 'left' as const,
  },
  {
    key: 'terms',
    header: 'Terms & Inclusions',
    accessor: (bid) => (
      <div className="min-w-[160px] text-sm">
        {bid.paymentTerms && <div className="text-slate-700 mb-1">Payment: {bid.paymentTerms}</div>}
        {bid.densityAt15C && (
          <div className="text-slate-700 mb-1">Density: {bid.densityAt15C} kg/m³</div>
        )}
        <div className="flex flex-wrap gap-1">
          {bid.includesTaxes && (
            <Badge
              variant="outline"
              className="text-xs bg-green-50 text-green-700 border-green-200"
            >
              Taxes Incl.
            </Badge>
          )}
          {bid.includesAirportFees && (
            <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
              Airport Fees Incl.
            </Badge>
          )}
        </div>
      </div>
    ),
    align: 'left' as const,
  },
  {
    key: 'comments',
    header: 'Comments & Summary',
    accessor: (bid) => (
      <div className="min-w-[200px] text-sm">
        {bid.aiSummary && (
          <div className="text-slate-900 mb-2">
            <Badge
              variant="outline"
              className="text-xs bg-purple-50 text-purple-700 border-purple-200 mb-1"
            >
              AI Summary
            </Badge>
            <div className="text-slate-700 italic">{bid.aiSummary}</div>
          </div>
        )}
        {bid.vendorComments && (
          <div className="text-slate-700">
            <span className="font-medium">Vendor Notes:</span> {bid.vendorComments}
          </div>
        )}
        {!bid.aiSummary && !bid.vendorComments && (
          <span className="text-slate-400">No additional comments</span>
        )}
      </div>
    ),
    align: 'left' as const,
  },
  {
    key: 'submission',
    header: 'Submission',
    accessor: (bid) => (
      <div className="min-w-[120px] text-sm">
        <div className="text-slate-900">{formatDate(bid.bidSubmittedAt)}</div>
        {bid.round && (
          <Badge variant="secondary" className="text-xs mt-1">
            Round {bid.round}
          </Badge>
        )}
        {bid.title && <div className="text-xs text-slate-500 mt-1">{bid.title}</div>}
      </div>
    ),
    sortable: true,
    align: 'left' as const,
  },
  {
    key: 'decision',
    header: 'Decision Status',
    accessor: (bid) => (
      <div className="min-w-[140px]">
        {getDecisionBadge(bid.decision)}
        {bid.decisionAt && (
          <div className="text-xs text-slate-500 mt-1">{formatDate(bid.decisionAt)}</div>
        )}
        {bid.decisionNotes && (
          <div className="text-xs text-slate-600 mt-1 italic">{bid.decisionNotes}</div>
        )}
      </div>
    ),
    sortable: true,
    align: 'left' as const,
  },
];

export default function FuelBidsTable({
  fuelBids,
  tender,
  onRefresh,
  isRefreshing,
}: FuelBidsTableProps) {
  return (
    <Card className="bg-gradient-to-br from-white to-slate-100 border-slate-200 shadow-2xl rounded-3xl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <FileText className="w-6 h-6 text-blue-500" />
              Fuel Bids
            </CardTitle>
            <p className="text-slate-600 mt-1">Compare and evaluate fuel bids for {tender.title}</p>
          </div>
          <div className="flex gap-2">
            {onRefresh && (
              <Button
                intent="secondary"
                icon={RefreshCw}
                text="Refresh"
                onClick={onRefresh}
                disabled={isRefreshing}
                className={isRefreshing ? 'animate-spin' : ''}
              />
            )}
            <FileUploadPopover
              triggerButtonIntent="primary"
              triggerButtonText="New Bid"
              onSend={() => {}}
              onManualUpload={() => {}}
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <DataTable
          data={fuelBids}
          columns={fuelBidColumns}
          searchable={true}
          filterable={true}
          pagination={true}
          pageSize={10}
          onRowClick={(bid) => console.log('Bid clicked:', bid)}
        />
      </CardContent>
    </Card>
  );
}
