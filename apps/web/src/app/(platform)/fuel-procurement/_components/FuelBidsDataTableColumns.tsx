'use client';

import { CopyableText } from '@/components/miscellaneous/CopyableText';
import { Badge } from '@/components/ui/badge';
import type { FuelBid } from '@/drizzle/types';
import FuelBidDialog from '@/features/fuel/bid/FuelBidDialog';
import { formatCurrency, formatDate } from '@/lib/core/formatters';
import { deleteFuelBid } from '@/services/fuel/fuel-bid-client';
import { Button } from '@/stories/Button/Button';
import type { Column } from '@/stories/DataTable/DataTable';
import { ConfirmationPopover } from '@/stories/Popover/Popover';
import { StatusBadge } from '@/stories/StatusBadge/StatusBadge';
import { CheckCircle, Clock, Fuel, Star, Trash, XCircle, Zap } from 'lucide-react';
import { useMemo } from 'react';
import { toast } from 'sonner';
import { useFuelProcurement } from '../ContextProvider';

const getDecisionBadge = (decision: string | null) => {
  if (!decision)
    return (
      <Badge variant="secondary" className="bg-amber-50 text-amber-700 border-amber-200">
        Pending
      </Badge>
    );
  switch (decision.toLowerCase()) {
    case 'accepted':
    case 'winner':
      return (
        <Badge variant="default" className="bg-emerald-50 text-emerald-700 border-emerald-200">
          <CheckCircle className="w-3 h-3 mr-1" />
          Winner
        </Badge>
      );
    case 'rejected':
      return (
        <Badge variant="destructive" className="bg-red-50 text-red-700 border-red-200">
          <XCircle className="w-3 h-3 mr-1" />
          Rejected
        </Badge>
      );
    default:
      return (
        <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200">
          <Clock className="w-3 h-3 mr-1" />
          Review
        </Badge>
      );
  }
};

export const useFuelBidColumns = (): Column<FuelBid>[] => {
  const { refreshFuelBids } = useFuelProcurement();

  const handleDeleteBid = async (bidId: string) => {
    try {
      await deleteFuelBid(bidId);
      toast.success('Bid deleted successfully');
      refreshFuelBids();
    } catch (error) {
      toast.error('Error deleting bid');
    }
  };

  return useMemo(
    () => [
      {
        key: 'decision',
        header: <span className="whitespace-nowrap">Status</span>,
        accessor: (bid: FuelBid) => (
          <div className="space-y-1">
            {getDecisionBadge(bid.decision)}
            {bid.decisionAt && <p>{formatDate(bid.decisionAt)}</p>}
          </div>
        ),
        sortable: true,
        align: 'left' as const,
      },
      {
        key: 'round',
        header: <span className="whitespace-nowrap">Round</span>,
        accessor: (bid: FuelBid) => (
          <StatusBadge
            className="space-y-1"
            status="default"
            text={bid.round ? `Round ${bid.round}` : undefined}
          ></StatusBadge>
        ),
        sortable: true,
        filterableText: true,
        align: 'left' as const,
      },
      {
        key: 'vendor',
        header: <span className="whitespace-nowrap">Vendor</span>,
        accessor: (bid: FuelBid) => (
          <div className="space-y-1">
            <h3>{bid.vendorName}</h3>
            {bid.vendorContactName && <span>{bid.vendorContactName}</span>}
            {bid.vendorContactEmail && <CopyableText value={bid.vendorContactEmail} />}
          </div>
        ),
        sortable: true,
        align: 'left' as const,
      },
      {
        key: 'pricing',
        header: <span className="whitespace-nowrap">Price</span>,
        accessor: (bid: FuelBid) => {
          return (
            <div className="space-y-1 min-w-[160px]">
              {/* headline */}
              <h3 className="text-green-600 font-medium">
                {formatCurrency(bid.baseUnitPrice, bid.currency) || (
                  <span className="text-slate-400 font-light">No price</span>
                )}
              </h3>

              {/* single meta-line */}
              <p>
                {`${bid.currency}/${bid.uom}`}
                {bid.priceType && <> · {bid.priceType === 'fixed' ? 'Fixed' : 'Index'} </>}
              </p>

              {/* differential (inline, only if index formula) */}
              {bid.priceType === 'index_formula' && bid.differential && (
                <span>
                  {bid.indexName || 'Index'} {Number.parseFloat(bid.differential) >= 0 ? '+' : ''}
                  {formatCurrency(bid.differential, bid.currency)}
                </span>
              )}
            </div>
          );
        },
        normalizeAccessor: (bid: FuelBid) =>
          bid.normalizedUnitPriceUsdPerUsg || bid.baseUnitPrice || 0,
        sortable: true,
        align: 'left' as const,
      },
      {
        key: 'bidDetails',
        header: <span className="whitespace-nowrap">Bid Details</span>,
        accessor: (bid: FuelBid) => (
          <div className="space-y-1 min-w-[160px]">
            <h4>{bid.title || `Bid ${bid.id?.slice(0, 8) || 'Unknown'}`}</h4>
            <p>{bid.bidSubmittedAt ? formatDate(bid.bidSubmittedAt) : 'Not submitted'}</p>
            <div className="flex gap-1">
              {bid.round && <Badge variant="outline">Round {bid.round}</Badge>}
              {bid.uom && (
                <Badge variant="outline">
                  <Fuel className="w-3 h-3 mr-1" />
                  {bid.uom}
                </Badge>
              )}
            </div>
          </div>
        ),
        sortable: true,
        align: 'left' as const,
      },
      {
        key: 'additionalCosts',
        header: <span className="whitespace-nowrap">Additional Costs</span>,
        accessor: (bid: FuelBid) => {
          const totalFees =
            Number.parseFloat(bid.intoPlaneFee || '0') +
            Number.parseFloat(bid.handlingFee || '0') +
            Number.parseFloat(bid.otherFee || '0');

          return (
            <div className="space-y-1 min-w-[160px]">
              <h4>{formatCurrency(totalFees, bid.currency)}</h4>
              <div>
                {bid.intoPlaneFee && (
                  <p>Into-plane: {formatCurrency(bid.intoPlaneFee, bid.currency)}</p>
                )}
                {bid.handlingFee && (
                  <p>Handling: {formatCurrency(bid.handlingFee, bid.currency)}</p>
                )}
                {bid.otherFee && <div>Other: {formatCurrency(bid.otherFee, bid.currency)}</div>}
              </div>
            </div>
          );
        },
        align: 'left' as const,
      },
      {
        key: 'terms',
        header: <span className="whitespace-nowrap">Terms & Specs</span>,
        accessor: (bid: FuelBid) => (
          <div className="space-y-1 min-w-[160px]">
            {bid.paymentTerms && <p>{bid.paymentTerms}</p>}
            <div>
              {bid.densityAt15C && <p>Density: {bid.densityAt15C} kg/m³</p>}
              <div>
                {bid.includesTaxes && <Badge variant="outline">Tax Incl.</Badge>}
                {bid.includesAirportFees && <Badge variant="outline">Airport Fees</Badge>}
              </div>
            </div>
            {!bid.paymentTerms &&
              !bid.densityAt15C &&
              !bid.includesTaxes &&
              !bid.includesAirportFees && <span>Standard terms</span>}
          </div>
        ),
        align: 'left' as const,
      },
      {
        key: 'analysis',
        header: <span className="whitespace-nowrap">Analysis</span>,
        accessor: (bid: FuelBid) => (
          <div className="min-w-[240px]">
            {bid.aiSummary ? (
              <div className="space-y-1 bg-gradient-to-br from-pink-100/80 to-blue-100/80 border border-purple-200 rounded-lg p-3">
                <Badge variant="outline" className="bg-pink-100 text-pink-700 border-pink-300">
                  <Zap className="w-3 h-3 mr-1" />
                  AI Insights
                </Badge>
                <div className="text-sm leading-relaxed">{bid.aiSummary}</div>
              </div>
            ) : (
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-center">
                <span>Analysis pending</span>
              </div>
            )}
          </div>
        ),
        align: 'left' as const,
      },
      {
        key: 'actions',
        header: <span className="whitespace-nowrap">Actions</span>,
        accessor: (bid: FuelBid) => (
          <div className="flex flex-col gap-1.5 min-w-[120px]">
            <FuelBidDialog bid={bid} onChange={() => {}} DialogType="view" buttonSize="sm" />
            <Button intent="secondary" text="Shortlist" icon={Star} size="sm" onClick={() => {}} />
            <ConfirmationPopover
              trigger={
                <Button
                  intent="secondary"
                  text="Delete"
                  icon={Trash}
                  size="sm"
                  onClick={() => {}}
                />
              }
              popoverIntent="danger"
              title="Delete Bid"
              description="Are you sure you want to delete this bid?"
              onConfirm={() => handleDeleteBid(bid.id)}
            />
            <div className="flex gap-1">
              <Button
                intent="success"
                text="Accept"
                icon={CheckCircle}
                size="sm"
                onClick={() => {}}
              />
              <Button
                intent="secondary"
                text="Reject"
                icon={XCircle}
                size="sm"
                onClick={() => {}}
              />
            </div>
          </div>
        ),
        align: 'left' as const,
      },
    ],
    [],
  );
};
