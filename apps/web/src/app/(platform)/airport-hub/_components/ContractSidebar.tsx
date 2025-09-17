'use client';

import { LoadingComponent } from '@/components/miscellaneous/Loading';
import { ScrollArea } from '@/components/ui/scroll-area';
import { getContractTypeDisplay, getProcessStatusDisplay, ProcessStatus } from '@/drizzle/enums';
import { Contract } from '@/drizzle/types';
import SimpleContractDialog from '@/features/contracts/contracts/AddContractDialog';
import { cn } from '@/lib/utils';
import { Button } from '@/stories/Button/Button';
import { BaseCard, ListItemCard } from '@/stories/Card/Card';
import { StatusBadge } from '@/stories/StatusBadge/StatusBadge';
import { PlusIcon } from 'lucide-react';
import { useState } from 'react';
import { useAirportHub } from '../ContextProvider';

export default function ContractList() {
  const {
    contracts,
    selectedContract,
    setSelectedContract,
    addContract,
    selectedAirport,
    loading,
    refreshContracts,
  } = useAirportHub();
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

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

  return (
    <BaseCard
      className="h-fit flex flex-col p-0 gap-0"
      contentClassName="p-0"
      headerClassName="p-0"
      header={
        <div className="flex flex-row justify-between items-center flex-shrink-0 px-4 pt-2">
          <div className="text-sm text-muted-foreground">
            {contracts.length} of {contracts.length} contracts
          </div>
          <SimpleContractDialog
            airport={selectedAirport!}
            trigger={<Button intent="add" icon={PlusIcon} />}
            onOpenChange={(open) => {
              if (!open) {
                // Close popover when dialog closes
                setIsPopoverOpen(false);
              }
            }}
            onChange={(newContract) => {
              if (addContract) {
                addContract(newContract);
                // Automatically select the newly created contract
                setSelectedContract(newContract);
              }
            }}
          />{' '}
        </div>
      }
    >
      {/* Header */}

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
                // Check if the contract ends in less than 30 days
                const numOfDaysLeft = contract.effectiveTo
                  ? Math.floor(
                      (new Date(contract.effectiveTo).getTime() - new Date().getTime()) /
                        (1000 * 60 * 60 * 24),
                    )
                  : null;
                return (
                  <ListItemCard
                    key={contract.id}
                    isSelected={isSelected}
                    onClick={() => setSelectedContract(contract)}
                    className={cn(
                      isSelected
                        ? 'border-sky-100 from-sky-200/40 via-sky-200 to-sky-200/60 opacity-100'
                        : 'bg-gradient-to-br from-sky-50/40 via-sky-50 to-sky-50/60 opacity-80 hover:bg-gradient-to-br hover:from-sky-100 hover:via-sky-100 hover:to-sky-100',
                    )}
                  >
                    <div className="flex flex-col gap-1 items-start">
                      <StatusBadge
                        status={'default'}
                        text={getContractTypeDisplay(contract.contractType || '')}
                      />
                      <span className="text-sm font-bold">{contract.title}</span>
                      <span className="text-xs">{contract.vendorName}</span>
                      <div className="flex flex-row gap-2">
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
                        {numOfDaysLeft && numOfDaysLeft < 31 && (
                          <StatusBadge
                            status={numOfDaysLeft < 7 ? 'error' : 'warning'}
                            text={`${numOfDaysLeft} ${numOfDaysLeft === 1 ? 'Day' : 'Days'} Left`}
                          />
                        )}
                      </div>
                    </div>
                  </ListItemCard>
                );
              })
            )}
          </div>
        </ScrollArea>
      </div>
    </BaseCard>
  );
}
