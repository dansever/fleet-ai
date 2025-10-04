import { StatusIndicator } from '@/components/miscellaneous/StatusIndicator';
import { SidebarProvider } from '@/components/ui/sidebar';
import { ReactNode } from 'react';
import { MainSidebar } from './_components/MainSidebar';

export default function PlatformLayout({ children }: { children: ReactNode }) {
  return (
    <SidebarProvider style={{ ['--sidebar-width' as string]: '12rem' }}>
      <MainSidebar variant="floating" />
      <main className="flex-1 min-w-0  h-screen overflow-hidden">
        {/* Pages Content */}
        {children}
        {/* Status Indicator */}
        <StatusIndicator />
      </main>
    </SidebarProvider>
  );
}
