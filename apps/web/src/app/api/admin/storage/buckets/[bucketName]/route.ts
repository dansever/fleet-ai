// src/app/api/admin/storage/buckets/[bucketName]/route.ts

import { supabaseAdmin } from '@/lib/supabase/admin';
import { NextRequest, NextResponse } from 'next/server';
// Example: Clerk role check or your own RBAC table

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type Params = { bucketName: string };

function isSafeFolder(s: string) {
  return typeof s === 'string' && s.length > 0 && !s.startsWith('/') && !s.includes('..');
}

function isSafeBucketName(s: string) {
  // adjust to your naming scheme, e.g. org_<uuid>
  return /^[a-z0-9-_.]+$/.test(s);
}

export async function GET(req: NextRequest, { params }: { params: Params }) {
  const { bucketName } = params;
  if (!isSafeBucketName(bucketName)) {
    return NextResponse.json({ error: 'Invalid bucket name' }, { status: 400 });
  }

  const { searchParams } = new URL(req.url);
  const action = searchParams.get('action') || 'list';
  const folder = searchParams.get('folder') || 'contracts';

  // Pagination with sane caps
  const limitParam = Number(searchParams.get('limit') ?? 100);
  const offsetParam = Number(searchParams.get('offset') ?? 0);
  const limit = Number.isFinite(limitParam) ? Math.min(Math.max(limitParam, 1), 1000) : 100;
  const offset = Number.isFinite(offsetParam) ? Math.max(offsetParam, 0) : 0;

  try {
    if (action === 'folder-counts') {
      // Warning: this counts up to the page size per folder.
      // For very large folders, either paginate and sum or keep counts in a DB table.
      const [contractsRes, invoicesRes] = await Promise.all([
        supabaseAdmin.storage.from(bucketName).list('contracts', { limit: 1000, offset: 0 }),
        supabaseAdmin.storage.from(bucketName).list('invoices', { limit: 1000, offset: 0 }),
      ]);

      return NextResponse.json({
        data: {
          contracts: contractsRes.data?.length ?? 0,
          invoices: invoicesRes.data?.length ?? 0,
        },
      });
    }

    if (action === 'list') {
      if (!isSafeFolder(folder)) {
        return NextResponse.json({ error: 'Invalid folder' }, { status: 400 });
      }

      const res = await supabaseAdmin.storage.from(bucketName).list(folder, {
        limit,
        offset,
        sortBy: { column: 'created_at', order: 'desc' },
      });

      // Normalize
      return NextResponse.json({
        data: (res.data ?? []).map((obj) => ({
          name: obj.name,
          id: obj.id, // may be undefined depending on SDK version
          updatedAt: obj.updated_at ?? null,
          createdAt: obj.created_at ?? null,
          size: obj.metadata?.size ?? null,
          isFolder: obj.id === null, // folders may have null id in some SDKs
          path: `${folder}/${obj.name}`,
        })),
        error: res.error ? res.error.message : null,
        paging: { limit, offset },
      });
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (e) {
    console.error('Storage bucket operation error:', e);
    return NextResponse.json({ error: 'Failed to perform storage operation' }, { status: 500 });
  }
}
