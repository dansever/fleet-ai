'use client';

import { CardContent } from '@/components/ui/card';
import { Button } from '@/stories/Button/Button';
import { BaseCard, MetricCard } from '@/stories/Card/Card';
import {
  AlertTriangle,
  Calendar,
  DollarSign,
  FileText,
  Gauge,
  TrendingDown,
  TrendingUp,
  Users,
  Zap,
} from 'lucide-react';
import { useFuelProcurement } from '../contexts';

export default function OverviewPage() {
  const { selectedAirport, tenders, bids, contracts, invoices, loading, errors } =
    useFuelProcurement();

  if (!selectedAirport) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-500">
        <div className="text-center">
          <h3 className="text-lg font-medium mb-2">No Airport Selected</h3>
          <p className="text-sm">Please select an airport to view the fuel procurement overview.</p>
        </div>
      </div>
    );
  }

  // Mock data for demonstration - in real implementation, this would come from API
  const kpiData = {
    openTenders: tenders.filter(
      (t) => t.processStatus === 'pending' || t.processStatus === 'in_progress',
    ).length,
    bidsReceived: bids.length,
    agreementsInForce: contracts.filter((c) => c.processStatus === 'closed').length,
    invoicesWithExceptions: invoices.filter(
      (i) => i.invoiceStatus === 'disputed' || i.invoiceStatus === 'received',
    ).length,
    monthToDateVolume: 1250000, // liters
    savingsToDate: 45000, // USD
  };

  const todayData = {
    upcomingDeadlines: tenders.filter((t) => {
      const deadline = new Date(t.biddingEnds || '');
      const today = new Date();
      const diffDays = Math.ceil((deadline.getTime() - today.getTime()) / (1000 * 3600 * 24));
      return diffDays <= 7 && diffDays >= 0;
    }).length,
    renewalsIn30Days: contracts.filter((c) => {
      const renewalDate = new Date(c.effectiveTo || '');
      const today = new Date();
      const diffDays = Math.ceil((renewalDate.getTime() - today.getTime()) / (1000 * 3600 * 24));
      return diffDays <= 30 && diffDays >= 0;
    }).length,
    openDisputes: invoices.filter((i) => i.invoiceStatus === 'disputed').length,
  };

  const exceptionData = {
    priceMismatch: invoices.filter((i) => i.disputesNotes === 'price_mismatch').length,
    feeMismatch: invoices.filter((i) => i.disputesNotes === 'fee_mismatch').length,
    quantityVariance: invoices.filter((i) => i.disputesNotes === 'quantity_variance').length,
    indexDrift: invoices.filter((i) => i.disputesNotes === 'index_drift').length,
  };

  const chartData = {
    priceTrend: [
      { month: 'Jan', price: 0.645 },
      { month: 'Feb', price: 0.652 },
      { month: 'Mar', price: 0.648 },
      { month: 'Apr', price: 0.661 },
      { month: 'May', price: 0.658 },
      { month: 'Jun', price: 0.665 },
    ],
    supplierShare: [
      { supplier: 'Shell', share: 45 },
      { supplier: 'BP', share: 30 },
      { supplier: 'Exxon', share: 25 },
    ],
    anomalyRate: 2.3, // percentage
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-4"></div>
      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <MetricCard
          title="Open Tenders"
          subtitle="Active tenders"
          value={kpiData.openTenders}
          icon={<FileText className="h-5 w-5 text-blue-600" />}
        />
        <MetricCard
          title="Bids Received"
          subtitle="Total bids"
          value={kpiData.bidsReceived}
          icon={<Users className="h-5 w-5 text-green-600" />}
        />
        <MetricCard
          title="Agreements"
          subtitle="In force"
          value={kpiData.agreementsInForce}
          icon={<FileText className="h-5 w-5 text-purple-600" />}
        />
        <MetricCard
          title="Exceptions"
          subtitle="Invoice issues"
          value={kpiData.invoicesWithExceptions}
          icon={<AlertTriangle className="h-5 w-5 text-red-600" />}
        />
        <MetricCard
          title="Volume (L)"
          subtitle="Month to date"
          value={`${(kpiData.monthToDateVolume / 1000).toFixed(0)}K`}
          icon={<Gauge className="h-5 w-5 text-orange-600" />}
        />
        <MetricCard
          title="Savings"
          subtitle="Year to date"
          value={`$${(kpiData.savingsToDate / 1000).toFixed(0)}K`}
          icon={<DollarSign className="h-5 w-5 text-emerald-600" />}
        />
      </div>

      {/* Today Section */}
      <div className="grid grid-cols-4 gap-4">
        <div className="col-span-3 flex flex-col gap-4">
          <BaseCard
            title="Call to Action"
            subtitle="Items requiring your attention"
            headerClassName="from-[#7f7fd5] via-[#86a8e7] to-[#91eae4] opacity-80 text-white"
          >
            <div className="space-y-6">
              {/* Priority Actions */}
              <div>
                <h3 className="text-lg font-semibold mb-4 text-gray-800">Priority Actions</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <MetricCard
                    className="bg-blue-50"
                    title="Upcoming Deadlines"
                    subtitle="Tender deadlines in next 7 days"
                    value={todayData.upcomingDeadlines}
                    icon={<Calendar className="h-5 w-5 text-blue-600" />}
                  />
                  <MetricCard
                    className="bg-orange-50"
                    title="Renewals Due"
                    subtitle="Agreements renewing in 30 days"
                    value={todayData.renewalsIn30Days}
                    icon={<AlertTriangle className="h-5 w-5 text-orange-600" />}
                  />
                  <MetricCard
                    className="bg-red-50"
                    title="Open Disputes"
                    subtitle="Active invoice disputes"
                    value={todayData.openDisputes}
                    icon={<AlertTriangle className="h-5 w-5 text-red-600" />}
                  />
                </div>
              </div>

              {/* Exception Summary */}
              <div>
                <h3 className="text-lg font-semibold mb-4 text-gray-800">Exception Summary</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <MetricCard
                    className="bg-red-50"
                    title="Price Mismatch"
                    value={exceptionData.priceMismatch}
                  />
                  <MetricCard
                    className="bg-orange-50"
                    title="Fee Mismatch"
                    value={exceptionData.feeMismatch}
                  />
                  <MetricCard
                    className="bg-yellow-50"
                    title="Quantity Variance"
                    value={exceptionData.quantityVariance}
                  />
                  <MetricCard
                    className="bg-purple-50"
                    title="Index Drift"
                    value={exceptionData.indexDrift}
                  />
                </div>
              </div>
            </div>
          </BaseCard>

          {/* Mini Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Price Trend Chart */}
            <BaseCard
              title="All-in Price Trend"
              subtitle="6 months price history"
              actions={<Button intent="ghost" text="Explain Spike" icon={Zap} size="sm" />}
            >
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-green-600" />
                      <span className="text-sm text-gray-600">
                        Current: ${chartData.priceTrend[5].price.toFixed(3)}/L
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-green-600" />
                      <span className="text-sm text-green-600">+3.1%</span>
                    </div>
                  </div>
                  <div className="h-32 bg-gray-50 rounded-lg flex items-center justify-center">
                    <div className="text-gray-500 text-sm">Price trend chart placeholder</div>
                  </div>
                </div>
              </CardContent>
            </BaseCard>

            {/* Anomaly Rate Chart */}
            <BaseCard title="Anomaly Rate" subtitle="Exception frequency">
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-orange-600">
                      {chartData.anomalyRate}%
                    </div>
                    <div className="text-sm text-gray-600">Monthly anomaly rate</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <TrendingDown className="h-4 w-4 text-green-600" />
                    <span className="text-sm text-green-600">-0.5% vs last month</span>
                  </div>
                  <div className="h-20 bg-gray-50 rounded-lg flex items-center justify-center">
                    <div className="text-gray-500 text-xs">Anomaly trend chart placeholder</div>
                  </div>
                </div>
              </CardContent>
            </BaseCard>
          </div>
        </div>

        {/* AI Insights Section */}
        <BaseCard
          title="AI Insights"
          subtitle="Automated analysis and recommendations"
          headerClassName="from-[#7f7fd5] via-[#86a8e7] to-[#91eae4] opacity-80 text-white"
        >
          <div className="space-y-4">
            <div className="flex flex-col gap-6">
              <div className="space-y-1">
                <h4 className="font-semibold text-blue-600">Change Summary</h4>
                <p className="text-sm text-gray-600">
                  3 new bids received, 2 agreements renewed, 1 price exception detected.
                </p>
              </div>
              <div className="space-y-1">
                <h4 className="font-semibold text-orange-600">Forecast Check</h4>
                <p className="text-sm text-gray-600">
                  Volume forecast 5% above last year, pricing within expected range.
                </p>
              </div>
              <div className="space-y-1">
                <h4 className="font-semibold text-green-600">Suggested Actions</h4>
                <p className="text-sm text-gray-600">
                  Start Q4 tender, review Shell pricing, resolve 2 invoice disputes.
                </p>
              </div>
            </div>
          </div>
        </BaseCard>
      </div>
    </div>
  );
}
