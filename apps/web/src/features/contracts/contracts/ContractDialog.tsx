// Updated by CursorAI on Sep 2 2025
'use client';

import { ContractTypeEnum, getContractTypeDisplay } from '@/drizzle/enums';
import type { Airport, Contract } from '@/drizzle/types';
import { formatDate } from '@/lib/core/formatters';
import { client as contractClient } from '@/modules/contracts';
import { type ContractCreateInput } from '@/modules/contracts/contracts.types';
import { client as airportClient } from '@/modules/core/airports';
import { MainCard } from '@/stories/Card/Card';
import { DetailDialog } from '@/stories/Dialog/Dialog';
import { KeyValuePair } from '@/stories/KeyValuePair/KeyValuePair';
import { ModernTimeline } from '@/stories/Timeline/Timeline';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

export default function ContractDialog({
  contract,
  onChange,
  DialogType = 'view',
  trigger,
  open,
  onOpenChange,
}: {
  contract: Contract | null;
  onChange: (contract: Contract) => void;
  DialogType: 'edit' | 'view';
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  const [airport, setAirport] = useState<Airport | null>(null);
  // Get airport object --> For name display
  useEffect(() => {
    if (!contract?.airportId) {
      setAirport(null);
      return;
    }
    const fetchAirport = async () => {
      const fullAirport = await airportClient.getAirportById(contract.airportId!);
      if (fullAirport) {
        setAirport(fullAirport);
      }
    };
    fetchAirport();
  }, [contract?.airportId]);

  const [formData, setFormData] = useState({
    // Contract Information (matching schema)
    title: contract?.title || '',
    contractType: contract?.contractType || null,

    // Vendor Information (matching schema)
    vendorName: contract?.vendorName || null,
    vendorAddress: contract?.vendorAddress || null,
    vendorContactName: contract?.vendorContactName || null,
    vendorContactEmail: contract?.vendorContactEmail || null,
    vendorContactPhone: contract?.vendorContactPhone || null,
    vendorComments: contract?.vendorComments || null,

    // Contract Period (matching schema)
    effectiveFrom: contract?.effectiveFrom ? new Date(contract.effectiveFrom) : null,
    effectiveTo: contract?.effectiveTo ? new Date(contract.effectiveTo) : null,

    // Airport ID
    airportId: contract?.airportId || null,
  });

  const isEdit = DialogType === 'edit';

  // Update formData when contract prop changes
  useEffect(() => {
    setFormData({
      title: contract?.title || '',
      contractType: contract?.contractType || null,
      vendorName: contract?.vendorName || null,
      vendorAddress: contract?.vendorAddress || null,
      vendorContactName: contract?.vendorContactName || null,
      vendorContactEmail: contract?.vendorContactEmail || null,
      vendorContactPhone: contract?.vendorContactPhone || null,
      vendorComments: contract?.vendorComments || null,
      effectiveFrom: contract?.effectiveFrom ? new Date(contract.effectiveFrom) : null,
      effectiveTo: contract?.effectiveTo ? new Date(contract.effectiveTo) : null,
      airportId: contract?.airportId || null,
    });
  }, [contract]);

  const handleFieldChange = (field: string, value: string | boolean | number | Date | null) => {
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
      let savedContract: Contract;

      // Serialize dates to ISO strings before sending
      const serializedFormData = {
        ...formData,
        effectiveFrom: formData.effectiveFrom
          ? formData.effectiveFrom.toISOString().split('T')[0]
          : null,
        effectiveTo: formData.effectiveTo ? formData.effectiveTo.toISOString().split('T')[0] : null,
      };

      // Update existing contract
      if (!contract?.id) {
        throw new Error('Contract ID is required for updates');
      }

      const updateData = {
        title: serializedFormData.title,
        contractType: serializedFormData.contractType || undefined,
        vendorName: serializedFormData.vendorName,
        vendorAddress: serializedFormData.vendorAddress,
        vendorContactName: serializedFormData.vendorContactName,
        vendorContactEmail: serializedFormData.vendorContactEmail,
        vendorContactPhone: serializedFormData.vendorContactPhone,
        vendorComments: serializedFormData.vendorComments,
        effectiveFrom: serializedFormData.effectiveFrom,
        effectiveTo: serializedFormData.effectiveTo,
      };

      savedContract = await contractClient.updateContract(
        contract.id,
        updateData as Partial<ContractCreateInput>,
      );
      toast.success('Contract updated successfully');

      // Call onChange to update parent with new data
      onChange(savedContract);
    } catch (error) {
      toast.error('Failed to update contract');
      console.error('Error updating contract:', error);
      throw error; // Re-throw to let Dialog component handle loading state
    }
  };

  const handleCancel = () => {
    // Reset form to original contract data
    if (contract) {
      setFormData({
        title: contract.title || '',
        contractType: contract.contractType || null,
        vendorName: contract.vendorName || null,
        vendorAddress: contract.vendorAddress || null,
        vendorContactName: contract.vendorContactName || null,
        vendorContactEmail: contract.vendorContactEmail || null,
        vendorContactPhone: contract.vendorContactPhone || null,
        vendorComments: contract.vendorComments || null,
        effectiveFrom: contract.effectiveFrom ? new Date(contract.effectiveFrom) : null,
        effectiveTo: contract.effectiveTo ? new Date(contract.effectiveTo) : null,
        airportId: contract.airportId || null,
      });
    }
  };

  const handleReset = () => {
    // Reset form to original contract data
    if (contract) {
      setFormData({
        title: contract.title || '',
        contractType: contract.contractType || null,
        vendorName: contract.vendorName || null,
        vendorAddress: contract.vendorAddress || null,
        vendorContactName: contract.vendorContactName || null,
        vendorContactEmail: contract.vendorContactEmail || null,
        vendorContactPhone: contract.vendorContactPhone || null,
        vendorComments: contract.vendorComments || null,
        effectiveFrom: contract.effectiveFrom ? new Date(contract.effectiveFrom) : null,
        effectiveTo: contract.effectiveTo ? new Date(contract.effectiveTo) : null,
        airportId: contract.airportId || null,
      });
    }
  };

  const dialogTitle = contract?.title || 'Contract Details';

  return (
    <DetailDialog
      trigger={trigger ? trigger : null}
      headerGradient="from-green-500 to-green-500"
      title={dialogTitle}
      onSave={handleSave}
      onCancel={handleCancel}
      onReset={handleReset}
      DialogType={DialogType}
      open={open}
      onOpenChange={onOpenChange}
    >
      {(isEditing: boolean) => (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <MainCard title="Contract Information" neutralHeader={true}>
            <div className="flex flex-col justify-between">
              <KeyValuePair
                label="Title"
                value={formData.title}
                valueType="string"
                editMode={isEditing}
                onChange={(value) => handleFieldChange('title', value)}
                name="title"
              />
              <KeyValuePair
                label="Contract Type"
                value={formData.contractType}
                valueType="select"
                editMode={isEditing}
                onChange={(value) => handleFieldChange('contractType', value)}
                name="contractType"
                selectOptions={ContractTypeEnum.enumValues.map((value) => ({
                  value,
                  label: getContractTypeDisplay(value),
                }))}
              />
              <KeyValuePair
                label="Airport"
                value={airport?.name}
                valueType="string"
                editMode={isEditing}
                onChange={(value) => handleFieldChange('airport', value)}
                name="airport"
              />
            </div>
          </MainCard>

          <MainCard title="Vendor Information" neutralHeader={true}>
            <div className="flex flex-col justify-between">
              <KeyValuePair
                label="Vendor Name"
                value={formData.vendorName}
                valueType="string"
                editMode={isEditing}
                onChange={(value) => handleFieldChange('vendorName', value)}
                name="vendorName"
              />
              <KeyValuePair
                label="Vendor Address"
                value={formData.vendorAddress}
                valueType="string"
                editMode={isEditing}
                onChange={(value) => handleFieldChange('vendorAddress', value)}
                name="vendorAddress"
              />
              <KeyValuePair
                label="Contact Name"
                value={formData.vendorContactName}
                valueType="string"
                editMode={isEditing}
                onChange={(value) => handleFieldChange('vendorContactName', value)}
                name="vendorContactName"
              />
              <KeyValuePair
                label="Contact Email"
                value={formData.vendorContactEmail}
                valueType="email"
                editMode={isEditing}
                onChange={(value) => handleFieldChange('vendorContactEmail', value)}
                name="vendorContactEmail"
              />
              <KeyValuePair
                label="Contact Phone"
                value={formData.vendorContactPhone}
                valueType="string"
                editMode={isEditing}
                onChange={(value) => handleFieldChange('vendorContactPhone', value)}
                name="vendorContactPhone"
              />
              <KeyValuePair
                label="Vendor Comments"
                value={formData.vendorComments}
                valueType="string"
                editMode={isEditing}
                onChange={(value) => handleFieldChange('vendorComments', value)}
                name="vendorComments"
              />
            </div>
          </MainCard>

          <MainCard title="Contract Period" neutralHeader={true}>
            {!isEditing && (
              <ModernTimeline
                orientation="horizontal"
                items={[
                  {
                    id: '1',
                    title: 'Starts',
                    timestamp: formatDate(formData.effectiveFrom),
                    status: 'current',
                  },
                  {
                    id: '2',
                    title: 'Today',
                    timestamp: formatDate(new Date()),
                    status: 'current',
                  },
                  {
                    id: '3',
                    title: 'Ends',
                    timestamp: formatDate(formData.effectiveTo),
                    status: 'current',
                  },
                ]}
              />
            )}
            {isEditing && (
              <div className="flex flex-col">
                <KeyValuePair
                  label="Effective From"
                  value={formData.effectiveFrom?.toISOString().split('T')[0] || ''}
                  valueType="date"
                  editMode={isEditing}
                  onChange={(value) =>
                    handleFieldChange('effectiveFrom', value ? new Date(value as string) : null)
                  }
                />
                <KeyValuePair
                  label="Effective To"
                  value={formData.effectiveTo?.toISOString().split('T')[0] || ''}
                  valueType="date"
                  editMode={isEditing}
                  onChange={(value) =>
                    handleFieldChange('effectiveTo', value ? new Date(value as string) : null)
                  }
                />
              </div>
            )}
          </MainCard>
        </div>
      )}
    </DetailDialog>
  );
}
