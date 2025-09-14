import { getAuthContext } from '@/lib/authorization/get-auth-context';
import { jsonError } from '@/lib/core/errors';
import { server as storageServer } from '@/modules/storage';
import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/storage/download
 * Download a file from storage
 * @param request - The request object.
 * Query parameters:
 * - path - The path to the file to download
 * @returns The file
 */
export async function GET(request: NextRequest) {
  try {
    // Authorize user
    const { dbUser, orgId, error } = await getAuthContext();
    if (error || !dbUser || !orgId) return jsonError('Unauthorized', 401);

    // Get path from query parameters
    const path = request.nextUrl.searchParams.get('path');
    if (!path) return jsonError('Path is required', 400);

    const file = await storageServer.downloadFile(path);

    // Return the file blob with proper headers
    return new NextResponse(file, {
      headers: {
        'Content-Type': file.type || 'application/octet-stream',
        'Content-Disposition': `attachment; filename="${path.split('/').pop()}"`,
      },
    });
  } catch (error) {
    console.error('Failed to download file', error);
    return jsonError('Failed to download file', 500);
  }
}
