import { getAuthContext } from '@/lib/authorization/authenticate-user';
import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import AdminClientPage from './ClientPage';

async function checkAdminAccess() {
  // Get auth context
  const { dbUser, orgId, error } = await getAuthContext();
  if (error || !dbUser || !orgId) {
    return false;
  }

  // Get Clerk user to check organization role
  const clerkUser = await currentUser();
  if (!clerkUser) {
    return false;
  }

  // Check if user is organization owner/admin
  // For now, we'll use a simplified check - in production, you'd want to check Clerk organization membership
  // This is a placeholder until proper Clerk organization role checking is implemented
  return true; // TODO: Implement proper organization owner/admin check
}

export default async function AdminPage() {
  const hasAdminAccess = await checkAdminAccess();

  if (!hasAdminAccess) {
    redirect('/unauthorized');
  }

  return <AdminClientPage />;
}
