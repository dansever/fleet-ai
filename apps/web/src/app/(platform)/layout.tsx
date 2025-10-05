import { StatusIndicator } from '@/components/miscellaneous/StatusIndicator';
import { SidebarProvider } from '@/components/ui/sidebar';
import { CopilotKit } from '@copilotkit/react-core';
import '@copilotkit/react-ui/styles.css';
import { ReactNode } from 'react';
import { MainSidebar } from './_components/MainSidebar';

export default function PlatformLayout({ children }: { children: ReactNode }) {
  // const copilotKitRuntimeUrl = 'api/ai-chat/langchain';
  const copilotKitApiKey = process.env.COPILOTKIT_API_KEY;
  const copilotKitRuntimeUrl = 'api/copilotkit';
  return (
    <SidebarProvider style={{ ['--sidebar-width' as string]: '12rem' }}>
      <MainSidebar variant="sidebar" />
      <CopilotKit publicApiKey={copilotKitApiKey} runtimeUrl={copilotKitRuntimeUrl}>
        <main className="flex-1 min-w-0  h-screen overflow-hidden">
          {children}
          <StatusIndicator />
        </main>
      </CopilotKit>
    </SidebarProvider>
  );
}
