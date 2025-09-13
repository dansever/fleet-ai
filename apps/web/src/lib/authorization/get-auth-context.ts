// src/lib/authorization/get-auth-context.ts
'use server';
import 'server-only';

import { server as userServer } from '@/modules/core/users';
import { clerkClient, currentUser } from '@clerk/nextjs/server';

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

export async function getActiveClerkOrg() {
  const user = await currentUser();

  // Get the organization membership list for the user
  const reponse = await (
    await clerkClient()
  ).users.getOrganizationMembershipList({
    userId: user?.id ?? '',
  });
  return reponse.data[0]?.organization;
}
