import { DocumentType } from '@/drizzle/schema';
import { ExtractionAgentName } from '@/lib/constants/extractionAgents';

/**
 * Map DocumentType to the appropriate ExtractionAgentName
 */
export const getExtractionAgentName = (documentType: DocumentType): ExtractionAgentName => {
  switch (documentType) {
    case 'contract':
      return ExtractionAgentName.CONTRACT_EXTRACTOR;
    case 'rfq':
      return ExtractionAgentName.RFQ_EXTRACTOR;
    case 'quote':
      return ExtractionAgentName.QUOTE_EXTRACTOR;
    case 'fuel_bid':
      return ExtractionAgentName.FUEL_BID_EXTRACTOR;
    default:
      throw new Error(`Unsupported parent type for extraction: ${documentType}`);
  }
};
