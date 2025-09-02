// Updated by CursorAI on Dec 2 2024
// NOTE: FuelContract entity is not found in schema.ts - this may need to be added or this dialog may be deprecated
'use client';

// NOTE: These types are not in the current schema and may need to be defined
// import type { FuelContract, UpdateFuelContract } from '@/drizzle/types';

// Temporary type definitions until schema is updated
type FuelContract = {
  id: string;
  contractNumber?: string | null;
  title?: string | null;
  fuelType?: string | null;
  vendorName?: string | null;
  vendorAddress?: string | null;
  vendorContactName?: string | null;
  vendorContactEmail?: string | null;
  vendorContactPhone?: string | null;
  currency?: string;
  priceType?: string | null;
  priceFormula?: string | null;
  baseUnitPrice?: number | null;
  normalizedUsdPerUsg?: number | null;
  volumeCommitted?: number | null;
  volumeUnit?: string;
  intoPlaneFee?: number | null;
  includesTaxes?: boolean;
  includesAirportFees?: boolean;
  effectiveFrom?: string | null;
  effectiveTo?: string | null;
  aiSummary?: string | null;
  terms?: any;
};

type UpdateFuelContract = Partial<Omit<FuelContract, 'id'>>;

import { CURRENCY_MAP } from '@/lib/constants/currencies';
import { BASE_UOM_OPTIONS } from '@/lib/constants/units';
import {
  createFuelContract,
  updateFuelContract,
  type CreateFuelContractData,
} from '@/services/fuel/fuel-contract-client';
import { Button } from '@/stories/Button/Button';
import { MainCard } from '@/stories/Card/Card';
import { DetailDialog } from '@/stories/Dialog/Dialog';
import { KeyValuePair } from '@/stories/KeyValuePair/KeyValuePair';
import { Eye, Pencil, Plus } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

export default function FuelContractDialog({
  contract,
  airportId,
  onChange,
  DialogType = 'view',
  triggerClassName,
  buttonSize = 'md',
  withTrigger = true,
  open,
  onOpenChange,
}: {
  contract: FuelContract | null;
  airportId?: string; // Required when DialogType is 'add'
  onChange: (contract: FuelContract) => void;
  DialogType: 'add' | 'edit' | 'view';
  triggerClassName?: string;
  buttonSize?: 'sm' | 'md' | 'lg';
  withTrigger?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  const [formData, setFormData] = useState({
    // Contract Identification
    contractNumber: contract?.contractNumber || null,
    title: contract?.title || null,
    fuelType: contract?.fuelType || null,

    // Vendor Information
    vendorName: contract?.vendorName || null,
    vendorAddress: contract?.vendorAddress || null,
    vendorContactName: contract?.vendorContactName || null,
    vendorContactEmail: contract?.vendorContactEmail || null,
    vendorContactPhone: contract?.vendorContactPhone || null,

    // Pricing Structure
    currency: contract?.currency || 'USD',
    priceType: contract?.priceType || null,
    priceFormula: contract?.priceFormula || null,
    baseUnitPrice: contract?.baseUnitPrice || null,
    normalizedUsdPerUsg: contract?.normalizedUsdPerUsg || null,

    // Volume & Fees
    volumeCommitted: contract?.volumeCommitted || null,
    volumeUnit: contract?.volumeUnit || 'USG',
    intoPlaneFee: contract?.intoPlaneFee || null,

    // Inclusions & Exclusions
    includesTaxes: contract?.includesTaxes || false,
    includesAirportFees: contract?.includesAirportFees || false,

    // Contract Period
    effectiveFrom: contract?.effectiveFrom || null,
    effectiveTo: contract?.effectiveTo || null,

    // Contract Terms
    aiSummary: contract?.aiSummary || null,
    terms: contract?.terms || {},
  });

  const isAdd = DialogType === 'add';
  const isEdit = DialogType === 'edit';

  // Update formData when contract prop changes
  useEffect(() => {
    setFormData({
      contractNumber: contract?.contractNumber || null,
      title: contract?.title || null,
      fuelType: contract?.fuelType || null,
      vendorName: contract?.vendorName || null,
      vendorAddress: contract?.vendorAddress || null,
      vendorContactName: contract?.vendorContactName || null,
      vendorContactEmail: contract?.vendorContactEmail || null,
      vendorContactPhone: contract?.vendorContactPhone || null,
      currency: contract?.currency || 'USD',
      priceType: contract?.priceType || null,
      priceFormula: contract?.priceFormula || null,
      baseUnitPrice: contract?.baseUnitPrice || null,
      normalizedUsdPerUsg: contract?.normalizedUsdPerUsg || null,
      volumeCommitted: contract?.volumeCommitted || null,
      volumeUnit: contract?.volumeUnit || 'USG',
      intoPlaneFee: contract?.intoPlaneFee || null,
      includesTaxes: contract?.includesTaxes || false,
      includesAirportFees: contract?.includesAirportFees || false,
      effectiveFrom: contract?.effectiveFrom || null,
      effectiveTo: contract?.effectiveTo || null,
      aiSummary: contract?.aiSummary || null,
      terms: contract?.terms || {},
    });
  }, [contract]);

  const handleFieldChange = (
    field: string,
    value: string | boolean | number | Date | null | object,
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    try {
      let savedContract: FuelContract;

      if (isAdd) {
        // Create new contract
        if (!airportId) {
          throw new Error('Airport ID is required when creating a new contract');
        }
        const createData: CreateFuelContractData = {
          airportId,
          ...formData,
        };
        savedContract = await createFuelContract(createData);
        toast.success('Fuel contract created successfully');
      } else {
        // Update existing contract
        if (!contract?.id) {
          throw new Error('Contract ID is required for updates');
        }
        const updateData: UpdateFuelContract = formData;
        savedContract = await updateFuelContract(contract.id, updateData);
        toast.success('Fuel contract updated successfully');
      }

      // Call onChange to update parent with new data
      onChange(savedContract);
    } catch (error) {
      const action = isAdd ? 'create' : 'update';
      toast.error(`Failed to ${action} fuel contract`);
      console.error(`Error ${action}ing fuel contract:`, error);
      throw error; // Re-throw to let Dialog component handle loading state
    }
  };

  const handleCancel = () => {
    if (isAdd) {
      setFormData({
        contractNumber: null,
        title: null,
        fuelType: null,
        vendorName: null,
        vendorAddress: null,
        vendorContactName: null,
        vendorContactEmail: null,
        vendorContactPhone: null,
        currency: 'USD',
        priceType: null,
        priceFormula: null,
        baseUnitPrice: null,
        normalizedUsdPerUsg: null,
        volumeCommitted: null,
        volumeUnit: 'USG',
        intoPlaneFee: null,
        includesTaxes: false,
        includesAirportFees: false,
        effectiveFrom: null,
        effectiveTo: null,
        aiSummary: null,
        terms: {},
      });
    }
  };

  const handleReset = () => {
    setFormData({
      contractNumber: null,
      title: null,
      fuelType: null,
      vendorName: null,
      vendorAddress: null,
      vendorContactName: null,
      vendorContactEmail: null,
      vendorContactPhone: null,
      currency: 'USD',
      priceType: null,
      priceFormula: null,
      baseUnitPrice: null,
      normalizedUsdPerUsg: null,
      volumeCommitted: null,
      volumeUnit: 'USG',
      intoPlaneFee: null,
      includesTaxes: false,
      includesAirportFees: false,
      effectiveFrom: null,
      effectiveTo: null,
      aiSummary: null,
      terms: {},
    });
  };

  const triggerText = isAdd
    ? 'Add Contract'
    : isEdit
      ? 'Edit'
      : `View ${contract?.title || 'Contract'}`;
  const dialogTitle = isAdd ? 'Add New Fuel Contract' : contract?.title || 'Fuel Contract Details';

  return (
    <DetailDialog
      trigger={
        withTrigger ? (
          <Button
            intent={isAdd ? 'add' : isEdit ? 'secondary' : 'primary'}
            text={triggerText}
            icon={isAdd ? Plus : DialogType === 'edit' ? Pencil : Eye}
            size={buttonSize}
            className={triggerClassName}
          />
        ) : null
      }
      headerGradient="from-emerald-500 to-emerald-500"
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
          {/* Contract Information */}
          <MainCard title="Contract Information" neutralHeader={true}>
            <div className="flex flex-col justify-between space-y-4">
              <KeyValuePair
                label="Contract Number"
                value={formData.contractNumber}
                valueType="string"
                editMode={isEditing}
                onChange={(value) => handleFieldChange('contractNumber', value)}
                name="contractNumber"
              />
              <KeyValuePair
                label="Title"
                value={formData.title}
                valueType="string"
                editMode={isEditing}
                onChange={(value) => handleFieldChange('title', value)}
                name="title"
              />
              <KeyValuePair
                label="Fuel Type"
                value={formData.fuelType}
                valueType="string"
                editMode={isEditing}
                onChange={(value) => handleFieldChange('fuelType', value)}
                name="fuelType"
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

          {/* Pricing & Volume */}
          <MainCard title="Pricing & Volume" neutralHeader={true}>
            <div className="flex flex-col justify-between space-y-4">
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
                label="Price Formula"
                value={formData.priceFormula}
                valueType="string"
                editMode={isEditing}
                onChange={(value) => handleFieldChange('priceFormula', value)}
                name="priceFormula"
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
              <KeyValuePair
                label="Volume Committed"
                value={formData.volumeCommitted}
                valueType="number"
                editMode={isEditing}
                onChange={(value) => handleFieldChange('volumeCommitted', value)}
                name="volumeCommitted"
                min={0}
              />
              <KeyValuePair
                label="Volume Unit"
                value={formData.volumeUnit}
                valueType="select"
                editMode={isEditing}
                onChange={(value) => handleFieldChange('volumeUnit', value)}
                name="volumeUnit"
                selectOptions={BASE_UOM_OPTIONS.map((uom) => ({
                  label: uom.label,
                  value: uom.value,
                }))}
              />
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
            </div>
          </MainCard>

          {/* Contract Period & Terms */}
          <MainCard title="Contract Period & Terms" neutralHeader={true}>
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
          </MainCard>
        </div>
      )}
    </DetailDialog>
  );
}
