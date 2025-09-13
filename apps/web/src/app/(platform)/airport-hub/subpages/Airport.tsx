'use client';

import { Button } from '@/stories/Button/Button';
import { MainCard, MetricCard } from '@/stories/Card/Card';
import { KeyValuePair } from '@/stories/KeyValuePair/KeyValuePair';
import { ConfirmationPopover } from '@/stories/Popover/Popover';
import { Building2, Plane, Star, Trash } from 'lucide-react';
import { useAirportHub } from '../ContextProvider';

export default function AirportPage() {
  const { selectedAirport, updateAirport, contracts, deleteAirport, setSelectedAirport } =
    useAirportHub();

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
      {/* Airport Information */}
      <MainCard
        title="Airport Information"
        subtitle={`Information about ${selectedAirport?.name || 'this airport'}.`}
        neutralHeader={true}
        actions={
          <ConfirmationPopover
            trigger={<Button intent="danger" icon={Trash} />}
            popoverIntent="danger"
            title="Delete Airport"
            onConfirm={async () => {
              try {
                await deleteAirport(selectedAirport.id);
                // Note: deleteAirport already handles selecting the next airport,
                // so we don't need to manually call setSelectedAirport(null)
              } catch (error) {
                console.error('Error deleting airport:', error);
                // The deleteAirport function already shows error toast
              }
            }}
          />
        }
      >
        <div className="grid grid-cols-2">
          <KeyValuePair
            label="Airport Name"
            value={selectedAirport?.name || ''}
            valueType="string"
          />
          <KeyValuePair label="IATA Code" value={selectedAirport?.iata || ''} valueType="string" />
          <KeyValuePair label="ICAO Code" value={selectedAirport?.icao || ''} valueType="string" />
          <KeyValuePair label="City" value={selectedAirport?.city || ''} valueType="string" />
          <KeyValuePair label="State" value={selectedAirport?.state || ''} valueType="string" />
          <KeyValuePair label="Country" value={selectedAirport?.country || ''} valueType="string" />
          <KeyValuePair
            label="Is Hub Airport"
            value={selectedAirport?.isHub || false}
            valueType="boolean"
          />
        </div>
      </MainCard>
      {/* Airport Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
              <Star className="text-yellow-400 fill-yellow-400" />
            ) : (
              <Plane className="text-blue-600" />
            )
          }
          trend="neutral"
        />
      </div>
    </div>
  );
}
