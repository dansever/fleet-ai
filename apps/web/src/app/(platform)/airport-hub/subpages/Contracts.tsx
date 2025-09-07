import { useAirportHub } from '@/app/(platform)/airport-hub/ContextProvider';
import { LoadingComponent } from '@/components/miscellaneous/Loading';
import { ContractTypeEnum, getContractTypeDisplay } from '@/drizzle/enums';
import { Contract } from '@/drizzle/types';
import { deleteContract } from '@/modules/contracts/contracts.server';
import { Button } from '@/stories/Button/Button';
import { MainCard } from '@/stories/Card/Card';
import { ConfirmationPopover } from '@/stories/Popover/Popover';
import { Eye, RefreshCw, Trash } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import ContractList from '../_components/ContractSidebar';

export default function ContractsPage() {
  const {
    addContract,
    selectedAirport,
    contracts,
    refreshContracts,
    loading,
    errors,
    selectedContract,
    setSelectedContract,
  } = useAirportHub();
  const router = useRouter();
  const [selectedContractTypes, setSelectedContractTypes] = useState<string[]>([]);
  // Group contracts by type
  const groupedContracts = contracts.reduce(
    (acc: Record<string, Contract[]>, contract: Contract) => {
      const type = contract.contractType || 'other';
      if (!acc[type]) {
        acc[type] = [];
      }
      acc[type].push(contract);
      return acc;
    },
    {} as Record<string, Contract[]>,
  );

  // Get all contract types to ensure consistent ordering
  const contractTypes = ContractTypeEnum.enumValues;

  // Calculate contract statistics
  const contractStats = useMemo(() => {
    const total = contracts.length;
    const active = contracts.filter((contract: Contract) => {
      if (!contract.effectiveTo) return true;
      return new Date(contract.effectiveTo) > new Date();
    }).length;

    const expiringSoon = contracts.filter((contract: Contract) => {
      if (!contract.effectiveTo) return false;
      const expiryDate = new Date(contract.effectiveTo);
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
      return expiryDate <= thirtyDaysFromNow && expiryDate > new Date();
    }).length;

    const contractsByType = contractTypes
      .map((type) => ({
        type,
        count: groupedContracts[type]?.length || 0,
        display: getContractTypeDisplay(type),
      }))
      .filter((item) => item.count > 0);

    return { total, active, expiringSoon, contractsByType };
  }, [contracts, groupedContracts, contractTypes]);

  // Show loading state when initially loading contracts or when refreshing
  if (loading.contracts && contracts.length === 0 && !loading.isRefreshing) {
    return <LoadingComponent size="md" text="Loading contracts..." />;
  }

  // Show error state if there's an error loading contracts
  if (errors.contracts && contracts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-500">
        <div className="text-center">
          <h3 className="text-lg font-medium mb-2 text-red-600">Error Loading Contracts</h3>
          <p className="text-sm mb-4">{errors.contracts}</p>
          <Button intent="primary" text="Retry" onClick={refreshContracts} />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-row gap-4">
      <div
        className="flex flex-col overflow-hidden min-w-0"
        style={{
          // Smooth width transition
          width: 'var(--sidebar-w)',
          transition: 'width 240ms ease',
          // Drive width via CSS var so React prop changes animate
          ['--sidebar-w' as string]: '16rem',
          // Helps the browser plan for width changes
          willChange: 'width',
        }}
      >
        <ContractList
          contracts={contracts}
          onContractSelect={setSelectedContract}
          selectedContract={selectedContract}
          InsertAddContractButton={true}
          onContractAdd={addContract}
        />
      </div>
      <MainCard
        className="flex-1"
        title={selectedContract?.title}
        subtitle={selectedContract?.vendorName || ''}
        headerGradient="from-blue-500 via-blue-400 to-blue-600 opacity-80"
        actions={
          <div className="flex flex-row gap-2">
            <Button intent="secondaryInverted" icon={Eye} onClick={() => {}} />
            <Button
              intent="secondaryInverted"
              icon={RefreshCw}
              onClick={refreshContracts}
              isLoading={loading.contracts && loading.isRefreshing}
              className={loading.contracts && loading.isRefreshing ? 'animate-spin' : ''}
            />
            <ConfirmationPopover
              onConfirm={() => {
                deleteContract(selectedContract?.id || '').then(() => {
                  refreshContracts();
                  setSelectedContract(null);
                });
              }}
              trigger={
                <Button intent="secondaryInverted" icon={Trash} className="hover:bg-red-500" />
              }
              popoverIntent="danger"
              title="Delete Contract"
              description="Are you sure you want to delete this contract?"
            />
          </div>
        }
      >
        {!selectedContract && (
          <div className="text-center py-12 text-gray-500">
            <div className="text-center">
              <h3 className="text-lg font-medium mb-2">No Contract Selected</h3>
              <p className="text-sm">Please select a contract to manage its information.</p>
            </div>
          </div>
        )}
      </MainCard>
    </div>
  );
}
