import { getAuthContext } from '@/lib/authorization/authenticate-user';
import { jsonError } from '@/lib/core/errors';
import { storage } from '@/modules/file-manager';
import { NextResponse } from 'next/server';

const storageServer = storage.server;

export const runtime = 'nodejs'; // Needed to avoid edge body limits

/**
 * DELETE /api/storage/delete
 * Delete a file from the storage
 * @param request
 */
export async function DELETE(request: Request) {
  try {
    // Get the auth context
    const { dbUser, orgId, error: authError } = await getAuthContext();
    if (authError || !dbUser || !orgId) return jsonError('Unauthorized', 401);

    // Get the path from the request
    const { path } = await request.json();
    if (!path) return jsonError('Path is required', 400);

    // Delete the file using server function
    const result = await storageServer.deleteFile(path);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Failed to delete file', error);
    return jsonError('Failed to delete file', 500);
  }
}
