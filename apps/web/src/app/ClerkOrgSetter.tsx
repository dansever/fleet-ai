// src/app/ClerkOrgSetter.tsx
'use client';

import { useOrganizationList, useUser } from '@clerk/nextjs';
import { useEffect, useState } from 'react';

export default function ClerkOrgSetter() {
  const { user } = useUser();
  const { setActive, isLoaded } = useOrganizationList();
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!isLoaded || !user || done) return;

    const firstOrg = user.organizationMemberships[0]?.organization;
    if (firstOrg) {
      setActive({ organization: firstOrg.id });
      console.log('Active Organization: ', firstOrg);
      setDone(true); // ✅ only run once
    }
  }, [isLoaded, user, setActive, done]);

  return null;
}
