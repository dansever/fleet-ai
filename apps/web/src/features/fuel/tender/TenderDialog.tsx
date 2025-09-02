// Updated by CursorAI on Dec 2 2024
'use client';

import { getStatusDisplay, statusEnum } from '@/drizzle/schema/enums';
import type { FuelTender } from '@/drizzle/types';
import { CURRENCY_MAP } from '@/lib/constants/currencies';
import { BASE_UOM_OPTIONS } from '@/lib/constants/units';
import { serializeFuelTenderDates } from '@/lib/utils/date-helpers';
import {
  createFuelTender,
  updateFuelTender,
  type CreateFuelTenderData,
} from '@/services/fuel/fuel-tender-client';
import { Button } from '@/stories/Button/Button';
import { MainCard } from '@/stories/Card/Card';
import { DetailDialog } from '@/stories/Dialog/Dialog';
import { KeyValuePair } from '@/stories/KeyValuePair/KeyValuePair';
import { Eye, Pencil, Plus } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';

export default function TenderDialog({
  trigger,
  tender,
  airportId,
  onChange,
  DialogType = 'view',
  open,
  onOpenChange,
  withTrigger = true,
}: {
  trigger?: React.ReactNode;
  tender: FuelTender | null;
  airportId?: string; // Required when DialogType is 'add'
  onChange: (tender: FuelTender) => void;
  DialogType: 'add' | 'edit' | 'view';
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  withTrigger?: boolean;
}) {
  const isAdd = DialogType === 'add';
  const isEdit = DialogType === 'edit';

  // Helper function to get initial form data based on dialog type
  const getInitialFormData = useCallback(() => {
    if (DialogType === 'add') {
      // For add mode, always start with empty form regardless of tender prop
      return {
        // Tender Information (matching schema)
        title: '',
        description: null,
        fuelType: null,
        projectedAnnualVolume: null,

        // Base Configuration (matching schema)
        baseCurrency: null,
        baseUom: null,

        // Timeline (matching schema)
        biddingStarts: null,
        biddingEnds: null,
        deliveryStarts: null,
        deliveryEnds: null,

        // Workflow Management (matching schema)
        status: 'pending',
        winningBidId: null,
      };
    }
    // For edit/view modes, populate from tender
    return {
      title: tender?.title || '',
      description: tender?.description || null,
      fuelType: tender?.fuelType || null,
      projectedAnnualVolume: tender?.projectedAnnualVolume || null,
      baseCurrency: tender?.baseCurrency || null,
      baseUom: tender?.baseUom || null,
      biddingStarts: tender?.biddingStarts || null,
      biddingEnds: tender?.biddingEnds || null,
      deliveryStarts: tender?.deliveryStarts || null,
      deliveryEnds: tender?.deliveryEnds || null,
      status: tender?.status || 'pending',
      winningBidId: tender?.winningBidId || null,
    };
  }, [DialogType, tender]);

  const [formData, setFormData] = useState(() => getInitialFormData());

  // Update formData when DialogType changes (most important) or tender changes
  useEffect(() => {
    setFormData(getInitialFormData());
  }, [getInitialFormData]);

  const handleFieldChange = (field: string, value: string | boolean | number | Date | null) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!formData.title?.trim()) {
      toast.error('Title is required');
      return;
    }

    try {
      let savedTender: FuelTender;

      // Serialize dates to ISO strings before sending
      const serializedFormData = serializeFuelTenderDates(formData);

      if (isAdd) {
        // Create new tender (orgId is handled server-side, airportId must be provided)
        if (!airportId) {
          throw new Error('Airport ID is required when creating a new tender');
        }
        const createData: CreateFuelTenderData = {
          airportId,
          title: serializedFormData.title as string,
          description: serializedFormData.description,
          fuelType: serializedFormData.fuelType,
          baseCurrency: serializedFormData.baseCurrency,
          baseUom: serializedFormData.baseUom,
          projectedAnnualVolume: serializedFormData.projectedAnnualVolume,
          biddingStarts: serializedFormData.biddingStarts,
          biddingEnds: serializedFormData.biddingEnds,
          deliveryStarts: serializedFormData.deliveryStarts,
          deliveryEnds: serializedFormData.deliveryEnds,
        };
        savedTender = await createFuelTender(createData);
        toast.success('Tender created successfully');
      } else {
        // Update existing tender
        if (!tender?.id) {
          throw new Error('Tender ID is required for updates');
        }
        // Ensure required fields are not null for updates
        const updateData = {
          title: serializedFormData.title || tender.title || '',
          description: serializedFormData.description,
          fuelType: serializedFormData.fuelType,
          baseCurrency: serializedFormData.baseCurrency,
          projectedAnnualVolume: serializedFormData.projectedAnnualVolume,
          baseUom: serializedFormData.baseUom,
          biddingStarts: serializedFormData.biddingStarts,
          biddingEnds: serializedFormData.biddingEnds,
          deliveryStarts: serializedFormData.deliveryStarts,
          deliveryEnds: serializedFormData.deliveryEnds,
          status: serializedFormData.status,
        };
        savedTender = await updateFuelTender(
          tender.id,
          updateData as Partial<CreateFuelTenderData>,
        );
        toast.success('Tender updated successfully');
      }

      // Call onChange to update parent with new data
      onChange(savedTender);
    } catch (error) {
      const action = isAdd ? 'create' : 'update';
      toast.error(`Failed to ${action} tender`);
      console.error(`Error ${action}ing tender:`, error);
      throw error; // Re-throw to let Dialog component handle loading state
    }
  };

  const handleCancel = () => {
    // Reset form data to initial state based on current dialog type
    setFormData(getInitialFormData());
  };

  const handleReset = () => {
    // Reset form to initial empty state for add mode
    setFormData(getInitialFormData());
  };

  const dialogTitle = isAdd ? 'Add New Tender' : tender?.title || 'Tender Details';

  return (
    <DetailDialog
      trigger={
        withTrigger
          ? trigger || (
              <Button
                intent={isAdd ? 'add' : isEdit ? 'secondary' : 'primary'}
                text={isAdd ? 'Add Tender' : isEdit ? 'Edit' : 'View'}
                icon={isAdd ? Plus : DialogType === 'edit' ? Pencil : Eye}
                size="md"
              />
            )
          : null
      }
      headerGradient="from-orange-500 to-orange-500"
      title={dialogTitle}
      DialogType={DialogType}
      onSave={handleSave}
      onCancel={handleCancel}
      onReset={handleReset}
      open={open}
      onOpenChange={onOpenChange}
    >
      {(isEditing) => (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <MainCard title="Tender Information" neutralHeader={true}>
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
                label="Projected Annual Volume"
                value={formData.projectedAnnualVolume}
                valueType="number"
                editMode={isEditing}
                onChange={(value) => handleFieldChange('projectedAnnualVolume', value)}
                name="projectedAnnualVolume"
                step={1000}
                min={0}
              />
              <KeyValuePair
                label="Status"
                value={formData.status}
                valueType="select"
                editMode={isEditing}
                onChange={(value) => handleFieldChange('status', value)}
                name="status"
                selectOptions={Object.values(statusEnum.enumValues).map((status) => ({
                  value: status,
                  label: getStatusDisplay(status),
                }))}
              />
            </div>
          </MainCard>

          <MainCard title="Configuration & Timeline" neutralHeader={true}>
            <div className="flex flex-col justify-between space-y-4">
              <KeyValuePair
                label="Base Currency"
                valueType="select"
                editMode={isEditing}
                onChange={(value) => handleFieldChange('baseCurrency', value)}
                name="baseCurrency"
                value={formData.baseCurrency}
                selectOptions={Object.entries(CURRENCY_MAP).map(([key, value]) => ({
                  label: value.display,
                  value: key,
                }))}
              />
              <KeyValuePair
                label="Base UOM"
                value={formData.baseUom}
                valueType="select"
                editMode={isEditing}
                onChange={(value) => handleFieldChange('baseUom', value)}
                name="baseUom"
                selectOptions={BASE_UOM_OPTIONS.map((uom) => ({
                  label: uom.label,
                  value: uom.value,
                }))}
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
          </MainCard>
        </div>
      )}
    </DetailDialog>
  );
}
