import { CreateRfqData } from '@/services/technical/rfq-client';

// Pydantic schema interfaces matching the backend RFQ schema
interface PydanticPart {
  part_number: string | null;
  alt_part_number: string | null;
  serial_number: string | null;
  description: string | null;
  condition_code: string | null;
  certifications: string[] | null;
  trace_to: string | null;
  tag_type: string | null;
  tagged_by: string | null;
  tagged_date: string | null;
}

export interface PydanticRFQ {
  // Identifiers
  rfq_number: string | null;

  // Part information
  part: PydanticPart;

  // Request details
  priority: string | null;
  quantity_requested: number | null;
  unit_of_measure: string | null;
  price_type: string | null;
  buyer_comments: string | null;
}

/**
 * Converts a Pydantic RFQ object from the backend to a CreateRfqData object
 * that can be sent to the client API.
 *
 * @param pydanticRfq - The RFQ object from the backend
 * @returns CreateRfqData object ready for API submission
 */
export function convertPydanticToRfq(pydanticRfq: PydanticRFQ): CreateRfqData {
  if (!pydanticRfq) {
    throw new Error('No RFQ data found in the extracted data');
  }

  const createRfqData: CreateRfqData = {
    // RFQ Identification
    direction: 'received', // Uploaded RFQs are always received
    rfqNumber: pydanticRfq.rfq_number,

    // Vendor Information - will be empty for received RFQs initially
    vendorName: null,
    vendorAddress: null,
    vendorContactName: null,
    vendorContactEmail: null,
    vendorContactPhone: null,

    // Part Specifications (from part object)
    partNumber: pydanticRfq.part.part_number,
    altPartNumber: pydanticRfq.part.alt_part_number,
    partDescription: pydanticRfq.part.description,
    conditionCode: pydanticRfq.part.condition_code,
    unitOfMeasure: pydanticRfq.unit_of_measure,
    quantity: pydanticRfq.quantity_requested,

    // Commercial Terms
    pricingType: pydanticRfq.price_type,
    urgencyLevel: pydanticRfq.priority,
    deliverTo: null, // Not available in backend RFQ schema
    buyerComments: pydanticRfq.buyer_comments,

    // Workflow Management
    status: 'pending',
    selectedQuoteId: null,

    // Timestamps - will be set by the database (ISO string for API transport)
    sentAt: null,
  };

  console.log('✅ Converted Pydantic RFQ --> CreateRfqData');

  return createRfqData;
}
