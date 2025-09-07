'use server';
import 'server-only';

import { db } from '@/drizzle';
import { usersTable } from '@/drizzle/schema/schema';
import { NewUser, Organization, UpdateUser, User } from '@/drizzle/types';
import { eq, sql } from 'drizzle-orm';

/**
 * Get a user by their database id
 */
export async function getUserById(id: User['id']): Promise<User | null> {
  const result = await db.select().from(usersTable).where(eq(usersTable.id, id));
  return result[0] ?? null;
}
// Backward compatible alias
export const getUser = getUserById;

/**
 * Get a user by their Clerk user id
 */
export async function getUserByClerkUserId(clerkUserId: User['clerkUserId']): Promise<User | null> {
  const result = await db.select().from(usersTable).where(eq(usersTable.clerkUserId, clerkUserId));
  return result[0] ?? null;
}

/**
 * Get all users for an organization
 */
export async function listUsersByOrgId(orgId: Organization['id']): Promise<User[]> {
  const users = await db.select().from(usersTable).where(eq(usersTable.orgId, orgId));
  return users;
}

/**
 * Create a new user
 */
export async function createUser(data: NewUser): Promise<User> {
  const result = await db
    .insert(usersTable)
    .values({ ...data, createdAt: new Date(), updatedAt: new Date() })
    .returning();
  return result[0];
}

/**
 * Update a user
 */
export async function updateUser(id: User['id'], data: UpdateUser): Promise<User> {
  const result = await db
    .update(usersTable)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(usersTable.id, id))
    .returning();
  return result[0];
}

/**
 * Update a user's usage stats
 */
export async function updateUserUsage(
  id: User['id'],
  usageData: {
    aiTokensUsed?: number;
    totalQuotesProcessed?: number;
    totalRfqsProcessed?: number;
  },
): Promise<User> {
  const updatePayload: Record<string, unknown> = {
    updatedAt: new Date(),
  };

  if (usageData.aiTokensUsed !== undefined && usageData.aiTokensUsed > 0) {
    updatePayload.aiTokensUsed = sql`${usersTable.aiTokensUsed} + ${usageData.aiTokensUsed}`;
  }

  if (usageData.totalQuotesProcessed !== undefined && usageData.totalQuotesProcessed > 0) {
    updatePayload.totalQuotesProcessed = sql`${usersTable.totalQuotesProcessed} + ${usageData.totalQuotesProcessed}`;
  }

  if (usageData.totalRfqsProcessed !== undefined && usageData.totalRfqsProcessed > 0) {
    updatePayload.totalRfqsProcessed = sql`${usersTable.totalRfqsProcessed} + ${usageData.totalRfqsProcessed}`;
  }
  const result = await db
    .update(usersTable)
    .set(updatePayload)
    .where(eq(usersTable.id, id))
    .returning();
  return result[0];
}

/**
 * Delete a user
 */
export async function deleteUser(id: User['id']): Promise<void> {
  await db.delete(usersTable).where(eq(usersTable.id, id));
}
