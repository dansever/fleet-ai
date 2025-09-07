import { authorizeResource } from '@/lib/authorization/authorize-resource';
import { getAuthContext } from '@/lib/authorization/get-auth-context';
import { jsonError } from '@/lib/core/errors';
import { server as contactServer } from '@/modules/vendors/contacts';
import { ContactUpdateInput } from '@/modules/vendors/contacts/contacts.types';
import { NextRequest, NextResponse } from 'next/server';

type RouteParams = { params: { id: string } };

export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const { dbUser, error } = await getAuthContext();
    if (error || !dbUser) return jsonError('Unauthorized', 401);

    const contact = await contactServer.getContactById(params.id);
    if (!contact) return jsonError('Contact not found', 404);
    if (!authorizeResource(contact, dbUser)) return jsonError('Unauthorized', 401);

    return NextResponse.json(contact);
  } catch (error) {
    console.error('Error fetching contact by id:', error);
    return jsonError('Failed to fetch contact', 500);
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { dbUser, error } = await getAuthContext();
    if (error || !dbUser) return jsonError('Unauthorized', 401);

    const existing = await contactServer.getContactById(params.id);
    if (!existing) return jsonError('Contact not found', 404);
    if (!authorizeResource(existing, dbUser)) return jsonError('Unauthorized', 401);

    const body: ContactUpdateInput = await request.json();
    const updated = await contactServer.updateContact(params.id, body);
    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating contact:', error);
    return jsonError('Failed to update contact', 500);
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  try {
    const { dbUser, error } = await getAuthContext();
    if (error || !dbUser) return jsonError('Unauthorized', 401);

    const existing = await contactServer.getContactById(params.id);
    if (!existing) return jsonError('Contact not found', 404);
    if (!authorizeResource(existing, dbUser)) return jsonError('Unauthorized', 401);

    await contactServer.deleteContact(params.id);
    return NextResponse.json({ message: 'Contact deleted successfully' });
  } catch (error) {
    console.error('Error deleting contact:', error);
    return jsonError('Failed to delete contact', 500);
  }
}
