'use client';

import { ComingSoon } from '@/components/miscellaneous/ComingSoon';
import { TabsContent } from '@/components/ui/tabs';
import { PageLayout } from '@/stories/PageLayout/PageLayout';
import { Tabs } from '@/stories/Tabs/Tabs';
import { CreditCard, GitBranch, Shield, User } from 'lucide-react';
import AccountPage from './subpages.tsx/Account';

export default function SettingsClientPage() {
  return (
    <PageLayout
      sidebarContent={null}
      // headerContent={'Settings'}
      mainContent={
        <div className="p-4">
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
          >
            <TabsContent value="account">
              <AccountPage />
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
