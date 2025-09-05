'use client';

import { ScrollArea } from '@/components/ui/scroll-area';
import { getContractTypeDisplay, getStatusDisplay, Status } from '@/drizzle/enums';
import { Contract } from '@/drizzle/types';
import ContractDialog from '@/features/contracts/contracts/ContractDialog';
import { cn } from '@/lib/utils';
import { Button } from '@/stories/Button/Button';
import { ListItemCard } from '@/stories/Card/Card';
import { StatusBadge } from '@/stories/StatusBadge/StatusBadge';
import { Plus } from 'lucide-react';
import { useState } from 'react';

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
  InsertAddContractButton = false,
  onContractAdd,
}: ContractListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedContracts, setSelectedContracts] = useState<Contract[]>([]);

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
    <div className="h-fit flex flex-col rounded-2xl bg-card">
      {/* Header */}
      <div className="flex flex-row justify-between items-center flex-shrink-0 px-4 py-2">
        <div className="text-sm text-muted-foreground">
          {contracts.length} of {contracts.length} contracts
        </div>
        {InsertAddContractButton && (
          <ContractDialog
            contract={null}
            DialogType="add"
            triggerButton={<Button intent="add" icon={Plus} size="md" />}
            onChange={(newContract) => {
              if (onContractAdd) {
                onContractAdd(newContract);
                // Automatically select the newly created airport
                onContractSelect(newContract);
              }
            }}
          />
        )}
      </div>

      {/* Contract List */}
      <div className="flex-1 min-h-0">
        <ScrollArea className="h-full overflow-y-auto">
          {/* Smoothly adjust inner padding as the sidebar width animates */}
          <div
            className={cn('p-3 space-y-3 transition-[padding,opacity] duration-200 ease-in-out')}
          >
            {contracts.map((contract) => {
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
                    <div className="flex flex-row justify-between gap-2">
                      <StatusBadge
                        status={'default'}
                        text={getContractTypeDisplay(contract.contractType || '')}
                      />
                      <StatusBadge
                        status={
                          getIsContractActive(contract) === 'active'
                            ? 'operational'
                            : getIsContractActive(contract) === 'pending'
                              ? 'pending'
                              : 'error'
                        }
                        text={getStatusDisplay(getIsContractActive(contract) as Status)}
                      />
                    </div>
                    <span className="text-sm font-bold">{contract.title}</span>
                    <span className="text-xs">{contract.vendorName}</span>
                  </div>
                </ListItemCard>
              );
            })}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
