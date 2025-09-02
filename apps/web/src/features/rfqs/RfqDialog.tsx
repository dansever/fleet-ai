// Updated by CursorAI on Dec 2 2024
'use client';

import {
  getStatusDisplay,
  getUrgencyLevelDisplay,
  OrderDirection,
  orderDirectionDisplayMap,
  OrderDirectionEnum,
  statusEnum,
  UrgencyLevel,
  urgencyLevelEnum,
} from '@/drizzle/schema/enums';
import type { Rfq } from '@/drizzle/types';
import { serializeRfqDates } from '@/lib/utils/date-helpers';
import { createRfq, CreateRfqData, updateRfq } from '@/services/technical/rfq-client';
import { Button, ButtonProps } from '@/stories/Button/Button';
import { MainCard } from '@/stories/Card/Card';
import { DetailDialog } from '@/stories/Dialog/Dialog';
import { KeyValuePair } from '@/stories/KeyValuePair/KeyValuePair';
import { Eye, Pencil, Plus } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

export default function RfqDialog({
  rfq,
  onChange,
  DialogType = 'view',
  triggerClassName,
  buttonSize = 'md',
  triggerText,
  open,
  onOpenChange,
  withTrigger = true,
  triggerIntent,
}: {
  rfq: Rfq | null;
  onChange: (rfq: Rfq) => void;
  DialogType: 'add' | 'edit' | 'view';
  triggerText?: string;
  triggerClassName?: string;
  buttonSize?: ButtonProps['size'];
  triggerIntent?: ButtonProps['intent'];
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  withTrigger?: boolean;
}) {
  const [formData, setFormData] = useState({
    // RFQ Identification (matching schema)
    direction: rfq?.direction || null,
    rfqNumber: rfq?.rfqNumber || null,
    status: rfq?.status || 'pending',

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
  });

  const isAdd = DialogType === 'add';
  const isEdit = DialogType === 'edit';

  // Update formData when rfq prop changes
  useEffect(() => {
    setFormData({
      direction: rfq?.direction || null,
      rfqNumber: rfq?.rfqNumber || null,
      status: rfq?.status || 'pending',
      vendorName: rfq?.vendorName || null,
      vendorAddress: rfq?.vendorAddress || null,
      vendorContactName: rfq?.vendorContactName || null,
      vendorContactEmail: rfq?.vendorContactEmail || null,
      vendorContactPhone: rfq?.vendorContactPhone || null,
      partNumber: rfq?.partNumber || null,
      altPartNumber: rfq?.altPartNumber || null,
      partDescription: rfq?.partDescription || null,
      conditionCode: rfq?.conditionCode || null,
      unitOfMeasure: rfq?.unitOfMeasure || null,
      quantity: rfq?.quantity || null,
      pricingType: rfq?.pricingType || null,
      urgencyLevel: rfq?.urgencyLevel || null,
      deliverTo: rfq?.deliverTo || null,
      buyerComments: rfq?.buyerComments || null,
      selectedQuoteId: rfq?.selectedQuoteId || null,
      sentAt: rfq?.sentAt ? new Date(rfq.sentAt) : null,
    });
  }, [rfq]);

  const handleFieldChange = (field: string, value: string | boolean | number | Date | null) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    try {
      let savedRfq: Rfq;

      // Serialize dates to ISO strings before sending
      const serializedFormData = serializeRfqDates(formData);

      if (isAdd) {
        // Create new RFQ (orgId and userId are handled server-side)
        const createData: CreateRfqData = {
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
          status: serializedFormData.status,
          selectedQuoteId: serializedFormData.selectedQuoteId,
          sentAt: serializedFormData.sentAt,
        };
        savedRfq = await createRfq(createData);
        toast.success('RFQ created successfully');
      } else {
        // Update existing RFQ
        if (!rfq?.id) {
          throw new Error('RFQ ID is required for updates');
        }
        const updateData = {
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
          status: serializedFormData.status,
          sentAt: serializedFormData.sentAt,
        };
        savedRfq = await updateRfq(rfq.id, updateData);
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
      setFormData({
        direction: null,
        rfqNumber: null,
        status: 'pending',
        vendorName: null,
        vendorAddress: null,
        vendorContactName: null,
        vendorContactEmail: null,
        vendorContactPhone: null,
        partNumber: null,
        altPartNumber: null,
        partDescription: null,
        conditionCode: null,
        unitOfMeasure: null,
        quantity: null,
        pricingType: null,
        urgencyLevel: null,
        deliverTo: null,
        buyerComments: null,
        selectedQuoteId: null,
        sentAt: null,
      });
    }
  };

  const handleReset = () => {
    setFormData({
      direction: null,
      rfqNumber: null,
      status: 'pending',
      vendorName: null,
      vendorAddress: null,
      vendorContactName: null,
      vendorContactEmail: null,
      vendorContactPhone: null,
      partNumber: null,
      altPartNumber: null,
      partDescription: null,
      conditionCode: null,
      unitOfMeasure: null,
      quantity: null,
      pricingType: null,
      urgencyLevel: null,
      deliverTo: null,
      buyerComments: null,
      selectedQuoteId: null,
      sentAt: null,
    });
  };

  const dialogTitle = isAdd ? 'Add New RFQ' : rfq?.rfqNumber || 'RFQ Details';

  return (
    <DetailDialog
      trigger={
        withTrigger ? (
          <Button
            intent={triggerIntent || (isAdd ? 'add' : isEdit ? 'secondary' : 'primary')}
            text={triggerText}
            icon={
              isAdd
                ? Plus
                : DialogType === 'edit'
                  ? Pencil
                  : DialogType === 'view'
                    ? Eye
                    : undefined
            }
            size={buttonSize}
            className={triggerClassName}
          />
        ) : null
      }
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
          <MainCard title="RFQ Information" neutralHeader={true}>
            <div className="flex flex-col justify-between space-y-4">
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
              <KeyValuePair
                label="Urgency Level"
                value={formData.urgencyLevel}
                valueType="select"
                editMode={isEditing}
                onChange={(value) => handleFieldChange('urgencyLevel', value)}
                name="urgencyLevel"
                selectOptions={Object.values(urgencyLevelEnum.enumValues).map((level) => ({
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
          </MainCard>

          <MainCard title="Vendor Information" neutralHeader={true}>
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
          </MainCard>

          <MainCard title="Part Specifications" neutralHeader={true}>
            <div className="flex flex-col justify-between space-y-4">
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
          </MainCard>

          <MainCard title="Commercial Terms" neutralHeader={true}>
            <div className="flex flex-col justify-between space-y-4">
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
          </MainCard>
        </div>
      )}
    </DetailDialog>
  );
}
