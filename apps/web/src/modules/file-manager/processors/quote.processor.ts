import { DocumentType } from '@/drizzle/enums';
import { ExtractionAgentName } from '@/lib/constants/extractionAgents';
import { ProcessorConfig } from '../extraction/files.types';
import { BaseFileProcessor } from './base.processor';

export class QuoteProcessor extends BaseFileProcessor {
  readonly documentType: DocumentType = 'quote';
  readonly config: ProcessorConfig = {
    extractionAgent: ExtractionAgentName.QUOTE_EXTRACTOR,
    requiresChunking: true,
    requiresEmbeddings: false,
  };

  transform(extractedData: any): any {
    if (!extractedData) return null;

    // Transform quote-specific data
    return {
      summary: extractedData.summary || null,
      confidence: extractedData.confidence || 0,
      quoteDetails: {
        items: extractedData.line_items || [],
        totalAmount: extractedData.total_amount || null,
        currency: extractedData.currency || null,
        validUntil: extractedData.valid_until || null,
        vendor: extractedData.vendor_info || null,
        terms: extractedData.terms_and_conditions || null,
      },
    };
  }
}
