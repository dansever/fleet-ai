import { DocumentType } from '@/drizzle/enums';
import { ExtractionAgentName } from '@/lib/constants/extractionAgents';
import { server as fuelBidServer } from '@/modules/fuel/bids';
import { convertPydanticFuelBidToFuelBid } from '@/modules/fuel/bids/bids.utils';
import {
  FileProcessingRequest,
  FileProcessingResult,
  ProcessingProgressCallback,
  ProcessorConfig,
} from '../files.types';
import { BaseFileProcessor } from './base.processor';

export class FuelBidProcessor extends BaseFileProcessor {
  readonly documentType: DocumentType = 'fuel_bid';
  readonly config: ProcessorConfig = {
    extractionAgent: ExtractionAgentName.FUEL_BID_EXTRACTOR,
    requiresChunking: false,
    requiresEmbeddings: false,
  };

  async process(
    request: FileProcessingRequest,
    onProgress?: ProcessingProgressCallback,
  ): Promise<FileProcessingResult> {
    // For fuel bids, we need special handling to update the bid record
    const result = await super.process(request, onProgress);

    if (result.success && result.extractedData) {
      try {
        // Update the fuel bid record with extracted data
        await fuelBidServer.updateFuelBid(request.parentId, {
          ...result.extractedData,
          updatedAt: new Date(),
        });
      } catch (error) {
        console.error('Failed to update fuel bid record:', error);
        // Don't fail the whole process, just log the error
      }
    }

    return result;
  }

  transform(extractedData: any): any {
    if (!extractedData) return null;

    // Use existing fuel bid transformation logic
    return convertPydanticFuelBidToFuelBid(extractedData);
  }
}
