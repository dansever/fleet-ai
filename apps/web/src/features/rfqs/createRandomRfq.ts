// Updated by CursorAI on Sep 2 2025
import type { Rfq } from '@/drizzle/types';
import { createRfq, CreateRfqData } from '@/services/technical/rfq-client';

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

const VENDOR_NAMES = [
  'AeroTech Solutions',
  'Bell Aviation Parts',
  'GetCargo Logistics',
  'Delta Components',
  'Eagle Aerospace',
];
const CONTACT_NAMES = ['John Smith', 'Sarah Johnson', 'Mike Davis', 'Lisa Chen', 'David Rodriguez'];
const URGENCY_LEVELS = ['routine', 'urgent', 'aog']; // matching schema enum values
const PRICING_TYPES = ['fixed', 'exchange', 'repair', 'outright'];
const CONDITION_CODES = ['new', 'serviceable', 'overhauled', 'repaired', 'as_removed'];
const AIRCRAFT_TYPES = ['Boeing 737', 'Airbus A320', 'Boeing 777', 'Airbus A330', 'Embraer E175'];

export async function createRandomRfq(): Promise<Rfq> {
  const randomNumber = Math.floor(Math.random() * 1000000);
  const vendorName = pickOne(VENDOR_NAMES);
  const contactName = pickOne(CONTACT_NAMES);
  const quantity = getRandomInt(1, 5);

  const generatedRfq: CreateRfqData = {
    // RFQ Identification (matching schema)
    direction: pickOne(['sent', 'received']),
    rfqNumber: `RFQ-${getRandomInt(100000, 999999)}`,

    // Vendor Information (matching schema)
    vendorName,
    vendorAddress: `${getRandomInt(100, 9999)} Aviation Blvd, Suite ${getRandomInt(100, 999)}, Aerospace City, USA`,
    vendorContactName: contactName,
    vendorContactEmail: `${contactName.toLowerCase().replace(' ', '.')}@${vendorName.toLowerCase().replace(/\s+/g, '')}.com`,
    vendorContactPhone: randomPhone(),

    // Part Specifications (matching schema)
    partNumber: `PART-${randomNumber}`,
    altPartNumber: Math.random() > 0.6 ? `ALT-${randomNumber}` : null,
    partDescription: `${pickOne(['Engine', 'Avionics', 'Landing Gear', 'Hydraulic', 'Electrical'])} Component for ${pickOne(AIRCRAFT_TYPES)}`,
    conditionCode: pickOne(CONDITION_CODES),
    unitOfMeasure: 'EA',
    quantity,

    // Commercial Terms (matching schema)
    pricingType: pickOne(PRICING_TYPES),
    urgencyLevel: pickOne(URGENCY_LEVELS),
    deliverTo: `Hangar ${getRandomInt(1, 20)}, Gate ${getRandomInt(1, 50)}`,
    buyerComments:
      Math.random() > 0.5
        ? `Urgent requirement for ${pickOne(AIRCRAFT_TYPES)}. Please expedite quote.`
        : null,

    // Workflow Management (matching schema)
    status: 'pending',
    selectedQuoteId: null,

    // Timestamps (matching schema)
    sentAt: new Date().toISOString(),
  };

  const res = await createRfq(generatedRfq);
  return res;
}
