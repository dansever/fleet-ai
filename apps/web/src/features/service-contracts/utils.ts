import { ContractTypeEnum } from '@/drizzle/schema/enums';
import type { Airport, ServiceContract } from '@/drizzle/types';
import {
  createServiceContract,
  CreateServiceContractData,
} from '@/services/contracts/service-contract-client';

export async function createRandomServiceContract(
  airportId: Airport['id'],
): Promise<ServiceContract> {
  const randomNumber = Math.floor(Math.random() * 1000000);
  const randomType =
    ContractTypeEnum.enumValues[Math.floor(Math.random() * ContractTypeEnum.enumValues.length)];

  const generatedServiceContract: Partial<CreateServiceContractData> = {
    title: `Service Contract ${randomNumber}`,
    contractType: randomType,
    notes: `Notes for Service Contract ${randomNumber}`,
    vendorName: `Vendor ${randomNumber}`,
    vendorAddress: `123 Main St, Anytown, USA`,
    vendorContactPhone: '123-456-7890',
    vendorContactEmail: 'vendor@example.com',
    effectiveFrom: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    effectiveTo: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  };
  const res = await createServiceContract(airportId, generatedServiceContract);
  return res;
}
