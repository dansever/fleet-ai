'use server';
import 'server-only';

import { db } from '@/drizzle';
import { fuelTendersTable } from '@/drizzle/schema';
import type { FuelTender, NewFuelTender, UpdateFuelTender } from '@/drizzle/types';
import { desc, eq } from 'drizzle-orm';

/**
 * Get fuel tender by ID
 */
export async function getFuelTenderById(id: string): Promise<FuelTender | null> {
  const result = await db
    .select()
    .from(fuelTendersTable)
    .where(eq(fuelTendersTable.id, id))
    .limit(1);
  return result[0] || null;
}
// Backward compatible alias
export const getFuelTender = getFuelTenderById;

/**
 * Get fuel tenders by airport ID
 */
export async function listFuelTendersByAirportId(airportId: string): Promise<FuelTender[]> {
  const result = await db
    .select()
    .from(fuelTendersTable)
    .where(eq(fuelTendersTable.airportId, airportId))
    .orderBy(desc(fuelTendersTable.createdAt));
  return result;
}

/**
 * Get fuel tenders by organization ID
 */
export async function listFuelTendersByOrgId(orgId: string): Promise<FuelTender[]> {
  const result = await db
    .select()
    .from(fuelTendersTable)
    .where(eq(fuelTendersTable.orgId, orgId))
    .orderBy(desc(fuelTendersTable.createdAt));
  return result;
}

/**
 * Create a new fuel tender
 */
export async function createFuelTender(data: NewFuelTender): Promise<FuelTender> {
  const result = await db.insert(fuelTendersTable).values(data).returning();
  return result[0];
}

/**
 * Update an existing fuel tender
 */
export async function updateFuelTender(id: string, data: UpdateFuelTender): Promise<FuelTender> {
  const result = await db
    .update(fuelTendersTable)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(fuelTendersTable.id, id))
    .returning();
  return result[0];
}

/**
 * Delete a fuel tender
 */
export async function deleteFuelTender(id: string): Promise<void> {
  await db.delete(fuelTendersTable).where(eq(fuelTendersTable.id, id)).returning();
}
