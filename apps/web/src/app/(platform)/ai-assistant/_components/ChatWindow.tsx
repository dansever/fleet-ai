'use client';

import { cn } from '@/lib/utils';
import { Button } from '@/stories/Button/Button';
import { ModernTextarea } from '@/stories/Form/Form';
import { Bot, Loader2, User } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export default function ChatWindow() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive - ChatGPT style
  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'end',
      });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/ai-chat/langchain', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [...messages, userMessage].map((msg) => ({
            role: msg.role,
            parts: [{ type: 'text', text: msg.content }],
          })),
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No response body');
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: '',
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);

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
    } catch (error) {
      console.error('Chat error:', error);
      setError('Failed to send message. Please try again.');
      // Remove the failed assistant message if it was added
      setMessages((prev) => prev.filter((msg) => msg.role === 'user' || msg.content.length > 0));
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const retryLastMessage = () => {
    if (messages.length >= 1) {
      const lastUserMessage = messages.filter((m) => m.role === 'user').pop();
      if (lastUserMessage) {
        setInput(lastUserMessage.content);
        setError(null);
      }
    }
  };

  const clearChat = () => {
    setMessages([]);
    setError(null);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Chat Messages Area - Scrollable */}
      <div className="flex-1 overflow-y-auto">
        {messages.length === 0 ? (
          <div className="flex h-full min-h-[400px] items-center justify-center text-center p-6">
            <div className="max-w-md space-y-4">
              <Bot className="mx-auto h-16 w-16 text-muted-foreground" />
              <div className="space-y-2">
                <h3 className="text-xl font-semibold">Welcome to FleetAI Assistant</h3>
                <p className="text-muted-foreground">
                  I'm here to help you with aviation, fleet management, and logistics questions.
                  Start a conversation below!
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6 p-6 pb-25">
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  'flex gap-4 max-w-4xl mx-auto',
                  message.role === 'user' ? 'flex-row-reverse' : 'flex-row',
                )}
              >
                <div
                  className={cn(
                    'flex h-8 w-8 shrink-0 items-center justify-center rounded-full',
                    message.role === 'user' ? 'bg-primary' : 'bg-secondary',
                  )}
                >
                  {message.role === 'user' ? (
                    <User className="h-4 w-4 text-primary-foreground" />
                  ) : (
                    <Bot className="h-4 w-4 text-secondary-foreground" />
                  )}
                </div>

                <div
                  className={cn(
                    'flex-1 space-y-2 rounded-2xl px-4 py-3 max-w-[80%]',
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground ml-12'
                      : 'bg-muted text-foreground mr-12',
                  )}
                >
                  <div className="text-sm font-medium">
                    {message.role === 'user' ? 'You' : 'FleetAI Assistant'}
                  </div>
                  <div className="text-sm leading-relaxed whitespace-pre-wrap">
                    {message.content}
                  </div>
                  <div className="text-xs opacity-70">{message.timestamp.toLocaleTimeString()}</div>
                </div>
              </div>
            ))}

            {/* Loading indicator */}
            {isLoading && (
              <div className="flex gap-4 max-w-4xl mx-auto">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted border">
                  <Bot className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="flex-1 space-y-2 rounded-2xl px-4 py-3 bg-muted mr-12">
                  <div className="text-sm font-medium">FleetAI Assistant</div>
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm text-muted-foreground">Thinking...</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area - Fixed at Bottom with Proper Centering */}
      <div className="absolute bottom-8 left-0 right-0 backdrop-blur-sm p-0=">
        <div className="max-w-4xl mx-auto">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <div className="flex-1">
              <ModernTextarea
                value={input}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isLoading}
                placeholder="Message FleetAI Assistant... (Press Enter to send, Shift+Enter for new line)"
              />
            </div>
            <Button
              disabled={isLoading || !input.trim()}
              intent="primary"
              text={isLoading ? 'Sending...' : 'Send'}
              onClick={handleSubmit}
              className="shrink-0"
            />
          </form>
        </div>
      </div>
    </div>
  );
}
