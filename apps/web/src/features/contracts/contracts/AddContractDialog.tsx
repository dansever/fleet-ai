'use client';

import { ContractType, ContractTypeEnum, getContractTypeDisplay } from '@/drizzle/enums';
import type { Airport, Contract, NewContract } from '@/drizzle/types';
import { client as contractClient } from '@/modules/contracts';
import { BaseCard } from '@/stories/Card/Card';
import { DetailDialog } from '@/stories/Dialog/Dialog';
import { KeyValuePair } from '@/stories/KeyValuePair/KeyValuePair';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

export default function SimpleContractDialog({
  airport,
  onChange,
  trigger,
  open,
  onOpenChange,
}: {
  airport: Airport;
  onChange: (contract: Contract) => void;
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  const [formData, setFormData] = useState({
    title: '',
    contractType: null as ContractType | null,
    airportId: airport.id,
    effectiveFrom: null as string | null,
    effectiveTo: null as string | null,
  });

  // Reset form when airport changes
  useEffect(() => {
    setFormData({
      title: '',
      contractType: null,
      airportId: airport.id,
      effectiveFrom: null,
      effectiveTo: null,
    });
  }, [airport.id]);

  const handleFieldChange = (field: string, value: string | null) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!formData.title?.trim()) {
      toast.error('Title is required');
      return;
    }
    if (!formData.contractType) {
      toast.error('Contract type is required');
      return;
    }
    try {
      const createData: Partial<NewContract> = {
        airportId: formData.airportId,
        title: formData.title,
        contractType: formData.contractType,
        effectiveFrom: formData.effectiveFrom as string | undefined,
        effectiveTo: formData.effectiveTo as string | undefined,
      };

      const savedContract = await contractClient.createContract(createData as NewContract);
      toast.success('Contract created successfully');

      // Call onChange to update parent with new data
      onChange(savedContract);
    } catch (error) {
      toast.error('Failed to create contract');
      console.error('Error creating contract:', error);
      throw error; // Re-throw to let Dialog component handle loading state
    }
  };

  const handleCancel = () => {
    setFormData({
      title: '',
      contractType: null,
      airportId: airport.id,
      effectiveFrom: null,
      effectiveTo: null,
    });
  };

  const handleReset = () => {
    setFormData({
      title: '',
      contractType: null,
      airportId: airport.id,
      effectiveFrom: null,
      effectiveTo: null,
    });
  };

  return (
    <DetailDialog
      trigger={trigger}
      headerGradient="from-sky-500 to-blue-600 opacity-80"
      title="Create New Contract"
      onSave={handleSave}
      onCancel={handleCancel}
      onReset={handleReset}
      DialogType="add"
      open={open}
      onOpenChange={onOpenChange}
      className="min-w-[30vw] sm:min-w-[35vw] md:min-w-[40vw] lg:min-w-[45vw]"
    >
      {(isEditing: boolean) => (
        <div className="mx-auto">
          <BaseCard title="Contract Information" neutralHeader={true}>
            <div>
              <KeyValuePair
                label="Title"
                value={formData.title}
                valueType="string"
                editMode={isEditing}
                onChange={(value) => handleFieldChange('title', value as string)}
                name="title"
                placeholder="Enter contract title"
              />

              <KeyValuePair
                label="Contract Type"
                value={formData.contractType}
                valueType="select"
                editMode={isEditing}
                onChange={(value) => handleFieldChange('contractType', value as string)}
                name="contractType"
                selectOptions={ContractTypeEnum.enumValues.map((value) => ({
                  value,
                  label: getContractTypeDisplay(value),
                }))}
                placeholder="Select contract type"
              />

              <KeyValuePair
                label="Airport"
                value={airport.name}
                valueType="string"
                editMode={false} // Airport is not editable in this simple dialog
                onChange={() => {}} // No-op since it's not editable
                name="airport"
              />
            </div>
          </BaseCard>

          <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-700">
              📝 <strong>Quick Start:</strong> This creates a basic contract with just the
              essentials. You can add vendor details, contract dates, pricing, and other information
              later by editing the contract.
            </p>
          </div>
        </div>
      )}
    </DetailDialog>
  );
}
