'use client';

import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Button } from '@/stories/Button/Button';
import { ModernInput } from '@/stories/Form/Form';
import {
  AlertTriangle,
  Calendar,
  Lightbulb,
  MessageSquare,
  Send,
  Sparkles,
  TrendingDown,
  X,
} from 'lucide-react';
import { useState } from 'react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface AIInsight {
  type: 'opportunity' | 'warning' | 'info' | 'expiration';
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface AIAssistantProps {
  /** Context about what document/contract is being viewed */
  context?: {
    documentId?: string;
    contractId?: string;
    documentName?: string;
  };
  /** Pre-populated insights to show */
  insights?: AIInsight[];
  /** Compact mode for inline display */
  mode?: 'inline' | 'floating' | 'panel';
  className?: string;
}

export function AIAssistant({
  context,
  insights = [],
  mode = 'inline',
  className,
}: AIAssistantProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // TODO: Implement actual AI agent call
    setTimeout(() => {
      const assistantMessage: Message = {
        role: 'assistant',
        content: `I understand you're asking about: "${input}". This is a placeholder response. The actual AI agent will be integrated later.`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
      setIsLoading(false);
    }, 1000);
  };

  const getInsightIcon = (type: AIInsight['type']) => {
    switch (type) {
      case 'opportunity':
        return <TrendingDown className="w-4 h-4" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4" />;
      case 'expiration':
        return <Calendar className="w-4 h-4" />;
      default:
        return <Lightbulb className="w-4 h-4" />;
    }
  };

  const getInsightColor = (type: AIInsight['type']) => {
    switch (type) {
      case 'opportunity':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'warning':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'expiration':
        return 'bg-amber-50 border-amber-200 text-amber-800';
      default:
        return 'bg-blue-50 border-blue-200 text-blue-800';
    }
  };

  const suggestedQuestions = [
    'When does this contract expire?',
    'What are the key financial terms?',
    'Are there any risks I should know about?',
    'Can I negotiate better terms?',
  ];

  if (mode === 'floating') {
    return (
      <div className={cn('fixed bottom-6 right-6 z-50', className)}>
        {!isExpanded ? (
          <button
            onClick={() => setIsExpanded(true)}
            className="group relative flex items-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
          >
            <Sparkles className="w-5 h-5 animate-pulse" />
            <span className="font-medium">AI Assistant</span>
            <Badge className="absolute -top-1 -right-1 bg-red-500 text-white text-xs px-2 py-0.5">
              {insights.length}
            </Badge>
          </button>
        ) : (
          <div className="bg-white rounded-2xl shadow-2xl w-96 max-h-[600px] flex flex-col border border-gray-200">
            <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-purple-50 to-blue-50">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-600" />
                <h3 className="font-semibold">AI Assistant</h3>
              </div>
              <button
                onClick={() => setIsExpanded(false)}
                className="p-1 rounded-lg hover:bg-white/50 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              <AIAssistantContent
                insights={insights}
                messages={messages}
                suggestedQuestions={suggestedQuestions}
                getInsightIcon={getInsightIcon}
                getInsightColor={getInsightColor}
                isLoading={isLoading}
              />
            </div>
            <div className="p-4 border-t">
              <div className="flex gap-2">
                <ModernInput
                  placeholder="Ask me anything about this contract..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) =>
                    e.key === 'Enter' && handleSend()
                  }
                />
                <Button
                  icon={Send}
                  onClick={handleSend}
                  disabled={!input.trim() || isLoading}
                  intent="primary"
                  size="sm"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (mode === 'panel') {
    return (
      <div className={cn('bg-white rounded-xl border border-gray-200 flex flex-col', className)}>
        <div className="flex items-center gap-2 p-4 border-b bg-gradient-to-r from-purple-50 to-blue-50">
          <Sparkles className="w-5 h-5 text-purple-600" />
          <h3 className="font-semibold">AI Assistant</h3>
        </div>
        <div className="flex-1 overflow-y-auto p-4 max-h-[500px]">
          <AIAssistantContent
            insights={insights}
            messages={messages}
            suggestedQuestions={suggestedQuestions}
            getInsightIcon={getInsightIcon}
            getInsightColor={getInsightColor}
            isLoading={isLoading}
          />
        </div>
        <div className="p-4 border-t">
          <div className="flex gap-2">
            <ModernInput
              placeholder="Ask me anything about this contract..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) =>
                e.key === 'Enter' && handleSend()
              }
            />
            <Button
              icon={Send}
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              intent="primary"
              size="sm"
            />
          </div>
        </div>
      </div>
    );
  }

  // Inline mode (default)
  return (
    <div
      className={cn(
        'bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 rounded-xl p-4',
        className,
      )}
    >
      <AIAssistantContent
        insights={insights}
        messages={messages}
        suggestedQuestions={suggestedQuestions}
        getInsightIcon={getInsightIcon}
        getInsightColor={getInsightColor}
        isLoading={isLoading}
        inline
      />
      <div className="flex gap-2 mt-4">
        <ModernInput
          placeholder="Ask me anything about this contract..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) =>
            e.key === 'Enter' && handleSend()
          }
        />
        <Button
          icon={Send}
          onClick={handleSend}
          disabled={!input.trim() || isLoading}
          intent="primary"
          size="sm"
        />
      </div>
    </div>
  );
}

function AIAssistantContent({
  insights,
  messages,
  suggestedQuestions,
  getInsightIcon,
  getInsightColor,
  isLoading,
  inline = false,
}: {
  insights: AIInsight[];
  messages: Message[];
  suggestedQuestions: string[];
  getInsightIcon: (type: AIInsight['type']) => React.ReactNode;
  getInsightColor: (type: AIInsight['type']) => string;
  isLoading: boolean;
  inline?: boolean;
}) {
  return (
    <div className="flex flex-col gap-4">
      {/* AI Insights */}
      {insights.length > 0 && (
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-4 h-4 text-purple-600" />
            <h4 className="font-semibold text-sm">AI Insights</h4>
          </div>
          {insights.map((insight, idx) => (
            <div key={idx} className={cn('p-3 rounded-lg border', getInsightColor(insight.type))}>
              <div className="flex items-start gap-2">
                <div className="flex-shrink-0 mt-0.5">{getInsightIcon(insight.type)}</div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm">{insight.title}</p>
                  <p className="text-xs mt-1 opacity-80">{insight.description}</p>
                  {insight.action && (
                    <button
                      onClick={insight.action.onClick}
                      className="text-xs font-medium mt-2 underline hover:no-underline"
                    >
                      {insight.action.label}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Chat Messages */}
      {messages.length > 0 && (
        <div className="flex flex-col gap-3">
          {messages.map((message, idx) => (
            <div
              key={idx}
              className={cn(
                'flex gap-2',
                message.role === 'user' ? 'justify-end' : 'justify-start',
              )}
            >
              <div
                className={cn(
                  'max-w-[80%] rounded-2xl px-4 py-2',
                  message.role === 'user'
                    ? 'bg-purple-600 text-white'
                    : 'bg-white border border-gray-200 text-gray-800',
                )}
              >
                <p className="text-sm">{message.content}</p>
                <p className="text-xs mt-1 opacity-60">{message.timestamp.toLocaleTimeString()}</p>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex gap-2 justify-start">
              <div className="bg-white border border-gray-200 text-gray-800 rounded-2xl px-4 py-2">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
                  <span
                    className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                    style={{ animationDelay: '0.1s' }}
                  ></span>
                  <span
                    className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                    style={{ animationDelay: '0.2s' }}
                  ></span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Suggested Questions */}
      {messages.length === 0 && (
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 mb-1">
            <MessageSquare className="w-4 h-4 text-blue-600" />
            <h4 className="font-semibold text-sm">Suggested Questions</h4>
          </div>
          <div className="grid gap-2">
            {suggestedQuestions.map((question, idx) => (
              <button
                key={idx}
                className="text-left text-sm p-3 rounded-lg bg-white border border-gray-200 hover:border-purple-300 hover:bg-purple-50 transition-colors"
              >
                {question}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
