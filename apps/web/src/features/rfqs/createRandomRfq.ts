// Updated by CursorAI on Sep 2 2025
import { OrderDirection, ProcessStatusEnum, UrgencyLevelEnum } from '@/drizzle/enums';
import type { Rfq } from '@/drizzle/types';
import { client as rfqClient } from '@/modules/rfqs';
import { RfqCreateInput } from '@/modules/rfqs/rfqs.types';

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

function randomEmail(firstName: string, lastName: string, company: string): string {
  const cleanFirst = firstName.toLowerCase().replace(/\s+/g, '');
  const cleanLast = lastName.toLowerCase().replace(/\s+/g, '');
  const cleanCompany = company.toLowerCase().replace(/[^a-z0-9]/g, '');
  return `${cleanFirst}.${cleanLast}@${cleanCompany}.com`;
}

function randomAddress(): string {
  const streetNum = getRandomInt(100, 9999);
  const streets = [
    'Aviation Blvd',
    'Industrial Way',
    'Airport Rd',
    'Commerce St',
    'Business Park Dr',
    'Tech Center Ave',
  ];
  const suite = getRandomInt(100, 999);
  const cities = [
    'Aerospace City',
    'Aviation Town',
    'Industrial Park',
    'Commerce Center',
    'Tech Valley',
    'Business District',
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
const PRICING_TYPES = ['fixed', 'exchange', 'repair', 'outright', 'consignment', 'lease'];
const CONDITION_CODES = ['NE', 'SV', 'OH', 'RP', 'AR', 'NS'];
const CONDITION_NAMES = [
  'new',
  'serviceable',
  'overhauled',
  'repaired',
  'as_removed',
  'non_serviceable',
];
const AIRCRAFT_TYPES = [
  'Boeing 737',
  'Airbus A320',
  'Boeing 777',
  'Airbus A330',
  'Embraer E175',
  'Boeing 787',
  'Airbus A350',
  'Boeing 747',
  'Airbus A380',
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
  'Cabin',
  'Structure',
];
const UNIT_OF_MEASURES = ['EA', 'LB', 'KG', 'FT', 'M', 'GAL', 'L', 'SET', 'PAIR', 'ASSY'];
const DELIVERY_LOCATIONS = [
  'Hangar 1, Gate A1',
  'Hangar 5, Gate B12',
  'Maintenance Bay 3',
  'Line Station 7',
  'Cargo Terminal 2',
  'MRO Facility West',
  'Parts Warehouse',
  'Receiving Dock 4',
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

export async function createRandomRfq(direction: OrderDirection = 'sent'): Promise<Rfq> {
  const randomNumber = Math.floor(Math.random() * 1000000);
  const vendorName = pickOne(VENDOR_NAMES);
  const firstName = pickOne(FIRST_NAMES);
  const lastName = pickOne(LAST_NAMES);
  const contactName = `${firstName} ${lastName}`;
  const quantity = getRandomInt(1, 8);
  const partCategory = pickOne(PART_CATEGORIES);
  const aircraftType = pickOne(AIRCRAFT_TYPES);

  const generatedRfq: RfqCreateInput = {
    // RFQ Identification (matching schema)
    direction,
    rfqNumber: Math.random() > 0.2 ? `RFQ-${getRandomInt(100000, 999999)}` : null,

    // Vendor Information (matching schema)
    vendorName: Math.random() > 0.1 ? vendorName : null,
    vendorAddress: Math.random() > 0.2 ? randomAddress() : null,
    vendorContactName: Math.random() > 0.2 ? contactName : null,
    vendorContactEmail: Math.random() > 0.3 ? randomEmail(firstName, lastName, vendorName) : null,
    vendorContactPhone: Math.random() > 0.4 ? randomPhone() : null,

    // Part Specifications (matching schema)
    partNumber:
      Math.random() > 0.05 ? `${partCategory.substring(0, 3).toUpperCase()}-${randomNumber}` : null,
    altPartNumber: Math.random() > 0.6 ? `ALT-${getRandomInt(10000, 99999)}` : null,
    partDescription:
      Math.random() > 0.1
        ? `${partCategory} Component for ${aircraftType} - Advanced ${pickOne(['System', 'Assembly', 'Unit', 'Module'])}`
        : null,
    conditionCode: Math.random() > 0.2 ? pickOne(CONDITION_CODES) : null,
    unitOfMeasure: Math.random() > 0.1 ? pickOne(UNIT_OF_MEASURES) : null,
    quantity: Math.random() > 0.1 ? quantity : null,

    // Commercial Terms (matching schema)
    pricingType: Math.random() > 0.3 ? pickOne(PRICING_TYPES) : null,
    urgencyLevel: Math.random() > 0.2 ? pickOne(UrgencyLevelEnum.enumValues) : null,
    deliverTo: Math.random() > 0.4 ? pickOne(DELIVERY_LOCATIONS) : null,
    buyerComments: Math.random() > 0.4 ? pickOne(BUYER_COMMENTS) : null,

    // Workflow Management (matching schema)
    processStatus: pickOne(ProcessStatusEnum.enumValues),
    selectedQuoteId: null, // This would be set later when a quote is selected

    // Timestamps (matching schema)
    sentAt:
      Math.random() > 0.3
        ? new Date(Date.now() - getRandomInt(0, 30) * 24 * 60 * 60 * 1000).toISOString()
        : null,
  };

  const res = await rfqClient.createRfq(generatedRfq);
  return res;
}
