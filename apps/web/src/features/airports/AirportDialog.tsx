// Updated by CursorAI on Dec 2 2024
'use client';

import type { Airport } from '@/drizzle/types';
import { useCountryMap } from '@/hooks/use-country-map';
import { createAirport, updateAirport } from '@/services/core/airport-client';
import { Button } from '@/stories/Button/Button';
import { MainCard } from '@/stories/Card/Card';
import { DetailDialog } from '@/stories/Dialog/Dialog';
import { KeyValuePair } from '@/stories/KeyValuePair/KeyValuePair';
import { Eye, Pencil, Plus } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import AirportAutocomplete from './AirportAutocomplete';
import { AirportDatasetItem } from './airportDatasetType';

export default function AirportDialog({
  trigger,
  airport,
  DialogType = 'view',
  onChange,
  open,
  onOpenChange,
  withTrigger = true,
}: {
  trigger?: React.ReactNode;
  airport: Airport | null;
  DialogType: 'add' | 'edit' | 'view';
  onChange: (airport: Airport) => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  withTrigger?: boolean;
}) {
  const { map: countryMap } = useCountryMap();
  const isAdd = DialogType === 'add';
  const isEdit = DialogType === 'edit';

  const [formData, setFormData] = useState({
    // Airport Identification (matching schema)
    name: airport?.name || '',
    iata: airport?.iata || '',
    icao: airport?.icao || '',

    // Location Information (matching schema)
    city: airport?.city || '',
    state: airport?.state || '',
    country: airport?.country || '',

    // Operational Information (matching schema)
    isHub: airport?.isHub || false,
    internalNotes: airport?.internalNotes || '',
  });

  // Update formData when airport prop changes
  useEffect(() => {
    setFormData({
      name: airport?.name || '',
      iata: airport?.iata || '',
      icao: airport?.icao || '',
      city: airport?.city || '',
      state: airport?.state || '',
      country: airport?.country || '',
      isHub: airport?.isHub || false,
      internalNotes: airport?.internalNotes || '',
    });
  }, [airport]);

  const handleFieldChange = (field: string, value: string | boolean | number | Date | null) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleAirportSelect = (selectedAirport: AirportDatasetItem) => {
    // Auto-populate form fields based on selected airport
    const countryName = countryMap[selectedAirport.country_code] || selectedAirport.country_code;

    setFormData((prev) => ({
      ...prev,
      name: selectedAirport.airport,
      city: selectedAirport.region_name || '', // Using region_name as city
      state: '', // AirportDatasetItem doesn't have state, keep current or empty
      country: countryName,
      iata: selectedAirport.iata || '',
      icao: selectedAirport.icao || '',
      // Keep isHub and internalNotes as is - user should choose these manually
    }));
  };

  const handleSave = async () => {
    if (!formData.name?.trim()) {
      toast.error('Airport name is required');
      return;
    }

    if (!formData.country?.trim()) {
      toast.error('Country is required');
      return;
    }

    try {
      let savedAirport: Airport;

      if (isAdd) {
        // Create new airport (orgId is handled server-side)
        savedAirport = await createAirport(formData);
        toast.success('Airport created successfully');
      } else {
        // Update existing airport
        if (!airport?.id) {
          throw new Error('Airport ID is required for updates');
        }
        savedAirport = await updateAirport(airport.id, formData);
        toast.success('Airport updated successfully');
      }

      // Call onChange to update parent with new data
      onChange(savedAirport);
    } catch (error) {
      const action = isAdd ? 'create' : 'update';
      toast.error(`Failed to ${action} airport`);
      console.error(`Error ${action}ing airport:`, error);
      throw error; // Re-throw to let Dialog component handle loading state
    }
  };

  const handleCancel = () => {
    if (isAdd) {
      setFormData({
        name: '',
        iata: '',
        icao: '',
        city: '',
        state: '',
        country: '',
        isHub: false,
        internalNotes: '',
      });
    }
  };

  const handleReset = () => {
    setFormData({
      name: '',
      iata: '',
      icao: '',
      city: '',
      state: '',
      country: '',
      isHub: false,
      internalNotes: '',
    });
  };

  const dialogTitle = isAdd ? 'Add New Airport' : airport?.name || 'Airport Details';

  return (
    <DetailDialog
      trigger={
        withTrigger
          ? trigger || (
              <Button
                intent={isAdd ? 'add' : isEdit ? 'secondary' : 'primary'}
                text={isAdd ? 'Add Airport' : isEdit ? 'Edit' : 'View'}
                icon={isAdd ? Plus : DialogType === 'edit' ? Pencil : Eye}
                size="md"
              />
            )
          : null
      }
      headerGradient="from-blue-500 to-blue-500"
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
          <MainCard title="Airport Information" neutralHeader={true}>
            <div className="flex flex-col justify-between space-y-4">
              {isEditing && isAdd ? (
                <AirportAutocomplete
                  label="Search Airport"
                  placeholder="Type airport name to search..."
                  value={formData.name}
                  onChange={(value) => handleFieldChange('name', value)}
                  onSelect={handleAirportSelect}
                  required
                />
              ) : (
                <KeyValuePair
                  label="Airport Name"
                  value={formData.name}
                  valueType="string"
                  editMode={isEditing}
                  onChange={(value) => handleFieldChange('name', value)}
                  name="name"
                />
              )}
              <KeyValuePair
                label="IATA Code"
                valueType="string"
                editMode={isEditing}
                onChange={(value) => handleFieldChange('iata', value)}
                name="iata"
                value={formData.iata}
              />
              <KeyValuePair
                label="ICAO Code"
                valueType="string"
                editMode={isEditing}
                onChange={(value) => handleFieldChange('icao', value)}
                name="icao"
                value={formData.icao}
              />
              <KeyValuePair
                label="Hub Airport"
                valueType="boolean"
                editMode={isEditing}
                onChange={(value) => handleFieldChange('isHub', value)}
                name="isHub"
                value={formData.isHub}
              />
              <KeyValuePair
                label="Internal Notes"
                value={formData.internalNotes}
                valueType="string"
                editMode={isEditing}
                onChange={(value) => handleFieldChange('internalNotes', value)}
                name="internalNotes"
              />
            </div>
          </MainCard>

          <MainCard title="Location Information" neutralHeader={true}>
            <div className="flex flex-col justify-between space-y-4">
              <KeyValuePair
                label="City"
                value={formData.city}
                valueType="string"
                editMode={isEditing}
                onChange={(value) => handleFieldChange('city', value)}
                name="city"
              />
              <KeyValuePair
                label="State/Province"
                value={formData.state}
                valueType="string"
                editMode={isEditing}
                onChange={(value) => handleFieldChange('state', value)}
                name="state"
              />
              <KeyValuePair
                label="Country"
                value={formData.country}
                valueType="string"
                editMode={isEditing}
                onChange={(value) => handleFieldChange('country', value)}
                name="country"
              />
            </div>
          </MainCard>
        </div>
      )}
    </DetailDialog>
  );
}
