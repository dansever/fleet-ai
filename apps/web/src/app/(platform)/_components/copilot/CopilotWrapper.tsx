'use client';

import { ToolProgressIndicator } from '@/agents/assistant/ToolProgressIndicator';
import {
  AssistantMessageStyle,
  HeaderStyle,
  UserMessageStyle,
} from '@/app/(platform)/_components/copilot/CopilotStyles';
import {
  CopilotChatSuggestion,
  CopilotKitCSSProperties,
  CopilotSidebar,
  RenderSuggestion,
  RenderSuggestionsListProps,
} from '@copilotkit/react-ui';
import '@copilotkit/react-ui/styles.css';

export function CopilotSidebarWrapper() {
  return (
    <div
      style={
        {
          '--copilot-kit-primary-color': 'var(--color-primary)',
          '--copilot-kit-contrast-color': 'white',
        } as CopilotKitCSSProperties
      }
    >
      <ToolProgressIndicator />
      <CopilotSidebar
        clickOutsideToClose={false}
        Header={HeaderStyle}
        AssistantMessage={AssistantMessageStyle}
        UserMessage={UserMessageStyle}
        // suggestions="auto"
        observabilityHooks={{
          onChatExpanded: () => {
            console.log('Popup opened');
          },
          onChatMinimized: () => {
            console.log('Popup closed');
          },
        }}
        onThumbsUp={() => {
          console.log('Thumbs up');
        }}
        onThumbsDown={() => {
          console.log('Thumbs down');
        }}
        instructions={
          'You are assisting the user as best as you can. Answer in the best way possible given the data you have.'
        }
        labels={{
          title: 'FleetAI AI Assistant',
          initial: 'Hi! 👋 How can I assist you today?',
          stopGenerating: 'Stop',
          regenerateResponse: 'Regenerate',
        }}
        inputFileAccept=".pdf,.doc,.docx"
        RenderSuggestionsList={SuggestionsList}
      />
    </div>
  );
}

const SuggestionsList = ({ suggestions, onSuggestionClick }: RenderSuggestionsListProps) => {
  return (
    <div className="suggestions flex flex-col gap-2 p-4">
      <h1>Try asking:</h1>
      <div className="flex gap-2">
        {suggestions.map((suggestion: CopilotChatSuggestion, index) => (
          <RenderSuggestion
            key={index}
            title={suggestion.title}
            message={suggestion.message}
            partial={suggestion.partial}
            className="rounded-md border border-gray-500 bg-white px-2 py-1 shadow-md"
            onClick={() => onSuggestionClick(suggestion.message)}
          />
        ))}
      </div>
    </div>
  );
};
