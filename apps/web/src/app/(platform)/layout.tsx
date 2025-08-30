import { SidebarProvider } from '@/components/ui/sidebar';
import { ReactNode } from 'react';
import { AppSidebar } from './_components/AppSidebar';

export default function PlatformLayout({ children }: { children: ReactNode }) {
  return (
    <SidebarProvider style={{ ['--sidebar-width' as string]: '12rem' }}>
      <AppSidebar variant="sidebar" />
      <main className="flex-1 overflow-hidden">{children}</main>
    </SidebarProvider>
  );
}
