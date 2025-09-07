'use server';
import 'server-only';

import { db } from '@/drizzle';
import { fuelBidsTable } from '@/drizzle/schema/schema.fuel';
import { FuelBid, FuelTender, NewFuelBid, UpdateFuelBid } from '@/drizzle/types';
import { eq } from 'drizzle-orm';

/**
 * Get fuel bid by ID
 */
export async function getFuelBidById(id: FuelBid['id']): Promise<FuelBid | null> {
  const result = await db.select().from(fuelBidsTable).where(eq(fuelBidsTable.id, id)).limit(1);
  return result[0] || null;
}
// Backward compatible alias
export const getFuelBid = getFuelBidById;

/**
 * Get fuel bids by tender ID
 */
export async function listFuelBidsByTender(tenderId: FuelTender['id']): Promise<FuelBid[]> {
  const result = await db.select().from(fuelBidsTable).where(eq(fuelBidsTable.tenderId, tenderId));
  return result;
}

/**
 * Create a new fuel bid
 */
export async function createFuelBid(data: NewFuelBid): Promise<FuelBid> {
  const result = await db.insert(fuelBidsTable).values(data).returning();
  return result[0];
}

/**
 * Update an existing fuel bid
 */
export async function updateFuelBid(id: FuelBid['id'], data: UpdateFuelBid): Promise<FuelBid> {
  const result = await db
    .update(fuelBidsTable)
    .set(data)
    .where(eq(fuelBidsTable.id, id))
    .returning();
  return result[0];
}

/**
 * Delete a fuel bid
 */
export async function deleteFuelBid(id: FuelBid['id']): Promise<void> {
  await db.delete(fuelBidsTable).where(eq(fuelBidsTable.id, id));
}
