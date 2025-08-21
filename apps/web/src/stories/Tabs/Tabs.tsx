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
    className={cn('w-full p-2', className)}
  >
    <TabsList className="w-full flex bg-muted/50 rounded-2xl p-1.5 h-12 gap-2">
      {tabs.map((tab) => (
        <TabsTrigger
          key={tab.value}
          value={tab.value}
          className={cn(
            'cursor-pointer rounded-xl transition-all duration-300',
            'text-base text-muted-foreground/60 font-bold hover:bg-muted/80',
            'data-[state=active]:bg-background data-[state=active]:text-foreground',
            'data-[state=active]:shadow-none',
          )}
        >
          {tab.label}
        </TabsTrigger>
      ))}
    </TabsList>
    <TabsContent value={selectedTab}>{children}</TabsContent>
  </TabsUI>
);
