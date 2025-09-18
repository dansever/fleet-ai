'use client';

import { CopyableText } from '@/components/miscellaneous/CopyableText';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { getDecisionDisplay } from '@/drizzle/enums';
import type { FuelBid } from '@/drizzle/types';
import FuelBidDialog from '@/features/fuel/bid/FuelBidDialog';
import { formatDate } from '@/lib/core/formatters';
import { client as fuelBidClient } from '@/modules/fuel/bids';
import { Button } from '@/stories/Button/Button';
import type { Column } from '@/stories/DataTable/DataTable';
import { ConfirmationPopover } from '@/stories/Popover/Popover';
import { StatusBadge } from '@/stories/StatusBadge/StatusBadge';
import { CheckCircle, Eye, Fuel, ListCheck, Trash, XCircle, Zap } from 'lucide-react';
import { useCallback, useMemo } from 'react';
import { toast } from 'sonner';
import { useFuelProcurement } from '../contexts';

// Enhanced currency formatter for fuel prices with proper precision
const formatFuelPrice = (
  amount?: number | string | null,
  currency: string | null = 'USD',
): string | null => {
  if (amount == null) return null;

  const parsedAmount = typeof amount === 'number' ? amount : parseFloat(amount.toString());
  if (isNaN(parsedAmount)) return null;

  const resolvedCurrency = currency?.toUpperCase() || 'USD';

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: resolvedCurrency,
    minimumFractionDigits: 3,
    maximumFractionDigits: 3,
  }).format(parsedAmount);
};

// Normalize function for converting values to tender's base currency and UOM
const normalize = (
  value: number | string | null,
  unit: string,
  baseCurrency: string,
  baseUom: string,
): string => {
  // For now, just return the numeric value
  // Later this will be a real function that converts currencies and units
  const numValue = typeof value === 'string' ? parseFloat(value) : value || 0;
  return formatFuelPrice(numValue, baseCurrency) || '';
};

const getDecisionBadge = (decision: string | null) => {
  const decisionText = getDecisionDisplay(decision);
  const isOpen = !decision || decision === 'open';

  const getBadgeVariant = (decision: string | null) => {
    switch (decision) {
      case 'accepted':
        return 'default';
      case 'shortlisted':
        return 'secondary';
      case 'rejected':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const getBadgeColor = (decision: string | null) => {
    switch (decision) {
      case 'accepted':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'shortlisted':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'rejected':
        return 'bg-red-50 text-red-700 border-red-200';
      default:
        return 'bg-amber-50 text-amber-700 border-amber-200';
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Badge
          variant={getBadgeVariant(decision)}
          className={`shadow-md hover:shadow-lg text-sm hover:cursor-pointer hover:scale-105 transition-all duration-300 ${getBadgeColor(decision)}`}
        >
          {decisionText}
        </Badge>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="bg-white rounded-xl flex flex-col gap-2">
        <Button
          intent="ghost"
          text="Accept"
          icon={CheckCircle}
          size="sm"
          className="px-0 text-emerald-600 hover:bg-emerald-50 hover:text-emerald-600"
          onClick={() => {}}
        />
        <Button
          intent="ghost"
          text="Reject"
          icon={XCircle}
          size="sm"
          className="px-1 text-red-600 hover:bg-red-50 hover:text-red-600"
          onClick={() => {}}
        />
        <Button
          intent="ghost"
          text="Shortlist"
          icon={ListCheck}
          size="sm"
          className="px-1 text-yellow-600 hover:bg-yellow-100 hover:text-yellow-600"
          onClick={() => {}}
        />
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export const useFuelBidColumns = (): Column<FuelBid>[] => {
  const { selectedTender, removeBid, loading } = useFuelProcurement();

  const handleDeleteBid = useCallback(
    async (bidId: string) => {
      console.log('handleDeleteBid called with bidId:', bidId);
      console.log('bidId type:', typeof bidId);
      console.log('bidId is undefined?', bidId === undefined);

      if (!bidId) {
        toast.error('Cannot delete bid: No bid ID provided');
        return;
      }

      if (loading.bids) {
        toast.error('Cannot delete bid: Data is still loading');
        return;
      }

      try {
        await fuelBidClient.deleteFuelBid(bidId);
        removeBid(bidId);
        toast.success('Bid deleted successfully');
      } catch (error) {
        console.error('Delete bid error:', error);
        toast.error('Error deleting bid');
      }
    },
    [removeBid, loading.bids],
  );

  return useMemo(
    () => [
      {
        id: 'vendor',
        key: 'vendor',
        header: <span className="whitespace-nowrap">Vendor</span>,
        accessor: (bid: FuelBid) => (
          <div className="space-y-2">
            <div className="space-y-1">
              <h3 className="font-semibold text-sm text-slate-900 leading-tight">
                {bid.vendorName || 'Unknown Vendor'}
              </h3>
              {bid.vendorContactName && (
                <p className="text-xs text-slate-600 font-medium">{bid.vendorContactName}</p>
              )}
              {bid.vendorContactEmail && (
                <div className="text-xs">
                  <CopyableText value={bid.vendorContactEmail} />
                </div>
              )}
            </div>
            <StatusBadge
              status="default"
              text={bid.round ? `Round ${bid.round}` : 'Initial'}
              className="text-xs font-medium"
            />
          </div>
        ),
        sortable: true,
        align: 'left' as const,
      },
      {
        id: 'decision',
        key: 'decision',
        header: <span className="whitespace-nowrap ">Decision</span>,
        accessor: (bid: FuelBid) => (
          <div className="space-y-1.5 min-w-[160px]">
            {getDecisionBadge(bid.decision)}
            {bid.decisionAt && (
              <p className="text-xs text-slate-500 font-medium">{formatDate(bid.decisionAt)}</p>
            )}
            {bid.decisionNotes && (
              <p className="text-xs text-slate-400 italic whitespace-normal">{bid.decisionNotes}</p>
            )}
          </div>
        ),
        sortable: true,
        align: 'left' as const,
      },
      {
        id: 'pricing',
        key: 'pricing',
        header: <span className="whitespace-nowrap">Price</span>,
        accessor: (bid: FuelBid) => {
          return (
            <div className="space-y-1.5 min-w-[200px]">
              {/* headline */}
              <h3 className="text-green-600 font-semibold text-sm">
                {formatFuelPrice(bid.baseUnitPrice, bid.currency) || (
                  <span className="text-slate-400 font-normal">No price</span>
                )}
              </h3>

              {/* single meta-line */}
              <p className="text-xs text-slate-600 font-medium">
                {`${bid.currency}/${bid.uom}`}
                {bid.priceType && (
                  <span className="ml-1">· {bid.priceType === 'fixed' ? 'Fixed' : 'Index'}</span>
                )}
              </p>

              {/* index details (only if index formula) */}
              {bid.priceType === 'index_formula' && (
                <div className="space-y-0.5">
                  {bid.indexName && (
                    <p className="text-xs text-slate-500 font-medium">
                      {bid.indexName}
                      {bid.indexLocation && ` (${bid.indexLocation})`}
                    </p>
                  )}
                  {bid.differential && (
                    <p className="text-xs text-slate-500">
                      {Number.parseFloat(bid.differential) >= 0 ? '+' : ''}
                      {formatFuelPrice(bid.differential, bid.currency)}
                      {bid.differentialUnit && ` ${bid.differentialUnit}`}
                    </p>
                  )}
                  {bid.formulaNotes && (
                    <p className="text-xs text-slate-400 italic">{bid.formulaNotes}</p>
                  )}
                </div>
              )}
            </div>
          );
        },
        normalizeAccessor: (bid: FuelBid) => {
          const baseCurrency = selectedTender?.baseCurrency || 'USD';
          const baseUom = selectedTender?.baseUom || 'USG';
          return normalize(bid.baseUnitPrice, bid.currency || 'USD', baseCurrency, baseUom);
        },
        sortable: true,
        align: 'left' as const,
      },
      {
        id: 'bidDetails',
        key: 'bidDetails',
        header: <span className="whitespace-nowrap">Bid Details</span>,
        accessor: (bid: FuelBid) => (
          <div className="space-y-1.5 min-w-[200px]">
            <h4 className="font-semibold text-sm text-slate-900 leading-tight">
              {bid.title || `Bid ${bid.id?.slice(0, 8) || 'Unknown'}`}
            </h4>
            <p className="text-xs text-slate-600 font-medium">
              {bid.bidSubmittedAt ? formatDate(bid.bidSubmittedAt) : 'Not submitted'}
            </p>
            <div className="flex gap-1 flex-wrap">
              {bid.uom && (
                <Badge variant="outline" className="text-xs">
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
        id: 'additionalCosts',
        key: 'additionalCosts',
        header: <span className="whitespace-nowrap">Additional Costs</span>,
        accessor: (bid: FuelBid) => {
          const totalFees =
            Number.parseFloat(bid.intoPlaneFee || '0') +
            Number.parseFloat(bid.handlingFee || '0') +
            Number.parseFloat(bid.otherFee || '0');

          const hasAnyFees = bid.intoPlaneFee || bid.handlingFee || bid.otherFee;

          return (
            <div className="space-y-1.5">
              {hasAnyFees ? (
                <>
                  <h4 className="font-semibold text-sm text-slate-900">
                    {formatFuelPrice(totalFees, bid.currency)}
                  </h4>
                  <div className="space-y-0.5">
                    {bid.intoPlaneFee && (
                      <p className="text-xs text-slate-600">
                        Into-plane: {formatFuelPrice(bid.intoPlaneFee, bid.currency)}
                      </p>
                    )}
                    {bid.handlingFee && (
                      <p className="text-xs text-slate-600">
                        Handling: {formatFuelPrice(bid.handlingFee, bid.currency)}
                      </p>
                    )}
                    {bid.otherFee && (
                      <p className="text-xs text-slate-600">
                        {bid.otherFeeDescription || 'Other'}:{' '}
                        {formatFuelPrice(bid.otherFee, bid.currency)}
                      </p>
                    )}
                  </div>
                </>
              ) : (
                <span className="text-xs text-slate-400">No additional costs</span>
              )}
            </div>
          );
        },
        normalizeAccessor: (bid: FuelBid) => {
          const baseCurrency = selectedTender?.baseCurrency || 'USD';
          const baseUom = selectedTender?.baseUom || 'USG';
          const totalFees =
            Number.parseFloat(bid.intoPlaneFee || '0') +
            Number.parseFloat(bid.handlingFee || '0') +
            Number.parseFloat(bid.otherFee || '0');
          return normalize(totalFees, bid.currency || 'USD', baseCurrency, baseUom);
        },
        sortable: true,
        align: 'left' as const,
      },
      {
        id: 'terms',
        key: 'terms',
        header: <span className="whitespace-nowrap">Terms & Specs</span>,
        accessor: (bid: FuelBid) => {
          const hasTerms =
            bid.paymentTerms ||
            bid.densityAt15C ||
            bid.includesTaxes ||
            bid.includesAirportFees ||
            bid.qualitySpecification;

          return (
            <div className="space-y-1.5">
              {hasTerms ? (
                <>
                  {bid.paymentTerms && (
                    <p className="text-xs text-slate-600 font-medium">{bid.paymentTerms}</p>
                  )}
                  {bid.qualitySpecification && (
                    <p className="text-xs text-slate-600">Spec: {bid.qualitySpecification}</p>
                  )}
                  <div className="space-y-1">
                    {bid.densityAt15C && (
                      <p className="text-xs text-slate-600">
                        Density: {Number(bid.densityAt15C).toFixed(2)} kg/m³
                      </p>
                    )}
                    <div className="flex gap-1 flex-wrap">
                      {bid.includesTaxes && (
                        <Badge variant="outline" className="text-xs">
                          Tax Incl.
                        </Badge>
                      )}
                      {bid.includesAirportFees && (
                        <Badge variant="outline" className="text-xs">
                          Airport Fees
                        </Badge>
                      )}
                    </div>
                  </div>
                </>
              ) : (
                <span className="text-xs text-slate-400">Standard terms</span>
              )}
            </div>
          );
        },
        sortable: true,
        align: 'left' as const,
      },
      {
        id: 'vendorComments',
        key: 'vendorComments',
        header: <span className="whitespace-nowrap">Vendor Notes</span>,
        accessor: (bid: FuelBid) => (
          <div className="space-y-1.5 min-w-[200px]">
            {bid.vendorComments ? (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="text-xs leading-relaxed text-slate-700 font-medium">
                  {bid.vendorComments}
                </div>
              </div>
            ) : (
              <span className="text-xs text-slate-400">No vendor notes</span>
            )}
          </div>
        ),
        sortable: true,
        align: 'left' as const,
      },
      {
        id: 'analysis',
        key: 'analysis',
        header: <span className="whitespace-nowrap">Analysis</span>,
        accessor: (bid: FuelBid) => (
          <div className="space-y-1.5 min-w-[240px]">
            {bid.aiSummary ? (
              <div className="space-y-2 bg-gradient-to-br from-pink-50/80 to-blue-50/80 border border-purple-200/60 rounded-lg p-3">
                <Badge
                  variant="outline"
                  className="bg-pink-100 text-pink-700 border-pink-300 text-xs"
                >
                  <Zap className="w-3 h-3 mr-1" />
                  AI Insights
                </Badge>
                <div className="text-xs leading-relaxed text-slate-700 font-medium">
                  {bid.aiSummary}
                </div>
              </div>
            ) : (
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-center">
                <span className="text-xs text-slate-500">Analysis pending</span>
              </div>
            )}
          </div>
        ),
        sortable: true,
        align: 'left' as const,
      },
      {
        id: 'actions',
        key: 'actions',
        header: <span className="whitespace-nowrap">Actions</span>,
        accessor: (bid: FuelBid) => (
          <div className="flex flex-col gap-1">
            <FuelBidDialog
              bid={bid}
              onChange={() => {}}
              DialogType="view"
              trigger={<Button intent="secondary" text="View" icon={Eye} size="sm" />}
            />
            <ConfirmationPopover
              trigger={
                <Button
                  intent="secondary"
                  icon={Trash}
                  size="sm"
                  text="Delete"
                  disabled={loading.bids || !bid.id}
                />
              }
              popoverIntent="danger"
              title="Delete Bid"
              description="Are you sure you want to delete this bid?"
              onConfirm={() => {
                console.log('Delete button clicked for bid:', bid);
                console.log('bid.id:', bid.id);
                console.log('bid object keys:', Object.keys(bid));

                if (!bid.id) {
                  console.error('Bid has no ID:', bid);
                  toast.error('Cannot delete bid: Missing bid ID');
                  return;
                }

                handleDeleteBid(bid.id);
              }}
            />
          </div>
        ),
        align: 'left' as const,
      },
    ],
    [selectedTender, removeBid],
  );
};
