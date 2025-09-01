'use client';

import { LoadingComponent } from '@/components/miscellaneous/Loading';
import type { FuelTender } from '@/drizzle/types';
import TenderDialog from '@/features/fuel/tender/TenderDialog';
import { CURRENCY_MAP } from '@/lib/constants/currencies';
import { BASE_UOM_OPTIONS } from '@/lib/constants/units';
import { formatDate } from '@/lib/core/formatters';
import { deleteFuelTender } from '@/services/fuel/fuel-tender-client';
import { Button } from '@/stories/Button/Button';
import { MainCard } from '@/stories/Card/Card';
import { ModernSelect, NumberInput } from '@/stories/Form/Form';
import { ConfirmationPopover } from '@/stories/Popover/Popover';
import { StatusBadge } from '@/stories/StatusBadge/StatusBadge';
import {
  AlertCircle,
  Calendar,
  Coins,
  Eye,
  FileText,
  Fuel,
  Pencil,
  Plus,
  Ruler,
  TrashIcon,
  Users,
} from 'lucide-react';
import { memo, useState } from 'react';
import { toast } from 'sonner';
import { useFuelProcurement } from '../ContextProvider';
import FuelBidsComparison from '../_components/FuelBidsComparison';

const FuelTendersPage = memo(function FuelTendersPage() {
  const {
    selectedAirport,
    airportTenders,
    selectedTender,
    selectTenderById,
    fuelBids,
    refreshFuelBids,
    updateFuelBid,
    addFuelBid,
    removeFuelBid,
    loading,
    errors,
    clearError,
    refreshTenders,
    updateTender,
    addTender,
  } = useFuelProcurement();

  const [showTenderDropdown, setShowTenderDropdown] = useState(false);
  const [isDeletePopoverOpen, setIsDeletePopoverOpen] = useState(false);

  const [volumeForecast, setVolumeForecast] = useState({
    jan: '45000',
    feb: '42000',
    mar: '48000',
    apr: '46000',
    may: '50000',
    jun: '52000',
  });

  // Handle tender addition
  const handleTenderAdded = (newTender: FuelTender) => {
    addTender(newTender);
    // Select the newly added tender
    selectTenderById(newTender.id);
  };

  // Handle tender update
  const handleTenderUpdated = (updatedTender: FuelTender) => {
    updateTender(updatedTender);
  };

  const handleTenderDelete = async () => {
    if (!selectedTender) return;
    try {
      await deleteFuelTender(selectedTender.id);
      toast.success('Tender deleted successfully');
      setIsDeletePopoverOpen(false); // Close the popover after successful deletion
      refreshTenders();
    } catch (error) {
      toast.error('Error deleting tender');
    }
  };

  if (!selectedAirport) return null;

  const currentTender = selectedTender || (airportTenders.length > 0 ? airportTenders[0] : null);

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-8xl mx-auto space-y-4">
        {/* Error State */}
        {errors.tenders && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start">
              <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 mr-3 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="font-medium text-red-800">Error Loading Tenders</h3>
                <p className="text-sm text-red-700 mt-1">{errors.tenders}</p>
                <div className="mt-3 flex gap-2">
                  <button
                    onClick={() => refreshTenders()}
                    className="text-sm bg-red-100 hover:bg-red-200 text-red-800 px-3 py-1 rounded"
                  >
                    Retry
                  </button>
                  <button
                    onClick={() => clearError('tenders')}
                    className="text-sm text-red-600 hover:text-red-800"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Fuel Bids Error State */}
        {errors.fuelBids && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start">
              <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 mr-3 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="font-medium text-red-800">Error Loading Fuel Bids</h3>
                <p className="text-sm text-red-700 mt-1">{errors.fuelBids}</p>
                <div className="mt-3 flex gap-2">
                  <button
                    onClick={() => refreshFuelBids()}
                    className="text-sm bg-red-100 hover:bg-red-200 text-red-800 px-3 py-1 rounded"
                  >
                    Retry
                  </button>
                  <button
                    onClick={() => clearError('fuelBids')}
                    className="text-sm text-red-600 hover:text-red-800"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-between gap-2 items-center">
          <ModernSelect
            placeholder="Select a tender"
            onValueChange={selectTenderById}
            value={selectedTender?.id}
            disabled={!airportTenders.length}
            TriggerClassName="min-h-12"
            options={airportTenders.map((tender) => ({
              value: tender.id,
              label: (
                <div className="flex flex-col text-left whitespace-normal">
                  <span className="font-bold">{tender.title}</span>
                  <span className="text-xs text-muted-foreground">
                    {tender.biddingStarts && tender.biddingEnds
                      ? `${formatDate(tender.biddingStarts)} - ${formatDate(tender.biddingEnds)}`
                      : ''}
                  </span>
                </div>
              ),
            }))}
          />
          <TenderDialog
            key="add-tender"
            trigger={
              <Button className="flex-shrink-0" intent="secondary" icon={Plus} text="Add Tender" />
            }
            tender={null}
            airportId={selectedAirport.id}
            onChange={handleTenderAdded}
            DialogType="add"
          />
        </div>

        {/* Loading State */}
        {loading.tenders && <LoadingComponent size="md" text="Loading fuel tenders..." />}

        {currentTender && (
          <div className="flex flex-col gap-4">
            <MainCard
              title={currentTender.title}
              subtitle={currentTender.description || 'No description available'}
              headerActions={
                // Buttons
                <div className="flex gap-2">
                  <TenderDialog
                    key={`view-tender-${currentTender.id}`}
                    trigger={<Button intent="secondaryInverted" icon={Eye} />}
                    tender={currentTender}
                    airportId={selectedAirport.id}
                    onChange={handleTenderUpdated}
                    DialogType="view"
                  />
                  <TenderDialog
                    key={`edit-tender-${currentTender.id}`}
                    trigger={<Button intent="secondaryInverted" icon={Pencil} />}
                    tender={currentTender}
                    airportId={selectedAirport.id}
                    onChange={handleTenderUpdated}
                    DialogType="edit"
                  />
                  <ConfirmationPopover
                    trigger={
                      <Button
                        intent="secondary"
                        icon={TrashIcon}
                        className="bg-white/20 text-white-700 hover:border-red-500 hover:bg-red-500"
                      />
                    }
                    popoverIntent="danger"
                    title="Delete Tender"
                    onConfirm={handleTenderDelete}
                    open={isDeletePopoverOpen}
                    onOpenChange={setIsDeletePopoverOpen}
                  />
                </div>
              }
            >
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {/* grid col*/}
                <div className="flex flex-col gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Fuel className="h-4 w-4" />
                      Fuel Type
                    </div>
                    <div className="text-sm font-medium">{currentTender.fuelType}</div>
                  </div>
                </div>
                {/* grid col*/}
                <div className="flex flex-col gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Calendar className="h-4 w-4" />
                      Tender Period
                    </div>
                    <div className="text-sm font-medium">
                      {currentTender.biddingStarts} - {currentTender.biddingEnds}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Calendar className="h-4 w-4" />
                      Agreement Period
                    </div>
                    <div className="text-sm font-medium">
                      {currentTender.deliveryStarts} - {currentTender.deliveryEnds}
                    </div>
                  </div>
                </div>
                {/* grid col*/}
                <div className="flex flex-col gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Coins className="h-4 w-4" />
                      Base Currency
                    </div>
                    <div className="text-sm font-medium">
                      {CURRENCY_MAP[currentTender.baseCurrency || '']?.display}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Ruler className="h-4 w-4" />
                      Base Unit of Measure
                    </div>
                    <div className="text-sm font-medium">
                      {BASE_UOM_OPTIONS.find((uom) => uom.value === currentTender.baseUom)?.label ||
                        ''}
                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <FileText className="h-4 w-4" />
                      Status
                    </div>
                    <StatusBadge status="operational" text={currentTender.status || ''} />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Users className="h-4 w-4" />
                      Suppliers
                    </div>
                    <div className="text-sm font-medium">{fuelBids.length} responded</div>
                  </div>
                </div>
              </div>

              {/* Volume Forecast */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-4">Monthly Volume Forecast</h3>
                <div className="grid grid-cols-3 lg:grid-cols-6 gap-4">
                  {Object.entries(volumeForecast).map(([month, volume]) => (
                    <div key={month}>
                      <label className="block text-sm font-medium text-gray-700 mb-1 capitalize">
                        {month}
                      </label>
                      <NumberInput
                        label={month}
                        step={1000}
                        value={Number(volume)}
                        onChange={(value) =>
                          setVolumeForecast((prev) => ({ ...prev, [month]: value }))
                        }
                        placeholder="Liters"
                        className="text-sm"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </MainCard>

            {/* Fuel Bids Loading State */}
            {loading.fuelBids ? (
              <LoadingComponent size="md" text="Loading fuel bids..." />
            ) : (
              <FuelBidsComparison onRefresh={refreshFuelBids} isRefreshing={loading.fuelBids} />
            )}
          </div>
        )}
      </div>
    </div>
  );
});

export default FuelTendersPage;
