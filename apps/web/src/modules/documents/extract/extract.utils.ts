import { DocumentParentType } from '@/drizzle/schema';
import { ExtractionAgentName } from '@/lib/constants/extractionAgents';

/**
 * Map DocumentParentType to the appropriate ExtractionAgentName
 */
export const getExtractionAgentName = (parentType: DocumentParentType): ExtractionAgentName => {
  switch (parentType) {
    case 'contract':
      return ExtractionAgentName.CONTRACT_EXTRACTOR;
    case 'rfq':
      return ExtractionAgentName.RFQ_EXTRACTOR;
    case 'quote':
      return ExtractionAgentName.QUOTE_EXTRACTOR;
    case 'fuel_bid':
      return ExtractionAgentName.FUEL_BID_EXTRACTOR;
    default:
      throw new Error(`Unsupported parent type for extraction: ${parentType}`);
  }
};
