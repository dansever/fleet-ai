'use client';

import { cn } from '@/lib/utils';
import { Button } from '@/stories/Button/Button';
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
  variant?: 'full-page' | 'component' | 'sidebar' | 'compact';
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

        // Remove the failed assistant message if it was added
        setMessages((prev) => prev.filter((msg) => msg.role === 'user' || msg.content.length > 0));
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
    const base = 'flex flex-col bg-white';

    switch (config.variant) {
      case 'full-page':
        return cn(base, 'h-full min-h-screen');
      case 'sidebar':
        return cn(base, 'h-full max-h-screen border-l');
      case 'compact':
        return cn(base, 'h-64 border rounded-2xl');
      case 'component':
      default:
        return cn(base, 'h-120 border rounded-2xl');
    }
  };

  const getMessagesClasses = () => {
    const base = 'flex-1 overflow-y-auto';

    switch (config.variant) {
      case 'full-page':
        return cn(base);
      case 'sidebar':
        return cn(base, 'px-2');
      case 'compact':
        return cn(base, 'px-3');
      case 'component':
      default:
        return cn(base, 'px-4');
    }
  };

  const getInputAreaClasses = () => {
    switch (config.variant) {
      case 'full-page':
        return 'absolute bottom-8 left-0 right-0';
      case 'sidebar':
        return 'border-t p-2';
      case 'compact':
        return 'border-t p-2';
      case 'component':
      default:
        return 'px-2 pb-2';
    }
  };

  const getMaxWidth = () => {
    switch (config.variant) {
      case 'full-page':
        return 'max-w-4xl mx-auto';
      case 'sidebar':
        return 'w-full';
      case 'compact':
        return 'w-full';
      case 'component':
      default:
        return 'w-full';
    }
  };

  // Empty state component
  const EmptyState = () => (
    <div className="flex h-full items-center justify-center text-center p-6">
      <div className="max-w-md space-y-4">
        <Bot
          className={cn(
            'mx-auto text-muted-foreground',
            config.variant === 'compact' ? 'h-8 w-8' : 'h-16 w-16',
          )}
        />
        <div className="space-y-2">
          <h3 className={cn('font-semibold', config.variant === 'compact' ? 'text-sm' : 'text-xl')}>
            {config.title}
          </h3>
          <p
            className={cn(
              'text-muted-foreground',
              config.variant === 'compact' ? 'text-xs' : 'text-sm',
            )}
          >
            {config.subtitle}
          </p>
        </div>
      </div>
    </div>
  );

  // Message component
  const MessageBubble = ({ message }: { message: ChatMessage }) => (
    <div
      className={cn(
        'flex gap-3',
        config.variant === 'full-page' ? 'max-w-4xl mx-auto' : 'w-full',
        message.role === 'user' ? 'flex-row-reverse' : 'flex-row',
      )}
    >
      {/* Avatar */}
      <div
        className={cn(
          'flex h-8 w-8 shrink-0 items-center justify-center rounded-full',
          message.role === 'user' ? 'bg-primary' : 'bg-muted',
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
            : 'bg-muted text-foreground mr-8',
          config.theme === 'minimal' && 'rounded-lg',
          config.theme === 'rounded' && 'rounded-3xl',
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span
              className={cn('font-medium', config.variant === 'compact' ? 'text-xs' : 'text-sm')}
            >
              {message.role === 'user' ? config.userLabel : config.assistantName}
            </span>
            <span
              className={cn('opacity-70', config.variant === 'compact' ? 'text-xs' : 'text-xs')}
            >
              {message.timestamp.toLocaleTimeString()}
            </span>
          </div>
          {config.enableCopy && (
            <Copy
              className={cn(
                'h-4 w-4 hover:cursor-pointer hover:scale-105 transition-all opacity-70 hover:opacity-100',
                config.variant === 'compact' && 'h-3 w-3',
              )}
              onClick={() => copyMessage(message.content)}
            />
          )}
        </div>

        {/* Content */}
        <div
          className={cn(
            'leading-relaxed whitespace-pre-wrap',
            config.variant === 'compact' ? 'text-xs' : 'text-sm',
          )}
        >
          {message.content}
        </div>
      </div>
    </div>
  );

  return (
    <div
      className={cn(getContainerClasses(), className)}
      style={{
        height: height,
        width: width,
        ...(config.accentColor && ({ '--accent': config.accentColor } as any)),
      }}
    >
      {/* Header (for non-full-page variants) */}
      {config.variant !== 'full-page' && (
        <div className="flex items-center justify-between p-2 border-b">
          <div>
            <h3 className="font-semibold">{config.title}</h3>
            {config.subtitle && <p className="text-sm text-muted-foreground">{config.subtitle}</p>}
          </div>
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
        </div>
      )}

      {/* Messages Area */}
      <div className={getMessagesClasses()}>
        {messages.length === 0 ? (
          <EmptyState />
        ) : (
          <div className={cn('space-y-6 py-4', config.variant === 'compact' && 'space-y-3 py-2')}>
            {messages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))}

            {/* Loading indicator */}
            {isLoading && !isStreaming && (
              <div
                className={cn(
                  'flex gap-3',
                  config.variant === 'full-page' ? 'max-w-4xl mx-auto' : 'w-full',
                )}
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted">
                  <Bot className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="flex-1 space-y-2 rounded-2xl px-4 py-3 bg-muted mr-8">
                  <div
                    className={cn(
                      'font-medium',
                      config.variant === 'compact' ? 'text-xs' : 'text-sm',
                    )}
                  >
                    {config.assistantName}
                  </div>
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span
                      className={cn(
                        'text-muted-foreground',
                        config.variant === 'compact' ? 'text-xs' : 'text-sm',
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
      <div className={cn(getInputAreaClasses(), config.variant === 'full-page' && getMaxWidth())}>
        <form onSubmit={handleSubmit} className="flex gap-2">
          <div className="flex-1">
            <ModernTextarea
              ref={inputRef}
              value={input}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isLoading || isStreaming || disabled}
              placeholder={config.placeholder}
              className={config.variant === 'compact' ? 'text-sm' : ''}
            />
          </div>
          <Button
            disabled={isLoading || isStreaming || !input.trim() || disabled}
            intent="primary"
            text={isLoading || isStreaming ? 'Sending...' : 'Send'}
            onClick={handleSubmit}
            size={config.variant === 'compact' ? 'sm' : 'md'}
          />
        </form>
      </div>
    </div>
  );
}
