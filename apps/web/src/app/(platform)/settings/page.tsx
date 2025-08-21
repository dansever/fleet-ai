'use client';

import { PageLayout } from '@/stories/PageLayout/PageLayout';
import { Tabs } from '@/stories/Tabs/Tabs';

export default function SettingsPage() {
  return (
    <PageLayout
      sidebarContent={null}
      headerContent={'Settings'}
      mainContent={
        <div className="p-4">
          <Tabs
            tabs={[
              { label: 'Account', value: 'account' },
              { label: 'Security', value: 'security' },
              { label: 'Billing', value: 'billing' },
              { label: 'Notifications', value: 'notifications' },
              { label: 'Integrations', value: 'integrations' },
            ]}
            selectedTab={'account '}
            onTabChange={() => {
              console.log('tab changed');
            }}
          />
        </div>
      }
    />
  );
}
