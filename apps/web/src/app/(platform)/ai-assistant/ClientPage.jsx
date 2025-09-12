import { PageLayout } from '@/stories/PageLayout/PageLayout';
import { Bot } from 'lucide-react';
import ChatWindow from './_components/ChatWindow';

export default function AIAssistantClientPage() {
  return (
    <PageLayout sidebarContent={null} headerContent={<Header />} mainContent={<ChatWindow />} />
  );
}

const Header = () => {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary">
          <Bot className="h-4 w-4 text-primary-foreground" />
        </div>
        <div>
          <h2 className="text-lg font-semibold">FleetAI Assistant</h2>
          <p className="text-sm text-muted-foreground">
            Powered by LangChain • Ready for RAG & Agents
          </p>
        </div>
      </div>
    </div>
  );
};
