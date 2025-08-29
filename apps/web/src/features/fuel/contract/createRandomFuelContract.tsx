import { Airport, FuelContract } from '@/drizzle/types';
import { createFuelContract, CreateFuelContractData } from '@/services/fuel/fuel-contract-client';

const VENDOR_NAMES = [
  'Global Fuel Services',
  'Aviation Fuel Solutions',
  'SkyFuel International',
  'AeroEnergy Corp',
  'JetFuel Partners',
  'Airport Fuel Systems',
  'Premium Aviation Fuels',
  'Elite Fuel Services',
];
const FUEL_TYPES = ['Jet A-1', 'Jet A', 'Avgas 100LL', 'Diesel'];
const CURRENCIES = ['USD', 'EUR', 'GBP', 'CAD'];
const PRICE_TYPES = ['fixed', 'index_formula', 'floating'];

export async function createRandomFuelContract(airportId: Airport['id']): Promise<FuelContract> {
  // Generate random contract data
  const randomVendor = VENDOR_NAMES[Math.floor(Math.random() * VENDOR_NAMES.length)];
  const randomFuelType = FUEL_TYPES[Math.floor(Math.random() * FUEL_TYPES.length)];
  const randomCurrency = CURRENCIES[Math.floor(Math.random() * CURRENCIES.length)];
  const randomPriceType = PRICE_TYPES[Math.floor(Math.random() * PRICE_TYPES.length)];

  const basePrice = Math.random() * 3 + 1.5; // Random price between 1.5 and 4.5
  const volume = Math.floor(Math.random() * 5000000) + 500000; // Random volume between 500k and 5.5M
  const intoPlaneFee = Math.random() * 0.3 + 0.05; // Random fee between 0.05 and 0.35

  const effectiveFrom = new Date();
  const effectiveTo = new Date();
  effectiveTo.setFullYear(effectiveTo.getFullYear() + Math.floor(Math.random() * 3) + 1); // 1-3 years

  const generatedFuelContract = {
    airportId,
    contractNumber: `FC-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    title: `${randomVendor} - ${randomFuelType} Supply Contract`,
    fuelType: randomFuelType,
    vendorName: randomVendor,
    vendorAddress: `${Math.floor(Math.random() * 9999) + 1} Airport Blvd, City, Country`,
    vendorContactName: `Contact ${Math.floor(Math.random() * 100)}`,
    vendorContactEmail: `contact${Math.floor(Math.random() * 100)}@${randomVendor.toLowerCase().replace(/\s+/g, '')}.com`,
    vendorContactPhone: `+1-555-${Math.floor(Math.random() * 9000) + 1000}`,
    currency: randomCurrency,
    priceType: randomPriceType,
    baseUnitPrice: basePrice.toFixed(2),
    normalizedUsdPerUsg: basePrice.toFixed(2),
    volumeCommitted: volume.toString(),
    volumeUnit: 'USG',
    intoPlaneFee: intoPlaneFee.toFixed(2),
    includesTaxes: Math.random() > 0.5,
    includesAirportFees: Math.random() > 0.7,
    effectiveFrom: effectiveFrom.toISOString().split('T')[0],
    effectiveTo: effectiveTo.toISOString().split('T')[0],
    aiSummary: `Randomly generated contract for ${randomFuelType} supply from ${randomVendor}. Includes ${randomPriceType} pricing structure with ${randomCurrency} currency.`,
    terms: {},
    status: 'pending' as const,
  } as unknown as CreateFuelContractData;
  const res = await createFuelContract(generatedFuelContract);
  return res;
}
