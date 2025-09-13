import { db } from '@/drizzle';
import { documentsTable } from '@/drizzle/schema/schema.documents';
import { getAuthContext } from '@/lib/authorization/get-auth-context';
import { jsonError } from '@/lib/core/errors';
import { server as chunksServer } from '@/modules/documents/chunks';
import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';

type RouteParams = { params: Promise<{ documentId: string }> };

/**
 * POST /api/chunks/[documentId] -  Create chunks for a document
 * @param _ request
 * @param params route parameters
 * @returns
 */
export async function POST(_: Request, { params }: RouteParams) {
  try {
    // Authorize user
    const { dbUser, orgId, error } = await getAuthContext();
    if (error || !dbUser || !orgId) return jsonError('Unauthorized', 401);

    // Get document id
    const { documentId } = await params;

    // Get document by id and authorize
    const doc = await db.query.documentsTable.findFirst({
      where: eq(documentsTable.id, documentId),
      columns: { id: true, orgId: true, content: true },
    });
    if (!doc) return NextResponse.json({ ok: false, error: 'Document not found' }, { status: 404 });

    // Check if document belongs to organization
    if (doc.orgId !== orgId)
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });

    // Check if document has content
    if (!doc.content?.trim()) {
      return NextResponse.json({ ok: false, error: 'No extracted text to chunk' }, { status: 400 });
    }

    // Create document chunks
    const result = await chunksServer.createDocumentChunks(doc); // calls your RAG prep + DB insert

    // Return result
    return NextResponse.json({ ok: true, ...result });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message ?? 'Internal error' },
      { status: 500 },
    );
  }
}
