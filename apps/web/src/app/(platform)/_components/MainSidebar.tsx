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
import { cn } from '@/lib/utils';
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
  Sparkles,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';

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
      title: 'AI Assistant',
      description: 'AI Assistant',
      url: '/ai-assistant',
      icon: Sparkles,
      isReady: true,
    },
    {
      title: 'Analytics',
      description: 'Analytics',
      url: '/analytics',
      icon: BarChart,
      isReady: false,
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
      url: '/fuel-procurement',
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
  md: 'text-base pl-3 pr-1 py-5',
  lg: 'text-lg pl-3 pr-1 py-6',
};

const SIDEBAR_MENU_BUTTON_BASE =
  'flex items-center truncate gap-2 font-normal text-gray-700 bg-gradient-to-r transition-colors duration-200';

const SIDEBAR_MENU_BUTTON_VARIANTS = {
  default: 'hover:bg-gradient-to-r hover:from-blue-100 hover:to-pink-100/80',
  active: 'bg-gradient-to-r from-blue-500 to-pink-300 text-white font-bold hover:text-white',
  disabled: 'opacity-50',
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
    ? isActive
      ? SIDEBAR_MENU_BUTTON_VARIANTS.active
      : SIDEBAR_MENU_BUTTON_VARIANTS.default
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
          <item.icon className="h-4 w-4 flex-shrink-0" />
          <span
            className={cn(
              'transition-all duration-200',
              isCollapsed ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100',
            )}
          >
            {item.title}
          </span>
          {!item.isReady && !isCollapsed && (
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
              <item.icon className="h-4 w-4 flex-shrink-0" />
            </SidebarMenuButton>
          </Link>
        </TooltipTrigger>
        <TooltipContent side="right">{item.title}</TooltipContent>
      </Tooltip>
    );
  }

  return <SidebarMenuItem>{menuButton}</SidebarMenuItem>;
}

export function MainSidebar({
  variant = 'sidebar',
}: {
  variant?: 'sidebar' | 'floating' | 'inset';
}) {
  const pathname = usePathname();
  const { state } = useSidebar();
  const isCollapsed = state === 'collapsed';
  const { user } = useUser();
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  useEffect(() => {
    if (user?.organizationMemberships?.[0]?.organization?.imageUrl) {
      setImageUrl(user.organizationMemberships[0].organization.imageUrl);
    }
  }, [user?.organizationMemberships?.[0]?.organization?.imageUrl]);

  return (
    <Sidebar collapsible="icon" variant={variant} className="border-transparen">
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
        <div style={{ position: 'relative', width: '100%', height: '40px' }}>
          {!isCollapsed && (
            <Image
              src={imageUrl ?? '/placeholder.png'}
              alt="Organization logo"
              fill
              sizes="200px"
              style={{ objectFit: 'contain' }}
            />
          )}
        </div>
        <SidebarMenuButton className="px-0 group-data-[collapsible=icon]:p-0!">
          <ClientUserButton showName={!isCollapsed} />
        </SidebarMenuButton>
      </SidebarFooter>
    </Sidebar>
  );
}

function ClientUserButton({ showName }: { showName: boolean }) {
  // Memoize appearance to prevent unnecessary re-renders
  const appearance = useMemo(
    () => ({
      elements: {
        userButtonBox: {
          flexDirection: 'row-reverse' as const,
        },
      },
    }),
    [],
  );

  return (
    <div suppressHydrationWarning>
      <UserButton showName={showName} appearance={appearance} />
    </div>
  );
}
