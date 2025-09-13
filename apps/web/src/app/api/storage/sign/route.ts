// src/app/api/storage/sign/route.ts

import { getAuthContext } from '@/lib/authorization/get-auth-context';
import { jsonError } from '@/lib/core/errors';
import { server as storageServer } from '@/modules/storage';
import { NextRequest, NextResponse } from 'next/server';

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

    // Get path and expiresIn from request
    const { path, expiresIn = 60 } = await req.json();
    if (typeof path !== 'string') return jsonError('Missing path', 400);

    // Create signed URL using server function
    const data = await storageServer.createSignedUrl(orgId, path, expiresIn);

    return NextResponse.json({ signedUrl: data.signedUrl });
  } catch (error) {
    console.error('Failed to sign file', error);
    return jsonError('Failed to sign file', 500);
  }
}
