'use client';

import { Skeleton } from '@/components/ui/skeleton';
import { UserButton, useUser } from '@clerk/nextjs';

export default function ClientUserButton({ showName }: { showName: boolean }) {
  const { isSignedIn, isLoaded } = useUser();

  if (!isLoaded || !isSignedIn) {
    return (
      <div className="h-8 w-8 flex items-center justify-center">
        <Skeleton className="h-8 w-8 rounded-full" />
      </div>
    );
  }

  return (
    <UserButton
      showName={showName}
      appearance={{
        elements: {
          userButtonBox: {
            flexDirection: 'row-reverse',
          },
        },
      }}
    />
  );
}
