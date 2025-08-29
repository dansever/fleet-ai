import { CreateRfqData } from '@/services/technical/rfq-client';
import { PydanticPart, PydanticVendor } from '../pydantic-models/shared-pydantic-models';

export interface PydanticRFQ {
  // Identifiers
  rfq_number: string | null;

  // Part information
  part: PydanticPart;

  // Vendor information
  vendor: PydanticVendor;

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
    rfqNumber: pydanticRfq.rfq_number,

    // Vendor Information - will be empty for received RFQs initially
    vendorName: pydanticRfq.vendor.name,
    vendorAddress: pydanticRfq.vendor.address,
    vendorContactName: pydanticRfq.vendor.contact_name,
    vendorContactEmail: pydanticRfq.vendor.contact_email,
    vendorContactPhone: pydanticRfq.vendor.contact_phone,

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
