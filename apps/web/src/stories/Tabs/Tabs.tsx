import { TabsContent, TabsList, TabsTrigger, Tabs as TabsUI } from '@/components/ui/tabs';
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
    className={cn('w-full p-2 ', className)}
  >
    <TabsList className="grid w-full grid-cols-5 bg-muted rounded-2xl p-1 items-center">
      {tabs.map((tab) => (
        <TabsTrigger key={tab.value} value={tab.value} className="rounded-xl">
          {tab.label}
        </TabsTrigger>
      ))}
    </TabsList>
    <TabsContent value={selectedTab}>{children}</TabsContent>
  </TabsUI>
);
