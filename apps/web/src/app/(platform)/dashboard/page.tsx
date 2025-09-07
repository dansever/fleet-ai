import { getAuthContext } from '@/lib/authorization/get-auth-context';
import { server as airportServer } from '@/modules/core/airports';
import { server as rfqServer } from '@/modules/rfqs';
import { PageLayout } from '@/stories/PageLayout/PageLayout';
import DashboardClientPage from './ClientPage';

export default async function DashboardPage() {
  const { dbUser, orgId, error } = await getAuthContext();
  if (error || !dbUser || !orgId) {
    return <div>Error: {error}</div>;
  }

  // Fetch RFQs and quotes in parallel
  const [rfqs, airports] = await Promise.all([
    rfqServer.listRfqsByDirection('sent', orgId),
    airportServer.listAirportsByOrgId(orgId),
  ]);

  return (
    <PageLayout
      sidebarContent={null}
      headerContent={<h1>Hello {dbUser?.firstName}</h1>}
      mainContent={
        <div>
          <DashboardClientPage airports={airports} rfqs={rfqs} />
        </div>
      }
    />
  );
}
