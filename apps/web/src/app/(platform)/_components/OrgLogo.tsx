// apps/web/src/app/(platform)/_components/OrgLogo.tsx

'use client';
import { useOrganization } from '@clerk/nextjs';
import Image from 'next/image';

export function OrgLogo({ isCollapsed }: { isCollapsed: boolean }) {
  const { organization, isLoaded } = useOrganization();
  if (!isLoaded || isCollapsed) return null;

  const url = organization?.imageUrl;
  if (!url) return null;

  return (
    <div style={{ position: 'relative', width: '100%', height: 40 }}>
      <Image
        src={url}
        alt="Organization logo"
        fill
        sizes="200px"
        style={{ objectFit: 'contain' }}
      />
    </div>
  );
}
