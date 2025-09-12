import { OrderDirection, UrgencyLevelEnum } from '@/drizzle/enums';
import { Rfq } from '@/drizzle/types';
import { CURRENCY_MAP } from '@/lib/constants/currencies';
import { getRandomFloat, getRandomInt, pickOne } from '@/lib/utils';
import { QuoteCreateInput } from '@/modules/quotes/quotes.types';

export function generateRandomQuote(direction: OrderDirection, rfqId: Rfq['id']) {
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
    'Premier Aircraft Parts',
    'Universal Aero Supply',
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

  const BUYER_COMMENTS = [
    'Urgent requirement for aircraft return to service. Please expedite quote.',
    'Part needed for scheduled maintenance. Standard lead time acceptable.',
    'AOG situation - immediate delivery required.',
    'Please provide best pricing for bulk order.',
    'Require certified part with full documentation.',
    'Part needed for upcoming heavy check.',
    'Emergency replacement required - cost is secondary to availability.',
  ];

  const PRICING_TYPES = ['fixed', 'exchange', 'repair', 'outright'];
  const PRICING_METHODS = ['unit', 'lot', 'bulk', 'tiered'];
  const PAYMENT_TERMS = ['Net 15', 'Net 30', 'Net 45', 'Net 60', 'COD', 'Due on Receipt', 'Net 90'];

  const AIRCRAFT_TYPES = ['Boeing 737', 'Airbus A320', 'Boeing 777', 'Airbus A330', 'Embraer E175'];

  const CONDITION_CODES = ['NE', 'SV', 'OH', 'RP', 'AR', 'NS'];
  const UNIT_OF_MEASURES = ['EA', 'LB', 'KG', 'FT', 'M', 'GAL', 'L', 'SET', 'PAIR'];

  const DELIVERY_TERMS = [
    'EXW',
    'FOB',
    'DDP',
    'DAP',
    'FCA',
    'CPT',
    'CIF',
    'Delivered Duty Paid',
    'Delivery: FCA VNO',
  ];

  const randomNumber = Math.floor(Math.random() * 1000000);
  const rfqNumber = Math.random() > 0.2 ? `RFQ-${getRandomInt(100000, 999999)}` : null;
  const quantity = getRandomInt(1, 3);
  const partNumber = `${pickOne(PART_CATEGORIES).substring(0, 3).toUpperCase()}-${randomNumber}`;
  const serialNumber = `SN${getRandomInt(100000, 999999)}`;
  const partDescription = `${pickOne(PART_CATEGORIES)} Component for ${pickOne(AIRCRAFT_TYPES)}`;
  const conditionCode = pickOne(CONDITION_CODES);
  const unitOfMeasure = pickOne(UNIT_OF_MEASURES);
  const buyerComments = pickOne(BUYER_COMMENTS);
  const urgencyLevel = pickOne(UrgencyLevelEnum.enumValues);

  // Price
  const price = getRandomFloat(50, 50000, 2);
  const currency = pickOne(Object.keys(CURRENCY_MAP));
  const pricingType = pickOne(PRICING_TYPES);
  const pricingMethod = pickOne(PRICING_METHODS);
  const coreDue = getRandomFloat(500, 5000, 2);
  const coreChange = getRandomFloat(100, 1000, 2);
  const paymentTerms = pickOne(PAYMENT_TERMS);

  // Delivery & Terms
  const leadTime = `${getRandomInt(1, 45)} ${pickOne(['days', 'weeks', 'business days'])}`;
  const deliveryTerms = pickOne(DELIVERY_TERMS);
  const warranty = Math.random() > 0.2 ? `${getRandomInt(30, 730)} days` : null;
  const quoteExpirationDate = `(${pickOne(['7', '14', '30'])}) Days`;

  // Vendor Information
  const vendorName = pickOne(VENDOR_NAMES);
  const vendorContactName = `${pickOne(FIRST_NAMES)} ${pickOne(LAST_NAMES)}`;
  const vendorContactEmail = `${vendorContactName.toLowerCase().replace(/\s+/g, '')}.${vendorContactName.toLowerCase().replace(/\s+/g, '')}@${vendorName.toLowerCase().replace(/\s+/g, '')}.com`;
  const vendorContactPhone = `+1-${getRandomInt(200, 999)}-${getRandomInt(200, 999)}-${getRandomInt(1000, 9999)}`;

  const quote: QuoteCreateInput = {
    direction,
    rfqId,
    rfqNumber,
    quantity,
    partNumber,
    serialNumber,
    partDescription,
    conditionCode,
    unitOfMeasure,

    // Pricing Information
    price: price.toString(),
    currency,
    pricingType,
    pricingMethod,
    coreDue: coreDue.toString(),
    coreChange: coreChange.toString(),
    paymentTerms,

    // Delivery & Terms
    leadTime,
    deliveryTerms,
    warranty,
    quoteExpirationDate,
  };
  if (direction === 'received') {
    quote.vendorName = vendorName;
    quote.vendorContactName = vendorContactName;
    quote.vendorContactEmail = vendorContactEmail;
    quote.vendorContactPhone = vendorContactPhone;
  }
  return quote;
}
