// lib/llama.ts

/**
 * Llama parser name
 */
export const LlamaParserName = 'fleet-ai-text-parser';

/**
 * Llama extraction agent names
 */
export const LlamaExtractionAgentNames = {
  CONTRACT_EXTRACTOR: 'fleet-ai-contract-extractor',
  QUOTE_EXTRACTOR: 'fleet-ai-quote-extractor',
  RFQ_EXTRACTOR: 'fleet-ai-rfq-extractor',
  FUEL_BID_EXTRACTOR: 'fleet-ai-fuel-bid-extractor',
} as const;
