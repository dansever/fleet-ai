'use client';

import { ComingSoon } from '@/components/miscellaneous/ComingSoon';
import { PageLayout } from '@/stories/PageLayout/PageLayout';
import { Tabs } from '@/stories/Tabs/Tabs';
import { CreditCard, GitBranch, Shield, User } from 'lucide-react';
import { useState } from 'react';
import ProfilePage from './subpages/Profile';

export default function SettingsClientPage() {
  const [activeTab, setActiveTab] = useState('profile');
  const tabs = [
    { label: 'Profile', icon: <User />, value: 'profile' },
    { label: 'Security', icon: <Shield />, value: 'security' },
    { label: 'Billing', icon: <CreditCard />, value: 'billing' },
    { label: 'Integrations', icon: <GitBranch />, value: 'integrations' },
  ];
  return (
    <PageLayout
      headerContent={<Tabs tabs={tabs} defaultTab={activeTab} onTabChange={setActiveTab} />}
    >
      <div>
        {activeTab === 'profile' && <ProfilePage />}
        {activeTab === 'security' && (
          <ComingSoon title="Security" description="This feature is coming soon" />
        )}
        {activeTab === 'billing' && (
          <ComingSoon title="Billing" description="This feature is coming soon" />
        )}
        {activeTab === 'integrations' && (
          <ComingSoon title="Integrations" description="This feature is coming soon" />
        )}
      </div>
    </PageLayout>
  );
}
