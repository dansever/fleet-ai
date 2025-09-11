import { getAuthContext } from '@/lib/authorization/get-auth-context';
import { jsonError } from '@/lib/core/errors';
import { createClient } from '@/lib/supabase/client';
import { server as orgServer } from '@/modules/core/organizations';
import { NextResponse } from 'next/server';
import slugify from 'slugify';

const supabase = createClient();

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
    const org = await orgServer.getOrgById(orgId);
    if (!org || !org.name) return jsonError('Organization not found', 404);
    const bucket = slugify(org.name, { lower: true });

    // get the path from the request
    const { path } = await request.json();
    if (!path) return jsonError('Path is required', 400);

    // delete the file from the storage
    const { data, error } = await supabase.storage.from(bucket).remove([path]);
    if (error) {
      console.error('Supabase storage delete error:', error);
      return jsonError(`Failed to delete file: ${error.message}`, 500);
    }

    return NextResponse.json({
      data,
      message: 'File deleted successfully',
    });
  } catch (error) {
    return jsonError('Failed to delete file', 500);
  }
}
