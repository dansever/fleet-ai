import { LoadingComponent } from '@/components/miscellaneous/Loading';
import { ContractTypeEnum, getContractTypeDisplay } from '@/drizzle/schema/enums';
import { Contract } from '@/drizzle/types';
import ContractDialog from '@/features/contract-management/contracts/ContractDialog';
import { createRandomContract } from '@/features/contract-management/contracts/createRandomContract';
import { Button } from '@/stories/Button/Button';
import { FeatureCard, GradientPalette, MetricCard, ProjectCard } from '@/stories/Card/Card';
import { FileUploadPopover } from '@/stories/Popover/Popover';
import { calculateProgress } from '@/utils/dateUtils';
import {
  AlertTriangle,
  Building2,
  CheckCircle,
  Eye,
  Fuel,
  RefreshCw,
  Users,
  Wrench,
  Zap,
} from 'lucide-react';
import { useMemo } from 'react';
import { useAirportHub } from '../ContextProvider';

export default function ManageContracts() {
  const { addContract, selectedAirport, contracts, refreshContracts, loading } = useAirportHub();

  const groundHandlingImages = [
    '/images/ground_handling_power.jpg',
    '/images/ground_handling_push_back.jpg',
    '/images/ground_handling_de_ice.jpg',
    '/images/ground_handling_catering.jpg',
  ];

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
    <div className="flex flex-col gap-6">
      {/* Airport Overview Header */}
      {selectedAirport && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4"></div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
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

          {/* AI Insights Feature Card */}
          <FeatureCard
            title="AI-Powered Contract Intelligence"
            subtitle="FleetAI monitors your contracts for compliance, cost optimization, and renewal alerts"
            icon={<Zap className="w-6 h-6" />}
            palette={GradientPalette.VioletPinkRose}
            actions={
              <Button
                intent="ghost"
                text="View Insights"
                size="sm"
                className="bg-white/20 text-white hover:bg-white/30"
                onClick={() => console.log('View AI insights')}
              />
            }
          >
            <div className="grid grid-cols-3 gap-4 mt-4 text-sm">
              <div className="text-center">
                <div className="font-semibold">$125K</div>
                <div className="text-white/80">Cost Savings</div>
              </div>
              <div className="text-center">
                <div className="font-semibold">97.8%</div>
                <div className="text-white/80">Compliance Rate</div>
              </div>
              <div className="text-center">
                <div className="font-semibold">3</div>
                <div className="text-white/80">Active Alerts</div>
              </div>
            </div>
          </FeatureCard>
        </div>
      )}

      <div className="flex gap-2 justify-end">
        <Button
          intent="ghost"
          icon={RefreshCw}
          className={`${loading.contracts && loading.isRefreshing && 'animate-spin'}`}
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
            <Button intent="secondary" text="Manually Add Contract" size="sm" onClick={() => {}} />
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

      {/* Loading State - Only show when loading contracts for initial load or airport selection, not refresh */}
      {loading.contracts && !loading.isRefreshing && <LoadingComponent size="md" />}

      {/* Display contracts grouped by type - Hide only during initial loading, keep visible during refresh */}
      {contracts.length > 0 &&
        !(loading.contracts && !loading.isRefreshing) &&
        contractTypes.map((contractType) => {
          const contractsOfType = groupedContracts[contractType];
          if (!contractsOfType || contractsOfType.length === 0) return null;
          return (
            <div key={contractType} className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <h3>{getContractTypeDisplay(contractType)}</h3>
                <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded-full">
                  {contractsOfType.length}
                </span>
              </div>
              <div className="grid grid-cols-2  gap-4">
                {contractsOfType.map((contract: Contract) => (
                  <ProjectCard
                    key={contract.id}
                    badgeText={
                      contract.effectiveTo && contract.effectiveFrom
                        ? calculateProgress(contract.effectiveFrom, contract.effectiveTo) > 70
                          ? 'Expiring Soon'
                          : calculateProgress(contract.effectiveFrom, contract.effectiveTo) <= 25
                            ? 'New'
                            : undefined
                        : undefined
                    }
                    title={contract.title}
                    imagePath={
                      groundHandlingImages[Math.floor(Math.random() * groundHandlingImages.length)]
                    }
                    subtitle={contract.summary || contract.title}
                    progress={
                      contract.effectiveTo && contract.effectiveFrom
                        ? calculateProgress(contract.effectiveFrom, contract.effectiveTo)
                        : undefined
                    }
                  >
                    <ContractDialog
                      contract={contract}
                      DialogType="view"
                      triggerIntent="secondary"
                      triggerText="View"
                      triggerIcon={Eye}
                      onChange={() => {}}
                    />
                  </ProjectCard>
                ))}
              </div>
            </div>
          );
        })}

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
