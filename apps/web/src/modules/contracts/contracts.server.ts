'use server';
import 'server-only';

import { db } from '@/drizzle';
import { ContractType } from '@/drizzle/enums';
import { contractsTable } from '@/drizzle/schema/schema.contracts';
import { Airport, Contract, NewContract, Organization, UpdateContract } from '@/drizzle/types';
import { and, desc, eq } from 'drizzle-orm';
import {
  deleteDocument,
  listDocumentsByContract,
} from '../file-manager/documents/documents.server';

/**
 * Get a contract by ID
 */
export async function getContractById(id: Contract['id']): Promise<Contract | null> {
  const result = await db.select().from(contractsTable).where(eq(contractsTable.id, id)).limit(1);
  return result[0] ?? null;
}

/**
 * Get all contracts for an organization
 */
export async function listContractsByOrg(orgId: Organization['id']): Promise<Contract[]> {
  const contracts = await db.select().from(contractsTable).where(eq(contractsTable.orgId, orgId));
  return contracts;
}

/**
 * Get contracts by airport
 */
export async function listContractsByAirport(airportId: Airport['id']): Promise<Contract[]> {
  const result = await db
    .select()
    .from(contractsTable)
    .where(eq(contractsTable.airportId, airportId))
    .orderBy(desc(contractsTable.createdAt));
  return result;
}

/**
 * Get contracts by airport and type
 */
export async function listContractsByAirportAndType(
  airportId: Airport['id'],
  contractType: ContractType,
): Promise<Contract[]> {
  const result = await db
    .select()
    .from(contractsTable)
    .where(
      and(eq(contractsTable.airportId, airportId), eq(contractsTable.contractType, contractType)),
    )
    .orderBy(desc(contractsTable.createdAt));
  return result;
}

/**
 * Create a new contract
 */
export async function createContract(data: NewContract): Promise<Contract> {
  const result = await db.insert(contractsTable).values(data).returning();
  return result[0];
}

/**
 * Update a contract
 */
export async function updateContract(id: Contract['id'], data: UpdateContract): Promise<Contract> {
  const result = await db
    .update(contractsTable)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(contractsTable.id, id))
    .returning();
  return result[0];
}

/**
 * Delete a contract and all documents associated with it
 * Note: This will delete all documents associated with the contract (ORM cascade does not work for storage files)
 */
export async function deleteContract(id: Contract['id']): Promise<void> {
  // Step 1: Get all documents for this contract
  const documents = await listDocumentsByContract(id);

  // Step 2: Delete each document (which deletes storage files)
  for (const doc of documents) {
    await deleteDocument(doc.id);
  }

  // Step 3: Delete the contract
  await db.delete(contractsTable).where(eq(contractsTable.id, id));
}
