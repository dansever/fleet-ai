import SimpleContractDialog from '@/features/contracts/contracts/AddContractDialog';
import ContractDialog from '@/features/contracts/contracts/ContractDialog';
import { client as contractClient } from '@/modules/contracts';
import { Button } from '@/stories/Button/Button';
import { MainCard } from '@/stories/Card/Card';
import { ConfirmationPopover, FileUploadPopover } from '@/stories/Popover/Popover';
import { Eye, FileText, PlusIcon, RefreshCw, Trash, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { useAirportHub } from '../ContextProvider';

export function ContractDetails() {
  const {
    selectedAirport,
    loading,
    refreshContracts,
    selectedContract,
    setSelectedContract,
    contracts,
    removeContract,
    addContract,
  } = useAirportHub();

  const handleUploadContractFile = async (file: File) => {
    if (!selectedContract) {
      toast.error('No contract selected');
      return;
    }

    try {
      await contractClient.processContract(file, selectedContract.id);
      toast.success('Contract file processed successfully');
      refreshContracts();
    } catch (error) {
      toast.error('Failed to process contract file');
      console.error(error);
    }
  };

  const hasContracts = contracts.length > 0;

  const actionsWhenSelected = (
    <div className="flex flex-row gap-2">
      <ContractDialog
        contract={selectedContract}
        airportId={selectedContract?.airportId || ''}
        DialogType="view"
        trigger={<Button intent="secondaryInverted" icon={Eye} />}
        onChange={() => {}}
      />

      <Button
        intent="secondaryInverted"
        icon={RefreshCw}
        onClick={refreshContracts}
        isLoading={loading.contracts && loading.isRefreshing}
      />
      <ConfirmationPopover
        onConfirm={async () => {
          await removeContract(selectedContract?.id || '');
          refreshContracts();
          setSelectedContract(null);
        }}
        trigger={<Button intent="secondaryInverted" icon={Trash} className="hover:bg-red-500" />}
        popoverIntent="danger"
        title="Delete Contract"
        description="Are you sure you want to delete this contract?"
      />
    </div>
  );

  const actionsWhenNotSelected = (
    <div className="flex flex-row gap-2">
      <Button
        intent="ghost"
        icon={RefreshCw}
        onClick={refreshContracts}
        isLoading={loading.contracts && loading.isRefreshing}
      />
      {selectedAirport && (
        <SimpleContractDialog
          airport={selectedAirport}
          trigger={<Button intent="primary" text="Add Contract" icon={PlusIcon} />}
          onChange={(newContract) => {
            addContract(newContract);
            setSelectedContract(newContract);
          }}
        />
      )}
    </div>
  );

  return (
    <MainCard
      className="flex-1"
      title={selectedContract?.title || 'Service Agreements'}
      subtitle={
        selectedContract?.vendorName ||
        `All service agreements for ${selectedAirport?.name || 'this airport'}`
      }
      headerGradient={
        selectedContract ? 'from-blue-500 via-blue-400 to-blue-600 opacity-80' : undefined
      }
      neutralHeader={!selectedContract}
      actions={selectedContract ? actionsWhenSelected : actionsWhenNotSelected}
    >
      {!hasContracts && (
        <div className="text-center py-12 text-gray-500">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
            <FileText className="w-8 h-8 text-gray-400" />
          </div>
          <h4 className="text-lg font-semibold text-gray-900 mb-2">No contracts found</h4>
          <p className="text-sm mb-4">
            No contracts have been added for {selectedAirport?.name || 'this airport'} yet.
          </p>
          {selectedAirport && (
            <SimpleContractDialog
              airport={selectedAirport}
              trigger={<Button intent="primary" text="Add First Contract" icon={PlusIcon} />}
              onChange={(newContract) => {
                addContract(newContract);
                setSelectedContract(newContract);
              }}
            />
          )}
        </div>
      )}

      {!selectedContract && hasContracts && (
        <div className="text-center py-12 text-gray-500">
          <div className="text-center">
            <h3 className="text-lg font-medium mb-2">No Contract Selected</h3>
            <p className="text-sm">Please select a contract to manage its information.</p>
          </div>
        </div>
      )}

      {selectedContract && (
        <div className="col-span-4 flex flex-col gap-2">
          <div className="flex flex-row gap-2 justify-between">
            <h3>Contract Information</h3>
            <FileUploadPopover
              onSend={handleUploadContractFile}
              trigger={<Button intent="primary" text="Upload Contract" icon={Upload} />}
            />
          </div>
          <div className="flex flex-col gap-2">
            <div className="rounded-2xl bg-sky-50 p-4">
              <h3>Summary</h3>
              <p>{selectedContract.summary}</p>
            </div>
            <div className="rounded-2xl bg-sky-50 p-4">
              <h3>Commercial Terms</h3>
              <p>{selectedContract.commercialTerms}</p>
            </div>
            <div className="rounded-2xl bg-sky-50 p-4">
              <h3>SLAs</h3>
              <p>{selectedContract.slas}</p>
            </div>
            <div className="rounded-2xl bg-sky-50 p-4">
              <h3>Edge Cases</h3>
              <p>{selectedContract.edgeCases}</p>
            </div>
            <div className="rounded-2xl bg-sky-50 p-4">
              <h3>Risk & Liability</h3>
              <p>{selectedContract.riskLiability}</p>
            </div>
            <div className="rounded-2xl bg-sky-50 p-4">
              <h3>Termination Law</h3>
              <p>{selectedContract.terminationLaw}</p>
            </div>
          </div>
        </div>
      )}
    </MainCard>
  );
}
