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
  const [selectedInvoices, setSelectedInvoices] = useState<string[]>([]);

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
    setSelectedInvoices((prev) =>
      prev.includes(invoiceId) ? prev.filter((id) => id !== invoiceId) : [...prev, invoiceId],
    );
  };

  const handleSelectAll = () => {
    if (selectedInvoices.length === filteredInvoices.length) {
      setSelectedInvoices([]);
    } else {
      setSelectedInvoices(filteredInvoices.map((inv) => inv.id));
    }
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
    setSelectedInvoices([]);
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
            {selectedInvoices.length > 0 && (
              <Button
                intent="warning"
                text={`Generate Dispute Pack (${selectedInvoices.length})`}
                icon={AlertTriangle}
                size="sm"
              />
            )}
          </div>
        }
      >
        <div className="flex flex-col gap-4">
          {/* Invoice Filters */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex flex-row items-end gap-4 justify-between mb-3">
              <h4 className="text-sm font-medium text-gray-700">Filter Invoice Exceptions</h4>
              <Button
                intent="ghost"
                text="Reset Filters"
                icon={RefreshCw}
                disabled={!hasActiveFilters}
                onClick={resetFilters}
                size="sm"
              />
            </div>
            <div className="flex flex-row gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Exception Type</label>
                <ModernSelect
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
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Severity</label>
                <ModernSelect
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
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Status</label>
                <ModernSelect
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
            </div>
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
              <div className="grid grid-cols-12 gap-4 p-3 bg-gray-50 rounded-lg font-medium text-sm text-gray-700">
                <div className="col-span-1">
                  <input
                    type="checkbox"
                    checked={
                      selectedInvoices.length === filteredInvoices.length &&
                      filteredInvoices.length > 0
                    }
                    onChange={handleSelectAll}
                    className="rounded border-gray-300"
                  />
                </div>
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
                  className="grid grid-cols-12 gap-4 p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  <div className="col-span-1 flex items-center">
                    <input
                      type="checkbox"
                      checked={selectedInvoices.includes(invoice.id)}
                      onChange={() => handleInvoiceSelect(invoice.id)}
                      className="rounded border-gray-300"
                    />
                  </div>
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
                    <Button intent="ghost" icon={Eye} size="sm" />
                    <Button intent="ghost" icon={Mail} size="sm" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </BaseCard>

      {/* Invoice Detail Modal Placeholder */}
      {selectedInvoices.length > 0 && (
        <BaseCard
          title="Invoice Detail"
          subtitle="Validation view with three-column comparison"
          headerClassName="from-[#7f7fd5] via-[#86a8e7] to-[#91eae4] opacity-80 text-white"
        >
          <CardContent>
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="h-5 w-5 text-blue-600" />
                  <span className="font-medium text-blue-800">
                    {selectedInvoices.length} invoice(s) selected for detailed review
                  </span>
                </div>
                <div className="text-sm text-blue-700">
                  Click "View Details" to see the three-column validation view comparing invoice
                  line items, agreement terms, and uplift logs.
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <h4 className="font-semibold text-gray-700">Invoice Line Items</h4>
                  <div className="bg-gray-50 p-3 rounded-lg text-sm text-gray-600">
                    Detailed breakdown of invoice charges and calculations.
                  </div>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold text-gray-700">Agreement Terms</h4>
                  <div className="bg-gray-50 p-3 rounded-lg text-sm text-gray-600">
                    Contract pricing formula and expected terms.
                  </div>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold text-gray-700">Uplift Logs</h4>
                  <div className="bg-gray-50 p-3 rounded-lg text-sm text-gray-600">
                    Actual fuel delivery records and calculations.
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button intent="primary" text="View Details" icon={Eye} />
                <Button intent="warning" text="Generate Dispute Pack" icon={AlertTriangle} />
                <Button intent="success" text="Mark Resolved" icon={CheckCircle} />
              </div>
            </div>
          </CardContent>
        </BaseCard>
      )}
    </div>
  );
}
