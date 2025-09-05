import { pgEnum } from 'drizzle-orm/pg-core';

// -------------------- Direction Enums --------------------
export const OrderDirectionEnum = pgEnum('order_direction', [
  'sent', // Order we send out to vendors
  'received', // Order we receive from customers/airlines
]);
export type OrderDirection = (typeof OrderDirectionEnum.enumValues)[number];
export const orderDirectionDisplayMap: Record<OrderDirection, string> = {
  sent: 'Sent',
  received: 'Received',
};
export function getOrderDirectionDisplay(
  orderDirection: OrderDirection | string | null | undefined,
): string {
  if (!orderDirection) return 'Unknown';
  return (
    orderDirectionDisplayMap[orderDirection as OrderDirection] ||
    orderDirection.charAt(0).toUpperCase() + orderDirection.slice(1)
  );
}

// --------------------  Status Enum --------------------
export const statusEnum = pgEnum('status', ['pending', 'in_progress', 'closed']);
export type Status = (typeof statusEnum.enumValues)[number];
export const statusDisplayMap: Record<Status, string> = {
  pending: 'Pending',
  in_progress: 'In Progress',
  closed: 'Closed',
};
export function getStatusDisplay(status: Status | string | null | undefined): string {
  if (!status) return 'Unknown';
  return statusDisplayMap[status as Status] || status.charAt(0).toUpperCase() + status.slice(1);
}

// -------------------- Decision Enum --------------------
export const decisionEnum = pgEnum('decision', [
  'open',
  'shortlisted',
  'rejected',
  'accepted',
  'disputed',
]);
export type Decision = (typeof decisionEnum.enumValues)[number];
export const decisionDisplayMap: Record<Decision, string> = {
  open: 'Open',
  shortlisted: 'Shortlisted',
  rejected: 'Rejected',
  accepted: 'Accepted',
  disputed: 'Disputed',
};
export function getDecisionDisplay(decision: Decision | string | null | undefined): string {
  if (!decision) return 'Unknown';
  return (
    decisionDisplayMap[decision as Decision] || decision.charAt(0).toUpperCase() + decision.slice(1)
  );
}

// --------------------  Contract Type Enum --------------------
export const ContractTypeEnum = pgEnum('contract_type', [
  'fuel', // fuel supply, into-plane, SAF
  'ground_handling', // ramp, GPU, pushback, cleaning, deicing ops
  'catering', // catering, onboard services, waste removal
  'technical_mro_parts', // line maintenance, components, tooling
  'airport_and_nav_charges', // airport fees, ANSP route/overflight charges
  'security_compliance', // screening, regulated agent, audits
  'it_data_comms', // SITA, nav data, SaaS, connectivity
  'logistics_freight', // AOG courier, freight forwarding, customs broker
  'training_and_crew', // simulator hours, crew training, licensing
  'insurance_and_finance', // liability, hull insurance, leasing fees
  'other',
]);

export type ContractType = (typeof ContractTypeEnum.enumValues)[number];
export const contractTypeDisplayMap: Record<ContractType, string> = {
  fuel: 'Fuel',
  ground_handling: 'Ground Handling',
  catering: 'Catering',
  technical_mro_parts: 'Technical MRO Parts',
  airport_and_nav_charges: 'Airport & Nav Charges',
  security_compliance: 'Security and Compliance',
  it_data_comms: 'IT Data Comms',
  logistics_freight: 'Logistics Freight',
  training_and_crew: 'Training and Crew',
  insurance_and_finance: 'Insurance & Finance',
  other: 'Other',
};

export function getContractTypeDisplay(
  contractType: ContractType | string | null | undefined,
): string {
  if (!contractType) return 'Unknown';
  return (
    contractTypeDisplayMap[contractType as ContractType] ||
    contractType.charAt(0).toUpperCase() + contractType.slice(1)
  );
}

// --------------------  Urgency Level Enum --------------------
export const urgencyLevelEnum = pgEnum('urgency_level', ['routine', 'urgent', 'aog']);
export type UrgencyLevel = (typeof urgencyLevelEnum.enumValues)[number];
export const urgencyLevelDisplayMap: Record<UrgencyLevel, string> = {
  routine: 'Routine',
  urgent: 'Urgent',
  aog: 'AOG',
};
export function getUrgencyLevelDisplay(
  urgencyLevel: UrgencyLevel | string | null | undefined,
): string {
  if (!urgencyLevel) return 'Unknown';
  return (
    urgencyLevelDisplayMap[urgencyLevel as UrgencyLevel] ||
    urgencyLevel.charAt(0).toUpperCase() + urgencyLevel.slice(1)
  );
}
