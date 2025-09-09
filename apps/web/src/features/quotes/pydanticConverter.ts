import { QuoteCreateInput } from '@/modules/quotes/quotes.types';

// Pydantic schema interfaces matching the backend Quote and QuoteSchema
interface PydanticVendor {
  name: string | null;
  address: string | null;
  contact_name: string | null;
  contact_email: string | null;
  contact_phone: string | null;
}

interface PydanticPart {
  part_number: string | null;
  serial_number: string | null;
  description: string | null;
  condition: string | null;
  certifications: string[] | null;
  trace_to: string | null;
  tag_type: string | null;
  tagged_by: string | null;
  tagged_date: string | null;
}

interface PydanticQuote {
  // Identifiers
  quote_number: string | null;
  rfq_number: string | null;

  // Part information
  part: PydanticPart;
  minimum_order_quantity: number | null;
  quantity: number | null;
  unit_of_measure: string | null;

  // Payment terms
  unit_price: number | null;
  additional_charges: number | null;
  total_price: number | null;
  currency: string | null;
  price_type: string | null;
  core_charge: number | null;
  cost_method: string | null;
  core_due: string | null;
  payment_terms: string | null;

  // Delivery and Warranty
  delivery_terms: string | null;
  lead_time: string | null;
  warranty: string | null;

  // Supplier Comments
  supplier_comments: string | null;
  quote_expiration_date: string | null;
}

interface PydanticQuoteSchema {
  quotes: PydanticQuote[];
  vendor: PydanticVendor;
}

/**
 * Converts a Pydantic QuoteSchema object from the backend to a NewQuote object
 * that can be inserted into the database.
 *
 * @param pydanticQuoteSchema - The QuoteSchema object from the backend
 * @param rfqId - The ID of the RFQ this quote belongs to
 * @returns NewQuote object ready for database insertion
 */
export function convertPydanticToQuote(
  pydanticQuoteSchema: PydanticQuoteSchema,
  rfqId: string,
): QuoteCreateInput {
  // For now, we'll take the first quote from the array
  // In the future, we might want to handle multiple quotes differently
  const pydanticQuote = pydanticQuoteSchema.quotes[0];
  const vendor = pydanticQuoteSchema.vendor;

  if (!pydanticQuote) {
    throw new Error('No quotes found in the extracted data');
  }

  const CreateQuoteData: Partial<Omit<QuoteCreateInput, 'id' | 'createdAt' | 'updatedAt'>> = {
    // System fields
    rfqId,

    // Quote Identification
    rfqNumber: pydanticQuote.rfq_number,
    direction: 'received', // Uploaded quotes are always received

    // Vendor Information (from vendor object)
    vendorName: vendor.name,
    vendorAddress: vendor.address,
    vendorContactName: vendor.contact_name,
    vendorContactEmail: vendor.contact_email,
    vendorContactPhone: vendor.contact_phone,

    // Part Details (from part object)
    partNumber: pydanticQuote.part.part_number,
    serialNumber: pydanticQuote.part.serial_number,
    partDescription: pydanticQuote.part.description,
    partCondition: pydanticQuote.part.condition,
    unitOfMeasure: pydanticQuote.unit_of_measure,
    quantity: pydanticQuote.quantity,

    // Pricing Information
    price: pydanticQuote.unit_price?.toString() || null,
    currency: pydanticQuote.currency,
    pricingType: pydanticQuote.price_type,
    pricingMethod: pydanticQuote.cost_method,
    coreDue: pydanticQuote.core_due,
    coreChange: pydanticQuote.core_charge?.toString() || null,
    paymentTerms: pydanticQuote.payment_terms,
    minimumOrderQuantity: pydanticQuote.minimum_order_quantity,

    // Delivery & Terms
    leadTime: pydanticQuote.lead_time,
    deliveryTerms: pydanticQuote.delivery_terms,
    warranty: pydanticQuote.warranty,
    quoteExpirationDate: pydanticQuote.quote_expiration_date,

    // Compliance & Traceability (from part object)
    certifications: pydanticQuote.part.certifications || [],
    traceTo: pydanticQuote.part.trace_to,
    tagType: pydanticQuote.part.tag_type,
    taggedBy: pydanticQuote.part.tagged_by,
    taggedDate: pydanticQuote.part.tagged_date,

    // Additional Information
    vendorComments: pydanticQuote.supplier_comments,

    // Workflow Management
    processStatus: 'pending',

    // Timestamps - will be set by the database
    sentAt: null,
  };

  console.log('✅ Converted Pydantic Quote --> New Quote');

  return CreateQuoteData as QuoteCreateInput;
}
