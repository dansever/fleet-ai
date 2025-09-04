import { authorizeUser } from '@/lib/authorization/authorize-user';
import { server as airportServer } from '@/modules/core/airports';
import { server as rfqServer } from '@/modules/rfqs';
import { PageLayout } from '@/stories/PageLayout/PageLayout';
import DashboardClientPage from './ClientPage';

export default async function DashboardPage() {
  const { dbUser, error } = await authorizeUser();
  if (error || !dbUser) {
    return <div>Error: {error}</div>;
  }
  if (!dbUser.orgId) {
    return <div>Error: User has no organization</div>;
  }

  // Fetch RFQs and quotes in parallel
  const [rfqs, airports] = await Promise.all([
    rfqServer.listOrgRfqsByDirection(dbUser.orgId, 'sent'),
    airportServer.listAirportsByOrgId(dbUser.orgId),
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
