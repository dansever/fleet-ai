// src/app/ClerkOrgSetter.tsx
'use client';

import { useOrganizationList, useUser } from '@clerk/nextjs';
import { useEffect, useState } from 'react';

export default function ClerkOrgSetter() {
  const { user, isLoaded: userLoaded } = useUser();
  const { setActive, isLoaded: orgListLoaded } = useOrganizationList();
  const [done, setDone] = useState(false);

  useEffect(() => {
    // More strict loading check to prevent multiple runs
    if (!userLoaded || !orgListLoaded || !user || done) return;

    const firstOrg = user.organizationMemberships[0]?.organization;
    if (firstOrg && !done) {
      setActive({ organization: firstOrg.id });
      console.log('Active Organization: ', firstOrg);
      setDone(true); // ✅ only run once
    }
  }, [userLoaded, orgListLoaded, user, setActive, done]);

  return null;
}
