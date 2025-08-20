'use client';

import { BrandLogo } from '@/components/miscellaneous/BrandLogo';
import { Button } from '@/components/ui/button';
import { SignedIn, SignedOut, SignInButton, SignUpButton, useAuth } from '@clerk/nextjs';
import Link from 'next/link';

export function LandingPageNavBar() {
  const { isLoaded } = useAuth();

  return (
    <div className="sticky top-0 z-50 backdrop-blur-sm bg-white/10 w-full flex items-center justify-between py-4 px-8">
      <BrandLogo />
      {/* Buttons */}
      <div className="flex items-center gap-2">
        {!isLoaded ? (
          <div className="h-8 sm:h-10 w-16 sm:w-20 bg-gray-200 animate-pulse rounded-md" />
        ) : (
          <>
            <SignedIn>
              <Button variant="default" size="lg">
                <Link href="/dashboard">Dashboard</Link>
              </Button>
            </SignedIn>
            <SignedOut>
              <div className="flex items-center gap-1 sm:gap-2">
                <SignInButton mode="modal">
                  <Button variant="outline" size="lg">
                    Log In
                  </Button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <Button size="lg">Sign Up</Button>
                </SignUpButton>
              </div>
            </SignedOut>
          </>
        )}
      </div>
    </div>
  );
}
