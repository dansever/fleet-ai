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
  mainContent = null,
  className,
  sidebarWidth = '20rem',
}) => {
  return (
    <div className={cn('flex flex-row h-screen', className)}>
      {/* Left Sidebar Panel - Only render if sidebarContent exists */}
      {sidebarContent && (
        <div
          className="bg-card flex flex-col overflow-hidden min-w-0 flex-shrink-0"
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
      <div className="flex-1 min-w-4xl min-h-0 flex flex-col overflow-y-auto px-2">
        {/* Sticky header that remains in flow */}
        <header className="sticky top-0 z-20 mx-2">
          {/* Put spacing/rounding on an inner wrapper, not the sticky itself */}
          <div
            className="mt-2 mx-2 rounded-2xl p-2
                    backdrop-blur-sm supports-[backdrop-filter]:bg-white/40"
          >
            {headerContent}
          </div>
        </header>

        {/* Main fills remaining height and starts below header */}
        <main className="flex-1">
          <div className="px-2">{mainContent}</div>
        </main>
      </div>
    </div>
  );
};

PageLayout.displayName = 'PageLayout';
