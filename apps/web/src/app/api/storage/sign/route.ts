// src/app/api/storage/sign/route.ts

import { getAuthContext } from '@/lib/authorization/get-auth-context';
import { jsonError } from '@/lib/core/errors';
import { createClient } from '@/lib/supabase/server';
import { getBucketName } from '@/lib/supabase/storage-helpers';
import { server as orgServer } from '@/modules/core/organizations';
import { NextRequest, NextResponse } from 'next/server';

const supabase = await createClient();

/**
 * POST /api/storage/sign
 * Sign a file from the storage bucket
 * @param req - The request object.
 * Query parameters:
 * - path - The path to the file to sign
 * - expiresIn - The number of seconds to sign the file for
 * @returns The signed url
 */
export async function POST(req: NextRequest) {
  try {
    // Authorize user
    const { dbUser, orgId, error } = await getAuthContext();
    if (error || !dbUser || !orgId) return jsonError('Unauthorized', 401);

    // Get organization for bucket
    const org = await orgServer.getOrgById(orgId);
    if (!org) return jsonError('Organization not found', 404);
    const bucket = getBucketName(org);

    // Get path and expiresIn from request
    const { path, expiresIn = 60 } = await req.json();
    if (typeof path !== 'string') return jsonError('Missing path', 400);
    // TODO: Remove this after testing
    console.log('path', path);
    if (!path.startsWith(`${bucket}/`)) return jsonError('Forbidden', 403);

    // Sign the file
    const { data, error: err } = await supabase.storage
      .from(bucket)
      .createSignedUrl(path, expiresIn);
    if (err) return jsonError(err.message, 500);
    if (!data) return jsonError('No data returned', 404);

    return NextResponse.json({ signedUrl: data.signedUrl });
  } catch (error) {
    console.error('Failed to sign file', error);
    return jsonError('Failed to sign file', 500);
  }
}
