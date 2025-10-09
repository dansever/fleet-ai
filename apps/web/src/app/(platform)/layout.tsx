// src/app/(platform)/layout.tsx

import { SidebarProvider } from '@/components/ui/sidebar';
import { AuthProvider } from '@/lib/authorization/auth-context';
import { authenticateUser } from '@/lib/authorization/authenticate-user';
import { CopilotKit } from '@copilotkit/react-core';
import '@copilotkit/react-ui/styles.css';
import { cookies } from 'next/headers';
import { ReactNode } from 'react';
import { CopilotSidebarWrapper } from './_components/copilot/CopilotWrapper';
import { AppSidebar } from './_components/sidebar/AppSidebar';

export default async function PlatformLayout({ children }: { children: ReactNode }) {
  // Authenticate user ONCE at the layout level
  // This result is shared with all child pages via AuthProvider
  const { dbUser, orgId, error } = await authenticateUser();
  if (error || !dbUser || !orgId) {
    return <div>Error: {error}</div>;
  }

  // CopilotKit API Key - used to authenticate the CopilotKit API requests
  const copilotKitApiKey = process.env.COPILOTKIT_API_KEY;
  // CopilotKit Runtime URL - used to authenticate the CopilotKit API requests
  const copilotKitRuntimeUrl = 'api/copilotkit';

  // Pass cookies for SSR (Server Side Rendering)
  // These cookies are used to store the sidebar state
  const cookieStore = await cookies();
  const cookieString = cookieStore.toString();

  return (
    <AuthProvider dbUser={dbUser} orgId={orgId}>
      <SidebarProvider
        style={{ ['--sidebar-width' as string]: '12rem' }}
        cookieString={cookieString}
      >
        <AppSidebar variant="sidebar" dbUser={dbUser} props={{}} />
        <CopilotKit
          publicApiKey={copilotKitApiKey}
          runtimeUrl={copilotKitRuntimeUrl}
          showDevConsole={false}
          agent={'assistant_agent'}
        >
          <main className="flex-1 min-w-0 h-screen overflow-hidden">{children}</main>
          <CopilotSidebarWrapper />
        </CopilotKit>
      </SidebarProvider>
    </AuthProvider>
  );
}
