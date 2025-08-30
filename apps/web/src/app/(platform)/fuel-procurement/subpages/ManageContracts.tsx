'use client';

import { LoadingComponent } from '@/components/miscellaneous/Loading';
import { Badge } from '@/components/ui/badge';
import type { FuelContract } from '@/drizzle/types';
import { createRandomFuelContract } from '@/features/fuel/contract/createRandomFuelContract';
import FuelContractDialog from '@/features/fuel/contract/FuelContractDialog';
import { formatCurrency, formatDate } from '@/lib/core/formatters';
import {
  createFuelContract,
  extractFuelContract,
  generateRandomFuelContract,
} from '@/services/fuel/fuel-contract-client';
import { Button } from '@/stories/Button/Button';
import { ContentSection } from '@/stories/Card/Card';
import { Column } from '@/stories/DataTable/DataTable';
import { FileUploadPopover } from '@/stories/Popover/Popover';
import { KeyValuePair } from '@/stories/Utilities/KeyValuePair';
import {
  AlertCircle,
  Building2,
  CheckCircle,
  Clock,
  DollarSign,
  FileText,
  RefreshCw,
  XCircle,
} from 'lucide-react';
import { memo, useState } from 'react';
import { toast } from 'sonner';
import { useFuelProcurement } from '../ContextProvider';

const getStatusBadge = (status: string | null) => {
  if (!status) return <Badge variant="secondary">Pending</Badge>;
  switch (status.toLowerCase()) {
    case 'active':
      return (
        <Badge variant="default" className="bg-green-100 text-green-800 border-green-200">
          <CheckCircle className="w-3 h-3 mr-1" />
          Active
        </Badge>
      );
    case 'expired':
      return (
        <Badge variant="destructive">
          <XCircle className="w-3 h-3 mr-1" />
          Expired
        </Badge>
      );
    case 'pending':
      return (
        <Badge variant="secondary">
          <Clock className="w-3 h-3 mr-1" />
          Pending
        </Badge>
      );
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
};

const fuelContractColumns: Column<FuelContract>[] = [
  {
    key: 'actions',
    header: 'Actions',
    accessor: (contract) => (
      <div className="flex flex-col gap-2">
        <FuelContractDialog
          contract={contract}
          onChange={() => {}}
          DialogType="view"
          buttonSize="sm"
        />
        <Button intent="secondary" text="View Invoices" size="sm" onClick={() => {}} />
        <Button intent="success" text="Renew" size="sm" onClick={() => {}} />
      </div>
    ),
    align: 'left' as const,
  },
  {
    key: 'contractInfo',
    header: 'Contract Information',
    accessor: (contract) => (
      <div className="min-w-[200px] text-sm">
        <div className="font-semibold text-slate-900">{contract.title || 'Untitled Contract'}</div>
        {contract.contractNumber && (
          <div className="text-slate-600">#{contract.contractNumber}</div>
        )}
        {contract.fuelType && (
          <Badge variant="outline" className="text-xs mt-1">
            {contract.fuelType}
          </Badge>
        )}
      </div>
    ),
    sortable: true,
    align: 'left' as const,
  },
  {
    key: 'vendor',
    header: 'Vendor',
    accessor: (contract) => (
      <div className="min-w-[160px]">
        <div className="font-semibold text-slate-900">
          {contract.vendorName || 'Unknown Vendor'}
        </div>
        {contract.vendorContactName && (
          <div className="text-sm text-slate-600">{contract.vendorContactName}</div>
        )}
        {contract.vendorContactEmail && (
          <div className="text-xs text-slate-500">{contract.vendorContactEmail}</div>
        )}
      </div>
    ),
    sortable: true,
    align: 'left' as const,
  },
  {
    key: 'pricing',
    header: 'Pricing',
    accessor: (contract) => (
      <div className="min-w-[160px]">
        <div className="font-semibold text-lg text-slate-900">
          {contract.baseUnitPrice
            ? formatCurrency(contract.baseUnitPrice, contract.currency || 'USD')
            : contract.normalizedUsdPerUsg
              ? formatCurrency(contract.normalizedUsdPerUsg, 'USD')
              : '-'}
        </div>
        <div className="text-sm text-slate-600">
          {contract.priceType && (
            <Badge variant="outline" className="text-xs mt-1">
              {contract.priceType}
            </Badge>
          )}
        </div>
      </div>
    ),
    sortable: true,
    align: 'left' as const,
  },
  {
    key: 'volume',
    header: 'Volume & Fees',
    accessor: (contract) => (
      <div className="min-w-[140px] text-sm">
        {contract.volumeCommitted && (
          <div className="text-slate-700">
            Volume: {contract.volumeCommitted} {contract.volumeUnit || 'USG'}
          </div>
        )}
        {contract.intoPlaneFee && (
          <div className="text-slate-700">
            Into-plane: {formatCurrency(contract.intoPlaneFee, contract.currency || 'USD')}
          </div>
        )}
        {!contract.volumeCommitted && !contract.intoPlaneFee && (
          <span className="text-slate-400">No volume data</span>
        )}
      </div>
    ),
    align: 'left' as const,
  },
  {
    key: 'period',
    header: 'Contract Period',
    accessor: (contract) => (
      <div className="min-w-[160px] text-sm">
        {contract.effectiveFrom && (
          <div className="text-slate-700">From: {formatDate(contract.effectiveFrom)}</div>
        )}
        {contract.effectiveTo && (
          <div className="text-slate-700">To: {formatDate(contract.effectiveTo)}</div>
        )}
        {!contract.effectiveFrom && !contract.effectiveTo && (
          <span className="text-slate-400">No period data</span>
        )}
      </div>
    ),
    align: 'left' as const,
  },
  {
    key: 'status',
    header: 'Status',
    accessor: (contract) => getStatusBadge(contract.status),
    sortable: true,
    align: 'left' as const,
  },
];

const ManageContractsPage = memo(function ManageContractsPage() {
  const {
    selectedAirport,
    fuelContracts,
    selectedFuelContract,
    setSelectedFuelContract,
    refreshFuelContracts,
    addFuelContract,
    loading,
    errors,
    clearError,
  } = useFuelProcurement();

  const [isUploading, setIsUploading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isManualDialogOpen, setIsManualDialogOpen] = useState(false);

  // Handle file upload for automatic extraction
  const handleFileUpload = async (file: File) => {
    if (!selectedAirport) {
      toast.error('Please select an airport first');
      return;
    }

    setIsUploading(true);
    try {
      const extractedData = await extractFuelContract(file);
      const newContract = await createFuelContract({
        airportId: selectedAirport.id,
        ...extractedData,
        // Convert numeric fields to strings for database compatibility
        baseUnitPrice: extractedData.baseUnitPrice?.toString() || null,
        volumeCommitted: extractedData.volumeCommitted?.toString() || null,
        intoPlaneFee: extractedData.intoPlaneFee?.toString() || null,
      });
      addFuelContract(newContract);
      toast.success('Contract extracted and added successfully');
    } catch (error) {
      console.error('Error extracting contract:', error);
      toast.error('Failed to extract contract data');
    } finally {
      setIsUploading(false);
    }
  };

  // Handle random generation
  const handleRandomGeneration = async () => {
    if (!selectedAirport) {
      toast.error('Please select an airport first');
      return;
    }

    setIsGenerating(true);
    try {
      const randomContract = await generateRandomFuelContract(selectedAirport.id);
      addFuelContract(randomContract);
      toast.success('Random contract generated successfully');
    } catch (error) {
      console.error('Error generating random contract:', error);
      toast.error('Failed to generate random contract');
    } finally {
      setIsGenerating(false);
    }
  };

  if (!selectedAirport) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-500">
        <div className="text-center">
          <h3 className="text-lg font-medium mb-2">No Airport Selected</h3>
          <p className="text-sm">
            Please select an airport from the sidebar to view fuel contracts.
          </p>
        </div>
      </div>
    );
  }

  const currentContract =
    selectedFuelContract || (fuelContracts.length > 0 ? fuelContracts[0] : null);

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-7xl mx-auto space-y-4">
        {/* Error State */}
        {errors.fuelContracts && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start">
              <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 mr-3 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="font-medium text-red-800">Error Loading Contracts</h3>
                <p className="text-sm text-red-700 mt-1">{errors.fuelContracts}</p>
                <div className="mt-3 flex gap-2">
                  <button
                    onClick={() => refreshFuelContracts()}
                    className="text-sm bg-red-100 hover:bg-red-200 text-red-800 px-3 py-1 rounded"
                  >
                    Retry
                  </button>
                  <button
                    onClick={() => clearError('fuelContracts')}
                    className="text-sm text-red-600 hover:text-red-800"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Header with Upload Options */}
        <div className="flex justify-between items-start gap-4">
          <div className="flex-1">
            <h3>Fuel Contracts</h3>
            <p>Manage fuel supply contracts for {selectedAirport.name}</p>
          </div>
          <div className="flex gap-2 shrink-0">
            <Button intent="ghost" icon={RefreshCw} size="md" onClick={refreshFuelContracts} />
            <FileUploadPopover
              onSend={handleFileUpload}
              accept=".pdf,.doc,.docx"
              maxSize={10}
              triggerButtonText="Upload Contract"
              triggerButtonIntent="primary"
              buttonSize="md"
            >
              <div className="flex flex-col gap-2 text-sm">
                <Button
                  intent="secondary"
                  text="Manually Add Contract"
                  size="sm"
                  onClick={() => setIsManualDialogOpen(true)}
                />
                <Button
                  intent="ghost"
                  text="Or generate random Quote"
                  size="sm"
                  className="text-gray-500"
                  onClick={async () => {
                    const contract = await createRandomFuelContract(selectedAirport.id);
                    addFuelContract(contract);
                  }}
                />
              </div>
            </FileUploadPopover>

            <FuelContractDialog
              contract={null}
              airportId={selectedAirport.id}
              onChange={(contract) => {
                addFuelContract(contract as FuelContract);
                setIsManualDialogOpen(false);
              }}
              DialogType="add"
              withTrigger={false}
              open={isManualDialogOpen}
              onOpenChange={setIsManualDialogOpen}
            />
          </div>
        </div>

        {/* Loading State */}
        {loading.fuelContracts && <LoadingComponent size="md" text="Loading fuel contracts..." />}

        {/* Feature Card for Selected Contract */}
        {currentContract && (
          <ContentSection
            header={
              <div className="flex flex-col gap-2">
                <div className="flex items-start gap-2 justify-between">
                  <h3>{currentContract.title || 'Untitled Contract'}</h3>
                  <div className="flex gap-2">
                    <FuelContractDialog
                      contract={currentContract}
                      onChange={() => {}}
                      DialogType="edit"
                      triggerClassName="bg-white/20 text-white-700"
                    />
                  </div>
                </div>
                <p className="text-blue-100">
                  {currentContract.aiSummary || 'No summary available'}
                </p>
              </div>
            }
          >
            <div className="grid grid-cols-9 gap-4">
              {/* Contract Information */}
              <ContentSection
                headerGradient="none"
                header={
                  <div className="flex items-start gap-2 text-foreground">
                    <div className="p-2 bg-emerald-600 rounded-xl">
                      <FileText className="w-5 h-5 text-white" />
                    </div>
                    <h4>Contract Details</h4>
                  </div>
                }
                className="col-span-3 bg-gradient-to-br from-emerald-50 to-emerald-100/50 border-emerald-200/50"
              >
                <KeyValuePair
                  label="Contract Number"
                  value={currentContract.contractNumber}
                  valueType="string"
                />
                <KeyValuePair
                  label="Fuel Type"
                  value={currentContract.fuelType}
                  valueType="string"
                />
                <KeyValuePair label="Status" value={currentContract.status} valueType="string" />
              </ContentSection>

              {/* Vendor Information */}
              <ContentSection
                className="col-span-3 bg-gradient-to-br from-blue-50 to-blue-100/50 border-blue-200/50"
                headerGradient="none"
                header={
                  <div className="flex items-start gap-2 text-foreground">
                    <div className="p-2 bg-blue-600 rounded-xl">
                      <Building2 className="w-5 h-5 text-white" />
                    </div>
                    <h4>Vendor</h4>
                  </div>
                }
              >
                <KeyValuePair
                  label="Vendor Name"
                  value={currentContract.vendorName}
                  valueType="string"
                />
                <KeyValuePair
                  label="Contact"
                  value={currentContract.vendorContactName}
                  valueType="string"
                />
                <KeyValuePair
                  label="Email"
                  value={currentContract.vendorContactEmail}
                  valueType="email"
                />
              </ContentSection>

              {/* Pricing & Volume */}
              <ContentSection
                className="col-span-3 bg-gradient-to-br from-purple-50 to-purple-100/50 border-purple-200/50"
                headerGradient="none"
                header={
                  <div className="flex items-start gap-2 text-foreground">
                    <div className="p-2 bg-purple-600 rounded-xl">
                      <DollarSign className="w-5 h-5 text-white" />
                    </div>
                    <h4>Pricing</h4>
                  </div>
                }
              >
                <KeyValuePair
                  label="Base Price"
                  value={currentContract.baseUnitPrice}
                  valueType="number"
                />
                <KeyValuePair
                  label="Volume"
                  value={currentContract.volumeCommitted}
                  valueType="number"
                />
                <KeyValuePair
                  label="Into-plane Fee"
                  value={currentContract.intoPlaneFee}
                  valueType="number"
                />
              </ContentSection>
            </div>
          </ContentSection>
        )}
      </div>
    </div>
  );
});

export default ManageContractsPage;
