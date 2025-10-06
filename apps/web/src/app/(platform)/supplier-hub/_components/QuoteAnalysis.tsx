'use client';

import { Badge } from '@/components/ui/badge';
import { CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { client as quoteClient } from '@/modules/quotes';
import { Button } from '@/stories/Button/Button';
import { BaseCard } from '@/stories/Card/Card';
import { QuoteAnalysisResponse } from '@/types/quote-analysis';
import {
  AlertTriangle,
  CheckCircle,
  DollarSign,
  FileText,
  Sparkles,
  TrendingUp,
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { useTechnicalProcurement } from '../ContextProvider';

interface QuoteAnalysisProps {
  isRefreshing?: boolean;
}

type AnalysisResult = QuoteAnalysisResponse['data'];

export default function QuoteAnalysis({ isRefreshing = false }: QuoteAnalysisProps) {
  const { selectedRfq, selectedRfqQuotes } = useTechnicalProcurement();
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyzeQuotes = async () => {
    if (!selectedRfq) {
      toast.error('Please select an RFQ first');
      return;
    }

    if (selectedRfqQuotes.length === 0) {
      toast.error('No quotes available for analysis');
      return;
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      toast.info('Analyzing quotes with AI...');

      const result = (await quoteClient.compareQuotesByRfqId(
        selectedRfq.id,
      )) as unknown as AnalysisResult;

      // Extract data from the ResponseEnvelope structure
      const comparisonData = result;
      setAnalysisResult(comparisonData);
      console.log('comparisonData:', comparisonData);
      toast.success('Quote analysis completed successfully');
    } catch (error) {
      console.error('Error analyzing quotes:', error);
      setError('Failed to analyze quotes. Please try again.');
      toast.error('Error analyzing quotes');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const clearAnalysis = () => {
    setAnalysisResult(null);
    setError(null);
  };

  if (!selectedRfq) {
    return (
      <BaseCard>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-500" />
            Quote Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Select an RFQ to analyze its quotes</p>
        </CardContent>
      </BaseCard>
    );
  }

  return (
    <BaseCard>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-purple-500" />
          Quote Analysis
        </CardTitle>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <FileText className="h-4 w-4" />
          {selectedRfq.rfqNumber || 'N/A'}
          <Badge variant="outline" className="ml-2">
            {selectedRfqQuotes.length} Quote{selectedRfqQuotes.length !== 1 ? 's' : ''}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Analysis Controls */}
        <div className="flex gap-2">
          <Button
            onClick={handleAnalyzeQuotes}
            disabled={isAnalyzing || selectedRfqQuotes.length === 0}
            intent="primary"
            size="sm"
            className="flex items-center gap-2"
            text={'Analyze Quotes'}
            icon={Sparkles}
          />
          {analysisResult && (
            <Button onClick={clearAnalysis} intent="secondary" size="sm" text="Clear Analysis" />
          )}
        </div>

        {/* Error State */}
        {error && (
          <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
            <div className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-4 w-4" />
              <span className="font-medium">Analysis Failed</span>
            </div>
            <p className="text-sm text-destructive/80 mt-1">{error}</p>
          </div>
        )}

        {/* Analysis Results */}
        {analysisResult && (
          <div className="space-y-4">
            {/* Analysis Summary */}
            <BaseCard title="Analysis Summary" className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-blue-500" />
                    <span className="text-sm font-medium">Vendors Analyzed</span>
                  </div>
                  <p className="text-xl font-bold mt-1">{analysisResult.vendorAnalysis.length}</p>
                </div>

                <div className="p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-green-500" />
                    <span className="text-sm font-medium">Best Value</span>
                  </div>
                  <p className="text-lg font-semibold mt-1">
                    {analysisResult.comparison.bestValue.vendor}
                  </p>
                </div>

                <div className="p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-purple-500" />
                    <span className="text-sm font-medium">Confidence</span>
                  </div>
                  <Badge variant="secondary" className="mt-1">
                    {Math.round(analysisResult.confidence * 100)}%
                  </Badge>
                </div>
              </div>
            </BaseCard>

            {/* Vendor Analysis */}
            <BaseCard title="Vendor Analysis" className="space-y-3">
              <div className="space-y-2">
                {analysisResult.vendorAnalysis.map((vendor: any, index: any) => (
                  <div
                    key={vendor.vendor}
                    className="flex items-center justify-between p-3 bg-muted/30 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <Badge variant="outline">#{index + 1}</Badge>
                      <div>
                        <p className="font-medium">{vendor.vendor}</p>
                        <p className="text-sm text-muted-foreground">Score: {vendor.score}/10</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-4 w-4 text-green-500" />
                        <span className="font-semibold">
                          {vendor.totalCost} {vendor.currency}
                        </span>
                      </div>
                      <div className="flex gap-1 mt-1">
                        {vendor.strengths.length > 0 && (
                          <Badge variant="default" className="text-xs">
                            {vendor.strengths.length} strengths
                          </Badge>
                        )}
                        {vendor.weaknesses.length > 0 && (
                          <Badge variant="secondary" className="text-xs">
                            {vendor.weaknesses.length} concerns
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </BaseCard>

            {/* AI Analysis Results */}
            <BaseCard title="AI Insights" className="space-y-3">
              <div className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20 rounded-lg border">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="h-5 w-5 text-purple-500" />
                  <span className="font-medium">AI Analysis</span>
                </div>

                <div className="space-y-3">
                  {analysisResult.summary && (
                    <div>
                      <h4 className="font-medium text-sm mb-1">Summary</h4>
                      <p className="text-sm text-muted-foreground">{analysisResult.summary}</p>
                    </div>
                  )}

                  {analysisResult.recommendations && analysisResult.recommendations.length > 0 && (
                    <div>
                      <h4 className="font-medium text-sm mb-2">Recommendations</h4>
                      <ul className="list-disc list-inside space-y-1">
                        {analysisResult.recommendations.map(
                          (recommendation: string, index: number) => (
                            <li key={index} className="text-sm text-muted-foreground">
                              {recommendation}
                            </li>
                          ),
                        )}
                      </ul>
                    </div>
                  )}

                  {analysisResult.insights && analysisResult.insights.length > 0 && (
                    <div>
                      <h4 className="font-medium text-sm mb-2">Key Insights</h4>
                      <ul className="list-disc list-inside space-y-1">
                        {analysisResult.insights.map((insight: string, index: number) => (
                          <li key={index} className="text-sm text-muted-foreground">
                            {insight}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </BaseCard>
          </div>
        )}

        {/* Empty State */}
        {!analysisResult && !isAnalyzing && !error && selectedRfqQuotes.length > 0 && (
          <div className="text-center py-8">
            <Sparkles className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">
              Ready to analyze {selectedRfqQuotes.length} quote
              {selectedRfqQuotes.length !== 1 ? 's' : ''} for this RFQ
            </p>
            <p className="text-sm text-muted-foreground">
              Click "Analyze Quotes" to get AI-powered insights and recommendations
            </p>
          </div>
        )}

        {/* No Quotes State */}
        {selectedRfqQuotes.length === 0 && (
          <div className="text-center py-8">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-2">No quotes available for analysis</p>
            <p className="text-sm text-muted-foreground">
              Add quotes to this RFQ to enable analysis
            </p>
          </div>
        )}
      </CardContent>
    </BaseCard>
  );
}
