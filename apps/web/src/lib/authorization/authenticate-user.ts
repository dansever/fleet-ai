// src/lib/authorization/get-auth-context.ts
'use server';
import 'server-only';

import { server as userServer } from '@/modules/core/users';
import { clerkClient, currentUser } from '@clerk/nextjs/server';

/**
 * SERVER-SIDE ONLY: Authenticates and authorizes the current user
 *
 * PERFORMANCE:
 * - Next.js automatically memoizes this per request
 * - Multiple calls in layout + pages = only 1 actual DB query
 * - Safe to call in every server component/page
 *
 * @returns Object containing dbUser, orgId, and error (if any)
 */
export async function authenticateUser() {
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
 * Gets the active Clerk organization for the current user
 * @returns The first organization in the user's membership list
 */
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

// Legacy export for backwards compatibility - will be removed in future
/** @deprecated Use authenticateUser() instead */
export const getAuthContext = authenticateUser;
