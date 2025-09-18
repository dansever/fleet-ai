'use client';

import { CardContent } from '@/components/ui/card';
import { Button } from '@/stories/Button/Button';
import { BaseCard } from '@/stories/Card/Card';
import { ModernSelect } from '@/stories/Form/Form';
import {
  Activity,
  BarChart,
  BarChart3,
  DollarSign,
  Download,
  Target,
  TrendingUp,
  Zap,
} from 'lucide-react';
import { useState } from 'react';
import { useFuelProcurement } from '../contexts';

type TimeRange = '6months' | '1year' | '2years' | 'all';
type ChartType = 'spend' | 'volume' | 'price' | 'savings' | 'exceptions';

export default function HistoricalDataPage() {
  const { selectedAirport, tenders, bids, contracts, invoices, loading, errors } =
    useFuelProcurement();
  const [selectedTimeRange, setSelectedTimeRange] = useState<TimeRange>('1year');
  const [selectedChartType, setSelectedChartType] = useState<ChartType>('spend');

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

  // Mock historical data for demonstration
  const historicalData = {
    spendTrend: [
      { month: 'Jan 2023', amount: 125000, volume: 185000 },
      { month: 'Feb 2023', amount: 132000, volume: 192000 },
      { month: 'Mar 2023', amount: 128000, volume: 188000 },
      { month: 'Apr 2023', amount: 135000, volume: 195000 },
      { month: 'May 2023', amount: 142000, volume: 202000 },
      { month: 'Jun 2023', amount: 138000, volume: 198000 },
      { month: 'Jul 2023', amount: 145000, volume: 205000 },
      { month: 'Aug 2023', amount: 152000, volume: 212000 },
      { month: 'Sep 2023', amount: 148000, volume: 208000 },
      { month: 'Oct 2023', amount: 155000, volume: 215000 },
      { month: 'Nov 2023', amount: 162000, volume: 222000 },
      { month: 'Dec 2023', amount: 158000, volume: 218000 },
    ],
    supplierShare: [
      { supplier: 'Shell Aviation', share: 45, volume: 1250000, avgPrice: 0.712 },
      { supplier: 'BP Aviation', share: 30, volume: 850000, avgPrice: 0.708 },
      { supplier: 'Exxon Aviation', share: 25, volume: 700000, avgPrice: 0.715 },
    ],
    savingsTracker: {
      auctionSavings: 45000,
      recoveredCredits: 12000,
      totalSavings: 57000,
      savingsRate: 3.2,
    },
    exceptionAnalytics: {
      totalExceptions: 24,
      priceMismatch: 8,
      feeMismatch: 6,
      quantityVariance: 5,
      indexDrift: 5,
      avgResolutionTime: '2.3 days',
      totalRecovery: 18500,
    },
    forecastData: {
      nextMonthVolume: 225000,
      nextMonthPrice: 0.735,
      confidenceBand: 0.95,
      trendDirection: 'up' as const,
      keyDrivers: [
        'Seasonal demand increase',
        'Index price volatility',
        'Supplier capacity constraints',
      ],
    },
  };

  const getTimeRangeLabel = (range: TimeRange) => {
    switch (range) {
      case '6months':
        return '6 Months';
      case '1year':
        return '1 Year';
      case '2years':
        return '2 Years';
      case 'all':
        return 'All Time';
      default:
        return '1 Year';
    }
  };

  const getChartTypeLabel = (type: ChartType) => {
    switch (type) {
      case 'spend':
        return 'Spend Trends';
      case 'volume':
        return 'Volume Analytics';
      case 'price':
        return 'Price Trends';
      case 'savings':
        return 'Savings Tracker';
      case 'exceptions':
        return 'Exception Analytics';
      default:
        return 'Spend Trends';
    }
  };

  return (
    <div className="space-y-6">
      {/* Key Metrics Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <BaseCard className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600 font-medium">Total Spend</p>
                <p className="text-2xl font-bold text-blue-800">$1.8M</p>
                <p className="text-xs text-blue-600">Last 12 months</p>
              </div>
              <DollarSign className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </BaseCard>

        <BaseCard className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600 font-medium">Total Volume</p>
                <p className="text-2xl font-bold text-green-800">2.4M L</p>
                <p className="text-xs text-green-600">Last 12 months</p>
              </div>
              <BarChart className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </BaseCard>

        <BaseCard className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-600 font-medium">Avg Price</p>
                <p className="text-2xl font-bold text-purple-800">$0.712/L</p>
                <p className="text-xs text-purple-600">vs $0.720 benchmark</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </BaseCard>

        <BaseCard className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-emerald-600 font-medium">Total Savings</p>
                <p className="text-2xl font-bold text-emerald-800">$57K</p>
                <p className="text-xs text-emerald-600">3.2% savings rate</p>
              </div>
              <Target className="h-8 w-8 text-emerald-600" />
            </div>
          </CardContent>
        </BaseCard>
      </div>

      {/* Main Chart Section */}
      <BaseCard
        title={getChartTypeLabel(selectedChartType)}
        subtitle={`${getTimeRangeLabel(selectedTimeRange)} historical analysis`}
        headerClassName="from-[#7f7fd5] via-[#86a8e7] to-[#91eae4] opacity-80 text-white"
        actions={
          <div className="flex gap-2">
            <Button intent="secondary" text="Export Data" icon={Download} size="sm" />
            <Button intent="primary" text="Explain Trend" icon={Zap} size="sm" />
          </div>
        }
      >
        <CardContent>
          <div className="space-y-6">
            {/* Historical Data Filters */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Filter Historical Data</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Time Range</label>
                  <ModernSelect
                    value={selectedTimeRange}
                    onValueChange={(value) => setSelectedTimeRange(value as TimeRange)}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    options={[
                      { value: '6months', label: '6 Months' },
                      { value: '1year', label: '1 Year' },
                      { value: '2years', label: '2 Years' },
                      { value: 'all', label: 'All Time' },
                    ]}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Chart Type</label>
                  <ModernSelect
                    value={selectedChartType}
                    onValueChange={(value) => setSelectedChartType(value as ChartType)}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    options={[
                      { value: 'spend', label: 'Spend Trends' },
                      { value: 'volume', label: 'Volume Analytics' },
                      { value: 'price', label: 'Price Trends' },
                      { value: 'savings', label: 'Savings Tracker' },
                      { value: 'exceptions', label: 'Exception Analytics' },
                    ]}
                  />
                </div>
              </div>
            </div>

            {/* Chart Placeholder */}
            <div className="h-80 bg-gray-50 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <BarChart3 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-700 mb-2">
                  {getChartTypeLabel(selectedChartType)} Chart
                </h3>
                <p className="text-sm text-gray-500">
                  Interactive chart showing {getChartTypeLabel(selectedChartType).toLowerCase()}{' '}
                  over {getTimeRangeLabel(selectedTimeRange).toLowerCase()}
                </p>
              </div>
            </div>

            {/* Chart Data Summary */}
            {selectedChartType === 'spend' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center space-y-2 p-4 bg-blue-50 rounded-lg">
                  <div className="text-sm text-blue-600 font-medium">Peak Month</div>
                  <div className="text-lg font-bold text-blue-800">Nov 2023</div>
                  <div className="text-xs text-blue-600">$162,000</div>
                </div>
                <div className="text-center space-y-2 p-4 bg-green-50 rounded-lg">
                  <div className="text-sm text-green-600 font-medium">Lowest Month</div>
                  <div className="text-lg font-bold text-green-800">Jan 2023</div>
                  <div className="text-xs text-green-600">$125,000</div>
                </div>
                <div className="text-center space-y-2 p-4 bg-purple-50 rounded-lg">
                  <div className="text-sm text-purple-600 font-medium">Average</div>
                  <div className="text-lg font-bold text-purple-800">$142,000</div>
                  <div className="text-xs text-purple-600">Monthly spend</div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </BaseCard>

      {/* Supplier Share Analysis */}
      <BaseCard
        title="Supplier Share Analysis"
        subtitle="Market distribution and performance by supplier"
        headerClassName="from-[#7f7fd5] via-[#86a8e7] to-[#91eae4] opacity-80 text-white"
      >
        <CardContent>
          <div className="space-y-4">
            {historicalData.supplierShare.map((supplier, index) => (
              <div key={supplier.supplier} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-medium">{supplier.supplier}</span>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-gray-600">{supplier.share}%</span>
                    <span className="text-sm text-gray-600">${supplier.avgPrice.toFixed(3)}/L</span>
                    <span className="text-sm text-gray-600">
                      {(supplier.volume / 1000).toFixed(0)}K L
                    </span>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      index === 0 ? 'bg-blue-600' : index === 1 ? 'bg-green-600' : 'bg-purple-600'
                    }`}
                    style={{ width: `${supplier.share}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </BaseCard>

      {/* Savings Tracker */}
      <BaseCard
        title="Savings Tracker"
        subtitle="Auction savings and recovered credits analysis"
        headerClassName="from-[#7f7fd5] via-[#86a8e7] to-[#91eae4] opacity-80 text-white"
      >
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center space-y-2 p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="text-sm text-green-600 font-medium">Auction Savings</div>
              <div className="text-xl font-bold text-green-800">
                ${historicalData.savingsTracker.auctionSavings.toLocaleString()}
              </div>
              <div className="text-xs text-green-600">Competitive bidding</div>
            </div>
            <div className="text-center space-y-2 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="text-sm text-blue-600 font-medium">Recovered Credits</div>
              <div className="text-xl font-bold text-blue-800">
                ${historicalData.savingsTracker.recoveredCredits.toLocaleString()}
              </div>
              <div className="text-xs text-blue-600">Invoice disputes</div>
            </div>
            <div className="text-center space-y-2 p-4 bg-purple-50 rounded-lg border border-purple-200">
              <div className="text-sm text-purple-600 font-medium">Total Savings</div>
              <div className="text-xl font-bold text-purple-800">
                ${historicalData.savingsTracker.totalSavings.toLocaleString()}
              </div>
              <div className="text-xs text-purple-600">Combined impact</div>
            </div>
            <div className="text-center space-y-2 p-4 bg-orange-50 rounded-lg border border-orange-200">
              <div className="text-sm text-orange-600 font-medium">Savings Rate</div>
              <div className="text-xl font-bold text-orange-800">
                {historicalData.savingsTracker.savingsRate}%
              </div>
              <div className="text-xs text-orange-600">vs baseline</div>
            </div>
          </div>
        </CardContent>
      </BaseCard>

      {/* AI Forecasting */}
      <BaseCard
        title="AI Forecasting & Recommendations"
        subtitle="Demand forecast with confidence bands and next tender recommendations"
        headerClassName="from-[#7f7fd5] via-[#86a8e7] to-[#91eae4] opacity-80 text-white"
        actions={
          <div className="flex gap-2">
            <Button intent="primary" text="Build Next Tender" icon={Zap} />
            <Button intent="secondary" text="View Forecast Details" icon={Activity} />
          </div>
        }
      >
        <CardContent className="space-y-6">
          {/* Forecast Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center space-y-2 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="text-sm text-blue-600 font-medium">Next Month Volume</div>
              <div className="text-xl font-bold text-blue-800">
                {(historicalData.forecastData.nextMonthVolume / 1000).toFixed(0)}K L
              </div>
              <div className="text-xs text-blue-600">
                {historicalData.forecastData.trendDirection === 'up' ? (
                  <span className="text-green-600">↗ +5.2% vs current</span>
                ) : (
                  <span className="text-red-600">↘ -2.1% vs current</span>
                )}
              </div>
            </div>
            <div className="text-center space-y-2 p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="text-sm text-green-600 font-medium">Next Month Price</div>
              <div className="text-xl font-bold text-green-800">
                ${historicalData.forecastData.nextMonthPrice.toFixed(3)}/L
              </div>
              <div className="text-xs text-green-600">
                Confidence: {(historicalData.forecastData.confidenceBand * 100).toFixed(0)}%
              </div>
            </div>
            <div className="text-center space-y-2 p-4 bg-purple-50 rounded-lg border border-purple-200">
              <div className="text-sm text-purple-600 font-medium">Recommended Suppliers</div>
              <div className="text-xl font-bold text-purple-800">3</div>
              <div className="text-xs text-purple-600">Based on performance</div>
            </div>
          </div>

          {/* Key Drivers */}
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-700">Key Forecast Drivers</h4>
            <div className="space-y-2">
              {historicalData.forecastData.keyDrivers.map((driver, index) => (
                <div key={index} className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                  <span className="text-sm text-gray-700">{driver}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Next Tender Recommendations */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Target className="h-4 w-4 text-blue-600" />
              <span className="font-medium text-blue-800">Next Tender Recommendations</span>
            </div>
            <p className="text-sm text-blue-700 mb-3">
              Based on historical performance and forecast data, consider these optimizations for
              your next tender:
            </p>
            <div className="space-y-2">
              <div className="text-sm text-blue-700">
                • Split volume between Shell (45%) and BP (35%) for optimal pricing
              </div>
              <div className="text-sm text-blue-700">
                • Include index-linked pricing for 60% of volume to hedge volatility
              </div>
              <div className="text-sm text-blue-700">
                • Set tender deadline for March 15th to align with seasonal demand
              </div>
            </div>
          </div>
        </CardContent>
      </BaseCard>
    </div>
  );
}
