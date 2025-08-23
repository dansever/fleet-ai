'use client';

import type { Airport } from '@/drizzle/types';
import { updateAirport } from '@/services/core/airport-client';
import { Button } from '@/stories/Button/Button';
import { DialogSection, KeyValuePair } from '@/stories/Card/Card';
import { DetailDialog } from '@/stories/Dialog/Dialog';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

export default function AirportDialog({
  airport,
  onChange,
}: {
  airport: Airport;
  onChange: (airport: Airport) => void;
}) {
  const [formData, setFormData] = useState({
    name: airport.name,
    city: airport.city,
    state: airport.state,
    country: airport.country,
    iata: airport.iata,
    icao: airport.icao,
    isHub: airport.isHub,
  });
  const [isSaving, setIsSaving] = useState(false);

  // Update formData when airport prop changes
  useEffect(() => {
    setFormData({
      name: airport.name,
      city: airport.city,
      state: airport.state,
      country: airport.country,
      iata: airport.iata,
      icao: airport.icao,
      isHub: airport.isHub,
    });
  }, [airport]);

  const handleFieldChange = (field: string, value: string | boolean | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateAirport(airport.id, formData);
      toast.success('Airport saved successfully');

      // Call onChange to update parent with new data
      onChange({
        ...airport,
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
      trigger={<Button intent="primary" text={`View ${airport.iata}`} />}
      title={airport.name}
      onSave={handleSave}
    >
      {(isEditing) => (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <DialogSection
            title="Information"
            gradient="from-blue-500 to-green-500"
            children={
              <div className="flex flex-col justify-between">
                <KeyValuePair
                  label="Airport Name"
                  value={formData.name}
                  editMode={isEditing}
                  onChange={(value) => handleFieldChange('name', value)}
                  name="name"
                />
                <KeyValuePair
                  label="IATA"
                  editMode={isEditing}
                  onChange={(value) => handleFieldChange('iata', value)}
                  name="iata"
                  value={formData.iata}
                />
                <KeyValuePair
                  label="ICAO"
                  editMode={isEditing}
                  onChange={(value) => handleFieldChange('icao', value)}
                  name="icao"
                  value={formData.icao}
                />
                <KeyValuePair
                  label="Hub"
                  editMode={isEditing}
                  onChange={(value) => handleFieldChange('isHub', value)}
                  name="isHub"
                  value={formData.isHub}
                />
              </div>
            }
          />
          <DialogSection
            title="Location"
            gradient="from-blue-500 to-green-500"
            children={
              <div className="flex flex-col justify-between">
                <KeyValuePair
                  label="City"
                  value={formData.city}
                  editMode={isEditing}
                  onChange={(value) => handleFieldChange('city', value)}
                  name="city"
                />
                <KeyValuePair
                  label="State"
                  value={formData.state}
                  editMode={isEditing}
                  onChange={(value) => handleFieldChange('state', value)}
                  name="state"
                />
                <KeyValuePair
                  label="Country"
                  value={formData.country}
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
