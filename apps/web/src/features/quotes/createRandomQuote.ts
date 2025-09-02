// Updated by CursorAI on Sep 2 2025
import { Quote, Rfq } from '@/drizzle/types';
import { CURRENCY_MAP } from '@/lib/constants/currencies';
import { createQuote, CreateQuoteData } from '@/services/technical/quote-client';

function getRandomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
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

const VENDOR_NAMES = [
  'AeroTech Solutions',
  'Bell Aviation Parts',
  'GetCargo Logistics',
  'Delta Components',
  'Eagle Aerospace',
];
const CONTACT_NAMES = ['John Smith', 'Sarah Johnson', 'Mike Davis', 'Lisa Chen', 'David Rodriguez'];
const PART_CONDITIONS = ['new', 'serviceable', 'overhauled', 'repaired'];
const PRICING_TYPES = ['fixed', 'exchange', 'repair', 'outright'];
const PRICING_METHODS = ['unit', 'lot', 'bulk'];
const CERTIFICATIONS = ['FAA 8130-3', 'EASA Form 1', 'Transport Canada', 'CAAC'];
const TAG_TYPES = ['Yellow', 'Green', 'Red'];

export async function createRandomQuote(rfqId: Rfq['id']): Promise<Quote> {
  const randomNumber = Math.floor(Math.random() * 1000000);
  const vendorName = pickOne(VENDOR_NAMES);
  const contactName = pickOne(CONTACT_NAMES);
  const randomCurrencyKey = pickOne(Object.keys(CURRENCY_MAP));
  const quantity = getRandomInt(1, 10);
  const unitPrice = getRandomInt(100, 10000);
  const totalPrice = (unitPrice * quantity).toString();

  const generatedQuote: CreateQuoteData = {
    // Required linkage (matching schema)
    rfqId,

    // Quote Identification (matching schema)
    rfqNumber: `RFQ-${getRandomInt(100000, 999999)}`,
    direction: pickOne(['sent', 'received']),

    // Vendor Information (matching schema)
    vendorName,
    vendorAddress: `${getRandomInt(100, 9999)} Industrial Blvd, Suite ${getRandomInt(100, 999)}, Aviation City, USA`,
    vendorContactName: contactName,
    vendorContactEmail: `${contactName.toLowerCase().replace(' ', '.')}@${vendorName.toLowerCase().replace(/\s+/g, '')}.com`,
    vendorContactPhone: randomPhone(),

    // Part Details (matching schema)
    partNumber: `PART-${randomNumber}`,
    serialNumber: Math.random() > 0.5 ? `SN${getRandomInt(100000, 999999)}` : null,
    partDescription: `${pickOne(['Engine', 'Avionics', 'Landing Gear', 'Hydraulic'])} Component - Part ${randomNumber}`,
    partCondition: pickOne(PART_CONDITIONS), // Note: schema uses 'partCondition', not 'conditionCode'
    unitOfMeasure: 'EA',
    quantity,

    // Pricing Information (matching schema)
    price: totalPrice,
    currency: randomCurrencyKey,
    pricingType: pickOne(PRICING_TYPES),
    pricingMethod: pickOne(PRICING_METHODS),
    coreDue: Math.random() > 0.7 ? `${getRandomInt(500, 2000)}` : null,
    coreChange: Math.random() > 0.8 ? `${getRandomInt(100, 500)}` : null,
    paymentTerms: pickOne(['Net 15', 'Net 30', 'Net 45', 'Net 60', 'COD']),
    minimumOrderQuantity: Math.random() > 0.6 ? getRandomInt(1, 5) : null,

    // Delivery & Terms (matching schema)
    leadTime: `${getRandomInt(1, 30)} ${pickOne(['days', 'weeks'])}`,
    deliveryTerms: pickOne(['FOB Origin', 'FOB Destination', 'CIF', 'EXW']),
    warranty: `${getRandomInt(90, 365)} days`,
    quoteExpirationDate: randomDateString(getRandomInt(30, 90)),

    // Compliance & Traceability (matching schema)
    certifications: Math.random() > 0.3 ? [pickOne(CERTIFICATIONS)] : [],
    traceTo: pickOne(['OEM', 'Airline', 'MRO', 'Distributor']),
    tagType: pickOne(TAG_TYPES),
    taggedBy: `Inspector ${getRandomInt(1, 100)}`,
    taggedDate: randomDateString(-getRandomInt(1, 30)),

    // Additional Information (matching schema)
    vendorComments:
      Math.random() > 0.5
        ? `High quality ${pickOne(PART_CONDITIONS)} part with full documentation. Fast shipping available.`
        : null,

    // Workflow Management (matching schema)
    status: 'pending',

    // Timestamps (matching schema)
    sentAt: new Date().toISOString(),
  };

  const res = await createQuote(generatedQuote);
  return res;
}
