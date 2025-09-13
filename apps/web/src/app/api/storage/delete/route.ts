import { getActiveClerkOrg, getAuthContext } from '@/lib/authorization/get-auth-context';
import { jsonError } from '@/lib/core/errors';
import { createClient } from '@/lib/supabase/client';
import { NextResponse } from 'next/server';

const supabase = createClient();
export const runtime = 'nodejs'; // Needed to avoid edge body limits

/**
 * DELETE /api/storage/delete
 * Delete a file from the storage
 * @param request
 */
export async function DELETE(request: Request) {
  try {
    // get the auth context
    const { dbUser, orgId, error: authError } = await getAuthContext();
    if (authError || !dbUser || !orgId) return jsonError('Unauthorized', 401);

    // get the organization for the bucket
    const clerkOrg = await getActiveClerkOrg();
    if (!clerkOrg || !clerkOrg.slug) return jsonError('Clerk organization not found', 404);
    const bucket = clerkOrg.slug;

    // get the path from the request
    const { path } = await request.json();
    if (!path) return jsonError('Path is required', 400);

    // delete the file from the storage
    const { data, error } = await supabase.storage.from(bucket).remove([path]);
    if (error) {
      console.error('Supabase storage delete error:', error);
      return jsonError(`Failed to delete file: ${error.message}`, 500);
    }
    console.log('✅ Deleted file from storage', path);

    return NextResponse.json({
      data,
      message: 'File deleted successfully',
    });
  } catch (error) {
    return jsonError('Failed to delete file', 500);
  }
}
