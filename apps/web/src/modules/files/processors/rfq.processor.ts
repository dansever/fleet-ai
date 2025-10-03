import { DocumentType } from '@/drizzle/enums';
import { ExtractionAgentName } from '@/lib/constants/extractionAgents';
import { ProcessorConfig } from '../files.types';
import { BaseFileProcessor } from './base.processor';

export class RfqProcessor extends BaseFileProcessor {
  readonly documentType: DocumentType = 'rfq';
  readonly config: ProcessorConfig = {
    extractionAgent: ExtractionAgentName.RFQ_EXTRACTOR,
    requiresChunking: true,
    requiresEmbeddings: false,
  };

  transform(extractedData: any): any {
    if (!extractedData) return null;

    // Transform RFQ-specific data
    return {
      summary: extractedData.summary || null,
      confidence: extractedData.confidence || 0,
      rfqDetails: {
        requirements: extractedData.requirements || [],
        deadline: extractedData.submission_deadline || null,
        contactInfo: extractedData.contact_information || null,
        specifications: extractedData.technical_specifications || null,
        evaluationCriteria: extractedData.evaluation_criteria || null,
      },
    };
  }
}
