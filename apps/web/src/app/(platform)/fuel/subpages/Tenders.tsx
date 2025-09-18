'use client';

import { LoadingComponent } from '@/components/miscellaneous/Loading';
import { getProcessStatusDisplay } from '@/drizzle/enums';
import type { FuelBid, FuelTender } from '@/drizzle/types';
import TenderDialog from '@/features/fuel/tender/TenderDialog';
import { CURRENCY_MAP } from '@/lib/constants/currencies';
import { BASE_UOM_OPTIONS } from '@/lib/constants/units';
import { formatDate } from '@/lib/core/formatters';
import { client as fuelBidClient } from '@/modules/fuel/bids';
import { client as fuelTenderClient } from '@/modules/fuel/tenders';
import { Button } from '@/stories/Button/Button';
import { BaseCard } from '@/stories/Card/Card';
import { ModernSelect } from '@/stories/Form/Form';
import { ConfirmationPopover, FileUploadPopover } from '@/stories/Popover/Popover';
import { StatusBadge } from '@/stories/StatusBadge/StatusBadge';
import { ModernTimeline } from '@/stories/Timeline/Timeline';
import {
  AlertCircle,
  AlertTriangle,
  BarChart3,
  Calendar,
  CheckCircle,
  Coins,
  Download,
  Eye,
  FileText,
  Fuel,
  Pencil,
  Plus,
  ReceiptText,
  Ruler,
  Settings,
  TrashIcon,
  TrendingUpDown,
  Upload,
  Users,
} from 'lucide-react';
import { memo } from 'react';
import { toast } from 'sonner';
import { useFuelBidColumns } from '../_components/FuelBidsDataTableColumns';
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
    setUploadDocument,
  } = useFuelProcurement();
  const selectedAirport = airports[0];
  const fuelBidColumns = useFuelBidColumns();

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
      refreshTenders();
    } catch (error) {
      toast.error('Error deleting tender');
    }
  };

  // Handle file upload for contract extraction
  const handleBidFileUpload = async (file: File) => {
    if (!selectedTender?.id) {
      toast.error('No tender selected');
      return;
    }
    setUploadDocument(true);
    try {
      // Extract the fuel bid
      await fuelBidClient.ExtractFuelBid(selectedTender.id, file);
      toast.success('Document has been uploaded');
      // Refresh bids to get the newly created bid and update both cache and UI
      await refreshBids();
    } catch (error) {
      toast.error('Failed to process fuel bid file');
      console.error(error);
    } finally {
      setUploadDocument(false);
    }
  };

  if (!selectedAirport) return null;

  const currentTender = selectedTender || (tenders.length > 0 ? tenders[0] : null);

  return (
    <div className="space-y-4">
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

      {/* Tender Selection */}
      <div className="flex justify-between gap-2 items-center">
        <div className="flex flex-row gap-2 items-center">
          Choose Tender:{' '}
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
        </div>
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

      {/* Tender Header Card */}
      {currentTender && (
        <BaseCard
          title={currentTender.title}
          subtitle={`${currentTender.fuelType} • ${currentTender.projectedAnnualVolume?.toLocaleString()} ${currentTender.baseUom} • ${currentTender.baseCurrency}`}
          headerClassName="from-[#7f7fd5] via-[#86a8e7] to-[#91eae4] opacity-80 text-white"
          actions={
            <div className="flex flex-wrap gap-2">
              <TenderDialog
                trigger={<Button intent="secondary" icon={Eye} text="View" />}
                tender={currentTender}
                onChange={handleTenderUpdated}
                DialogType="view"
              />
              <TenderDialog
                trigger={<Button intent="secondary" icon={Pencil} text="Edit" />}
                tender={currentTender}
                onChange={handleTenderUpdated}
                DialogType="edit"
              />
              <ConfirmationPopover
                trigger={<Button intent="secondary" icon={TrashIcon} text="Delete" />}
                onConfirm={handleTenderDelete}
                title="Delete Tender"
                popoverIntent="danger"
                description="Are you sure you want to delete this tender?"
              />
            </div>
          }
        >
          <TenderDetails currentTender={currentTender} bids={bids} />
        </BaseCard>
      )}

      {/* Bids Section */}
      {currentTender && (
        <div className="space-y-6">
          {/* Bid Inbox */}
          <BaseCard
            title="Bid Inbox"
            subtitle="Upload and manage fuel bids with drag and drop"
            headerClassName="from-[#7f7fd5] via-[#86a8e7] to-[#91eae4] opacity-80 text-white"
            actions={
              <div className="flex gap-2">
                <FileUploadPopover
                  trigger={
                    <Button
                      intent="add"
                      icon={Upload}
                      text="Upload Bid"
                      disabled={loading.uploadDocument}
                    />
                  }
                  onSend={handleBidFileUpload}
                  accept=".pdf,.doc,.docx"
                  maxSize={10}
                  onOpenChange={(open) => console.log('Fuel bid upload popover open:', open)}
                />
                <Button intent="secondary" text="Email Routing" icon={FileText} />
              </div>
            }
          >
            <div className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-700 mb-2">
                  Drag & Drop Bid Documents
                </h3>
                <p className="text-sm text-gray-500 mb-4">
                  Upload PDF bid documents for automatic parsing and normalization
                </p>
                <div className="text-xs text-gray-400">
                  Supported formats: PDF, DOC, DOCX (Max 10MB)
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="h-4 w-4 text-blue-600" />
                  <span className="font-medium text-blue-800">Email Routing Note</span>
                </div>
                <p className="text-sm text-blue-700">
                  Forward bid emails to procurement@company.com with tender ID {currentTender.id} in
                  the subject line for automatic processing.
                </p>
              </div>
            </div>
          </BaseCard>

          {/* Parsed Bids Table */}
          <BaseCard
            title="Parsed Bids Table"
            subtitle="Normalized bid comparison with AI confidence scores"
            headerClassName="from-[#7f7fd5] via-[#86a8e7] to-[#91eae4] opacity-80 text-white"
            actions={
              <div className="flex gap-2">
                <Button intent="secondary" text="Export to Excel" icon={Download} />
                <Button intent="primary" text="Approve Winning Bid" icon={CheckCircle} />
              </div>
            }
          >
            {loading.bids ? (
              <LoadingComponent size="md" text="Loading fuel bids..." />
            ) : bids.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-gray-500">
                <FileText className="h-12 w-12 mb-4" />
                <h3 className="text-lg font-medium mb-2">No Bids Received</h3>
                <p className="text-sm">Upload bid documents to see parsed results here.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Table Header */}
                <div className="grid grid-cols-12 gap-4 p-3 bg-gray-50 rounded-lg font-medium text-sm text-gray-700">
                  <div className="col-span-2">Supplier</div>
                  <div className="col-span-1">Price Type</div>
                  <div className="col-span-2">Base Price/Index</div>
                  <div className="col-span-1">Into Plane</div>
                  <div className="col-span-1">Handling</div>
                  <div className="col-span-1">Inclusions</div>
                  <div className="col-span-1">All-in Price</div>
                  <div className="col-span-1">AI Confidence</div>
                  <div className="col-span-1">Status</div>
                </div>

                {/* Table Rows */}
                {bids.map((bid) => (
                  <div
                    key={bid.id}
                    className="grid grid-cols-12 gap-4 p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
                  >
                    <div className="col-span-2 flex items-center">
                      <span className="font-medium">{bid.vendorName || 'Unknown Supplier'}</span>
                    </div>
                    <div className="col-span-1 flex items-center">
                      <span className="text-sm">{bid.priceType || 'Fixed'}</span>
                    </div>
                    <div className="col-span-2 flex items-center">
                      <span className="text-sm">
                        {bid.priceType === 'index_formula'
                          ? `${bid.indexName} ${Number(bid.differential)?.toFixed(3) || '0.000'}`
                          : `$${Number(bid.baseUnitPrice)?.toFixed(3) || '0.000'}/L`}
                      </span>
                    </div>
                    <div className="col-span-1 flex items-center">
                      <span className="text-sm">
                        ${Number(bid.intoPlaneFee)?.toFixed(3) || '0.000'}
                      </span>
                    </div>
                    <div className="col-span-1 flex items-center">
                      <span className="text-sm">
                        ${Number(bid.handlingFee)?.toFixed(3) || '0.000'}
                      </span>
                    </div>
                    <div className="col-span-1 flex items-center">
                      <div className="flex gap-1">
                        {bid.includesTaxes && <CheckCircle className="h-4 w-4 text-green-600" />}
                        {bid.includesAirportFees && (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        )}
                      </div>
                    </div>
                    <div className="col-span-1 flex items-center">
                      <span className="font-medium text-blue-600">$0.645/L</span>
                    </div>
                    <div className="col-span-1 flex items-center">
                      <StatusBadge
                        status={bid.aiSummary ? 'success' : 'warning'}
                        text={bid.aiSummary ? '95%' : 'Pending'}
                      />
                    </div>
                    <div className="col-span-1 flex items-center">
                      <StatusBadge
                        status={
                          bid.decision === 'accepted'
                            ? 'success'
                            : bid.decision === 'rejected'
                              ? 'danger'
                              : 'secondary'
                        }
                        text={bid.decision || 'Pending'}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </BaseCard>

          {/* Comparator Matrix */}
          <BaseCard
            title="Comparator Matrix"
            subtitle="Advanced bid comparison with normalization toggles"
            headerClassName="from-[#7f7fd5] via-[#86a8e7] to-[#91eae4] opacity-80 text-white"
            actions={
              <div className="flex gap-2">
                <Button intent="secondary" text="Export Comparison" icon={Download} />
                <Button intent="primary" text="Shortlist Suppliers" icon={CheckCircle} />
              </div>
            }
          >
            <div className="space-y-4">
              {/* Toggle Controls */}
              <div className="flex flex-wrap gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="normalize-currency"
                    defaultChecked
                    className="rounded"
                  />
                  <label htmlFor="normalize-currency" className="text-sm font-medium">
                    Normalize to base currency
                  </label>
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="normalize-unit" defaultChecked className="rounded" />
                  <label htmlFor="normalize-unit" className="text-sm font-medium">
                    Normalize to base unit
                  </label>
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="include-taxes" defaultChecked className="rounded" />
                  <label htmlFor="include-taxes" className="text-sm font-medium">
                    Include taxes
                  </label>
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="include-fees" defaultChecked className="rounded" />
                  <label htmlFor="include-fees" className="text-sm font-medium">
                    Include airport fees
                  </label>
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="market-reference" className="rounded" />
                  <label htmlFor="market-reference" className="text-sm font-medium">
                    Overlay market reference
                  </label>
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="anomaly-flag" className="rounded" />
                  <label htmlFor="anomaly-flag" className="text-sm font-medium">
                    Z-score anomaly flag
                  </label>
                </div>
              </div>

              {/* Comparison Table */}
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="border border-gray-200 p-3 text-left font-medium">Supplier</th>
                      <th className="border border-gray-200 p-3 text-center font-medium">
                        Normalized Price
                      </th>
                      <th className="border border-gray-200 p-3 text-center font-medium">
                        vs Market
                      </th>
                      <th className="border border-gray-200 p-3 text-center font-medium">
                        Z-Score
                      </th>
                      <th className="border border-gray-200 p-3 text-center font-medium">
                        Anomaly
                      </th>
                      <th className="border border-gray-200 p-3 text-center font-medium">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {bids.map((bid) => (
                      <tr key={bid.id} className="hover:bg-gray-50">
                        <td className="border border-gray-200 p-3 font-medium">
                          {bid.vendorName || 'Unknown'}
                        </td>
                        <td className="border border-gray-200 p-3 text-center">$0.645/L</td>
                        <td className="border border-gray-200 p-3 text-center">
                          <span className="text-green-600">-2.3%</span>
                        </td>
                        <td className="border border-gray-200 p-3 text-center">-0.8</td>
                        <td className="border border-gray-200 p-3 text-center">
                          <StatusBadge status="success" text="Normal" />
                        </td>
                        <td className="border border-gray-200 p-3 text-center">
                          <div className="flex justify-center gap-1">
                            <Button intent="ghost" icon={Eye} />
                            <Button intent="ghost" icon={Settings} />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Market Reference Info */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <BarChart3 className="h-4 w-4 text-blue-600" />
                  <span className="font-medium text-blue-800">Market Reference</span>
                </div>
                <p className="text-sm text-blue-700">
                  Current market price: $0.661/L (Platts Jet A-1 Med) • Last updated: Jan 20, 2024
                </p>
              </div>
            </div>
          </BaseCard>
        </div>
      )}
    </div>
  );
});

export default FuelTendersPage;

const TenderDetails = memo(function TenderDetails({
  currentTender,
  bids,
}: {
  currentTender: FuelTender;
  bids: FuelBid[];
}) {
  return (
    <BaseCard className="shadow-none border-none p-0">
      {/* Responsive Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column - Static/Dry Facts */}
        <div className="space-y-6">
          {/* Tender Timeline */}
          <div className="bg-slate-50 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <Calendar className="h-4 w-4" />
              <p className="font-semibold">Tender Timeline</p>
            </div>
            <ModernTimeline
              orientation="horizontal"
              items={[
                {
                  id: '1',
                  title: 'RFQ Sent',
                  timestamp: formatDate(currentTender.biddingStarts),
                  status: 'current',
                },
                {
                  id: '2',
                  title: 'Bids Due',
                  timestamp: formatDate(currentTender.biddingEnds),
                  status: 'current',
                },
                {
                  id: '3',
                  title: 'Evaluation',
                  timestamp: 'TBA',
                  status: 'current',
                },
                {
                  id: '4',
                  title: 'Award',
                  timestamp: 'TBA',
                  status: 'current',
                },
              ]}
            />
          </div>

          {/* Agreement Period */}
          <div className="bg-slate-50 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <Calendar className="h-4 w-4" />
              <p className="font-semibold">Agreement Period</p>
            </div>
            <ModernTimeline
              orientation="horizontal"
              items={[
                {
                  id: '1',
                  title: 'Starts',
                  timestamp: formatDate(currentTender.biddingStarts),
                  status: 'pending',
                },
                {
                  id: '2',
                  title: 'Ends',
                  timestamp: formatDate(currentTender.biddingEnds),
                  status: 'current',
                },
              ]}
            />
          </div>

          {/* Static Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                {currentTender.projectedAnnualVolume
                  ? currentTender.projectedAnnualVolume?.toLocaleString() +
                      ' ' +
                      BASE_UOM_OPTIONS.find((uom) => uom.value === currentTender.baseUom)?.label ||
                    ''
                  : 'N/A'}
              </div>
            </div>

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
                {BASE_UOM_OPTIONS.find((uom) => uom.value === currentTender.baseUom)?.label || ''}
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <ReceiptText className="h-4 w-4" />
                Quality Specification
              </div>
              <p className="text-sm text-gray-600">
                {currentTender.qualitySpecification || 'ASTM D1655'}
              </p>
            </div>
          </div>
        </div>

        {/* Right Column - Dynamic Data */}
        <div className="space-y-6">
          {/* Status and Activity */}
          <div className="bg-blue-50 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <FileText className="h-4 w-4 text-blue-600" />
              <p className="font-semibold text-blue-800">Current Status</p>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-blue-700">Process Status</span>
                <StatusBadge
                  status="operational"
                  text={getProcessStatusDisplay(currentTender.processStatus)}
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-blue-700">Bidding Phase</span>
                <span className="text-sm font-medium text-blue-800">Active</span>
              </div>
            </div>
          </div>

          {/* Bids and Responses */}
          <div className="bg-green-50 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <Users className="h-4 w-4 text-green-600" />
              <p className="font-semibold text-green-800">Bid Responses</p>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-green-700">Total Responses</span>
                <span className="text-lg font-bold text-green-800">{bids.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-green-700">Valid Bids</span>
                <span className="text-sm font-medium text-green-800">
                  {bids.filter((bid) => bid.aiSummary).length}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-green-700">Pending Review</span>
                <span className="text-sm font-medium text-green-800">
                  {bids.filter((bid) => !bid.aiSummary).length}
                </span>
              </div>
            </div>
          </div>

          {/* Documents and Attachments */}
          <div className="bg-purple-50 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <FileText className="h-4 w-4 text-purple-600" />
              <p className="font-semibold text-purple-800">Documents</p>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-purple-700">RFQ Document</span>
                <Button intent="ghost" text="View" icon={Eye} size="sm" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-purple-700">Specifications</span>
                <Button intent="ghost" text="View" icon={Eye} size="sm" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </BaseCard>
  );
});
