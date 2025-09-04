import { authorizeUser } from '@/lib/authorization/authorize-user';
import { server as rfqServer } from '@/modules/rfqs';
import TechnicalProcurementClientPage from './ClientPage';
import { TechnicalProcurementContextProvider } from './ContextProvider';

export default async function TechnicalProcurementPage() {
  const { dbUser, orgId, error } = await authorizeUser();
  if (error || !dbUser || !orgId) {
    return <div>Error: {error}</div>;
  }

  // Fetch RFQs and quotes in parallel
  const [rfqs] = await Promise.all([rfqServer.listOrgRfqsByDirection(orgId, 'sent')]);

  return (
    <TechnicalProcurementContextProvider initialRfqs={rfqs} hasServerData={true}>
      <TechnicalProcurementClientPage />
    </TechnicalProcurementContextProvider>
  );
}
