import { Toaster } from '@/components/ui/sonner';
import { assertDbReady } from '@/drizzle';
import { ClerkProvider } from '@clerk/nextjs';
import type { Metadata, Viewport } from 'next';
import { Manrope } from 'next/font/google';
import React from 'react';
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

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  await assertDbReady();
  return (
    <html suppressHydrationWarning lang="en">
      <body className={manrope.className}>
        <ClerkProvider>
          {children}
          <Toaster richColors position="bottom-right" />
        </ClerkProvider>
      </body>
    </html>
  );
}
