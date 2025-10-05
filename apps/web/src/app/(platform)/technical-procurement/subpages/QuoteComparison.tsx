import { CardContent } from '@/components/ui/card';
import { generateRandomQuote } from '@/features/generateRandomObjects/quote';
import QuoteDialog from '@/features/quotes/quoteDialog';
import { client as quoteClient } from '@/modules/quotes';
import { Button } from '@/stories/Button/Button';
import { BaseCard } from '@/stories/Card/Card';
import { FileUploadPopover } from '@/stories/Popover/Popover';
import { Package, Plus, RefreshCw, Upload } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { useTechnicalProcurement } from '../ContextProvider';
import QuotesDataTable from '../_components/QuotesDataTable';

export default function QuoteComparison() {
  const {
    selectedRfq,
    selectedRfqQuotes,
    refreshSelectedRfqQuotes,
    isLoadingQuotes,
    isRefreshingQuotes,
    setQuoteComparisonResult,
    addQuote,
  } = useTechnicalProcurement();
  const [uploadQuotePopoverOpen, setUploadQuotePopoverOpen] = useState(false);
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

      const result = (await quoteClient.compareQuotesByRfqId(selectedRfq.id)) as unknown as JSON;

      // Extract data from the ResponseEnvelope structure
      const comparisonData = result;
      setQuoteComparisonResult(comparisonData);
      console.log('comparisonData:', comparisonData);
      toast.success('Quote analysis completed successfully');
    } catch (error) {
      console.error('Error analyzing quotes:', error);
      toast.error('Failed to analyze quotes');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleGenerateRandomQuote = async () => {
    const quote = await generateRandomQuote('received', selectedRfq?.id || '');
    addQuote(quote);
    setUploadQuotePopoverOpen(false);
  };

  return (
    <BaseCard
      title="Technical Quotes Comparison"
      subtitle={`Compare and evaluate quotes for ${selectedRfq?.rfqNumber}`}
      icon={
        <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl">
          <Package className="w-6 h-6 text-white" />
        </div>
      }
      actions={
        <div className="flex gap-2">
          {selectedRfqQuotes.length > 0 && (
            <>
              <Button
                intent="ghost"
                icon={RefreshCw}
                onClick={refreshSelectedRfqQuotes}
                disabled={isLoadingQuotes}
                className={`${isRefreshingQuotes ? 'animate-spin' : ''}`}
              />
            </>
          )}
          <FileUploadPopover
            open={uploadQuotePopoverOpen}
            onOpenChange={setUploadQuotePopoverOpen}
            trigger={<Button intent="secondary" text="Upload Quote" icon={Upload} />}
            onSend={() => {}}
          >
            <div className="flex flex-col gap-2 text-sm">
              <QuoteDialog
                quote={null}
                onChange={() => {}}
                DialogType="add"
                trigger={<Button intent="secondary" text="Add Quote" icon={Plus} size="sm" />}
              />
              <Button
                intent="ghost"
                text="Or generate random Quote"
                size="sm"
                onClick={handleGenerateRandomQuote}
              />
            </div>
          </FileUploadPopover>
        </div>
      }
      neutralHeader={true}
    >
      <CardContent>
        <QuotesDataTable />
      </CardContent>
    </BaseCard>
  );
}
