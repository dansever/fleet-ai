import { supabaseAdmin } from '@/lib/supabase/admin';
import { NextResponse } from 'next/server';

type RouteParams = { params: Promise<{ bucketName: string }> };

/**
 * List files in a bucket or get folder counts
 * @param request - the request
 * @param params - the params
 * @returns the response
 */
export async function GET(request: Request, { params }: RouteParams) {
  const { bucketName } = await params;
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');
  const folder = searchParams.get('folder');

  try {
    // If action is 'folder-counts', return counts for contracts and invoices folders
    if (action === 'folder-counts') {
      const [contractsResponse, invoicesResponse] = await Promise.all([
        supabaseAdmin.storage.from(bucketName).list('contracts', {
          limit: 1000, // Get all files to count them
          offset: 0,
        }),
        supabaseAdmin.storage.from(bucketName).list('invoices', {
          limit: 1000, // Get all files to count them
          offset: 0,
        }),
      ]);

      const contractsCount = contractsResponse.data?.length || 0;
      const invoicesCount = invoicesResponse.data?.length || 0;

      return NextResponse.json({
        data: {
          contracts: contractsCount,
          invoices: invoicesCount,
        },
      });
    }

    // Default behavior: list files in specified folder or contracts folder
    const targetFolder = folder || 'contracts';
    const response = await supabaseAdmin.storage.from(bucketName).list(targetFolder, {
      limit: 100,
      offset: 0,
      sortBy: { column: 'created_at', order: 'desc' },
    });

    return NextResponse.json(response);
  } catch (error) {
    console.error('Storage bucket operation error:', error);
    return NextResponse.json({ error: 'Failed to perform storage operation' }, { status: 500 });
  }
}
