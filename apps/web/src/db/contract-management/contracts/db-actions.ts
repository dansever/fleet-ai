import { db } from '@/drizzle';
import { contractsTable } from '@/drizzle/schema/schema';
import { Contract, NewContract } from '@/drizzle/types';
import { desc, eq } from 'drizzle-orm';

/**
 * Get contract by id
 * @param airportId
 * @returns
 */
export const getContract = async (id: Contract['id']): Promise<Contract> => {
  const result = await db.select().from(contractsTable).where(eq(contractsTable.id, id));
  return result[0];
};

/**
 * Get contracts by airport
 * @param airportId
 * @returns
 */
export const getContractsByAirport = async (airportId: string): Promise<Contract[]> => {
  const result = await db
    .select()
    .from(contractsTable)
    .where(eq(contractsTable.airportId, airportId))
    .orderBy(desc(contractsTable.createdAt));
  return result;
};

/**
 * Update contract
 * @param id
 * @param data
 * @returns
 */
export const updateContract = async (
  id: Contract['id'],
  data: Partial<Contract>,
): Promise<Contract> => {
  const result = await db
    .update(contractsTable)
    .set(data)
    .where(eq(contractsTable.id, id))
    .returning();
  return result[0];
};

/**
 * Create a service contract
 * @param data
 * @returns
 */
export const createContract = async (data: NewContract): Promise<Contract> => {
  const result = await db
    .insert(contractsTable)
    .values({ ...data })
    .returning();
  return result[0];
};

/**
 * Delete contract
 * @param id
 */
export const deleteContract = async (id: Contract['id']): Promise<void> => {
  await db.delete(contractsTable).where(eq(contractsTable.id, id));
};
