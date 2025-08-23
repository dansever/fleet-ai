'use client';

import { BrandLogo } from '@/components/miscellaneous/BrandLogo';
import { Button } from '@/stories/Button/Button';
import { SignedIn, SignedOut, SignInButton, SignUpButton, useAuth } from '@clerk/nextjs';

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
              <Button intent="primary" size="md" text="Dashboard" href="/dashboard" />
            </SignedIn>
            <SignedOut>
              <div className="flex items-center gap-1 sm:gap-2">
                <SignInButton mode="modal">
                  <Button intent="secondary" size="md" text="Log In" />
                </SignInButton>
                <SignUpButton mode="modal">
                  <Button intent="primary" size="md" text="Sign Up" />
                </SignUpButton>
              </div>
            </SignedOut>
          </>
        )}
      </div>
    </div>
  );
}
