'use client';

import { CardContent } from '@/components/ui/card';
import { Button } from '@/stories/Button/Button';
import { BaseCard, MetricCard } from '@/stories/Card/Card';
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
        <MetricCard
          className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200"
          title="Total Spend"
          value="$1.8M"
          change="+12.5% vs last year"
          tone="positive"
          icon={<DollarSign className="h-6 w-6 text-blue-600" />}
          footer="Last 12 months"
        />

        <MetricCard
          className="bg-gradient-to-br from-yellow-50/50 to-yellow-100/60 border-yellow-300"
          title="Total Volume"
          value="2.4M L"
          change="+8.3% vs last year"
          tone="positive"
          icon={<BarChart className="h-6 w-6 text-green-600" />}
          footer="Last 12 months"
        />

        <MetricCard
          className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200"
          title="Avg Price"
          value="$0.712/L"
          change="-1.1% vs benchmark"
          tone="positive"
          icon={<TrendingUp className="h-6 w-6 text-purple-600" />}
          footer="vs $0.720 benchmark"
        />

        <MetricCard
          className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200"
          title="Total Savings"
          value="$57K"
          change="+3.2% savings rate"
          tone="positive"
          icon={<Target className="h-6 w-6 text-emerald-600" />}
          footer="3.2% savings rate"
        />
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
            <div className="p-4 bg-gray-50 rounded-lg">
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
                <MetricCard
                  title="Peak Month"
                  value="Nov 2023"
                  change="$162,000"
                  tone="neutral"
                  icon={<TrendingUp className="h-6 w-6 text-blue-600" />}
                  footer="Highest spend month"
                />
                <MetricCard
                  title="Lowest Month"
                  value="Jan 2023"
                  change="$125,000"
                  tone="neutral"
                  icon={<BarChart className="h-6 w-6 text-green-600" />}
                  footer="Lowest spend month"
                />
                <MetricCard
                  title="Average"
                  value="$142,000"
                  change="Monthly spend"
                  tone="neutral"
                  icon={<DollarSign className="h-6 w-6 text-purple-600" />}
                  footer="12-month average"
                />
              </div>
            )}
          </div>
        </CardContent>
      </BaseCard>

      {/* Supplier Share Analysis */}
      <BaseCard
        title="Supplier Share Analysis"
        subtitle="Market distribution and performance by supplier"
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
      <BaseCard title="Savings Tracker" subtitle="Auction savings and recovered credits analysis">
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <MetricCard
              title="Auction Savings"
              value={`$${historicalData.savingsTracker.auctionSavings.toLocaleString()}`}
              change="+15.2% vs last quarter"
              tone="positive"
              icon={<Target className="h-6 w-6 text-green-600" />}
              footer="Competitive bidding"
            />
            <MetricCard
              title="Recovered Credits"
              value={`$${historicalData.savingsTracker.recoveredCredits.toLocaleString()}`}
              change="+8.7% vs last quarter"
              tone="positive"
              icon={<DollarSign className="h-6 w-6 text-blue-600" />}
              footer="Invoice disputes"
            />
            <MetricCard
              title="Total Savings"
              value={`$${historicalData.savingsTracker.totalSavings.toLocaleString()}`}
              change="+12.1% vs last quarter"
              tone="positive"
              icon={<TrendingUp className="h-6 w-6 text-purple-600" />}
              footer="Combined impact"
            />
            <MetricCard
              title="Savings Rate"
              value={`${historicalData.savingsTracker.savingsRate}%`}
              change="+0.8% vs baseline"
              tone="positive"
              icon={<BarChart className="h-6 w-6 text-orange-600" />}
              footer="vs baseline"
            />
          </div>
        </CardContent>
      </BaseCard>

      {/* AI Forecasting */}
      <BaseCard
        title="AI Forecasting & Recommendations"
        subtitle="Demand forecast with confidence bands and next tender recommendations"
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
            <MetricCard
              title="Next Month Volume"
              value={`${(historicalData.forecastData.nextMonthVolume / 1000).toFixed(0)}K L`}
              change={
                historicalData.forecastData.trendDirection === 'up'
                  ? '+5.2% vs current'
                  : '-2.1% vs current'
              }
              tone={historicalData.forecastData.trendDirection === 'up' ? 'positive' : 'negative'}
              icon={<BarChart className="h-6 w-6 text-blue-600" />}
              footer="Forecasted demand"
            />
            <MetricCard
              title="Next Month Price"
              value={`$${historicalData.forecastData.nextMonthPrice.toFixed(3)}/L`}
              change={`Confidence: ${(historicalData.forecastData.confidenceBand * 100).toFixed(0)}%`}
              tone="neutral"
              icon={<TrendingUp className="h-6 w-6 text-green-600" />}
              footer="Price forecast"
            />
            <MetricCard
              title="Recommended Suppliers"
              value="3"
              change="Based on performance"
              tone="neutral"
              icon={<Target className="h-6 w-6 text-purple-600" />}
              footer="Optimized selection"
            />
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
