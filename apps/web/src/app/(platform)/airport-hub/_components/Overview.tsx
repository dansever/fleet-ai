'use client';

import { CardContent } from '@/components/ui/card';
import ContractDialog from '@/features/contracts/contracts/ContractDialog';
import { client as contractsClient } from '@/modules/contracts';
import { Button } from '@/stories/Button/Button';
import { BaseCard } from '@/stories/Card/Card';
import { ConfirmationPopover } from '@/stories/Popover/Popover';
import { ContractTerm } from '@/types/contracts';
import { Eye, Trash } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { useAirportHub } from '../ContextProvider';
import { ContractViewer } from './ContractViewer';

export function ContractOverview() {
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
  const [searchTerms, setSearchTerms] = useState('');
  const hasContracts = contracts.length > 0;

  const handleDeleteContract = async () => {
    try {
      if (!selectedContract) return;

      // Delete from server first
      await contractsClient.deleteContract(selectedContract.id);

      // Immediately update local state - removeContract is synchronous
      removeContract(selectedContract.id);

      // Clear selection since the contract no longer exists
      setSelectedContract(null);

      toast.success('Contract has been deleted');
    } catch (error) {
      console.error('Failed to delete contract:', error);
      toast.error('Failed to delete contract');
    }
  };

  const actionsWhenSelected = (
    <div className="flex flex-row gap-2">
      <ContractDialog
        contract={selectedContract}
        DialogType="view"
        trigger={<Button intent="secondaryInverted" icon={Eye} />}
        onChange={refreshContracts}
      />

      <ConfirmationPopover
        onConfirm={handleDeleteContract}
        trigger={<Button intent="danger" icon={Trash} />}
        popoverIntent="danger"
        title="Delete Contract"
        description="Are you sure you want to delete this contract?"
      />
    </div>
  );

  const copyMessage = (message: string | number | boolean) => {
    navigator.clipboard.writeText(message.toString());
    toast.info('Copied to clipboard');
  };

  const filteredTerms = Array.isArray(selectedContract?.keyTerms)
    ? selectedContract.keyTerms.filter((term: ContractTerm) => {
        const searchLower = searchTerms.toLowerCase();
        const keyMatch = term.key.toLowerCase().includes(searchLower);
        const contentMatch = term.value?.value?.toString().toLowerCase().includes(searchLower);
        return keyMatch || contentMatch;
      })
    : [];

  if (!selectedContract) {
    return (
      <BaseCard title="Please select a contract to view its details">
        <CardContent>
          <div className="text-center py-8 text-gray-500 flex flex-col gap-4">
            <p className="text-sm">
              Select a contract from the list to view its details, edit it, or delete it.
            </p>
          </div>
        </CardContent>
      </BaseCard>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <ContractViewer contract={selectedContract} />
    </div>
  );
}
