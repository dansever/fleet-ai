'use client';

import type React from 'react';

import { TabsList, TabsTrigger, Tabs as TabsUI } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

export interface TabsProps {
  tabs: { label: string; value: string }[];
  selectedTab: string;
  onTabChange: (tab: string) => void;
  children?: React.ReactNode;
  className?: string;
}

export const Tabs = ({ tabs, selectedTab, onTabChange, children, className }: TabsProps) => (
  <TabsUI
    defaultValue={selectedTab}
    onValueChange={onTabChange}
    className={cn('w-full gap-4 p-2', className)}
  >
    <TabsList className="w-full flex bg-white rounded-2xl p-1.5 h-12 gap-2">
      {tabs.map((tab) => (
        <TabsTrigger
          key={tab.value}
          value={tab.value}
          className={cn(
            'cursor-pointer rounded-xl transition-all duration-300',
            'text-base text-muted-foreground/30 font-bold hover:text-foreground/80',
            'data-[state=active]:bg-secondary/10 data-[state=active]:text-foreground',
            'data-[state=active]:shadow-none',
          )}
        >
          {tab.label}
        </TabsTrigger>
      ))}
    </TabsList>
    {children}
  </TabsUI>
);
