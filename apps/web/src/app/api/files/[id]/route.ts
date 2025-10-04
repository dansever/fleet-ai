import { getAuthContext } from '@/lib/authorization/get-auth-context';
import { jsonError } from '@/lib/core/errors';
import { server as documentsServer } from '@/modules/documents/documents';
import { NextRequest, NextResponse } from 'next/server';

type RouteParams = { params: Promise<{ id: string }> };

/**
 * DELETE /api/files/[id]
 * Deletes the file from storage, then deletes the corresponding document record.
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    // Authorize user
    const { dbUser, orgId, error } = await getAuthContext();
    if (error || !dbUser || !orgId) return jsonError('Unauthorized', 401);

    // Resolve document id
    const { id } = await params;

    // Delegate to canonical documents deletion and set deprecation headers
    const document = await documentsServer.getDocumentById(id);
    if (!document) return jsonError('Document not found', 404);
    if (document.orgId !== orgId) return jsonError('Unauthorized', 401);

    const result = await documentsServer.deleteDocumentCascade(id);

    const response = NextResponse.json({ success: true, ...result });
    response.headers.set('Deprecation', 'true');
    response.headers.set('Sunset', 'Wed, 01 Jan 2026 00:00:00 GMT');
    response.headers.set('Link', '</api/documents/{id}>; rel="successor-version"');
    return response;
  } catch (err) {
    console.error('Error deleting file/document:', err);
    return jsonError('Failed to delete file/document', 500);
  }
}
