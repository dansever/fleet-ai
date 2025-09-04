import type { Contract, ContractRule } from '@/drizzle/types';
import { api } from '@/services/api-client';
import { ContractRuleCreateInput, ContractRuleUpdateInput } from './contract-rules.types';

/**
 * Get a contract rule by ID
 */
export async function getContractRuleById(id: ContractRule['id']): Promise<ContractRule> {
  const res = await api.get(`/api/contract-rules/${id}`);
  return res.data;
}

/**
 * Get all contract rules for a contract
 */
export async function listContractRulesByContractId(
  contractId?: Contract['id'],
): Promise<ContractRule[]> {
  const url = contractId ? `/api/contract-rules?contractId=${contractId}` : '/api/contract-rules';
  const res = await api.get(url);
  return res.data;
}

/**
 * Create a new contract rule
 */
export async function createContractRule(data: ContractRuleCreateInput): Promise<ContractRule> {
  const payload: ContractRuleCreateInput = {
    ...data,
  };
  const res = await api.post('/api/contract-rules', payload);
  return res.data;
}

/**
 * Update an existing contract
 */
export async function updateContractRule(
  id: ContractRule['id'],
  data: ContractRuleUpdateInput,
): Promise<ContractRule> {
  const payload = {
    ...data,
    // Convert string dates to Date objects if provided
    activeFrom: data.activeFrom ? new Date(data.activeFrom) : undefined,
    activeTo: data.activeTo ? new Date(data.activeTo) : undefined,
  };
  const res = await api.put(`/api/contract-rules/${id}`, payload);
  return res.data;
}

/**
 * Delete a contract rule
 */
export async function deleteContractRule(id: ContractRule['id']): Promise<void> {
  await api.delete(`/api/contract-rules/${id}`);
}
