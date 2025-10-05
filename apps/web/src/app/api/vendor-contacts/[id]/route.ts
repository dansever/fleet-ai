import { getAuthContext } from '@/lib/authorization/authenticate-user';
import { authorizeResource } from '@/lib/authorization/authorize-resource';
import { jsonError } from '@/lib/core/errors';
import { server as contactServer } from '@/modules/vendors/vendor-contacts';
import { VendorContactUpdateInput } from '@/modules/vendors/vendor-contacts/vendor-contacts.types';
import { NextRequest, NextResponse } from 'next/server';

type RouteParams = { params: Promise<{ id: string }> };

/**
 * GET /api/vendor-contacts/[id] - Get a vendor contact by ID
 * @param _request
 * @param param1
 * @returns
 */
export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const { dbUser, orgId, error } = await getAuthContext();
    if (error || !dbUser || !orgId) return jsonError('Unauthorized', 401);

    const { id } = await params;
    const vendorContact = await contactServer.getVendorContactById(id);
    if (!vendorContact) return jsonError('Vendor contact not found', 404);

    return NextResponse.json(vendorContact);
  } catch (error) {
    console.error('Error fetching contact by id:', error);
    return jsonError('Failed to fetch contact', 500);
  }
}

/**
 * PUT /api/vendor-contacts/[id] - Update a vendor contact
 * @param request
 * @param params
 * @returns
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { dbUser, orgId, error } = await getAuthContext();
    if (error || !dbUser || !orgId) return jsonError('Unauthorized', 401);

    // Get vendor contact by id
    const { id } = await params;

    // Update vendor contact
    const body: VendorContactUpdateInput = await request.json();
    const updated = await contactServer.updateVendorContact(id, body);
    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating vendor contact:', error);
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
    const existing = await contactServer.getVendorContactById(id);
    if (!existing) return jsonError('Contact not found', 404);
    if (existing.orgId !== orgId) return jsonError('Forbidden', 403);
    if (!authorizeResource(existing, dbUser)) return jsonError('Unauthorized', 401);

    // Delete contact
    await contactServer.deleteVendorContact(id);
    return NextResponse.json({ message: 'Contact deleted successfully' });
  } catch (error) {
    console.error('Error deleting contact:', error);
    return jsonError('Failed to delete contact', 500);
  }
}
