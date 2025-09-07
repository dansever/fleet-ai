import { CardContent } from '@/components/ui/card';
import { BaseCard } from '@/stories/Card/Card';
import { Clock, Wrench } from 'lucide-react';

interface ComingSoonProps {
  title: string;
  description: string;
}

export function ComingSoon({ title, description }: ComingSoonProps) {
  return (
    <div className="flex items-center justify-center p-8">
      <BaseCard className="w-full max-w-md mx-auto shadow-lg">
        <CardContent className="p-8 text-center space-y-6">
          <div className="relative">
            <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <Wrench className="w-8 h-8 text-primary animate-pulse" />
            </div>
            <div className="absolute -top-1 -right-1 w-6 h-6 bg-muted rounded-full flex items-center justify-center">
              <Clock className="w-3 h-3 text-muted-foreground" />
            </div>
          </div>

          <div className="space-y-3">
            <h1 className="text-2xl font-bold text-foreground text-balance">{title}</h1>
            <p className="text-muted-foreground text-pretty leading-relaxed">{description}</p>
          </div>

          <div className="pt-4">
            <div className="flex items-center justify-center space-x-1">
              <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]"></div>
              <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]"></div>
              <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">We're working on something amazing</p>
          </div>
        </CardContent>
      </BaseCard>
    </div>
  );
}
