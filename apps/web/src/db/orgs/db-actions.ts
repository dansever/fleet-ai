import { db } from '@/drizzle/db';
import { organizationsTable } from '@/drizzle/schema/schema';
import { NewOrganization, Organization } from '@/drizzle/types';
import { eq, sql } from 'drizzle-orm';

/**
 * Get an organization by its database id
 */
export async function getOrgById(id: string): Promise<Organization | null> {
  const result = await db
    .select()
    .from(organizationsTable)
    .where(eq(organizationsTable.id, id));
  return result[0];
}

/**
 * Get an organization by its Clerk organization id
 */
export async function getOrgByClerkOrgId(
  clerkOrgId: string,
): Promise<Organization | undefined> {
  const result = await db
    .select()
    .from(organizationsTable)
    .where(eq(organizationsTable.clerkOrgId, clerkOrgId));
  return result[0];
}

/**
 * Create a new organization
 */
export async function createOrg(data: NewOrganization): Promise<Organization> {
  const result = await db
    .insert(organizationsTable)
    .values({ ...data, createdAt: new Date(), updatedAt: new Date() })
    .returning();
  return result[0];
}

/**
 * Update an organization - general update
 */
export async function updateOrg(
  id: Organization['id'],
  data: Partial<NewOrganization>,
) {
  const result = await db
    .update(organizationsTable)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(organizationsTable.id, id))
    .returning();
  return result[0];
}

/**
 * Update an organization's usage stats
 */
export async function updateOrgUsage(
  orgId: Organization['id'],
  usageData: {
    aiTokenUsage?: number;
    totalQuotesProcessed?: number;
    totalRfqsProcessed?: number;
  },
) {
  const updatePayload: Record<string, unknown> = {
    updatedAt: new Date(),
  };

  if (usageData.aiTokenUsage) {
    updatePayload.aiTokensUsed = sql`${organizationsTable.aiTokensUsed} + ${usageData.aiTokenUsage}`;
  }

  if (usageData.totalQuotesProcessed) {
    updatePayload.totalQuotesProcessed = sql`${organizationsTable.totalQuotesProcessed} + ${usageData.totalQuotesProcessed}`;
  }

  if (usageData.totalRfqsProcessed) {
    updatePayload.totalRfqsProcessed = sql`${organizationsTable.totalRfqsProcessed} + ${usageData.totalRfqsProcessed}`;
  }
  const result = await db
    .update(organizationsTable)
    .set({ ...updatePayload, updatedAt: new Date() })
    .where(eq(organizationsTable.id, orgId))
    .returning();
  return result[0];
}

/**
 * Delete an organization
 */
export async function deleteOrgById(id: Organization['id']): Promise<void> {
  await db
    .delete(organizationsTable)
    .where(eq(organizationsTable.id, id))
    .returning();
}
