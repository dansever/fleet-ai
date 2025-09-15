'use client';

import { CardContent } from '@/components/ui/card';
import type { Airport } from '@/drizzle/types';
import { useCountryMap } from '@/hooks/use-country-map';
import { client as airportClient } from '@/modules/core/airports';
import { AirportCreateInput } from '@/modules/core/airports/airports.types';
import { BaseCard } from '@/stories/Card/Card';
import { DetailDialog } from '@/stories/Dialog/Dialog';
import { KeyValuePair } from '@/stories/KeyValuePair/KeyValuePair';
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
}: {
  trigger?: React.ReactNode;
  airport: Airport | null;
  DialogType: 'add' | 'edit' | 'view';
  onChange: (airport: Airport) => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
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
        savedAirport = await airportClient.createAirport(formData as AirportCreateInput);
        toast.success('Airport created successfully');
      } else {
        // Update existing airport
        if (!airport?.id) {
          throw new Error('Airport ID is required for updates');
        }
        savedAirport = await airportClient.updateAirport(airport.id, formData);
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
    });
  };

  const dialogTitle = isAdd ? 'Add New Airport' : airport?.name || 'Airport Details';

  return (
    <DetailDialog
      trigger={trigger ? trigger : null}
      headerGradient="from-blue-500 to-blue-500"
      title={dialogTitle}
      onSave={handleSave}
      onCancel={handleCancel}
      onReset={handleReset}
      DialogType={DialogType}
      open={open}
      onOpenChange={onOpenChange}
      className="min-w-[40vw] sm:min-w-[45vw] md:min-w-[50vw] lg:min-w-[55vw]"
    >
      {(isEditing) => (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          <BaseCard title="Airport Information">
            <CardContent>
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
            </CardContent>
          </BaseCard>

          <BaseCard title="Location Information">
            <CardContent>
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
            </CardContent>
          </BaseCard>
        </div>
      )}
    </DetailDialog>
  );
}
