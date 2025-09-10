import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import type { FC, ReactNode } from 'react';

export interface PageLayoutProps {
  /** Content for the left sidebar panel - if null/undefined, sidebar won't be rendered */
  sidebarContent?: ReactNode;
  /** Header content for the main panel */
  headerContent?: ReactNode;
  /** Main scrollable content */
  mainContent?: ReactNode;
  /** Custom className for the root container */
  className?: string;
  /** Width of the sidebar (default: 20rem) */
  sidebarWidth?: string;
  /** Position of the sidebar (default: left) */
  sidebarPosition?: 'left' | 'right';
}

export const PageLayout: FC<PageLayoutProps> = ({
  sidebarContent = null,
  headerContent = null,
  mainContent,
  className,
  sidebarWidth = '20rem',
  sidebarPosition = 'left',
}) => {
  const sidebarElement = sidebarContent && (
    <div
      className="flex bg-transparent flex-col overflow-hidden min-w-0 flex-shrink-0"
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
  );

  return (
    <div className={cn('flex flex-row h-screen gap-2', className)}>
      {/* Left Sidebar Panel */}
      {sidebarPosition === 'left' && sidebarElement}

      {/* Right Main Panel */}
      <ScrollArea className="px-2 pb-2 flex-1 min-w-0 flex flex-col gap-2">
        {/* Fixed Header */}
        {headerContent && (
          <header className="p-2 sticky top-0 z-50 w-full">
            <div className="px-2 py-1 rounded-xl backdrop-blur supports-[backdrop-filter]:bg-white/40">
              {headerContent}
            </div>
          </header>
        )}

        {/* Scrollable Main Content */}
        <main className="px-4 py-2 flex-1">{mainContent}</main>
        <ScrollBar orientation="vertical" className="" />
      </ScrollArea>

      {/* Render sidebar on right if position is 'right' */}
      {sidebarPosition === 'right' && sidebarElement}
    </div>
  );
};

PageLayout.displayName = 'PageLayout';
