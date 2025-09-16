import { getAuthContext } from '@/lib/authorization/get-auth-context';
import { jsonError } from '@/lib/core/errors';
import { server as fuelBidServer } from '@/modules/fuel/bids';
import { NextRequest, NextResponse } from 'next/server';

/**
 * Process a fuel bid doucment and extract the data
 * @param request
 * @returns
 */
export async function POST(request: NextRequest) {
  try {
    const { dbUser, orgId, error } = await getAuthContext();
    if (error || !dbUser || !orgId) return jsonError('Unauthorized', 401);
    // Get the file and fuel bid id
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const fuelBidId = formData.get('fuelBidId') as string;
    const res = await fuelBidServer.extractFuelBid(file, fuelBidId);

    // 1 - Create bid record
    // 2 - Extract file
    // 3 - Update bid record

    // Return the result
    return NextResponse.json(res, { status: 200 });
  } catch (error) {
    console.error('Error processing fuel bid', error);
    return jsonError('Failed to process fuel bid', 500);
  }
}
