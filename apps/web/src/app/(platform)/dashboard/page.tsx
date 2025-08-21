import { db } from '@/drizzle/db';
import { airportsTable } from '@/drizzle/schema/schema';
import { authorizeUser } from '@/lib/autherization/authorize-user';
import { PageLayout } from '@/stories/PageLayout/PageLayout';
import { eq } from 'drizzle-orm';
import { redirect } from 'next/navigation';
import DashboardClientPage from './ClientPage';

export default async function DashboardPage() {
  const { dbUser, error } = await authorizeUser();

  if (error || !dbUser || !dbUser.orgId) {
    redirect('/sign-in');
  }

  const airports = await db
    .select()
    .from(airportsTable)
    .where(eq(airportsTable.orgId, dbUser.orgId));

  return (
    <PageLayout
      sidebarContent={null}
      headerContent={<h1>Dashboard</h1>}
      mainContent={
        <div>
          {airports.map((airport) => airport.name)}
          <DashboardClientPage />
        </div>
      }
    />
  );
}
