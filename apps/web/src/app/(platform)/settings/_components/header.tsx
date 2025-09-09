'use client';

import { Tabs } from '@/stories/Tabs/Tabs';
import { CreditCard, GitBranch, Shield, User } from 'lucide-react';
import { useState } from 'react';

export function Header() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  return (
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
            onTabChange={() => {}}
          ></Tabs>
        </div>
      </div>
    </header>
  );
}
