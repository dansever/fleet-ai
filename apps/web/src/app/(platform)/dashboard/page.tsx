import { authenticateUser } from '@/lib/authorization/authenticate-user';
import { jsonError } from '@/lib/core/errors';
import { server as airportServer } from '@/modules/core/airports';
import { server as rfqServer } from '@/modules/rfqs';
import DashboardClientPage from './ClientPage';
import { DashboardContextProvider } from './ContextProvider';

export default async function DashboardPage() {
  const { dbUser, orgId, error } = await authenticateUser();
  if (error || !dbUser || !orgId) {
    return jsonError('Unauthorized', 401);
  }

  // Fetch RFQs and quotes in parallel
  const [rfqs, airports] = await Promise.all([
    rfqServer.listRfqsByDirection('sent', orgId),
    airportServer.listAirportsByOrgId(orgId),
  ]);

  return (
    <DashboardContextProvider user={dbUser} airports={airports} rfqs={rfqs}>
      <DashboardClientPage />
    </DashboardContextProvider>
  );
}
