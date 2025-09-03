'use client';

import { Button } from '@/stories/Button/Button';
import { MainCard, MetricCard } from '@/stories/Card/Card';
import { KeyValuePair } from '@/stories/KeyValuePair/KeyValuePair';
import { Building2, Pencil, Plane, Save, X } from 'lucide-react';
import { useState } from 'react';
import { useAirportHub } from '../ContextProvider';

export default function ManageAirport() {
  const { selectedAirport, updateAirport, contracts } = useAirportHub();
  const [isEditing, setIsEditing] = useState(false);
  const [editedAirport, setEditedAirport] = useState(selectedAirport);

  if (!selectedAirport) {
    return (
      <div className="text-center py-12 text-gray-500">
        <div className="text-center">
          <h3 className="text-lg font-medium mb-2">No Airport Selected</h3>
          <p className="text-sm">Please select an airport to manage its information.</p>
        </div>
      </div>
    );
  }

  const handleEdit = () => {
    setEditedAirport(selectedAirport);
    setIsEditing(true);
  };

  const handleSave = () => {
    if (editedAirport) {
      updateAirport(editedAirport);
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setEditedAirport(selectedAirport);
    setIsEditing(false);
  };

  const handleChange = (field: string, value: string | boolean) => {
    if (editedAirport) {
      setEditedAirport({
        ...editedAirport,
        [field]: value,
      });
    }
  };

  // Calculate airport statistics
  const airportStats = {
    totalContracts: contracts.length,
    activeContracts: contracts.filter((contract) => {
      if (!contract.effectiveTo) return true;
      return new Date(contract.effectiveTo) > new Date();
    }).length,
    hubStatus: selectedAirport.isHub ? 'Hub Airport' : 'Regional Airport',
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Airport Overview */}

      {/* Airport Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <MetricCard
          title="Total Contracts"
          value={airportStats.totalContracts}
          icon={<Building2 className="w-6 h-6 text-blue-600" />}
          trend="neutral"
        />
        <MetricCard
          title="Active Contracts"
          value={airportStats.activeContracts}
          change={`${airportStats.totalContracts - airportStats.activeContracts} expired`}
          icon={<Plane className="w-6 h-6 text-green-600" />}
          trend={airportStats.activeContracts > 0 ? 'up' : 'neutral'}
        />
        <MetricCard
          title="Airport Type"
          value={airportStats.hubStatus}
          icon={
            selectedAirport.isHub ? (
              <Building2 className="w-6 h-6 text-purple-600" />
            ) : (
              <Plane className="w-6 h-6 text-blue-600" />
            )
          }
          trend="neutral"
        />
      </div>

      {/* Airport Information */}
      <MainCard
        title="Airport Information"
        neutralHeader={true}
        actions={
          <div className="flex gap-2">
            {isEditing ? (
              <>
                <Button
                  intent="secondary"
                  className="text-white bg-white/30"
                  text="Cancel"
                  icon={X}
                  onClick={handleCancel}
                />
                <Button
                  intent="secondary"
                  className="text-white bg-white/30"
                  text="Save Changes"
                  icon={Save}
                  onClick={handleSave}
                />
              </>
            ) : (
              <Button
                intent="secondary"
                className="text-white bg-white/30"
                text="Edit Airport"
                icon={Pencil}
                onClick={handleEdit}
              />
            )}
          </div>
        }
      >
        <div className="flex flex-col gap-2">
          <KeyValuePair
            label="Airport Name"
            value={editedAirport?.name || ''}
            valueType="string"
            editMode={isEditing}
            onChange={(value) => handleChange('name', value as string)}
          />
          <KeyValuePair
            label="IATA Code"
            value={editedAirport?.iata || ''}
            valueType="string"
            editMode={isEditing}
            onChange={(value) => handleChange('iata', value as string)}
          />
          <KeyValuePair
            label="ICAO Code"
            value={editedAirport?.icao || ''}
            valueType="string"
            editMode={isEditing}
            onChange={(value) => handleChange('icao', value as string)}
          />
          <KeyValuePair
            label="City"
            value={editedAirport?.city || ''}
            valueType="string"
            editMode={isEditing}
            onChange={(value) => handleChange('city', value as string)}
          />
          <KeyValuePair
            label="State"
            value={editedAirport?.state || ''}
            valueType="string"
            editMode={isEditing}
            onChange={(value) => handleChange('state', value as string)}
          />
          <KeyValuePair
            label="Country"
            value={editedAirport?.country || ''}
            valueType="string"
            editMode={isEditing}
            onChange={(value) => handleChange('country', value as string)}
          />
          <KeyValuePair
            label="Internal Notes"
            value={editedAirport?.internalNotes || ''}
            valueType="string"
            editMode={isEditing}
            onChange={(value) => handleChange('internalNotes', value as string)}
          />
          <KeyValuePair
            label="Is Hub Airport"
            value={editedAirport?.isHub || false}
            valueType="boolean"
            editMode={isEditing}
            onChange={(value) => handleChange('isHub', value as boolean)}
          />
        </div>
      </MainCard>
    </div>
  );
}
