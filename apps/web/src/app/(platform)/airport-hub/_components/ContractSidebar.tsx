'use client';

import { LoadingComponent } from '@/components/miscellaneous/Loading';
import { ScrollArea } from '@/components/ui/scroll-area';
import { getContractTypeDisplay, getProcessStatusDisplay, ProcessStatus } from '@/drizzle/enums';
import { Airport, Contract } from '@/drizzle/types';
import SimpleContractDialog from '@/features/contracts/contracts/AddContractDialog';
import { createRandomContract } from '@/features/contracts/contracts/createRandomContract';
import { cn } from '@/lib/utils';
import { client as contractClient } from '@/modules/contracts';
import { Button } from '@/stories/Button/Button';
import { ListItemCard } from '@/stories/Card/Card';
import { BasePopover } from '@/stories/Popover/Popover';
import { StatusBadge } from '@/stories/StatusBadge/StatusBadge';
import { Plus, PlusIcon, RefreshCw } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { useAirportHub } from '../ContextProvider';

interface ContractListProps {
  contracts: Contract[];
  onContractSelect: (contract: Contract) => void;
  selectedContract: Contract | null;
  InsertAddContractButton: boolean;
  onContractAdd?: (contract: Contract) => void;
}

export default function ContractList({
  contracts,
  onContractSelect,
  selectedContract,
  onContractAdd,
}: ContractListProps) {
  const { selectedAirport, loading, refreshContracts } = useAirportHub();
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  // Upload Contract File
  const handleProcessContract = async (file: File) => {
    try {
      await contractClient.processContract(file, selectedContract?.id as Contract['id']);
      toast.success('Contract file processed successfully');
    } catch (error) {
      toast.error('Failed to process contract file');
      console.error(error);
    }
  };

  function getIsContractActive(contract: Contract): 'pending' | 'active' | 'inactive' | null {
    const today = new Date();
    return contract.effectiveFrom &&
      new Date(contract.effectiveFrom) < today &&
      contract.effectiveTo &&
      new Date(contract.effectiveTo) > today
      ? 'active'
      : contract.effectiveFrom && new Date(contract.effectiveFrom) > today
        ? 'pending'
        : 'inactive';
  }

  const handleGenerateRandomContract = async () => {
    try {
      setIsPopoverOpen(false); // Close popover
      const newContract = await createRandomContract(selectedAirport?.id as Airport['id']);
      onContractAdd?.(newContract);
      toast.success('Random contract generated successfully');
    } catch (error) {
      toast.error('Failed to generate random contract');
      console.error(error);
    }
  };

  return (
    <div className="h-fit flex flex-col rounded-3xl bg-card">
      {/* Header */}
      <div className="flex flex-row justify-between items-center flex-shrink-0 px-4 py-2">
        <div className="text-sm text-muted-foreground">
          {contracts.length} of {contracts.length} contracts
        </div>
        <Button intent="ghost" icon={RefreshCw} size="sm" onClick={refreshContracts} />
        <BasePopover
          trigger={<Button intent="add" icon={Plus} />}
          title="Add Contract"
          description="Add a new service agreement to the airport hub"
          open={isPopoverOpen}
          onOpenChange={setIsPopoverOpen}
        >
          <div className="flex flex-col gap-1 w-full">
            <SimpleContractDialog
              airport={selectedAirport!}
              trigger={<Button intent="secondary" icon={PlusIcon} text="Add Contract" />}
              onOpenChange={(open) => {
                if (!open) {
                  // Close popover when dialog closes
                  setIsPopoverOpen(false);
                }
              }}
              onChange={(newContract) => {
                if (onContractAdd) {
                  onContractAdd(newContract);
                  // Automatically select the newly created contract
                  onContractSelect(newContract);
                }
              }}
            />
            <Button
              intent="ghost"
              text="Or generate random (dev mode)"
              size="sm"
              className="text-gray-500"
              onClick={handleGenerateRandomContract}
            />
          </div>
        </BasePopover>

        {/* <FileUploadPopover
          onSend={handleProcessContract}
          trigger={<Button intent="add" icon={Plus} />}
        >
          <div className="flex flex-col gap-1 w-full">
            <ContractDialog
              contract={null}
              airportId={selectedAirport?.id as Airport['id']}
              DialogType="add"
              trigger={<Button intent="secondary" text="Manually Add Contract" size="sm" />}
              onChange={(newContract) => {
                if (onContractAdd) {
                  onContractAdd(newContract);
                  // Automatically select the newly created contract
                  onContractSelect(newContract);
                }
              }}
            />
            <Button
              intent="ghost"
              text="Or generate a random contract"
              size="sm"
              onClick={() => {
                handleGenerateRandomContract();
              }}
            />
          </div>
        </FileUploadPopover> */}
      </div>

      {/* Contract List */}
      <div className="flex-1 min-h-0">
        <ScrollArea className="h-full overflow-y-auto">
          {/* Smoothly adjust inner padding as the sidebar width animates */}
          <div
            className={cn('p-3 space-y-3 transition-[padding,opacity] duration-200 ease-in-out')}
          >
            {loading.contracts && loading.isRefreshing && contracts.length === 0 ? (
              <div className="py-8">
                <LoadingComponent size="sm" text="Loading contracts..." />
              </div>
            ) : (
              contracts.map((contract) => {
                const isSelected = selectedContract?.id === contract.id;
                return (
                  <ListItemCard
                    key={contract.id}
                    isSelected={isSelected}
                    onClick={() => onContractSelect(contract)}
                    className={cn(
                      isSelected
                        ? 'border-sky-100 from-sky-200/20 via-sky-200 to-sky-200/40 opacity-100'
                        : 'bg-gradient-to-br from-sky-50/80 via-sky-50 to-sky-50/60 opacity-80 hover:bg-gradient-to-br hover:from-sky-100 hover:via-sky-100 hover:to-sky-100',
                    )}
                  >
                    <div className="flex flex-col gap-1 items-start">
                      <StatusBadge
                        status={'default'}
                        text={getContractTypeDisplay(contract.contractType || '')}
                      />
                      <span className="text-sm font-bold">{contract.title}</span>
                      <span className="text-xs">{contract.vendorName}</span>
                      <StatusBadge
                        status={
                          getIsContractActive(contract) === 'active'
                            ? 'operational'
                            : getIsContractActive(contract) === 'pending'
                              ? 'pending'
                              : 'error'
                        }
                        text={getProcessStatusDisplay(
                          getIsContractActive(contract) as ProcessStatus,
                        )}
                      />
                    </div>
                  </ListItemCard>
                );
              })
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
