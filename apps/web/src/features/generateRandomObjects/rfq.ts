import { OrderDirection, UrgencyLevelEnum } from '@/drizzle/enums';
import { getRandomInt, pickOne } from '@/lib/utils';
import { RfqCreateInput } from '@/modules/rfqs/rfqs.types';

export function generateRandomRfq(direction: OrderDirection) {
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

  const AIRCRAFT_TYPES = ['Boeing 737', 'Airbus A320', 'Boeing 777', 'Airbus A330', 'Embraer E175'];

  const CONDITION_CODES = ['NE', 'SV', 'OH', 'RP', 'AR', 'NS'];
  const UNIT_OF_MEASURES = ['EA', 'LB', 'KG', 'FT', 'M', 'GAL', 'L', 'SET', 'PAIR'];

  const randomNumber = Math.floor(Math.random() * 1000000);
  const rfqNumber = Math.random() > 0.2 ? `RFQ-${getRandomInt(100000, 999999)}` : null;
  const quantity = getRandomInt(1, 3);
  const partNumber = `${pickOne(PART_CATEGORIES).substring(0, 3).toUpperCase()}-${randomNumber}`;
  const altPartNumber = `ALT-${pickOne(PART_CATEGORIES).substring(0, 3).toUpperCase()}-${randomNumber}`;
  const partDescription = `${pickOne(PART_CATEGORIES)} Component for ${pickOne(AIRCRAFT_TYPES)}`;
  const conditionCode = pickOne(CONDITION_CODES);
  const unitOfMeasure = pickOne(UNIT_OF_MEASURES);
  const buyerComments = pickOne(BUYER_COMMENTS);
  const urgencyLevel = pickOne(UrgencyLevelEnum.enumValues);

  // Vendor Information
  const vendorName = pickOne(VENDOR_NAMES);
  const vendorContactName = `${pickOne(FIRST_NAMES)} ${pickOne(LAST_NAMES)}`;
  const vendorContactEmail = `${vendorContactName.toLowerCase().replace(/\s+/g, '')}.${vendorContactName.toLowerCase().replace(/\s+/g, '')}@${vendorName.toLowerCase().replace(/\s+/g, '')}.com`;
  const vendorContactPhone = `+1-${getRandomInt(200, 999)}-${getRandomInt(200, 999)}-${getRandomInt(1000, 9999)}`;

  const rfq: RfqCreateInput = {
    direction,
    rfqNumber,
    quantity,
    partNumber,
    altPartNumber,
    partDescription,
    conditionCode,
    unitOfMeasure,
    buyerComments,
    urgencyLevel,
  };
  if (direction === 'received') {
    rfq.vendorName = vendorName;
    rfq.vendorContactName = vendorContactName;
    rfq.vendorContactEmail = vendorContactEmail;
    rfq.vendorContactPhone = vendorContactPhone;
  }
  return rfq;
}
