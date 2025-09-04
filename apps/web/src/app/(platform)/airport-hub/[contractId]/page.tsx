import { server as contractRulesServer } from '@/modules/contracts/contractRules';
import { server as contractServer } from '@/modules/contracts/contracts';
import ContractClientPage from './ClientPage';
import ContractContextProvider from './ContextProvider';

interface ContractPageProps {
  params: { contractId: string };
}

export default async function ContractPage({ params }: ContractPageProps) {
  const { contractId } = params;

  // Fetch initial contract data on the server
  let initialContract = null;
  try {
    initialContract = await contractServer.getContractById(contractId);
  } catch (error) {
    console.error('Failed to fetch contract:', error);
    // We'll handle the error in the client component
  }

  let initialContractRules = null;
  try {
    initialContractRules = await contractRulesServer.listContractRulesByContractId(contractId);
  } catch (error) {
    console.error('Failed to fetch contract rules:', error);
    // We'll handle the error in the client component
  }

  return (
    <ContractContextProvider
      contractId={contractId}
      initialContract={initialContract}
      initialContractRules={initialContractRules}
    >
      <ContractClientPage />
    </ContractContextProvider>
  );
}
