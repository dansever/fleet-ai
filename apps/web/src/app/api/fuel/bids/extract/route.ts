import { getAuthContext } from '@/lib/authorization/get-auth-context';
import { ExtractionAgentName } from '@/lib/constants/extractionAgents';
import { jsonError } from '@/lib/core/errors';
import { server as extractServer } from '@/modules/ai/extract';
import { server as fuelBidServer } from '@/modules/fuel/bids';
import { convertPydanticFuelBidToFuelBid } from '@/modules/fuel/bids/bids.utils';
import { timed } from '@/utils/timer';
import { NextRequest, NextResponse } from 'next/server';

/**
 * This API is used to start an extraction job for an uploaded file using an extraction agent
 * @param req request with file_id and extraction_agent_id in body
 * @returns the extraction job with job ID
 */
export async function POST(req: NextRequest) {
  try {
    // Authorize user
    const { dbUser, orgId, error: authError } = await getAuthContext();
    if (authError || !dbUser || !orgId) return jsonError('Unauthorized', 401);

    const body = await req.formData();
    const file = body.get('file') as File;
    const tenderId = body.get('tenderId') as string;

    // 1 - Create bid record
    const bid = await timed('fuelBidExtract', async () => {
      return fuelBidServer.createFuelBid({ orgId, tenderId });
    });

    // 1.1 - Get the extraction agent
    const agent = await extractServer.getExtractionAgent(ExtractionAgentName.FUEL_BID_EXTRACTOR);
    console.log('agent', agent);

    // 1.2 - Upload the file
    const uploadedFile = await extractServer.uploadFileForExtraction(file);
    console.log('uploadedFile', uploadedFile);

    // 2 - Extract bid data
    const result = await timed('fuelBidExtract', async () => {
      return extractServer.fileExtractorOrchestrator(file, ExtractionAgentName.FUEL_BID_EXTRACTOR);
    });

    // 3- Update bid record with converted data
    await timed('fuelBidUpdate', async () => {
      const convertedData = convertPydanticFuelBidToFuelBid(result.data);
      return fuelBidServer.updateFuelBid(bid.id, {
        ...convertedData,
        updatedAt: new Date(),
      });
    });

    // Return result
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 },
    );
  }
}
