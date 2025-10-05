// src/app/ClerkOrgSetter.tsx

'use client';

import { useOrganizationList, useUser } from '@clerk/nextjs';
import { useEffect, useState } from 'react';

/**
 * ClerkOrgSetter is a client component that sets the active organization for the user.
 * This is used to ensure that the user is always on the correct organization.
 * It is used in the layout.tsx file to set the active organization for the user.
 */
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
