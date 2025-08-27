export interface QuoteAnalysisResponse {
  success: boolean;
  message: string;
  data: {
    rfq_id: string;
    rfq_number: string;
    quotes_analyzed: number;
    analysis_timestamp: string;
    llm_analysis: LLMAnalysis | string;
    quotes_summary: QuoteSummary[];
    error?: string;
  };
}

export interface LLMAnalysis {
  overall_assessment?: string;
  price_analysis?: string;
  vendor_analysis?: string;
  technical_compliance?: string;
  commercial_terms?: string;
  risk_assessment?: string;
  recommended_quote_id?: string | null;
  recommendation_reason?: string;
  key_insights?: string[];
  summary?: string;
}

export interface QuoteSummary {
  quote_id: string;
  vendor_name: string;
  price: string;
  currency: string;
  lead_time: string;
  status: string;
}
