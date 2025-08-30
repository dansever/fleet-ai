import type { Rfq } from '@/drizzle/types';

import { createRfq, CreateRfqData } from '@/services/technical/rfq-client';

export async function createRandomRfq(): Promise<Rfq> {
  const randomNumber = Math.floor(Math.random() * 1000000);
  const quantity = Math.floor(Math.random() * 3) + 1;
  const urgencyLevels = ['Routine', 'Urgent', 'AOG'];
  const priceTypes = ['Fixed', 'Exchange'];
  const conditionCodes = ['AN', 'SV', 'FN', 'AR', 'BR'];

  const generatedRfq: CreateRfqData = {
    rfqNumber: `RFQ-${Math.floor(Math.random() * 100)}`,
    partNumber: `PART-${randomNumber}`,
    altPartNumber: `ALT-${randomNumber}`,
    partDescription: `Description ${randomNumber}`,
    status: 'pending',
    conditionCode: conditionCodes[Math.floor(Math.random() * conditionCodes.length)],
    pricingType: priceTypes[Math.floor(Math.random() * priceTypes.length)],
    urgencyLevel: urgencyLevels[Math.floor(Math.random() * urgencyLevels.length)],
    sentAt: new Date().toISOString(),
    quantity,
    unitOfMeasure: 'EA',
  };
  const res = await createRfq(generatedRfq);
  return res;
}
