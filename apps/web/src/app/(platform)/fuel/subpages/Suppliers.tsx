'use client';

import { CardContent } from '@/components/ui/card';
import { Button } from '@/stories/Button/Button';
import { BaseCard } from '@/stories/Card/Card';
import { ModernSelect } from '@/stories/Form/Form';
import { StatusBadge } from '@/stories/StatusBadge/StatusBadge';
import {
  AlertTriangle,
  Award,
  Calendar,
  DollarSign,
  Download,
  Eye,
  Mail,
  Star,
  TrendingUp,
  Users,
} from 'lucide-react';
import { useState } from 'react';
import { useFuelProcurement } from '../contexts';

type ComplianceStatus = 'compliant' | 'non_compliant' | 'pending' | 'all';
type AgreementStatus = 'active' | 'expired' | 'pending' | 'all';

export default function SuppliersPage() {
  const { selectedAirport, contracts, loading, errors } = useFuelProcurement();
  const [selectedCompliance, setSelectedCompliance] = useState<ComplianceStatus>('all');
  const [selectedAgreementStatus, setSelectedAgreementStatus] = useState<AgreementStatus>('all');
  const [selectedSupplier, setSelectedSupplier] = useState<string | null>(null);

  if (!selectedAirport) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-500">
        <div className="text-center">
          <h3 className="text-lg font-medium mb-2">No Airport Selected</h3>
          <p className="text-sm">Please select an airport to view supplier intelligence.</p>
        </div>
      </div>
    );
  }

  // Mock supplier data for demonstration
  const mockSuppliers = [
    {
      id: 'SUP-001',
      name: 'Shell Aviation',
      responseRate: 95,
      winRate: 78,
      invoiceIssueRate: 2.3,
      performanceScore: 8.7,
      complianceStatus: 'compliant' as const,
      agreementStatus: 'active' as const,
      activeAgreements: 2,
      totalVolume: 1250000,
      avgPrice: 0.645,
      lastBidDate: '2024-01-15',
      riskLevel: 'low' as const,
      contactName: 'John Smith',
      contactEmail: 'john.smith@shell.com',
      contactPhone: '+1-555-0123',
      insuranceExpiry: '2024-12-31',
      certifications: ['ISO 9001', 'ISO 14001', 'OHSAS 18001'],
    },
    {
      id: 'SUP-002',
      name: 'BP Aviation',
      responseRate: 88,
      winRate: 65,
      invoiceIssueRate: 4.1,
      performanceScore: 7.2,
      complianceStatus: 'compliant' as const,
      agreementStatus: 'active' as const,
      activeAgreements: 1,
      totalVolume: 890000,
      avgPrice: 0.652,
      lastBidDate: '2024-01-10',
      riskLevel: 'medium' as const,
      contactName: 'Sarah Johnson',
      contactEmail: 'sarah.johnson@bp.com',
      contactPhone: '+1-555-0124',
      insuranceExpiry: '2024-11-30',
      certifications: ['ISO 9001', 'ISO 14001'],
    },
    {
      id: 'SUP-003',
      name: 'Exxon Aviation',
      responseRate: 92,
      winRate: 71,
      invoiceIssueRate: 3.2,
      performanceScore: 7.8,
      complianceStatus: 'pending' as const,
      agreementStatus: 'expired' as const,
      activeAgreements: 0,
      totalVolume: 650000,
      avgPrice: 0.648,
      lastBidDate: '2024-01-05',
      riskLevel: 'medium' as const,
      contactName: 'Mike Davis',
      contactEmail: 'mike.davis@exxon.com',
      contactPhone: '+1-555-0125',
      insuranceExpiry: '2024-10-15',
      certifications: ['ISO 9001'],
    },
  ];

  // Filter suppliers based on selected filters
  const filteredSuppliers = mockSuppliers.filter((supplier) => {
    const complianceMatch =
      selectedCompliance === 'all' || supplier.complianceStatus === selectedCompliance;
    const agreementMatch =
      selectedAgreementStatus === 'all' || supplier.agreementStatus === selectedAgreementStatus;
    return complianceMatch && agreementMatch;
  });

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'low':
        return 'success';
      case 'medium':
        return 'warning';
      case 'high':
        return 'danger';
      default:
        return 'secondary';
    }
  };

  const getComplianceColor = (status: ComplianceStatus) => {
    switch (status) {
      case 'compliant':
        return 'success';
      case 'non_compliant':
        return 'danger';
      case 'pending':
        return 'warning';
      default:
        return 'secondary';
    }
  };

  const getPerformanceColor = (score: number) => {
    if (score >= 8) return 'success';
    if (score >= 6) return 'warning';
    return 'danger';
  };

  const selectedSupplierData = selectedSupplier
    ? mockSuppliers.find((s) => s.id === selectedSupplier)
    : null;

  return (
    <div className="space-y-6">
      {/* Supplier Filters */}
      <BaseCard
        title="Supplier Filters"
        subtitle="Filter suppliers by compliance status and agreement status"
        headerClassName="from-[#7f7fd5] via-[#86a8e7] to-[#91eae4] opacity-80 text-white"
      >
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Compliance Status</label>
              <ModernSelect
                value={selectedCompliance}
                onValueChange={(value) => setSelectedCompliance(value as ComplianceStatus)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                options={[
                  { value: 'all', label: 'All Statuses' },
                  { value: 'compliant', label: 'Compliant' },
                  { value: 'non_compliant', label: 'Non-Compliant' },
                  { value: 'pending', label: 'Pending' },
                ]}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Agreement Status</label>
              <ModernSelect
                value={selectedAgreementStatus}
                onValueChange={(value) => setSelectedAgreementStatus(value as AgreementStatus)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                options={[
                  { value: 'all', label: 'All Statuses' },
                  { value: 'active', label: 'Active' },
                  { value: 'expired', label: 'Expired' },
                  { value: 'pending', label: 'Pending' },
                ]}
              />
            </div>
          </div>
        </CardContent>
      </BaseCard>

      {/* Suppliers Table */}
      <BaseCard
        title="Supplier Intelligence"
        subtitle={`${filteredSuppliers.length} suppliers found`}
        headerClassName="from-[#7f7fd5] via-[#86a8e7] to-[#91eae4] opacity-80 text-white"
        actions={
          <div className="flex gap-2">
            <Button intent="secondary" text="Export to Excel" icon={Download} size="sm" />
            <Button intent="primary" text="Invite to Tender" icon={Mail} size="sm" />
          </div>
        }
      >
        <CardContent>
          {loading.contracts ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-gray-500">Loading suppliers...</div>
            </div>
          ) : errors.contracts ? (
            <div className="flex items-center justify-center py-8 text-red-500">
              Error loading suppliers: {errors.contracts}
            </div>
          ) : filteredSuppliers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-gray-500">
              <Users className="h-12 w-12 mb-4" />
              <h3 className="text-lg font-medium mb-2">No Suppliers Found</h3>
              <p className="text-sm">No suppliers match the selected filters.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Table Header */}
              <div className="grid grid-cols-12 gap-4 p-3 bg-gray-50 rounded-lg font-medium text-sm text-gray-700">
                <div className="col-span-3">Supplier</div>
                <div className="col-span-1">Response Rate</div>
                <div className="col-span-1">Win Rate</div>
                <div className="col-span-1">Issue Rate</div>
                <div className="col-span-1">Score</div>
                <div className="col-span-1">Compliance</div>
                <div className="col-span-1">Agreements</div>
                <div className="col-span-1">Risk</div>
                <div className="col-span-2">Actions</div>
              </div>

              {/* Table Rows */}
              {filteredSuppliers.map((supplier) => (
                <div
                  key={supplier.id}
                  className="grid grid-cols-12 gap-4 p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  <div className="col-span-3 flex items-center">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{supplier.name}</span>
                      {supplier.performanceScore >= 8 && (
                        <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                      )}
                    </div>
                  </div>
                  <div className="col-span-1 flex items-center">
                    <span className="text-sm">{supplier.responseRate}%</span>
                  </div>
                  <div className="col-span-1 flex items-center">
                    <span className="text-sm">{supplier.winRate}%</span>
                  </div>
                  <div className="col-span-1 flex items-center">
                    <span className="text-sm">{supplier.invoiceIssueRate}%</span>
                  </div>
                  <div className="col-span-1 flex items-center">
                    <StatusBadge
                      status={getPerformanceColor(supplier.performanceScore)}
                      text={supplier.performanceScore.toFixed(1)}
                    />
                  </div>
                  <div className="col-span-1 flex items-center">
                    <StatusBadge
                      status={getComplianceColor(supplier.complianceStatus)}
                      text={supplier.complianceStatus.replace('_', ' ').toUpperCase()}
                    />
                  </div>
                  <div className="col-span-1 flex items-center">
                    <span className="text-sm">{supplier.activeAgreements}</span>
                  </div>
                  <div className="col-span-1 flex items-center">
                    <StatusBadge
                      status={getRiskColor(supplier.riskLevel)}
                      text={supplier.riskLevel.toUpperCase()}
                    />
                  </div>
                  <div className="col-span-2 flex items-center gap-0">
                    <Button
                      intent="ghost"
                      icon={Eye}
                      onClick={() => setSelectedSupplier(supplier.id)}
                    />
                    <Button intent="ghost" icon={Mail} />
                    <Button intent="ghost" icon={Award} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </BaseCard>

      {/* Supplier Profile Detail */}
      {selectedSupplierData && (
        <BaseCard
          title={`${selectedSupplierData.name} Profile`}
          subtitle="Detailed supplier intelligence and performance metrics"
          headerClassName="from-[#7f7fd5] via-[#86a8e7] to-[#91eae4] opacity-80 text-white"
          actions={
            <div className="flex gap-2">
              <Button intent="primary" text="Invite to Tender" icon={Mail} />
              <Button intent="secondary" text="View Scorecard" icon={Eye} />
            </div>
          }
        >
          <CardContent className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center space-y-2 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="text-sm text-blue-600 font-medium">Performance Score</div>
                <div className="text-2xl font-bold text-blue-800">
                  {selectedSupplierData.performanceScore}
                </div>
                <div className="text-xs text-blue-600">Out of 10</div>
              </div>

              <div className="text-center space-y-2 p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="text-sm text-green-600 font-medium">Response Rate</div>
                <div className="text-2xl font-bold text-green-800">
                  {selectedSupplierData.responseRate}%
                </div>
                <div className="text-xs text-green-600">Last 12 months</div>
              </div>

              <div className="text-center space-y-2 p-4 bg-purple-50 rounded-lg border border-purple-200">
                <div className="text-sm text-purple-600 font-medium">Win Rate</div>
                <div className="text-2xl font-bold text-purple-800">
                  {selectedSupplierData.winRate}%
                </div>
                <div className="text-xs text-purple-600">Competitive tenders</div>
              </div>

              <div className="text-center space-y-2 p-4 bg-orange-50 rounded-lg border border-orange-200">
                <div className="text-sm text-orange-600 font-medium">Issue Rate</div>
                <div className="text-2xl font-bold text-orange-800">
                  {selectedSupplierData.invoiceIssueRate}%
                </div>
                <div className="text-xs text-orange-600">Invoice exceptions</div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-700">Contact Information</h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">{selectedSupplierData.contactName}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">{selectedSupplierData.contactEmail}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">{selectedSupplierData.contactPhone}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-semibold text-gray-700">Compliance & Risk</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Insurance Expiry</span>
                    <span className="text-sm font-medium">
                      {selectedSupplierData.insuranceExpiry}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Risk Level</span>
                    <StatusBadge
                      status={getRiskColor(selectedSupplierData.riskLevel)}
                      text={selectedSupplierData.riskLevel.toUpperCase()}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Certifications</span>
                    <span className="text-sm font-medium">
                      {selectedSupplierData.certifications.length}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Performance Metrics */}
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-700">Performance Metrics</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600">Total Volume</span>
                  </div>
                  <div className="text-lg font-bold">
                    {(selectedSupplierData.totalVolume / 1000).toFixed(0)}K L
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600">Average Price</span>
                  </div>
                  <div className="text-lg font-bold">
                    ${selectedSupplierData.avgPrice.toFixed(3)}/L
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600">Last Bid</span>
                  </div>
                  <div className="text-lg font-bold">{selectedSupplierData.lastBidDate}</div>
                </div>
              </div>
            </div>

            {/* Certifications */}
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-700">Certifications</h4>
              <div className="flex flex-wrap gap-2">
                {selectedSupplierData.certifications.map((cert, index) => (
                  <StatusBadge key={index} status="secondary" text={cert} />
                ))}
              </div>
            </div>

            {/* AI Insights */}
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-700">AI Insights</h4>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-blue-600" />
                    <span className="font-medium text-blue-800">Risk Assessment</span>
                  </div>
                  <p className="text-sm text-blue-700">
                    {selectedSupplierData.riskLevel === 'low'
                      ? 'Low risk supplier with consistent performance and good compliance record.'
                      : selectedSupplierData.riskLevel === 'medium'
                        ? 'Medium risk supplier with some areas for improvement in invoice accuracy.'
                        : 'High risk supplier requiring close monitoring and regular reviews.'}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </BaseCard>
      )}
    </div>
  );
}
