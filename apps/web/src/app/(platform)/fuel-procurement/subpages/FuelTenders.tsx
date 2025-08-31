'use client';

import { LoadingComponent } from '@/components/miscellaneous/Loading';
import type { FuelTender } from '@/drizzle/types';
import TenderDialog from '@/features/fuel/tender/TenderDialog';
import { CURRENCY_MAP } from '@/lib/constants/currencies';
import { BASE_UOM_OPTIONS } from '@/lib/constants/units';
import { formatDate } from '@/lib/core/formatters';
import { deleteFuelTender } from '@/services/fuel/fuel-tender-client';
import { Button } from '@/stories/Button/Button';
import { ContentSection } from '@/stories/Card/Card';
import { ModernSelect } from '@/stories/Form/Form';
import { KeyValuePair } from '@/stories/KeyValuePair/KeyValuePair';
import { ConfirmationPopover } from '@/stories/Popover/Popover';
import { AlertCircle, CalendarIcon, Eye, Pencil, Plus, TrashIcon } from 'lucide-react';
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
            triggerClassName="min-h-12"
            disabled={!airportTenders.length}
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
          <div className="flex gap-2">
            <TenderDialog
              key="add-tender"
              trigger={<Button intent="secondary" icon={Plus} text="Add Tender" />}
              tender={null}
              airportId={selectedAirport.id}
              onChange={handleTenderAdded}
              DialogType="add"
            />
          </div>
        </div>

        {/* Loading State */}
        {loading.tenders && <LoadingComponent size="md" text="Loading fuel tenders..." />}

        {currentTender && (
          <div className="flex flex-col gap-4">
            <ContentSection
              header={
                <div className="flex flex-col gap-2">
                  <div className="flex items-start gap-2 justify-between">
                    <h3>{currentTender.title}</h3>
                    {/* Buttons */}
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
                  </div>
                  <p className="text-blue-100">
                    {currentTender.description || 'No description available'}
                  </p>
                </div>
              }
            >
              <div className="grid grid-cols-9 gap-4">
                {/* Tender Information */}
                <ContentSection
                  headerGradient="none"
                  header={
                    <div className="flex items-start gap-2 text-foreground">
                      <div className="p-2 bg-blue-600 rounded-xl">
                        <CalendarIcon className="w-5 h-5 text-white" />
                      </div>
                      <h4>Details</h4>
                    </div>
                  }
                  className="col-span-3 bg-gradient-to-br from-blue-50 to-blue-100/50 border-blue-200/50"
                >
                  <KeyValuePair
                    label="Fuel Type"
                    value={currentTender.fuelType}
                    valueType="string"
                  />
                  <KeyValuePair
                    label="Currency"
                    value={CURRENCY_MAP[currentTender.baseCurrency || '']?.display}
                    valueType="string"
                  />
                  <KeyValuePair
                    label="Base UOM"
                    value={
                      BASE_UOM_OPTIONS.find((uom) => uom.value === currentTender.baseUom)?.label ||
                      ''
                    }
                    valueType="string"
                  />
                </ContentSection>

                {/* Timeline */}
                <ContentSection
                  className="col-span-4 bg-gradient-to-br from-purple-50 to-purple-100/50 border-purple-200/50"
                  headerGradient="none"
                  header={
                    <div className="flex items-start gap-2 text-foreground">
                      <div className="p-2 bg-purple-600 rounded-xl">
                        <CalendarIcon className="w-5 h-5 text-white" />
                      </div>
                      <h4>Timeline</h4>
                    </div>
                  }
                >
                  <div className="flex flex-row gap-8 justify-between">
                    <div className="flex flex-col gap-2 w-1/2">
                      <h4 className="font-bold">Bidding Period</h4>
                      <div className="flex flex-col">
                        <KeyValuePair
                          label="Starts"
                          value={
                            currentTender.biddingStarts
                              ? formatDate(currentTender.biddingStarts)
                              : 'TBD'
                          }
                          valueType="date"
                        />
                        <KeyValuePair
                          label="Ends"
                          value={
                            currentTender.biddingEnds
                              ? formatDate(currentTender.biddingEnds)
                              : 'TBD'
                          }
                          valueType="date"
                        />
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 w-1/2">
                      <h4 className="font-bold">Delivery Period</h4>
                      <div className="flex flex-col">
                        <KeyValuePair
                          label="Starts"
                          value={
                            currentTender.deliveryStarts
                              ? formatDate(currentTender.deliveryStarts)
                              : 'TBD'
                          }
                          valueType="date"
                        />
                        <KeyValuePair
                          label="Ends"
                          value={
                            currentTender.deliveryEnds
                              ? formatDate(currentTender.deliveryEnds)
                              : 'TBD'
                          }
                          valueType="date"
                        />
                      </div>
                    </div>
                  </div>
                </ContentSection>

                {/* Quick Stats */}
                <ContentSection
                  className="col-span-2 bg-gradient-to-br from-orange-50 to-orange-100/50 border-orange-200/50"
                  headerGradient="none"
                  header={
                    <div className="flex items-start gap-2 text-foreground">
                      <div className="p-2 bg-orange-600 rounded-xl">
                        <CalendarIcon className="w-5 h-5 text-white" />
                      </div>
                      <h4>Summary</h4>
                    </div>
                  }
                >
                  <KeyValuePair
                    keyClassName="max-w-1/2"
                    label="Total Bids"
                    value={fuelBids.length}
                    valueType="number"
                  />
                  <KeyValuePair
                    keyClassName="max-w-1/2"
                    label="Accepted"
                    value={
                      fuelBids.filter(
                        (bid) =>
                          bid.decision?.toLowerCase() === 'accepted' ||
                          bid.decision?.toLowerCase() === 'winner',
                      ).length
                    }
                    valueType="number"
                  />
                  <KeyValuePair
                    keyClassName="max-w-1/2"
                    label="Pending"
                    value={
                      fuelBids.filter(
                        (bid) => !bid.decision || bid.decision.toLowerCase() === 'pending',
                      ).length
                    }
                    valueType="number"
                  />
                </ContentSection>
              </div>
            </ContentSection>

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
