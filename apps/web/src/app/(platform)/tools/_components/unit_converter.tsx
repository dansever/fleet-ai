'use client';

import { Button } from '@/stories/Button/Button';
import { useRef, useState } from 'react';

interface StreamResponse {
  status: 'processing' | 'converting' | 'completed' | 'error';
  message?: string;
  result?: any;
  error?: string;
  timestamp?: string;
}

export default function UomTester() {
  const [input, setInput] = useState('');
  const [streamingText, setStreamingText] = useState('');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const handleConvert = async () => {
    if (!input.trim()) return;

    setLoading(true);
    setError(null);
    setStreamingText('');
    setResult(null);

    // Cancel any existing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();

    try {
      const response = await fetch('/api/convert/stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ input }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No response body');
      }

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
            const dataContent = line.slice(6);

            // Check for completion signal
            if (dataContent === '[DONE]') {
              setLoading(false);
              setStreamingText('');
              break;
            }

            try {
              const data: StreamResponse = JSON.parse(dataContent);

              if (data.status === 'processing' || data.status === 'converting') {
                setStreamingText(data.message || 'Processing...');
              } else if (data.status === 'completed' && data.result) {
                setStreamingText('Conversion completed!');
                setResult(data.result);
              } else if (data.status === 'error') {
                setError(data.error || 'Conversion failed');
              }
            } catch (parseError) {
              console.warn('Failed to parse SSE data:', parseError);
            }
          }
        }
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        setError(err.message || 'Conversion failed');
      }
      setLoading(false);
    } finally {
      abortControllerRef.current = null;
    }
  };

  const handleStop = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setLoading(false);
      setStreamingText('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !loading) {
      handleConvert();
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Conversion Agent Tester</h1>
        <p className="text-gray-600 mb-6">
          Test currency and unit conversions with real-time streaming responses
        </p>

        <div className="space-y-4">
          <div className="flex gap-3">
            <input
              type="text"
              placeholder="e.g., Convert 12.5 ft to meters, 100 USD to EUR, 25°C to Fahrenheit"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={loading}
            />
            <Button
              onClick={loading ? handleStop : handleConvert}
              disabled={!input.trim() || loading}
              intent={'primary'}
              isLoading={loading}
              size="lg"
              text={loading ? 'Stop' : 'Convert'}
            />
          </div>

          {streamingText && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-500 border-t-transparent"></div>
                <span className="text-blue-700 font-medium">{streamingText}</span>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <div className="text-red-500">⚠️</div>
                <span className="text-red-700 font-medium">{error}</span>
              </div>
            </div>
          )}

          {result && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="text-green-800 font-semibold mb-2">Conversion Result:</h3>
              <pre
                style={{
                  marginTop: '1rem',
                  background: '#f4f4f4',
                  padding: '1rem',
                  borderRadius: '6px',
                  maxHeight: '300px',
                  overflow: 'auto', // adds scrollbars
                  whiteSpace: 'pre-wrap', // allows wrapping
                  wordBreak: 'break-word',
                }}
              >
                {(() => {
                  try {
                    if (typeof result === 'string') {
                      // Try to parse as JSON first
                      const parsed = JSON.parse(result);
                      return JSON.stringify(parsed, null, 2);
                    }
                    return JSON.stringify(result, null, 2);
                  } catch (parseError) {
                    // If it's not valid JSON, just display as string
                    return result;
                  }
                })()}
              </pre>
            </div>
          )}
        </div>

        <div className="mt-8 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-semibold text-gray-800 mb-2">Example Conversions:</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
            <div>• 12.5 feet to meters</div>
            <div>• 100 USD to EUR</div>
            <div>• 25°C to Fahrenheit</div>
            <div>• 5 kilograms to pounds</div>
            <div>• 2.5 liters to gallons</div>
            <div>• 50 mph to km/h</div>
          </div>
        </div>
      </div>
    </div>
  );
}
