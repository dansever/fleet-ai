import './globals.css';
import type { Metadata, Viewport } from 'next';
import { Manrope } from 'next/font/google';
import { ClerkProvider } from '@clerk/nextjs';
import React from 'react';
import { Toaster } from '@/components/ui/sonner';

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
        <ClerkProvider>
          {children}
          <Toaster richColors position="bottom-right" />
        </ClerkProvider>
      </body>
    </html>
  );
}
