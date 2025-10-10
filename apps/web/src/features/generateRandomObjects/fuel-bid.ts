import { decisionEnum } from '@/drizzle/enums';
import type { FuelTender } from '@/drizzle/types';
import { CURRENCY_MAP } from '@/lib/constants/currencies';
import { BASE_UOM_OPTIONS } from '@/lib/constants/units';
import { getRandomFloat, getRandomInt, pickOne } from '@/lib/utils';
import { client as fuelBidClient } from '@/modules/fuel/bids';
import { FuelBidCreateInput } from '@/modules/fuel/bids/bids.types';

export async function generateRandomFuelBid(tenderId: FuelTender['id'], round?: number) {
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

  const FIRST_NAMES = [
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

  const LAST_NAMES = [
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

  const PAYMENT_TERMS = [
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

  const VENDOR_COMMENTS = [
    'Pricing inclusive of standard service levels. Volume incentives available.',
    'Competitive rates with flexible payment terms. Quality assurance guaranteed.',
    'Premium fuel supply with 24/7 support. Bulk discounts applicable.',
    'Reliable delivery schedule with contingency planning included.',
    'Certified quality fuel with comprehensive documentation provided.',
    'Industry-leading service with environmental compliance assured.',
    'Expedited delivery available. Multi-year contract discounts offered.',
  ];

  const AI_SUMMARIES = [
    'Competitive offer with moderate fees; consider for shortlist pending volume commitments.',
    'Strong pricing with excellent service record. Recommended for further evaluation.',
    'Premium pricing justified by superior service levels and reliability.',
    'Cost-effective solution with standard terms. Good backup option.',
    'Innovative pricing structure with potential for long-term partnership.',
    'Market-leading offer with comprehensive service package included.',
    'Balanced proposal with competitive rates and flexible terms.',
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

  const DIFFERENTIAL_UNITS = ['USD/USG', 'USD/L', 'EUR/L', 'GBP/L', 'cents/USG', 'cents/L'];

  const FORMULA_NOTES = [
    'Monthly average with +5 business day lag.',
    'Weekly assessment with 3-day pricing window.',
    'Daily index with T+2 settlement terms.',
    'Bi-weekly pricing with volume adjustments.',
    'Real-time pricing with hourly updates available.',
    'Quarterly review with market adjustment clauses.',
    'Fixed differential with monthly true-up mechanism.',
  ];

  const FUEL_TYPES = ['Jet A-1', 'Jet A', 'JP-8', 'Avgas 100LL', 'Diesel', 'Mogas'];

  const STREET_NAMES = [
    'Market St',
    'Business Blvd',
    'Industrial Way',
    'Commerce Ave',
    'Energy Plaza',
  ];
  const CITY_NAMES = ['Fuel City', 'Energy Town', 'Petroleum Center', 'Aviation Hub'];

  // Helper functions
  const randomEmailFromName = (name: string): string => {
    const handle = name.toLowerCase().replace(/[^a-z]+/g, '.');
    const domain = pickOne(['example.com', 'supplier.co', 'fuelcorp.com']);
    return `${handle}@${domain}`;
  };

  const randomPhone = (): string => {
    const part = () => getRandomInt(100, 999);
    const last = getRandomInt(1000, 9999);
    return `+1 (${part()}) ${part()}-${last}`;
  };

  const randomDateBetween = (start?: string | null, end?: string | null): string => {
    const now = new Date();
    const startDate = start ? new Date(start) : new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const endDate = end ? new Date(end) : now;
    const startMs = startDate.getTime();
    const endMs = Math.max(startMs + 60 * 60 * 1000, endDate.getTime());
    const ts = getRandomInt(startMs, endMs);
    return new Date(ts).toISOString().split('T')[0];
  };

  // Generate random data
  const useIndexPricing = Math.random() < 0.5;
  const vendorName = pickOne(VENDOR_NAMES);
  const contactName = `${pickOne(FIRST_NAMES)} ${pickOne(LAST_NAMES)}`;
  const currencyKey = pickOne(Object.keys(CURRENCY_MAP));
  const uom = pickOne(BASE_UOM_OPTIONS.map((option) => option.value));

  // Pricing
  const basePrice = getRandomFloat(1.2, 4.2, 4);
  const intoPlane = getRandomFloat(0.015, 0.18, 4);
  const handling = getRandomFloat(0.01, 0.15, 4);
  const otherFee = getRandomFloat(0.005, 0.1, 4);
  const differential = useIndexPricing ? getRandomFloat(-0.35, 0.35, 4) : null;

  const fuelBid: FuelBidCreateInput = {
    // Required linkage
    tenderId,
    orgId: '', // Will be set by the API
    vendorId: null,

    // Bid Information
    title:
      Math.random() > 0.1
        ? `${vendorName} R${round || getRandomInt(1, 4)} ${pickOne(['Offer', 'Proposal', 'Bid', 'Quote'])}`
        : null,
    round: round || getRandomInt(1, 4),
    bidSubmittedAt: randomDateBetween(),

    // Vendor Information
    vendorName: Math.random() > 0.05 ? vendorName : null,
    vendorAddress:
      Math.random() > 0.2
        ? `${getRandomInt(100, 9999)} ${pickOne(STREET_NAMES)}, Suite ${getRandomInt(100, 999)}, ${pickOne(CITY_NAMES)}`
        : null,
    vendorContactName: contactName,
    vendorContactEmail: randomEmailFromName(contactName),
    vendorContactPhone: randomPhone(),
    vendorComments: pickOne(VENDOR_COMMENTS),

    // Pricing Structure
    priceType: useIndexPricing ? 'index_formula' : 'fixed',
    uom: uom,
    currency: currencyKey,
    paymentTerms: pickOne(PAYMENT_TERMS),

    // Fixed Pricing
    baseUnitPrice: useIndexPricing ? null : basePrice.toString(),

    // Index-Linked Pricing
    indexName: useIndexPricing ? pickOne(INDEX_NAMES) : null,
    indexLocation: useIndexPricing ? pickOne(INDEX_LOCATIONS) : null,
    differentialValue: useIndexPricing ? differential?.toString() : null,
    differentialUnit: useIndexPricing ? pickOne(DIFFERENTIAL_UNITS) : null,
    formulaNotes: useIndexPricing ? pickOne(FORMULA_NOTES) : null,

    // Fees & Charges
    intoPlaneFee: intoPlane?.toString(),
    handlingFee: handling?.toString(),
    otherFee: otherFee?.toString(),
    otherFeeDescription: otherFee && Math.random() > 0.2 ? pickOne(OTHER_FEE_DESCRIPTIONS) : null,

    // Inclusions & Exclusions
    includesAirportFees: Math.random() < 0.3,

    // Calculated Fields
    densityAt15C: getRandomFloat(775, 825, 1).toString(),

    // AI Processing
    aiSummary: pickOne(AI_SUMMARIES),

    // Decision Tracking
    decision: pickOne(decisionEnum.enumValues),
    decisionByUserId: null,
  };

  await fuelBidClient.createFuelBid(tenderId, fuelBid);

  return fuelBid;
}
