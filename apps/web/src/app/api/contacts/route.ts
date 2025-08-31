import { getAirportById } from '@/db/core/airports/db-actions';
import {
  createContact,
  deleteContact,
  getContactById,
  getContactsByAirport,
  getContactsByOrg,
  updateContact,
} from '@/db/suppliers-and-contacts/contacts/db-actions';
import { authorizeResource } from '@/lib/authorization/authorize-resource';
import { authorizeUser } from '@/lib/authorization/authorize-user';
import { jsonError } from '@/lib/core/errors';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Autherize user
    const { dbUser, error } = await authorizeUser();
    if (error || !dbUser) {
      return jsonError('Unauthorized', 401);
    }

    // Check if user has an organization
    if (!dbUser.orgId) {
      return jsonError('Organization not found', 404);
    }

    // Get organization id
    const orgId = dbUser.orgId;

    // Get airport id from query params
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const airportId = searchParams.get('airportId');

    // Get contact by id
    if (id) {
      const contact = await getContactById(id, orgId);
      if (!contact) return jsonError('Contact not found', 404);
      if (!authorizeResource(contact, dbUser)) return jsonError('Unauthorized', 401);
      return NextResponse.json(contact);
    }

    // Get contacts by airport id
    if (airportId) {
      const airport = await getAirportById(airportId);
      if (!airport) return jsonError('Airport not found', 404);
      if (!authorizeResource(airport, dbUser)) return jsonError('Unauthorized', 401);
      const contacts = await getContactsByAirport(airportId, orgId);
      return NextResponse.json(contacts);
    }

    // Default: Get all contacts by organization id
    const contacts = await getContactsByOrg(orgId);
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
    const { dbUser, error } = await authorizeUser();
    if (error || !dbUser) {
      return jsonError('Unauthorized', 401);
    }

    // Get contact data from request body
    const contact = await request.json();

    // Create contact
    const newContact = await createContact(contact);
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
export async function PUT(request: NextRequest) {
  try {
    // Autherize user
    const { dbUser, error } = await authorizeUser();
    if (error || !dbUser) {
      return jsonError('Unauthorized', 401);
    }
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return jsonError('Contact ID is required', 400);

    // Get contact by id
    const contact = await getContactById(id, dbUser.orgId);
    if (!contact) return jsonError('Contact not found', 404);
    if (!authorizeResource(contact, dbUser)) return jsonError('Unauthorized', 401);

    // Get contact data from request body
    const contactData = await request.json();

    // Update contact
    const updatedContact = await updateContact(id, contactData);
    return NextResponse.json(updatedContact);
  } catch (error) {
    console.error('Error updating contact:', error);
    return jsonError('Failed to update contact', 500);
  }
}

/**
 * DELETE /api/contacts
 * Delete a contact
 * @param request - The request object
 * @returns The deleted contact
 */
export async function DELETE(request: NextRequest) {
  try {
    // Autherize user
    const { dbUser, error } = await authorizeUser();
    if (error || !dbUser) {
      return jsonError('Unauthorized', 401);
    }

    // Get contact id from query params
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return jsonError('Contact ID is required', 400);

    // Get contact by id
    const contact = await getContactById(id, dbUser.orgId);
    if (!contact) return jsonError('Contact not found', 404);
    if (!authorizeResource(contact, dbUser)) return jsonError('Unauthorized', 401);

    // Delete contact
    const deletedContact = await deleteContact(id);
    return NextResponse.json(deletedContact);
  } catch (error) {
    console.error('Error deleting contact:', error);
    return jsonError('Failed to delete contact', 500);
  }
}
