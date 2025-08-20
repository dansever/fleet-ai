import { db } from '@/drizzle/db';
import { airportsTable } from '@/drizzle/schema/schema';
import { authorizeUser } from '@/lib/autherization/authorize-user';
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
    <div>
      Welcome, {dbUser.displayName}!
      {airports.map((airport) => (
        <div key={airport.id}>{airport.name}</div>
      ))}
    </div>
  );
}
