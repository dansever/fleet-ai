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
import { useUser } from '@clerk/nextjs';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import ClientUserButton from './ClientUserButton';
import { sidebarTabs } from './SidebarTabs';

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

export function AppSidebar({
  variant = 'sidebar',
}: {
  variant?: 'sidebar' | 'floating' | 'inset';
}) {
  const pathname = usePathname();
  const { state } = useSidebar();
  const isCollapsed = state === 'collapsed';
  const { user } = useUser();

  return (
    <Sidebar collapsible="icon" variant={variant}>
      <SidebarHeader
        className={cn(
          'flex flex-row items-center w-full h-16 min-h-16 px-2',
          'transition-all duration-300 ease-in-out',
          'rounded-t-lg',
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
                    isActive={pathname === item.url}
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
                    isActive={pathname === item.url}
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
                    isActive={pathname === item.url}
                    isCollapsed={isCollapsed}
                  />
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          <SidebarGroup>
            <SidebarGroupLabel>Dev</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {sidebarTabs.dev.map((item) => (
                  <SidebarNavItem
                    key={item.title}
                    item={item}
                    isActive={pathname === item.url}
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
                    isActive={pathname === item.url}
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
          {user?.organizationMemberships[0].organization.imageUrl && !isCollapsed && (
            <Image
              src={user.organizationMemberships[0].organization.imageUrl}
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
