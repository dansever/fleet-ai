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
    <div className={cn('flex flex-row h-screen', className)}>
      {/* Left Sidebar Panel */}
      {sidebarPosition === 'left' && sidebarElement}

      {/* Right Main Panel */}
      <div className="flex-1 flex flex-col gap-2 overflow-hidden min-w-4xl">
        {/* Fixed Header */}
        <header className="px-4 py-2 flex items-center flex-shrink-0">{headerContent}</header>

        {/* Scrollable Main Content */}
        <main className="px-4 flex-1 overflow-y-scroll">{mainContent}</main>
      </div>

      {/* Render sidebar on right if position is 'right' */}
      {sidebarPosition === 'right' && sidebarElement}
    </div>
  );
};

PageLayout.displayName = 'PageLayout';
