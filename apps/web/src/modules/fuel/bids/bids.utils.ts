import { FuelBid } from '@/drizzle/types';

/**
 * Converts a Pydantic FuelBid schema to a database FuelBid record
 * Handles field name mapping (snake_case to camelCase) and data type conversions
 */
export const convertPydanticFuelBidToFuelBid = (
  pydanticFuelBid: Record<string, any>,
): Partial<FuelBid> => {
  // Extract vendor information from nested vendor object
  const vendor = pydanticFuelBid.vendor || {};

  return {
    // System fields (these should be set by the calling code)
    // id: pydanticFuelBid.id, // Don't override DB-generated ID
    // orgId: pydanticFuelBid.orgId, // Set by calling code
    // tenderId: pydanticFuelBid.tenderId, // Set by calling code
    // vendorId: pydanticFuelBid.vendorId, // Set by calling code or vendor lookup

    // Basic bid information
    title: pydanticFuelBid.title,
    round: pydanticFuelBid.round,
    bidSubmittedAt: pydanticFuelBid.bid_submitted_at ? pydanticFuelBid.bid_submitted_at : undefined,

    // Vendor information (from nested vendor object)
    vendorName: vendor.name || pydanticFuelBid.vendor_name,
    vendorAddress: vendor.address || pydanticFuelBid.vendor_address,
    vendorContactName: vendor.contact_name || pydanticFuelBid.vendor_contact_name,
    vendorContactEmail: vendor.contact_email || pydanticFuelBid.vendor_contact_email,
    vendorContactPhone: vendor.contact_phone || pydanticFuelBid.vendor_contact_phone,
    vendorComments: pydanticFuelBid.vendor_comments,

    // Pricing structure
    priceType: pydanticFuelBid.price_type,
    uom: pydanticFuelBid.uom,
    currency: pydanticFuelBid.currency,
    paymentTerms: pydanticFuelBid.payment_terms,

    // Fixed pricing
    baseUnitPrice: pydanticFuelBid.base_unit_price
      ? String(pydanticFuelBid.base_unit_price)
      : undefined,

    // Index-linked pricing
    indexName: pydanticFuelBid.index_name,
    indexLocation: pydanticFuelBid.index_location,
    differential: pydanticFuelBid.differential ? String(pydanticFuelBid.differential) : undefined,
    differentialUnit: pydanticFuelBid.differential_unit,
    formulaNotes: pydanticFuelBid.formula_notes,

    // Fees & charges
    intoPlaneFee: pydanticFuelBid.into_plane_fee
      ? String(pydanticFuelBid.into_plane_fee)
      : undefined,
    handlingFee: pydanticFuelBid.handling_fee ? String(pydanticFuelBid.handling_fee) : undefined,
    otherFee: pydanticFuelBid.other_fee ? String(pydanticFuelBid.other_fee) : undefined,
    otherFeeDescription: pydanticFuelBid.other_fee_description,

    // Inclusions & exclusions
    includesTaxes: pydanticFuelBid.includes_taxes,
    includesAirportFees: pydanticFuelBid.includes_airport_fees,

    // Calculated fields
    densityAt15C: pydanticFuelBid.density_at_15c
      ? String(pydanticFuelBid.density_at_15c)
      : undefined,

    // AI Processing
    aiSummary: pydanticFuelBid.ai_summary,
    terms: pydanticFuelBid.terms || [],
    tags: pydanticFuelBid.tags || [],

    // Decision tracking (not from extraction, managed separately)
    // decision: undefined,
    // decisionByUserId: undefined,
    // decisionAt: undefined,
    // decisionNotes: undefined,
  };
};
