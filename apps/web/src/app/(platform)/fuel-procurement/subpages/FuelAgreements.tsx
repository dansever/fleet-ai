'use client';

import { CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Invoice } from '@/drizzle/types';
import { Button } from '@/stories/Button/Button';
import { BaseCard, MainCard } from '@/stories/Card/Card';
import { StatusBadge } from '@/stories/StatusBadge/StatusBadge';
import { AlertTriangle, Diff, Edit, Plus, Sigma, Upload, X } from 'lucide-react';
import { useState } from 'react';
import { useFuelProcurement } from '../ContextProvider';
import FuelInvoicesDataTable from '../_components/FuelInvoicesDataTable';

export default function FuelAgreementsPage() {
  const { selectedAirport } = useFuelProcurement();
  const [selectedInvoices, setSelectedInvoices] = useState<number[]>([]);

  const agreementData = {
    id: 'AGR-2024-SHL-001',
    supplier: 'Shell Aviation',
    status: 'active',
    basePrice: 0.645,
    indexAdjustment: '+0.023',
    fuelSurcharge: '+0.008',
    carbonTax: '+0.012',
    handlingFee: '+0.005',
    totalExpectedPrice: 0.693,
  };

  const reconciliationKPIs = {
    totalInvoices: 24,
    matchedInvoices: 18,
    discrepancies: 6,
    totalLeakage: 12450,
    avgVariance: 0.008,
  };

  const invoiceData = [
    {
      id: 1,
      invoiceNumber: 'SHL-2024-001',
      date: '2024-01-15',
      volume: 45000,
      invoicePrice: 0.695,
      expectedPrice: 0.693,
      variance: 0.002,
      amount: 31275,
      leakage: 90,
      status: 'discrepancy',
      disputeStatus: 'pending',
    },
    {
      id: 2,
      invoiceNumber: 'SHL-2024-002',
      date: '2024-01-16',
      volume: 32000,
      invoicePrice: 0.688,
      expectedPrice: 0.693,
      variance: -0.005,
      amount: 22016,
      leakage: -160,
      status: 'matched',
      disputeStatus: null,
    },
    {
      id: 3,
      invoiceNumber: 'SHL-2024-003',
      date: '2024-01-17',
      volume: 38000,
      invoicePrice: 0.705,
      expectedPrice: 0.693,
      variance: 0.012,
      amount: 26790,
      leakage: 456,
      status: 'discrepancy',
      disputeStatus: 'generated',
    },
    {
      id: 4,
      invoiceNumber: 'SHL-2024-004',
      date: '2024-01-18',
      volume: 28000,
      invoicePrice: 0.693,
      expectedPrice: 0.693,
      variance: 0,
      amount: 19404,
      leakage: 0,
      status: 'matched',
      disputeStatus: null,
    },
  ];

  const invoiceColumns = [
    {
      key: 'invoiceNumber',
      label: 'Invoice #',
      render: (value: string) => <div className="font-mono text-sm">{value}</div>,
    },
    {
      key: 'date',
      label: 'Date',
      render: (value: string) => <div className="text-sm">{value}</div>,
    },
    {
      key: 'volume',
      label: 'Volume (L)',
      render: (value: number) => value.toLocaleString(),
    },
    {
      key: 'invoicePrice',
      label: 'Billed Price',
      render: (value: number) => `$${value.toFixed(3)}/L`,
    },
    {
      key: 'expectedPrice',
      label: 'Expected Price',
      render: (value: number) => `$${value.toFixed(3)}/L`,
    },
    {
      key: 'variance',
      label: 'Variance',
      render: (value: number) => (
        <span
          className={
            value > 0
              ? 'text-red-600 font-medium'
              : value < 0
                ? 'text-green-600 font-medium'
                : 'text-gray-600'
          }
        >
          {value > 0 ? '+' : ''}${value.toFixed(3)}/L
        </span>
      ),
    },
    {
      key: 'leakage',
      label: 'Impact ($)',
      render: (value: number) => (
        <span
          className={
            value > 0
              ? 'text-red-600 font-medium'
              : value < 0
                ? 'text-green-600 font-medium'
                : 'text-gray-600'
          }
        >
          {value > 0 ? '+' : ''}${value.toLocaleString()}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (value: string) => (
        <StatusBadge
          status={value === 'matched' ? 'operational' : 'warning'}
          text={value === 'matched' ? 'Matched' : 'Variance'}
        />
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Active Agreement Summary */}
      <MainCard
        title="Active Agreement & Reconciliation"
        subtitle={`${agreementData.supplier} • ${agreementData.id}`}
        headerActions={
          <div className="flex gap-2">
            <Button intent="secondaryInverted" text="Upload Invoices" icon={Upload} />
            <Button intent="secondaryInverted" text="Edit Agreement" icon={Edit} />
          </div>
        }
      >
        <div className="grid grid-cols-6 gap-4">
          <div className="text-center space-y-2">
            <div className="text-sm text-gray-500">Expected Price</div>
            <div className="text-xl font-bold text-blue-600">
              ${agreementData.totalExpectedPrice.toFixed(3)}/L
            </div>
          </div>
          <div className="text-center space-y-2">
            <div className="text-sm text-gray-500">Total Invoices</div>
            <div className="text-xl font-bold">{reconciliationKPIs.totalInvoices}</div>
          </div>
          <div className="text-center space-y-2">
            <div className="text-sm text-gray-500">Matched</div>
            <div className="text-xl font-bold text-green-600">
              {reconciliationKPIs.matchedInvoices}
            </div>
          </div>
          <div className="text-center space-y-2">
            <div className="text-sm text-gray-500">Variances</div>
            <div className="text-xl font-bold text-red-600">{reconciliationKPIs.discrepancies}</div>
          </div>
          <div className="text-center space-y-2">
            <div className="text-sm text-gray-500">Total Impact</div>
            <div className="text-xl font-bold text-red-600">
              ${reconciliationKPIs.totalLeakage.toLocaleString()}
            </div>
          </div>
          <div className="text-center space-y-2">
            <div className="text-sm text-gray-500">Avg Variance</div>
            <div className="text-xl font-bold text-orange-600">
              ${reconciliationKPIs.avgVariance.toFixed(3)}/L
            </div>
          </div>
        </div>
      </MainCard>

      {/* Pricing Formula */}
      <BaseCard>
        <CardHeader className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Sigma className="w-6 h-6 text-blue-500" />
              Current Pricing Formula
            </CardTitle>
            <p className="text-slate-600 mt-1">How we calculate expected prices</p>
          </div>
        </CardHeader>
        <CardContent className="grid grid-cols-6 gap-4">
          <div className="text-center space-y-2">
            <div className="text-gray-600">Base Price</div>
            <div className="font-bold">${agreementData.basePrice.toFixed(3)}</div>
          </div>
          <div className="text-center space-y-2">
            <div className="text-gray-600">Index Adj.</div>
            <div className="font-bold">{agreementData.indexAdjustment}</div>
          </div>
          <div className="text-center space-y-2">
            <div className="text-gray-600">Fuel Surcharge</div>
            <div className="font-bold">{agreementData.fuelSurcharge}</div>
          </div>
          <div className="text-center space-y-2">
            <div className="text-gray-600">Carbon Tax</div>
            <div className="font-bold">{agreementData.carbonTax}</div>
          </div>
          <div className="text-center space-y-2">
            <div className="text-gray-600">Handling</div>
            <div className="font-bold">{agreementData.handlingFee}</div>
          </div>
          <div className="text-center space-y-2 bg-accent/50 rounded-lg">
            <div className="text-gray-600">Total</div>
            <div className="font-bold text-lg">
              ${agreementData.totalExpectedPrice.toFixed(3)}/L
            </div>
          </div>
        </CardContent>
      </BaseCard>

      {/* Invoice Comparison */}
      <BaseCard>
        <CardHeader className="flex items-center justify-between">
          <div className="flex-1">
            <CardTitle className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Diff className="w-6 h-6 text-blue-500" />
              Invoice vs Expected Pricing
            </CardTitle>
            <p className="text-slate-600 mt-1">
              Compare and evaluate fuel bids for {selectedAirport?.name}
            </p>
          </div>
          <div className="flex gap-2 flex-shrink-0">
            <Button intent="warning" text="Generate Dispute" icon={AlertTriangle} />
            <Button intent="secondary" size="sm" text="Generate Random Invoice" icon={Plus} />
          </div>
        </CardHeader>
        <CardContent>
          <FuelInvoicesDataTable Invoices={invoiceData as unknown as Invoice[]} />
        </CardContent>
      </BaseCard>

      {/* Dispute Generation */}
      {selectedInvoices.length > 0 && (
        <MainCard
          title="Generate Dispute"
          subtitle="Review variance details before creating dispute"
        >
          <div className="space-y-4">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="h-5 w-5 text-yellow-600" />
                <span className="font-medium text-yellow-800">
                  {selectedInvoices.length} invoice(s) selected for dispute
                </span>
              </div>
              <div className="text-sm text-yellow-700">
                Potential recovery based on contract pricing formula and variance analysis.
              </div>
            </div>

            <div className="flex gap-2">
              <Button intent="warning" text="Create Dispute" icon={AlertTriangle} />
              <Button
                intent="secondary"
                onClick={() => setSelectedInvoices([])}
                text="Cancel"
                icon={X}
              />
            </div>
          </div>
        </MainCard>
      )}
    </div>
  );
}
