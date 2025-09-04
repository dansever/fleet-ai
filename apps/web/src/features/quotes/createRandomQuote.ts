// Updated by CursorAI on Sep 2 2025
import { OrderDirection, statusEnum } from '@/drizzle/enums';
import { Quote, Rfq } from '@/drizzle/types';
import { CURRENCY_MAP } from '@/lib/constants/currencies';
import { client as quoteClient } from '@/modules/quotes';
import { QuoteCreateInput } from '@/modules/quotes/quotes.types';

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
    'Industrial Blvd',
    'Aviation Way',
    'Airport Rd',
    'Commerce St',
    'Business Park Dr',
  ];
  const suite = getRandomInt(100, 999);
  const cities = [
    'Aviation City',
    'Aerospace Town',
    'Industrial Park',
    'Commerce Center',
    'Tech Valley',
  ];
  return `${streetNum} ${pickOne(streets)}, Suite ${suite}, ${pickOne(cities)}, USA`;
}

const VENDOR_NAMES = [
  'AeroTech Solutions',
  'Bell Aviation Parts',
  'GetCargo Logistics',
  'Delta Components',
  'Eagle Aerospace',
  'Skyline Components',
  'Aviation Supply Co',
  'Precision Parts Ltd',
  'Aerospace Solutions Inc',
  'Global Aviation Parts',
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
];
const PART_CONDITIONS = ['new', 'serviceable', 'overhauled', 'repaired', 'as_removed'];
const CONDITION_CODES = ['NE', 'SV', 'OH', 'RP', 'AR'];
const PRICING_TYPES = ['fixed', 'exchange', 'repair', 'outright'];
const PRICING_METHODS = ['unit', 'lot', 'bulk', 'tiered'];
const CERTIFICATIONS = ['FAA 8130-3', 'EASA Form 1', 'Transport Canada', 'CAAC', 'ANAC', 'DGCA'];
const TAG_TYPES = ['Yellow', 'Green', 'Red', 'Blue', 'White'];
const AIRCRAFT_TYPES = [
  'Boeing 737',
  'Airbus A320',
  'Boeing 777',
  'Airbus A330',
  'Embraer E175',
  'Boeing 787',
  'Airbus A350',
];
const PART_CATEGORIES = [
  'Engine',
  'Avionics',
  'Landing Gear',
  'Hydraulic',
  'Electrical',
  'Pneumatic',
  'Flight Controls',
  'APU',
];
const UNIT_OF_MEASURES = ['EA', 'LB', 'KG', 'FT', 'M', 'GAL', 'L', 'SET', 'PAIR'];
const DELIVERY_TERMS = ['FOB Origin', 'FOB Destination', 'CIF', 'EXW', 'DDP', 'DAP'];
const PAYMENT_TERMS = ['Net 15', 'Net 30', 'Net 45', 'Net 60', 'COD', 'Due on Receipt', 'Net 90'];
const TRACE_TO_OPTIONS = ['OEM', 'Airline', 'MRO', 'Distributor', 'Repair Station', 'Lessor'];
const INSPECTOR_NAMES = [
  'Inspector A',
  'Inspector B',
  'Quality Control',
  'Tech Lead',
  'QA Manager',
];

export async function createRandomQuote(rfqId: Rfq['id']): Promise<Quote> {
  const randomNumber = Math.floor(Math.random() * 1000000);
  const vendorName = pickOne(VENDOR_NAMES);
  const firstName = pickOne(FIRST_NAMES);
  const lastName = pickOne(LAST_NAMES);
  const contactName = `${firstName} ${lastName}`;
  const randomCurrencyKey = pickOne(Object.keys(CURRENCY_MAP));
  const quantity = getRandomInt(1, 10);
  const unitPrice = getRandomFloat(50, 50000, 2);
  const totalPrice = (unitPrice * quantity).toFixed(2);
  const partCategory = pickOne(PART_CATEGORIES);
  const aircraftType = pickOne(AIRCRAFT_TYPES);

  const generatedQuote: QuoteCreateInput = {
    // Required linkage (matching schema)
    rfqId,

    // Quote Identification (matching schema)
    rfqNumber: `RFQ-${getRandomInt(100000, 999999)}`,
    direction: pickOne(['sent', 'received'] as OrderDirection[]),

    // Vendor Information (matching schema)
    vendorName,
    vendorAddress: randomAddress(),
    vendorContactName: contactName,
    vendorContactEmail: randomEmail(firstName, lastName, vendorName),
    vendorContactPhone: randomPhone(),

    // Part Details (matching schema)
    partNumber: `${partCategory.substring(0, 3).toUpperCase()}-${randomNumber}`,
    serialNumber: Math.random() > 0.4 ? `SN${getRandomInt(100000, 999999)}` : null,
    partDescription: `${partCategory} Component for ${aircraftType} - P/N ${randomNumber}`,
    partCondition: pickOne(CONDITION_CODES), // Using condition codes instead of full names
    unitOfMeasure: pickOne(UNIT_OF_MEASURES),
    quantity,

    // Pricing Information (matching schema)
    price: totalPrice,
    currency: randomCurrencyKey,
    pricingType: pickOne(PRICING_TYPES),
    pricingMethod: pickOne(PRICING_METHODS),
    coreDue: Math.random() > 0.6 ? getRandomFloat(500, 5000, 2).toString() : null,
    coreChange: Math.random() > 0.7 ? getRandomFloat(100, 1000, 2).toString() : null,
    paymentTerms: pickOne(PAYMENT_TERMS),
    minimumOrderQuantity: Math.random() > 0.5 ? getRandomInt(1, 5) : null,

    // Delivery & Terms (matching schema)
    leadTime: `${getRandomInt(1, 45)} ${pickOne(['days', 'weeks', 'business days'])}`,
    deliveryTerms: pickOne(DELIVERY_TERMS),
    warranty: Math.random() > 0.2 ? `${getRandomInt(30, 730)} days` : null,
    quoteExpirationDate: randomDateString(getRandomInt(15, 120)),

    // Compliance & Traceability (matching schema)
    certifications:
      Math.random() > 0.2
        ? [pickOne(CERTIFICATIONS), ...(Math.random() > 0.7 ? [pickOne(CERTIFICATIONS)] : [])]
        : [],
    traceTo: Math.random() > 0.1 ? pickOne(TRACE_TO_OPTIONS) : null,
    tagType: Math.random() > 0.2 ? pickOne(TAG_TYPES) : null,
    taggedBy: Math.random() > 0.3 ? pickOne(INSPECTOR_NAMES) : null,
    taggedDate: Math.random() > 0.3 ? randomDateString(-getRandomInt(1, 60)) : null,

    // Additional Information (matching schema)
    vendorComments:
      Math.random() > 0.4
        ? pickOne([
            `High quality ${pickOne(PART_CONDITIONS)} part with full documentation and traceability.`,
            `Expedited shipping available. Part ready for immediate delivery.`,
            `OEM certified component with manufacturer warranty included.`,
            `Competitive pricing with volume discounts available for larger orders.`,
            `Part tested and certified to meet all regulatory requirements.`,
          ])
        : null,

    // Workflow Management (matching schema)
    status: pickOne(statusEnum.enumValues),

    // Timestamps (matching schema)
    sentAt:
      Math.random() > 0.2
        ? new Date(Date.now() - getRandomInt(0, 30) * 24 * 60 * 60 * 1000).toISOString()
        : null,
  };

  const res = await quoteClient.createQuote(generatedQuote, rfqId);
  return res;
}
