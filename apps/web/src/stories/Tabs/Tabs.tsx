'use client';

import { TabsList, TabsTrigger, Tabs as TabsUI } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { AnimatePresence, motion } from 'framer-motion';
import type React from 'react';
import { type ReactNode, useId, useState } from 'react';

export interface TabsProps {
  tabs: { label: string; icon: ReactNode; value: string }[];
  defaultTab: string;
  onTabChange: (tab: string) => void;
  children?: React.ReactNode;
  className?: string;
}

const defaultTabBackground = 'bg-gradient-to-r from-blue-500/10 to-purple-500/10';

export const Tabs = ({
  tabs,
  defaultTab = tabs ? tabs[0].value : '',
  onTabChange,
  children,
  className,
}: TabsProps) => {
  const [activeTab, setActiveTab] = useState(defaultTab);
  const uniqueId = useId();

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    onTabChange(value);
  };

  return (
    <TabsUI
      defaultValue={defaultTab}
      onValueChange={handleTabChange}
      className={cn('flex flex-col gap-4', className)}
    >
      <TabsList className="px-2 w-fit rounded-2xl flex bg-white/80 backdrop-blur-sm gap-2 h-auto py-1 border border-white/20">
        {tabs.map((tab, index) => (
          <motion.div
            key={tab.value}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.3 }}
            className="relative"
          >
            <TabsTrigger
              value={tab.value}
              className={cn(
                // base
                'relative isolate cursor-pointer rounded-xl transition-all duration-300 py-2 px-4',
                'text-base text-muted-foreground/50 hover:text-secondary/80',
                'data-[state=active]:text-secondary',
                'data-[state=active]:bg-transparent data-[state=active]:shadow-none',
                // glow layer - before pseudo element
                "before:content-[''] before:absolute before:inset-[-10px] before:rounded-[14px] before:-z-10",
                // radial glow
                'before:bg-[radial-gradient(circle,_rgba(59,130,246,0.16)_0%,_rgba(59,130,246,0.08)_45%,_transparent_75%)]',
                // soften edge
                'before:blur-md before:opacity-0 before:transition-opacity before:duration-300 before:pointer-events-none',
                // show on hover and when active
                'hover:before:opacity-60',
                // show on active
                'data-[state=active]:before:opacity-0',
                // feather on Y axis
                'before:[mask-image:linear-gradient(to_bottom,transparent,_black_18%,_black_82%,_transparent)] before:[mask-repeat:no-repeat] before:[-webkit-mask-image:linear-gradient(to_bottom,transparent,_black_18%,_black_82%,_transparent)]',
              )}
            >
              <motion.div
                className="flex items-center gap-2"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: 'spring', stiffness: 400, damping: 17 }}
              >
                {tab.icon}
                <motion.span
                  initial={{ opacity: 0.7 }}
                  animate={{ opacity: activeTab === tab.value ? 1 : 0.7 }}
                  transition={{ duration: 0.8 }}
                >
                  {tab.label}
                </motion.span>
              </motion.div>

              <AnimatePresence>
                {activeTab === tab.value && (
                  <motion.div
                    layoutId={`activeTab-${uniqueId}`}
                    className={cn('rounded-xl border-0 absolute inset-0', defaultTabBackground)}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                )}
              </AnimatePresence>
            </TabsTrigger>
          </motion.div>
        ))}
      </TabsList>
      {children}
    </TabsUI>
  );
};
