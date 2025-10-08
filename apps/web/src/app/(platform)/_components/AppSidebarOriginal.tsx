'use client';

import { BrandLogo } from '@/components/miscellaneous/BrandLogo';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from '@/components/ui/sidebar';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { User as DbUser } from '@/drizzle/types';
import { cn } from '@/lib/utils';
import { StatusBadge } from '@/stories/StatusBadge/StatusBadge';
import { UserButton, useUser } from '@clerk/nextjs';
import {
  BarChart,
  Fuel,
  LayoutDashboard,
  Package,
  Plane,
  Settings,
  Settings2,
  ShoppingCart,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useMemo, useRef } from 'react';

interface SidebarTab {
  title: string;
  description?: string;
  url: string;
  icon: React.ElementType;
  isReady?: boolean;
}

export const sidebarTabs: Record<string, SidebarTab[]> = {
  dashboard: [
    {
      title: 'Dashboard',
      description: 'Overview & Analytics',
      url: '/dashboard',
      icon: LayoutDashboard,
      isReady: true,
    },
    {
      title: 'Analytics',
      description: 'Analytics',
      url: '/analytics',
      icon: BarChart,
      isReady: true,
    },
  ],
  procurement: [
    {
      title: 'Technical',
      description: 'Parts & Services RFQs',
      url: '/technical-procurement',
      icon: Package,
      isReady: true,
    },
    {
      title: 'Fuel',
      description: 'Fuel Tenders & Contracts',
      url: '/fuel',
      icon: Fuel,
      isReady: true,
    },
    {
      title: 'Airport Hub',
      description: 'Airport Operations & Contracts',
      url: '/airport-hub',
      icon: Plane,
      isReady: true,
    },
  ],
  supplier: [
    {
      title: 'Supplier Hub',
      description: 'Supplier Management',
      url: '/supplier-hub',
      icon: ShoppingCart,
      isReady: true,
    },
  ],
  admin: [
    {
      title: 'Admin',
      url: '/admin',
      icon: Settings2,
      isReady: true,
    },
  ],
  administration: [
    {
      title: 'Settings',
      url: '/settings',
      icon: Settings,
      isReady: true,
    },
  ],
};

function isPathActive(pathname: string, baseUrl: string) {
  const normalize = (p: string) => (p === '/' ? '/' : p.replace(/\/\/+$/, ''));
  const current = normalize(pathname);
  const base = normalize(baseUrl);
  return current === base || current.startsWith(base + '/');
}

const SIDEBAR_MENU_BUTTON_SIZES = {
  md: 'text-base px-1 py-5',
  lg: 'text-lg pl-3 pr-1 py-6',
};

const SIDEBAR_MENU_BUTTON_BASE =
  'text-gray-500 flex items-center truncate gap-2 hover:text-gray-500 hover:bg-gradient-to-r hover:from-blue-50 hover:to-pink-50 transition-colors duration-200';

const SIDEBAR_MENU_BUTTON_VARIANTS = {
  active: 'font-bold text-gray-800 hover:text-gray-700',
  disabled: 'opacity-40',
};

function SidebarNavItem({
  item,
  isActive,
  isCollapsed,
}: {
  item: (typeof sidebarTabs.procurement)[0];
  isActive: boolean;
  isCollapsed: boolean;
}) {
  const variantClass = item.isReady
    ? isActive && SIDEBAR_MENU_BUTTON_VARIANTS.active
    : SIDEBAR_MENU_BUTTON_VARIANTS.disabled;

  const menuButton = (
    <Link
      href={item.isReady ? item.url : '#'}
      className="flex items-center gap-2"
      onClick={(e) => {
        if (!item.isReady) e.preventDefault();
      }}
    >
      <SidebarMenuButton
        disabled={!item.isReady}
        className={cn(
          SIDEBAR_MENU_BUTTON_BASE,
          variantClass,
          SIDEBAR_MENU_BUTTON_SIZES.md,
          !isCollapsed && 'rounded-xl',
          isCollapsed && 'rounded-lg',
        )}
        asChild
      >
        <div className="flex items-center">
          <item.icon
            className={cn(
              'h-4 w-4 flex-shrink-0 text-gray-500',
              isActive && 'text-sky-600 stroke-3',
            )}
          />
          <span className="transition-all duration-200">{item.title}</span>
          {!item.isReady && (
            <span className="text-[10px] px-1 py-0.5 ml-1 rounded bg-yellow-100 text-yellow-800 border border-yellow-300">
              Soon
            </span>
          )}
        </div>
      </SidebarMenuButton>
    </Link>
  );

  if (isCollapsed) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <Link
            href={item.isReady ? item.url : '#'}
            onClick={(e) => {
              if (!item.isReady) e.preventDefault();
            }}
          >
            <SidebarMenuButton
              disabled={!item.isReady}
              className={cn(
                SIDEBAR_MENU_BUTTON_BASE,
                variantClass,
                'cursor-pointer',
                SIDEBAR_MENU_BUTTON_SIZES.md,
                isCollapsed ? 'rounded-lg justify-center' : 'rounded-xl',
              )}
            >
              <item.icon
                className={cn('h-4 w-4 flex-shrink-0', isActive && 'text-sky-600 stroke-3')}
              />
            </SidebarMenuButton>
          </Link>
        </TooltipTrigger>
        <TooltipContent side="right">{item.title}</TooltipContent>
      </Tooltip>
    );
  }

  return <SidebarMenuItem>{menuButton}</SidebarMenuItem>;
}

export function AppSidebar({
  variant = 'sidebar',
  dbUser,
  ...props
}: {
  variant?: 'sidebar' | 'floating' | 'inset';
  dbUser: DbUser;
  props: React.ComponentProps<typeof Sidebar>;
}) {
  const pathname = usePathname();
  const { state } = useSidebar();
  const isCollapsed = state === 'collapsed';
  const { user: clerkUser, isLoaded } = useUser();

  // Show loading state during hydration to prevent mismatch
  if (!isLoaded) {
    return (
      <Sidebar collapsible="icon" variant={variant} {...props} className="border-r-primary/40">
        <SidebarHeader className="flex flex-row items-center w-full h-16 min-h-16 px-2">
          <div className="flex items-center h-full">
            <BrandLogo width={120} />
          </div>
        </SidebarHeader>
        <SidebarContent>
          <div className="p-2 space-y-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-8 bg-gray-200 rounded animate-pulse" />
            ))}
          </div>
        </SidebarContent>
        <SidebarFooter>
          <div className="flex items-center gap-2 p-2">
            <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse" />
            <div className="w-20 h-4 bg-gray-200 rounded animate-pulse" />
          </div>
        </SidebarFooter>
      </Sidebar>
    );
  }

  if (!clerkUser) return null;

  return (
    <Sidebar collapsible="icon" variant={variant} className="border-r-primary/40">
      <SidebarHeader
        className={cn(
          'flex flex-row items-center w-full h-16 min-h-16 px-2',
          'transition-all duration-300 ease-in-out',
        )}
      >
        <div
          className={cn(
            'flex items-center h-full transition-all duration-300 ease-in-out',
            isCollapsed ? 'opacity-0 scale-90 max-w-0' : 'opacity-100 scale-100 max-w-[140px]',
          )}
          style={{ transitionProperty: 'opacity, transform, max-width' }}
        >
          <BrandLogo width={120} />
        </div>
        <SidebarTrigger
          className={cn(
            'shadow-none transition-all duration-300 ease-in-out',
            'hover:bg-transparent hover:cursor-pointer',
            isCollapsed ? 'absolute left-1/2 -translate-x-1/2' : 'ml-auto',
          )}
        />
      </SidebarHeader>
      <SidebarContent>
        <ScrollArea className="h-full">
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                {sidebarTabs.dashboard.map((item) => (
                  <SidebarNavItem
                    key={item.title}
                    item={item}
                    isActive={isPathActive(pathname, item.url)}
                    isCollapsed={isCollapsed}
                  />
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
          <SidebarGroup>
            <SidebarGroupLabel>Procurement</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {sidebarTabs.procurement.map((item) => (
                  <SidebarNavItem
                    key={item.title}
                    item={item}
                    isActive={isPathActive(pathname, item.url)}
                    isCollapsed={isCollapsed}
                  />
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
          <SidebarGroup>
            <SidebarGroupLabel>Supplier</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {sidebarTabs.supplier.map((item) => (
                  <SidebarNavItem
                    key={item.title}
                    item={item}
                    isActive={isPathActive(pathname, item.url)}
                    isCollapsed={isCollapsed}
                  />
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          <SidebarGroup>
            <SidebarGroupLabel>Admin</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {sidebarTabs.admin.map((item) => (
                  <SidebarNavItem
                    key={item.title}
                    item={item}
                    isActive={isPathActive(pathname, item.url)}
                    isCollapsed={isCollapsed}
                  />
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
          <SidebarGroup>
            <SidebarGroupLabel>Administration</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {sidebarTabs.administration.map((item) => (
                  <SidebarNavItem
                    key={item.title}
                    item={item}
                    isActive={isPathActive(pathname, item.url)}
                    isCollapsed={isCollapsed}
                  />
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </ScrollArea>
      </SidebarContent>
      <SidebarFooter>
        <ClientUserButton isCollapsed={isCollapsed} dbUser={dbUser} clerkUser={clerkUser} />
      </SidebarFooter>
    </Sidebar>
  );
}

function ClientUserButton({
  isCollapsed,
  dbUser,
  clerkUser,
}: {
  isCollapsed: boolean;
  dbUser: DbUser;
  clerkUser: ReturnType<typeof useUser>['user'];
}) {
  const buttonRef = useRef<HTMLDivElement | null>(null);
  const name = dbUser.firstName;
  const fullName = `${dbUser.firstName} ${dbUser.lastName}`.trim();

  // Memoize appearance to prevent unnecessary re-renders
  const appearance = useMemo(
    () => ({
      elements: {
        userButtonBox: 'relative',
        userButtonAvatarBox: 'h-8 w-8',
      },
    }),
    [],
  );

  const handleRowClick = (e: React.MouseEvent) => {
    // If click originated inside the UserButton, let Clerk handle it
    if (buttonRef.current?.contains(e.target as Node)) return;

    // Otherwise, forward the click to Clerk’s internal button
    buttonRef.current?.querySelector('button')?.click();
  };

  return (
    <div className="flex items-center gap-2 cursor-pointer p-2 pl-0" onClick={handleRowClick}>
      <div ref={buttonRef} className="z-50">
        <UserButton showName={false} appearance={appearance} afterSignOutUrl="/" />
      </div>

      {!isCollapsed && (
        <div className="flex flex-col gap-1 select-none">
          <span className="text-sm font-medium">{fullName}</span>
          {dbUser?.position && <StatusBadge status="secondary" text={dbUser.position} size="xs" />}
        </div>
      )}
    </div>
  );
}
