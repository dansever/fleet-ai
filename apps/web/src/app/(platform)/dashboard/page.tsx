import { db } from '@/drizzle/db';
import { airportsTable } from '@/drizzle/schema/schema';
import { authorizeUser } from '@/lib/autherization/authorize-user';
import { PageLayout } from '@/stories/PageLayout/PageLayout';
import { eq } from 'drizzle-orm';
import { redirect } from 'next/navigation';

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
      headerContent={'Hello'}
      mainContent={<div>{airports.map((airport) => airport.name)}</div>}
    />
    // <div>
    //   Welcome, {dbUser.displayName}!
    //   {airports.map((airport) => (
    //     <div key={airport.id} className="flex items-center gap-2">
    //       {airport.name}
    //       <Button
    //         intent="success"
    //         size="md"
    //         // onClick={() => {
    //         //   console.log('Storybook Button clicked');
    //         // }}
    //       >
    //         Add Airport
    //       </Button>
    //       <IconButton icon={PlusIcon} intent="primary" size="sm" />
    //     </div>
    //   ))}
    // </div>
  );
}
