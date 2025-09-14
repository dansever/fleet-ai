// Updated by CursorAI on Sep 2 2025
'use client';

import { decisionDisplayMap } from '@/drizzle/enums';
import type { FuelBid, UpdateFuelBid } from '@/drizzle/types';
import { CURRENCY_MAP } from '@/lib/constants/currencies';
import { BASE_UOM_OPTIONS } from '@/lib/constants/units';
import { client as fuelBidClient } from '@/modules/fuel/bids';
import { CreateFuelBidData } from '@/modules/fuel/bids/bids.client';
import { FuelBidCreateInput } from '@/modules/fuel/bids/bids.types';
import { BaseCard } from '@/stories/Card/Card';
import { DetailDialog } from '@/stories/Dialog/Dialog';
import { KeyValuePair } from '@/stories/KeyValuePair/KeyValuePair';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

export default function FuelBidDialog({
  bid,
  tenderId,
  trigger,
  onChange,
  DialogType = 'view',
  open,
  onOpenChange,
}: {
  bid: FuelBid | null;
  tenderId?: string; // Required when DialogType is 'add'
  onChange: (bid: FuelBid) => void;
  DialogType: 'add' | 'edit' | 'view';
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  const [formData, setFormData] = useState({
    // Bid Information & Timeline (matching schema)
    title: bid?.title || null,
    round: bid?.round || null,
    bidSubmittedAt: bid?.bidSubmittedAt || null,

    // Vendor Information (matching schema)
    vendorName: bid?.vendorName || null,
    vendorAddress: bid?.vendorAddress || null,
    vendorContactName: bid?.vendorContactName || null,
    vendorContactEmail: bid?.vendorContactEmail || null,
    vendorContactPhone: bid?.vendorContactPhone || null,
    vendorComments: bid?.vendorComments || null,

    // Pricing Structure & Terms (matching schema)
    priceType: bid?.priceType || null, // fixed, index_formula
    currency: bid?.currency || null,
    uom: bid?.uom || null,
    paymentTerms: bid?.paymentTerms || null,

    // Fixed Pricing (matching schema)
    baseUnitPrice: bid?.baseUnitPrice || null,

    // Index-Linked Pricing (matching schema)
    indexName: bid?.indexName || null,
    indexLocation: bid?.indexLocation || null,
    differential: bid?.differential || null,
    differentialUnit: bid?.differentialUnit || null,
    formulaNotes: bid?.formulaNotes || null,

    // Fees & Charges (matching schema)
    intoPlaneFee: bid?.intoPlaneFee || null,
    handlingFee: bid?.handlingFee || null,
    otherFee: bid?.otherFee || null,
    otherFeeDescription: bid?.otherFeeDescription || null,

    // Inclusions & Exclusions (matching schema)
    includesTaxes: bid?.includesTaxes || false,
    includesAirportFees: bid?.includesAirportFees || false,

    // Calculated Fields (matching schema)
    densityAt15C: bid?.densityAt15C || null,
    normalizedUnitPriceUsdPerUsg: bid?.normalizedUnitPriceUsdPerUsg || null,

    // AI Processing (matching schema)
    aiSummary: bid?.aiSummary || null,

    // Decision Tracking (matching schema)
    decision: bid?.decision || null,
    decisionNotes: bid?.decisionNotes || null,
  });

  const isAdd = DialogType === 'add';
  const isEdit = DialogType === 'edit';

  // Update formData when bid prop changes
  useEffect(() => {
    setFormData({
      title: bid?.title || null,
      round: bid?.round || null,
      bidSubmittedAt: bid?.bidSubmittedAt || null,
      vendorName: bid?.vendorName || null,
      vendorAddress: bid?.vendorAddress || null,
      vendorContactName: bid?.vendorContactName || null,
      vendorContactEmail: bid?.vendorContactEmail || null,
      vendorContactPhone: bid?.vendorContactPhone || null,
      vendorComments: bid?.vendorComments || null,
      priceType: bid?.priceType || null,
      currency: bid?.currency || 'USD',
      uom: bid?.uom || 'USG',
      paymentTerms: bid?.paymentTerms || null,
      baseUnitPrice: bid?.baseUnitPrice || null,
      indexName: bid?.indexName || null,
      indexLocation: bid?.indexLocation || null,
      differential: bid?.differential || null,
      differentialUnit: bid?.differentialUnit || null,
      formulaNotes: bid?.formulaNotes || null,
      intoPlaneFee: bid?.intoPlaneFee || null,
      handlingFee: bid?.handlingFee || null,
      otherFee: bid?.otherFee || null,
      otherFeeDescription: bid?.otherFeeDescription || null,
      includesTaxes: bid?.includesTaxes || false,
      includesAirportFees: bid?.includesAirportFees || false,
      densityAt15C: bid?.densityAt15C || null,
      normalizedUnitPriceUsdPerUsg: bid?.normalizedUnitPriceUsdPerUsg || null,
      aiSummary: bid?.aiSummary || null,
      decision: bid?.decision || null,
      decisionNotes: bid?.decisionNotes || null,
    });
  }, [bid]);

  const handleFieldChange = (field: string, value: string | boolean | number | Date | null) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    try {
      let savedBid: FuelBid;

      if (isAdd) {
        // Create new bid
        if (!tenderId) {
          throw new Error('Tender ID is required when creating a new bid');
        }
        const createData: Partial<Omit<FuelBidCreateInput, 'id' | 'createdAt' | 'updatedAt'>> = {
          tenderId,
          vendorId: null, // Will be handled by backend if needed
          ...formData,
        };
        savedBid = await fuelBidClient.createFuelBid(tenderId, createData as CreateFuelBidData);
        toast.success('Fuel bid created successfully');
      } else {
        // Update existing bid
        if (!bid?.id) {
          throw new Error('Bid ID is required for updates');
        }
        const updateData: UpdateFuelBid = formData;
        savedBid = await fuelBidClient.updateFuelBid(bid.id, updateData);
        toast.success('Fuel bid updated successfully');
      }

      // Call onChange to update parent with new data
      onChange(savedBid);
    } catch (error) {
      const action = isAdd ? 'create' : 'update';
      toast.error(`Failed to ${action} fuel bid`);
      console.error(`Error ${action}ing fuel bid:`, error);
      throw error; // Re-throw to let Dialog component handle loading state
    }
  };

  const handleCancel = () => {
    if (isAdd) {
      setFormData({
        title: null,
        round: null,
        bidSubmittedAt: null,
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
        aiSummary: null,
        decision: null,
        decisionNotes: null,
      });
    }
  };

  const handleReset = () => {
    setFormData({
      title: null,
      round: null,
      bidSubmittedAt: null,
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
      aiSummary: null,
      decision: null,
      decisionNotes: null,
    });
  };

  const dialogTitle = isAdd ? 'Add New Fuel Bid' : bid?.title || 'Fuel Bid Details';

  return (
    <DetailDialog
      trigger={trigger ? trigger : null}
      headerGradient="from-pink-500 to-pink-500"
      title={dialogTitle}
      onSave={handleSave}
      onCancel={handleCancel}
      onReset={handleReset}
      DialogType={DialogType}
      open={open}
      onOpenChange={onOpenChange}
    >
      {(isEditing) => (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Bid Information & Timeline */}
          <BaseCard title="Bid Information & Timeline" neutralHeader={true}>
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
                label="Round"
                value={formData.round}
                valueType="number"
                editMode={isEditing}
                onChange={(value) => handleFieldChange('round', value)}
                name="round"
                min={1}
                max={10}
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
                name="decision"
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
          </BaseCard>

          {/* Vendor Information */}
          <BaseCard title="Vendor Information" neutralHeader={true}>
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
              <KeyValuePair
                label="Vendor Comments"
                value={formData.vendorComments}
                valueType="string"
                editMode={isEditing}
                onChange={(value) => handleFieldChange('vendorComments', value)}
                name="vendorComments"
              />
            </div>
          </BaseCard>

          {/* Pricing Structure & Terms */}
          <BaseCard title="Pricing Structure & Terms" neutralHeader={true}>
            <div className="flex flex-col justify-between space-y-4">
              <KeyValuePair
                label="Price Type"
                value={formData.priceType}
                valueType="select"
                editMode={isEditing}
                onChange={(value) => handleFieldChange('priceType', value)}
                name="priceType"
                selectOptions={[
                  { value: 'fixed', label: 'Fixed Price' },
                  { value: 'index_formula', label: 'Index Formula' },
                ]}
              />
              <KeyValuePair
                label="Currency"
                value={formData.currency}
                valueType="select"
                editMode={isEditing}
                onChange={(value) => handleFieldChange('currency', value)}
                name="currency"
                selectOptions={Object.entries(CURRENCY_MAP).map(([key, value]) => ({
                  label: value.display,
                  value: key,
                }))}
              />
              <KeyValuePair
                label="Unit of Measure"
                value={formData.uom}
                valueType="select"
                editMode={isEditing}
                onChange={(value) => handleFieldChange('uom', value)}
                name="uom"
                selectOptions={BASE_UOM_OPTIONS.map((uom) => ({
                  label: uom.label,
                  value: uom.value,
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
                step={0.01}
                min={0}
              />
            </div>
          </BaseCard>

          {/* Index-Linked Pricing */}
          <BaseCard title="Index-Linked Pricing" neutralHeader={true}>
            <div className="flex flex-col justify-between space-y-4">
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
                step={0.01}
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
          </BaseCard>

          {/* Fees & Specifications */}
          <BaseCard title="Fees & Specifications" neutralHeader={true}>
            <div className="flex flex-col justify-between space-y-4">
              <KeyValuePair
                label="Into Plane Fee"
                value={formData.intoPlaneFee}
                valueType="number"
                editMode={isEditing}
                onChange={(value) => handleFieldChange('intoPlaneFee', value)}
                name="intoPlaneFee"
                step={0.01}
                min={0}
              />
              <KeyValuePair
                label="Handling Fee"
                value={formData.handlingFee}
                valueType="number"
                editMode={isEditing}
                onChange={(value) => handleFieldChange('handlingFee', value)}
                name="handlingFee"
                step={0.01}
                min={0}
              />
              <KeyValuePair
                label="Other Fee"
                value={formData.otherFee}
                valueType="number"
                editMode={isEditing}
                onChange={(value) => handleFieldChange('otherFee', value)}
                name="otherFee"
                step={0.01}
                min={0}
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
            </div>
          </BaseCard>

          {/* Calculated Fields */}
          <BaseCard title="Calculated Fields" neutralHeader={true}>
            <div className="flex flex-col justify-between space-y-4">
              <KeyValuePair
                label="Density at 15°C (kg/m³)"
                value={formData.densityAt15C}
                valueType="number"
                editMode={isEditing}
                onChange={(value) => handleFieldChange('densityAt15C', value)}
                name="densityAt15C"
                step={0.01}
                min={0}
              />
              <KeyValuePair
                label="Normalized USD per USG"
                value={formData.normalizedUnitPriceUsdPerUsg}
                valueType="number"
                editMode={isEditing}
                onChange={(value) => handleFieldChange('normalizedUnitPriceUsdPerUsg', value)}
                name="normalizedUnitPriceUsdPerUsg"
                step={0.01}
                min={0}
              />
            </div>
          </BaseCard>
        </div>
      )}
    </DetailDialog>
  );
}
