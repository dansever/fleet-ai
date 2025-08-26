import { LoadingComponent } from '@/components/miscellaneous/Loading';
import { ContractTypeEnum, getContractTypeDisplay } from '@/drizzle/schema/enums';
import { ServiceContract } from '@/drizzle/types';
import { createRandomServiceContract } from '@/features/service-contracts/utils';
import { Button } from '@/stories/Button/Button';
import { ProjectCard } from '@/stories/Card/Card';
import { FileUploadPopover } from '@/stories/Popover/Popover';
import { calculateProgress } from '@/utils/dateUtils';
import { RefreshCw } from 'lucide-react';
import { useAirportHub } from '../ContextProvider';

export default function ServiceContracts() {
  const {
    addServiceContract,
    selectedAirport,
    serviceContracts,
    refreshServiceContracts,
    loading,
  } = useAirportHub();

  // Group contracts by type
  const groupedContracts = serviceContracts.reduce(
    (acc, contract) => {
      const type = contract.contractType || 'other';
      if (!acc[type]) {
        acc[type] = [];
      }
      acc[type].push(contract);
      return acc;
    },
    {} as Record<string, ServiceContract[]>,
  );

  // Get all contract types to ensure consistent ordering
  const contractTypes = ContractTypeEnum.enumValues;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-end gap-2">
        <Button
          intent="ghost"
          icon={RefreshCw}
          className={`${loading.contractsRefresh && 'animate-spin'}`}
          disabled={loading.contractsRefresh}
          onClick={refreshServiceContracts}
        />
        <FileUploadPopover
          onSend={() => {}}
          accept="application/pdf"
          maxSize={10}
          triggerButtonIntent="add"
          triggerButtonText="Upload Contract"
          popoverContentAlign="end"
          buttonSize="md"
        >
          <div className="flex flex-col gap-2 text-sm">
            <Button intent="secondary" text="Manually Add Contract" size="sm" onClick={() => {}} />
            <Button
              intent="ghost"
              text="Or generate random Contract"
              size="sm"
              className="text-gray-500"
              onClick={async () => {
                if (!selectedAirport) return;
                const contract = await createRandomServiceContract(selectedAirport.id);
                addServiceContract(contract);
              }}
            />
          </div>
        </FileUploadPopover>
      </div>

      {/* Loading State - Only show when loading contracts for airport selection, not refresh */}
      {loading.contracts && !loading.contractsRefresh && (
        <LoadingComponent size="md" text="Loading service contracts..." />
      )}

      {/* Display contracts grouped by type - Hide only during initial loading, keep visible during refresh */}
      {serviceContracts.length > 0 &&
        !(loading.contracts && !loading.contractsRefresh) &&
        contractTypes.map((contractType) => {
          const contractsOfType = groupedContracts[contractType];
          if (!contractsOfType || contractsOfType.length === 0) return null;

          return (
            <div key={contractType} className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold text-gray-900">
                  {getContractTypeDisplay(contractType)}
                </h3>
                <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded-full">
                  {contractsOfType.length}
                </span>
              </div>
              <div className="flex flex-col gap-2">
                {contractsOfType.map((contract) => (
                  <ProjectCard
                    key={contract.id}
                    title={contract.title}
                    description={contract.title}
                    category={getContractTypeDisplay(contract.contractType)}
                    progress={
                      contract.effectiveTo && contract.effectiveFrom
                        ? calculateProgress(contract.effectiveFrom, contract.effectiveTo)
                        : undefined
                    }
                  />
                ))}
              </div>
            </div>
          );
        })}

      {/* Show message if no contracts - Only show when not doing initial loading */}
      {serviceContracts.length === 0 && !(loading.contracts && !loading.contractsRefresh) && (
        <div className="text-center py-12 text-gray-500">
          <p>No service contracts found for this airport.</p>
          <p className="text-sm mt-1">Upload a contract or generate a random one to get started.</p>
        </div>
      )}
    </div>
  );
}
