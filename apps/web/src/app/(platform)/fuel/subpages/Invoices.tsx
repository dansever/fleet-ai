'use client';

import { CardContent } from '@/components/ui/card';
import { formatDate } from '@/lib/core/formatters';
import { Button } from '@/stories/Button/Button';
import { BaseCard } from '@/stories/Card/Card';
import { ModernSelect } from '@/stories/Form/Form';
import { StatusBadge } from '@/stories/StatusBadge/StatusBadge';
import { AlertTriangle, CheckCircle, Download, Eye } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useFuelProcurement } from '../contexts';

type StatusType = 'received' | 'approved' | 'paid' | 'disputed' | 'all';

export default function InvoicesPage() {
  const {
    selectedAirport,
    contracts,
    invoices,
    loading,
    errors,
    selectContract,
    selectedContract,
  } = useFuelProcurement();
  const [selectedStatus, setSelectedStatus] = useState<StatusType>('all');
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(null);

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

  const filteredInvoices = useMemo(() => {
    return invoices.filter((inv) =>
      selectedStatus === 'all' ? true : inv.invoiceStatus === selectedStatus,
    );
  }, [invoices, selectedStatus]);

  const handleInvoiceSelect = (invoiceId: string) => {
    setSelectedInvoiceId((prev) => (prev === invoiceId ? null : invoiceId));
  };

  // Simplified filters for MVP: only status

  const [explaining, setExplaining] = useState(false);
  const [aiResult, setAiResult] = useState<{
    explanation: string;
    recommendations: string[];
  } | null>(null);

  const handleExplain = async () => {
    if (!selectedInvoiceId) return;
    try {
      setExplaining(true);
      setAiResult(null);
      const res = await fetch('/api/invoices/explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invoiceId: selectedInvoiceId }),
      });
      if (!res.ok) throw new Error('Failed to explain discrepancy');
      const data = await res.json();
      setAiResult(data);
    } catch (e) {
      // noop: toast could be added
    } finally {
      setExplaining(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Invoices Table */}
      <BaseCard
        title="Invoices"
        subtitle={
          selectedContract
            ? `${filteredInvoices.length} invoices under selected agreement`
            : 'Select an agreement to view invoices'
        }
        headerClassName="from-[#7f7fd5] via-[#86a8e7] to-[#91eae4] opacity-80 text-white"
        actions={
          <div className="flex gap-2">
            <Button intent="secondary" text="Export" icon={Download} size="sm" />
          </div>
        }
      >
        <div className="flex flex-col gap-4">
          <div className="p-2 bg-gray-50 rounded-lg grid grid-cols-5 gap-3 items-end">
            <ModernSelect
              label="Agreement"
              placeholder="Select agreement"
              value={selectedContract?.id}
              onValueChange={(id: string) => {
                const contract = contracts.find((c) => c.id === id) || null;
                selectContract(contract);
              }}
              options={contracts.map((c) => ({
                value: c.id,
                label: (
                  <div className="flex flex-col text-left whitespace-normal">
                    <span className="font-semibold">{c.title}</span>
                    <span className="text-xs text-muted-foreground">{c.vendorName}</span>
                  </div>
                ),
              }))}
              className="col-span-3 w-full"
              TriggerClassName="min-h-12"
              disabled={contracts.length === 0}
            />

            <ModernSelect
              label="Status"
              value={selectedStatus}
              onValueChange={(v) => setSelectedStatus(v as StatusType)}
              options={[
                { value: 'all', label: 'All' },
                { value: 'received', label: 'Received' },
                { value: 'approved', label: 'Approved' },
                { value: 'paid', label: 'Paid' },
                { value: 'disputed', label: 'Disputed' },
              ]}
              className="col-span-2 w-full"
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
          ) : !selectedContract ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-500">
              <Eye className="h-10 w-10 mb-3" />
              <h3 className="text-lg font-medium mb-2">Select an agreement</h3>
              <p className="text-sm">Pick an agreement to load its invoices.</p>
            </div>
          ) : filteredInvoices.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-gray-500">
              <CheckCircle className="h-12 w-12 mb-4" />
              <h3 className="text-lg font-medium mb-2">No invoices found</h3>
              <p className="text-sm">Try a different status or agreement.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Table Header */}
              <div className="grid grid-cols-10 gap-2 p-3 bg-gray-50 rounded-lg font-medium text-sm text-gray-700">
                <div className="col-span-2">Supplier</div>
                <div className="col-span-2">Invoice #</div>
                <div className="col-span-2">Date</div>
                <div className="col-span-2">Status</div>
                <div className="col-span-2">Actions</div>
              </div>

              {/* Table Rows */}
              {filteredInvoices.map((inv) => (
                <div
                  key={inv.id}
                  className={`grid grid-cols-10 gap-2 p-3 border rounded-lg cursor-pointer transition-all ${
                    selectedInvoiceId === inv.id
                      ? 'border-blue-500 bg-blue-50 shadow-md'
                      : 'border-gray-200 hover:bg-gray-50 hover:border-gray-300'
                  }`}
                  onClick={() => handleInvoiceSelect(inv.id)}
                >
                  <div className="col-span-2 flex items-center">
                    <span className="font-medium">{inv.vendorName || 'Unknown Vendor'}</span>
                  </div>
                  <div className="col-span-2 flex items-center">
                    <span className="text-sm text-gray-600">{inv.invoiceNumber}</span>
                  </div>
                  <div className="col-span-2 flex items-center">
                    <span className="text-sm text-gray-600">{formatDate(inv.invoiceDate)}</span>
                  </div>
                  <div className="col-span-2 flex items-center">
                    <StatusBadge
                      status="secondary"
                      text={inv.invoiceStatus?.toUpperCase?.() || '—'}
                    />
                  </div>
                  <div className="col-span-2 flex items-center gap-2">
                    <Button intent="ghost" icon={Eye} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </BaseCard>

      {/* Invoice Details with AI Actions (placeholder for server-backed call) */}
      {selectedInvoiceId &&
        (() => {
          const inv = filteredInvoices.find((i) => i.id === selectedInvoiceId);
          if (!inv) return null;

          return (
            <BaseCard
              title="Invoice Details"
              subtitle={`${inv.vendorName || ''} • ${inv.invoiceNumber}`}
              headerClassName="from-[#7f7fd5] via-[#86a8e7] to-[#91eae4] opacity-80 text-white"
              actions={
                <div className="flex gap-2">
                  <Button
                    intent="warning"
                    text={explaining ? 'Explaining…' : 'Explain discrepancy'}
                    icon={AlertTriangle}
                    isLoading={explaining}
                    onClick={handleExplain}
                  />
                  <Button intent="success" text="Mark resolved" icon={CheckCircle} />
                  <Button intent="secondary" text="Export" icon={Download} />
                </div>
              }
            >
              <CardContent>
                <div className="grid grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <div className="text-sm text-gray-600">Invoice date</div>
                    <div className="text-sm font-medium">{formatDate(inv.invoiceDate)}</div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-sm text-gray-600">Status</div>
                    <div className="text-sm font-medium">{inv.invoiceStatus}</div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-sm text-gray-600">Vendor</div>
                    <div className="text-sm font-medium">{inv.vendorName}</div>
                  </div>
                </div>

                {aiResult && (
                  <div className="mt-6 space-y-3">
                    <div className="text-sm text-gray-600">AI explanation</div>
                    <div className="text-sm bg-purple-50 border border-purple-200 rounded-lg p-3 text-purple-900">
                      {aiResult.explanation}
                    </div>
                    {aiResult.recommendations?.length > 0 && (
                      <div className="space-y-2">
                        <div className="text-sm text-gray-600">Recommended actions</div>
                        <ul className="list-disc list-inside text-sm text-gray-800">
                          {aiResult.recommendations.map((rec, idx) => (
                            <li key={idx}>{rec}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </BaseCard>
          );
        })()}
    </div>
  );
}
