// Extraction agent names for the LlamaExtract API
export const ExtractionAgentName = {
  CONTRACT_EXTRACTOR: 'fleet-ai-contract-extractor',
  QUOTE_EXTRACTOR: 'fleet-ai-quote-extractor',
  RFQ_EXTRACTOR: 'fleet-ai-rfq-extractor',
  FUEL_BID_EXTRACTOR: 'fleet-ai-fuel-bid-extractor',
} as const;

export type ExtractionAgentName = (typeof ExtractionAgentName)[keyof typeof ExtractionAgentName];
