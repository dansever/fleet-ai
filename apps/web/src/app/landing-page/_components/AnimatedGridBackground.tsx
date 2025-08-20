import { AnimatedGridPattern } from '@/components/magicui/animated-grid-pattern';
import { cn } from '@/lib/utils';

interface AnimatedGridBackgroundProps {
  className?: string;
}

export function AnimatedGridBackground({ className }: AnimatedGridBackgroundProps) {
  return (
    <div className={cn('absolute top-0 left-0 -z-10 h-full w-full overflow-hidden', className)}>
      <AnimatedGridPattern
        numSquares={20}
        maxOpacity={0.15}
        duration={2.5}
        repeatDelay={1}
        className={cn(
          'absolute inset-0 h-full w-full skew-y-8',
          // Composite mask to fade all edges
          '[mask-image:radial-gradient(800px_circle_at_center,white,transparent)]',
          '[mask-mode:match-source]',
          '[mask-repeat:no-repeat]',
          '[mask-size:cover]',
        )}
      />
    </div>
  );
}
