import { db } from '@/drizzle/db';
import { airportsTable } from '@/drizzle/schema/schema';
import { authorizeUser } from '@/lib/autherization/authorize-user';
import { Button, IconButton } from '@/stories/Button/Button';
import { eq } from 'drizzle-orm';
import { PlusIcon } from 'lucide-react';
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
        <div key={airport.id} className="flex items-center gap-2">
          {airport.name}
          <Button
            intent="success"
            size="md"
            // onClick={() => {
            //   console.log('Storybook Button clicked');
            // }}
          >
            Add Airport
          </Button>
          <IconButton icon={PlusIcon} intent="primary" size="sm" />
        </div>
      ))}
    </div>
  );
}
