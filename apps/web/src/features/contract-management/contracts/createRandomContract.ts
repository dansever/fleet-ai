// Updated by CursorAI on Sep 2 2025
import { ContractTypeEnum } from '@/drizzle/schema/enums';
import type { Airport, Contract } from '@/drizzle/types';
import { createContract, CreateContractData } from '@/services/contracts/contract-client';

export async function createRandomContract(airportId: Airport['id']): Promise<Contract> {
  const randomNumber = Math.floor(Math.random() * 1000000);
  const randomType =
    ContractTypeEnum.enumValues[Math.floor(Math.random() * ContractTypeEnum.enumValues.length)];

  const generatedContract: CreateContractData = {
    airportId,
    vendorId: null, // Will be handled by backend if needed
    title: `${randomType.replace(/_/g, ' ').toUpperCase()} Contract ${randomNumber}`,
    contractType: randomType,
    internalNotes: `Internal notes for Contract ${randomNumber}`,
    summary: `Summary for ${randomType} contract with Vendor ${randomNumber}`,
    terms: `Standard terms and conditions for ${randomType} services`,
    docUrl: null,
    vendorName: `Vendor ${randomNumber}`,
    vendorAddress: `${Math.floor(Math.random() * 9999) + 1} Business Park, Suite ${Math.floor(Math.random() * 999) + 1}, Anytown, USA`,
    vendorContactName: `Contact Person ${randomNumber}`,
    vendorContactEmail: `contact${randomNumber}@vendor${randomNumber}.com`,
    vendorContactPhone: `+1-${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`,
    vendorComments:
      Math.random() > 0.5
        ? `Additional comments from vendor regarding ${randomType} services`
        : null,
    effectiveFrom: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days ago
    effectiveTo: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 1 year from now
  };

  const res = await createContract(airportId, generatedContract);
  return res;
}
