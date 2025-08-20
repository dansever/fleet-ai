import { authorizeUser } from '@/lib/autherization/authorize-user';
import { redirect } from 'next/navigation';

export default async function DashboardPage() {
  const { dbUser, error } = await authorizeUser();

  if (error || !dbUser || !dbUser.orgId) {
    redirect('/sign-in');
  }

  return <div>Welcome, {dbUser.displayName}!</div>;
}
