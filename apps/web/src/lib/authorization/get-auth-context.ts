// src/lib/authorization/get-auth-context.ts
'use server';
import 'server-only';

import { server as userServer } from '@/modules/core/users';
import { currentUser } from '@clerk/nextjs/server';

export async function getAuthContext() {
  const clerkUser = await currentUser();
  if (!clerkUser) {
    return { dbUser: null, orgId: null, error: 'Unauthorized' };
  }

  const dbUser = await userServer.getUserByClerkUserId(clerkUser.id);
  if (!dbUser) {
    return { dbUser: null, orgId: null, error: 'User not found or unauthorized' };
  }

  const orgId = dbUser.orgId;
  if (!orgId) {
    return { dbUser, orgId: null, error: 'User has no organization' };
  }

  return { dbUser, orgId, error: null };
}

/**
 * Convenience wrapper if you only need the orgId.
 * Throws if auth fails.
 */
export async function getOrgId(): Promise<string> {
  const { orgId, error } = await getAuthContext();
  if (error || !orgId) {
    throw new Error(error ?? 'Unauthorized');
  }
  return orgId;
}
