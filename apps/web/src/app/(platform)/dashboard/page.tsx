import { getAirportsByOrgId } from '@/db/airports/db-actions';
import { getRfqsByOrgAndDirection } from '@/db/rfqs/db-actions';
import { authorizeUser } from '@/lib/authorization/authorize-user';
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
    getRfqsByOrgAndDirection(dbUser.orgId, 'sent'),
    getAirportsByOrgId(dbUser.orgId),
  ]);

  return (
    <PageLayout
      sidebarContent={null}
      headerContent={<h1>Hello {dbUser?.displayName}</h1>}
      mainContent={
        <div>
          <DashboardClientPage airports={airports} rfqs={rfqs} />
        </div>
      }
    />
  );
}
