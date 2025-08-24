'use client';

import type { FuelTender } from '@/drizzle/types';
import {
  createFuelTender,
  updateFuelTender,
  type CreateFuelTenderData,
} from '@/services/fuel/fuel-tender-client';
import { Button } from '@/stories/Button/Button';
import { ContentSection } from '@/stories/Card/Card';
import { DetailDialog } from '@/stories/Dialog/Dialog';
import { KeyValuePair } from '@/stories/Utilities/KeyValuePair';
import { Pencil, Plus } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

export default function TenderDialog({
  tender,
  airportId,
  onChange,
  DialogType = 'view',
  triggerClassName,
  buttonSize = 'md',
}: {
  tender: FuelTender | null;
  airportId?: string; // Required when isNew is true
  onChange: (tender: FuelTender) => void;
  DialogType: 'add' | 'edit' | 'view';
  triggerClassName?: string;
  buttonSize?: 'sm' | 'md' | 'lg';
}) {
  const [formData, setFormData] = useState({
    title: tender?.title || '',
    description: tender?.description || '',
    fuelType: tender?.fuelType || '',
    baseCurrency: tender?.baseCurrency || '',
    baseUom: tender?.baseUom || '',
    biddingStarts: tender?.biddingStarts || null,
    biddingEnds: tender?.biddingEnds || null,
    deliveryStarts: tender?.deliveryStarts || null,
    deliveryEnds: tender?.deliveryEnds || null,
  });
  const [isSaving, setIsSaving] = useState(false);
  const isAdd = DialogType === 'add';
  const isEdit = DialogType === 'edit';

  // Update formData when tender prop changes
  useEffect(() => {
    setFormData({
      title: tender?.title || '',
      description: tender?.description || '',
      fuelType: tender?.fuelType || '',
      baseCurrency: tender?.baseCurrency || '',
      baseUom: tender?.baseUom || '',
      biddingStarts: tender?.biddingStarts ? new Date(tender?.biddingStarts) : null,
      biddingEnds: tender?.biddingEnds ? new Date(tender?.biddingEnds) : null,
      deliveryStarts: tender?.deliveryStarts ? new Date(tender?.deliveryStarts) : null,
      deliveryEnds: tender?.deliveryEnds ? new Date(tender?.deliveryEnds) : null,
    });
  }, [tender]);

  const handleFieldChange = (field: string, value: string | boolean | number | Date | null) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      let savedTender: FuelTender;

      // Serialize dates to ISO strings before sending
      const serializedFormData = {
        ...formData,
        biddingStarts: formData.biddingStarts?.toISOString() || null,
        biddingEnds: formData.biddingEnds?.toISOString() || null,
        deliveryStarts: formData.deliveryStarts?.toISOString() || null,
        deliveryEnds: formData.deliveryEnds?.toISOString() || null,
      };

      if (isAdd) {
        // Create new tender (orgId is handled server-side, airportId must be provided)
        if (!airportId) {
          throw new Error('Airport ID is required when creating a new tender');
        }
        const createData: CreateFuelTenderData = {
          ...serializedFormData,
          airportId,
        };
        savedTender = await createFuelTender(createData);
        toast.success('Tender created successfully');
      } else {
        // Update existing tender
        if (!tender?.id) {
          throw new Error('Tender ID is required for updates');
        }
        savedTender = await updateFuelTender(tender.id, formData);
        toast.success('Tender updated successfully');
      }

      // Call onChange to update parent with new data
      onChange(savedTender);
    } catch (error) {
      const action = isAdd ? 'create' : 'update';
      toast.error(`Failed to ${action} tender`);
      console.error(`Error ${action}ing tender:`, error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (isAdd) {
      setFormData({
        title: '',
        description: '',
        fuelType: '',
        baseCurrency: '',
        baseUom: '',
        biddingStarts: null,
        biddingEnds: null,
        deliveryStarts: null,
        deliveryEnds: null,
      });
    }
  };

  const triggerText = isAdd ? 'Add Tender' : isEdit ? 'Edit' : `View ${tender?.title || 'Tender'}`;
  const dialogTitle = isAdd ? 'Add New Tender' : tender?.title || 'Tender Details';
  const saveButtonText = isAdd ? 'Create Tender' : 'Save Changes';

  return (
    <DetailDialog
      trigger={
        <Button
          intent={isAdd ? 'add' : isEdit ? 'secondary' : 'primary'}
          text={triggerText}
          icon={isAdd ? Plus : DialogType === 'edit' ? Pencil : undefined}
          size={buttonSize}
          className={triggerClassName}
        />
      }
      headerGradient="from-orange-500 to-orange-500"
      title={dialogTitle}
      onSave={handleSave}
      onCancel={handleCancel}
      initialEditing={isEdit || isAdd}
      saveButtonText={saveButtonText}
    >
      {(isEditing) => (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ContentSection
            header="Tender Information"
            headerGradient="from-orange-500 to-orange-300"
            children={
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
                  label="Description"
                  valueType="string"
                  editMode={isEditing}
                  onChange={(value) => handleFieldChange('description', value)}
                  name="description"
                  value={formData.description}
                />
                <KeyValuePair
                  label="Fuel Type"
                  valueType="string"
                  editMode={isEditing}
                  onChange={(value) => handleFieldChange('fuelType', value)}
                  name="fuelType"
                  value={formData.fuelType}
                />
                <KeyValuePair
                  label="Base Currency"
                  valueType="string"
                  editMode={isEditing}
                  onChange={(value) => handleFieldChange('baseCurrency', value)}
                  name="baseCurrency"
                  value={formData.baseCurrency}
                />
              </div>
            }
          />
          <ContentSection
            header="Configuration & Timeline"
            headerGradient="from-orange-500 to-orange-300"
            children={
              <div className="flex flex-col justify-between space-y-4">
                <KeyValuePair
                  label="Base UOM"
                  value={formData.baseUom}
                  valueType="string"
                  editMode={isEditing}
                  onChange={(value) => handleFieldChange('baseUom', value)}
                  name="baseUom"
                />

                <KeyValuePair
                  label="Bidding Starts"
                  value={formData.biddingStarts}
                  valueType="date"
                  editMode={isEditing}
                  onChange={(value) => handleFieldChange('biddingStarts', value)}
                  name="biddingStarts"
                />
                <KeyValuePair
                  label="Bidding Ends"
                  value={formData.biddingEnds}
                  valueType="date"
                  editMode={isEditing}
                  onChange={(value) => handleFieldChange('biddingEnds', value)}
                  name="biddingEnds"
                />
                <KeyValuePair
                  label="Delivery Starts"
                  value={formData.deliveryStarts}
                  valueType="date"
                  editMode={isEditing}
                  onChange={(value) => handleFieldChange('deliveryStarts', value)}
                  name="deliveryStarts"
                />
                <KeyValuePair
                  label="Delivery Ends"
                  value={formData.deliveryEnds}
                  valueType="date"
                  editMode={isEditing}
                  onChange={(value) => handleFieldChange('deliveryEnds', value)}
                  name="deliveryEnds"
                />
              </div>
            }
          />
        </div>
      )}
    </DetailDialog>
  );
}
