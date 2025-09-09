import { authorizeResource } from '@/lib/authorization/authorize-resource';
import { getAuthContext } from '@/lib/authorization/get-auth-context';
import { jsonError } from '@/lib/core/errors';
import { server as contactServer } from '@/modules/vendors/contacts';
import { ContactUpdateInput } from '@/modules/vendors/contacts/contacts.types';
import { NextRequest, NextResponse } from 'next/server';

type RouteParams = { params: Promise<{ id: string }> };

/**
 * GET /api/contacts/[id] - Get a contact by ID
 * @param _request
 * @param param1
 * @returns
 */
export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const { dbUser, orgId, error } = await getAuthContext();
    if (error || !dbUser || !orgId) return jsonError('Unauthorized', 401);

    const { id } = await params;
    const contact = await contactServer.getContactById(id);
    if (!contact) return jsonError('Contact not found', 404);
    if (contact.orgId !== orgId) return jsonError('Unauthorized', 401);
    if (!authorizeResource(contact, dbUser)) return jsonError('Unauthorized', 401);

    return NextResponse.json(contact);
  } catch (error) {
    console.error('Error fetching contact by id:', error);
    return jsonError('Failed to fetch contact', 500);
  }
}

/**
 * PUT /api/contacts/[id] - Update a contact
 * @param request
 * @param params
 * @returns
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { dbUser, orgId, error } = await getAuthContext();
    if (error || !dbUser || !orgId) return jsonError('Unauthorized', 401);

    // Get contact by id
    const { id } = await params;
    const existing = await contactServer.getContactById(id);
    if (!existing) return jsonError('Contact not found', 404);
    if (existing.orgId !== orgId) return jsonError('Unauthorized', 401);
    if (!authorizeResource(existing, dbUser)) return jsonError('Unauthorized', 401);

    // Update contact
    const body: ContactUpdateInput = await request.json();
    const updated = await contactServer.updateContact(id, body);
    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating contact:', error);
    return jsonError('Failed to update contact', 500);
  }
}

/**
 * DELETE /api/contacts/[id] - Delete a contact
 * @param _request
 * @param params
 * @returns
 */
export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  try {
    const { dbUser, orgId, error } = await getAuthContext();
    if (error || !dbUser || !orgId) return jsonError('Unauthorized', 401);

    // Get contact by id
    const { id } = await params;
    const existing = await contactServer.getContactById(id);
    if (!existing) return jsonError('Contact not found', 404);
    if (existing.orgId !== orgId) return jsonError('Forbidden', 403);
    if (!authorizeResource(existing, dbUser)) return jsonError('Unauthorized', 401);

    // Delete contact
    await contactServer.deleteContact(id);
    return NextResponse.json({ message: 'Contact deleted successfully' });
  } catch (error) {
    console.error('Error deleting contact:', error);
    return jsonError('Failed to delete contact', 500);
  }
}
