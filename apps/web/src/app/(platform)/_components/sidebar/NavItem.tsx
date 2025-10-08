'use client';

import { SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { sidebarTabs } from './tabs';

const ComingSoonBadge = () => (
  <span className="ml-auto rounded bg-yellow-100 px-2 py-0.5 text-[10px] text-yellow-800 border border-yellow-300">
    Soon
  </span>
);

export function NavItem({
  item,
  isActive,
}: {
  item: (typeof sidebarTabs.procurement)[0];
  isActive: boolean;
}) {
  const isDisabled = !item.isReady;

  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        asChild
        isActive={isActive}
        tooltip={item.title}
        className={cn(isDisabled && 'opacity-40', isActive && 'font-bold')}
      >
        <Link
          href={isDisabled ? '#' : item.url}
          target={item.newTab ? '_blank' : undefined}
          aria-disabled={isDisabled}
          onClick={(e) => {
            if (isDisabled) e.preventDefault();
          }}
        >
          <item.icon className="size-4" />
          <span>{item.title}</span>
          {isDisabled && <ComingSoonBadge />}
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}
