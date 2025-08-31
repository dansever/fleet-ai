'use client';

import { simpleLLM } from '@/services/ai/llm-client';
import { Button } from '@/stories/Button/Button';
import { FeatureCard, GradientPalette } from '@/stories/Card/Card';
import { ModernTextarea } from '@/stories/Form/Form';
import { LLMResponse } from '@/types/llm';
import { Bot, RefreshCcw } from 'lucide-react';
import { useState } from 'react';

export default function InputBar() {
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState<LLMResponse<string> | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleAskAI = async () => {
    try {
      setIsLoading(true);
      const result = await simpleLLM(prompt);
      console.log(result.data);
      setResponse(result.data);
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
        />
      </div>
      <FeatureCard
        title="AI Response"
        description={response?.content || 'No response yet'}
        icon={<Bot />}
        palette={GradientPalette.SkyIndigoViolet}
        className="flex-1 min-h-10"
        buttonChildren={
          <Button
            intent="secondaryInverted"
            icon={RefreshCcw}
            onClick={() => setResponse(null)}
            className={`${isLoading && 'animate-spin'}`}
          />
        }
        bodyChildren={<span className="text-white/80">{response?.content}</span>}
      />
    </div>
  );
}
