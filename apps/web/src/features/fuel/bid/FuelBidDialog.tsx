'use client';

import { decisionDisplayMap } from '@/drizzle/schema/enums';
import type { FuelBid, NewFuelBid, UpdateFuelBid } from '@/drizzle/types';
import { BASE_UOM_OPTIONS } from '@/lib/constants/units';
import { createFuelBid, updateFuelBid } from '@/services/fuel/fuel-bid-client';
import { Button } from '@/stories/Button/Button';
import { MainCard } from '@/stories/Card/Card';
import { DetailDialog } from '@/stories/Dialog/Dialog';
import { KeyValuePair } from '@/stories/KeyValuePair/KeyValuePair';
import { Pencil, Plus } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

export default function FuelBidDialog({
  bid,
  tenderId,
  onChange,
  DialogType = 'view',
  triggerClassName,
  buttonSize = 'md',
}: {
  bid: FuelBid | null;
  tenderId?: string; // Required when DialogType is 'add'
  onChange: (bid: FuelBid) => void;
  DialogType: 'add' | 'edit' | 'view';
  triggerClassName?: string;
  buttonSize?: 'sm' | 'md' | 'lg';
}) {
  const [formData, setFormData] = useState({
    // Bid Information & Timeline
    title: bid?.title || null,
    round: bid?.round || null,
    bidSubmittedAt: bid?.bidSubmittedAt || null,
    aiSummary: bid?.aiSummary || null,
    decision: bid?.decision || null,
    decisionNotes: bid?.decisionNotes || null,

    // Vendor Information
    vendorName: bid?.vendorName || null,
    vendorAddress: bid?.vendorAddress || null,
    vendorContactName: bid?.vendorContactName || null,
    vendorContactEmail: bid?.vendorContactEmail || null,
    vendorContactPhone: bid?.vendorContactPhone || null,
    vendorComments: bid?.vendorComments || null,

    // Pricing Structure & Terms
    priceType: bid?.priceType || null, // fixed, index_formula
    currency: bid?.currency || 'USD',
    uom: bid?.uom || 'USG',
    paymentTerms: bid?.paymentTerms || null,

    // Fixed Pricing
    baseUnitPrice: bid?.baseUnitPrice || null,

    // Index-Linked Pricing
    indexName: bid?.indexName || null,
    indexLocation: bid?.indexLocation || null,
    differential: bid?.differential || null,
    differentialUnit: bid?.differentialUnit || null,
    formulaNotes: bid?.formulaNotes || null,

    // Fees & Specifications
    intoPlaneFee: bid?.intoPlaneFee || null,
    handlingFee: bid?.handlingFee || null,
    otherFee: bid?.otherFee || null,
    otherFeeDescription: bid?.otherFeeDescription || null,
    includesTaxes: bid?.includesTaxes || false,
    includesAirportFees: bid?.includesAirportFees || false,
    densityAt15C: bid?.densityAt15C || null,
    normalizedUnitPriceUsdPerUsg: bid?.normalizedUnitPriceUsdPerUsg || null,
  });
  const [isSaving, setIsSaving] = useState(false);
  const isAdd = DialogType === 'add';
  const isEdit = DialogType === 'edit';

  // Update formData when bid prop changes
  useEffect(() => {
    setFormData({
      // Bid Information & Timeline
      title: bid?.title || null,
      round: bid?.round || null,
      bidSubmittedAt: bid?.bidSubmittedAt || null,
      aiSummary: bid?.aiSummary || null,
      decision: bid?.decision || null,
      decisionNotes: bid?.decisionNotes || null,

      // Vendor Information
      vendorName: bid?.vendorName || null,
      vendorAddress: bid?.vendorAddress || null,
      vendorContactName: bid?.vendorContactName || null,
      vendorContactEmail: bid?.vendorContactEmail || null,
      vendorContactPhone: bid?.vendorContactPhone || null,
      vendorComments: bid?.vendorComments || null,

      // Pricing Structure & Terms
      priceType: bid?.priceType || null,
      currency: bid?.currency || 'USD',
      uom: bid?.uom || 'USG',
      paymentTerms: bid?.paymentTerms || null,

      // Fixed Pricing
      baseUnitPrice: bid?.baseUnitPrice || null,

      // Index-Linked Pricing
      indexName: bid?.indexName || null,
      indexLocation: bid?.indexLocation || null,
      differential: bid?.differential || null,
      differentialUnit: bid?.differentialUnit || null,
      formulaNotes: bid?.formulaNotes || null,

      // Fees & Specifications
      intoPlaneFee: bid?.intoPlaneFee || null,
      handlingFee: bid?.handlingFee || null,
      otherFee: bid?.otherFee || null,
      otherFeeDescription: bid?.otherFeeDescription || null,
      includesTaxes: bid?.includesTaxes || false,
      includesAirportFees: bid?.includesAirportFees || false,
      densityAt15C: bid?.densityAt15C || null,
      normalizedUnitPriceUsdPerUsg: bid?.normalizedUnitPriceUsdPerUsg || null,
    });
  }, [bid]);

  const handleFieldChange = (field: string, value: string | boolean | number | Date | null) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      let savedBid: FuelBid;

      if (isAdd) {
        // Create new bid
        if (!tenderId) {
          throw new Error('Tender ID is required when creating a new bid');
        }
        const createData: NewFuelBid = {
          tenderId,
          ...formData,
        };
        savedBid = await createFuelBid(tenderId, createData);
        toast.success('Fuel bid created successfully');
      } else {
        // Update existing bid
        if (!bid?.id) {
          throw new Error('Bid ID is required for updates');
        }
        const updateData: UpdateFuelBid = formData;
        savedBid = await updateFuelBid(bid.id, updateData);
        toast.success('Fuel bid updated successfully');
      }

      // Call onChange to update parent with new data
      onChange(savedBid);
    } catch (error) {
      const action = isAdd ? 'create' : 'update';
      toast.error(`Failed to ${action} fuel bid`);
      console.error(`Error ${action}ing fuel bid:`, error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (isAdd) {
      setFormData({
        // Reset to default values
        title: null,
        round: null,
        bidSubmittedAt: null,
        aiSummary: null,
        decision: null,
        decisionNotes: null,
        vendorName: null,
        vendorAddress: null,
        vendorContactName: null,
        vendorContactEmail: null,
        vendorContactPhone: null,
        vendorComments: null,
        priceType: null,
        currency: 'USD',
        uom: 'USG',
        paymentTerms: null,
        baseUnitPrice: null,
        indexName: null,
        indexLocation: null,
        differential: null,
        differentialUnit: null,
        formulaNotes: null,
        intoPlaneFee: null,
        handlingFee: null,
        otherFee: null,
        otherFeeDescription: null,
        includesTaxes: false,
        includesAirportFees: false,
        densityAt15C: null,
        normalizedUnitPriceUsdPerUsg: null,
      });
    }
  };

  const triggerText = isAdd ? 'Add Bid' : isEdit ? 'Edit' : `View`;
  const dialogTitle = isAdd ? 'Add New Fuel Bid' : bid?.title || 'Fuel Bid Details';
  const saveButtonText = isAdd ? 'Create Bid' : 'Save Changes';

  return (
    <DetailDialog
      trigger={
        <Button
          intent={'secondary'}
          text={triggerText}
          icon={isAdd ? Plus : DialogType === 'edit' ? Pencil : undefined}
          size={buttonSize}
          className={triggerClassName}
        />
      }
      headerGradient="from-pink-500 to-pink-500"
      title={dialogTitle}
      onSave={handleSave}
      onCancel={handleCancel}
      DialogType={DialogType}
    >
      {(isEditing) => (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Bid Information & Timeline */}
          <MainCard title="Bid Information & Timeline" headerGradient="from-pink-600 to-pink-400">
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
                label="Round"
                value={formData.round}
                valueType="number"
                editMode={isEditing}
                onChange={(value) => handleFieldChange('round', value)}
                name="round"
                min={1}
                max={5}
              />
              <KeyValuePair
                label="Bid Submitted At"
                value={formData.bidSubmittedAt}
                valueType="date"
                editMode={isEditing}
                onChange={(value) => handleFieldChange('bidSubmittedAt', value)}
                name="bidSubmittedAt"
              />
              <KeyValuePair
                label="Decision"
                value={formData.decision}
                valueType="select"
                editMode={isEditing}
                onChange={(value) => handleFieldChange('decision', value)}
                name="decis ion"
                selectOptions={Object.entries(decisionDisplayMap).map(([key, value]) => ({
                  label: value,
                  value: key,
                }))}
              />
              <KeyValuePair
                label="Decision Notes"
                value={formData.decisionNotes}
                valueType="string"
                editMode={isEditing}
                onChange={(value) => handleFieldChange('decisionNotes', value)}
                name="decisionNotes"
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
          </MainCard>

          {/* Vendor Information */}
          <MainCard title="Vendor Information" headerGradient="from-pink-600 to-pink-400">
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

          {/* Pricing Structure & Terms */}
          <MainCard title="Pricing Structure & Terms" headerGradient="from-pink-600 to-pink-400">
            <div className="flex flex-col justify-between">
              <KeyValuePair
                label="Price Type"
                value={formData.priceType}
                valueType="string"
                editMode={isEditing}
                onChange={(value) => handleFieldChange('priceType', value)}
                name="priceType"
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
                label="Unit of Measure"
                value={formData.uom}
                valueType="select"
                editMode={isEditing}
                onChange={(value) => handleFieldChange('uom', value)}
                name="uom"
                selectOptions={Object.entries(BASE_UOM_OPTIONS).map(([key, value]) => ({
                  label: value.label,
                  value: key,
                }))}
              />
              <KeyValuePair
                label="Payment Terms"
                value={formData.paymentTerms}
                valueType="string"
                editMode={isEditing}
                onChange={(value) => handleFieldChange('paymentTerms', value)}
                name="paymentTerms"
              />
              <KeyValuePair
                label="Base Unit Price"
                value={formData.baseUnitPrice}
                valueType="number"
                editMode={isEditing}
                onChange={(value) => handleFieldChange('baseUnitPrice', value)}
                name="baseUnitPrice"
              />
              <KeyValuePair
                label="Index Name"
                value={formData.indexName}
                valueType="string"
                editMode={isEditing}
                onChange={(value) => handleFieldChange('indexName', value)}
                name="indexName"
              />
              <KeyValuePair
                label="Index Location"
                value={formData.indexLocation}
                valueType="string"
                editMode={isEditing}
                onChange={(value) => handleFieldChange('indexLocation', value)}
                name="indexLocation"
              />
              <KeyValuePair
                label="Differential"
                value={formData.differential}
                valueType="number"
                editMode={isEditing}
                onChange={(value) => handleFieldChange('differential', value)}
                name="differential"
              />
              <KeyValuePair
                label="Differential Unit"
                value={formData.differentialUnit}
                valueType="string"
                editMode={isEditing}
                onChange={(value) => handleFieldChange('differentialUnit', value)}
                name="differentialUnit"
              />
              <KeyValuePair
                label="Formula Notes"
                value={formData.formulaNotes}
                valueType="string"
                editMode={isEditing}
                onChange={(value) => handleFieldChange('formulaNotes', value)}
                name="formulaNotes"
              />
            </div>
          </MainCard>

          {/* Fees & Specifications */}
          <MainCard title="Fees & Specifications" headerGradient="from-pink-600 to-pink-400">
            <div className="flex flex-col justify-between">
              <KeyValuePair
                label="Into Plane Fee"
                value={formData.intoPlaneFee}
                valueType="number"
                editMode={isEditing}
                onChange={(value) => handleFieldChange('intoPlaneFee', value)}
                name="intoPlaneFee"
              />
              <KeyValuePair
                label="Handling Fee"
                value={formData.handlingFee}
                valueType="number"
                editMode={isEditing}
                onChange={(value) => handleFieldChange('handlingFee', value)}
                name="handlingFee"
              />
              <KeyValuePair
                label="Other Fee"
                value={formData.otherFee}
                valueType="number"
                editMode={isEditing}
                onChange={(value) => handleFieldChange('otherFee', value)}
                name="otherFee"
              />
              <KeyValuePair
                label="Other Fee Description"
                value={formData.otherFeeDescription}
                valueType="string"
                editMode={isEditing}
                onChange={(value) => handleFieldChange('otherFeeDescription', value)}
                name="otherFeeDescription"
              />
              <KeyValuePair
                label="Includes Taxes"
                value={formData.includesTaxes}
                valueType="boolean"
                editMode={isEditing}
                onChange={(value) => handleFieldChange('includesTaxes', value)}
                name="includesTaxes"
              />
              <KeyValuePair
                label="Includes Airport Fees"
                value={formData.includesAirportFees}
                valueType="boolean"
                editMode={isEditing}
                onChange={(value) => handleFieldChange('includesAirportFees', value)}
                name="includesAirportFees"
              />
              <KeyValuePair
                label="Density at 15°C"
                value={formData.densityAt15C}
                valueType="number"
                editMode={isEditing}
                onChange={(value) => handleFieldChange('densityAt15C', value)}
                name="densityAt15C"
              />
              <KeyValuePair
                label="Normalized USD per USG"
                value={formData.normalizedUnitPriceUsdPerUsg}
                valueType="number"
                editMode={isEditing}
                onChange={(value) => handleFieldChange('normalizedUnitPriceUsdPerUsg', value)}
                name="normalizedUnitPriceUsdPerUsg"
              />
            </div>
          </MainCard>
        </div>
      )}
    </DetailDialog>
  );
}
