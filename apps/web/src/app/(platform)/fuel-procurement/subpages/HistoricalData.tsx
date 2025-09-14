'use client';

import { MainCard } from '@/stories/Card/Card';
import { BarChart, Calendar, TrendingUp } from 'lucide-react';
import { useFuelProcurement } from '../contexts';

export default function HistoricalDataPage() {
  const { selectedAirport } = useFuelProcurement();

  if (!selectedAirport) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-500">
        <div className="text-center">
          <h3 className="text-lg font-medium mb-2">No Airport Selected</h3>
          <p className="text-sm">Please select an airport to view historical data.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <MainCard
        title="Historical Fuel Procurement Data"
        subtitle={`${selectedAirport.name} • ${selectedAirport.icao}`}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gray-50 p-6 rounded-lg">
            <div className="flex items-center gap-3 mb-4">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              <h3 className="font-semibold">Price Trends</h3>
            </div>
            <p className="text-sm text-gray-600">
              Historical fuel price analysis and trends for this airport.
            </p>
            <div className="mt-4 text-xs text-gray-500">Coming Soon</div>
          </div>

          <div className="bg-gray-50 p-6 rounded-lg">
            <div className="flex items-center gap-3 mb-4">
              <BarChart className="w-5 h-5 text-green-600" />
              <h3 className="font-semibold">Volume Analytics</h3>
            </div>
            <p className="text-sm text-gray-600">
              Fuel consumption patterns and volume forecasting data.
            </p>
            <div className="mt-4 text-xs text-gray-500">Coming Soon</div>
          </div>

          <div className="bg-gray-50 p-6 rounded-lg">
            <div className="flex items-center gap-3 mb-4">
              <Calendar className="w-5 h-5 text-purple-600" />
              <h3 className="font-semibold">Contract History</h3>
            </div>
            <p className="text-sm text-gray-600">
              Past contracts, performance metrics, and supplier analysis.
            </p>
            <div className="mt-4 text-xs text-gray-500">Coming Soon</div>
          </div>
        </div>
      </MainCard>
    </div>
  );
}
