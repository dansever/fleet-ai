'use client';

import { LoadingComponent } from '@/components/miscellaneous/Loading';
import { CardContent } from '@/components/ui/card';
import { getProcessStatusDisplay } from '@/drizzle/enums';
import type { FuelTender } from '@/drizzle/types';
import TenderDialog from '@/features/fuel/tender/TenderDialog';
import { CURRENCY_MAP } from '@/lib/constants/currencies';
import { BASE_UOM_OPTIONS } from '@/lib/constants/units';
import { formatDate } from '@/lib/core/formatters';
import { client as fuelTenderClient } from '@/modules/fuel/tenders';
import { Button } from '@/stories/Button/Button';
import { BaseCard } from '@/stories/Card/Card';
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
import { useFuelProcurement } from '../contexts';

const FuelTendersPage = memo(function TendersPage() {
  const {
    airports,
    tenders,
    bids,
    selectedTender,
    addTender,
    updateTender,
    selectTender,
    refreshTenders,
    errors,
    refreshBids,
    updateBid,
    addBid,
    removeBid,
    loading,
  } = useFuelProcurement();
  const selectedAirport = airports[0];

  const [isDeletePopoverOpen, setIsDeletePopoverOpen] = useState(false);

  // Handle tender addition
  const handleTenderAdded = (newTender: FuelTender) => {
    addTender(newTender);
    // Select the newly added tender
    selectTender(newTender);
  };

  // Handle tender update
  const handleTenderUpdated = (updatedTender: FuelTender) => {
    updateTender(updatedTender);
  };

  const handleTenderDelete = async () => {
    if (!selectedTender?.id) return;
    try {
      await fuelTenderClient.deleteFuelTender(selectedTender?.id);
      toast.success('Tender deleted successfully');
      setIsDeletePopoverOpen(false); // Close the popover after successful deletion
      refreshTenders();
    } catch (error) {
      toast.error('Error deleting tender');
    }
  };

  if (!selectedAirport) return null;

  const currentTender = selectedTender || (tenders.length > 0 ? tenders[0] : null);

  return (
    <div className="min-h-screen">
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
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Fuel Bids Error State */}
        {errors.bids && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start">
              <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 mr-3 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="font-medium text-red-800">Error Loading Fuel Bids</h3>
                <p className="text-sm text-red-700 mt-1">{errors.bids}</p>
                <div className="mt-3 flex gap-2">
                  <button
                    onClick={() => refreshBids()}
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
              const tender = tenders.find((t) => t.id === id);
              if (tender) selectTender(tender);
            }}
            value={selectedTender?.id}
            disabled={!tenders.length}
            TriggerClassName="min-h-12"
            options={tenders.map((tender) => ({
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
        {loading.tenders && <LoadingComponent size="md" text="Loading fuel tenders..." />}

        {currentTender && (
          <div className="flex flex-col gap-4">
            <BaseCard
              title={currentTender.title}
              subtitle={currentTender.description || 'No description available'}
              headerClassName="from-sky-500 via-sky-500/60 to-sky-400/60 text-white"
              actions={
                <div className="flex gap-2">
                  <TenderDialog
                    key={`view-tender-${currentTender.id}`}
                    trigger={<Button intent="secondary" icon={Eye} />}
                    tender={currentTender}
                    airportId={selectedAirport.id}
                    onChange={handleTenderUpdated}
                    DialogType="view"
                  />
                  <TenderDialog
                    key={`edit-tender-${currentTender.id}`}
                    trigger={<Button intent="secondary" icon={Pencil} />}
                    tender={currentTender}
                    airportId={selectedAirport.id}
                    onChange={handleTenderUpdated}
                    DialogType="edit"
                  />
                  <ConfirmationPopover
                    trigger={
                      <Button intent="secondary" icon={TrashIcon} className="hover:bg-red-500" />
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
              <CardContent className="grid grid-cols-2 lg:grid-cols-4 gap-6">
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
                    <StatusBadge
                      status="operational"
                      text={getProcessStatusDisplay(currentTender.processStatus)}
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Users className="h-4 w-4" />
                      Suppliers
                    </div>
                    <div className="text-sm font-medium">{bids.length} responded</div>
                  </div>
                </div>
              </CardContent>
            </BaseCard>

            {/* Fuel Bids Loading State */}
            {loading.bids ? (
              <LoadingComponent size="md" text="Loading fuel bids..." />
            ) : (
              <p> DATA TABLE</p>
              // <FuelBidsDataTable onRefresh={refreshBids} isRefreshing={loading.bids} />
            )}
          </div>
        )}
      </div>
    </div>
  );
});

export default FuelTendersPage;
