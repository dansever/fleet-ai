import { authorizeUser } from '@/lib/authorization/authorize-user';
import { server } from '@/modules/rfqs';
import TechnicalProcurementClientPage from './ClientPage';
import { TechnicalProcurementContextProvider } from './ContextProvider';

export default async function TechnicalProcurementPage() {
  const { dbUser, error } = await authorizeUser();
  if (error || !dbUser) {
    return <div>Error: {error}</div>;
  }
  if (!dbUser.orgId) {
    return <div>Error: User has no organization</div>;
  }

  // Fetch RFQs and quotes in parallel
  const [rfqs] = await Promise.all([server.listOrgRfqsByDirection(dbUser.orgId, 'sent')]);

  return (
    <TechnicalProcurementContextProvider initialRfqs={rfqs} hasServerData={true}>
      <TechnicalProcurementClientPage />
    </TechnicalProcurementContextProvider>
  );
}
