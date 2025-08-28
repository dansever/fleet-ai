import { db } from '@/drizzle';
import { orgSettingsTable } from '@/drizzle/schema/schema';
import { NewOrgSettings, OrgSettings, UpdateOrgSettings } from '@/drizzle/types';
import { eq } from 'drizzle-orm';

export async function getOrgSettingsById(orgId: OrgSettings['orgId']): Promise<OrgSettings | null> {
  const result = await db
    .select()
    .from(orgSettingsTable)
    .where(eq(orgSettingsTable.orgId, orgId))
    .limit(1);
  return result[0];
}

export async function createOrgSettings(data: NewOrgSettings) {
  const result = await db
    .insert(orgSettingsTable)
    .values({ ...data, createdAt: new Date(), updatedAt: new Date() })
    .returning();
  return result[0];
}

export async function updateOrgSettings(orgId: OrgSettings['orgId'], data: UpdateOrgSettings) {
  const result = await db
    .update(orgSettingsTable)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(orgSettingsTable.orgId, orgId))
    .returning();
  return result[0];
}

export async function deleteOrgSettings(orgId: OrgSettings['orgId']) {
  await db.delete(orgSettingsTable).where(eq(orgSettingsTable.orgId, orgId)).returning();
}
