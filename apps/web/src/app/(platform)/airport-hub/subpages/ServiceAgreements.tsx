import { useAirportHub } from '@/app/(platform)/airport-hub/context';
import { LoadingComponent } from '@/components/miscellaneous/Loading';
import { Badge } from '@/components/ui/badge';
import { TabsContent } from '@/components/ui/tabs';
import {
  ContractTypeEnum,
  getContractTypeColor,
  getContractTypeDisplayName,
  getProcessStatusDisplay,
} from '@/drizzle/enums';
import { Contract } from '@/drizzle/types';
import ContractDialog from '@/features/contracts/contracts/ContractDialog';
import { deleteContract } from '@/modules/contracts/contracts.client';
import { BaseCard, ConfirmationPopover } from '@/stories';
import { Button } from '@/stories/Button/Button';
import { Tabs } from '@/stories/Tabs/Tabs';
import { Banknote, BarChart, ChartBar, Eye, FileText, Trash } from 'lucide-react';
import { useMemo, useState } from 'react';
import { ContractOverview } from '../_components/contract/ContractOverview';
import ContractSidebar from '../_components/contract/ContractSidebar';
import { ContractDocuments } from '../_components/documents/ContractDocuments';

export default function ServiceAgreementsPage() {
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

  // Calculate days remaining
  const calculateDaysRemaining = (endDate?: string) => {
    if (!endDate) return null;
    const end = new Date(endDate);
    const now = new Date();
    const diffTime = end.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };
  const daysRemaining = calculateDaysRemaining(selectedContract?.effectiveTo || undefined);
  const isExpiringSoon = daysRemaining !== null && daysRemaining <= 30 && daysRemaining > 0;
  const isExpired = daysRemaining !== null && daysRemaining <= 0;

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
        display: getContractTypeDisplayName(type),
      }))
      .filter((item) => item.count > 0);

    return { total, active, expiringSoon, contractsByType };
  }, [contracts, groupedContracts, contractTypes]);

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'pending':
        return 'secondary';
      case 'in_progress':
        return 'default';
      case 'closed':
        return 'outline';
      default:
        return 'secondary';
    }
  };

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

  // Keep layout even when there are no contracts; empty state handled in ContractDetails

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
        <ContractSidebar />
      </div>
      <BaseCard
        headerClassName=""
        contentClassName=""
        header={
          <div className="flex flex-col gap-4">
            <div className="flex flex-row justify-between items-start">
              {/* Title, Subtitle, Badges */}
              <div className="flex flex-col gap-2">
                <h2>{selectedContract?.title}</h2>
                <div className="flex flex-wrap gap-2">
                  <Badge className={getContractTypeColor(selectedContract?.contractType)}>
                    {getContractTypeDisplayName(selectedContract?.contractType)}
                  </Badge>
                  <Badge
                    variant={getStatusBadgeVariant(selectedContract?.processStatus || 'unassigned')}
                  >
                    {getProcessStatusDisplay(selectedContract?.processStatus)}
                  </Badge>
                  {isExpired && (
                    <Badge variant="destructive" className="text-xs">
                      Expired
                    </Badge>
                  )}
                  {isExpiringSoon && !isExpired && (
                    <Badge variant="destructive" className="text-xs">
                      Expires in {daysRemaining} days
                    </Badge>
                  )}
                </div>
              </div>

              {/* Contract-Level Actions */}
              <div className="flex flex-row gap-2">
                <ContractDialog
                  DialogType="view"
                  contract={selectedContract}
                  airport={selectedAirport}
                  trigger={<Button intent="secondary" text="View Contract" icon={Eye}></Button>}
                  onChange={refreshContracts}
                />

                {/* Dangerous Actions Section */}
                <ConfirmationPopover
                  onConfirm={() => deleteContract(selectedContract?.id || '')}
                  trigger={<Button text="Delete Contract" intent="danger" icon={Trash} />}
                  popoverIntent="danger"
                  title="Delete Entire Contract"
                  description={`Are you sure you want to permanently delete "${selectedContract?.title}"? This will delete the contract and all associated documents. This action cannot be undone.`}
                />
              </div>
            </div>
          </div>
        }
      >
        <Tabs
          tabs={[
            { label: 'Overview', value: 'overview', icon: <BarChart /> },
            { label: 'Files', value: 'files', icon: <FileText /> },
            { label: 'Invoices', value: 'invoices', icon: <Banknote /> },
            { label: 'Financials', value: 'financials', icon: <ChartBar /> },
          ]}
          defaultTab="overview"
          onTabChange={() => {}}
          className="flex-1"
        >
          <TabsContent value="overview">
            <ContractOverview />
          </TabsContent>
          <TabsContent value="files">
            <ContractDocuments />
          </TabsContent>
          <TabsContent value="invoices">
            <div>Invoices</div>
          </TabsContent>
          <TabsContent value="financials">
            <div>Financials</div>
          </TabsContent>
        </Tabs>
      </BaseCard>
    </div>
  );
}

const ContractInvoices = () => {
  return <div>Contract Invoices</div>;
};
