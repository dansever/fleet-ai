import { ContractType } from '@/drizzle/enums';
import type { Airport, Contract, NewContract } from '@/drizzle/types';
import { api } from '../api-client';

// Client-side type for creating contracts (orgId is handled server-side)
export type CreateContractData = Omit<NewContract, 'orgId' | 'id' | 'createdAt' | 'updatedAt'>;

/**
 * Get a contract by ID
 */
export async function getContract(id: Contract['id']): Promise<Contract | null> {
  const res = await api.get(`/api/contracts?id=${id}`);
  return res.data;
}

/**
 * Get a contract by ID
 */
export async function getContractsByAirport(airportId: Airport['id']): Promise<Contract[]> {
  const res = await api.get(`/api/contracts?airportId=${airportId}`);
  return res.data;
}

/**
 * Get contracts by airport and type
 * @param airportId - The ID of the airport
 * @param contractType - The type of the contract
 * @returns
 */
export async function getContractsByAirportAndType(
  airportId: Airport['id'],
  contractType: ContractType,
): Promise<Contract[]> {
  const res = await api.get(`/api/contracts?airportId=${airportId}&contractType=${contractType}`);
  return res.data;
}

/**
 * Create a contract
 */
export async function createContract(
  airportId: Airport['id'],
  data: CreateContractData,
): Promise<Contract> {
  const res = await api.post(`/api/contracts?airportId=${airportId}`, data);
  return res.data;
}

/**
 * Update a service contract
 */
export async function updateContract(
  id: Contract['id'],
  data: Partial<Contract>,
): Promise<Contract> {
  const res = await api.put(`/api/contracts/${id}`, data);
  return res.data;
}

/**
 * Delete a service contract
 */
export async function deleteContract(id: Contract['id']): Promise<void> {
  await api.delete(`/api/contracts/${id}`);
}
