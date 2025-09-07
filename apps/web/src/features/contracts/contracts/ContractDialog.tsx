// Updated by CursorAI on Sep 2 2025
'use client';

import { ContractTypeEnum, getContractTypeDisplay } from '@/drizzle/enums';
import type { Contract } from '@/drizzle/types';
import { useAirportAutocomplete } from '@/hooks/use-airport-autocomplete';
import { formatDate } from '@/lib/core/formatters';
import { client as contractClient } from '@/modules/contracts/contracts';
import { type ContractCreateInput } from '@/modules/contracts/contracts/contracts.types';
import { MainCard } from '@/stories/Card/Card';
import { DetailDialog } from '@/stories/Dialog/Dialog';
import { KeyValuePair } from '@/stories/KeyValuePair/KeyValuePair';
import { ModernTimeline } from '@/stories/Timeline/Timeline';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

export default function ContractDialog({
  contract,
  airportId,
  onChange,
  DialogType = 'view',
  trigger,
  open,
  onOpenChange,
}: {
  contract: Contract | null;
  airportId?: string; // Required when DialogType is 'add'
  onChange: (contract: Contract) => void;
  DialogType: 'add' | 'edit' | 'view';
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  const [formData, setFormData] = useState({
    // Contract Information (matching schema)
    title: contract?.title || '',
    contractType: contract?.contractType || null,
    summary: contract?.summary || null,
    docUrl: contract?.docUrl || null,

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

    // Airport ID for new contracts
    airportId: contract?.airportId || airportId || null,
  });

  const [airportQuery, setAirportQuery] = useState('');
  const { suggestions: airportSuggestions, isLoading: isLoadingAirports } = useAirportAutocomplete({
    query: airportQuery,
    enabled: true,
    limit: 10,
  });

  const isAdd = DialogType === 'add';
  const isEdit = DialogType === 'edit';

  // Update formData when contract prop changes
  useEffect(() => {
    setFormData({
      title: contract?.title || '',
      contractType: contract?.contractType || null,
      summary: contract?.summary || null,
      docUrl: contract?.docUrl || null,
      vendorName: contract?.vendorName || null,
      vendorAddress: contract?.vendorAddress || null,
      vendorContactName: contract?.vendorContactName || null,
      vendorContactEmail: contract?.vendorContactEmail || null,
      vendorContactPhone: contract?.vendorContactPhone || null,
      vendorComments: contract?.vendorComments || null,
      effectiveFrom: contract?.effectiveFrom ? new Date(contract.effectiveFrom) : null,
      effectiveTo: contract?.effectiveTo ? new Date(contract.effectiveTo) : null,
      airportId: contract?.airportId || airportId || null,
    });
  }, [contract, airportId]);

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

      if (isAdd) {
        // Create new contract
        if (!formData.airportId) {
          throw new Error('Airport is required for new contracts');
        }

        const createData: ContractCreateInput = {
          airportId: serializedFormData.airportId,
          vendorId: null, // Will be handled by backend if needed
          title: serializedFormData.title as string,
          contractType: serializedFormData.contractType!,
          summary: serializedFormData.summary,
          docUrl: serializedFormData.docUrl,
          vendorName: serializedFormData.vendorName,
          vendorAddress: serializedFormData.vendorAddress,
          vendorContactName: serializedFormData.vendorContactName,
          vendorContactEmail: serializedFormData.vendorContactEmail,
          vendorContactPhone: serializedFormData.vendorContactPhone,
          vendorComments: serializedFormData.vendorComments,
          effectiveFrom: serializedFormData.effectiveFrom as string,
          effectiveTo: serializedFormData.effectiveTo as string,
        };

        savedContract = await contractClient.createContract(createData);
        toast.success('Contract created successfully');
      } else {
        // Update existing contract
        if (!contract?.id) {
          throw new Error('Contract ID is required for updates');
        }

        const updateData = {
          title: serializedFormData.title,
          contractType: serializedFormData.contractType || undefined,
          summary: serializedFormData.summary,
          docUrl: serializedFormData.docUrl,
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
      }

      // Call onChange to update parent with new data
      onChange(savedContract);
    } catch (error) {
      const action = isAdd ? 'create' : 'update';
      toast.error(`Failed to ${action} contract`);
      console.error(`Error ${action}ing contract:`, error);
      throw error; // Re-throw to let Dialog component handle loading state
    }
  };

  const handleCancel = () => {
    if (isAdd) {
      setFormData({
        title: '',
        contractType: null,
        summary: null,
        docUrl: null,
        vendorName: null,
        vendorAddress: null,
        vendorContactName: null,
        vendorContactEmail: null,
        vendorContactPhone: null,
        vendorComments: null,
        effectiveFrom: null,
        effectiveTo: null,
        airportId: airportId || null,
      });
    }
  };

  const handleReset = () => {
    setFormData({
      title: '',
      contractType: null,
      summary: null,
      docUrl: null,
      vendorName: null,
      vendorAddress: null,
      vendorContactName: null,
      vendorContactEmail: null,
      vendorContactPhone: null,
      vendorComments: null,
      effectiveFrom: null,
      effectiveTo: null,
      airportId: airportId || null,
    });
  };

  const dialogTitle = isAdd ? 'Add New Contract' : contract?.title || 'Contract Details';

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
                label="Summary"
                value={formData.summary}
                valueType="string"
                editMode={isEditing}
                onChange={(value) => handleFieldChange('summary', value)}
                name="summary"
              />

              <KeyValuePair
                label="Document URL"
                value={formData.docUrl}
                valueType="string"
                editMode={isEditing}
                onChange={(value) => handleFieldChange('docUrl', value)}
                name="docUrl"
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
