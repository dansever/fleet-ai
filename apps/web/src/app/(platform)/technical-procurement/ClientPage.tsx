'use client';

import { Rfq } from '@/drizzle/types';
import { PageLayout } from '@/stories/PageLayout/PageLayout';
import RfqList from './_components/RfqList';

export default function TechnicalProcurementClientPage() {
  return (
    <PageLayout
      sidebarContent={
        <RfqList
          rfqs={[]}
          orgUsers={[]}
          selectedRfq={null}
          onRfqSelect={() => {}}
          updateRfq={async () => {
            return {} as Rfq;
          }}
          addRfq={() => {}}
        />
      }
      headerContent="RFQ Header"
      mainContent="RFQ Details Section"
      sidebarWidth="16rem"
      headerHeight="4rem"
    />
  );
}
