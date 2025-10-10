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
  SidebarTrigger,
  useSidebar,
} from '@/components/ui/sidebar';
import { User as DbUser } from '@/drizzle/types';
import { cn } from '@/lib/utils';
import { usePathname } from 'next/navigation';
import { NavItem } from './NavItem';
import { NavUser } from './NavUser';
import { sidebarTabs } from './tabs';

function isPathActive(pathname: string, baseUrl: string) {
  const normalize = (p: string) => (p === '/' ? '/' : p.replace(/\/\/+$/, ''));
  const current = normalize(pathname);
  const base = normalize(baseUrl);
  return current === base || current.startsWith(base + '/');
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

  return (
    <Sidebar collapsible="icon" variant={variant} className="border-r-slate-200">
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
                  <NavItem
                    key={item.title}
                    item={item}
                    isActive={isPathActive(pathname, item.url)}
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
                  <NavItem
                    key={item.title}
                    item={item}
                    isActive={isPathActive(pathname, item.url)}
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
                  <NavItem
                    key={item.title}
                    item={item}
                    isActive={isPathActive(pathname, item.url)}
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
                  <NavItem
                    key={item.title}
                    item={item}
                    isActive={isPathActive(pathname, item.url)}
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
                  <NavItem
                    key={item.title}
                    item={item}
                    isActive={isPathActive(pathname, item.url)}
                  />
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </ScrollArea>
      </SidebarContent>
      <SidebarFooter>
        <NavUser dbUser={dbUser} />
      </SidebarFooter>
    </Sidebar>
  );
}
