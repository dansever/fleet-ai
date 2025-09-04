'use server';
import 'server-only';

import { db } from '@/drizzle';
import { airportsTable } from '@/drizzle/schema';
import { Airport, NewAirport, Organization, UpdateAirport } from '@/drizzle/types';
import { eq } from 'drizzle-orm';

/**
 * Get an airport by ID
 */
export async function getAirportById(id: Airport['id']): Promise<Airport | null> {
  const result = await db.select().from(airportsTable).where(eq(airportsTable.id, id)).limit(1);
  return result[0] ?? null;
}
// Backward compatible alias
export const getAirport = getAirportById;

/**
 * Get all airports by organization ID
 */
export async function listAirportsByOrgId(orgId: Organization['id']): Promise<Airport[]> {
  const query = db.select().from(airportsTable).where(eq(airportsTable.orgId, orgId));
  return await query;
}

/**
 * Create a new airport
 */
export async function createAirport(data: NewAirport): Promise<Airport> {
  const result = await db
    .insert(airportsTable)
    .values({ ...data, createdAt: new Date(), updatedAt: new Date() })
    .returning();
  return result[0];
}

/**
 * Update an existing airport
 */
export async function updateAirport(id: Airport['id'], data: UpdateAirport): Promise<Airport> {
  const result = await db
    .update(airportsTable)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(airportsTable.id, id))
    .returning();
  return result[0];
}

/**
 * Delete an airport
 */
export async function deleteAirport(id: Airport['id']): Promise<void> {
  await db.delete(airportsTable).where(eq(airportsTable.id, id));
}
