// src/modules/contracts/contracts/contracts.types.ts

/**
 * Contract types for form handling and API requests
 */
import { ContractType } from '@/drizzle/enums';
import type { Airport, Contract } from '@/drizzle/types';

/**
 * For creating contracts - Only need title, contractType, airportId
 */
export type ContractCreateInput = {
  title: string;
  contractType: ContractType;
  airportId: Airport['id'];
};

/**
 * For updating contracts - all fields optional.
 * Off limits: id, orgId, createdAt, updatedAt
 */
export type ContractUpdateInput = Partial<
  Omit<Contract, 'id' | 'orgId' | 'createdAt' | 'updatedAt'>
>;
