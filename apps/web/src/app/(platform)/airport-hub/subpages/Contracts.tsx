import { useAirportHub } from '@/app/(platform)/airport-hub/ContextProvider';
import { LoadingComponent } from '@/components/miscellaneous/Loading';
import { TabsContent } from '@/components/ui/tabs';
import { ContractTypeEnum, getContractTypeDisplay } from '@/drizzle/enums';
import { Contract } from '@/drizzle/types';
import { Button } from '@/stories/Button/Button';
import { Tabs } from '@/stories/Tabs/Tabs';
import { Banknote, BarChart, Brain, ChartBar, FileText } from 'lucide-react';
import { useMemo, useState } from 'react';
import AskAI from '../_components/AskAI';
import ContractList from '../_components/ContractSidebar';
import { ContractDocument } from '../_components/Files';
import { ContractOverview } from '../_components/Overview';

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
        <ContractList />
      </div>
      <Tabs
        tabs={[
          { label: 'Overview', value: 'overview', icon: <BarChart /> },
          { label: 'Files', value: 'files', icon: <FileText /> },
          { label: 'ChatBot', value: 'chatbot', icon: <Brain /> },
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
          <ContractDocument />
        </TabsContent>
        <TabsContent value="chatbot">
          <AskAI />
        </TabsContent>
        <TabsContent value="invoices">
          <div>Invoices</div>
        </TabsContent>
        <TabsContent value="financials">
          <div>Financials</div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

const ContractInvoices = () => {
  return <div>Contract Invoices</div>;
};
