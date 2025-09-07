// src/app/layout.tsx

import RuntimeDbCheck from '@/components/runtime-db-check';
import { Toaster } from '@/components/ui/sonner';
import { ClerkProvider } from '@clerk/nextjs';
import type { Metadata, Viewport } from 'next';
import { Manrope } from 'next/font/google';
import React from 'react';
import BackendApiAuth from './BackendApiAuth';
import './globals.css';

export const metadata: Metadata = {
  title: 'Fleet AI',
  description: 'Fleet AI is an AI-powered OS for airline procurement teams',
  icons: {
    icon: '/logos/fleet-ai-logo.svg',
  },
};

export const viewport: Viewport = {
  maximumScale: 1,
};

const manrope = Manrope({ subsets: ['latin'] });

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html suppressHydrationWarning lang="en">
      <body className={manrope.className}>
        {/* Clerk Provider */}
        <ClerkProvider>
          {/* Attach the JWT token to the backend API requests */}
          <BackendApiAuth />
          {/* Runtime DB Check */}
          <RuntimeDbCheck />
          {/* Children - Main App */}
          {children}
          {/* Toaster */}
          <Toaster richColors position="bottom-right" />
        </ClerkProvider>
      </body>
    </html>
  );
}
