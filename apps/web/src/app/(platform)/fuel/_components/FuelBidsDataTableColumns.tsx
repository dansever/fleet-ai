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

  const resolvedCurrency = currency?.toUpperCase();

  const result = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: resolvedCurrency,
    minimumFractionDigits: 3,
    maximumFractionDigits: 3,
  }).format(parsedAmount);

  return result;
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

const getDecisionBadge = (
  decision: string | null,
  onDecisionChange: (newDecision: 'accepted' | 'rejected' | 'shortlisted') => void,
) => {
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
          className={`rounded-lg shadow-md hover:shadow-lg text-sm hover:cursor-pointer hover:scale-105 transition-all duration-300 ${getBadgeColor(decision)}`}
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
          onClick={() => onDecisionChange('accepted')}
        />
        <Button
          intent="ghost"
          text="Reject"
          icon={XCircle}
          size="sm"
          className="px-1 text-red-600 hover:bg-red-50 hover:text-red-600"
          onClick={() => onDecisionChange('rejected')}
        />
        <Button
          intent="ghost"
          text="Shortlist"
          icon={ListCheck}
          size="sm"
          className="px-1 text-yellow-600 hover:bg-yellow-100 hover:text-yellow-600"
          onClick={() => onDecisionChange('shortlisted')}
        />
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export const useFuelBidColumns = (): Column<FuelBid>[] => {
  const { selectedTender, removeBid, updateBid, loading, dbUser, bids } = useFuelProcurement();

  const handleDeleteBid = useCallback(
    async (bidId: string) => {
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

  const handleDecisionChange = useCallback(
    async (bidId: string, newDecision: 'accepted' | 'rejected' | 'shortlisted') => {
      if (!bidId) {
        toast.error('Cannot update decision: No bid ID provided');
        return;
      }

      if (loading.bids) {
        toast.error('Cannot update decision: Data is still loading');
        return;
      }

      // Store original bid state for rollback if API call fails
      const originalBid = bids.find((b) => b.id === bidId);
      if (!originalBid) {
        toast.error('Cannot find bid to update');
        return;
      }

      // Create optimistic update data
      const now = new Date();
      const optimisticBid: FuelBid = {
        ...originalBid,
        decision: newDecision,
        decisionByUserId: dbUser.id,
        decisionAt: now,
        updatedAt: now,
      };

      try {
        // Optimistic update: Update local state immediately for instant feedback
        updateBid(optimisticBid);

        // Prepare API update data
        const updateData = {
          decision: newDecision,
          decisionByUserId: dbUser.id,
          decisionAt: now.toISOString(),
        };

        // Background API update to persist to database
        const updatedBidFromServer = await fuelBidClient.updateFuelBid(bidId, updateData);

        // Update with server response (in case server modified any fields)
        updateBid(updatedBidFromServer);

        // Show success only after server confirms
        toast.success(`Bid ${newDecision} successfully`);
      } catch (error) {
        console.error('Update decision error:', error);

        // Rollback: Restore original bid state on failure
        updateBid(originalBid);

        // Show clear error message
        toast.error('Failed to update bid decision. Changes have been reverted.');
      }
    },
    [dbUser.id, updateBid, loading.bids, bids],
  );

  return useMemo(
    () => [
      {
        id: 'vendor',
        key: 'vendor',
        header: <span className="whitespace-nowrap">Vendor</span>,
        accessor: (bid: FuelBid) => (
          <div className="space-y-2 min-w-[200px]">
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
              {bid.vendorContactPhone && (
                <div className="text-xs text-slate-600 font-medium">{bid.vendorContactPhone}</div>
              )}
            </div>
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
            {getDecisionBadge(bid.decision, (newDecision) =>
              handleDecisionChange(bid.id, newDecision),
            )}
            {bid.decisionAt && (
              <p className="text-xs text-slate-500 font-medium">
                {formatDate(bid.decisionAt, undefined, undefined, undefined, true)}
              </p>
            )}
          </div>
        ),
        sortable: true,
        align: 'left' as const,
      },
      {
        id: 'pricing',
        key: 'pricing',
        header: <span className="whitespace-nowrap">Pricing Structure</span>,
        accessor: (bid: FuelBid) => {
          const isFixedPricing = bid.priceType === 'fixed';
          const isIndexPricing = bid.priceType === 'index_formula';

          return (
            <div className="space-y-2 min-w-[240px]">
              {/* Pricing Type Badge */}
              <div className="flex items-center gap-2">
                <Badge
                  variant="outline"
                  className={`text-xs font-medium ${
                    isFixedPricing
                      ? 'bg-green-50 text-green-700 border-green-200'
                      : isIndexPricing
                        ? 'bg-blue-50 text-blue-700 border-blue-200'
                        : 'bg-gray-50 text-gray-700 border-gray-200'
                  }`}
                >
                  {isFixedPricing
                    ? 'Fixed Price'
                    : isIndexPricing
                      ? 'Index Formula'
                      : 'Unknown Type'}
                </Badge>
              </div>

              {/* Base Price */}
              <div className="space-y-1">
                <h3 className="text-green-600 font-semibold text-sm">
                  {formatFuelPrice(bid.baseUnitPrice, bid.currency) || (
                    <span className="text-slate-400 font-normal">No base price</span>
                  )}
                </h3>
                <p className="text-xs text-slate-600 font-medium">
                  {bid.currency}/{bid.uom}
                </p>
              </div>

              {/* Index Formula Details */}
              {isIndexPricing && (
                <div className="space-y-1 bg-blue-50 border border-blue-200 rounded-lg p-2">
                  <p className="text-xs font-semibold text-blue-800">Index Formula:</p>
                  {bid.indexName && (
                    <p className="text-xs text-blue-700 font-medium">
                      {bid.indexName}
                      {bid.indexLocation && ` (${bid.indexLocation})`}
                    </p>
                  )}
                  {bid.differentialValue && (
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-blue-700">Differential:</span>
                      <span className="text-xs font-medium text-blue-800">
                        {Number.parseFloat(bid.differentialValue) >= 0 ? '+' : ''}
                        {formatFuelPrice(bid.differentialValue, bid.currency)}
                        {bid.differentialUnit && ` ${bid.differentialUnit}`}
                      </span>
                    </div>
                  )}
                  {bid.quoteLagDays && (
                    <p className="text-xs text-blue-600">Lag: {bid.quoteLagDays} days</p>
                  )}
                  {bid.formulaNotes && (
                    <p className="text-xs text-blue-600 italic">{bid.formulaNotes}</p>
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
        id: 'productSpecs',
        key: 'productSpecs',
        header: <span className="whitespace-nowrap">Product & Specifications</span>,
        accessor: (bid: FuelBid) => {
          const hasProductInfo =
            bid.productGrade ||
            bid.uom ||
            bid.densityAt15C ||
            bid.temperatureBasisC ||
            bid.qualitySpecification;

          return (
            <div className="space-y-2 min-w-[200px]">
              {hasProductInfo ? (
                <>
                  {/* Product Grade */}
                  {bid.productGrade && (
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className="bg-blue-50 text-blue-700 border-blue-200 text-xs"
                      >
                        <Fuel className="w-3 h-3 mr-1" />
                        {bid.productGrade}
                      </Badge>
                    </div>
                  )}

                  {/* Unit of Measure */}
                  {bid.uom && (
                    <div className="space-y-1">
                      <p className="text-xs font-semibold text-slate-800">Unit of Measure:</p>
                      <Badge variant="outline" className="text-sm font-medium text-slate-700">
                        {bid.uom}
                      </Badge>
                    </div>
                  )}

                  {/* Quality & Physical Properties */}
                  <div className="space-y-1">
                    {bid.qualitySpecification && (
                      <div>
                        <p className="text-xs font-semibold text-slate-800">Quality Spec:</p>
                        <p className="text-xs text-slate-600 font-medium">
                          {bid.qualitySpecification}
                        </p>
                      </div>
                    )}

                    {(bid.densityAt15C || bid.temperatureBasisC) && (
                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-2 space-y-1">
                        <p className="text-xs font-semibold text-slate-800">Physical Properties:</p>
                        {bid.densityAt15C && (
                          <p className="text-xs text-slate-600">
                            Density @ 15°C:{' '}
                            <span className="font-medium">
                              {Number(bid.densityAt15C).toFixed(2)} kg/m³
                            </span>
                          </p>
                        )}
                        {bid.temperatureBasisC && (
                          <p className="text-xs text-slate-600">
                            Temperature Basis:{' '}
                            <span className="font-medium">{bid.temperatureBasisC}°C</span>
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-center">
                  <span className="text-xs text-slate-500">No product specifications</span>
                </div>
              )}
            </div>
          );
        },
        sortable: true,
        align: 'left' as const,
      },
      {
        id: 'bidDetails',
        key: 'bidDetails',
        header: <span className="whitespace-nowrap">Bid Information</span>,
        accessor: (bid: FuelBid) => (
          <div className="space-y-2 min-w-[180px]">
            <div className="space-y-1">
              <h4 className="font-semibold text-sm text-slate-900 leading-tight">
                {bid.title || `Bid ${bid.id?.slice(0, 8) || 'Unknown'}`}
              </h4>
              <p className="text-xs text-slate-600 font-medium">
                {bid.bidSubmittedAt ? formatDate(bid.bidSubmittedAt) : 'Not submitted'}
              </p>
            </div>

            {/* Bid Round Information */}
            {bid.round && (
              <div className="flex items-center gap-1">
                <StatusBadge
                  status="default"
                  text={`Round ${bid.round}`}
                  className="text-xs font-medium"
                />
              </div>
            )}
          </div>
        ),
        sortable: true,
        align: 'left' as const,
      },
      {
        id: 'feesCharges',
        key: 'feesCharges',
        header: <span className="whitespace-nowrap">Fees & Charges</span>,
        accessor: (bid: FuelBid) => {
          const totalFees =
            Number.parseFloat(bid.intoPlaneFee || '0') +
            Number.parseFloat(bid.handlingFee || '0') +
            Number.parseFloat(bid.otherFee || '0');

          const hasAnyFees = bid.intoPlaneFee || bid.handlingFee || bid.otherFee;

          return (
            <div className="space-y-2 min-w-[200px]">
              {hasAnyFees ? (
                <>
                  {/* Total Fees Summary */}
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-orange-700 border-0 text-xs">
                        Total Fees
                      </Badge>
                      <h4 className="font-semibold text-sm text-orange-800">
                        {formatFuelPrice(totalFees, bid.currency)}
                      </h4>
                    </div>
                  </div>

                  {/* Individual Fee Breakdown */}
                  <div className="space-y-1.5">
                    {bid.intoPlaneFee && (
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-slate-600 font-medium">Into-plane:</span>
                        <span className="text-xs text-slate-800 font-semibold">
                          {formatFuelPrice(bid.intoPlaneFee, bid.currency)}
                        </span>
                      </div>
                    )}
                    {bid.handlingFee && (
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-slate-600 font-medium">Handling:</span>
                        <span className="text-xs text-slate-800 font-semibold">
                          {formatFuelPrice(bid.handlingFee, bid.currency)}
                        </span>
                      </div>
                    )}
                    {bid.otherFee && (
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-slate-600 font-medium">
                          {bid.otherFeeDescription || 'Other'}:
                        </span>
                        <span className="text-xs text-slate-800 font-semibold">
                          {formatFuelPrice(bid.otherFee, bid.currency)}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Fee Basis Information */}
                  {(bid.intoPlaneFeeUnit || bid.handlingFeeBasis || bid.otherFeeBasis) && (
                    <div className="text-xs text-slate-500 space-y-0.5">
                      <p className="font-medium">Basis:</p>
                      {bid.intoPlaneFeeUnit && <p>Into-plane: {bid.intoPlaneFeeUnit}</p>}
                      {bid.handlingFeeBasis && <p>Handling: {bid.handlingFeeBasis}</p>}
                      {bid.otherFeeBasis && <p>Other: {bid.otherFeeBasis}</p>}
                    </div>
                  )}
                </>
              ) : (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-center">
                  <span className="text-xs text-slate-500">No additional fees</span>
                </div>
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
        id: 'commercialTerms',
        key: 'commercialTerms',
        header: <span className="whitespace-nowrap">Commercial Terms</span>,
        accessor: (bid: FuelBid) => {
          const hasCommercialTerms = bid.paymentTerms || bid.creditDays;

          return (
            <div className="space-y-2 min-w-[180px]">
              {hasCommercialTerms ? (
                <>
                  {bid.paymentTerms && (
                    <div className="space-y-1">
                      <p className="text-xs font-semibold text-slate-800">Payment Terms:</p>
                      <p className="text-xs text-slate-600 font-medium">{bid.paymentTerms}</p>
                    </div>
                  )}
                  {bid.creditDays && (
                    <div className="space-y-1">
                      <p className="text-xs font-semibold text-slate-800">Credit Terms:</p>
                      <Badge
                        variant="outline"
                        className="bg-green-50 text-green-700 border-green-200 text-xs"
                      >
                        {bid.creditDays} days
                      </Badge>
                    </div>
                  )}
                </>
              ) : (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-center">
                  <span className="text-xs text-slate-500">Standard terms</span>
                </div>
              )}
            </div>
          );
        },
        sortable: true,
        align: 'left' as const,
      },
      {
        id: 'inclusionsExclusions',
        key: 'inclusionsExclusions',
        header: <span className="whitespace-nowrap">Inclusions & Exclusions</span>,
        accessor: (bid: FuelBid) => {
          const hasInclusions = bid.includesTaxes || bid.includesAirportFees || bid.taxDetails;

          return (
            <div className="space-y-2 min-w-[180px]">
              {hasInclusions ? (
                <>
                  {/* Tax Information */}
                  <div className="space-y-1.5">
                    <p className="text-xs font-semibold text-slate-800">Taxes & Fees:</p>
                    <div className="flex gap-1 flex-wrap">
                      {bid.includesTaxes && (
                        <Badge
                          variant="outline"
                          className="bg-green-50 text-green-700 border-green-200 text-xs"
                        >
                          ✓ Taxes Included
                        </Badge>
                      )}
                      {bid.includesAirportFees && (
                        <Badge
                          variant="outline"
                          className="bg-blue-50 text-blue-700 border-blue-200 text-xs"
                        >
                          ✓ Airport Fees
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Tax Details */}
                  {bid.taxDetails && typeof bid.taxDetails === 'object' && (
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-2 space-y-1">
                      <p className="text-xs font-semibold text-slate-800">Tax Breakdown:</p>
                      {Object.entries(bid.taxDetails).map(([key, value]) => (
                        <p key={key} className="text-xs text-slate-600">
                          {key}:{' '}
                          {typeof value === 'boolean' ? (value ? 'Yes' : 'No') : String(value)}
                        </p>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-center">
                  <span className="text-xs text-slate-500">No inclusions specified</span>
                </div>
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
              title="Delete bid"
              description="Are you sure you want to delete this bid?"
              onConfirm={() => {
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
    [selectedTender, removeBid, handleDecisionChange],
  );
};
