import { NewFuelBid } from '@/drizzle/types';

// Type definition for the Pydantic FuelBid object from backend
interface PydanticFuelBid {
  vendor: {
    name: string;
    address: string | null;
    contact_name: string | null;
    contact_email: string | null;
    contact_phone: string | null;
  };
  title: string | null;
  supplier_comments: string | null;
  bid_submitted_at: string | null;
  ai_summary: string | null;
  price_type: string | null;
  uom: string | null;
  currency: string | null;
  payment_terms: string | null;
  base_unit_price: number | null;
  index_name: string | null;
  index_location: string | null;
  differential: number | null;
  differential_unit: string | null;
  formula_notes: string | null;
  into_plane_fee: number | null;
  handling_fee: number | null;
  other_fee: number | null;
  other_fee_description: string | null;
  includes_taxes: boolean;
  includes_airport_fees: boolean;
  density_at_15c: number | null;
  fuel_type: string | null;
  validity_start_date: string | null;
  validity_end_date: string | null;
  minimum_order_quantity: number | null;
  minimum_order_unit: string | null;
}

/**
 * Converts a Pydantic FuelBid object from the backend to a NewFuelBid object
 * that can be inserted into the database.
 *
 * @param pydanticBid - The FuelBid object from the backend
 * @param tenderId - The ID of the fuel tender this bid belongs to
 * @param round - Optional round number for the bid
 * @returns NewFuelBid object ready for database insertion
 */
export function convertPydanticToFuelBid(
  pydanticBid: PydanticFuelBid,
  tenderId: string,
  round?: number,
): NewFuelBid {
  const newBid: NewFuelBid = {
    // Required system fields
    tenderId,

    // Bid Information
    title: pydanticBid.title,
    round: round || 1,
    bidSubmittedAt: pydanticBid.bid_submitted_at,

    // Vendor Information (flattened from nested vendor object)
    vendorName: pydanticBid.vendor.name,
    vendorAddress: pydanticBid.vendor.address,
    vendorContactName: pydanticBid.vendor.contact_name,
    vendorContactEmail: pydanticBid.vendor.contact_email,
    vendorContactPhone: pydanticBid.vendor.contact_phone,
    vendorComments: pydanticBid.supplier_comments,

    // Pricing Structure
    priceType: pydanticBid.price_type,
    uom: pydanticBid.uom,
    currency: pydanticBid.currency,
    paymentTerms: pydanticBid.payment_terms,

    // Fixed Pricing
    baseUnitPrice: pydanticBid.base_unit_price?.toString() || null,

    // Index-Linked Pricing
    indexName: pydanticBid.index_name,
    indexLocation: pydanticBid.index_location,
    differential: pydanticBid.differential?.toString() || null,
    differentialUnit: pydanticBid.differential_unit,
    formulaNotes: pydanticBid.formula_notes,

    // Fees & Charges
    intoPlaneFee: pydanticBid.into_plane_fee?.toString() || null,
    handlingFee: pydanticBid.handling_fee?.toString() || null,
    otherFee: pydanticBid.other_fee?.toString() || null,
    otherFeeDescription: pydanticBid.other_fee_description,

    // Inclusions & Exclusions
    includesTaxes: pydanticBid.includes_taxes,
    includesAirportFees: pydanticBid.includes_airport_fees,

    // Technical
    densityAt15C: pydanticBid.density_at_15c?.toString() || null,

    // AI Processing
    aiSummary: pydanticBid.ai_summary,
  };

  console.log('✅Converted Pydantic Bid --> New FuelBid');

  return newBid;
}
