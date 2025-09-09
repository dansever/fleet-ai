import { Contract, Invoice, NewInvoice } from '@/drizzle/types';
import { CURRENCY_MAP } from '@/lib/constants/currencies';
import { client as invoiceClient } from '@/modules/invoices';

function getRandomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomFloat(min: number, max: number, decimals = 2): number {
  const value = Math.random() * (max - min) + min;
  return parseFloat(value.toFixed(decimals));
}

function pickOne<T>(values: T[]): T {
  return values[Math.floor(Math.random() * values.length)];
}

function randomPhone(): string {
  const area = getRandomInt(200, 999);
  const exchange = getRandomInt(200, 999);
  const number = getRandomInt(1000, 9999);
  return `+1-${area}-${exchange}-${number}`;
}

function randomDateString(daysOffset = 0): string {
  const date = new Date();
  date.setDate(date.getDate() + daysOffset);
  return date.toISOString().split('T')[0];
}

function randomEmail(firstName: string, lastName: string, company: string): string {
  const cleanFirst = firstName.toLowerCase().replace(/\s+/g, '');
  const cleanLast = lastName.toLowerCase().replace(/\s+/g, '');
  const cleanCompany = company.toLowerCase().replace(/[^a-z0-9]/g, '');
  return `${cleanFirst}.${cleanLast}@${cleanCompany}.com`;
}

function randomAddress(): string {
  const streetNum = getRandomInt(100, 9999);
  const streets = [
    'Business Blvd',
    'Commerce St',
    'Industrial Way',
    'Corporate Ave',
    'Enterprise Dr',
    'Service Rd',
  ];
  const suite = getRandomInt(100, 999);
  const cities = [
    'Business City',
    'Commerce Center',
    'Industrial Park',
    'Service Town',
    'Corporate Plaza',
    'Trade Center',
  ];
  return `${streetNum} ${pickOne(streets)}, Suite ${suite}, ${pickOne(cities)}, USA`;
}

const VENDOR_NAMES = [
  'Aviation Services Inc',
  'Ground Support Solutions',
  'Airport Operations Ltd',
  'Flight Services Corp',
  'Maintenance Solutions',
  'Fuel Supply Company',
  'Catering Services LLC',
  'Security Solutions Inc',
  'Cleaning Services Ltd',
  'Equipment Rental Corp',
];

const FIRST_NAMES = [
  'John',
  'Sarah',
  'Mike',
  'Lisa',
  'David',
  'Emily',
  'James',
  'Maria',
  'Robert',
  'Jennifer',
  'Michael',
  'Jessica',
];
const LAST_NAMES = [
  'Smith',
  'Johnson',
  'Davis',
  'Chen',
  'Rodriguez',
  'Wilson',
  'Brown',
  'Taylor',
  'Anderson',
  'Martinez',
  'Garcia',
  'Lee',
];

const INVOICE_SUMMARIES = [
  'Monthly service charges for ground handling operations including aircraft marshalling, baggage handling, and passenger services.',
  'Fuel supply services for the period including into-plane services and quality assurance testing.',
  'Catering services providing in-flight meals, beverages, and special dietary accommodations for passengers.',
  'Ground support equipment rental including GPU units, air conditioning, and baggage carts.',
  'Security services including passenger screening, baggage inspection, and perimeter security.',
  'Maintenance services for aircraft line maintenance, component repairs, and routine inspections.',
  'Cleaning services for aircraft interior and exterior cleaning, waste removal, and sanitization.',
  'Airport facility charges including gate usage, terminal services, and parking fees.',
  'Navigation and landing charges for approach, landing, and departure services.',
  'Cargo handling services including loading, unloading, and warehouse storage.',
];

const VENDOR_COMMENTS = [
  'All services provided according to contracted specifications. No deviations or additional charges.',
  'Premium service level maintained throughout the billing period. Customer satisfaction achieved.',
  'Expedited services provided during peak operational periods. Additional resources deployed.',
  'Standard service delivery with full compliance to safety and quality requirements.',
  'Enhanced service package delivered including value-added services at no extra cost.',
  'Seasonal adjustments applied according to contract terms. Volume discounts included.',
  'Emergency response services provided during irregular operations. Swift resolution achieved.',
];

const DOC_URLS = [
  'https://invoices.example.com/INV-2024-001.pdf',
  'https://documents.vendor.com/billing/invoice_2024.pdf',
  'https://portal.supplier.com/docs/monthly_invoice.pdf',
  'https://billing.services.com/invoices/current_period.pdf',
  null, // Some invoices might not have document URLs
];

export default async function createRandomInvoice(contractId: Contract['id']): Promise<Invoice> {
  const vendorName = pickOne(VENDOR_NAMES);
  const firstName = pickOne(FIRST_NAMES);
  const lastName = pickOne(LAST_NAMES);
  const contactName = `${firstName} ${lastName}`;
  const currencyKey = pickOne(Object.keys(CURRENCY_MAP));
  const totalAmount = getRandomFloat(500, 50000, 2);
  const invoiceNumber = `INV-${getRandomInt(100000, 999999)}`;

  // Random date range for billing period (1-3 months ago to present)
  const periodEndDays = -getRandomInt(0, 30);
  const periodStartDays = periodEndDays - getRandomInt(28, 92); // 1-3 months before end
  const invoiceDateDays = periodEndDays + getRandomInt(1, 15); // Invoice date after period end

  const invoiceData: NewInvoice = {
    // System Fields (will be handled by server)
    orgId: '', // Will be set by server

    // Required linkage
    contractId,
    airportId: null, // May be set by server based on contract
    vendorId: null, // May be set by server based on contract

    // Invoice Information
    invoiceNumber,
    invoiceDate: Math.random() > 0.1 ? randomDateString(invoiceDateDays) : null,

    // Vendor Information
    vendorName: Math.random() > 0.1 ? vendorName : null,
    vendorAddress: Math.random() > 0.3 ? randomAddress() : null,
    vendorContactName: Math.random() > 0.3 ? contactName : null,
    vendorContactEmail: Math.random() > 0.4 ? randomEmail(firstName, lastName, vendorName) : null,
    vendorContactPhone: Math.random() > 0.5 ? randomPhone() : null,
    vendorComments: Math.random() > 0.5 ? pickOne(VENDOR_COMMENTS) : null,

    // Document Management
    summary: Math.random() > 0.2 ? pickOne(INVOICE_SUMMARIES) : null,

    // Timeline
    periodStart: Math.random() > 0.2 ? randomDateString(periodStartDays) : null,
    periodEnd: Math.random() > 0.2 ? randomDateString(periodEndDays) : null,
  };

  const result = await invoiceClient.createInvoice(invoiceData);
  return result;
}
