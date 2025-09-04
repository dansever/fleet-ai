import { LoadingComponent } from '@/components/miscellaneous/Loading';
import {
  ContractType,
  contractTypeDisplayMap,
  ContractTypeEnum,
  getContractTypeDisplay,
} from '@/drizzle/enums';
import { Contract } from '@/drizzle/types';
import ContractDialog from '@/features/contracts/contracts/ContractDialog';
import { createRandomContract } from '@/features/contracts/contracts/createRandomContract';
import { Button } from '@/stories/Button/Button';
import { MainCard, MetricCard, ProjectCard } from '@/stories/Card/Card';
import { ModernSelect } from '@/stories/Form/Form';
import { FileUploadPopover } from '@/stories/Popover/Popover';
import { StatusBadge } from '@/stories/StatusBadge/StatusBadge';
import { calculateProgress } from '@/utils/date-helpers';
import {
  AlertTriangle,
  Building2,
  CheckCircle,
  Eye,
  FileText,
  Fuel,
  RefreshCw,
  Users,
  Wrench,
  Zap,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { useAirportHub } from '../ContextProvider';

export default function ManageContracts() {
  const { addContract, selectedAirport, contracts, refreshContracts, loading } = useAirportHub();
  const router = useRouter();
  const [selectedContractType, setSelectedContractType] = useState<string>('all');
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
    <div className="flex flex-col gap-4">
      {/* Contract Overview Header */}
      {selectedAirport && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <MetricCard
            title="Active Contracts"
            value={contractStats.active}
            change={`${contractStats.total} total`}
            icon={<CheckCircle className="w-6 h-6 text-green-600" />}
            trend="neutral"
          />
          <MetricCard
            title="Expiring Soon"
            value={contractStats.expiringSoon}
            change="Next 30 days"
            icon={<AlertTriangle className="w-6 h-6 text-orange-600" />}
            trend={contractStats.expiringSoon > 0 ? 'down' : 'neutral'}
          />
          <MetricCard
            title="Service Types"
            value={contractStats.contractsByType.length}
            change="Categories"
            icon={<Building2 className="w-6 h-6 text-blue-600" />}
            trend="neutral"
          />
          <MetricCard
            title="AI Monitoring"
            value="24/7"
            change="Active monitoring"
            icon={<Zap className="w-6 h-6 text-purple-600" />}
            trend="up"
          />
        </div>
      )}

      {/* Loading State - Only show when loading contracts for initial load or airport selection, not refresh */}
      {loading.contracts && !loading.isRefreshing && <LoadingComponent size="md" />}

      {!loading.contracts && !loading.isRefreshing && (
        <MainCard
          neutralHeader={true}
          icon={
            <div className="p-2 bg-gradient-to-br from-pink-400 to-purple-400 rounded-xl">
              <FileText className="w-6 h-6 text-white" />
            </div>
          }
          title="Contracts"
          subtitle="All contracts associated with this airport."
          actions={
            <div className="flex gap-2 flex-shrink-0">
              <Button
                intent="ghost"
                icon={RefreshCw}
                disabled={loading.contracts && loading.isRefreshing}
                onClick={refreshContracts}
              />
              <FileUploadPopover
                onSend={() => {}}
                accept="application/pdf"
                maxSize={10}
                triggerIntent="secondary"
                triggerText="Upload Contract"
                popoverContentAlign="end"
                triggerSize="md"
              >
                <div className="flex flex-col gap-2 text-sm">
                  <Button
                    intent="secondary"
                    text="Manually Add Contract"
                    size="sm"
                    onClick={() => {}}
                  />
                  <Button
                    intent="ghost"
                    text="Or generate random Contract"
                    size="sm"
                    className="text-gray-500"
                    onClick={async () => {
                      if (!selectedAirport) return;
                      const contract = await createRandomContract(selectedAirport.id);
                      addContract(contract);
                    }}
                  />
                </div>
              </FileUploadPopover>
            </div>
          }
        >
          <div className="flex flex-col gap-4">
            {/* Contract Filters */}
            <div className="flex flex-row justify-between items-center">
              <ModernSelect
                options={[
                  { label: 'All Services', value: 'all' },
                  ...contractTypes.map((type) => ({
                    label: getContractTypeDisplay(type),
                    value: type,
                  })),
                ]}
                value={selectedContractType}
                onValueChange={(value: string) => setSelectedContractType(value)}
                placeholder="Filter by service"
              />
            </div>
            {/* Display contracts grouped by type - Hide only during initial loading, keep visible during refresh */}
            {contracts.length > 0 &&
              !(loading.contracts && !loading.isRefreshing) &&
              (selectedContractType === 'all' ? contractTypes : [selectedContractType]).map(
                (contractType) => {
                  const contractsOfType = groupedContracts[contractType];
                  if (!contractsOfType || contractsOfType.length === 0) return null;
                  return (
                    <div key={contractType} className="flex flex-col gap-2">
                      <div className="flex items-center gap-2">
                        <h3>{contractTypeDisplayMap[contractType as ContractType]}</h3>
                        <StatusBadge status="default" text={contractsOfType.length.toString()} />
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        {contractsOfType.map((contract: Contract) => (
                          <ProjectCard
                            className="bg-gradient-to-br from-blue-50 to-pink-50"
                            key={contract.id}
                            badgeText={
                              contract.effectiveTo && contract.effectiveFrom
                                ? calculateProgress(contract.effectiveFrom, contract.effectiveTo) >
                                  70
                                  ? 'Expiring Soon'
                                  : calculateProgress(
                                        contract.effectiveFrom,
                                        contract.effectiveTo,
                                      ) <= 25
                                    ? 'New'
                                    : undefined
                                : undefined
                            }
                            title={contract.title}
                            subtitle={contract.summary || contract.title}
                            progress={
                              contract.effectiveTo && contract.effectiveFrom
                                ? calculateProgress(contract.effectiveFrom, contract.effectiveTo)
                                : undefined
                            }
                            actions={
                              <div className="flex items-center gap-2 justify-end w-full">
                                <ContractDialog
                                  contract={contract}
                                  DialogType="view"
                                  triggerButton={<Button intent="ghost" icon={Eye} />}
                                  onChange={() => {}}
                                />
                                <Button
                                  intent="primary"
                                  text="Open"
                                  onClick={() => router.push(`/airport-hub/${contract.id}`)}
                                />
                              </div>
                            }
                          />
                        ))}
                      </div>
                    </div>
                  );
                },
              )}
            {contracts.length === 0 && !(loading.contracts && !loading.isRefreshing) && (
              <div className="text-center py-12 text-gray-500">
                <p>No contracts found for this airport.</p>
              </div>
            )}
          </div>
        </MainCard>
      )}

      {/* Show message if no contracts - Only show when not doing initial loading */}
      {contracts.length === 0 && !(loading.contracts && !loading.isRefreshing) && (
        <div className="text-center py-12 text-gray-500">
          {/* <p>No service contracts found for this airport.</p>
          <p className="text-sm mt-1">Upload a contract or generate a random one to get started.</p> */}
        </div>
      )}
    </div>
  );
}
