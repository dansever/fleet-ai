'use server';
import 'server-only';

import { db } from '@/drizzle';
import { usersTable } from '@/drizzle/schema/schema.core';
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
    tokensUsed?: number;
    quotesProcessed?: number;
    rfqsProcessed?: number;
    fuelTendersProcessed?: number;
    fuelBidsProcessed?: number;
    filesUploaded?: number;
  },
): Promise<User> {
  const updatePayload: Record<string, unknown> = {
    updatedAt: new Date(),
  };

  if (usageData.tokensUsed !== undefined && usageData.tokensUsed > 0) {
    updatePayload.tokensUsed = sql`${usersTable.tokensUsed} + ${usageData.tokensUsed}`;
  }

  if (usageData.quotesProcessed !== undefined && usageData.quotesProcessed > 0) {
    updatePayload.quotesProcessed = sql`${usersTable.quotesProcessed} + ${usageData.quotesProcessed}`;
  }

  if (usageData.rfqsProcessed !== undefined && usageData.rfqsProcessed > 0) {
    updatePayload.rfqsProcessed = sql`${usersTable.rfqsProcessed} + ${usageData.rfqsProcessed}`;
  }

  if (usageData.fuelTendersProcessed !== undefined && usageData.fuelTendersProcessed > 0) {
    updatePayload.fuelTendersProcessed = sql`${usersTable.fuelTendersProcessed} + ${usageData.fuelTendersProcessed}`;
  }

  if (usageData.fuelBidsProcessed !== undefined && usageData.fuelBidsProcessed > 0) {
    updatePayload.fuelBidsProcessed = sql`${usersTable.fuelBidsProcessed} + ${usageData.fuelBidsProcessed}`;
  }

  if (usageData.filesUploaded !== undefined && usageData.filesUploaded > 0) {
    updatePayload.filesUploaded = sql`${usersTable.filesUploaded} + ${usageData.filesUploaded}`;
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
