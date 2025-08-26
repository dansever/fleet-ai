import type { Airport, NewServiceContract, ServiceContract } from '@/drizzle/types';
import { api } from '../api-client';

// Client-side type for creating service contracts (orgId is handled server-side)
export type CreateServiceContractData = Omit<
  NewServiceContract,
  'orgId' | 'id' | 'createdAt' | 'updatedAt'
>;

/**
 * Get a service contract by ID
 */
export async function getServiceContract(
  id: ServiceContract['id'],
): Promise<ServiceContract | null> {
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

/**
 * Create a service contract
 */
export async function createServiceContract(
  airportId: Airport['id'],
  data: CreateServiceContractData,
): Promise<ServiceContract> {
  const res = await api.post(`/api/service-contracts?airportId=${airportId}`, data);
  return res.data;
}

/**
 * Update a service contract
 */
export async function updateServiceContract(
  id: ServiceContract['id'],
  data: Partial<ServiceContract>,
): Promise<ServiceContract> {
  const res = await api.put(`/api/service-contracts/${id}`, data);
  return res.data;
}

/**
 * Delete a service contract
 */
export async function deleteServiceContract(id: ServiceContract['id']): Promise<void> {
  await api.delete(`/api/service-contracts/${id}`);
}
