import { server as userServer } from '@/modules/core/users';
import { currentUser } from '@clerk/nextjs/server';

/*
  Authorizes a user by their Clerk user id and returns the user's database record.
  If the user is not found, an error is returned.
*/
export async function authorizeUser() {
  const clerkUser = await currentUser();

  if (!clerkUser) {
    return { dbUser: null, orgId: null, error: 'Unauthorized' };
  }

  const dbUser = await userServer.getUserByClerkUserId(clerkUser.id);

  if (!dbUser) {
    return {
      dbUser: null,
      orgId: null,
      error: 'User not found or unauthorized',
    };
  }

  const orgId = dbUser.orgId;
  if (!orgId) {
    return {
      dbUser: null,
      orgId: null,
      error: 'User has no organization',
    };
  }

  return { dbUser, orgId, error: null };
}
