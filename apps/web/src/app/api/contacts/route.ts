import { authorizeResource } from '@/lib/authorization/authorize-resource';
import { getAuthContext } from '@/lib/authorization/get-auth-context';
import { jsonError } from '@/lib/core/errors';
import { server as airportServer } from '@/modules/core/airports';
import { server as contactServer } from '@/modules/vendors/contacts';
import { ContactCreateInput } from '@/modules/vendors/contacts/contacts.types';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Autherize user
    const { dbUser, orgId, error } = await getAuthContext();
    if (error || !dbUser || !orgId) {
      return jsonError('Unauthorized', 401);
    }

    // Get airport id from query params
    const { searchParams } = new URL(request.url);
    const airportId = searchParams.get('airportId');

    // Get contacts by airport id
    if (airportId) {
      const airport = await airportServer.getAirportById(airportId);
      if (!airport) return jsonError('Airport not found', 404);
      if (!authorizeResource(airport, dbUser)) return jsonError('Unauthorized', 401);
      const contacts = await contactServer.listContactsByAirport(airportId);
      return NextResponse.json(contacts);
    }

    // Default: Get all contacts by organization id
    const contacts = await contactServer.listContactsByOrg(orgId);
    return NextResponse.json(contacts);
  } catch (error) {
    console.error('Error fetching contacts:', error);
    return jsonError('Failed to fetch contacts', 500);
  }
}

/**
 * POST /api/contacts
 * Create a new contact
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

/**
 * PUT /api/contacts
 * Update an existing contact
 * @param request - The request object
 * @returns The updated contact
 */
// PUT/DELETE moved to /api/contacts/[id]
