'use client';

import { CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/stories/Button/Button';
import { BaseCard, MainCard } from '@/stories/Card/Card';
import { AlertTriangle, Diff, Edit, Sigma, Upload, X } from 'lucide-react';
import FuelInvoicesDataTable from '../_components/FuelInvoicesDataTable';
import { useFuelProcurement } from '../contexts';

export default function AgreementsPage() {
  const { selectedAirport, contracts, invoices, loading, errors, selectContract } =
    useFuelProcurement();
  const selectedContract = contracts[0];

  // Show message when no airport is selected
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

  // Show loading state for contracts
  if (loading.contracts) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading fuel agreements...</div>
      </div>
    );
  }

  // Show error state for contracts
  if (errors.contracts) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-red-500">
        <div className="text-center">
          <h3 className="text-lg font-medium mb-2">Error Loading Agreements</h3>
          <p className="text-sm">{errors.contracts}</p>
        </div>
      </div>
    );
  }

  // Show empty state when no contracts
  if (contracts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-500">
        <div className="text-center">
          <h3 className="text-lg font-medium mb-2">No Fuel Agreements</h3>
          <p className="text-sm">No active fuel agreements found for {selectedAirport.name}.</p>
        </div>
      </div>
    );
  }

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

  return (
    <div className="space-y-6">
      {/* Active Agreement Summary */}
      <MainCard
        title="Active Agreement & Reconciliation"
        subtitle={`${agreementData.supplier} • ${agreementData.id}`}
        actions={
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
          </div>
        </CardHeader>
        <CardContent>
          {loading.invoices ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-gray-500">Loading invoices...</div>
            </div>
          ) : errors.invoices ? (
            <div className="flex items-center justify-center py-8 text-red-500">
              Error loading invoices: {errors.invoices}
            </div>
          ) : (
            <FuelInvoicesDataTable invoices={invoices} />
          )}
        </CardContent>
      </BaseCard>

      {/* Dispute Generation */}
      {invoices.length > 0 && (
        <MainCard
          title="Generate Dispute"
          subtitle="Review variance details before creating dispute"
        >
          <div className="space-y-4">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="h-5 w-5 text-yellow-600" />
                <span className="font-medium text-yellow-800">
                  {invoices.length} invoice(s) selected for dispute
                </span>
              </div>
              <div className="text-sm text-yellow-700">
                Potential recovery based on contract pricing formula and variance analysis.
              </div>
            </div>

            <div className="flex gap-2">
              <Button intent="warning" text="Create Dispute" icon={AlertTriangle} />
              <Button intent="secondary" onClick={() => {}} text="Cancel" icon={X} />
            </div>
          </div>
        </MainCard>
      )}
    </div>
  );
}
