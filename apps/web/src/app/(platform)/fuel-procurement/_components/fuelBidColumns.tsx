import { Badge } from '@/components/ui/badge';
import { FuelBid } from '@/drizzle/types';
import FuelBidDialog from '@/features/fuel/bid/FuelBidDialog';
import { formatCurrency, formatDate } from '@/lib/core/formatters';
import { Button } from '@/stories/Button/Button';
import { Column } from '@/stories/DataTable/DataTable';
import { CheckCircle, Clock, Star, XCircle } from 'lucide-react';
import { useMemo } from 'react';

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

export const useFuelBidColumns = (): Column<FuelBid>[] => {
  return useMemo(
    () => [
      {
        key: 'actions',
        header: 'Actions',
        accessor: (bid) => (
          <div className="flex flex-col gap-2">
            <FuelBidDialog bid={bid} onChange={() => {}} DialogType="view" buttonSize="sm" />
            <Button intent="secondary" text="Shortlist" icon={Star} size="sm" onClick={() => {}} />
            <Button
              intent="success"
              text="Accept"
              icon={CheckCircle}
              size="sm"
              onClick={() => {}}
            />
            <Button
              intent="secondary"
              className="hover:bg-gradient-to-r hover:from-red-500 hover:to-red-600 hover:text-white hover:border-0"
              text="Reject"
              icon={XCircle}
              size="sm"
              onClick={() => {}}
            />
          </div>
        ),
        align: 'left' as const,
      },
      {
        key: 'aiSummary',
        header: 'AI Summary',
        accessor: (bid) => (
          <div className="min-w-[320px] bg-purple-50 border-1 border-purple-200 rounded-md p-2 text-sm">
            {bid.aiSummary && (
              <div className="text-slate-900 mb-2">
                <Badge
                  variant="outline"
                  className="text-xs bg-purple-50 border-0 text-purple-700 mb-1"
                >
                  AI Summary
                </Badge>
                <div className="text-slate-700 italic">{bid.aiSummary}</div>
              </div>
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
        key: 'vendor',
        header: 'Vendor',
        accessor: (bid) => (
          <div className="min-w-[160px]">
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
          <div className="min-w-[160px]">
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
        normalizeAccessor: (bid) => (
          <div className="min-w-[160px]">
            <div className="font-semibold text-lg">
              {bid.normalizedUnitPriceUsdPerUsg
                ? formatCurrency(bid.normalizedUnitPriceUsdPerUsg, 'USD')
                : bid.baseUnitPrice
                  ? formatCurrency(bid.baseUnitPrice, bid.currency || 'USD')
                  : '-'}
            </div>
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
        normalizeAccessor: (bid) => (
          <div className="min-w-[140px] text-sm">
            {bid.intoPlaneFee && (
              <div>Into-plane: {formatCurrency(bid.intoPlaneFee, bid.currency || 'USD')}</div>
            )}
            {bid.handlingFee && (
              <div>Handling: {formatCurrency(bid.handlingFee, bid.currency || 'USD')}</div>
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
            {bid.paymentTerms && (
              <div className="text-slate-700 mb-1">Payment: {bid.paymentTerms}</div>
            )}
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
                <Badge
                  variant="outline"
                  className="text-xs bg-blue-50 text-blue-700 border-blue-200"
                >
                  Airport Fees Incl.
                </Badge>
              )}
            </div>
          </div>
        ),
        normalizeAccessor: (bid) => (
          <div className="min-w-[160px] text-sm">
            {bid.paymentTerms && <div>Payment: {bid.paymentTerms}</div>}
            {bid.densityAt15C && <div>Density: {bid.densityAt15C} kg/m³</div>}
            {bid.includesTaxes && <div>Taxes Incl.</div>}
            {bid.includesAirportFees && <div>Airport Fees Incl.</div>}
          </div>
        ),
        align: 'left' as const,
      },
      {
        key: 'vendorComments',
        header: 'Vendor Comments',
        accessor: (bid) => (
          <div className="min-w-[200px] text-sm">
            {bid.vendorComments && (
              <div className="text-slate-700 italic">{bid.vendorComments}</div>
            )}
            {!bid.vendorComments && <span className="text-slate-400">No additional comments</span>}
          </div>
        ),
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
    ],
    [],
  );
};
