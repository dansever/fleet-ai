'use client';

import { CopyableText } from '@/components/miscellaneous/CopyableText';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { FuelBid } from '@/drizzle/types';
import FuelBidDialog from '@/features/fuel/bid/FuelBidDialog';
import { formatCurrency, formatDate } from '@/lib/core/formatters';
import { client as fuelBidClient } from '@/modules/fuel/bids';
import { Button } from '@/stories/Button/Button';
import type { Column } from '@/stories/DataTable/DataTable';
import { ConfirmationPopover } from '@/stories/Popover/Popover';
import { StatusBadge } from '@/stories/StatusBadge/StatusBadge';
import { CheckCircle, Eye, Fuel, ListCheck, Trash, XCircle, Zap } from 'lucide-react';
import { useMemo } from 'react';
import { toast } from 'sonner';
import { useFuelProcurement } from '../contexts';

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
  return formatCurrency(numValue, baseCurrency) || '';
};

const getDecisionBadge = (decision: string | null) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Badge
          variant="secondary"
          className="shadow-md hover:shadow-lg text-base hover:cursor-pointer hover:scale-105 transition-all duration-300 bg-amber-50 text-amber-500 border-amber-500"
        >
          Pending
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
  const { refreshBids, selectedTender } = useFuelProcurement();

  const handleDeleteBid = async (bidId: string) => {
    try {
      await fuelBidClient.deleteFuelBid(bidId);
      toast.success('Bid deleted successfully');
      refreshBids();
    } catch (error) {
      toast.error('Error deleting bid');
    }
  };

  return useMemo(
    () => [
      {
        id: 'decision',
        key: 'decision',
        header: <span className="whitespace-nowrap">Status</span>,
        accessor: (bid: FuelBid) => (
          <div className="space-y-1.5">
            {getDecisionBadge(bid.decision)}
            {bid.decisionAt && (
              <p className="text-xs text-slate-500 font-medium">{formatDate(bid.decisionAt)}</p>
            )}
          </div>
        ),
        sortable: true,
        align: 'left' as const,
      },
      {
        id: 'round',
        key: 'round',
        header: <span className="whitespace-nowrap">Round</span>,
        accessor: (bid: FuelBid) => (
          <div className="flex items-center">
            <StatusBadge
              status="default"
              text={bid.round ? `Round ${bid.round}` : 'Initial'}
              className="text-xs font-medium"
            />
          </div>
        ),
        sortable: true,
        filterableText: true,
        align: 'left' as const,
      },
      {
        id: 'vendor',
        key: 'vendor',
        header: <span className="whitespace-nowrap">Vendor</span>,
        accessor: (bid: FuelBid) => (
          <div className="space-y-1.5 min-w-[180px]">
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
            <div className="space-y-1.5 min-w-[180px]">
              {/* headline */}
              <h3 className="text-green-600 font-semibold text-sm">
                {formatCurrency(bid.baseUnitPrice, bid.currency) || (
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

              {/* differential (inline, only if index formula) */}
              {bid.priceType === 'index_formula' && bid.differential && (
                <p className="text-xs text-slate-500">
                  {bid.indexName || 'Index'} {Number.parseFloat(bid.differential) >= 0 ? '+' : ''}
                  {formatCurrency(bid.differential, bid.currency)}
                </p>
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
          <div className="space-y-1.5 min-w-[180px]">
            <h4 className="font-semibold text-sm text-slate-900 leading-tight">
              {bid.title || `Bid ${bid.id?.slice(0, 8) || 'Unknown'}`}
            </h4>
            <p className="text-xs text-slate-600 font-medium">
              {bid.bidSubmittedAt ? formatDate(bid.bidSubmittedAt) : 'Not submitted'}
            </p>
            <div className="flex gap-1 flex-wrap">
              {bid.round && (
                <Badge variant="outline" className="text-xs">
                  Round {bid.round}
                </Badge>
              )}
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

          return (
            <div className="space-y-1.5 min-w-[180px]">
              <h4 className="font-semibold text-sm text-slate-900">
                {formatCurrency(totalFees, bid.currency)}
              </h4>
              <div className="space-y-0.5">
                {bid.intoPlaneFee && (
                  <p className="text-xs text-slate-600">
                    Into-plane: {formatCurrency(bid.intoPlaneFee, bid.currency)}
                  </p>
                )}
                {bid.handlingFee && (
                  <p className="text-xs text-slate-600">
                    Handling: {formatCurrency(bid.handlingFee, bid.currency)}
                  </p>
                )}
                {bid.otherFee && (
                  <p className="text-xs text-slate-600">
                    Other: {formatCurrency(bid.otherFee, bid.currency)}
                  </p>
                )}
              </div>
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
        accessor: (bid: FuelBid) => (
          <div className="space-y-1.5 min-w-[180px]">
            {bid.paymentTerms && (
              <p className="text-xs text-slate-600 font-medium">{bid.paymentTerms}</p>
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
            {!bid.paymentTerms &&
              !bid.densityAt15C &&
              !bid.includesTaxes &&
              !bid.includesAirportFees && (
                <span className="text-xs text-slate-400">Standard terms</span>
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
          <div className="min-w-[240px]">
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
              trigger={<Button intent="secondary" icon={Trash} size="sm" text="Delete" />}
              popoverIntent="danger"
              title="Delete Bid"
              description="Are you sure you want to delete this bid?"
              onConfirm={() => handleDeleteBid(bid.id)}
            />
          </div>
        ),
        align: 'left' as const,
      },
    ],
    [],
  );
};
