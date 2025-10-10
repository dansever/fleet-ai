'use client';

import { LoadingComponent } from '@/components/miscellaneous/Loading';
import { Badge } from '@/components/ui/badge';
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field';
import { getProcessStatusDisplay } from '@/drizzle/enums';
import type { FuelBid, FuelTender } from '@/drizzle/types';
import TenderDialog from '@/features/fuel/tender/TenderDialog';
import { generateRandomFuelBid } from '@/features/generateRandomObjects/fuel-bid';
import { CURRENCY_MAP } from '@/lib/constants/currencies';
import { BASE_UOM_OPTIONS } from '@/lib/constants/units';
import { formatDate } from '@/lib/core/formatters';
import { client as fuelBidClient } from '@/modules/fuel/bids';
import { client as fuelTenderClient } from '@/modules/fuel/tenders';
import { Button } from '@/stories/Button/Button';
import { BaseCard } from '@/stories/Card/Card';
import { DataTable } from '@/stories/DataTable/DataTable';
import { ModernSelect } from '@/stories/Form/Form';
import { ConfirmationPopover, FileUploadPopover } from '@/stories/Popover/Popover';
import { StatusBadge } from '@/stories/StatusBadge/StatusBadge';
import {
  AlertCircle,
  Calendar,
  Circle,
  Copy,
  Download,
  Eye,
  FileText,
  Pencil,
  Plus,
  RefreshCw,
  TrashIcon,
  Upload,
  Users,
  WandSparkles,
} from 'lucide-react';
import { memo, useState } from 'react';
import { toast } from 'sonner';
import ConversionLoadingOverlay from '../_components/ConversionLoadingOverlay';
import { useFuelBidColumns } from '../_components/FuelBidsDataTableColumns';
import { NormalizedBidTable } from '../_components/NormalizedBidTable';
import { useFuelProcurement } from '../contexts';
import { copyBidsToClipboard, downloadBidsAsCSV } from '../utils/spreadsheetExport';

const FuelTendersPage = memo(function TendersPage() {
  const {
    airports,
    tenders,
    bids,
    convertedBids,
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
    conversionProgress,
    convertBidsToBase,
  } = useFuelProcurement();
  const selectedAirport = airports[0];
  const fuelBidColumns = useFuelBidColumns();
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [loadingAgent, setLoadingAgent] = useState(false);

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

  const handleGenerateRandomBid = async () => {
    if (!selectedTender?.id) return;
    try {
      const newBid = await generateRandomFuelBid(selectedTender?.id);
      addBid(newBid as FuelBid);
      toast.success('Random bid generated successfully');
    } catch (error) {
      toast.error('Failed to generate random bid');
      console.error(error);
    }
  };

  const handleConvertUnits = async () => {
    if (!currentTender || bids.length === 0) {
      toast.error('No tender or bids to convert');
      return;
    }

    try {
      await convertBidsToBase();
      toast.success(
        `Converted ${bids.length} bids to ${currentTender.baseCurrency}/${currentTender.baseUom}`,
      );
    } catch (error) {
      toast.error('Failed to convert bids');
      console.error(error);
    }
  };

  const handleDownloadCSV = () => {
    if (bids.length === 0) {
      toast.error('No bids to export');
      return;
    }
    try {
      downloadBidsAsCSV(bids, currentTender);
      toast.success('Bids exported successfully');
    } catch (error) {
      toast.error('Failed to export bids');
      console.error(error);
    }
  };

  const handleCopyToClipboard = async () => {
    if (bids.length === 0) {
      toast.error('No bids to copy');
      return;
    }
    try {
      await copyBidsToClipboard(bids);
      toast.success('Bids copied to clipboard');
    } catch (error) {
      toast.error('Failed to copy bids to clipboard');
      console.error(error);
    }
  };

  const currentTender = selectedTender || (tenders.length > 0 ? tenders[0] : null);

  if (!selectedAirport) return null;

  return (
    <div className="space-y-4">
      {/* Conversion Loading Overlay */}
      <ConversionLoadingOverlay progress={conversionProgress!} isVisible={loading.convertingBids} />
      {/* Error State */}
      {errors.tenders && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start">
            <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 mr-3 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="font-medium text-red-800">Error loading tenders</h3>
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
              <h3 className="font-medium text-red-800">Error loading fuel bids</h3>
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
          Choose tender:{' '}
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
                <div key={tender.id} className="flex flex-col text-left whitespace-normal">
                  <span className="font-bold">{tender.title}</span>
                  <span className="text-xs text-muted-foreground">
                    {tender.submissionStarts && tender.submissionEnds
                      ? `${formatDate(tender.submissionStarts)} - ${formatDate(tender.submissionEnds)}`
                      : ''}
                  </span>
                </div>
              ),
            }))}
          />
        </div>
        <TenderDialog
          key="add-tender"
          trigger={<Button intent="secondary" icon={Plus} text="Add tender" />}
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
          subtitle={`${currentTender.fuelType} • ${currentTender.forecastVolume?.toLocaleString()} ${currentTender.baseUom} • ${currentTender.baseCurrency}`}
          headerClassName="from-blue-400 via-cyan-400 to-teal-300 text-white"
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
          {/* Parsed Bids Table */}
          <BaseCard
            title="Bids table"
            subtitle="Bid comparison with AI summary"
            actions={
              <div className="flex flex-wrap gap-2 justify-end">
                <FileUploadPopover
                  trigger={
                    <Button
                      intent="add"
                      icon={Upload}
                      text="Upload bid"
                      disabled={loading.uploadDocument}
                      size="sm"
                    />
                  }
                  onSend={handleBidFileUpload}
                  accept=".pdf,.doc,.docx"
                  maxSize={10}
                >
                  <Button
                    intent="ghost"
                    text="Or generate a random bid"
                    icon={WandSparkles}
                    className="hover:underline"
                    size="sm"
                    onClick={handleGenerateRandomBid}
                  />
                </FileUploadPopover>
                <Button
                  intent="secondary"
                  text="Download CSV"
                  icon={Download}
                  size="sm"
                  onClick={handleDownloadCSV}
                  disabled={bids.length === 0}
                />
                <Button
                  intent="secondary"
                  text="Copy to clipboard"
                  icon={Copy}
                  size="sm"
                  onClick={handleCopyToClipboard}
                  disabled={bids.length === 0}
                />
              </div>
            }
          >
            {loading.bids ? (
              <LoadingComponent size="md" text="Loading fuel bids..." />
            ) : bids.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-gray-500">
                <FileText className="h-12 w-12 mb-4" />
                <h3 className="text-lg font-medium mb-2">No bids received</h3>
                <p className="text-sm">Upload bid documents to see parsed results here.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1">
                <DataTable
                  csvDownload={false}
                  columns={fuelBidColumns}
                  data={bids}
                  tabs={[
                    { label: 'Round 1', icon: <Circle />, value: '1' },
                    { label: 'Round 2', icon: <Circle />, value: '2' },
                    { label: 'Round 3', icon: <Circle />, value: '3' },
                  ]}
                />
              </div>
            )}
          </BaseCard>

          <BaseCard
            title="Normalized bids"
            subtitle="Bids converted to tender base currency and units"
            actions={
              <div className="flex flex-wrap gap-2 justify-end">
                <Button
                  intent="primary"
                  size="sm"
                  text="Convert units"
                  icon={RefreshCw}
                  onClick={handleConvertUnits}
                  disabled={!currentTender || bids.length === 0 || loading.convertingBids}
                  isLoading={loading.convertingBids}
                />
              </div>
            }
          >
            <NormalizedBidTable
              currentTender={currentTender}
              bids={bids}
              convertedBids={convertedBids}
            />
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
  const biddingPhase =
    currentTender?.submissionStarts && currentTender?.submissionEnds
      ? new Date(currentTender.submissionStarts) > new Date()
        ? 'Active'
        : 'Inactive'
      : 'Inactive';

  const baseUom = BASE_UOM_OPTIONS.find((uom) => uom.value === currentTender.baseUom);

  return (
    <div className="space-y-2 flex flex-col gap-2 w-full">
      <FieldGroup className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Field className="bg-gradient-to-br from-purple-100 to-orange-100 p-2 rounded-xl">
          <FieldLabel>Timelines</FieldLabel>
          <FieldContent className="gap-4">
            <InfoItem
              icon={<Calendar />}
              label="Tender timeline"
              value={`${formatDate(currentTender.submissionStarts)} - ${formatDate(currentTender.submissionEnds)}`}
            />
            <InfoItem
              icon={<Calendar />}
              label="Agreement period"
              value={`${formatDate(currentTender.deliveryStarts)} - ${formatDate(currentTender.deliveryEnds)}`}
            />
          </FieldContent>
        </Field>
        <Field className="gap-1 bg-slate-100 rounded-xl p-2">
          <FieldLabel>Fuel type</FieldLabel>
          <FieldContent>{currentTender.fuelType}</FieldContent>
        </Field>

        <Field className="gap-1 bg-slate-100 rounded-xl p-2">
          <FieldLabel>Volume forecast</FieldLabel>
          <FieldContent>
            {currentTender.forecastVolume
              ? currentTender.forecastVolume?.toLocaleString() + ' ' + baseUom?.value || ''
              : 'N/A'}
          </FieldContent>
        </Field>

        <Field className="gap-1 bg-slate-100 rounded-xl p-2">
          <FieldLabel>Quality specification</FieldLabel>
          <FieldContent>{currentTender.qualitySpecification || 'ASTM D1655'}</FieldContent>
        </Field>

        <Field className="bg-slate-100 rounded-xl p-2">
          <FieldLabel>Base units</FieldLabel>
          <Field className="flex flex-col lg:flex-row">
            <FieldDescription>Currency</FieldDescription>
            <FieldContent>
              <Badge>{CURRENCY_MAP[currentTender.baseCurrency || '']?.display}</Badge>
            </FieldContent>
          </Field>
          <Field className="flex flex-col lg:flex-row">
            <FieldDescription>Unit of measure</FieldDescription>
            <FieldContent>
              <Badge>{baseUom?.label || ''}</Badge>
            </FieldContent>
          </Field>
        </Field>
      </FieldGroup>

      <div className="space-y-2 flex flex-row grid grid-cols-3 gap-2">
        {/* Status and Activity */}
        <div className="bg-blue-50 rounded-xl px-4 py-2 col-span-1">
          <div className="flex items-center gap-2 mb-3">
            <FileText className="h-4 w-4 text-blue-600" />
            <p className="font-semibold text-blue-800">Current status</p>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-blue-700">Process status</span>
              <StatusBadge
                status="operational"
                text={getProcessStatusDisplay(currentTender.processStatus)}
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-blue-700">Bidding phase</span>
              <span className="text-sm font-medium text-blue-800">{biddingPhase}</span>
            </div>
          </div>
        </div>

        {/* Bids and Responses */}
        <div className="bg-green-50 rounded-xl px-4 py-2 col-span-1">
          <div className="flex items-center gap-2 mb-3">
            <Users className="h-4 w-4 text-green-600" />
            <p className="font-semibold text-green-800">Bid responses</p>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-green-700">Total responses</span>
              <span className="text-lg font-bold text-green-800">{bids.length}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-green-700">Valid bids</span>
              <span className="text-sm font-medium text-green-800">
                {bids.filter((bid) => bid.aiSummary).length}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-green-700">Pending review</span>
              <span className="text-sm font-medium text-green-800">
                {bids.filter((bid) => !bid.aiSummary).length}
              </span>
            </div>
          </div>
        </div>

        {/* Documents and Attachments */}
        <div className="bg-purple-50 rounded-xl px-4 py-2 col-span-1">
          <div className="flex items-center gap-2 mb-3">
            <FileText className="h-4 w-4 text-purple-600" />
            <p className="font-semibold text-purple-800">Documents</p>
          </div>
          <div className="space-y-0">
            <div className="flex items-center justify-between">
              <span className="text-sm text-purple-700">RFQ document</span>
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
  );
});

function InfoItem({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="p-2 bg-blue-50 rounded-lg text-blue-600 mt-0.5">{icon}</div>
      <div>
        <div className="text-sm text-gray-600 mb-1">{label}</div>
        <div className="text-sm font-semibold text-gray-900">{value}</div>
      </div>
    </div>
  );
}
