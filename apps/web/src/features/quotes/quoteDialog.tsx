'use client';

import type { Quote, Rfq } from '@/drizzle/types';
import { serializeQuoteDates } from '@/lib/utils/date-helpers';
import { createQuote, updateQuote, type CreateQuoteData } from '@/services/technical/quote-client';
import { Button } from '@/stories/Button/Button';
import { ContentSection } from '@/stories/Card/Card';
import { DetailDialog } from '@/stories/Dialog/Dialog';
import { KeyValuePair } from '@/stories/Utilities/KeyValuePair';
import { Pencil, Plus } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

export default function QuoteDialog({
  quote,
  rfqId,
  onChange,
  DialogType = 'view',
  triggerClassName,
  buttonSize = 'md',
}: {
  quote: Quote | null;
  rfqId?: Rfq['id']; // Required when isNew is true
  onChange: (quote: Quote) => void;
  DialogType: 'add' | 'edit' | 'view';
  triggerClassName?: string;
  buttonSize?: 'sm' | 'md' | 'lg';
}) {
  const [formData, setFormData] = useState({
    rfqNumber: quote?.rfqNumber || null,
    direction: quote?.direction || null,
    vendorName: quote?.vendorName || null,
    vendorAddress: quote?.vendorAddress || null,
    vendorContactName: quote?.vendorContactName || null,
    vendorContactEmail: quote?.vendorContactEmail || null,
    vendorContactPhone: quote?.vendorContactPhone || null,
    partNumber: quote?.partNumber || null,
    serialNumber: quote?.serialNumber || null,
    partDescription: quote?.partDescription || null,
    partCondition: quote?.partCondition || null,
    unitOfMeasure: quote?.unitOfMeasure || null,
    quantity: quote?.quantity || null,
    price: quote?.price || null,
    currency: quote?.currency || null,
    pricingType: quote?.pricingType || null,
    pricingMethod: quote?.pricingMethod || null,
    coreDue: quote?.coreDue || null,
    coreChange: quote?.coreChange || null,
    paymentTerms: quote?.paymentTerms || null,
    minimumOrderQuantity: quote?.minimumOrderQuantity || null,
    leadTime: quote?.leadTime || null,
    deliveryTerms: quote?.deliveryTerms || null,
    warranty: quote?.warranty || null,
    quoteExpirationDate: quote?.quoteExpirationDate || null,
    certifications: quote?.certifications || [],
    traceTo: quote?.traceTo || null,
    tagType: quote?.tagType || null,
    taggedBy: quote?.taggedBy || null,
    taggedDate: quote?.taggedDate || null,
    vendorComments: quote?.vendorComments || null,
    status: quote?.status || 'pending',
    receivedAt: quote?.receivedAt || null,
  });
  const [isSaving, setIsSaving] = useState(false);
  const isAdd = DialogType === 'add';
  const isEdit = DialogType === 'edit';

  // Update formData when quote prop changes
  useEffect(() => {
    setFormData({
      rfqNumber: quote?.rfqNumber || null,
      direction: quote?.direction || null,
      vendorName: quote?.vendorName || null,
      vendorAddress: quote?.vendorAddress || null,
      vendorContactName: quote?.vendorContactName || null,
      vendorContactEmail: quote?.vendorContactEmail || null,
      vendorContactPhone: quote?.vendorContactPhone || null,
      partNumber: quote?.partNumber || null,
      serialNumber: quote?.serialNumber || null,
      partDescription: quote?.partDescription || null,
      partCondition: quote?.partCondition || null,
      unitOfMeasure: quote?.unitOfMeasure || null,
      quantity: quote?.quantity || null,
      price: quote?.price || null,
      currency: quote?.currency || null,
      pricingType: quote?.pricingType || null,
      pricingMethod: quote?.pricingMethod || null,
      coreDue: quote?.coreDue || null,
      coreChange: quote?.coreChange || null,
      paymentTerms: quote?.paymentTerms || null,
      minimumOrderQuantity: quote?.minimumOrderQuantity || null,
      leadTime: quote?.leadTime || null,
      deliveryTerms: quote?.deliveryTerms || null,
      warranty: quote?.warranty || null,
      quoteExpirationDate: quote?.quoteExpirationDate || null,
      certifications: quote?.certifications || [],
      traceTo: quote?.traceTo || null,
      tagType: quote?.tagType || null,
      taggedBy: quote?.taggedBy || null,
      taggedDate: quote?.taggedDate || null,
      vendorComments: quote?.vendorComments || null,
      status: quote?.status || 'pending',
      receivedAt: quote?.receivedAt || null,
    });
  }, [quote]);

  const handleFieldChange = (
    field: string,
    value: string | boolean | number | Date | string[] | null,
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      let savedQuote: Quote;

      // Serialize dates to ISO strings before sending
      const serializedFormData = serializeQuoteDates(formData);

      if (isAdd) {
        // Create new quote (rfqId must be provided)
        if (!rfqId) {
          throw new Error('RFQ ID is required when creating a new quote');
        }
        const createData: CreateQuoteData = {
          rfqId,
          rfqNumber: serializedFormData.rfqNumber,
          direction: serializedFormData.direction,
          vendorName: serializedFormData.vendorName,
          vendorAddress: serializedFormData.vendorAddress,
          vendorContactName: serializedFormData.vendorContactName,
          vendorContactEmail: serializedFormData.vendorContactEmail,
          vendorContactPhone: serializedFormData.vendorContactPhone,
          partNumber: serializedFormData.partNumber,
          serialNumber: serializedFormData.serialNumber,
          partDescription: serializedFormData.partDescription,
          partCondition: serializedFormData.partCondition,
          unitOfMeasure: serializedFormData.unitOfMeasure,
          quantity: serializedFormData.quantity,
          price: serializedFormData.price,
          currency: serializedFormData.currency,
          pricingType: serializedFormData.pricingType,
          pricingMethod: serializedFormData.pricingMethod,
          coreDue: serializedFormData.coreDue,
          coreChange: serializedFormData.coreChange,
          paymentTerms: serializedFormData.paymentTerms,
          minimumOrderQuantity: serializedFormData.minimumOrderQuantity,
          leadTime: serializedFormData.leadTime,
          deliveryTerms: serializedFormData.deliveryTerms,
          warranty: serializedFormData.warranty,
          quoteExpirationDate: serializedFormData.quoteExpirationDate,
          certifications: serializedFormData.certifications,
          traceTo: serializedFormData.traceTo,
          tagType: serializedFormData.tagType,
          taggedBy: serializedFormData.taggedBy,
          taggedDate: serializedFormData.taggedDate,
          vendorComments: serializedFormData.vendorComments,
          status: serializedFormData.status,
          receivedAt: serializedFormData.receivedAt,
        };
        savedQuote = await createQuote(createData);
        toast.success('Quote created successfully');
      } else {
        // Update existing quote
        if (!quote?.id) {
          throw new Error('Quote ID is required for updates');
        }
        const updateData = {
          rfqNumber: serializedFormData.rfqNumber,
          direction: serializedFormData.direction,
          vendorName: serializedFormData.vendorName,
          vendorAddress: serializedFormData.vendorAddress,
          vendorContactName: serializedFormData.vendorContactName,
          vendorContactEmail: serializedFormData.vendorContactEmail,
          vendorContactPhone: serializedFormData.vendorContactPhone,
          partNumber: serializedFormData.partNumber,
          serialNumber: serializedFormData.serialNumber,
          partDescription: serializedFormData.partDescription,
          partCondition: serializedFormData.partCondition,
          unitOfMeasure: serializedFormData.unitOfMeasure,
          quantity: serializedFormData.quantity,
          price: serializedFormData.price,
          currency: serializedFormData.currency,
          pricingType: serializedFormData.pricingType,
          pricingMethod: serializedFormData.pricingMethod,
          coreDue: serializedFormData.coreDue,
          coreChange: serializedFormData.coreChange,
          paymentTerms: serializedFormData.paymentTerms,
          minimumOrderQuantity: serializedFormData.minimumOrderQuantity,
          leadTime: serializedFormData.leadTime,
          deliveryTerms: serializedFormData.deliveryTerms,
          warranty: serializedFormData.warranty,
          quoteExpirationDate: serializedFormData.quoteExpirationDate,
          certifications: serializedFormData.certifications,
          traceTo: serializedFormData.traceTo,
          tagType: serializedFormData.tagType,
          taggedBy: serializedFormData.taggedBy,
          taggedDate: serializedFormData.taggedDate,
          vendorComments: serializedFormData.vendorComments,
          status: serializedFormData.status,
          receivedAt: serializedFormData.receivedAt,
        };
        savedQuote = await updateQuote(quote.id, updateData);
        toast.success('Quote updated successfully');
      }

      // Call onChange to update parent with new data
      onChange(savedQuote);
    } catch (error) {
      const action = isAdd ? 'create' : 'update';
      toast.error(`Failed to ${action} quote`);
      console.error(`Error ${action}ing quote:`, error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (isAdd) {
      setFormData({
        rfqNumber: null,
        direction: null,
        vendorName: null,
        vendorAddress: null,
        vendorContactName: null,
        vendorContactEmail: null,
        vendorContactPhone: null,
        partNumber: null,
        serialNumber: null,
        partDescription: null,
        partCondition: null,
        unitOfMeasure: null,
        quantity: null,
        price: null,
        currency: null,
        pricingType: null,
        pricingMethod: null,
        coreDue: null,
        coreChange: null,
        paymentTerms: null,
        minimumOrderQuantity: null,
        leadTime: null,
        deliveryTerms: null,
        warranty: null,
        quoteExpirationDate: null,
        certifications: [],
        traceTo: null,
        tagType: null,
        taggedBy: null,
        taggedDate: null,
        vendorComments: null,
        status: 'pending',
        receivedAt: null,
      });
    }
  };

  const triggerText = isAdd
    ? 'Add Quote'
    : isEdit
      ? 'Edit'
      : `View ${quote?.partNumber || 'Quote'}`;
  const dialogTitle = isAdd ? 'Add New Quote' : quote?.partNumber || 'Quote Details';
  const saveButtonText = isAdd ? 'Create Quote' : 'Save Changes';

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
      headerGradient="from-green-500 to-green-500"
      title={dialogTitle}
      onSave={handleSave}
      onCancel={handleCancel}
      initialEditing={isEdit || isAdd}
      saveButtonText={saveButtonText}
    >
      {(isEditing) => (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ContentSection
            header="Quote Information"
            headerGradient="from-green-500 to-green-300"
            children={
              <div className="flex flex-col justify-between space-y-4">
                <KeyValuePair
                  label="RFQ Number"
                  value={formData.rfqNumber}
                  valueType="string"
                  editMode={isEditing}
                  onChange={(value) => handleFieldChange('rfqNumber', value)}
                  name="rfqNumber"
                />
                <KeyValuePair
                  label="Direction"
                  value={formData.direction}
                  valueType="select"
                  editMode={isEditing}
                  onChange={(value) => handleFieldChange('direction', value)}
                  name="direction"
                  selectOptions={[
                    { value: 'sent', label: 'Sent' },
                    { value: 'received', label: 'Received' },
                  ]}
                />
                <KeyValuePair
                  label="Status"
                  value={formData.status}
                  valueType="select"
                  editMode={isEditing}
                  onChange={(value) => handleFieldChange('status', value)}
                  name="status"
                  selectOptions={[
                    { value: 'pending', label: 'Pending' },
                    { value: 'in_progress', label: 'In Progress' },
                    { value: 'completed', label: 'Completed' },
                    { value: 'cancelled', label: 'Cancelled' },
                  ]}
                />
                <KeyValuePair
                  label="Received At"
                  value={formData.receivedAt}
                  valueType="date"
                  editMode={isEditing}
                  onChange={(value) => handleFieldChange('receivedAt', value)}
                  name="receivedAt"
                />
              </div>
            }
          />
          <ContentSection
            header="Vendor Information"
            headerGradient="from-green-500 to-green-300"
            children={
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
            }
          />
          <ContentSection
            header="Part Details"
            headerGradient="from-green-500 to-green-300"
            children={
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
                  label="Serial Number"
                  value={formData.serialNumber}
                  valueType="string"
                  editMode={isEditing}
                  onChange={(value) => handleFieldChange('serialNumber', value)}
                  name="serialNumber"
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
                  label="Part Condition"
                  value={formData.partCondition}
                  valueType="string"
                  editMode={isEditing}
                  onChange={(value) => handleFieldChange('partCondition', value)}
                  name="partCondition"
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
                />
              </div>
            }
          />
          <ContentSection
            header="Pricing & Commercial Terms"
            headerGradient="from-green-500 to-green-300"
            children={
              <div className="flex flex-col justify-between space-y-4">
                <KeyValuePair
                  label="Price"
                  value={formData.price}
                  valueType="string"
                  editMode={isEditing}
                  onChange={(value) => handleFieldChange('price', value)}
                  name="price"
                />
                <KeyValuePair
                  label="Currency"
                  value={formData.currency}
                  valueType="string"
                  editMode={isEditing}
                  onChange={(value) => handleFieldChange('currency', value)}
                  name="currency"
                />
                <KeyValuePair
                  label="Pricing Type"
                  value={formData.pricingType}
                  valueType="string"
                  editMode={isEditing}
                  onChange={(value) => handleFieldChange('pricingType', value)}
                  name="pricingType"
                />
                <KeyValuePair
                  label="Pricing Method"
                  value={formData.pricingMethod}
                  valueType="string"
                  editMode={isEditing}
                  onChange={(value) => handleFieldChange('pricingMethod', value)}
                  name="pricingMethod"
                />
                <KeyValuePair
                  label="Core Due"
                  value={formData.coreDue}
                  valueType="string"
                  editMode={isEditing}
                  onChange={(value) => handleFieldChange('coreDue', value)}
                  name="coreDue"
                />
                <KeyValuePair
                  label="Core Change"
                  value={formData.coreChange}
                  valueType="string"
                  editMode={isEditing}
                  onChange={(value) => handleFieldChange('coreChange', value)}
                  name="coreChange"
                />
              </div>
            }
          />
          <ContentSection
            header="Delivery & Terms"
            headerGradient="from-green-500 to-green-300"
            children={
              <div className="flex flex-col justify-between space-y-4">
                <KeyValuePair
                  label="Payment Terms"
                  value={formData.paymentTerms}
                  valueType="string"
                  editMode={isEditing}
                  onChange={(value) => handleFieldChange('paymentTerms', value)}
                  name="paymentTerms"
                />
                <KeyValuePair
                  label="Min Order Qty"
                  value={formData.minimumOrderQuantity}
                  valueType="number"
                  editMode={isEditing}
                  onChange={(value) => handleFieldChange('minimumOrderQuantity', value)}
                  name="minimumOrderQuantity"
                />
                <KeyValuePair
                  label="Lead Time"
                  value={formData.leadTime}
                  valueType="string"
                  editMode={isEditing}
                  onChange={(value) => handleFieldChange('leadTime', value)}
                  name="leadTime"
                />
                <KeyValuePair
                  label="Delivery Terms"
                  value={formData.deliveryTerms}
                  valueType="string"
                  editMode={isEditing}
                  onChange={(value) => handleFieldChange('deliveryTerms', value)}
                  name="deliveryTerms"
                />
                <KeyValuePair
                  label="Warranty"
                  value={formData.warranty}
                  valueType="string"
                  editMode={isEditing}
                  onChange={(value) => handleFieldChange('warranty', value)}
                  name="warranty"
                />
                <KeyValuePair
                  label="Quote Expiration"
                  value={formData.quoteExpirationDate}
                  valueType="string"
                  editMode={isEditing}
                  onChange={(value) => handleFieldChange('quoteExpirationDate', value)}
                  name="quoteExpirationDate"
                />
              </div>
            }
          />
          <ContentSection
            header="Compliance & Traceability"
            headerGradient="from-green-500 to-green-300"
            children={
              <div className="flex flex-col justify-between space-y-4">
                <KeyValuePair
                  label="Trace To"
                  value={formData.traceTo}
                  valueType="string"
                  editMode={isEditing}
                  onChange={(value) => handleFieldChange('traceTo', value)}
                  name="traceTo"
                />
                <KeyValuePair
                  label="Tag Type"
                  value={formData.tagType}
                  valueType="string"
                  editMode={isEditing}
                  onChange={(value) => handleFieldChange('tagType', value)}
                  name="tagType"
                />
                <KeyValuePair
                  label="Tagged By"
                  value={formData.taggedBy}
                  valueType="string"
                  editMode={isEditing}
                  onChange={(value) => handleFieldChange('taggedBy', value)}
                  name="taggedBy"
                />
                <KeyValuePair
                  label="Tagged Date"
                  value={formData.taggedDate}
                  valueType="string"
                  editMode={isEditing}
                  onChange={(value) => handleFieldChange('taggedDate', value)}
                  name="taggedDate"
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
            }
          />
        </div>
      )}
    </DetailDialog>
  );
}
