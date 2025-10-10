'use client';

import { CardContent } from '@/components/ui/card';
import { formatDate } from '@/lib/core/formatters';
import { Button } from '@/stories/Button/Button';
import { BaseCard } from '@/stories/Card/Card';
import { ModernSelect } from '@/stories/Form/Form';
import { StatusBadge } from '@/stories/StatusBadge/StatusBadge';
import { Download, Edit, FileText } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useFuelProcurement } from '../contexts';

type AgreementStatus = 'active' | 'expired' | 'pending' | 'all';

type PricingType = 'all' | 'fixed' | 'index';

export default function AgreementsPage() {
  const { selectedAirport, contracts, loading, errors, selectContract, selectedContract } =
    useFuelProcurement();
  const [selectedStatus, setSelectedStatus] = useState<AgreementStatus>('all');
  const [selectedPricingType, setSelectedPricingType] = useState<PricingType>('all');

  if (!selectedAirport) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-500">
        <div className="text-center">
          <h3 className="text-lg font-medium mb-2">No Airport Selected</h3>
          <p className="text-sm">Please select an airport to view fuel agreements.</p>
        </div>
      </div>
    );
  }

  const computeStatus = (
    effectiveFrom?: Date | null,
    effectiveTo?: Date | null,
  ): Exclude<AgreementStatus, 'all'> => {
    const now = new Date();
    const from = effectiveFrom ? new Date(effectiveFrom) : null;
    const to = effectiveTo ? new Date(effectiveTo) : null;
    if (from && now < from) return 'pending';
    if (to && now > to) return 'expired';
    return 'active';
  };

  const filteredAgreements = useMemo(() => {
    // Already filtered to fuel in context; compute status to optionally filter
    return contracts.filter((c) => {
      const status = computeStatus(c.effectiveFrom as Date | null, c.effectiveTo as Date | null);
      const statusMatch = selectedStatus === 'all' || status === selectedStatus;
      const pricingMatch = selectedPricingType === 'all';
      return statusMatch && pricingMatch;
    });
  }, [contracts, selectedPricingType, selectedStatus]);

  // Identify the current active fuel contract
  const activeAgreement = useMemo(() => {
    const now = new Date();
    const active = contracts.find((c) => {
      const from = c.effectiveFrom ? new Date(c.effectiveFrom as any) : null;
      const to = c.effectiveTo ? new Date(c.effectiveTo as any) : null;
      if (from && now < from) return false;
      if (to && now > to) return false;
      return true;
    });
    return active || contracts[0] || null;
  }, [contracts]);

  const getStatusBadgeProps = (status: AgreementStatus) => {
    switch (status) {
      case 'active':
        return { status: 'operational' as const, text: 'ACTIVE' };
      case 'expired':
        return { status: 'danger' as const, text: 'EXPIRED' };
      case 'pending':
        return { status: 'warning' as const, text: 'PENDING' };
      default:
        return { status: 'secondary' as const, text: '—' };
    }
  };

  return (
    <div className="space-y-6">
      <BaseCard
        title="Current Fuel Contract"
        subtitle={
          loading.contracts
            ? 'Loading agreements…'
            : activeAgreement
              ? `${activeAgreement.title}`
              : 'No active fuel contract found'
        }
        headerClassName="from-[#7f7fd5] via-[#86a8e7] to-[#91eae4] opacity-80 text-white"
        actions={
          <div className="flex gap-2">
            <Button intent="secondary" text="Export" icon={Download} />
            <Button intent="primary" text="Draft RFQ" icon={FileText} />
          </div>
        }
      >
        <div className="flex flex-col gap-4">
          <div className="p-2 bg-gray-50 rounded-lg grid grid-cols-5 gap-2 items-end">
            <ModernSelect
              label="Agreement"
              placeholder="Select agreement"
              value={selectedContract?.id || activeAgreement?.id}
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
              onValueChange={(value) => setSelectedStatus(value as AgreementStatus)}
              className="col-span-2 w-full"
              options={[
                { value: 'all', label: `All (${contracts.length})` },
                { value: 'active', label: 'Active' },
                { value: 'expired', label: 'Expired' },
                { value: 'pending', label: 'Pending' },
              ]}
            />
          </div>

          {loading.contracts ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-gray-500">Loading agreements...</div>
            </div>
          ) : errors.contracts ? (
            <div className="flex items-center justify-center py-8 text-red-500">
              Error loading agreements: {errors.contracts}
            </div>
          ) : !activeAgreement ? (
            <div className="flex flex-col items-center justify-center py-8 text-gray-500">
              <FileText className="h-12 w-12 mb-4" />
              <h3 className="text-lg font-medium mb-2">No Agreement Found</h3>
              <p className="text-sm">No active fuel agreement found for this airport.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Compact summary row */}
              <div className="grid grid-cols-10 gap-2 p-3 bg-gray-50 rounded-lg font-medium text-sm text-gray-700">
                <div className="col-span-3">{activeAgreement.title}</div>
                <div className="col-span-2">{activeAgreement.vendorName || '—'}</div>
                <div className="col-span-3">
                  {formatDate(activeAgreement.effectiveFrom)} -{' '}
                  {formatDate(activeAgreement.effectiveTo)}
                </div>
                <div className="col-span-2 flex items-center">
                  {(() => {
                    const status = computeStatus(
                      activeAgreement.effectiveFrom as Date | null,
                      activeAgreement.effectiveTo as Date | null,
                    );
                    const badge = getStatusBadgeProps(status);
                    return <StatusBadge status={badge.status} text={badge.text} />;
                  })()}
                </div>
              </div>

              {/* Detailed card */}
              <BaseCard
                title={`${activeAgreement.title} Details`}
                subtitle={`${activeAgreement.vendorName || ''}`}
                headerClassName="from-[#7f7fd5] via-[#86a8e7] to-[#91eae4] opacity-80 text-white"
                actions={
                  <div className="flex gap-2">
                    <Button intent="secondary" text="Edit Agreement" icon={Edit} />
                    <Button intent="primary" text="Draft RFQ" icon={FileText} />
                  </div>
                }
              >
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center space-y-2 p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="text-sm text-blue-600 font-medium">Effective From</div>
                      <div className="text-xl font-bold text-blue-800">
                        {formatDate(activeAgreement.effectiveFrom)}
                      </div>
                    </div>
                    <div className="text-center space-y-2 p-4 bg-green-50 rounded-lg border border-green-200">
                      <div className="text-sm text-green-600 font-medium">Effective To</div>
                      <div className="text-xl font-bold text-green-800">
                        {formatDate(activeAgreement.effectiveTo)}
                      </div>
                    </div>
                    <div className="text-center space-y-2 p-4 bg-orange-50 rounded-lg border border-orange-200">
                      <div className="text-sm text-orange-600 font-medium">Process Status</div>
                      <div className="text-xl font-bold text-orange-800">
                        {activeAgreement.processStatus?.toUpperCase?.()}
                      </div>
                    </div>
                    <div className="text-center space-y-2 p-4 bg-purple-50 rounded-lg border border-purple-200">
                      <div className="text-sm text-purple-600 font-medium">Contract Type</div>
                      <div className="text-xl font-bold text-purple-800">
                        {activeAgreement.contractType?.toUpperCase?.()}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-semibold text-gray-700">Details</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center space-y-2 p-3 bg-gray-50 rounded-lg">
                        <div className="text-gray-600">Vendor Contact</div>
                        <div className="font-bold">{activeAgreement.vendorContactName || '—'}</div>
                      </div>
                      <div className="text-center space-y-2 p-3 bg-gray-50 rounded-lg">
                        <div className="text-gray-600">Contact Email</div>
                        <div className="font-bold">{activeAgreement.vendorContactEmail || '—'}</div>
                      </div>
                      <div className="text-center space-y-2 p-3 bg-gray-50 rounded-lg">
                        <div className="text-gray-600">Contact Phone</div>
                        <div className="font-bold">{activeAgreement.vendorContactPhone || '—'}</div>
                      </div>
                      <div className="text-center space-y-2 p-3 bg-gray-50 rounded-lg">
                        <div className="text-gray-600">Airport</div>
                        <div className="font-bold">{selectedAirport?.name || '—'}</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </BaseCard>
            </div>
          )}
        </div>
      </BaseCard>

      {/* Details */}
      {selectedContract && (
        <div className="space-y-6">
          <BaseCard
            title={`${selectedContract.title} Details`}
            subtitle={`${selectedContract.vendorName || ''}`}
            headerClassName="from-[#7f7fd5] via-[#86a8e7] to-[#91eae4] opacity-80 text-white"
            actions={
              <div className="flex gap-2">
                <Button intent="secondary" text="Edit Agreement" icon={Edit} />
                <Button intent="primary" text="Draft RFQ" icon={FileText} />
              </div>
            }
          >
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center space-y-2 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="text-sm text-blue-600 font-medium">Effective From</div>
                  <div className="text-xl font-bold text-blue-800">
                    {formatDate(selectedContract.effectiveFrom)}
                  </div>
                </div>
                <div className="text-center space-y-2 p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="text-sm text-green-600 font-medium">Effective To</div>
                  <div className="text-xl font-bold text-green-800">
                    {formatDate(selectedContract.effectiveTo)}
                  </div>
                </div>
                <div className="text-center space-y-2 p-4 bg-orange-50 rounded-lg border border-orange-200">
                  <div className="text-sm text-orange-600 font-medium">Process Status</div>
                  <div className="text-xl font-bold text-orange-800">
                    {selectedContract.processStatus?.toUpperCase?.()}
                  </div>
                </div>
                <div className="text-center space-y-2 p-4 bg-purple-50 rounded-lg border border-purple-200">
                  <div className="text-sm text-purple-600 font-medium">Contract Type</div>
                  <div className="text-xl font-bold text-purple-800">
                    {selectedContract.contractType?.toUpperCase?.()}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-semibold text-gray-700">Details</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center space-y-2 p-3 bg-gray-50 rounded-lg">
                    <div className="text-gray-600">Vendor Contact</div>
                    <div className="font-bold">{selectedContract.vendorContactName || '—'}</div>
                  </div>
                  <div className="text-center space-y-2 p-3 bg-gray-50 rounded-lg">
                    <div className="text-gray-600">Contact Email</div>
                    <div className="font-bold">{selectedContract.vendorContactEmail || '—'}</div>
                  </div>
                  <div className="text-center space-y-2 p-3 bg-gray-50 rounded-lg">
                    <div className="text-gray-600">Contact Phone</div>
                    <div className="font-bold">{selectedContract.vendorContactPhone || '—'}</div>
                  </div>
                  <div className="text-center space-y-2 p-3 bg-gray-50 rounded-lg">
                    <div className="text-gray-600">Airport</div>
                    <div className="font-bold">{selectedAirport?.name || '—'}</div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-700">Linked Items</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Linked Tender</span>
                      <span className="text-sm font-medium">—</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Winning Bid</span>
                      <span className="text-sm font-medium">—</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Invoices Under Agreement</span>
                      <span className="text-sm font-medium">—</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Current Issues</span>
                      <span className="text-sm font-medium">—</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-700">Notes</h4>
                  <div className="bg-gray-50 p-4 rounded-lg text-sm text-gray-700">
                    {selectedContract.summary || 'No summary provided.'}
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
