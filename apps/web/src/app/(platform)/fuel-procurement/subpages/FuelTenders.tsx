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
import { ModernSelect } from '@/stories/Form/Form';
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
  TrendingUpDown,
  Users,
} from 'lucide-react';
import { memo, useState } from 'react';
import { toast } from 'sonner';
import FuelBidsDataTable from '../_components/FuelBidsDataTable';
import { useFuelProcurement } from '../contexts';

const FuelTendersPage = memo(function FuelTendersPage() {
  const { airports, tenders, fuelBids } = useFuelProcurement();
  const { selectedAirport } = airports;
  const {
    tenders: airportTenders,
    selectedTender,
    setSelectedTender,
    refreshTenders,
    updateTender,
    addTender,
    loading: tenderLoading,
    error: tenderError,
  } = tenders;
  const {
    fuelBids: bids,
    refreshFuelBids,
    updateFuelBid,
    addFuelBid,
    removeFuelBid,
    loading: bidsLoading,
    error: bidsError,
  } = fuelBids;

  const [showTenderDropdown, setShowTenderDropdown] = useState(false);
  const [isDeletePopoverOpen, setIsDeletePopoverOpen] = useState(false);

  const [volumeForecast, setVolumeForecast] = useState({
    jan: '45000',
    feb: '42000',
    mar: '48000',
    apr: '46000',
    may: '50000',
    jun: '52000',
    jul: '85000',
    aug: '48000',
    sep: '46000',
    oct: '50000',
    nov: '52000',
    dev: '85000',
  });

  // Handle tender addition
  const handleTenderAdded = (newTender: FuelTender) => {
    addTender(newTender);
    // Select the newly added tender
    setSelectedTender(newTender);
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
        {tenderError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start">
              <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 mr-3 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="font-medium text-red-800">Error Loading Tenders</h3>
                <p className="text-sm text-red-700 mt-1">{tenderError}</p>
                <div className="mt-3 flex gap-2">
                  <button
                    onClick={() => refreshTenders()}
                    className="text-sm bg-red-100 hover:bg-red-200 text-red-800 px-3 py-1 rounded"
                  >
                    Retry
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Fuel Bids Error State */}
        {bidsError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start">
              <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 mr-3 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="font-medium text-red-800">Error Loading Fuel Bids</h3>
                <p className="text-sm text-red-700 mt-1">{bidsError}</p>
                <div className="mt-3 flex gap-2">
                  <button
                    onClick={() => refreshFuelBids()}
                    className="text-sm bg-red-100 hover:bg-red-200 text-red-800 px-3 py-1 rounded"
                  >
                    Retry
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-between gap-2 items-center">
          <ModernSelect
            placeholder="Select a tender"
            onValueChange={(id: string) => {
              const tender = airportTenders.find((t) => t.id === id);
              if (tender) setSelectedTender(tender);
            }}
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
            trigger={<Button intent="secondary" icon={Plus} text="Add Tender" />}
            tender={null}
            airportId={selectedAirport.id}
            onChange={handleTenderAdded}
            DialogType="add"
          />
        </div>

        {/* Loading State */}
        {tenderLoading && <LoadingComponent size="md" text="Loading fuel tenders..." />}

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
                        intent="secondaryInverted"
                        icon={TrashIcon}
                        className="hover:bg-red-500"
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
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                {/* grid col*/}
                <div className="flex flex-col gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Fuel className="h-4 w-4" />
                      Fuel Type
                    </div>
                    <div className="text-sm font-medium">{currentTender.fuelType}</div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <TrendingUpDown className="h-4 w-4" />
                      Volume Forecast
                    </div>
                    <div className="text-sm font-medium">
                      {currentTender.projectedAnnualVolume?.toLocaleString() +
                        ' ' +
                        BASE_UOM_OPTIONS.find((uom) => uom.value === currentTender.baseUom)
                          ?.label || ''}
                    </div>
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
                    <div className="text-sm font-medium">{bids.length} responded</div>
                  </div>
                </div>
              </div>
            </MainCard>

            {/* Fuel Bids Loading State */}
            {bidsLoading ? (
              <LoadingComponent size="md" text="Loading fuel bids..." />
            ) : (
              <FuelBidsDataTable onRefresh={refreshFuelBids} isRefreshing={bidsLoading} />
            )}
          </div>
        )}
      </div>
    </div>
  );
});

export default FuelTendersPage;
