// Quote analysis types

export interface QuoteAnalysisResponse {
  data: {
    summary: string;
    recommendations: string[];
    comparison: {
      bestValue: {
        vendor: string;
        totalCost: number;
        currency: string;
      };
      mostCompetitive: {
        vendor: string;
        score: number;
      };
      riskFactors: Array<{
        vendor: string;
        factor: string;
        severity: 'low' | 'medium' | 'high';
      }>;
    };
    vendorAnalysis: Array<{
      vendor: string;
      score: number;
      strengths: string[];
      weaknesses: string[];
      totalCost: number;
      currency: string;
    }>;
    insights: string[];
    confidence: number;
  };
}

export type AnalysisResult = QuoteAnalysisResponse['data'];
