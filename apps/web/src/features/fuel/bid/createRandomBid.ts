// Updated by CursorAI on Sep 2 2025
import { decisionEnum } from '@/drizzle/enums';
import type { FuelBid, FuelTender } from '@/drizzle/types';
import { CURRENCY_MAP } from '@/lib/constants/currencies';
import { BASE_UOM_OPTIONS } from '@/lib/constants/units';
import { client as fuelBidClient } from '@/modules/fuel-mgmt/bids';
import { FuelBidCreateInput } from '@/modules/fuel-mgmt/bids/bids.types';

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
  'Premier Fuel Corp',
  'Aviation Energy Solutions',
  'Jet Fuel International',
  'Apex Aviation Fuels',
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
  'Jamie',
  'Blake',
  'Cameron',
  'Devon',
  'Emery',
  'Finley',
  'Harper',
  'Sage',
];
const CONTACT_LAST_NAMES = [
  'Reed',
  'Bailey',
  'Parker',
  'Hayes',
  'Nguyen',
  'Patel',
  'Kim',
  'Lopez',
  'Thompson',
  'Clark',
  'Lewis',
  'Walker',
  'Hall',
  'Allen',
  'Young',
  'King',
];

const INDEX_NAMES = [
  'Platts Jet A-1 Med',
  'Argus Jet Fuel',
  'OPIS Jet Fuel',
  'Reuters Jet Fuel',
  'ICIS Jet Fuel',
  'S&P Global Platts',
  'Fastmarkets',
  'Energy Intelligence',
];
const INDEX_LOCATIONS = [
  'USGC',
  'USWC',
  'NWE',
  'Singapore',
  'Mediterranean',
  'Asia Pacific',
  'Middle East',
  'Caribbean',
  'Rotterdam',
  'New York Harbor',
];

const PRICE_TYPES = ['fixed', 'index_formula'];
const PAYMENT_TERMS_OPTIONS = [
  'Net 15',
  'Net 30',
  'Net 45',
  'Net 60',
  'Net 90',
  'Due on Receipt',
  'COD',
  '2/10 Net 30',
  'End of Month',
  'Letter of Credit',
];

const VENDOR_COMMENTS_OPTIONS = [
  'Pricing inclusive of standard service levels. Volume incentives available.',
  'Competitive rates with flexible payment terms. Quality assurance guaranteed.',
  'Premium fuel supply with 24/7 support. Bulk discounts applicable.',
  'Reliable delivery schedule with contingency planning included.',
  'Certified quality fuel with comprehensive documentation provided.',
  'Industry-leading service with environmental compliance assured.',
  'Expedited delivery available. Multi-year contract discounts offered.',
];

const AI_SUMMARY_OPTIONS = [
  'Competitive offer with moderate fees; consider for shortlist pending volume commitments.',
  'Strong pricing with excellent service record. Recommended for further evaluation.',
  'Premium pricing justified by superior service levels and reliability.',
  'Cost-effective solution with standard terms. Good backup option.',
  'Innovative pricing structure with potential for long-term partnership.',
  'Market-leading offer with comprehensive service package included.',
  'Balanced proposal with competitive rates and flexible terms.',
];

const DECISION_NOTES_OPTIONS = [
  'Excellent pricing and service record. Proceeding with contract negotiations.',
  'Good offer but pricing slightly above budget. Requesting revised proposal.',
  'Service levels do not meet our requirements. Declining this proposal.',
  'Strong contender for shortlist. Awaiting final evaluation round.',
  'Competitive pricing but concerns about delivery reliability.',
  'Outstanding proposal with innovative terms. Highly recommended.',
  'Standard offer meeting basic requirements. Backup option if needed.',
];

const OTHER_FEE_DESCRIPTIONS = [
  'Additional local surcharge',
  'Environmental compliance fee',
  'Quality assurance charge',
  'Emergency response fee',
  'Documentation processing',
  'Regulatory compliance cost',
  'Special handling charge',
  'Insurance premium adjustment',
];

const DIFFERENTIAL_UNITS_OPTIONS = ['USD/USG', 'USD/L', 'EUR/L', 'GBP/L', 'cents/USG', 'cents/L'];

const FORMULA_NOTES_OPTIONS = [
  'Monthly average with +5 business day lag.',
  'Weekly assessment with 3-day pricing window.',
  'Daily index with T+2 settlement terms.',
  'Bi-weekly pricing with volume adjustments.',
  'Real-time pricing with hourly updates available.',
  'Quarterly review with market adjustment clauses.',
  'Fixed differential with monthly true-up mechanism.',
];

/**
 * Generate a realistic random fuel bid for a given tender.
 * Returns a CreateFuelBidData object suitable for API submission.
 */
export async function createRandomFuelBid(
  tenderId: FuelTender['id'],
  round?: number,
): Promise<FuelBid> {
  const useIndexPricing = Math.random() < 0.5; // 50% chance of index-linked pricing

  const vendorName = pickOne(VENDOR_NAMES);
  const contactName = `${pickOne(CONTACT_FIRST_NAMES)} ${pickOne(CONTACT_LAST_NAMES)}`;
  const currencyKey = pickOne(Object.keys(CURRENCY_MAP));
  const uom = pickOne(BASE_UOM_OPTIONS.map((option) => option.value));

  // Base unit price assumptions (varies by currency and market conditions)
  const basePrice = getRandomFloat(1.2, 4.2, 4); // expanded range for more variety

  // Fees with more realistic ranges
  const intoPlane = Math.random() < 0.75 ? getRandomFloat(0.015, 0.18, 4) : null;
  const handling = Math.random() < 0.4 ? getRandomFloat(0.01, 0.15, 4) : null;
  const otherFee = Math.random() < 0.25 ? getRandomFloat(0.005, 0.1, 4) : null;

  const differential = useIndexPricing ? getRandomFloat(-0.35, 0.35, 4) : null;

  const data: FuelBidCreateInput = {
    // Required linkage
    tenderId,
    vendorId: null, // Will be handled by backend if needed

    // Bid Information & Timeline
    title:
      Math.random() > 0.1
        ? `${vendorName} R${round || getRandomInt(1, 4)} ${pickOne(['Offer', 'Proposal', 'Bid', 'Quote'])}`
        : null,
    round: Math.random() > 0.1 ? round || getRandomInt(1, 4) : null,
    bidSubmittedAt: Math.random() > 0.2 ? randomDateBetween() : null,

    // Vendor Information
    vendorName: Math.random() > 0.05 ? vendorName : null,
    vendorAddress:
      Math.random() > 0.2
        ? `${getRandomInt(100, 9999)} ${pickOne(['Market St', 'Business Blvd', 'Industrial Way', 'Commerce Ave', 'Energy Plaza'])}, Suite ${getRandomInt(100, 999)}, ${pickOne(['Fuel City', 'Energy Town', 'Petroleum Center', 'Aviation Hub'])}`
        : null,
    vendorContactName: Math.random() > 0.2 ? contactName : null,
    vendorContactEmail: Math.random() > 0.3 ? randomEmailFromName(contactName) : null,
    vendorContactPhone: Math.random() > 0.4 ? randomPhone() : null,
    vendorComments: Math.random() > 0.4 ? pickOne(VENDOR_COMMENTS_OPTIONS) : null,

    // Pricing Structure & Terms
    priceType: Math.random() > 0.1 ? (useIndexPricing ? 'index_formula' : 'fixed') : null,
    uom: Math.random() > 0.05 ? uom : null,
    currency: Math.random() > 0.05 ? currencyKey : null,
    paymentTerms: Math.random() > 0.3 ? pickOne(PAYMENT_TERMS_OPTIONS) : null,

    // Fixed Pricing
    baseUnitPrice: useIndexPricing ? null : Math.random() > 0.1 ? basePrice.toString() : null,

    // Index-Linked Pricing
    indexName: useIndexPricing ? (Math.random() > 0.1 ? pickOne(INDEX_NAMES) : null) : null,
    indexLocation: useIndexPricing ? (Math.random() > 0.2 ? pickOne(INDEX_LOCATIONS) : null) : null,
    differential: useIndexPricing ? (Math.random() > 0.2 ? differential?.toString() : null) : null,
    differentialUnit: useIndexPricing
      ? Math.random() > 0.3
        ? pickOne(DIFFERENTIAL_UNITS_OPTIONS)
        : null
      : null,
    formulaNotes: useIndexPricing
      ? Math.random() > 0.4
        ? pickOne(FORMULA_NOTES_OPTIONS)
        : null
      : null,

    // Fees & Charges
    intoPlaneFee: Math.random() > 0.3 ? intoPlane?.toString() || null : null,
    handlingFee: Math.random() > 0.6 ? handling?.toString() || null : null,
    otherFee: Math.random() > 0.8 ? otherFee?.toString() || null : null,
    otherFeeDescription: otherFee && Math.random() > 0.2 ? pickOne(OTHER_FEE_DESCRIPTIONS) : null,

    // Inclusions & Exclusions
    includesTaxes: Math.random() < 0.35,
    includesAirportFees: Math.random() < 0.3,

    // Calculated Fields
    densityAt15C: Math.random() < 0.4 ? getRandomFloat(775, 825, 1).toString() : null, // kg/m3
    normalizedUnitPriceUsdPerUsg: null, // calculated server-side

    // AI Processing
    aiSummary: Math.random() > 0.2 ? pickOne(AI_SUMMARY_OPTIONS) : null,

    // Decision Tracking
    decision: Math.random() < 0.3 ? pickOne(decisionEnum.enumValues) : null,
    decisionNotes: Math.random() < 0.2 ? pickOne(DECISION_NOTES_OPTIONS) : null,
  };

  const result = await fuelBidClient.createFuelBid(tenderId, data);
  return result;
}

export default createRandomFuelBid;
