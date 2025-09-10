// app/api/storage/buckets/route.ts
import { supabaseAdmin } from '@/lib/supabase/admin';
import { NextResponse } from 'next/server';

/**
 * ADMIN ONLY
 * POST /api/storage/buckets - Create a new bucket
 */
export async function POST(request: Request) {
  const { bucketName, public: isPublic = false } = await request.json();
  const { data, error } = await supabaseAdmin.storage.createBucket(bucketName, {
    public: isPublic,
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ data });
}

/**
 * ADMIN ONLY
  DELETE /api/storage/buckets - Delete a bucket by name
 */
export async function DELETE(request: Request) {
  const { bucketName } = await request.json();
  const { data, error } = await supabaseAdmin.storage.deleteBucket(bucketName);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  if (!data) return NextResponse.json({ error: 'Bucket not found' }, { status: 404 });
  return NextResponse.json({ data });
}
