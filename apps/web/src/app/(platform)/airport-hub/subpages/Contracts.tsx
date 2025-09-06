import { useAirportHub } from '@/app/(platform)/airport-hub/ContextProvider';
import { ContractTypeEnum, getContractTypeDisplay } from '@/drizzle/enums';
import { Contract } from '@/drizzle/types';
import { Button } from '@/stories/Button/Button';
import { BaseCard, MainCard } from '@/stories/Card/Card';
import { Building2, Eye, Fuel, RefreshCw, Users, Wrench } from 'lucide-react';
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

  const getServiceIcon = (serviceType: string) => {
    switch (serviceType) {
      case 'ground_handling':
        return <Users className="w-4 h-4" />;
      case 'fuel_supply':
        return <Fuel className="w-4 h-4" />;
      case 'catering':
        return <Building2 className="w-4 h-4" />;
      case 'maintenance':
        return <Wrench className="w-4 h-4" />;
      default:
        return <Building2 className="w-4 h-4" />;
    }
  };

  return (
    <BaseCard className="flex flex-row gap-4 bg-transparent">
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
            <Button intent="secondaryInverted" icon={RefreshCw} onClick={refreshContracts} />
          </div>
        }
      ></MainCard>
    </BaseCard>
  );
}
