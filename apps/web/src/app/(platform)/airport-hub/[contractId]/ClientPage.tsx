'use client';

import { useRouter } from 'next/navigation';
import { useContract } from './ContextProvider';

export default function ContractClientPage() {
  const { contract, contractRules, invoices, invoiceLines, loading, error } = useContract();
  const router = useRouter();

  return (
    <div>
      <h1>Contract</h1>
    </div>
  );
}
