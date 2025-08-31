import { getUserByClerkUserId } from '@/db/core/users/db-actions';
import { currentUser } from '@clerk/nextjs/server';
/*
  Authorizes a user by their Clerk user id and returns the user's database record.
  If the user is not found, an error is returned.
  When to use:
  - When you need to get the user's database record.
*/
export async function authorizeUser() {
  const clerkUser = await currentUser();

  if (!clerkUser) {
    return { clerkUser: null, dbUser: null, error: 'Unauthorized' };
  }

  const dbUser = await getUserByClerkUserId(clerkUser.id);

  if (!dbUser || !dbUser.orgId) {
    return {
      clerkUser: null,
      dbUser: null,
      error: 'Invalid user or missing org',
    };
  }
  return { clerkUser, dbUser, error: null };
}
