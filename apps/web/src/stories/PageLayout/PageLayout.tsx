import { cn } from '@/lib/utils';
import type { FC, ReactNode } from 'react';

export interface PageLayoutProps {
  /** Content for the left sidebar panel - if null/undefined, sidebar won't be rendered */
  sidebarContent?: ReactNode;
  /** Header content for the main panel */
  headerContent: ReactNode;
  /** Main scrollable content */
  mainContent: ReactNode;
  /** Custom className for the root container */
  className?: string;
  /** Width of the sidebar (default: 20rem) */
  sidebarWidth?: string;
  /** Height of the header (default: 4rem) */
  headerHeight?: string;
}

export const PageLayout: FC<PageLayoutProps> = ({
  sidebarContent = null,
  headerContent = null,
  mainContent,
  className,
  sidebarWidth = '20rem',
  headerHeight = '4rem',
}) => {
  return (
    <div className={cn('flex h-screen', className)}>
      {/* Left Sidebar Panel - Only render if sidebarContent exists */}
      {sidebarContent && (
        <div
          className="border-r border-border bg-card flex flex-col"
          style={{ width: sidebarWidth }}
        >
          <div className="flex-1 overflow-y-auto">{sidebarContent}</div>
        </div>
      )}

      {/* Right Main Panel */}
      <div className="flex-1 flex flex-col">
        {/* Fixed Header */}
        <div
          className="p-4 border-b border-border bg-card/50 backdrop-blur-sm flex items-center"
          style={{ height: headerHeight }}
        >
          {headerContent}
        </div>

        {/* Scrollable Main Content */}
        <div className="p-4 flex-1 overflow-y-auto bg-background">{mainContent}</div>
      </div>
    </div>
  );
};

PageLayout.displayName = 'PageLayout';
