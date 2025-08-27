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
  'fuel_and_ground_ops',
  'catering_and_onboard_services',
  'technical_and_infrastructure',
  'airport_services',
  'commercial_services',
  'security_and_compliance',
  'other',
]);
export type ContractType = (typeof ContractTypeEnum.enumValues)[number];

export const contractTypeDisplayMap: Record<ContractType, string> = {
  fuel_and_ground_ops: 'Fuel and Ground Ops',
  catering_and_onboard_services: 'Catering and Onboard Services',
  technical_and_infrastructure: 'Technical and Infrastructure',
  airport_services: 'Airport Services',
  commercial_services: 'Commercial Services',
  security_and_compliance: 'Security and Compliance',
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
