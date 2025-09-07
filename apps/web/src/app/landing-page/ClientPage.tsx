'use client';

import { GlassCard } from '@/components/miscellaneous/GlassCard';
import { Button } from '@/stories/Button/Button';
import { BarChart3, Repeat, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { LandingPageNavBar } from './_components/LandingPageNavBar';

export default function LandingPageClient() {
  const router = useRouter();
  return (
    <div className="flex min-h-screen flex-col items-center gap-8">
      <LandingPageNavBar />
      <main className="flex-1 px-8 space-y-32">
        {/* Hero */}
        <section id="hero" className="relative space-y-6 overflow-hidden p-8 ">
          {/* <SoundWaveAnimation className="top-1/2 -translate-y-1/2" /> */}
          <div className="flex flex-col items-center gap-4 text-center relative z-10">
            <div className="rounded-full bg-primary/10 backdrop-blur-sm px-4 py-1.5 text-sm font-medium text-primary border border-primary/20">
              Introducing FleetAI
            </div>
            <h1 className="font-semibold text-5xl lg:text-7xl gradient-text p-4">
              AI-Powered Airline Procurement
            </h1>
            <p className="m-2 glass-effect p-4 rounded-lg text-xl font-semibold text-primary">
              Fleet AI is building the AI infrastructure for airline procurement teams
            </p>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="relative space-y-6 overflow-hidden">
          <div className="mx-auto flex max-w-[58rem] flex-col items-center space-y-4 text-center">
            <h2 className="font-normal text-4xl lg:text-6xl leading-[1.1] gradient-text p-4">
              Intelligent Features
            </h2>
            <p className="max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7">
              Our AI-powered platform offers three revolutionary capabilities to transform your
              social media strategy.
            </p>
          </div>
          <div className="flex flex-row gap-4 p-2">
            <GlassCard className="p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/20 backdrop-blur-sm">
                <BarChart3 className="h-6 w-6 text-primary" />
              </div>
              <div className="space-y-2 pt-6 m-2">
                <h3 className="font-bold">Sentiment-Based Scheduling</h3>
                <p className="text-sm text-muted-foreground">
                  Analyze real-time sentiment to automatically adjust content timing and tone based
                  on audience mood.
                </p>
              </div>
            </GlassCard>
            <GlassCard className="p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/20 backdrop-blur-sm">
                <Repeat className="h-6 w-6 text-primary" />
              </div>
              <div className="space-y-2 pt-6">
                <h3 className="font-bold">Platform-Specific Adaptation</h3>
                <p className="text-sm text-muted-foreground">
                  Automatically tailor content for each platform&lsquo;s unique style, format, and
                  audience expectations.
                </p>
              </div>
            </GlassCard>
            <GlassCard className="p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/20 backdrop-blur-sm">
                <TrendingUp className="h-6 w-6 text-primary" />
              </div>
              <div className="space-y-2 pt-6">
                <h3 className="font-bold">Predictive Trend Integration</h3>
                <p className="text-sm text-muted-foreground">
                  Identify emerging trends before they peak and generate relevant content ideas to
                  capitalize on them.
                </p>
              </div>
            </GlassCard>
          </div>
        </section>

        {/*  */}
        <section id="summary">
          <GlassCard className="mx-auto p-8" highlight>
            <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
              <div className="max-w-[32rem] space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">
                  Ready to transform your social media strategy?
                </h2>
                <p className="text-muted-foreground">
                  Get started with Wavelength today and see the difference AI can make for your
                  brand.
                </p>
              </div>
              <Button intent="success" size="lg" text="Get Started" />
            </div>
          </GlassCard>
        </section>

        {/* Footer */}
        <footer className="border-t border-white/10 py-6 md:py-0 backdrop-blur-md">
          <div className="px-4 flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
            <div className="flex flex-col items-center gap-4 px-8 md:flex-row md:gap-2 md:px-0">
              <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
                &copy; {new Date().getFullYear()} FleetAI. All rights reserved.
              </p>
            </div>
            <div className="flex gap-4">
              <Link href="#" className="text-sm text-muted-foreground underline underline-offset-4">
                Terms
              </Link>
              <Link href="#" className="text-sm text-muted-foreground underline underline-offset-4">
                Privacy
              </Link>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
