'use client';

import { CardContent } from '@/components/ui/card';
import { Button } from '@/stories/Button/Button';
import { BaseCard } from '@/stories/Card/Card';
import { StatusBadge } from '@/stories/StatusBadge/StatusBadge';
import { Calendar, Download, Edit, Eye, FileText, TrendingUp } from 'lucide-react';
import { useState } from 'react';
import { useFuelProcurement } from '../contexts';

type AgreementStatus = 'active' | 'expired' | 'pending' | 'all';
type PricingType = 'fixed' | 'index' | 'all';

export default function AgreementsPage() {
  const { selectedAirport, contracts, invoices, loading, errors, selectContract } =
    useFuelProcurement();
  const [selectedStatus, setSelectedStatus] = useState<AgreementStatus>('all');
  const [selectedPricingType, setSelectedPricingType] = useState<PricingType>('all');
  const [selectedAgreement, setSelectedAgreement] = useState<string | null>(null);

  if (!selectedAirport) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-500">
        <div className="text-center">
          <h3 className="text-lg font-medium mb-2">No Airport Selected</h3>
          <p className="text-sm">
            Please select an airport from the sidebar to view fuel agreements.
          </p>
        </div>
      </div>
    );
  }

  // Mock agreement data for demonstration
  const mockAgreements = [
    {
      id: 'AGR-2024-SHL-001',
      name: 'Shell Aviation Q1-Q4 2024',
      supplier: 'Shell Aviation',
      period: 'Jan 2024 - Dec 2024',
      pricingType: 'index' as const,
      renewalDate: '2024-12-31',
      coveragePercent: 45,
      openDisputes: 2,
      status: 'active' as const,
      linkedTender: 'TND-2024-001',
      winningBid: 'BID-2024-SHL-001',
      basePrice: 0.645,
      indexName: 'Platts Jet A-1 Med',
      differential: '+0.023',
      totalExpectedPrice: 0.693,
      kpis: {
        responseTime: '2.3 hours',
        deliveryAccuracy: '98.5%',
        invoiceAccuracy: '96.2%',
      },
      insuranceExpiry: '2024-12-31',
      requiredDocs: ['Insurance Certificate', 'Quality Certificate', 'Safety Certificate'],
      linkedInvoices: 24,
      currentIssues: 2,
    },
    {
      id: 'AGR-2024-BP-002',
      name: 'BP Aviation Spot Contract',
      supplier: 'BP Aviation',
      period: 'Mar 2024 - Jun 2024',
      pricingType: 'fixed' as const,
      renewalDate: '2024-06-30',
      coveragePercent: 30,
      openDisputes: 0,
      status: 'active' as const,
      linkedTender: 'TND-2024-002',
      winningBid: 'BID-2024-BP-002',
      basePrice: 0.652,
      indexName: null,
      differential: null,
      totalExpectedPrice: 0.652,
      kpis: {
        responseTime: '1.8 hours',
        deliveryAccuracy: '99.1%',
        invoiceAccuracy: '98.7%',
      },
      insuranceExpiry: '2024-11-30',
      requiredDocs: ['Insurance Certificate', 'Quality Certificate'],
      linkedInvoices: 12,
      currentIssues: 0,
    },
  ];

  // Filter agreements based on selected filters
  const filteredAgreements = mockAgreements.filter((agreement) => {
    const statusMatch = selectedStatus === 'all' || agreement.status === selectedStatus;
    const pricingMatch =
      selectedPricingType === 'all' || agreement.pricingType === selectedPricingType;
    return statusMatch && pricingMatch;
  });

  const selectedAgreementData = selectedAgreement
    ? mockAgreements.find((a) => a.id === selectedAgreement)
    : null;

  const getStatusColor = (status: AgreementStatus) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'expired':
        return 'danger';
      case 'pending':
        return 'warning';
      default:
        return 'secondary';
    }
  };

  const getPricingTypeLabel = (type: PricingType) => {
    switch (type) {
      case 'fixed':
        return 'Fixed';
      case 'index':
        return 'Index';
      default:
        return 'All Types';
    }
  };

  return (
    <div className="space-y-6">
      {/* Agreement Filters */}
      <BaseCard
        title="Agreement Filters"
        subtitle="Filter agreements by status and pricing type"
        headerClassName="from-[#7f7fd5] via-[#86a8e7] to-[#91eae4] opacity-80 text-white"
      >
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Status</label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value as AgreementStatus)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Statuses</option>
                <option value="active">Active</option>
                <option value="expired">Expired</option>
                <option value="pending">Pending</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Pricing Type</label>
              <select
                value={selectedPricingType}
                onChange={(e) => setSelectedPricingType(e.target.value as PricingType)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Types</option>
                <option value="fixed">Fixed</option>
                <option value="index">Index</option>
              </select>
            </div>
          </div>
        </CardContent>
      </BaseCard>

      {/* Agreements List View */}
      <BaseCard
        title="Fuel Agreements"
        subtitle={`${filteredAgreements.length} agreements found`}
        headerClassName="from-[#7f7fd5] via-[#86a8e7] to-[#91eae4] opacity-80 text-white"
        actions={
          <div className="flex gap-2">
            <Button intent="secondary" text="Export to Excel" icon={Download} size="sm" />
            <Button intent="primary" text="Draft New RFQ" icon={FileText} size="sm" />
          </div>
        }
      >
        <CardContent>
          {loading.contracts ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-gray-500">Loading agreements...</div>
            </div>
          ) : errors.contracts ? (
            <div className="flex items-center justify-center py-8 text-red-500">
              Error loading agreements: {errors.contracts}
            </div>
          ) : filteredAgreements.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-gray-500">
              <FileText className="h-12 w-12 mb-4" />
              <h3 className="text-lg font-medium mb-2">No Agreements Found</h3>
              <p className="text-sm">No agreements match the selected filters.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Table Header */}
              <div className="grid grid-cols-12 gap-4 p-3 bg-gray-50 rounded-lg font-medium text-sm text-gray-700">
                <div className="col-span-3">Agreement Name</div>
                <div className="col-span-2">Supplier</div>
                <div className="col-span-2">Period</div>
                <div className="col-span-1">Pricing</div>
                <div className="col-span-1">Renewal</div>
                <div className="col-span-1">Coverage</div>
                <div className="col-span-1">Disputes</div>
                <div className="col-span-1">Actions</div>
              </div>

              {/* Table Rows */}
              {filteredAgreements.map((agreement) => (
                <div
                  key={agreement.id}
                  className="grid grid-cols-12 gap-4 p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  <div className="col-span-3 flex items-center">
                    <span className="font-medium">{agreement.name}</span>
                  </div>
                  <div className="col-span-2 flex items-center">
                    <span className="text-sm">{agreement.supplier}</span>
                  </div>
                  <div className="col-span-2 flex items-center">
                    <span className="text-sm">{agreement.period}</span>
                  </div>
                  <div className="col-span-1 flex items-center">
                    <StatusBadge
                      status={agreement.pricingType === 'fixed' ? 'secondary' : 'secondary'}
                      text={agreement.pricingType.toUpperCase()}
                    />
                  </div>
                  <div className="col-span-1 flex items-center">
                    <span className="text-sm">{agreement.renewalDate}</span>
                  </div>
                  <div className="col-span-1 flex items-center">
                    <span className="text-sm">{agreement.coveragePercent}%</span>
                  </div>
                  <div className="col-span-1 flex items-center">
                    <StatusBadge
                      status={agreement.openDisputes > 0 ? 'danger' : 'operational'}
                      text={agreement.openDisputes.toString()}
                    />
                  </div>
                  <div className="col-span-1 flex items-center gap-1">
                    <Button
                      intent="ghost"
                      icon={Eye}
                      size="sm"
                      onClick={() => setSelectedAgreement(agreement.id)}
                    />
                    <Button intent="ghost" icon={Edit} size="sm" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </BaseCard>

      {/* Agreement Detail */}
      {selectedAgreementData && (
        <div className="space-y-6">
          {/* Agreement Summary */}
          <BaseCard
            title={`${selectedAgreementData.name} Details`}
            subtitle={`${selectedAgreementData.supplier} • ${selectedAgreementData.period}`}
            headerClassName="from-[#7f7fd5] via-[#86a8e7] to-[#91eae4] opacity-80 text-white"
            actions={
              <div className="flex gap-2">
                <Button intent="secondary" text="Edit Agreement" icon={Edit} />
                <Button intent="primary" text="Draft RFQ" icon={FileText} />
              </div>
            }
          >
            <CardContent className="space-y-6">
              {/* Summary Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center space-y-2 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="text-sm text-blue-600 font-medium">Expected Price</div>
                  <div className="text-xl font-bold text-blue-800">
                    ${selectedAgreementData.totalExpectedPrice.toFixed(3)}/L
                  </div>
                </div>
                <div className="text-center space-y-2 p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="text-sm text-green-600 font-medium">Linked Invoices</div>
                  <div className="text-xl font-bold text-green-800">
                    {selectedAgreementData.linkedInvoices}
                  </div>
                </div>
                <div className="text-center space-y-2 p-4 bg-orange-50 rounded-lg border border-orange-200">
                  <div className="text-sm text-orange-600 font-medium">Current Issues</div>
                  <div className="text-xl font-bold text-orange-800">
                    {selectedAgreementData.currentIssues}
                  </div>
                </div>
                <div className="text-center space-y-2 p-4 bg-purple-50 rounded-lg border border-purple-200">
                  <div className="text-sm text-purple-600 font-medium">Coverage</div>
                  <div className="text-xl font-bold text-purple-800">
                    {selectedAgreementData.coveragePercent}%
                  </div>
                </div>
              </div>

              {/* Pricing Formula */}
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-700">Pricing Formula</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center space-y-2 p-3 bg-gray-50 rounded-lg">
                    <div className="text-gray-600">Base Price</div>
                    <div className="font-bold">${selectedAgreementData.basePrice.toFixed(3)}</div>
                  </div>
                  {selectedAgreementData.indexName && (
                    <div className="text-center space-y-2 p-3 bg-gray-50 rounded-lg">
                      <div className="text-gray-600">Index</div>
                      <div className="font-bold">{selectedAgreementData.indexName}</div>
                    </div>
                  )}
                  {selectedAgreementData.differential && (
                    <div className="text-center space-y-2 p-3 bg-gray-50 rounded-lg">
                      <div className="text-gray-600">Differential</div>
                      <div className="font-bold">{selectedAgreementData.differential}</div>
                    </div>
                  )}
                  <div className="text-center space-y-2 p-3 bg-blue-100 rounded-lg">
                    <div className="text-blue-600">Total</div>
                    <div className="font-bold text-blue-800">
                      ${selectedAgreementData.totalExpectedPrice.toFixed(3)}/L
                    </div>
                  </div>
                </div>
              </div>

              {/* Linked Items */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-700">Linked Items</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Linked Tender</span>
                      <span className="text-sm font-medium">
                        {selectedAgreementData.linkedTender}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Winning Bid</span>
                      <span className="text-sm font-medium">
                        {selectedAgreementData.winningBid}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Invoices Under Agreement</span>
                      <span className="text-sm font-medium">
                        {selectedAgreementData.linkedInvoices}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Current Issues</span>
                      <span className="text-sm font-medium">
                        {selectedAgreementData.currentIssues}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-700">SLA & Compliance</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Response Time</span>
                      <span className="text-sm font-medium">
                        {selectedAgreementData.kpis.responseTime}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Delivery Accuracy</span>
                      <span className="text-sm font-medium">
                        {selectedAgreementData.kpis.deliveryAccuracy}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Invoice Accuracy</span>
                      <span className="text-sm font-medium">
                        {selectedAgreementData.kpis.invoiceAccuracy}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Insurance Expiry</span>
                      <span className="text-sm font-medium">
                        {selectedAgreementData.insuranceExpiry}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Required Documents */}
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-700">Required Documents</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedAgreementData.requiredDocs.map((doc, index) => (
                    <StatusBadge key={index} status="secondary" text={doc} />
                  ))}
                </div>
              </div>

              {/* Renewal Helpers */}
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-700">Renewal Helpers</h4>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="h-4 w-4 text-yellow-600" />
                    <span className="font-medium text-yellow-800">Renewal Reminder</span>
                  </div>
                  <p className="text-sm text-yellow-700 mb-3">
                    Agreement expires on {selectedAgreementData.renewalDate}. Consider drafting a
                    new RFQ based on year-to-date performance.
                  </p>
                  <div className="flex gap-2">
                    <Button intent="warning" text="Draft Renewal RFQ" icon={FileText} size="sm" />
                    <Button
                      intent="secondary"
                      text="View Performance"
                      icon={TrendingUp}
                      size="sm"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </BaseCard>
        </div>
      )}
    </div>
  );
}
