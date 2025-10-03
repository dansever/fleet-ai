import { DocumentType } from '@/drizzle/enums';
import { ExtractionAgentName } from '@/lib/constants/extractionAgents';
import { ProcessorConfig } from '../files.types';
import { BaseFileProcessor } from './base.processor';

export class ContractProcessor extends BaseFileProcessor {
  readonly documentType: DocumentType = 'contract';
  readonly config: ProcessorConfig = {
    extractionAgent: ExtractionAgentName.CONTRACT_EXTRACTOR,
    requiresChunking: true,
    requiresEmbeddings: true,
  };

  transform(extractedData: any): any {
    if (!extractedData) return null;

    // Transform contract-specific data
    return {
      terms: extractedData.terms || null,
      summary: extractedData.summary || null,
      confidence: extractedData.confidence || 0,
      // Add any contract-specific transformations here
      contractDetails: {
        parties: extractedData.parties || [],
        effectiveDate: extractedData.effective_date || null,
        expirationDate: extractedData.expiration_date || null,
        value: extractedData.contract_value || null,
        currency: extractedData.currency || null,
      },
    };
  }
}
