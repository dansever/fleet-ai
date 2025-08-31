import type { FuelTender } from '@/drizzle/types';
import type { CreateFuelBidData } from '@/services/fuel/fuel-bid-client';

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

function randomDateIsoBetween(start?: string | null, end?: string | null): string {
  const now = new Date();
  const startDate = start ? new Date(start) : new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const endDate = end ? new Date(end) : now;
  const startMs = startDate.getTime();
  const endMs = Math.max(startMs + 60 * 60 * 1000, endDate.getTime());
  const ts = getRandomInt(startMs, endMs);
  return new Date(ts).toISOString();
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
export function createRandomFuelBid(tender: FuelTender, round?: number): CreateFuelBidData {
  const useIndexPricing = Math.random() < 0.45; // 45% chance of index-linked pricing

  const vendorName = pickOne(VENDOR_NAMES);
  const contactName = `${pickOne(CONTACT_FIRST_NAMES)} ${pickOne(CONTACT_LAST_NAMES)}`;
  const currency = tender.baseCurrency || 'USD';
  const uom = tender.baseUom || 'USG';

  // Base unit price assumptions (varies by currency a bit)
  const basePrice = getRandomFloat(1.4, 3.5, 3); // typical USD/USG spot range example

  // Fees
  const intoPlane = Math.random() < 0.7 ? getRandomFloat(0.02, 0.15, 3) : 0;
  const handling = Math.random() < 0.35 ? getRandomFloat(0.02, 0.12, 3) : 0;
  const otherFee = Math.random() < 0.2 ? getRandomFloat(0.01, 0.08, 3) : 0;

  const differential = useIndexPricing ? getRandomFloat(-0.25, 0.25, 3) : 0;

  const data: CreateFuelBidData = {
    // Required linkage
    tenderId: tender.id,

    // Submission info
    title: `${vendorName} R${round || getRandomInt(1, 3)} Offer`,
    round: round || getRandomInt(1, 3),
    bidSubmittedAt: randomDateIsoBetween(tender.biddingStarts as any, tender.biddingEnds as any),

    // Vendor
    vendorName,
    vendorAddress: `${getRandomInt(100, 9999)} Market St, Suite ${getRandomInt(100, 999)}, Anytown`,
    vendorContactName: contactName,
    vendorContactEmail: randomEmailFromName(contactName),
    vendorContactPhone: randomPhone(),
    vendorComments:
      Math.random() < 0.5
        ? 'Pricing inclusive of standard service levels. Volume incentives available.'
        : null,

    // Pricing structure
    priceType: useIndexPricing ? 'index_formula' : 'fixed',
    uom,
    currency,
    paymentTerms: pickOne(['Net 15', 'Net 30', 'Net 45', 'Net 60']),

    // Fixed pricing
    baseUnitPrice: useIndexPricing ? null : basePrice.toString(),

    // Index-linked pricing
    indexName: useIndexPricing ? pickOne(INDEX_NAMES) : null,
    indexLocation: useIndexPricing ? pickOne(INDEX_LOCATIONS) : null,
    differential: useIndexPricing ? differential.toString() : null,
    differentialUnit: useIndexPricing ? `${currency}/${uom}` : null,
    formulaNotes: useIndexPricing ? 'Monthly average with +5 business day lag.' : null,

    // Fees & charges
    intoPlaneFee: intoPlane ? intoPlane.toString() : null,
    handlingFee: handling ? handling.toString() : null,
    otherFee: otherFee ? otherFee.toString() : null,
    otherFeeDescription: otherFee ? 'Additional local surcharge' : null,

    // Inclusions & exclusions
    includesTaxes: Math.random() < 0.3,
    includesAirportFees: Math.random() < 0.25,

    // Technical
    densityAt15C: Math.random() < 0.2 ? getRandomFloat(780, 820, 1).toString() : null, // kg/m3
    normalizedUnitPriceUsdPerUsg: null, // calculated server-side

    // AI
    aiSummary:
      'Competitive offer with moderate fees; consider for shortlist pending volume commitments.',

    // Decision tracking (left empty; handled later)
    decision: null,
    decisionNotes: null,
  };

  return data;
}

export default createRandomFuelBid;
