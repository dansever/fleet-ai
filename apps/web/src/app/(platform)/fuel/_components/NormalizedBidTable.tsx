'use client';

import { Badge } from '@/components/ui/badge';
import { FuelBid, FuelTender } from '@/drizzle/types';
import { Info } from 'lucide-react';
import {
  ConvertedBid,
  getDisplayValue,
  getFeeBasisNote,
  getFormattedPriceDisplay,
  getTotalPrice,
} from '../utils/bidConversion';

export function NormalizedBidTable({
  currentTender,
  bids,
  convertedBids,
}: {
  currentTender: FuelTender;
  bids: FuelBid[];
  convertedBids: FuelBid[];
}) {
  const baseCurrency = currentTender?.baseCurrency || 'USD';
  const baseUom = currentTender?.baseUom || 'USG';
  const priceUnit = `${baseCurrency}/${baseUom}`;

  return (
    <div className="space-y-4">
      {/* Normalization Info */}
      <div className="flex flex-wrap gap-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-center gap-2">
          <Info className="h-4 w-4 text-blue-600" />
          <span className="text-sm font-medium text-blue-800">
            All prices normalized to <span className="font-bold">{priceUnit}</span> for comparison
          </span>
        </div>
        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">
          Currency: {baseCurrency}
        </Badge>
        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">
          UOM: {baseUom}
        </Badge>
      </div>

      {/* Comparison Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-gray-50">
              <th className="border border-gray-200 p-2 text-center font-medium text-xs sticky left-0 bg-gray-50 z-10">
                Vendor
              </th>
              <th className="border border-gray-200 p-2 text-center font-medium text-xs">
                Pricing Type
              </th>
              <th className="border border-gray-200 p-2 text-center font-medium text-xs">
                Base Price
              </th>
              <th className="border border-gray-200 p-2 text-center font-medium text-xs">
                Differential
              </th>
              <th className="border border-gray-200 p-2 text-center font-medium text-xs">
                Into Plane Fee
              </th>
              <th className="border border-gray-200 p-2 text-center font-medium text-xs">
                Handling Fee
              </th>
              <th className="border border-gray-200 p-2 text-center font-medium text-xs">
                Other Fees
              </th>
              <th className="border border-gray-200 p-2 text-center font-medium text-xs bg-blue-50">
                Total (Pre-Tax)
              </th>
              <th className="border border-gray-200 p-2 text-center font-medium text-xs bg-green-50">
                Total (With Tax)
              </th>
              <th className="border border-gray-200 p-2 text-center font-medium text-xs">
                Payment Terms
              </th>
            </tr>
          </thead>
          <tbody>
            {bids.map((bid, index) => {
              // Use converted bid if available, otherwise use original
              const displayBid = (convertedBids.find((cb) => cb.id === bid.id) ||
                bid) as ConvertedBid;

              // Get all values
              const basePrice = getDisplayValue(displayBid, 'baseUnitPrice');
              const differential = getDisplayValue(displayBid, 'differentialValue');
              const intoPlaneFee = getDisplayValue(displayBid, 'intoPlaneFee');
              const handlingFee = getDisplayValue(displayBid, 'handlingFee');
              const otherFee = getDisplayValue(displayBid, 'otherFee');

              // Get basis notes
              const intoPlaneFeeNote = getFeeBasisNote(displayBid, 'intoPlaneFee');
              const handlingFeeNote = getFeeBasisNote(displayBid, 'handlingFee');
              const otherFeeNote = getFeeBasisNote(displayBid, 'otherFee');

              // Get totals
              const totalPreTax = getTotalPrice(displayBid, false);
              const totalWithTax = getTotalPrice(displayBid, true);

              // Pricing display
              const pricingDisplay = getFormattedPriceDisplay(displayBid);

              // Check if normalized
              const isNormalized =
                basePrice.isConverted ||
                intoPlaneFee.isConverted ||
                handlingFee.isConverted ||
                otherFee.isConverted;

              // Payment terms display
              const paymentTermsDisplay = displayBid.creditDays
                ? `${displayBid.creditDays} days`
                : displayBid.paymentTerms || '-';

              return (
                <tr key={bid.id || `bid-${index}`} className="hover:bg-gray-50">
                  <td className="border border-gray-200 p-2 sticky left-0 bg-white z-10">
                    <div className="flex flex-col">
                      <span className="font-medium">{bid.vendorName || 'Unknown'}</span>
                      {isNormalized && (
                        <Badge
                          variant="outline"
                          className="mt-1 text-xs bg-blue-50 text-blue-700 border-blue-300 w-fit"
                        >
                          Normalized
                        </Badge>
                      )}
                    </div>
                  </td>
                  <td className="border border-gray-200 p-2">
                    <Badge
                      variant={bid.priceType === 'index_formula' ? 'default' : 'secondary'}
                      className="text-xs"
                    >
                      {pricingDisplay}
                    </Badge>
                  </td>
                  <td className="border border-gray-200 p-2 text-right font-mono">
                    {basePrice.value > 0 ? basePrice.value.toFixed(4) : '-'}
                  </td>
                  <td className="border border-gray-200 p-2 text-right font-mono">
                    {bid.priceType === 'index_formula' && differential.value !== 0 ? (
                      <span className={differential.value > 0 ? 'text-green-600' : 'text-red-600'}>
                        {differential.value > 0 ? '+' : ''}
                        {differential.value.toFixed(4)}
                      </span>
                    ) : (
                      '-'
                    )}
                  </td>
                  <td className="border border-gray-200 p-2 text-right">
                    <div className="flex flex-col items-end">
                      <span className="font-mono">
                        {intoPlaneFee.value > 0 ? intoPlaneFee.value.toFixed(4) : '-'}
                      </span>
                      {intoPlaneFeeNote && (
                        <span className="text-xs text-gray-500">{intoPlaneFeeNote}</span>
                      )}
                    </div>
                  </td>
                  <td className="border border-gray-200 p-2 text-right">
                    <div className="flex flex-col items-end">
                      <span className="font-mono">
                        {handlingFee.value > 0 ? handlingFee.value.toFixed(4) : '-'}
                      </span>
                      {handlingFeeNote && (
                        <span className="text-xs text-gray-500">{handlingFeeNote}</span>
                      )}
                    </div>
                  </td>
                  <td className="border border-gray-200 p-2 text-right">
                    <div className="flex flex-col items-end">
                      <span className="font-mono">
                        {otherFee.value > 0 ? otherFee.value.toFixed(4) : '-'}
                      </span>
                      {otherFeeNote && (
                        <span className="text-xs text-gray-500">{otherFeeNote}</span>
                      )}
                    </div>
                  </td>
                  <td className="border border-gray-200 p-2 text-right font-bold bg-blue-50 font-mono">
                    {totalPreTax.toFixed(4)}
                  </td>
                  <td className="border border-gray-200 p-2 text-right bg-green-50">
                    <div className="flex flex-col items-end">
                      <span className="font-bold font-mono">{totalWithTax.toFixed(4)}</span>
                      {!displayBid.includesTaxes && (
                        <span className="text-xs text-gray-500">(estimated)</span>
                      )}
                    </div>
                  </td>
                  <td className="border border-gray-200 p-2 text-center text-xs">
                    {paymentTermsDisplay}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <p className="text-xs text-gray-600 mb-2">
          <span className="font-semibold">Notes:</span>
        </p>
        <ul className="text-xs text-gray-600 space-y-1 list-disc list-inside">
          <li>All fees shown in {priceUnit} (per unit of measure)</li>
          <li>Fees with different basis (per uplift, per delivery) are marked with notes</li>
          <li>Only per-UOM fees are included in totals for accurate comparison</li>
          <li>Tax estimates use 10% rate for bids not including taxes</li>
          <li>Differential values show premium (+) or discount (-) for index-based pricing</li>
        </ul>
      </div>
    </div>
  );
}
