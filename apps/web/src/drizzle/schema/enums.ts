import { pgEnum } from 'drizzle-orm/pg-core';

// -------------------- Direction Enums --------------------
export const OrderDirectionEnum = pgEnum('order_direction', [
  'sent', // Order we send out to vendors
  'received', // Order we receive from customers/airlines
]);
export type OrderDirection = (typeof OrderDirectionEnum.enumValues)[number];

// --------------------  Status Enum --------------------
export const statusEnum = pgEnum('status', [
  'draft',
  'pending',
  'in_progress',
  'completed',
  'rejected',
  'closed',
]);
export type Status = (typeof statusEnum.enumValues)[number];

export const statusDisplayMap: Record<Status, string> = {
  draft: 'Draft',
  pending: 'Pending',
  in_progress: 'In Progress',
  completed: 'Completed',
  rejected: 'Rejected',
  closed: 'Closed',
};

export function getStatusDisplay(status: Status | string | null | undefined): string {
  if (!status) return 'Unknown';
  return statusDisplayMap[status as Status] || status.charAt(0).toUpperCase() + status.slice(1);
}

// -------------------- Decision Enum --------------------
export const decisionEnum = pgEnum('decision', [
  'undecided',
  'accepted',
  'rejected',
  'shortlisted',
]);
export type Decision = (typeof decisionEnum.enumValues)[number];

export const decisionDisplayMap: Record<Decision, string> = {
  undecided: 'Undecided',
  accepted: 'Accepted',
  rejected: 'Rejected',
  shortlisted: 'Shortlisted',
};

export function getDecisionDisplay(decision: Decision | string | null | undefined): string {
  if (!decision) return 'Unknown';
  return (
    decisionDisplayMap[decision as Decision] || decision.charAt(0).toUpperCase() + decision.slice(1)
  );
}

// --------------------  Contract Type Enum --------------------
export const ContractTypeEnum = pgEnum('contract_type', [
  'fuel', // Jet A-1, SAF, fueling services.
  'ground_handling', // Ramp, baggage, passenger handling.
  'cargo_handling', // Freight, warehousing, cargo terminals.
  'airport_services', // General airport concessions, terminal operations, lounges.
  'catering', // In-flight meals, crew catering, airport lounges catering.
  'maintenance_mro', // Line maintenance, base checks, component overhaul.
  'aeronautical_services', // Navigation, ATC, slot coordination (if privatized).
  'non_aeronautical_services', // Retail, duty-free, parking, advertising.
  'security', // Airport security screening, perimeter security, cyber.
  'cleaning', // Aircraft cleaning, terminal janitorial, waste management.
  'it_services', // Airport systems, flight information display, baggage tracking.
  'construction', // Runway works, hangars, terminals.
  'leasing', // Gate leases, hangar/office leases, equipment rental.
  'consulting', // Legal, financial, training, advisory.
  'other', // Other types of contracts.
]);
export type ContractType = (typeof ContractTypeEnum.enumValues)[number];

export const contractTypeDisplayMap: Record<ContractType, string> = {
  fuel: 'Fuel',
  ground_handling: 'Ground Handling',
  cargo_handling: 'Cargo Handling',
  airport_services: 'Airport Services',
  catering: 'Catering',
  maintenance_mro: 'Maintenance (MRO)',
  aeronautical_services: 'Aeronautical Services',
  non_aeronautical_services: 'Non-Aeronautical Services',
  security: 'Security',
  cleaning: 'Cleaning',
  it_services: 'IT Services',
  leasing: 'Leasing',
  consulting: 'Consulting',
  construction: 'Construction',
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
