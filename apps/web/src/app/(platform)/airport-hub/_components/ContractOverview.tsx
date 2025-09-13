'use client';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import ContractDialog from '@/features/contracts/contracts/ContractDialog';
import { formatDate } from '@/lib/core/formatters';
import { client as contractsClient } from '@/modules/contracts';
import { Button } from '@/stories/Button/Button';
import { BaseCard } from '@/stories/Card/Card';
import { ModernInput } from '@/stories/Form/Form';
import { ConfirmationPopover } from '@/stories/Popover/Popover';
import { ModernTimeline } from '@/stories/Timeline/Timeline';
import { ContractTerm } from '@/types/contracts';
import { Copy, Eye, Trash } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { useAirportHub } from '../ContextProvider';

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
      await contractsClient.deleteContract(selectedContract?.id);
      await removeContract(selectedContract?.id);
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

  const filteredTerms = Array.isArray(selectedContract?.terms)
    ? selectedContract.terms.filter((term: ContractTerm) => {
        const searchLower = searchTerms.toLowerCase();
        const keyMatch = term.key.toLowerCase().includes(searchLower);
        const contentMatch = term.value?.value?.toString().toLowerCase().includes(searchLower);
        return keyMatch || contentMatch;
      })
    : [];

  if (!selectedContract) {
    return (
      <BaseCard
        body={
          <div className="text-center py-8 text-gray-500 flex flex-col gap-4">
            <h4 className="font-bold">Please select a contract to view its details</h4>
            <p className="text-sm">
              Select a contract from the list to view its details, edit it, or delete it.
            </p>
          </div>
        }
      />
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <BaseCard
        title={selectedContract?.title || 'Service Agreements'}
        headerClassName="text-white from-blue-500 via-blue-400 to-blue-600 opacity-80"
        actions={actionsWhenSelected}
        body={
          <div className="flex flex-col gap-4">
            {selectedContract?.effectiveFrom && selectedContract?.effectiveTo && (
              <ModernTimeline
                className="w-full"
                orientation="horizontal"
                items={[
                  {
                    id: '1',
                    title: 'Starts',
                    timestamp: formatDate(selectedContract?.effectiveFrom),
                    status: 'current',
                  },
                  {
                    id: '2',
                    title: 'Today',
                    timestamp: formatDate(new Date()),
                    status: 'current',
                  },
                  {
                    id: '3',
                    title: 'Ends',
                    timestamp: formatDate(selectedContract?.effectiveTo),
                    status: 'current',
                  },
                ]}
              />
            )}
            {/* Summary */}
            <div className="flex flex-col">
              <h4 className="font-bold">Summary</h4>{' '}
              {selectedContract?.summary || 'No summary available'}
            </div>
            {/* Contract Type + Dates */}
            <Accordion type="multiple" className="w-full" defaultValue={['item-1']}>
              <AccordionItem value="item-1">
                <AccordionTrigger className="cursor-pointer font-bold">
                  <h4 className="font-bold">Contract Terms</h4>
                </AccordionTrigger>
                <AccordionContent className="flex flex-col gap-4">
                  <ModernInput
                    placeholder="Search terms"
                    value={searchTerms}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setSearchTerms(e.target.value)
                    }
                  />
                  {Array.isArray(filteredTerms) && filteredTerms.length > 0 ? (
                    filteredTerms.map((term: ContractTerm, idx: number) => (
                      <div
                        key={idx}
                        className="border-1 rounded-2xl p-3 bg-muted/40 flex flex-col gap-1"
                      >
                        <div className="flex flex-row items-center gap-1">
                          <div className="font-bold flex-1">{term.key}</div>
                          <Copy
                            className="w-4 h-4 stroke-gray-400 hover:stroke-gray-600 hover:scale-105 transition-all cursor-pointer"
                            onClick={() => copyMessage(term.value?.value)}
                          />
                        </div>
                        <div className="text-sm">{term.value?.value}</div>
                        {term.section && (
                          <div className="text-xs italic">Section: {term.section}</div>
                        )}
                        {term.source?.snippet && (
                          <div className="text-xs text-muted-foreground border-l-2 pl-2 border-primary/40 mt-1">
                            "{term.source.snippet}"
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <p className="text-sm">No contract terms available yet.</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Terms will appear here after document processing.
                      </p>
                    </div>
                  )}
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        }
      />
    </div>
  );
}
