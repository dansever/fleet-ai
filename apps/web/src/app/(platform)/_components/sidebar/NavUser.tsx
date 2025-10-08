'use client';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useSidebar } from '@/components/ui/sidebar';
import { Skeleton } from '@/components/ui/skeleton';
import { User as DbUser } from '@/drizzle/types';
import { cn } from '@/lib/utils';
import { StatusBadge } from '@/stories';
import { ClerkLoaded, ClerkLoading, SignedIn, SignedOut, UserButton } from '@clerk/nextjs';
import { useEffect, useRef, useState } from 'react';

export function NavUser({ dbUser }: { dbUser: DbUser }) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const userButtonRef = useRef<HTMLDivElement | null>(null);
  const [isClient, setIsClient] = useState(false);
  const { state } = useSidebar();
  const isCollapsed = state === 'collapsed';
  const fullName = `${dbUser.firstName} ${dbUser.lastName}`.trim();

  // Ensure component only renders user data on client side to prevent hydration errors
  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleRowClick = (e: React.MouseEvent) => {
    // Check if the click is directly on the UserButton or its children
    if (userButtonRef.current?.contains(e.target as Node)) {
      // Let the UserButton handle its own click naturally
      return;
    }

    // Otherwise, we clicked on the surrounding area (name/badge)
    // So programmatically trigger the UserButton
    e.preventDefault();
    e.stopPropagation();

    const button = userButtonRef.current?.querySelector('button');
    if (button) {
      button.click();
    }
  };

  return (
    <div ref={containerRef} className="z-50">
      {/* Show skeleton while Clerk is loading */}
      <ClerkLoading>
        <div className="flex items-center gap-2 p-2 pl-0">
          <Avatar>
            <AvatarFallback>
              <div className="w-full h-full bg-muted animate-pulse" />
            </AvatarFallback>
          </Avatar>
          <div
            className={cn(
              'grid flex-1 text-left text-sm leading-tight gap-1 transition-all duration-300 ease-in-out',
              isCollapsed
                ? 'opacity-0 scale-90 max-w-0 overflow-hidden'
                : 'opacity-100 scale-100 max-w-[140px]',
            )}
          >
            <Skeleton className="w-20 h-4" />
            <Skeleton className="w-14 h-4" />
          </div>
        </div>
      </ClerkLoading>

      {/* Once Clerk is loaded, show content based on auth state */}
      <ClerkLoaded>
        {!isClient ? (
          // Show skeleton during initial hydration to prevent mismatch
          <div className="flex items-center gap-2 p-2 pl-0">
            <Avatar>
              <AvatarFallback>
                <div className="w-full h-full bg-muted animate-pulse" />
              </AvatarFallback>
            </Avatar>
            <div
              className={cn(
                'grid flex-1 text-left text-sm leading-tight gap-1 transition-all duration-300 ease-in-out',
                isCollapsed
                  ? 'opacity-0 scale-90 max-w-0 overflow-hidden'
                  : 'opacity-100 scale-100 max-w-[140px]',
              )}
            >
              <Skeleton className="w-20 h-4" />
              <Skeleton className="w-14 h-4" />
            </div>
          </div>
        ) : (
          <>
            <SignedIn>
              <div
                className="flex items-center gap-2 cursor-pointer p-2 pl-0 hover:bg-sidebar-accent rounded-md transition-colors"
                onClick={handleRowClick}
              >
                <div ref={userButtonRef}>
                  <UserButton showName={false} />
                </div>
                <div
                  className={cn(
                    'grid flex-1 text-left text-sm leading-tight transition-all duration-300 ease-in-out',
                    isCollapsed
                      ? 'opacity-0 scale-90 max-w-0 overflow-hidden'
                      : 'opacity-100 scale-100 max-w-[140px]',
                  )}
                >
                  <span className="truncate font-medium">{fullName}</span>
                  {dbUser?.position && (
                    <StatusBadge status="secondary" text={dbUser.position} size="xs" />
                  )}
                </div>
              </div>
            </SignedIn>

            <SignedOut>
              <div className="flex items-center gap-2 p-2 pl-0">
                <Avatar>
                  <AvatarFallback />
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight gap-1">
                  <span className="text-xs text-muted-foreground">Not signed in</span>
                </div>
              </div>
            </SignedOut>
          </>
        )}
      </ClerkLoaded>
    </div>
  );
}
