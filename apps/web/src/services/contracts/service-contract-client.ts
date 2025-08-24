import type { NewServiceContract, ServiceContract } from '@/drizzle/types';
import { api } from '../api-client';

// Client-side type for creating fuel tenders (orgId is handled server-side)
export type CreateSErviceContractData = Omit<
  NewServiceContract,
  'orgId' | 'id' | 'createdAt' | 'updatedAt'
>;

/**
 * Get a service contract by ID
 */
export async function getServiceContract(id: ServiceContract['id']): Promise<ServiceContract> {
  const res = await api.get(`/api/service-contracts?id=${id}`);
  return res.data;
}

/**
 * Get a service contract by ID
 */
export async function getServiceContractsByAirport(airportId: string): Promise<ServiceContract[]> {
  const res = await api.get(`/api/service-contracts?airportId=${airportId}`);
  return res.data;
}
