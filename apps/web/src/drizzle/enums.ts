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

// --------------------  Process Status Enum --------------------
export const ProcessStatusEnum = pgEnum('process_status', ['pending', 'in_progress', 'closed']);
export type ProcessStatus = (typeof ProcessStatusEnum.enumValues)[number];
export const processStatusDisplayMap: Record<ProcessStatus, string> = {
  pending: 'Pending',
  in_progress: 'In Progress',
  closed: 'Closed',
};
export function getProcessStatusDisplay(status: ProcessStatus | string | null | undefined): string {
  if (!status) return 'Unknown';
  return (
    processStatusDisplayMap[status as ProcessStatus] ||
    status.charAt(0).toUpperCase() + status.slice(1)
  );
}

// ------------------------- Invoice Status Enum -------------------------
export const InvoiceStatusEnum = pgEnum('invoice_status', [
  'received',
  'approved',
  'paid',
  'disputed',
]);
export type InvoiceStatus = (typeof InvoiceStatusEnum.enumValues)[number];
export const invoiceStatusDisplayMap: Record<InvoiceStatus, string> = {
  received: 'Received',
  approved: 'Approved',
  paid: 'Paid',
  disputed: 'Disputed',
};

export function getInvoiceStatusDisplay(
  invoiceStatus: InvoiceStatus | string | null | undefined,
): string {
  if (!invoiceStatus) return 'Unknown';
  return (
    invoiceStatusDisplayMap[invoiceStatus as InvoiceStatus] ||
    invoiceStatus.charAt(0).toUpperCase() + invoiceStatus.slice(1)
  );
}

// -------------------- Decision Enum --------------------
export const decisionEnum = pgEnum('decision', ['open', 'shortlisted', 'rejected', 'accepted']);
export type Decision = (typeof decisionEnum.enumValues)[number];
export const decisionDisplayMap: Record<Decision, string> = {
  open: 'Open',
  shortlisted: 'Shortlisted',
  rejected: 'Rejected',
  accepted: 'Accepted',
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
  'ground_handling', // ground handling, baggage handling, ramp, GPU, pushback, deicing
  'catering', // catering services, onboard services, waste removal
  'technical_mro', // technical services, MRO, parts, line maintenance, components
  'airport_services', // airport fees, nav charges, parking management
  'security', // security services, compliance, screening, regulated agent
  'it_infrastructure', // IT infrastructure, SITA, data, communications, SaaS
  'cargo_logistics', // cargo operations, logistics, freight forwarding, AOG courier
  'training_crew', // training services, crew training, simulator hours, licensing
  'cleaning_facilities', // cleaning services, facilities maintenance
  'insurance_finance', // insurance, finance, liability, hull insurance, leasing
  'other', // other contract types
]);

export type ContractType = (typeof ContractTypeEnum.enumValues)[number];
export const contractTypeDisplayMap: Record<ContractType, { display: string; color: string }> = {
  fuel: {
    display: 'Fuel Supply',
    color: 'border-0 bg-gradient-to-r from-purple-500/80 to-blue-400 text-white',
  },
  ground_handling: {
    display: 'Ground Handling',
    color: 'border-0 bg-gradient-to-r from-green-500/80 to-teal-400 text-white',
  },
  catering: {
    display: 'Catering Services',
    color: 'border-0 bg-gradient-to-r from-orange-500 to-amber-500 text-white',
  },
  technical_mro: {
    display: 'Technical & MRO',
    color: 'border-0 bg-gradient-to-r from-blue-500/80 to-indigo-400 text-white',
  },
  airport_services: {
    display: 'Airport Services',
    color: 'border-0 bg-gradient-to-r from-slate-500/80 to-gray-400 text-white',
  },
  security: {
    display: 'Security Services',
    color: 'border-0 bg-gradient-to-r from-red-500/80 to-rose-400 text-white',
  },
  it_infrastructure: {
    display: 'IT Infrastructure',
    color: 'border-0 bg-gradient-to-r from-cyan-500/80 to-sky-400 text-white',
  },
  cargo_logistics: {
    display: 'Cargo & Logistics',
    color: 'border-0 bg-gradient-to-r from-yellow-500/80 to-orange-400 text-white',
  },
  training_crew: {
    display: 'Training & Crew',
    color: 'border-0 bg-gradient-to-r from-violet-500/80 to-purple-400 text-white',
  },
  cleaning_facilities: {
    display: 'Cleaning & Facilities',
    color: 'border-0 bg-gradient-to-r from-emerald-500/80 to-green-400 text-white',
  },
  insurance_finance: {
    display: 'Insurance & Finance',
    color: 'border-0 bg-gradient-to-r from-indigo-500/80 to-blue-400 text-white',
  },
  other: { display: 'Other', color: 'bg-gradient-to-r from-gray-500/80 to-slate-400 text-white' },
};

export function getContractTypeDisplayName(
  contractType: ContractType | string | null | undefined,
): string {
  if (!contractType) return 'Unknown';
  const entry = contractTypeDisplayMap[contractType as ContractType];
  return entry?.display;
}

export function getContractTypeColor(
  contractType: ContractType | string | null | undefined,
): string {
  if (!contractType) return 'bg-gray-200';
  const entry = contractTypeDisplayMap[contractType as ContractType];
  return entry?.color;
}

// --------------------  Urgency Level Enum --------------------
export const UrgencyLevelEnum = pgEnum('urgency_level', ['routine', 'urgent', 'aog']);
export type UrgencyLevel = (typeof UrgencyLevelEnum.enumValues)[number];
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

// --------------------  Document Parent Type Enum --------------------
export const DocumentTypeEnum = pgEnum('document_type', [
  'contract',
  'invoice',
  'rfq',
  'quote',
  'fuel_tender',
  'fuel_bid',
  'other',
]);
export type DocumentType = (typeof DocumentTypeEnum.enumValues)[number];
export const documentTypeDisplayMap: Record<DocumentType, string> = {
  contract: 'Contract',
  invoice: 'Invoice',
  rfq: 'RFQ',
  quote: 'Quote',
  fuel_tender: 'Fuel Tender',
  fuel_bid: 'Fuel Bid',
  other: 'Other',
};
export function getDocumentTypeDisplay(
  documentType: DocumentType | string | null | undefined,
): string {
  if (!documentType) return 'Unknown';
  return (
    documentTypeDisplayMap[documentType as DocumentType] ||
    documentType.charAt(0).toUpperCase() + documentType.slice(1)
  );
}
