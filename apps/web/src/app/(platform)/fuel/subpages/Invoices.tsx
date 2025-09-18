'use client';

import { CardContent } from '@/components/ui/card';
import { Button } from '@/stories/Button/Button';
import { BaseCard } from '@/stories/Card/Card';
import { ModernSelect } from '@/stories/Form/Form';
import { StatusBadge } from '@/stories/StatusBadge/StatusBadge';
import { AlertTriangle, CheckCircle, Download, Eye, FileText, Mail, RefreshCw } from 'lucide-react';
import { useState } from 'react';
import { useFuelProcurement } from '../contexts';

type ExceptionType =
  | 'price_mismatch'
  | 'fee_mismatch'
  | 'quantity_variance'
  | 'index_drift'
  | 'all';
type SeverityType = 'low' | 'medium' | 'high' | 'all';
type StatusType = 'pending' | 'disputed' | 'resolved' | 'all';

export default function InvoicesPage() {
  const { selectedAirport, invoices, loading, errors } = useFuelProcurement();
  const [selectedExceptionType, setSelectedExceptionType] = useState<ExceptionType>('all');
  const [selectedSeverity, setSelectedSeverity] = useState<SeverityType>('all');
  const [selectedStatus, setSelectedStatus] = useState<StatusType>('all');
  const [selectedInvoice, setSelectedInvoice] = useState<string | null>(null);

  if (!selectedAirport) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-500">
        <div className="text-center">
          <h3 className="text-lg font-medium mb-2">No Airport Selected</h3>
          <p className="text-sm">Please select an airport to view invoice exceptions.</p>
        </div>
      </div>
    );
  }

  // Mock invoice data for demonstration
  const mockInvoices = [
    {
      id: 'INV-2024-001',
      supplier: 'Shell Aviation',
      invoiceNumber: 'SHL-2024-001234',
      date: '2024-01-15',
      exceptionType: 'price_mismatch' as const,
      severity: 'high' as const,
      status: 'disputed' as const,
      amountAtRisk: 1250.0,
      owner: 'John Smith',
      agreement: 'AGR-2024-SHL-001',
      flightReference: 'FL1234',
    },
    {
      id: 'INV-2024-002',
      supplier: 'BP Aviation',
      invoiceNumber: 'BP-2024-005678',
      date: '2024-01-16',
      exceptionType: 'fee_mismatch' as const,
      severity: 'medium' as const,
      status: 'pending' as const,
      amountAtRisk: 450.0,
      owner: 'Sarah Johnson',
      agreement: 'AGR-2024-BP-002',
      flightReference: 'FL1235',
    },
    {
      id: 'INV-2024-003',
      supplier: 'Exxon Aviation',
      invoiceNumber: 'EXX-2024-009012',
      date: '2024-01-17',
      exceptionType: 'quantity_variance' as const,
      severity: 'low' as const,
      status: 'pending' as const,
      amountAtRisk: 180.0,
      owner: 'Mike Davis',
      agreement: 'AGR-2024-EXX-003',
      flightReference: 'FL1236',
    },
  ];

  // Filter invoices based on selected filters
  const filteredInvoices = mockInvoices.filter((invoice) => {
    const exceptionMatch =
      selectedExceptionType === 'all' || invoice.exceptionType === selectedExceptionType;
    const severityMatch = selectedSeverity === 'all' || invoice.severity === selectedSeverity;
    const statusMatch = selectedStatus === 'all' || invoice.status === selectedStatus;
    return exceptionMatch && severityMatch && statusMatch;
  });

  const handleInvoiceSelect = (invoiceId: string) => {
    setSelectedInvoice(selectedInvoice === invoiceId ? null : invoiceId);
  };

  const getSeverityColor = (severity: SeverityType) => {
    switch (severity) {
      case 'high':
        return 'danger';
      case 'medium':
        return 'warning';
      case 'low':
        return 'secondary';
      default:
        return 'secondary';
    }
  };

  const getStatusColor = (status: StatusType) => {
    switch (status) {
      case 'disputed':
        return 'danger';
      case 'pending':
        return 'warning';
      case 'resolved':
        return 'success';
      default:
        return 'secondary';
    }
  };

  const resetFilters = () => {
    setSelectedExceptionType('all');
    setSelectedSeverity('all');
    setSelectedStatus('all');
    setSelectedInvoice(null);
  };

  const hasActiveFilters =
    selectedExceptionType !== 'all' || selectedSeverity !== 'all' || selectedStatus !== 'all';

  const getExceptionTypeLabel = (type: ExceptionType) => {
    switch (type) {
      case 'price_mismatch':
        return 'Price Mismatch';
      case 'fee_mismatch':
        return 'Fee Mismatch';
      case 'quantity_variance':
        return 'Quantity Variance';
      case 'index_drift':
        return 'Index Drift';
      default:
        return 'All Types';
    }
  };

  return (
    <div className="space-y-6">
      {/* Invoices Table */}
      <BaseCard
        title="Invoice Exceptions"
        subtitle={`${filteredInvoices.length} invoices with exceptions found`}
        headerClassName="from-[#7f7fd5] via-[#86a8e7] to-[#91eae4] opacity-80 text-white"
        actions={
          <div className="flex gap-2">
            <Button intent="secondary" text="Export to Excel" icon={Download} size="sm" />
            {selectedInvoice && (
              <Button intent="warning" text="Create Dispute" icon={AlertTriangle} size="sm" />
            )}
          </div>
        }
      >
        <div className="flex flex-col gap-4">
          {/* Invoice Filters */}
          <div className="px-4 py-2 bg-gray-50 rounded-lg flex flex-row gap-4 items-end justify-between">
            <div className="flex flex-row gap-4">
              <ModernSelect
                label="Exception Type"
                value={selectedExceptionType}
                onValueChange={(value) => setSelectedExceptionType(value as ExceptionType)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                options={[
                  { value: 'all', label: 'All Types' },
                  { value: 'price_mismatch', label: 'Price Mismatch' },
                  { value: 'fee_mismatch', label: 'Fee Mismatch' },
                  { value: 'quantity_variance', label: 'Quantity Variance' },
                  { value: 'index_drift', label: 'Index Drift' },
                ]}
              />

              <ModernSelect
                label="Severity"
                value={selectedSeverity}
                onValueChange={(value) => setSelectedSeverity(value as SeverityType)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                options={[
                  { value: 'all', label: 'All Severities' },
                  { value: 'high', label: 'High' },
                  { value: 'medium', label: 'Medium' },
                  { value: 'low', label: 'Low' },
                ]}
              />

              <ModernSelect
                label="Status"
                value={selectedStatus}
                onValueChange={(value) => setSelectedStatus(value as StatusType)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                options={[
                  { value: 'all', label: 'All Statuses' },
                  { value: 'pending', label: 'Pending' },
                  { value: 'disputed', label: 'Disputed' },
                  { value: 'resolved', label: 'Resolved' },
                ]}
              />
            </div>
            <Button
              intent="ghost"
              text="Reset Filters"
              icon={RefreshCw}
              disabled={!hasActiveFilters}
              onClick={resetFilters}
            />
          </div>

          {loading.invoices ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-gray-500">Loading invoices...</div>
            </div>
          ) : errors.invoices ? (
            <div className="flex items-center justify-center py-8 text-red-500">
              Error loading invoices: {errors.invoices}
            </div>
          ) : filteredInvoices.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-gray-500">
              <CheckCircle className="h-12 w-12 mb-4" />
              <h3 className="text-lg font-medium mb-2">No Exceptions Found</h3>
              <p className="text-sm">All invoices are validated and match agreement terms.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Table Header */}
              <div className="grid grid-cols-11 gap-4 p-3 bg-gray-50 rounded-lg font-medium text-sm text-gray-700">
                <div className="col-span-2">Supplier</div>
                <div className="col-span-2">Invoice #</div>
                <div className="col-span-1">Date</div>
                <div className="col-span-2">Exception</div>
                <div className="col-span-1">Severity</div>
                <div className="col-span-1">Amount</div>
                <div className="col-span-1">Owner</div>
                <div className="col-span-1">Actions</div>
              </div>

              {/* Table Rows */}
              {filteredInvoices.map((invoice) => (
                <div
                  key={invoice.id}
                  className={`grid grid-cols-11 gap-4 p-3 border rounded-lg cursor-pointer transition-all ${
                    selectedInvoice === invoice.id
                      ? 'border-blue-500 bg-blue-50 shadow-md'
                      : 'border-gray-200 hover:bg-gray-50 hover:border-gray-300'
                  }`}
                  onClick={() => handleInvoiceSelect(invoice.id)}
                >
                  <div className="col-span-2 flex items-center">
                    <span className="font-medium">{invoice.supplier}</span>
                  </div>
                  <div className="col-span-2 flex items-center">
                    <span className="text-sm text-gray-600">{invoice.invoiceNumber}</span>
                  </div>
                  <div className="col-span-1 flex items-center">
                    <span className="text-sm text-gray-600">{invoice.date}</span>
                  </div>
                  <div className="col-span-2 flex items-center">
                    <span className="text-sm">{getExceptionTypeLabel(invoice.exceptionType)}</span>
                  </div>
                  <div className="col-span-1 flex items-center">
                    <StatusBadge
                      status={getSeverityColor(invoice.severity)}
                      text={invoice.severity.toUpperCase()}
                    />
                  </div>
                  <div className="col-span-1 flex items-center">
                    <span className="font-medium text-red-600">
                      ${invoice.amountAtRisk.toFixed(2)}
                    </span>
                  </div>
                  <div className="col-span-1 flex items-center">
                    <span className="text-sm text-gray-600">{invoice.owner}</span>
                  </div>
                  <div className="col-span-1 flex items-center gap-1">
                    <Button
                      intent="ghost"
                      icon={Eye}
                      onClick={(e) => {
                        e.stopPropagation();
                        // Handle view details
                      }}
                    />
                    <Button
                      intent="ghost"
                      icon={Mail}
                      onClick={(e) => {
                        e.stopPropagation();
                        // Handle email
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </BaseCard>

      {/* Invoice Problem Details */}
      {selectedInvoice &&
        (() => {
          const invoice = filteredInvoices.find((inv) => inv.id === selectedInvoice);
          if (!invoice) return null;

          return (
            <BaseCard
              title="Invoice Problem Details"
              subtitle={`Dispute analysis for ${invoice.invoiceNumber}`}
              headerClassName="from-[#7f7fd5] via-[#86a8e7] to-[#91eae4] opacity-80 text-white"
            >
              <CardContent>
                <div className="space-y-6">
                  {/* Problem Summary */}
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className="h-5 w-5 text-red-600" />
                      <span className="font-medium text-red-800">
                        {getExceptionTypeLabel(invoice.exceptionType)} Detected
                      </span>
                    </div>
                    <div className="text-sm text-red-700">
                      Amount at risk:{' '}
                      <span className="font-semibold">${invoice.amountAtRisk.toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Three-Column Comparison */}
                  <div className="grid grid-cols-3 gap-6">
                    {/* What Was Billed */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-gray-600" />
                        <h4 className="font-semibold text-gray-700">What Was Billed</h4>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                        <div className="text-sm">
                          <div className="font-medium text-gray-800">Fuel Quantity:</div>
                          <div className="text-gray-600">15,000 gallons</div>
                        </div>
                        <div className="text-sm">
                          <div className="font-medium text-gray-800">Unit Price:</div>
                          <div className="text-gray-600">$3.25/gal</div>
                        </div>
                        <div className="text-sm">
                          <div className="font-medium text-gray-800">Service Fee:</div>
                          <div className="text-gray-600">$125.00</div>
                        </div>
                        <div className="text-sm border-t pt-2">
                          <div className="font-medium text-gray-800">Total Billed:</div>
                          <div className="text-gray-600 font-semibold">$48,875.00</div>
                        </div>
                      </div>
                    </div>

                    {/* Contract Terms */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <h4 className="font-semibold text-gray-700">Contract Terms</h4>
                      </div>
                      <div className="bg-green-50 p-4 rounded-lg space-y-3">
                        <div className="text-sm">
                          <div className="font-medium text-gray-800">Expected Quantity:</div>
                          <div className="text-gray-600">15,000 gallons</div>
                        </div>
                        <div className="text-sm">
                          <div className="font-medium text-gray-800">Agreed Price:</div>
                          <div className="text-gray-600">$3.15/gal</div>
                        </div>
                        <div className="text-sm">
                          <div className="font-medium text-gray-800">Service Fee:</div>
                          <div className="text-gray-600">$100.00</div>
                        </div>
                        <div className="text-sm border-t pt-2">
                          <div className="font-medium text-gray-800">Expected Total:</div>
                          <div className="text-gray-600 font-semibold">$47,350.00</div>
                        </div>
                      </div>
                    </div>

                    {/* Difference Analysis */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-orange-600" />
                        <h4 className="font-semibold text-gray-700">Difference</h4>
                      </div>
                      <div className="bg-orange-50 p-4 rounded-lg space-y-3">
                        <div className="text-sm">
                          <div className="font-medium text-gray-800">Price Variance:</div>
                          <div className="text-red-600 font-semibold">+$0.10/gal</div>
                        </div>
                        <div className="text-sm">
                          <div className="font-medium text-gray-800">Fee Variance:</div>
                          <div className="text-red-600 font-semibold">+$25.00</div>
                        </div>
                        <div className="text-sm">
                          <div className="font-medium text-gray-800">Quantity Variance:</div>
                          <div className="text-green-600 font-semibold">$0.00</div>
                        </div>
                        <div className="text-sm border-t pt-2">
                          <div className="font-medium text-gray-800">Total Variance:</div>
                          <div className="text-red-600 font-semibold text-lg">+$1,525.00</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-4 border-t">
                    <Button intent="warning" text="Create Dispute" icon={AlertTriangle} />
                    <Button intent="success" text="Mark Resolved" icon={CheckCircle} />
                    <Button intent="secondary" text="Export Details" icon={Download} />
                  </div>
                </div>
              </CardContent>
            </BaseCard>
          );
        })()}
    </div>
  );
}
