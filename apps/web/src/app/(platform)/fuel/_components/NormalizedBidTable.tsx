'use client';

import { Checkbox } from '@/components/ui/checkbox';
import { FuelBid, FuelTender } from '@/drizzle/types';
import { StatusBadge } from '@/stories/StatusBadge/StatusBadge';
import { BarChart3 } from 'lucide-react';
import { getDisplayValue } from '../utils/bidConversion';

export function NormalizedBidTable({
  currentTender,
  bids,
  convertedBids,
}: {
  currentTender: FuelTender;
  bids: FuelBid[];
  convertedBids: FuelBid[];
}) {
  return (
    <div className="space-y-4">
      {/* Toggle Controls */}
      <div className="flex flex-wrap gap-4 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 bg-green-100 border border-green-300 rounded-sm flex items-center justify-center">
            <div className="w-3 h-3 bg-green-600 rounded-sm"></div>
          </div>
          <label className="text-sm font-medium text-green-700">
            Normalized to ({currentTender?.baseCurrency})
          </label>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 bg-green-100 border border-green-300 rounded-sm flex items-center justify-center">
            <div className="w-3 h-3 bg-green-600 rounded-sm"></div>
          </div>
          <label className="text-sm font-medium text-green-700">
            Normalized to ({currentTender?.baseUom})
          </label>
        </div>
        <div className="flex items-center gap-2">
          <Checkbox id="include-taxes" disabled />
          <label htmlFor="include-taxes" className="text-sm font-medium">
            Include taxes
          </label>
        </div>
        <div className="flex items-center gap-2">
          <Checkbox id="include-fees" disabled />
          <label htmlFor="include-fees" className="text-sm font-medium">
            Include airport fees
          </label>
        </div>
        <div className="flex items-center gap-2">
          <Checkbox id="market-reference" disabled />
          <label htmlFor="market-reference" className="text-sm font-medium">
            Overlay market reference
          </label>
        </div>
        <div className="flex items-center gap-2">
          <Checkbox id="anomaly-flag" disabled />
          <label htmlFor="anomaly-flag" className="text-sm font-medium">
            Z-score anomaly flag
          </label>
        </div>
      </div>

      {/* Comparison Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-50">
              <th className="border border-gray-200 p-3 text-left font-medium">Supplier</th>
              <th className="border border-gray-200 p-3 text-center font-medium">
                Normalized Price
              </th>
              <th className="border border-gray-200 p-3 text-center font-medium">vs Market</th>
              <th className="border border-gray-200 p-3 text-center font-medium">Z-Score</th>
              <th className="border border-gray-200 p-3 text-center font-medium">Anomaly</th>
            </tr>
          </thead>
          <tbody>
            {bids.map((bid) => {
              // Use converted bid if available, otherwise use original
              const displayBid = convertedBids.find((cb) => cb.id === bid.id) || bid;

              // Get normalized price (converted if available)
              const normalizedPrice = getDisplayValue(displayBid as any, 'baseUnitPrice');
              const intoPlaneFee = getDisplayValue(displayBid as any, 'intoPlaneFee');
              const handlingFee = getDisplayValue(displayBid as any, 'handlingFee');

              // Calculate total normalized price including fees
              const totalNormalizedPrice =
                normalizedPrice.value + intoPlaneFee.value + handlingFee.value;

              return (
                <tr key={bid.id} className="hover:bg-gray-50">
                  <td className="border border-gray-200 p-3 font-medium">
                    <div className="flex flex-col">
                      <span>{bid.vendorName || 'Unknown'}</span>
                      {normalizedPrice.isConverted && (
                        <span className="text-xs text-blue-600">Normalized</span>
                      )}
                    </div>
                  </td>
                  <td className="border border-gray-200 p-3 text-center">
                    <div className="flex flex-col">
                      <span className="font-medium">
                        {totalNormalizedPrice.toFixed(3)}/{normalizedPrice.unit}
                      </span>
                      <span className="text-xs text-gray-500">
                        Base: {normalizedPrice.value.toFixed(3)} | Fees:{' '}
                        {(intoPlaneFee.value + handlingFee.value).toFixed(3)}
                      </span>
                    </div>
                  </td>
                  <td className="border border-gray-200 p-3 text-center">
                    <span className="text-green-600">-2.3%</span>
                  </td>
                  <td className="border border-gray-200 p-3 text-center">-0.8</td>
                  <td className="border border-gray-200 p-3 text-center">
                    <StatusBadge status="success" text="Normal" />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Market Reference Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-2">
          <BarChart3 className="h-4 w-4 text-blue-600" />
          <span className="font-medium text-blue-800">Market Reference</span>
        </div>
        <p className="text-sm font-medium text-blue-700">
          Current market price: <span className="font-bold">$0.661/{currentTender?.baseUom} </span>
          (Platts Jet A-1 Med) • Last updated: Jan 20, 2024
        </p>
        <p className="text-xs text-blue-600 mt-1">
          All prices normalized to{' '}
          <span className="font-medium">
            {currentTender?.baseCurrency || 'USD'}/{currentTender?.baseUom}
          </span>{' '}
          {currentTender?.baseUom} for comparison
        </p>
      </div>
    </div>
  );
}
