import type { Airport, Contract, Organization } from '@/drizzle/types';
import { api, backendApi } from '@/services/api-client';
import { ContractCreateInput, ContractUpdateInput } from './contracts.types';

/**
 * Get a contract by ID
 */
export async function getContractById(id: Contract['id']): Promise<Contract> {
  const res = await api.get(`/api/contracts/${id}`);
  return res.data;
}

/**
 * Get all contracts for an organization
 */
export async function listContractsByOrg(orgId?: Organization['id']): Promise<Contract[]> {
  const url = orgId ? `/api/contracts?orgId=${orgId}` : '/api/contracts';
  const res = await api.get(url);
  return res.data;
}

/**
 * Get all contracts for an airport
 */
export async function listContractsByAirport(airportId: Airport['id']): Promise<Contract[]> {
  const res = await api.get(`/api/contracts?airportId=${airportId}`);
  return res.data;
}

/**
 * Create a new contract
 */
export async function createContract(data: ContractCreateInput): Promise<Contract> {
  const payload = {
    ...data,
    // Convert string dates to Date objects
    effectiveFrom: data.effectiveFrom ? new Date(data.effectiveFrom) : undefined,
    effectiveTo: data.effectiveTo ? new Date(data.effectiveTo) : undefined,
  };
  const res = await api.post('/api/contracts', payload);
  return res.data;
}

/**
 * Update an existing contract
 */
export async function updateContract(id: string, data: ContractUpdateInput): Promise<Contract> {
  const payload = {
    ...data,
    // Convert string dates to Date objects if provided
    effectiveFrom: data.effectiveFrom ? new Date(data.effectiveFrom) : undefined,
    effectiveTo: data.effectiveTo ? new Date(data.effectiveTo) : undefined,
  };
  const res = await api.put(`/api/contracts/${id}`, payload);
  return res.data;
}

/**
 * Delete a contract
 */
export async function deleteContract(id: string): Promise<void> {
  await api.delete(`/api/contracts/${id}`);
}

/**
 * Process a contract
 * @param file - The file to process
 * @returns The processed contract
 */
export async function processContract(file: File): Promise<unknown> {
  const formData = new FormData();
  formData.append('file', file);
  const res = await backendApi.post('/api/v1/process/contracts', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
}
