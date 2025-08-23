'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { formatDate } from '@/lib/core/formatters';
import { Button } from '@/stories/Button/Button';
import {
  AlertCircle,
  CalendarIcon,
  ClockIcon,
  DollarSignIcon,
  FuelIcon,
  Loader2,
  PencilIcon,
  PlusIcon,
  TrendingUpIcon,
} from 'lucide-react';
import { useState } from 'react';
import { useFuelProcurement } from '../ContextProvider';

export default function FuelTendersPage() {
  const {
    selectedAirport,
    airportTenders,
    selectedTender,
    selectTenderById,
    loading,
    errors,
    clearError,
    refreshTenders,
  } = useFuelProcurement();

  const [showTenderDropdown, setShowTenderDropdown] = useState(false);

  if (!selectedAirport) return null;

  const currentTender = selectedTender || airportTenders[0];
  const availableTenders = airportTenders.length > 0 ? airportTenders : [];

  if (!currentTender) return null;

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-7xl mx-auto space-y-4">
        {/* Loading State */}
        {loading.tenders && (
          <div className="flex items-center justify-center p-8">
            <Loader2 className="w-6 h-6 animate-spin mr-3" />
            <span className="text-gray-600">Loading fuel tenders...</span>
          </div>
        )}

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

        <div className="flex justify-between gap-2 items-center">
          /**TODO - make the ModerSelect work */
          {/* <ModernSelect
            onValueChange={selectTenderById}
            value={selectedTender?.id}
            options={airportTenders.map((tender) => (
              <SelectItem key={tender.id} value={tender.id} className="cursor-pointer">
                {tender.title}
              </SelectItem>
            ))}
          /> */}
          <Select onValueChange={selectTenderById} value={selectedTender?.id}>
            <SelectTrigger
              className="cursor-
            pointer text-gray-700 font-semibold"
            >
              <SelectValue placeholder="Select a tender" />
            </SelectTrigger>
            <SelectContent>
              {airportTenders.map((tender) => (
                <SelectItem key={tender.id} value={tender.id} className="cursor-pointer">
                  {tender.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex gap-2">
            <Button intent="add" icon={PlusIcon} text="Add New Tender" onClick={() => {}} />
          </div>
        </div>

        {/* Tender Information Card */}
        {!loading.tenders && !errors.tenders && (
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl border border-gray-200/50 shadow-lg overflow-hidden">
            {/* Header with gradient */}
            <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-700 p-4 text-white">
              <div className="flex flex-col gap-2">
                <div className="flex items-start gap-2 justify-between">
                  <h3>{currentTender.title}</h3>
                  <Button
                    intent="secondary"
                    icon={PencilIcon}
                    text="Edit Tender"
                    onClick={() => {}}
                    className="bg-white/20 text-white-700"
                  />
                </div>
                <p className="text-blue-100">
                  {currentTender.description || 'No description available'}
                </p>
              </div>
            </div>
            {/* Content Sections */}
            <div className="p-4">
              <div className="grid grid-cols-7 gap-4">
                {/* Tender Information */}
                <div className="col-span-2 bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-2xl p-4 border border-blue-200/50">
                  <div className="flex items-start gap-2 mb-2">
                    <div className="p-2 bg-blue-600 rounded-xl">
                      <FuelIcon className="w-4 h-4 text-white" />
                    </div>
                    <h4>Tender Information</h4>
                  </div>
                  <div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Fuel Type:</span>
                      <span className="font-semibold text-gray-900">
                        {currentTender.fuelType || 'Jet A-1'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Base Currency:</span>
                      <span className="font-semibold text-gray-900">
                        {currentTender.baseCurrency || 'USD'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Base UOM:</span>
                      <span className="font-semibold text-gray-900">
                        {currentTender.baseUom || 'USG'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Timeline */}
                <div className="col-span-3 bg-gradient-to-br from-purple-50 to-purple-100/50 rounded-2xl p-4 border border-purple-200/50">
                  <div className="flex items-start gap-2 mb-4">
                    <div className="p-2 bg-purple-600 rounded-xl">
                      <ClockIcon className="w-4 h-4 text-white" />
                    </div>
                    <h4>Timeline</h4>
                  </div>
                  <div className="flex justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <CalendarIcon className="w-4 h-4 text-purple-600" />
                        <span className="text-sm font-semibold text-gray-900">Bidding Period</span>
                      </div>
                      <div className="text-sm text-gray-600 ml-6">
                        <div>
                          Starts:{' '}
                          {currentTender.biddingStarts
                            ? formatDate(currentTender.biddingStarts)
                            : 'TBD'}
                        </div>
                        <div>
                          Ends:{' '}
                          {currentTender.biddingEnds
                            ? formatDate(currentTender.biddingEnds)
                            : 'TBD'}
                        </div>
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <TrendingUpIcon className="w-4 h-4 text-purple-600" />
                        <span className="text-sm font-semibold text-gray-900">Delivery Period</span>
                      </div>
                      <div className="text-sm text-gray-600 ml-6">
                        <div>
                          Starts:{' '}
                          {currentTender.deliveryStarts
                            ? formatDate(currentTender.deliveryStarts)
                            : 'TBD'}
                        </div>
                        <div>
                          Ends:{' '}
                          {currentTender.deliveryEnds
                            ? formatDate(currentTender.deliveryEnds)
                            : 'TBD'}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="col-span-2 bg-gradient-to-br from-orange-50 to-orange-100/50 rounded-2xl p-4 border border-orange-200/50">
                  <div className="flex items-start gap-2 mb-2">
                    <div className="p-2 bg-orange-600 rounded-xl">
                      <DollarSignIcon className="w-4 h-4 text-white" />
                    </div>
                    <h4>Bid Summary</h4>
                  </div>
                  <div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Bids:</span>
                      <span className="font-semibold text-orange-600">0</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Shortlisted:</span>
                      <span className="font-semibold text-blue-600">0</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Pending:</span>
                      <span className="font-semibold text-yellow-600">0</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
