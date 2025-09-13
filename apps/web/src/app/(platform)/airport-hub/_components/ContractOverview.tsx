import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import SimpleContractDialog from '@/features/contracts/contracts/AddContractDialog';
import ContractDialog from '@/features/contracts/contracts/ContractDialog';
import { Button } from '@/stories/Button/Button';
import { MainCard } from '@/stories/Card/Card';
import { ConfirmationPopover } from '@/stories/Popover/Popover';
import { ContractTerm } from '@/types/contracts';
import { Copy, Eye, FileText, PlusIcon, RefreshCw, Trash } from 'lucide-react';
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

  const hasContracts = contracts.length > 0;

  const actionsWhenSelected = (
    <div className="flex flex-row gap-2">
      <ContractDialog
        contract={selectedContract}
        DialogType="view"
        trigger={<Button intent="secondaryInverted" icon={Eye} />}
        onChange={refreshContracts}
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

  const copyMessage = (message: string | number | boolean) => {
    navigator.clipboard.writeText(message.toString());
    toast.info('Copied to clipboard');
  };

  return (
    <div className="flex flex-col gap-4">
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
            <div className="flex flex-col gap-2">
              <Accordion type="multiple" className="w-full" defaultValue={['item-1']}>
                <AccordionItem value="item-1">
                  <AccordionTrigger className="cursor-pointer font-bold">
                    Contract Summary
                  </AccordionTrigger>
                  <AccordionContent className="flex flex-col gap-4">
                    {selectedContract.summary}
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-2">
                  <AccordionTrigger className="cursor-pointer font-bold">
                    Contract Terms
                  </AccordionTrigger>
                  <AccordionContent className="flex flex-col gap-4">
                    {selectedContract.terms?.map((term: ContractTerm, idx: number) => (
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
                    ))}
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </div>
        )}
      </MainCard>
    </div>
  );
}
