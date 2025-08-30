import { Quote } from '@/drizzle/types';
import { CURRENCY_MAP } from '@/lib/constants/currencies';
import { createQuote, CreateQuoteData } from '@/services/technical/quote-client';

export async function createRandomQuote(rfqId: Quote['id']): Promise<Partial<Quote>> {
  const randomNumber = Math.floor(Math.random() * 1000000);
  const vendorNames = ['AeroTech', 'Bell Solutions', 'GetCargo', 'Delta', 'Eagle Solutions'];
  const randomCurrency =
    Object.keys(CURRENCY_MAP)[Math.floor(Math.random() * Object.keys(CURRENCY_MAP).length)];
  const quantity = Math.floor(Math.random() * 5);
  const price = Math.floor(Math.random() * 100);
  const description = `Quote from ${vendorNames[randomNumber % vendorNames.length]}. Description ${randomNumber}, ${quantity} units, condition ${randomNumber % 2 === 0 ? 'new' : 'used'}`;
  const traceTo = ['Delta', 'AeroTech', 'Bell Solutions', 'GetCargo', 'Eagle Solutions'][
    Math.floor(Math.random() * 5)
  ];
  const taggedDate = new Date(new Date().setDate(new Date().getDate() + (randomNumber % 30)));
  const leadTime = Math.floor(Math.random() * 10 + 1) + (Math.random() > 0.5 ? ' Days' : ' Hours');

  const generatedQuote = {
    rfqId,
    rfqNumber: `RFQ-${Math.floor(Math.random() * 1000000)}`,
    direction: randomNumber % 2 === 0 ? 'sent' : 'received',
    vendorName: vendorNames[randomNumber % vendorNames.length],
    vendorAddress: '123 Main St, Anytown, USA',
    vendorContactName: 'John Doe',
    vendorContactEmail: 'john.doe@example.com',
    vendorContactPhone: `${randomNumber.toString().slice(0, 3)}-${randomNumber.toString().slice(3, 6)}-${randomNumber.toString().slice(6, 9)}`,
    status: 'pending',
    receivedAt: new Date(),
    currency: randomCurrency,
    price: price,
    partNumber: `PART-${randomNumber}`,
    unitOfMeasure: 'EA',
    quantity: quantity,
    description: description,
    traceTo: traceTo,
    taggedDate: taggedDate,
    unitPrice: price / quantity,
    notes: `Notes ${randomNumber}`,
    partCondition: 'new',
    pricingType: 'unit',
    leadTime: leadTime,
    minimumOrderQuantity: 1,
  } as unknown as CreateQuoteData;
  const res = await createQuote(generatedQuote);
  return res;
}
