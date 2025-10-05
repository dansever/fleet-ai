import { StatusIndicator } from '@/components/miscellaneous/StatusIndicator';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AuthProvider } from '@/lib/authorization/auth-context';
import { authenticateUser } from '@/lib/authorization/authenticate-user';
import { CopilotKit } from '@copilotkit/react-core';
import '@copilotkit/react-ui/styles.css';
import { ReactNode } from 'react';
import { MainSidebar } from './_components/MainSidebar';

export default async function PlatformLayout({ children }: { children: ReactNode }) {
  // Authenticate user ONCE at the layout level
  // This result is shared with all child pages via AuthProvider
  const { dbUser, orgId, error } = await authenticateUser();
  if (error || !dbUser || !orgId) {
    return <div>Error: {error}</div>;
  }

  const copilotKitApiKey = process.env.COPILOTKIT_API_KEY;
  const copilotKitRuntimeUrl = 'api/copilotkit';

  return (
    <AuthProvider dbUser={dbUser} orgId={orgId}>
      <SidebarProvider style={{ ['--sidebar-width' as string]: '12rem' }}>
        <MainSidebar variant="sidebar" dbUser={dbUser} />
        <CopilotKit publicApiKey={copilotKitApiKey} runtimeUrl={copilotKitRuntimeUrl}>
          <main className="flex-1 min-w-0 h-screen overflow-hidden">
            {children}
            <StatusIndicator />
          </main>
        </CopilotKit>
      </SidebarProvider>
    </AuthProvider>
  );
}
