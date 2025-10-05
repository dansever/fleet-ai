import { StatusIndicator } from '@/components/miscellaneous/StatusIndicator';
import { SidebarProvider } from '@/components/ui/sidebar';
import { CopilotKit } from '@copilotkit/react-core';
import { ReactNode } from 'react';
import { MainSidebar } from './_components/MainSidebar';

export default function PlatformLayout({ children }: { children: ReactNode }) {
  // const copilotKitRuntimeUrl = 'api/ai-chat/langchain';
  const copilotKitApiKey = process.env.COPILOTKIT_API_KEY;
  return (
    <SidebarProvider style={{ ['--sidebar-width' as string]: '12rem' }}>
      <MainSidebar variant="sidebar" />
      <CopilotKit publicApiKey={copilotKitApiKey} agent="fleet-ai-assistant">
        <main className="flex-1 min-w-0  h-screen overflow-hidden">
          {/* Pages Content */}
          {children}
          {/* Status Indicator */}
          <StatusIndicator />
        </main>
      </CopilotKit>
    </SidebarProvider>
  );
}
