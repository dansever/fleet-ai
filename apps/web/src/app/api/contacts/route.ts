import { getAuthContext } from '@/lib/authorization/get-auth-context';
import { jsonError } from '@/lib/core/errors';
import { server as contactServer } from '@/modules/vendors/vendor-contacts';
import { ContactCreateInput } from '@/modules/vendors/vendor-contacts/vendor-contacts.types';
import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/contacts - Get all contacts by vendor id or organization id
 * @param request - The request object
 * @returns
 */
export async function GET(request: NextRequest) {
  try {
    // Autherize user
    const { dbUser, orgId, error } = await getAuthContext();
    if (error || !dbUser || !orgId) {
      return jsonError('Unauthorized', 401);
    }

    // Get vendor id from query params
    const { searchParams } = new URL(request.url);
    const vendorId = searchParams.get('vendorId');
    if (!vendorId) {
      return jsonError('Vendor id is required', 400);
    }

    // Get contacts by vendor id
    const contacts = await contactServer.listContactsByVendor(vendorId);
    return NextResponse.json(contacts);
  } catch (error) {
    console.error('Error fetching contacts:', error);
    return jsonError('Failed to fetch contacts', 500);
  }
}

/**
 * POST /api/contacts - Create a new contact
 * @param request - The request object
 * @returns The created contact
 */
export async function POST(request: NextRequest) {
  try {
    // Autherize user
    const { dbUser, orgId, error } = await getAuthContext();
    if (error || !dbUser || !orgId) {
      return jsonError('Unauthorized', 401);
    }

    // Get contact data from request body
    const contact: ContactCreateInput = await request.json();

    // Create contact
    const newContact = await contactServer.createContact({ ...contact, orgId });
    return NextResponse.json(newContact);
  } catch (error) {
    console.error('Error creating contact:', error);
    return jsonError('Failed to create contact', 500);
  }
}
