'use client';

import type React from 'react';

import { TabsList, TabsTrigger, Tabs as TabsUI } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { ReactNode } from 'react';

export interface TabsProps {
  tabs: { label: string; icon: ReactNode; value: string }[];
  defaultTab: string;
  onTabChange: (tab: string) => void;
  children?: React.ReactNode;
  className?: string;
}

export const Tabs = ({
  tabs,
  defaultTab = tabs ? tabs[0].value : '',
  onTabChange,
  children,
  className,
}: TabsProps) => (
  <TabsUI defaultValue={defaultTab} onValueChange={onTabChange} className={className}>
    <TabsList className="px-8 w-fit rounded-2xl flex bg-white gap-12 h-auto py-1">
      {tabs.map((tab) => (
        <TabsTrigger
          key={tab.value}
          value={tab.value}
          className={cn(
            // base
            'relative isolate cursor-pointer rounded-xl transition-all duration-300 py-2 px-4',
            'text-base text-muted-foreground/50 hover:text-secondary',
            'data-[state=active]:text-secondary data-[state=active]:font-bold',
            'data-[state=active]:bg-transparent data-[state=active]:shadow-none',
            // glow layer - before pseudo element
            "before:content-[''] before:absolute before:inset-[-10px] before:rounded-[14px] before:-z-10",
            // radial glow
            'before:bg-[radial-gradient(circle,_rgba(59,130,246,0.16)_0%,_rgba(59,130,246,0.08)_45%,_transparent_75%)]',
            // soften edge
            'before:blur-md before:opacity-0 before:transition-opacity before:duration-300 before:pointer-events-none',
            // show on hover and when active
            'hover:before:opacity-100',
            // show on active
            'data-[state=active]:before:opacity-60',
            // feather on Y axis
            'before:[mask-image:linear-gradient(to_bottom,transparent,_black_18%,_black_82%,_transparent)] before:[mask-repeat:no-repeat] before:[-webkit-mask-image:linear-gradient(to_bottom,transparent,_black_18%,_black_82%,_transparent)]',
          )}
        >
          {tab.icon}
          {tab.label}
        </TabsTrigger>
      ))}
    </TabsList>
    {children}
  </TabsUI>
);
