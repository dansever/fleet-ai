'use client';

import { ContractTypeEnum, getContractTypeDisplay } from '@/drizzle/schema/enums';
import type { ServiceContract } from '@/drizzle/types';
import { useAirportAutocomplete } from '@/hooks/use-airport-autocomplete';
import {
  createServiceContract,
  updateServiceContract,
} from '@/services/contracts/service-contract-client';
import { Button, ButtonProps } from '@/stories/Button/Button';
import { ContentSection } from '@/stories/Card/Card';
import { DetailDialog } from '@/stories/Dialog/Dialog';
import { KeyValuePair } from '@/stories/Utilities/KeyValuePair';
import { Eye, LucideIcon, Pencil, Plus } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

export default function ServiceContractDialog({
  serviceContract,
  airportId,
  onChange,
  DialogType = 'view',
  triggerText,
  triggerIcon,
  triggerClassName,
  buttonSize = 'md',
  triggerIntent,
  open,
  onOpenChange,
  withTrigger = true,
}: {
  serviceContract: ServiceContract | null;
  airportId?: string;
  onChange: (serviceContract: ServiceContract) => void;
  DialogType: 'add' | 'edit' | 'view';
  triggerText?: string;
  triggerIcon?: LucideIcon;
  triggerClassName?: string;
  buttonSize?: 'sm' | 'md' | 'lg';
  triggerIntent?: 'primary' | 'secondary' | 'add' | 'delete' | 'info';
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  withTrigger?: boolean;
}) {
  const [formData, setFormData] = useState({
    title: serviceContract?.title || '',
    contractType: serviceContract?.contractType || null,
    notes: serviceContract?.notes || null,
    vendorName: serviceContract?.vendorName || null,
    vendorAddress: serviceContract?.vendorAddress || null,
    vendorContactName: serviceContract?.vendorContactName || null,
    vendorContactEmail: serviceContract?.vendorContactEmail || null,
    vendorContactPhone: serviceContract?.vendorContactPhone || null,
    effectiveFrom: serviceContract?.effectiveFrom ? new Date(serviceContract.effectiveFrom) : null,
    effectiveTo: serviceContract?.effectiveTo ? new Date(serviceContract.effectiveTo) : null,
    pdfUrl: serviceContract?.pdfUrl || null,
    rawText: serviceContract?.rawText || null,
    aiSummary: serviceContract?.aiSummary || null,
    terms: serviceContract?.terms || {},
    airportId: serviceContract?.airportId || airportId || null,
  });
  const [isSaving, setIsSaving] = useState(false);
  const [airportQuery, setAirportQuery] = useState('');

  const { suggestions: airportSuggestions, isLoading: isLoadingAirports } = useAirportAutocomplete({
    query: airportQuery,
    enabled: true,
    limit: 10,
  });

  const isAdd = DialogType === 'add';
  const isEdit = DialogType === 'edit';

  // Update formData when serviceContract prop changes
  useEffect(() => {
    setFormData({
      title: serviceContract?.title || '',
      contractType: serviceContract?.contractType || null,
      notes: serviceContract?.notes || null,
      vendorName: serviceContract?.vendorName || null,
      vendorAddress: serviceContract?.vendorAddress || null,
      vendorContactName: serviceContract?.vendorContactName || null,
      vendorContactEmail: serviceContract?.vendorContactEmail || null,
      vendorContactPhone: serviceContract?.vendorContactPhone || null,
      effectiveFrom: serviceContract?.effectiveFrom
        ? new Date(serviceContract.effectiveFrom)
        : null,
      effectiveTo: serviceContract?.effectiveTo ? new Date(serviceContract.effectiveTo) : null,
      pdfUrl: serviceContract?.pdfUrl || null,
      rawText: serviceContract?.rawText || null,
      aiSummary: serviceContract?.aiSummary || null,
      terms: serviceContract?.terms || {},
      airportId: serviceContract?.airportId || airportId || null,
    });
  }, [serviceContract, airportId]);

  const handleFieldChange = (
    field: string,
    value: string | boolean | number | Date | null | object,
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!formData.title?.trim()) {
      toast.error('Title is required');
      return;
    }

    setIsSaving(true);
    try {
      let savedServiceContract: ServiceContract;

      // Serialize dates to ISO strings before sending
      const serializedFormData = {
        ...formData,
        effectiveFrom: formData.effectiveFrom
          ? formData.effectiveFrom.toISOString().split('T')[0]
          : null,
        effectiveTo: formData.effectiveTo ? formData.effectiveTo.toISOString().split('T')[0] : null,
      };

      if (isAdd) {
        // Create new service contract
        if (!formData.airportId) {
          throw new Error('Airport is required for new service contracts');
        }

        const createData = {
          title: serializedFormData.title as string,
          contractType: serializedFormData.contractType,
          notes: serializedFormData.notes,
          vendorName: serializedFormData.vendorName,
          vendorAddress: serializedFormData.vendorAddress,
          vendorContactName: serializedFormData.vendorContactName,
          vendorContactEmail: serializedFormData.vendorContactEmail,
          vendorContactPhone: serializedFormData.vendorContactPhone,
          effectiveFrom: serializedFormData.effectiveFrom,
          effectiveTo: serializedFormData.effectiveTo,
          pdfUrl: serializedFormData.pdfUrl,
          rawText: serializedFormData.rawText,
          aiSummary: serializedFormData.aiSummary,
          terms: serializedFormData.terms,
        };

        savedServiceContract = await createServiceContract(formData.airportId, createData);
        toast.success('Service contract created successfully');
      } else {
        // Update existing service contract
        if (!serviceContract?.id) {
          throw new Error('Service contract ID is required for updates');
        }

        const updateData = {
          title: serializedFormData.title,
          contractType: serializedFormData.contractType,
          notes: serializedFormData.notes,
          vendorName: serializedFormData.vendorName,
          vendorAddress: serializedFormData.vendorAddress,
          vendorContactName: serializedFormData.vendorContactName,
          vendorContactEmail: serializedFormData.vendorContactEmail,
          vendorContactPhone: serializedFormData.vendorContactPhone,
          effectiveFrom: serializedFormData.effectiveFrom,
          effectiveTo: serializedFormData.effectiveTo,
          pdfUrl: serializedFormData.pdfUrl,
          rawText: serializedFormData.rawText,
          aiSummary: serializedFormData.aiSummary,
          terms: serializedFormData.terms,
        };

        savedServiceContract = await updateServiceContract(serviceContract.id, updateData);
        toast.success('Service contract updated successfully');
      }

      // Call onChange to update parent with new data
      onChange(savedServiceContract);
    } catch (error) {
      const action = isAdd ? 'create' : 'update';
      toast.error(`Failed to ${action} service contract`);
      console.error(`Error ${action}ing service contract:`, error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (isAdd) {
      setFormData({
        title: '',
        contractType: null,
        notes: null,
        vendorName: null,
        vendorAddress: null,
        vendorContactName: null,
        vendorContactEmail: null,
        vendorContactPhone: null,
        effectiveFrom: null,
        effectiveTo: null,
        pdfUrl: null,
        rawText: null,
        aiSummary: null,
        terms: {},
        airportId: airportId || null,
      });
    }
  };

  const dialogTitle = isAdd
    ? 'Add New Service Contract'
    : serviceContract?.title || 'Service Contract Details';
  const saveButtonText = isAdd ? 'Create Service Contract' : 'Save Changes';

  return (
    <DetailDialog
      trigger={
        withTrigger ? (
          <Button
            intent={
              triggerIntent
                ? (triggerIntent as ButtonProps['intent'])
                : isAdd
                  ? 'add'
                  : isEdit
                    ? 'secondary'
                    : 'primary'
            }
            text={triggerText}
            icon={
              triggerIcon ||
              (isAdd
                ? Plus
                : DialogType === 'edit'
                  ? Pencil
                  : DialogType === 'view'
                    ? Eye
                    : undefined)
            }
            size={buttonSize}
            className={triggerClassName}
          />
        ) : null
      }
      headerGradient="from-green-500 to-green-500"
      title={dialogTitle}
      onSave={handleSave}
      onCancel={handleCancel}
      initialEditing={isEdit || isAdd}
      saveButtonText={saveButtonText}
      open={open}
      onOpenChange={onOpenChange}
    >
      {(isEditing: boolean) => (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <ContentSection
            header="Contract Information"
            headerGradient="from-green-500 to-green-300"
          >
            <div className="flex flex-col justify-between space-y-4">
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
                value={
                  isEditing
                    ? formData.contractType || 'none'
                    : getContractTypeDisplay(formData.contractType)
                }
                valueType={isEditing ? 'select' : 'string'}
                editMode={isEditing}
                onChange={(value) =>
                  handleFieldChange('contractType', value === 'none' ? null : value)
                }
                name="contractType"
                selectOptions={[
                  { value: 'none', label: 'None' },
                  ...ContractTypeEnum.enumValues.map((value) => ({
                    value,
                    label: getContractTypeDisplay(value),
                  })),
                ]}
              />
              <KeyValuePair
                label="Notes"
                value={formData.notes}
                valueType="string"
                editMode={isEditing}
                onChange={(value) => handleFieldChange('notes', value)}
                name="notes"
              />
              <KeyValuePair
                label="AI Summary"
                value={formData.aiSummary}
                valueType="string"
                editMode={isEditing}
                onChange={(value) => handleFieldChange('aiSummary', value)}
                name="aiSummary"
              />
            </div>
          </ContentSection>

          <ContentSection header="Vendor Information" headerGradient="from-green-500 to-green-300">
            <div className="flex flex-col justify-between space-y-4">
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
                valueType="string"
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
            </div>
          </ContentSection>

          <ContentSection header="Contract Period" headerGradient="from-green-500 to-green-300">
            <div className="flex flex-col justify-between space-y-4">
              <KeyValuePair
                label="Effective From"
                value={formData.effectiveFrom}
                valueType="date"
                editMode={isEditing}
                onChange={(value) => handleFieldChange('effectiveFrom', value)}
                name="effectiveFrom"
              />
              <KeyValuePair
                label="Effective To"
                value={formData.effectiveTo}
                valueType="date"
                editMode={isEditing}
                onChange={(value) => handleFieldChange('effectiveTo', value)}
                name="effectiveTo"
              />
            </div>
          </ContentSection>

          <ContentSection header="Document Management" headerGradient="from-green-500 to-green-300">
            <div className="flex flex-col justify-between space-y-4">
              <KeyValuePair
                label="PDF URL"
                value={formData.pdfUrl}
                valueType="string"
                editMode={isEditing}
                onChange={(value) => handleFieldChange('pdfUrl', value)}
                name="pdfUrl"
              />
              <KeyValuePair
                label="Raw Text"
                value={formData.rawText}
                valueType="string"
                editMode={isEditing}
                onChange={(value) => handleFieldChange('rawText', value)}
                name="rawText"
              />
            </div>
          </ContentSection>
        </div>
      )}
    </DetailDialog>
  );
}
