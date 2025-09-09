'use client';

import { ComingSoon } from '@/components/miscellaneous/ComingSoon';
import { TabsContent } from '@/components/ui/tabs';
import { PageLayout } from '@/stories/PageLayout/PageLayout';
import { Tabs } from '@/stories/Tabs/Tabs';
import { CreditCard, GitBranch, Shield, User } from 'lucide-react';
import ProfilePage from './subpages.tsx/Account';

export default function SettingsClientPage() {
  return (
    <PageLayout
      sidebarContent={null}
      // headerContent={'Settings'}
      mainContent={
        <div>
          <header className="sticky top-0 z-50 w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-14 items-center">
              <div className="flex items-center gap-6 mr-auto">
                <Tabs
                  tabs={[
                    { label: 'Account', icon: <User />, value: 'account' },
                    { label: 'Security', icon: <Shield />, value: 'security' },
                    { label: 'Billing', icon: <CreditCard />, value: 'billing' },
                    { label: 'Integrations', icon: <GitBranch />, value: 'integrations' },
                  ]}
                  defaultTab={'account'}
                  onTabChange={() => {
                    console.log('tab changed');
                  }}
                ></Tabs>
              </div>
            </div>
          </header>

          <Tabs
            tabs={[
              { label: '', icon: <User />, value: 'account' },
              { label: '', icon: <Shield />, value: 'security' },
              { label: '', icon: <CreditCard />, value: 'billing' },
              { label: '', icon: <GitBranch />, value: 'integrations' },
            ]}
            defaultTab={'account'}
            onTabChange={() => {
              console.log('tab changed');
            }}
          >
            <TabsContent value="account">
              <ProfilePage />
            </TabsContent>
            <TabsContent value="security">
              <ComingSoon title="Security" description="This feature is coming soon" />
            </TabsContent>
            <TabsContent value="billing">
              <ComingSoon title="Billing" description="This feature is coming soon" />
            </TabsContent>
            <TabsContent value="integrations">
              <ComingSoon title="Integrations" description="This feature is coming soon" />
            </TabsContent>
          </Tabs>
        </div>
      }
    />
  );
}
