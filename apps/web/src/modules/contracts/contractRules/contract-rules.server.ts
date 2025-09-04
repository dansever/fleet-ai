'use server';
import 'server-only';

import { db } from '@/drizzle';
import { contractRulesTable } from '@/drizzle/schema';
import { Contract, ContractRule, NewContractRule, UpdateContractRule } from '@/drizzle/types';
import { eq } from 'drizzle-orm';

/**
 * Get a contract rule by ID
 */
export async function getContractRuleById(id: ContractRule['id']): Promise<ContractRule | null> {
  const result = await db
    .select()
    .from(contractRulesTable)
    .where(eq(contractRulesTable.id, id))
    .limit(1);
  return result[0] ?? null;
}

/**
 * Get all contract rules for a contract
 */
export async function listContractRulesByContractId(
  contractId: Contract['id'],
): Promise<ContractRule[]> {
  const contractRules = await db
    .select()
    .from(contractRulesTable)
    .where(eq(contractRulesTable.contractId, contractId));
  return contractRules;
}

/**
 * Create a new contract
 */
export async function createContractRule(data: NewContractRule): Promise<ContractRule> {
  const result = await db.insert(contractRulesTable).values(data).returning();
  return result[0];
}

/**
 * Update a contract
 */
export async function updateContractRule(
  id: ContractRule['id'],
  data: UpdateContractRule,
): Promise<ContractRule> {
  const result = await db
    .update(contractRulesTable)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(contractRulesTable.id, id))
    .returning();
  return result[0];
}

/**
 * Delete a contract rule
 */
export async function deleteContractRule(id: ContractRule['id']): Promise<void> {
  await db.delete(contractRulesTable).where(eq(contractRulesTable.id, id));
}
