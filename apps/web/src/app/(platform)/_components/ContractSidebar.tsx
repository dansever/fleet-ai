'use client';

import { ScrollArea } from '@/components/ui/scroll-area';
import { ContractType } from '@/drizzle/enums';
import { Contract } from '@/drizzle/types';
import ContractDialog from '@/features/contracts/contracts/ContractDialog';
import { cn } from '@/lib/utils';
import { Button } from '@/stories/Button/Button';
import { ListItemCard } from '@/stories/Card/Card';
import { Building2, Fuel, Plus, Users, Wrench } from 'lucide-react';
import { useState } from 'react';

interface ContractListProps {
  contracts: Contract[];
  onContractSelect: (contract: Contract) => void;
  selectedContract: Contract | null;
  InsertAddContractButton: boolean;
  onContractAdd?: (contract: Contract) => void;
}

const contractTypeIconMap = {
  ground_handling: <Users className="h-4 w-4" />,
  fuel: <Fuel className="h-4 w-4" />,
  catering: <Building2 className="h-4 w-4" />,
  technical_mro_parts: <Wrench className="h-4 w-4" />,
  airport_and_nav_charges: <Building2 className="h-4 w-4" />,
  security_compliance: <Building2 className="h-4 w-4" />,
  it_data_comms: <Building2 className="h-4 w-4" />,
  logistics_freight: <Building2 className="h-4 w-4" />,
  training_and_crew: <Building2 className="h-4 w-4" />,
  insurance_and_finance: <Building2 className="h-4 w-4" />,
  other: <Building2 className="h-4 w-4" />,
};

export default function ContractList({
  contracts,
  onContractSelect,
  selectedContract,
  InsertAddContractButton = false,
  onContractAdd,
}: ContractListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedContracts, setSelectedContracts] = useState<Contract[]>([]);

  return (
    <div className="h-fit flex flex-col rounded-2xl bg-card">
      {/* Header */}
      <div className="flex flex-row justify-between items-center flex-shrink-0 px-4 py-2">
        <h2>Contracts</h2>
        {InsertAddContractButton && (
          <ContractDialog
            contract={null}
            DialogType="add"
            triggerButton={<Button intent="add" text="Add" icon={Plus} size="md" />}
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

      {/* Filters */}
      <div className="flex-shrink-0 px-4 py-2 border-b border-border flex flex-col gap-2">
        {/* Results Count */}
        <div className="text-sm text-muted-foreground">
          {contracts.length} of {contracts.length} contracts
        </div>
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
                  icon={contractTypeIconMap[contract.contractType as ContractType]}
                  className={cn(
                    isSelected && 'from-sky-200/30 via-sky-200 to-sky-200/50 opacity-80',
                  )}
                  iconBackgroundClassName="h-8 w-8 from-blue-200 to-cyan-200"
                >
                  <div className="flex flex-col gap-1 items-start">
                    <span className="text-xs">{contract.vendorName}</span>
                    <span className="text-sm font-medium">{contract.title}</span>
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
