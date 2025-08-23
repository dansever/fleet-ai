'use client';

import type { FuelTender } from '@/drizzle/types';
import { formatDate } from '@/lib/core/formatters';
import { updateFuelTender } from '@/services/fuel/fuel-tender-client';
import { Button } from '@/stories/Button/Button';
import { ContentSection } from '@/stories/Card/Card';
import { DetailDialog } from '@/stories/Dialog/Dialog';
import { KeyValuePair } from '@/stories/Utilities/KeyValuePair';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

export default function TenderDialog({
  tender,
  onChange,
}: {
  tender: FuelTender;
  onChange: (tender: FuelTender) => void;
}) {
  const [formData, setFormData] = useState({
    title: tender.title,
    description: tender.description,
    fuelType: tender.fuelType,
    baseCurrency: tender.baseCurrency,
    baseUom: tender.baseUom,
    biddingStarts: tender.biddingStarts,
    biddingEnds: tender.biddingEnds,
    deliveryStarts: tender.deliveryStarts,
    deliveryEnds: tender.deliveryEnds,
  });
  const [isSaving, setIsSaving] = useState(false);

  // Update formData when airport prop changes
  useEffect(() => {
    setFormData({
      title: tender.title,
      description: tender.description,
      fuelType: tender.fuelType,
      baseCurrency: tender.baseCurrency,
      baseUom: tender.baseUom,
      biddingStarts: tender.biddingStarts,
      biddingEnds: tender.biddingEnds,
      deliveryStarts: tender.deliveryStarts,
      deliveryEnds: tender.deliveryEnds,
    });
  }, [tender]);

  const handleFieldChange = (field: string, value: string | boolean | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateFuelTender(tender.id, formData);
      toast.success('Tender saved successfully');

      // Call onChange to update parent with new data
      onChange({
        ...tender,
        ...formData,
      });
    } catch (error) {
      toast.error('Failed to save');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <DetailDialog
      trigger={<Button intent="primary" text={`View ${tender.title}`} />}
      title={tender.title}
      onSave={handleSave}
    >
      {(isEditing) => (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ContentSection
            header="Information"
            gradient="from-blue-500 to-green-500"
            children={
              <div className="flex flex-col justify-between">
                <KeyValuePair
                  label="Title"
                  value={formData.title}
                  editMode={isEditing}
                  onChange={(value) => handleFieldChange('title', value)}
                  name="title"
                />
                <KeyValuePair
                  label="Description"
                  editMode={isEditing}
                  onChange={(value) => handleFieldChange('description', value)}
                  name="description"
                  value={formData.description}
                />
                <KeyValuePair
                  label="Fuel Type"
                  editMode={isEditing}
                  onChange={(value) => handleFieldChange('fuelType', value)}
                  name="fuelType"
                  value={formData.fuelType}
                />
                <KeyValuePair
                  label="Base Currency"
                  editMode={isEditing}
                  onChange={(value) => handleFieldChange('baseCurrency', value)}
                  name="baseCurrency"
                  value={formData.baseCurrency}
                />
              </div>
            }
          />
          <ContentSection
            header="Location"
            gradient="from-blue-500 to-green-500"
            children={
              <div className="flex flex-col justify-between">
                <KeyValuePair
                  label="Base UOM"
                  value={formData.baseUom}
                  editMode={isEditing}
                  onChange={(value) => handleFieldChange('baseUom', value)}
                  name="baseUom"
                />
                <KeyValuePair
                  label="Bidding Starts"
                  value={formData.biddingStarts ? formatDate(formData.biddingStarts) : ''}
                  editMode={isEditing}
                  onChange={(value) => handleFieldChange('biddingStarts', value)}
                  name="biddingStarts"
                />
                <KeyValuePair
                  label="Bidding Ends"
                  value={formData.biddingEnds ? formatDate(formData.biddingEnds) : ''}
                  editMode={isEditing}
                  onChange={(value) => handleFieldChange('biddingEnds', value)}
                  name="biddingEnds"
                />
              </div>
            }
          />
        </div>
      )}
    </DetailDialog>
  );
}
