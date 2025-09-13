import { db } from '@/drizzle';
import { documentsTable } from '@/drizzle/schema/schema.documents';
import { getAuthContext } from '@/lib/authorization/get-auth-context';
import { jsonError } from '@/lib/core/errors';
import { createDocumentChunks } from '@/modules/documents/chunks/chunks.server'; // server-only orchestration
import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';

type RouteParams = { params: Promise<{ id: string }> };

/**
 * POST /api/documents/[id]/chunks -  Create chunks for a document
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
    const { id } = await params;
    const doc = await db.query.documentsTable.findFirst({
      where: eq(documentsTable.id, id),
      columns: { id: true, orgId: true, content: true },
    });
    if (!doc) return NextResponse.json({ ok: false, error: 'Document not found' }, { status: 404 });
    if (doc.orgId !== orgId)
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
    if (!doc.content?.trim()) {
      return NextResponse.json({ ok: false, error: 'No extracted text to chunk' }, { status: 400 });
    }

    const result = await createDocumentChunks(doc); // calls your RAG prep + DB insert
    return NextResponse.json({ ok: true, ...result });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message ?? 'Internal error' },
      { status: 500 },
    );
  }
}
