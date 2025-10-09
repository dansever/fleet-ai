'use client';

import { Spinner } from '@/components/ui/spinner';
import { useCoAgentStateRender } from '@copilotkit/react-core';
import { Check } from 'lucide-react';
import { useTheme } from 'next-themes';

interface AgentState {
  toolSteps: {
    name: string;
    status: 'pending' | 'completed';
  }[];
}

// Map tool names to readable labels
const toolLabels: Record<string, string> = {
  getWeather: 'Getting weather information',
  webSearch: 'Searching the web',
  uomConvert: 'Converting units',
  currencyConvert: 'Converting currency',
};

export function ToolProgressIndicator() {
  const { theme } = useTheme();

  useCoAgentStateRender<AgentState>({
    name: 'assistant_agent',
    render: ({ state }) => {
      if (!state.toolSteps || state.toolSteps.length === 0) {
        return null;
      }

      return (
        <div className="flex mb-2">
          <div
            className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${
              theme === 'dark'
                ? 'bg-slate-800/80 border border-slate-700/50 text-slate-300'
                : 'bg-white/80 border border-gray-200 text-gray-700'
            }`}
          >
            {state.toolSteps.map((step, index) => {
              const isCompleted = step.status === 'completed';
              const label = toolLabels[step.name] || step.name;

              return (
                <div key={index} className="flex items-center gap-1.5">
                  {isCompleted ? <Check /> : <Spinner />}
                  <span className={isCompleted ? 'opacity-70' : 'font-medium'}>{label}</span>
                  {index < state.toolSteps.length - 1 && (
                    <span className="text-slate-400 mx-1">→</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      );
    },
  });

  return null;
}
