// Updated by CursorAI on Sep 2 2025
'use client';

import {
  getProcessStatusDisplay,
  getUrgencyLevelDisplay,
  OrderDirection,
  orderDirectionDisplayMap,
  OrderDirectionEnum,
  ProcessStatusEnum,
  UrgencyLevel,
  UrgencyLevelEnum,
} from '@/drizzle/enums';
import type { Rfq } from '@/drizzle/types';
import { client as rfqClient } from '@/modules/rfqs';
import { RfqCreateInput, RfqUpdateInput } from '@/modules/rfqs/rfqs.types';
import { BaseCard } from '@/stories/Card/Card';
import { DetailDialog } from '@/stories/Dialog/Dialog';
import { KeyValuePair } from '@/stories/KeyValuePair/KeyValuePair';
import { serializeDatesForAPI } from '@/utils/date-helpers';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

export default function RfqDialog({
  rfq,
  onChange,
  DialogType = 'view',
  trigger,
  open,
  onOpenChange,
}: {
  rfq: Rfq | null;
  onChange: (rfq: Rfq) => void;
  DialogType: 'add' | 'edit' | 'view';
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  // Initial form data state - use memoized initialization
  const [formData, setFormData] = useState(() => {
    return {
      // RFQ Identification (matching schema)
      direction: rfq?.direction || null,
      rfqNumber: rfq?.rfqNumber || null,
      processStatus: rfq?.processStatus || 'pending',

      // Vendor Information (matching schema)
      vendorName: rfq?.vendorName || null,
      vendorAddress: rfq?.vendorAddress || null,
      vendorContactName: rfq?.vendorContactName || null,
      vendorContactEmail: rfq?.vendorContactEmail || null,
      vendorContactPhone: rfq?.vendorContactPhone || null,

      // Part Specifications (matching schema)
      partNumber: rfq?.partNumber || null,
      altPartNumber: rfq?.altPartNumber || null,
      partDescription: rfq?.partDescription || null,
      conditionCode: rfq?.conditionCode || null,
      unitOfMeasure: rfq?.unitOfMeasure || null,
      quantity: rfq?.quantity || null,

      // Commercial Terms (matching schema)
      pricingType: rfq?.pricingType || null,
      urgencyLevel: rfq?.urgencyLevel || null,
      deliverTo: rfq?.deliverTo || null,
      buyerComments: rfq?.buyerComments || null,

      // Workflow Management (matching schema)
      selectedQuoteId: rfq?.selectedQuoteId || null,

      // Timestamps (matching schema)
      sentAt: rfq?.sentAt ? new Date(rfq.sentAt) : null,
    };
  });

  const isAdd = DialogType === 'add';
  const isEdit = DialogType === 'edit';

  // Track the previous RFQ ID to prevent unnecessary updates
  const previousRfqIdRef = useRef<string | null>(null);

  // Helper function to create form data from RFQ (not memoized to avoid stale closures)
  const createFormDataFromRfq = (rfqData: Rfq | null) => {
    return {
      // RFQ Identification (matching schema)
      direction: rfqData?.direction || null,
      rfqNumber: rfqData?.rfqNumber || null,
      processStatus: rfqData?.processStatus || 'pending',

      // Vendor Information (matching schema)
      vendorName: rfqData?.vendorName || null,
      vendorAddress: rfqData?.vendorAddress || null,
      vendorContactName: rfqData?.vendorContactName || null,
      vendorContactEmail: rfqData?.vendorContactEmail || null,
      vendorContactPhone: rfqData?.vendorContactPhone || null,

      // Part Specifications (matching schema)
      partNumber: rfqData?.partNumber || null,
      altPartNumber: rfqData?.altPartNumber || null,
      partDescription: rfqData?.partDescription || null,
      conditionCode: rfqData?.conditionCode || null,
      unitOfMeasure: rfqData?.unitOfMeasure || null,
      quantity: rfqData?.quantity || null,

      // Commercial Terms (matching schema)
      pricingType: rfqData?.pricingType || null,
      urgencyLevel: rfqData?.urgencyLevel || null,
      deliverTo: rfqData?.deliverTo || null,
      buyerComments: rfqData?.buyerComments || null,

      // Workflow Management (matching schema)
      selectedQuoteId: rfqData?.selectedQuoteId || null,

      // Timestamps (matching schema)
      sentAt: rfqData?.sentAt ? new Date(rfqData.sentAt) : null,
    };
  };

  // Only update formData when RFQ ID actually changes
  useEffect(() => {
    const currentRfqId = rfq?.id || null;

    // Only update if the RFQ ID has actually changed
    if (currentRfqId !== previousRfqIdRef.current) {
      setFormData(createFormDataFromRfq(rfq));
      previousRfqIdRef.current = currentRfqId;
    }
  }, [rfq?.id]);

  // ONLY update when dialog opens AND it's a different RFQ than what we last processed
  useEffect(() => {
    if (open === true) {
      const currentRfqId = rfq?.id || null;
      if (currentRfqId !== previousRfqIdRef.current) {
        setFormData(createFormDataFromRfq(rfq));
        previousRfqIdRef.current = currentRfqId;
      } else {
        console.log('RfqDialog: Dialog opened with same RFQ ID, skipping update');
      }
    }
  }, [open]);

  const handleFieldChange = (field: string, value: string | boolean | number | Date | null) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    try {
      let savedRfq: Rfq;

      // Serialize dates to ISO strings before sending
      const serializedFormData = serializeDatesForAPI(formData, ['sentAt']);

      if (isAdd) {
        // Create new RFQ (orgId and userId are handled server-side)
        const createData: RfqCreateInput = {
          direction: serializedFormData.direction,
          rfqNumber: serializedFormData.rfqNumber,
          vendorName: serializedFormData.vendorName,
          vendorAddress: serializedFormData.vendorAddress,
          vendorContactName: serializedFormData.vendorContactName,
          vendorContactEmail: serializedFormData.vendorContactEmail,
          vendorContactPhone: serializedFormData.vendorContactPhone,
          partNumber: serializedFormData.partNumber,
          altPartNumber: serializedFormData.altPartNumber,
          partDescription: serializedFormData.partDescription,
          conditionCode: serializedFormData.conditionCode,
          unitOfMeasure: serializedFormData.unitOfMeasure,
          quantity: serializedFormData.quantity,
          pricingType: serializedFormData.pricingType,
          urgencyLevel: serializedFormData.urgencyLevel,
          deliverTo: serializedFormData.deliverTo,
          buyerComments: serializedFormData.buyerComments,
          processStatus: serializedFormData.processStatus,
          selectedQuoteId: serializedFormData.selectedQuoteId,
          sentAt: serializedFormData.sentAt?.toISOString() || null,
        };
        savedRfq = await rfqClient.createRfq(createData);
        toast.success('RFQ created successfully');
      } else {
        // Update existing RFQ
        if (!rfq?.id) {
          throw new Error('RFQ ID is required for updates');
        }
        const updateData: RfqUpdateInput = {
          direction: serializedFormData.direction,
          rfqNumber: serializedFormData.rfqNumber,
          vendorName: serializedFormData.vendorName,
          vendorAddress: serializedFormData.vendorAddress,
          vendorContactName: serializedFormData.vendorContactName,
          vendorContactEmail: serializedFormData.vendorContactEmail,
          vendorContactPhone: serializedFormData.vendorContactPhone,
          partNumber: serializedFormData.partNumber,
          altPartNumber: serializedFormData.altPartNumber,
          partDescription: serializedFormData.partDescription,
          conditionCode: serializedFormData.conditionCode,
          unitOfMeasure: serializedFormData.unitOfMeasure,
          quantity: serializedFormData.quantity,
          pricingType: serializedFormData.pricingType,
          urgencyLevel: serializedFormData.urgencyLevel,
          deliverTo: serializedFormData.deliverTo,
          buyerComments: serializedFormData.buyerComments,
          processStatus: serializedFormData.processStatus,
        };
        savedRfq = await rfqClient.updateRfq(rfq.id, updateData);
        toast.success('RFQ updated successfully');
      }

      // Call onChange to update parent with new data
      onChange(savedRfq);
    } catch (error) {
      const action = isAdd ? 'create' : 'update';
      toast.error(`Failed to ${action} RFQ`);
      console.error(`Error ${action}ing RFQ:`, error);
      throw error; // Re-throw to let Dialog component handle loading state
    }
  };

  const handleCancel = () => {
    if (isAdd) {
      // Reset to empty form for add mode
      setFormData(createFormDataFromRfq(null));
    } else {
      // Reset to original RFQ data for edit/view mode
      setFormData(createFormDataFromRfq(rfq));
    }
  };

  const handleReset = () => {
    // Always reset to empty form for reset operation
    setFormData(createFormDataFromRfq(null));
  };

  const dialogTitle = isAdd ? 'Add New RFQ' : rfq?.rfqNumber || 'RFQ Details';

  return (
    <DetailDialog
      trigger={trigger ? trigger : null}
      headerGradient="from-purple-500 to-purple-500"
      title={dialogTitle}
      onSave={handleSave}
      onCancel={handleCancel}
      onReset={handleReset}
      DialogType={DialogType}
      open={open}
      onOpenChange={onOpenChange}
    >
      {(isEditing) => (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <BaseCard title="RFQ Information" neutralHeader={true}>
            <div className="flex flex-col justify-between">
              <KeyValuePair
                label="Direction"
                value={formData.direction}
                valueType="select"
                editMode={isEditing}
                onChange={(value) => handleFieldChange('direction', value)}
                name="direction"
                selectOptions={Object.values(OrderDirectionEnum.enumValues).map((direction) => ({
                  value: direction,
                  label: orderDirectionDisplayMap[direction as OrderDirection],
                }))}
              />
              <KeyValuePair
                label="RFQ Number"
                value={formData.rfqNumber}
                valueType="string"
                editMode={isEditing}
                onChange={(value) => handleFieldChange('rfqNumber', value)}
                name="rfqNumber"
              />
              <KeyValuePair
                label="Status"
                value={formData.processStatus}
                valueType="select"
                editMode={isEditing}
                onChange={(value) => handleFieldChange('processStatus', value)}
                name="processStatus"
                selectOptions={Object.values(ProcessStatusEnum.enumValues).map((status) => ({
                  value: status,
                  label: getProcessStatusDisplay(status),
                }))}
              />
              <KeyValuePair
                label="Urgency Level"
                value={formData.urgencyLevel}
                valueType="select"
                editMode={isEditing}
                onChange={(value) => handleFieldChange('urgencyLevel', value)}
                name="urgencyLevel"
                selectOptions={Object.values(UrgencyLevelEnum.enumValues).map((level) => ({
                  value: level,
                  label: getUrgencyLevelDisplay(level as UrgencyLevel),
                }))}
              />
              <KeyValuePair
                label="Sent At"
                value={formData.sentAt?.toISOString().split('T')[0] || ''}
                valueType="date"
                editMode={isEditing}
                onChange={(value) =>
                  handleFieldChange('sentAt', value ? new Date(value as string) : null)
                }
                name="sentAt"
              />
            </div>
          </BaseCard>

          <BaseCard title="Vendor Information" neutralHeader={true}>
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
            </div>
          </BaseCard>

          <BaseCard title="Part Specifications" neutralHeader={true}>
            <div className="flex flex-col justify-between">
              <KeyValuePair
                label="Part Number"
                value={formData.partNumber}
                valueType="string"
                editMode={isEditing}
                onChange={(value) => handleFieldChange('partNumber', value)}
                name="partNumber"
              />
              <KeyValuePair
                label="Alt Part Number"
                value={formData.altPartNumber}
                valueType="string"
                editMode={isEditing}
                onChange={(value) => handleFieldChange('altPartNumber', value)}
                name="altPartNumber"
              />
              <KeyValuePair
                label="Part Description"
                value={formData.partDescription}
                valueType="string"
                editMode={isEditing}
                onChange={(value) => handleFieldChange('partDescription', value)}
                name="partDescription"
              />
              <KeyValuePair
                label="Condition Code"
                value={formData.conditionCode}
                valueType="string"
                editMode={isEditing}
                onChange={(value) => handleFieldChange('conditionCode', value)}
                name="conditionCode"
              />
              <KeyValuePair
                label="Unit of Measure"
                value={formData.unitOfMeasure}
                valueType="string"
                editMode={isEditing}
                onChange={(value) => handleFieldChange('unitOfMeasure', value)}
                name="unitOfMeasure"
              />
              <KeyValuePair
                label="Quantity"
                value={formData.quantity}
                valueType="number"
                editMode={isEditing}
                onChange={(value) => handleFieldChange('quantity', value)}
                name="quantity"
                min={1}
              />
            </div>
          </BaseCard>

          <BaseCard title="Commercial Terms" neutralHeader={true}>
            <div className="flex flex-col justify-between">
              <KeyValuePair
                label="Pricing Type"
                value={formData.pricingType}
                valueType="string"
                editMode={isEditing}
                onChange={(value) => handleFieldChange('pricingType', value)}
                name="pricingType"
              />
              <KeyValuePair
                label="Deliver To"
                value={formData.deliverTo}
                valueType="string"
                editMode={isEditing}
                onChange={(value) => handleFieldChange('deliverTo', value)}
                name="deliverTo"
              />
              <KeyValuePair
                label="Buyer Comments"
                value={formData.buyerComments}
                valueType="string"
                editMode={isEditing}
                onChange={(value) => handleFieldChange('buyerComments', value)}
                name="buyerComments"
              />
            </div>
          </BaseCard>
        </div>
      )}
    </DetailDialog>
  );
}
