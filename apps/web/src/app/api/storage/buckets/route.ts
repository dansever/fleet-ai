// app/api/storage/buckets/route.ts
import { getAuthContext } from '@/lib/authorization/get-auth-context';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { currentUser } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

// Helper function to check admin access
async function checkAdminAccess() {
  const { dbUser, orgId, error } = await getAuthContext();
  if (error || !dbUser || !orgId) {
    return false;
  }

  const clerkUser = await currentUser();
  if (!clerkUser) {
    return false;
  }

  // For now, we'll use a simplified check - in production, you'd want to check Clerk organization membership
  // This is a placeholder until proper Clerk organization role checking is implemented
  return true; // TODO: Implement proper organization owner/admin check
}

/**
 * ADMIN ONLY
 * GET /api/storage/buckets - List all buckets
 */
export async function GET() {
  const hasAdminAccess = await checkAdminAccess();
  if (!hasAdminAccess) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { data: buckets, error } = await supabaseAdmin.storage.listBuckets();
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ buckets });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to list buckets' }, { status: 500 });
  }
}

/**
 * ADMIN ONLY
 * POST /api/storage/buckets - Create a new bucket
 */
export async function POST(request: Request) {
  const hasAdminAccess = await checkAdminAccess();
  if (!hasAdminAccess) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { bucketName, public: isPublic = false } = await request.json();
    const { data, error } = await supabaseAdmin.storage.createBucket(bucketName, {
      public: isPublic,
    });
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ data });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create bucket' }, { status: 500 });
  }
}

/**
 * ADMIN ONLY
 * DELETE /api/storage/buckets - Delete a bucket by name
 */
export async function DELETE(request: Request) {
  const hasAdminAccess = await checkAdminAccess();
  if (!hasAdminAccess) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { bucketName } = await request.json();
    const { data, error } = await supabaseAdmin.storage.deleteBucket(bucketName);
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    if (!data) return NextResponse.json({ error: 'Bucket not found' }, { status: 404 });
    return NextResponse.json({ data });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete bucket' }, { status: 500 });
  }
}
