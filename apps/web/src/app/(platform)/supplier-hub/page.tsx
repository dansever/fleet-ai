import { getAuthContext } from '@/lib/authorization/get-auth-context';
import { server as rfqServer } from '@/modules/rfqs';
import TechnicalProcurementClientPage from './ClientPage';
import { TechnicalProcurementContextProvider } from './ContextProvider';

export default async function TechnicalProcurementPage() {
  const { dbUser, error } = await getAuthContext();
  if (error || !dbUser) {
    return <div>Error: {error}</div>;
  }
  if (!dbUser.orgId) {
    return <div>Error: User has no organization</div>;
  }

  // Fetch RFQs and quotes in parallel
  const [rfqs] = await Promise.all([rfqServer.listRfqsByDirection('received', dbUser.orgId)]);

  return (
    <TechnicalProcurementContextProvider initialRfqs={rfqs} hasServerData={true}>
      <TechnicalProcurementClientPage />
    </TechnicalProcurementContextProvider>
  );
}
