'use client';

import { CardContent } from '@/components/ui/card';
import { Button } from '@/stories/Button/Button';
import { BaseCard } from '@/stories/Card/Card';
import { StatusBadge } from '@/stories/StatusBadge/StatusBadge';
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
    <div className="space-y-6">
      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <BaseCard className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600 font-medium">Open Tenders</p>
                <p className="text-2xl font-bold text-blue-800">{kpiData.openTenders}</p>
              </div>
              <FileText className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </BaseCard>

        <BaseCard className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600 font-medium">Bids Received</p>
                <p className="text-2xl font-bold text-green-800">{kpiData.bidsReceived}</p>
              </div>
              <Users className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </BaseCard>

        <BaseCard className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-600 font-medium">Agreements</p>
                <p className="text-2xl font-bold text-purple-800">{kpiData.agreementsInForce}</p>
              </div>
              <FileText className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </BaseCard>

        <BaseCard className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-red-600 font-medium">Exceptions</p>
                <p className="text-2xl font-bold text-red-800">{kpiData.invoicesWithExceptions}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </BaseCard>

        <BaseCard className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-orange-600 font-medium">Volume (L)</p>
                <p className="text-2xl font-bold text-orange-800">
                  {(kpiData.monthToDateVolume / 1000).toFixed(0)}K
                </p>
              </div>
              <Gauge className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </BaseCard>

        <BaseCard className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-emerald-600 font-medium">Savings</p>
                <p className="text-2xl font-bold text-emerald-800">
                  ${(kpiData.savingsToDate / 1000).toFixed(0)}K
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-emerald-600" />
            </div>
          </CardContent>
        </BaseCard>
      </div>

      {/* Today Section */}
      <BaseCard
        title="Today's Priorities"
        subtitle="Critical items requiring attention"
        headerClassName="from-[#7f7fd5] via-[#86a8e7] to-[#91eae4] opacity-80 text-white"
      >
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-600" />
              <h3 className="font-semibold">Upcoming Deadlines</h3>
            </div>
            <div className="text-3xl font-bold text-blue-600">{todayData.upcomingDeadlines}</div>
            <p className="text-sm text-gray-600">Tender deadlines in next 7 days</p>
            {todayData.upcomingDeadlines > 0 && (
              <Button intent="primary" text="View Deadlines" size="sm" />
            )}
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
              <h3 className="font-semibold">Renewals Due</h3>
            </div>
            <div className="text-3xl font-bold text-orange-600">{todayData.renewalsIn30Days}</div>
            <p className="text-sm text-gray-600">Agreements renewing in 30 days</p>
            {todayData.renewalsIn30Days > 0 && (
              <Button intent="warning" text="Review Renewals" size="sm" />
            )}
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <h3 className="font-semibold">Open Disputes</h3>
            </div>
            <div className="text-3xl font-bold text-red-600">{todayData.openDisputes}</div>
            <p className="text-sm text-gray-600">Active invoice disputes</p>
            {todayData.openDisputes > 0 && (
              <Button intent="danger" text="Resolve Disputes" size="sm" />
            )}
          </div>
        </CardContent>
      </BaseCard>

      {/* Exceptions Tiles */}
      <BaseCard
        title="Exception Summary"
        subtitle="Invoice validation issues by type"
        headerClassName="from-[#7f7fd5] via-[#86a8e7] to-[#91eae4] opacity-80 text-white"
      >
        <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center space-y-2 p-4 bg-red-50 rounded-lg border border-red-200">
            <div className="text-sm text-red-600 font-medium">Price Mismatch</div>
            <div className="text-2xl font-bold text-red-800">{exceptionData.priceMismatch}</div>
            <StatusBadge
              status={exceptionData.priceMismatch > 0 ? 'danger' : 'success'}
              text={exceptionData.priceMismatch > 0 ? 'Action Required' : 'All Clear'}
            />
          </div>

          <div className="text-center space-y-2 p-4 bg-orange-50 rounded-lg border border-orange-200">
            <div className="text-sm text-orange-600 font-medium">Fee Mismatch</div>
            <div className="text-2xl font-bold text-orange-800">{exceptionData.feeMismatch}</div>
            <StatusBadge
              status={exceptionData.feeMismatch > 0 ? 'warning' : 'success'}
              text={exceptionData.feeMismatch > 0 ? 'Review Needed' : 'All Clear'}
            />
          </div>

          <div className="text-center space-y-2 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <div className="text-sm text-yellow-600 font-medium">Quantity Variance</div>
            <div className="text-2xl font-bold text-yellow-800">
              {exceptionData.quantityVariance}
            </div>
            <StatusBadge
              status={exceptionData.quantityVariance > 0 ? 'warning' : 'success'}
              text={exceptionData.quantityVariance > 0 ? 'Check Required' : 'All Clear'}
            />
          </div>

          <div className="text-center space-y-2 p-4 bg-purple-50 rounded-lg border border-purple-200">
            <div className="text-sm text-purple-600 font-medium">Index Drift</div>
            <div className="text-2xl font-bold text-purple-800">{exceptionData.indexDrift}</div>
            <StatusBadge
              status={exceptionData.indexDrift > 0 ? 'warning' : 'success'}
              text={exceptionData.indexDrift > 0 ? 'Monitor' : 'All Clear'}
            />
          </div>
        </CardContent>
      </BaseCard>

      {/* Mini Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Price Trend Chart */}
        <BaseCard
          title="All-in Price Trend"
          subtitle="6 months price history"
          headerClassName="from-[#7f7fd5] via-[#86a8e7] to-[#91eae4] opacity-80 text-white"
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

        {/* Supplier Share Chart */}
        <BaseCard
          title="Supplier Share"
          subtitle="Market distribution"
          headerClassName="from-[#7f7fd5] via-[#86a8e7] to-[#91eae4] opacity-80 text-white"
        >
          <CardContent>
            <div className="space-y-4">
              {chartData.supplierShare.map((supplier, index) => (
                <div key={supplier.supplier} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">{supplier.supplier}</span>
                    <span className="text-sm text-gray-600">{supplier.share}%</span>
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

        {/* Anomaly Rate Chart */}
        <BaseCard
          title="Anomaly Rate"
          subtitle="Exception frequency"
          headerClassName="from-[#7f7fd5] via-[#86a8e7] to-[#91eae4] opacity-80 text-white"
        >
          <CardContent>
            <div className="space-y-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-600">{chartData.anomalyRate}%</div>
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

      {/* AI Insights Section */}
      <BaseCard
        title="AI Insights"
        subtitle="Automated analysis and recommendations"
        headerClassName="from-[#7f7fd5] via-[#86a8e7] to-[#91eae4] opacity-80 text-white"
        actions={<Button intent="primary" text="Create Tender Draft" icon={Zap} />}
      >
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <h4 className="font-semibold text-blue-600">Change Summary</h4>
              <p className="text-sm text-gray-600">
                3 new bids received, 2 agreements renewed, 1 price exception detected.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-orange-600">Forecast Check</h4>
              <p className="text-sm text-gray-600">
                Volume forecast 5% above last year, pricing within expected range.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-green-600">Suggested Actions</h4>
              <p className="text-sm text-gray-600">
                Start Q4 tender, review Shell pricing, resolve 2 invoice disputes.
              </p>
            </div>
          </div>
        </CardContent>
      </BaseCard>
    </div>
  );
}
