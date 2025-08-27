'use client';

import { simpleLLM } from '@/services/ai/llm-client';
import { Button } from '@/stories/Button/Button';
import { FeatureCard } from '@/stories/Card/Card';
import { ModernTextarea } from '@/stories/Form/Form';
import { Bot, RefreshCcw } from 'lucide-react';
import { useState } from 'react';

export default function InputBar() {
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleAskAI = async () => {
    try {
      setIsLoading(true);
      const result = await simpleLLM(prompt);
      setResponse(result as string);
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
        description={response || 'No response yet'}
        icon={<Bot />}
        gradient="linear-to-r from-blue-500 to-pink-300"
        className="flex-1 min-h-10"
        buttonChildren={
          <Button
            intent="ghost"
            icon={RefreshCcw}
            onClick={() => setResponse(null)}
            className={`${isLoading && 'animate-spin'}`}
          />
        }
        bodyChildren={<p className="text-white/80">{response || 'No response yet'}</p>}
      ></FeatureCard>
    </div>
  );
}
