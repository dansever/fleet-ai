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
      className="flex flex-col h-full overflow-hidden shrink-0" // fixed, never shrinks
      style={{
        width: 'var(--sidebar-w)',
        transition: 'width 240ms ease',
        ['--sidebar-w' as string]: sidebarWidth,
        willChange: 'width',
      }}
    >
      <div className="flex-1 overflow-y-auto">{sidebarContent}</div>
    </div>
  );

  return (
    <div className={cn('flex h-full min-h-0 w-full overflow-hidden gap-2', className)}>
      {/* Left Sidebar Panel */}
      {sidebarPosition === 'left' && sidebarElement}

      {/* Right panel takes remaining space and can shrink */}
      <ScrollArea className="flex-1 min-w-0 h-full">
        {/* Inner wrapper inside the ScrollArea viewport */}
        <div className="flex flex-col min-w-0 h-full gap-2">
          {headerContent && (
            <header className="p-2 sticky top-0 z-50 w-full shrink-0">
              <div className="px-2 py-1 rounded-xl backdrop-blur-sm supports-[backdrop-filter]:bg-white/20">
                {headerContent}
              </div>
            </header>
          )}
          {/* The only vertical scroller */}
          <main className="p-4 pt-2 flex-1 min-h-0 overflow-y-auto overflow-x-hidden">
            {mainContent}
          </main>
        </div>

        <ScrollBar orientation="vertical" className="" />
      </ScrollArea>

      {/* Render sidebar on right if position is 'right' */}
      {sidebarPosition === 'right' && sidebarElement}
    </div>
  );
};

PageLayout.displayName = 'PageLayout';
