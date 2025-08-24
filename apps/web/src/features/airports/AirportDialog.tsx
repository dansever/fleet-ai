'use client';

import type { Airport } from '@/drizzle/types';
import { useCountryMap } from '@/hooks/use-country-map';
import { createAirport, updateAirport } from '@/services/core/airport-client';
import { Button } from '@/stories/Button/Button';
import { ContentSection } from '@/stories/Card/Card';
import { DetailDialog } from '@/stories/Dialog/Dialog';
import { KeyValuePair } from '@/stories/Utilities/KeyValuePair';
import { Plus } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import AirportAutocomplete from './AirportAutocomplete';
import type { AirportDatasetItem } from './airportDatasetType';

export default function AirportDialog({
  airport,
  DialogType = 'view',
  onChange,
  buttonSize = 'md',
}: {
  airport: Airport | null;
  DialogType: 'add' | 'edit' | 'view';
  onChange: (airport: Airport) => void;
  buttonSize?: 'sm' | 'md' | 'lg';
}) {
  const { map: countryMap } = useCountryMap();
  const isAdd = DialogType === 'add';
  const isEdit = DialogType === 'edit';

  const [formData, setFormData] = useState({
    name: airport?.name || '',
    city: airport?.city || '',
    state: airport?.state || '',
    country: airport?.country || '',
    iata: airport?.iata || '',
    icao: airport?.icao || '',
    isHub: airport?.isHub || false,
  });
  const [isSaving, setIsSaving] = useState(false);

  // Update formData when airport prop changes
  useEffect(() => {
    setFormData({
      name: airport?.name || '',
      city: airport?.city || '',
      state: airport?.state || '',
      country: airport?.country || '',
      iata: airport?.iata || '',
      icao: airport?.icao || '',
      isHub: airport?.isHub || false,
    });
  }, [airport]);

  const handleFieldChange = (field: string, value: string | boolean | number) => {
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
      // Keep isHub as is - user should choose this manually
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
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
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (isAdd) {
      setFormData({
        name: '',
        city: '',
        state: '',
        country: '',
        iata: '',
        icao: '',
        isHub: false,
      });
    }
  };

  const triggerText = isAdd ? 'Add Airport' : `View ${airport?.iata || 'Airport'}`;
  const dialogTitle = isAdd ? 'Add New Airport' : airport?.name || 'Airport Details';
  const saveButtonText = isAdd ? 'Upload to Database' : 'Save';

  return (
    <DetailDialog
      trigger={
        <Button
          intent={isAdd ? 'add' : 'primary'}
          text={triggerText}
          icon={isAdd ? Plus : undefined}
          size={buttonSize}
        />
      }
      headerGradient="from-blue-500 to-blue-500"
      title={dialogTitle}
      onSave={handleSave}
      onCancel={handleCancel}
      initialEditing={isEdit || isAdd}
      saveButtonText={saveButtonText}
    >
      {(isEditing) => (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ContentSection
            header="Information"
            headerGradient="from-blue-500 to-blue-300"
            children={
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
                  label="IATA"
                  valueType="string"
                  editMode={isEditing}
                  onChange={(value) => handleFieldChange('iata', value)}
                  name="iata"
                  value={formData.iata}
                />
                <KeyValuePair
                  label="ICAO"
                  valueType="string"
                  editMode={isEditing}
                  onChange={(value) => handleFieldChange('icao', value)}
                  name="icao"
                  value={formData.icao}
                />
                <KeyValuePair
                  label="Hub"
                  valueType="boolean"
                  editMode={isEditing}
                  onChange={(value) => handleFieldChange('isHub', value)}
                  name="isHub"
                  value={formData.isHub}
                />
              </div>
            }
          />
          <ContentSection
            header="Location"
            headerGradient="from-blue-500 to-blue-300"
            children={
              <div className="flex flex-col justify-between">
                <KeyValuePair
                  label="City"
                  value={formData.city}
                  valueType="string"
                  editMode={isEditing}
                  onChange={(value) => handleFieldChange('city', value)}
                  name="city"
                />
                <KeyValuePair
                  label="State"
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
            }
          />
        </div>
      )}
    </DetailDialog>
  );
}
