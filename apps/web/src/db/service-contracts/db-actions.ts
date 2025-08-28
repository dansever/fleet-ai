import { db } from '@/drizzle';
import { serviceContractsTable } from '@/drizzle/schema/schema';
import { NewServiceContract, ServiceContract } from '@/drizzle/types';
import { desc, eq } from 'drizzle-orm';

/**
 *
 * @param airportId
 * @returns
 */
export const getServiceContract = async (id: ServiceContract['id']): Promise<ServiceContract> => {
  const result = await db
    .select()
    .from(serviceContractsTable)
    .where(eq(serviceContractsTable.id, id));
  return result[0];
};

/**
 *
 * @param airportId
 * @returns
 */
export const getServiceContractsByAirport = async (
  airportId: string,
): Promise<ServiceContract[]> => {
  const result = await db
    .select()
    .from(serviceContractsTable)
    .where(eq(serviceContractsTable.airportId, airportId))
    .orderBy(desc(serviceContractsTable.createdAt));
  return result;
};

/**
 *
 * @param id
 * @param data
 * @returns
 */
export const updateServiceContract = async (
  id: ServiceContract['id'],
  data: Partial<ServiceContract>,
): Promise<ServiceContract> => {
  const result = await db
    .update(serviceContractsTable)
    .set(data)
    .where(eq(serviceContractsTable.id, id))
    .returning();
  return result[0];
};

/**
 * Create a service contract
 * @param airportId
 * @param data
 * @returns
 */
export const createServiceContract = async (data: NewServiceContract): Promise<ServiceContract> => {
  const result = await db
    .insert(serviceContractsTable)
    .values({ ...data })
    .returning();
  return result[0];
};

/**
 *
 * @param id
 */
export const deleteServiceContract = async (id: ServiceContract['id']): Promise<void> => {
  await db.delete(serviceContractsTable).where(eq(serviceContractsTable.id, id));
};
