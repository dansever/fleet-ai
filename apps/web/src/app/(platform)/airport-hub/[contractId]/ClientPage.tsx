'use client';

import { Button } from '@/stories/Button/Button';
import { MainCard } from '@/stories/Card/Card';
import { KeyValuePair } from '@/stories/KeyValuePair/KeyValuePair';
import { PageLayout } from '@/stories/PageLayout/PageLayout';
import { ArrowLeft, FileText, Plus, ReceiptText } from 'lucide-react';
import { useRouter } from 'next/navigation';
import ContractTermsDataTable from './_components/ContractTermsDataTable';
import { useContract } from './ContextProvider';

export default function ContractClientPage() {
  const { contract, contractRules, invoices, invoiceLines, loading, error } = useContract();
  const router = useRouter();

  const Sidebar = () => {
    return (
      <div>
        <h2>TODO - Invoices</h2>
      </div>
    );
  };

  const Header = () => {
    return (
      <div className="flex items-center gap-2">
        <Button intent="ghost" text="Back" icon={ArrowLeft} onClick={() => router.back()} />
        <h2>{contract?.title}</h2>
      </div>
    );
  };

  const Main = () => {
    return (
      <div className="flex flex-col gap-4">
        <MainCard title="Contract Information" icon={<FileText />}>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <KeyValuePair label="Title" value={contract?.title} valueType="string" />
              <KeyValuePair
                label="Contract Type"
                value={contract?.contractType}
                valueType="string"
              />
              <KeyValuePair label="Summary" value={contract?.summary} valueType="string" />
              <KeyValuePair
                label="Effective From"
                value={contract?.effectiveFrom}
                valueType="string"
              />
              <KeyValuePair label="Effective To" value={contract?.effectiveTo} valueType="string" />
            </div>
            <div>
              <KeyValuePair label="Vendor" value={contract?.vendorName} valueType="string" />
              <KeyValuePair
                label="Vendor Address"
                value={contract?.vendorAddress}
                valueType="string"
              />
              <KeyValuePair
                label="Contact Name"
                value={contract?.vendorContactName}
                valueType="string"
              />
              <KeyValuePair
                label="Contact Email"
                value={contract?.vendorContactEmail}
                valueType="string"
              />
              <KeyValuePair
                label="Contact Phone"
                value={contract?.vendorContactPhone}
                valueType="string"
              />
              <KeyValuePair label="Comments" value={contract?.vendorComments} valueType="string" />
            </div>
          </div>
        </MainCard>
        <MainCard
          title="Contract Terms & Conditions"
          icon={
            <div className="p-2 bg-gradient-to-br from-orange-300 to-pink-300 rounded-xl">
              <ReceiptText />
            </div>
          }
          neutralHeader={true}
          actions={<Button intent="add" text="Add Term" icon={Plus} />}
        >
          <ContractTermsDataTable />
        </MainCard>
      </div>
    );
  };

  return (
    <PageLayout
      sidebarContent={<Sidebar />}
      sidebarWidth="16rem"
      sidebarPosition="right"
      headerContent={<Header />}
      mainContent={<Main />}
    />
  );
}
