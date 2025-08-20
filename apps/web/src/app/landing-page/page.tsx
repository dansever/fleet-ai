import { AnimatedGridBackground } from './_components/AnimatedGridBackground';
import { GradientBackground } from './_components/GradientBackground';
import LandingPageClient from './ClientPage';

export default function LandingPage() {
  return (
    <div className="relative min-h-screen z-10 bg-muted">
      <GradientBackground />
      <AnimatedGridBackground />
      <div className="max-w-7xl mx-auto">
        <LandingPageClient />
      </div>
    </div>
  );
}
