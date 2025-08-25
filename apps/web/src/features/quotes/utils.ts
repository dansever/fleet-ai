import { Quote } from '@/drizzle/types';
import { currencies } from '@/lib/constants/currencies';
import { createQuote, CreateQuoteData } from '@/services/technical/quote-client';

export async function createRandomQuote(rfqId: Quote['id']): Promise<Partial<Quote>> {
  const randomNumber = Math.floor(Math.random() * 1000000);
  const vendorNames = ['AeroTech', 'Bell Solutions', 'GetCargo', 'Delta', 'Eagle Solutions'];
  const randomCurrency = currencies[Math.floor(Math.random() * currencies.length)];
  const unitPrice = Math.floor(Math.random() * 100);
  const quantity = Math.floor(Math.random() * 100);
  const totalPrice = unitPrice * quantity;

  const generatedQuote = {
    rfqId,
    createdAt: new Date(),
    updatedAt: new Date(),
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
    unitPrice: `${unitPrice}`,
    totalPrice: `${totalPrice}`,
    partNumber: `PART-${randomNumber}`,
    quantity,
    unit: 'EA',
    notes: `Notes ${randomNumber}`,
  } as unknown as CreateQuoteData;
  const res = await createQuote(generatedQuote);
  return res;
}
