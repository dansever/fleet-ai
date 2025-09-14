'use client';

import { CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Button } from '@/stories/Button/Button';
import { BaseCard } from '@/stories/Card/Card';
import { ModernTextarea } from '@/stories/Form/Form';
import { Bot, Copy, Loader2, Maximize2, Minimize2, User } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

// Types
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

export interface ChatBotConfig {
  // API Configuration
  apiEndpoint?: string;
  systemPrompt?: string;
  additionalContext?: Record<string, any>;

  // UI Configuration
  title?: string;
  subtitle?: string;
  placeholder?: string;
  assistantName?: string;
  userLabel?: string;

  // Behavior Configuration
  enableRetry?: boolean;
  enableClear?: boolean;
  enableCopy?: boolean;
  maxMessages?: number;
  autoFocus?: boolean;

  // Styling Configuration
  variant?: 'full' | 'component';
  theme?: 'default' | 'minimal' | 'rounded';
  accentColor?: string;

  // Event Handlers
  onMessageSent?: (message: ChatMessage) => void;
  onMessageReceived?: (message: ChatMessage) => void;
  onError?: (error: string) => void;
  onClear?: () => void;
}

export interface ChatBotProps {
  config: ChatBotConfig;
  initialMessages?: ChatMessage[];
  className?: string;
  disabled?: boolean;
  height?: string | number;
  width?: string | number;
}

// Default configuration
const DEFAULT_CONFIG: ChatBotConfig = {
  apiEndpoint: '/api/ai-chat/langchain',
  title: 'AI Assistant',
  subtitle: 'Ask me anything about your business',
  placeholder: 'Type your message... (Press Enter to send, Shift+Enter for new line)',
  assistantName: 'AI Assistant',
  userLabel: 'You',
  enableRetry: true,
  enableClear: true,
  enableCopy: true,
  maxMessages: 100,
  autoFocus: false,
  variant: 'component',
  theme: 'default',
};

export default function ChatBot({
  config: userConfig,
  initialMessages = [],
  className,
  disabled = false,
  height,
  width,
}: ChatBotProps) {
  // Merge user config with defaults
  const config = { ...DEFAULT_CONFIG, ...userConfig };

  // State management
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = useCallback(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'end',
      });
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Auto-focus input if enabled
  useEffect(() => {
    if (config.autoFocus && inputRef.current && !disabled) {
      inputRef.current.focus();
    }
  }, [config.autoFocus, disabled]);

  // Handle message submission
  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!input.trim() || isLoading || isStreaming || disabled) return;

      const userMessage: ChatMessage = {
        id: Date.now().toString(),
        role: 'user',
        content: input.trim(),
        timestamp: new Date(),
      };

      // Update messages and clear input
      setMessages((prev) => {
        const newMessages = [...prev, userMessage];
        // Enforce max messages limit
        if (config.maxMessages && newMessages.length > config.maxMessages) {
          return newMessages.slice(-config.maxMessages);
        }
        return newMessages;
      });
      setInput('');
      setIsLoading(true);
      setError(null);

      // Call onMessageSent callback
      config.onMessageSent?.(userMessage);

      try {
        const requestBody = {
          messages: [...messages, userMessage].map((msg) => ({
            role: msg.role,
            parts: [{ type: 'text', text: msg.content }],
          })),
          ...(config.systemPrompt && { systemPrompt: config.systemPrompt }),
          ...(config.additionalContext && { context: config.additionalContext }),
        };

        const response = await fetch(config.apiEndpoint!, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const reader = response.body?.getReader();
        if (!reader) {
          throw new Error('No response body');
        }

        const assistantMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: '',
          timestamp: new Date(),
        };

        let assistantMessageAdded = false;
        const decoder = new TextDecoder();
        let buffer = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.slice(6));
                if (data.type === 'text-delta' && data.textDelta) {
                  if (!assistantMessageAdded) {
                    setMessages((prev) => [...prev, assistantMessage]);
                    setIsLoading(false);
                    setIsStreaming(true);
                    assistantMessageAdded = true;
                  }

                  setMessages((prev) =>
                    prev.map((msg) =>
                      msg.id === assistantMessage.id
                        ? { ...msg, content: msg.content + data.textDelta }
                        : msg,
                    ),
                  );
                }
              } catch (e) {
                // Ignore malformed JSON
              }
            }
          }
        }

        // Call onMessageReceived callback
        if (assistantMessageAdded) {
          config.onMessageReceived?.(assistantMessage);
        }
      } catch (error) {
        console.error('Chat error:', error);
        const errorMessage = 'Failed to send message. Please try again.';
        setError(errorMessage);
        config.onError?.(errorMessage);

        // Remove the failed assistant message if it was added but has no content
        setMessages((prev) =>
          prev.filter(
            (msg) => msg.role === 'user' || (msg.role === 'assistant' && msg.content.length > 0),
          ),
        );
      } finally {
        setIsLoading(false);
        setIsStreaming(false);
      }
    },
    [input, isLoading, isStreaming, disabled, messages, config],
  );

  // Handle keyboard shortcuts
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSubmit(e);
      }
    },
    [handleSubmit],
  );

  // Utility functions
  const retryLastMessage = useCallback(() => {
    if (messages.length >= 1) {
      const lastUserMessage = messages.filter((m) => m.role === 'user').pop();
      if (lastUserMessage) {
        setInput(lastUserMessage.content);
        setError(null);
      }
    }
  }, [messages]);

  const clearChat = useCallback(() => {
    setMessages([]);
    setError(null);
    config.onClear?.();
  }, [config]);

  const copyMessage = useCallback((content: string) => {
    navigator.clipboard.writeText(content);
    toast.info('Copied to clipboard');
  }, []);

  // Variant-specific styling helpers
  const getContainerClasses = () => {
    const base = 'flex flex-col h-full';

    switch (config.variant) {
      case 'full':
        return cn(base, 'min-h-screen');
      case 'component':
      default:
        return cn(base, 'h-96');
    }
  };

  const getMessagesClasses = () => {
    const base = 'flex-1 overflow-y-auto px-4';

    switch (config.variant) {
      case 'full':
        return cn(base, 'max-w-4xl mx-auto');
      case 'component':
      default:
        return cn(base);
    }
  };

  const getInputAreaClasses = () => {
    switch (config.variant) {
      case 'full':
        return 'px-4 pb-4 max-w-4xl mx-auto w-full';
      case 'component':
      default:
        return 'px-4 pb-4';
    }
  };

  // Empty state component
  const EmptyState = () => (
    <div className="flex h-full items-center justify-center text-center p-6">
      <div className="max-w-md space-y-4">
        <Bot
          className={cn(
            'mx-auto text-muted-foreground',
            config.variant === 'component' ? 'h-12 w-12' : 'h-16 w-16',
          )}
        />
        <div className="space-y-2">
          <h3
            className={cn('font-semibold', config.variant === 'component' ? 'text-lg' : 'text-xl')}
          >
            {config.title}
          </h3>
          <p
            className={cn(
              'text-muted-foreground',
              config.variant === 'component' ? 'text-sm' : 'text-base',
            )}
          >
            {config.subtitle}
          </p>
        </div>
      </div>
    </div>
  );

  // Message component (memoized for performance)
  const MessageBubble = useCallback(
    ({ message }: { message: ChatMessage }) => (
      <div
        className={cn(
          'flex gap-3 w-full',
          message.role === 'user' ? 'flex-row-reverse' : 'flex-row',
        )}
      >
        {/* Avatar */}
        <div
          className={cn(
            'flex h-8 w-8 shrink-0 items-center justify-center rounded-full',
            message.role === 'user' ? 'bg-primary' : 'bg-white',
          )}
        >
          {message.role === 'user' ? (
            <User className="h-4 w-4 text-primary-foreground" />
          ) : (
            <Bot className="h-4 w-4 text-muted-foreground" />
          )}
        </div>

        {/* Message content */}
        <div
          className={cn(
            'flex-1 space-y-2 rounded-2xl px-4 py-3',
            message.role === 'user'
              ? 'max-w-[70%] bg-primary text-primary-foreground ml-8'
              : 'bg-white border border-green-500 text-foreground mr-8',
            config.theme === 'minimal' && 'rounded-lg',
            config.theme === 'rounded' && 'rounded-3xl',
          )}
        >
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  'font-medium',
                  config.variant === 'component' ? 'text-sm' : 'text-base',
                )}
              >
                {message.role === 'user' ? config.userLabel : config.assistantName}
              </span>
              <span className={cn('opacity-70 text-xs')}>
                {message.timestamp.toLocaleTimeString()}
              </span>
            </div>
            {config.enableCopy && (
              <Copy
                className="h-4 w-4 hover:cursor-pointer hover:scale-105 transition-all opacity-70 hover:opacity-100"
                onClick={() => copyMessage(message.content)}
              />
            )}
          </div>

          {/* Content */}
          <div
            className={cn(
              'leading-relaxed whitespace-pre-wrap',
              config.variant === 'component' ? 'text-sm' : 'text-base',
            )}
          >
            {message.content}
          </div>
        </div>
      </div>
    ),
    [
      config.variant,
      config.theme,
      config.enableCopy,
      config.userLabel,
      config.assistantName,
      copyMessage,
    ],
  );

  // Prepare BaseCard props
  const cardTitle = config.variant === 'full' ? undefined : config.title;
  const cardSubtitle = config.variant === 'full' ? undefined : config.subtitle;
  const cardActions =
    config.variant === 'full' ? undefined : (
      <div className="flex items-center gap-2">
        {config.enableClear && messages.length > 0 && (
          <Button intent="ghost" size="sm" text="Clear" onClick={clearChat} />
        )}
        {config.variant === 'component' && (
          <Button
            intent="ghost"
            size="sm"
            icon={isExpanded ? Minimize2 : Maximize2}
            onClick={() => setIsExpanded(!isExpanded)}
          />
        )}
      </div>
    );

  const chatContent = (
    <CardContent
      className={cn(getContainerClasses())}
      style={{
        height: height,
        width: width,
        ...(config.accentColor && ({ '--accent': config.accentColor } as any)),
      }}
    >
      {/* Messages Area */}
      <div className={getMessagesClasses()}>
        {messages.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="space-y-6 py-4">
            {messages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))}

            {/* Loading indicator */}
            {isLoading && !isStreaming && (
              <div className="flex gap-3 w-full">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted">
                  <Bot className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="flex-1 space-y-2 rounded-2xl px-4 py-3 bg-muted mr-8">
                  <div
                    className={cn(
                      'font-medium',
                      config.variant === 'component' ? 'text-sm' : 'text-base',
                    )}
                  >
                    {config.assistantName}
                  </div>
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span
                      className={cn(
                        'text-muted-foreground',
                        config.variant === 'component' ? 'text-sm' : 'text-base',
                      )}
                    >
                      Thinking...
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Error Display */}
      {error && (
        <div className="px-4 py-2 bg-destructive/10 border-t border-destructive/20">
          <div className="flex items-center justify-between">
            <p className="text-sm text-destructive">{error}</p>
            {config.enableRetry && (
              <Button intent="ghost" size="sm" text="Retry" onClick={retryLastMessage} />
            )}
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className={getInputAreaClasses()}>
        <form onSubmit={handleSubmit} className="flex gap-2">
          <div className="flex-1">
            <ModernTextarea
              ref={inputRef}
              value={input}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isLoading || isStreaming || disabled}
              placeholder={config.placeholder}
              className={config.variant === 'component' ? 'text-sm' : ''}
              aria-label="Chat message input"
              rows={3}
            />
          </div>
          <Button
            disabled={isLoading || isStreaming || !input.trim() || disabled}
            intent="primary"
            text={isLoading || isStreaming ? 'Sending...' : 'Send'}
            onClick={handleSubmit}
            size={config.variant === 'component' ? 'sm' : 'md'}
          />
        </form>
      </div>
    </CardContent>
  );

  // Return BaseCard wrapper for component variant, direct content for full variant
  if (config.variant === 'full') {
    return (
      <div className={cn('h-full min-h-screen bg-background', className)}>
        {/* Full page header */}
        <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
          <div className="max-w-4xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold">{config.title}</h1>
                {config.subtitle && <p className="text-muted-foreground">{config.subtitle}</p>}
              </div>
              {config.enableClear && messages.length > 0 && (
                <Button intent="ghost" size="sm" text="Clear Chat" onClick={clearChat} />
              )}
            </div>
          </div>
        </div>
        <div className="flex-1 relative">{chatContent}</div>
      </div>
    );
  }

  return (
    <BaseCard
      className={cn(isExpanded ? 'h-[600px]' : 'h-120', className)}
      title={cardTitle}
      subtitle={cardSubtitle}
      actions={cardActions}
    >
      {chatContent}
    </BaseCard>
  );
}
