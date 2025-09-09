'use client';

import { client as aiClient } from '@/modules/ai';
import { Button } from '@/stories/Button/Button';
import { FeatureCard, GradientPalette } from '@/stories/Card/Card';
import { ModernTextarea } from '@/stories/Form/Form';
import { LLMResult } from '@/types/llm';
import { Bot, RefreshCcw } from 'lucide-react';
import { useState } from 'react';

export default function InputBar() {
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState<LLMResult['content']>('');
  const [isLoading, setIsLoading] = useState(false);

  const handleAskAI = async () => {
    try {
      setIsLoading(true);
      const result = await aiClient.callLLM(prompt);
      console.log('RESULT: ', result);
      setResponse(result.content);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="col-span-full flex flex-col gap-2">
      <div className="flex flex-row gap-2">
        <ModernTextarea
          placeholder="Search"
          rows={10}
          className="flex-1 min-h-10"
          value={prompt}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setPrompt(e.target.value)}
          onKeyDown={(e: React.KeyboardEvent<HTMLTextAreaElement>) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault(); // prevents newline
              handleAskAI();
            }
          }}
        />
        <Button
          intent="primary"
          icon={Bot}
          text="Ask AI"
          onClick={handleAskAI}
          disabled={isLoading}
          className="flex-shrink-0"
        />
      </div>
      <FeatureCard
        title={`${response ? 'AI Response' : 'Ask AI'}`}
        icon={<Bot />}
        actions={
          response ? (
            <Button
              intent="secondaryInverted"
              icon={RefreshCcw}
              text="Reset"
              onClick={() => setResponse('')}
              disabled={isLoading}
              className="flex-shrink-0"
            />
          ) : undefined
        }
        palette={GradientPalette.SkyIndigoViolet}
        className="flex-1 min-h-10"
        children={<span className="text-white/80">{response}</span>}
      />
    </div>
  );
}
