// Updated by CursorAI on Sep 2 2025
import type { FuelTender } from '@/drizzle/types';
import { CURRENCY_MAP } from '@/lib/constants/currencies';
import { BASE_UOM_OPTIONS } from '@/lib/constants/units';
import { createFuelBid, type CreateFuelBidData } from '@/services/fuel/fuel-bid-client';

function getRandomInt(min: number, max: number): number {
  const ceilMin = Math.ceil(min);
  const floorMax = Math.floor(max);
  return Math.floor(Math.random() * (floorMax - ceilMin + 1)) + ceilMin;
}

function getRandomFloat(min: number, max: number, decimals = 3): number {
  const value = Math.random() * (max - min) + min;
  return parseFloat(value.toFixed(decimals));
}

function pickOne<T>(values: T[]): T {
  return values[Math.floor(Math.random() * values.length)];
}

function randomEmailFromName(name: string): string {
  const handle = name.toLowerCase().replace(/[^a-z]+/g, '.');
  const domain = pickOne(['example.com', 'supplier.co', 'fuelcorp.com']);
  return `${handle}@${domain}`;
}

function randomPhone(): string {
  const part = () => getRandomInt(100, 999);
  const last = getRandomInt(1000, 9999);
  return `+1 (${part()}) ${part()}-${last}`;
}

function randomDateBetween(start?: string | null, end?: string | null): string {
  const now = new Date();
  const startDate = start ? new Date(start) : new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const endDate = end ? new Date(end) : now;
  const startMs = startDate.getTime();
  const endMs = Math.max(startMs + 60 * 60 * 1000, endDate.getTime());
  const ts = getRandomInt(startMs, endMs);
  return new Date(ts).toISOString().split('T')[0]; // Return date string, not full ISO
}

const VENDOR_NAMES = [
  'Global Fuel Services',
  'AeroJet Supply',
  'Skyline Energy',
  'JetA Partners',
  'Aviate Fuels',
  'Runway Resources',
  'Nimbus Petroleum',
  'Stratus Aviation',
];

const CONTACT_FIRST_NAMES = [
  'Alex',
  'Sam',
  'Taylor',
  'Jordan',
  'Morgan',
  'Casey',
  'Riley',
  'Quinn',
];
const CONTACT_LAST_NAMES = ['Reed', 'Bailey', 'Parker', 'Hayes', 'Nguyen', 'Patel', 'Kim', 'Lopez'];

const INDEX_NAMES = ['Platts Jet A-1 Med', 'Argus Jet Fuel', 'OPIS Jet Fuel'];
const INDEX_LOCATIONS = ['USGC', 'USWC', 'NWE', 'Singapore', 'Mediterranean'];

/**
 * Generate a realistic random fuel bid for a given tender.
 * Returns a CreateFuelBidData object suitable for API submission.
 */
export async function createRandomFuelBid(
  tenderId: FuelTender['id'],
  round?: number,
): Promise<CreateFuelBidData> {
  const useIndexPricing = Math.random() < 0.45; // 45% chance of index-linked pricing

  const vendorName = pickOne(VENDOR_NAMES);
  const contactName = `${pickOne(CONTACT_FIRST_NAMES)} ${pickOne(CONTACT_LAST_NAMES)}`;
  const currencyKey = pickOne(Object.keys(CURRENCY_MAP));
  const uom = pickOne(BASE_UOM_OPTIONS.map((option) => option.value));

  // Base unit price assumptions (varies by currency a bit)
  const basePrice = getRandomFloat(1.4, 3.5, 3); // typical USD/USG spot range example

  // Fees
  const intoPlane = Math.random() < 0.7 ? getRandomFloat(0.02, 0.15, 3) : null;
  const handling = Math.random() < 0.35 ? getRandomFloat(0.02, 0.12, 3) : null;
  const otherFee = Math.random() < 0.2 ? getRandomFloat(0.01, 0.08, 3) : null;

  const differential = useIndexPricing ? getRandomFloat(-0.25, 0.25, 3) : null;

  const data: CreateFuelBidData = {
    // Required linkage
    tenderId,
    vendorId: null, // Will be handled by backend if needed

    // Bid Information & Timeline
    title: `${vendorName} R${round || getRandomInt(1, 3)} Offer`,
    round: round || getRandomInt(1, 3),
    bidSubmittedAt: randomDateBetween(),

    // Vendor Information
    vendorName,
    vendorAddress: `${getRandomInt(100, 9999)} Market St, Suite ${getRandomInt(100, 999)}, Anytown`,
    vendorContactName: contactName,
    vendorContactEmail: randomEmailFromName(contactName),
    vendorContactPhone: randomPhone(),
    vendorComments:
      Math.random() < 0.5
        ? 'Pricing inclusive of standard service levels. Volume incentives available.'
        : null,

    // Pricing Structure & Terms
    priceType: useIndexPricing ? 'index_formula' : 'fixed',
    uom,
    currency: currencyKey,
    paymentTerms: pickOne(['Net 15', 'Net 30', 'Net 45', 'Net 60']),

    // Fixed Pricing
    baseUnitPrice: useIndexPricing ? null : basePrice.toString(),

    // Index-Linked Pricing
    indexName: useIndexPricing ? pickOne(INDEX_NAMES) : null,
    indexLocation: useIndexPricing ? pickOne(INDEX_LOCATIONS) : null,
    differential: useIndexPricing ? differential?.toString() : null,
    differentialUnit: useIndexPricing ? `${currencyKey}/${uom}` : null,
    formulaNotes: useIndexPricing ? 'Monthly average with +5 business day lag.' : null,

    // Fees & Charges
    intoPlaneFee: intoPlane?.toString() || null,
    handlingFee: handling?.toString() || null,
    otherFee: otherFee?.toString() || null,
    otherFeeDescription: otherFee ? 'Additional local surcharge' : null,

    // Inclusions & Exclusions
    includesTaxes: Math.random() < 0.3,
    includesAirportFees: Math.random() < 0.25,

    // Calculated Fields
    densityAt15C: Math.random() < 0.2 ? getRandomFloat(780, 820, 1).toString() : null, // kg/m3
    normalizedUnitPriceUsdPerUsg: null, // calculated server-side

    // AI Processing
    aiSummary:
      'Competitive offer with moderate fees; consider for shortlist pending volume commitments.',

    // Decision Tracking (left empty; handled later)
    decision: null,
    decisionNotes: null,
  };

  const result = await createFuelBid(tenderId, data);
  return result;
}

export default createRandomFuelBid;
