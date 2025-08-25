import type { Rfq } from '@/drizzle/types';
import { currencies } from '@/lib/constants/currencies';
import { createRfq, CreateRfqData } from '@/services/technical/rfq-client';

export async function createRandomRfq(): Promise<Rfq> {
  const randomNumber = Math.floor(Math.random() * 1000000);
  const randomCurrency = currencies[Math.floor(Math.random() * currencies.length)];
  const quantity = Math.floor(Math.random() * 3) + 1;

  const generatedRfq = {
    rfqNumber: `RFQ-${Math.floor(Math.random() * 100)}`,
    partNumber: `PART-${randomNumber}`,
    altPartNumber: `ALT-${randomNumber}`,
    partDescription: `Description ${randomNumber}`,
    status: 'pending',
    // receivedAt: new Date().toISOString(),
    // sentAt: new Date().toISOString(),
    currency: randomCurrency.code,
    quantity,
    unitOfMeasure: 'EA',
  } as Partial<CreateRfqData>;
  console.log('Randomly generated RFQ:', generatedRfq);
  const res = await createRfq(generatedRfq);
  return res;
}
