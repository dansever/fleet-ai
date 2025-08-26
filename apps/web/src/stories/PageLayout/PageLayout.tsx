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
}

export const PageLayout: FC<PageLayoutProps> = ({
  sidebarContent = null,
  headerContent = null,
  mainContent,
  className,
  sidebarWidth = '20rem',
}) => {
  return (
    <div className={cn('flex flex-row h-screen', className)}>
      {/* Left Sidebar Panel - Only render if sidebarContent exists */}
      {sidebarContent && (
        <div
          className="border-r border-border bg-card flex flex-col overflow-hidden min-w-0 flex-shrink-0"
          style={{
            // Smooth width transition
            width: 'var(--sidebar-w)',
            transition: 'width 240ms ease',
            // Drive width via CSS var so React prop changes animate
            ['--sidebar-w' as string]: sidebarWidth,
            // Helps the browser plan for width changes
            willChange: 'width',
          }}
        >
          <div className="flex-1 overflow-y-auto">{sidebarContent}</div>
        </div>
      )}

      {/* Right Main Panel */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-4xl">
        {/* Fixed Header */}
        <div className="px-4 py-1.5 border-b border-border bg-card/50 backdrop-blur-sm flex items-center flex-shrink-0">
          {headerContent}
        </div>

        {/* Scrollable Main Content */}
        <div className="p-4 flex-1 overflow-y-auto bg-background">{mainContent}</div>
      </div>
    </div>
  );
};

PageLayout.displayName = 'PageLayout';
