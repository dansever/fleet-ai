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
