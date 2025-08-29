import { db } from '@/drizzle';
import { fuelContractsTable } from '@/drizzle/schema/schema';
import type { FuelContract, NewFuelContract, UpdateFuelContract } from '@/drizzle/types';
import { eq } from 'drizzle-orm';

/**
 * Get fuel contract by ID
 */
export async function getFuelContractById(id: string): Promise<FuelContract | null> {
  const result = await db
    .select()
    .from(fuelContractsTable)
    .where(eq(fuelContractsTable.id, id))
    .limit(1);
  return result[0] || null;
}

/**
 * Get fuel contracts by airport ID
 */
export async function getFuelContractsByAirportId(airportId: string): Promise<FuelContract[]> {
  const result = await db
    .select()
    .from(fuelContractsTable)
    .where(eq(fuelContractsTable.airportId, airportId));
  return result;
}

/**
 * Create a new fuel contract
 */
export async function createFuelContract(data: NewFuelContract): Promise<FuelContract> {
  const result = await db.insert(fuelContractsTable).values(data).returning();
  return result[0];
}

/**
 * Update a fuel contract
 */
export async function updateFuelContract(
  id: string,
  data: UpdateFuelContract,
): Promise<FuelContract> {
  const result = await db
    .update(fuelContractsTable)
    .set(data)
    .where(eq(fuelContractsTable.id, id))
    .returning();
  return result[0];
}

/**
 * Delete a fuel contract
 */
export async function deleteFuelContract(id: string): Promise<void> {
  await db.delete(fuelContractsTable).where(eq(fuelContractsTable.id, id));
}
