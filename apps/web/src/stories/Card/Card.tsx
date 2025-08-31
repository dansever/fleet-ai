import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { TrendingUp } from 'lucide-react';
import Image from 'next/image';
import type React from 'react';
import { useMemo } from 'react';

// Gradient palettes for FeatureCard
export enum GradientPalette {
  PinkPurpleBlue = 'PinkPurpleBlue',
  RoseFuchsiaIndigo = 'RoseFuchsiaIndigo',
  SkyIndigoViolet = 'SkyIndigoViolet',
  VioletPinkRose = 'VioletPinkRose',
  CyanBluePurple = 'CyanBluePurple',
}

const paletteToClasses: Record<GradientPalette, string> = {
  [GradientPalette.PinkPurpleBlue]: 'from-pink-600 via-purple-500 to-blue-600',
  [GradientPalette.RoseFuchsiaIndigo]: 'from-rose-600 via-fuchsia-500 to-indigo-600',
  [GradientPalette.SkyIndigoViolet]: 'from-sky-800 via-indigo-600 to-violet-700',
  [GradientPalette.VioletPinkRose]: 'from-violet-600 via-pink-500 to-rose-600',
  [GradientPalette.CyanBluePurple]: 'from-cyan-600 via-blue-500 to-purple-600',
};

export interface BaseCardProps {
  className?: string;
  children?: React.ReactNode;
}

// Surface Card - Minimal base surface for custom layouts
export const BaseCard = ({ className, children }: BaseCardProps) => (
  <Card className={cn('rounded-3xl shadow-none border-0 overflow-hidden', className)}>
    {children}
  </Card>
);

// Feature Card - For showcasing features or services
export const FeatureCard = ({
  title,
  description,
  icon = null,
  palette = GradientPalette.VioletPinkRose,
  className,
  buttonChildren,
  bodyChildren,
}: {
  title: string;
  description: string;
  icon?: React.ReactNode;
  palette?: GradientPalette;
  className?: string;
  buttonChildren?: React.ReactNode;
  bodyChildren?: React.ReactNode;
}) => {
  // Choose classes based on enum or manual override; no randomization
  const chosenGradient = useMemo(() => {
    return paletteToClasses[palette] ?? paletteToClasses[GradientPalette.VioletPinkRose];
  }, [palette]);

  return (
    <Card className={cn('rounded-3xl border-0 overflow-hidden p-0 relative', className)}>
      {/* Background layers */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className={cn('absolute -inset-24 blur-lg opacity-80 bg-gradient-to-br', chosenGradient)}
        />
        <div className="absolute inset-0 bg-white/20 backdrop-blur-sm" />
      </div>

      {/* Foreground content */}
      <div className="relative z-10 p-6 text-white">
        <div className="flex items-center gap-3 mb-4 justify-between">
          <div className="flex flex-row gap-2 items-center">
            {icon && <div className="p-2 bg-white/20 rounded-2xl">{icon}</div>}
            <h3>{title}</h3>
          </div>
          {buttonChildren}
        </div>
        <p className="text-white/90">{description}</p>
        {bodyChildren && <div className="text-white/80 mt-3">{bodyChildren}</div>}
      </div>
    </Card>
  );
};

// Project Card - For displaying projects or portfolio items
export const ProjectCard = ({
  title,
  description,
  imagePath,
  category,
  progress,
  badgeText = null,
  badgeColor = 'bg-gradient-to-r from-pink-500 to-red-500',
  className,
  children,
}: {
  title: string;
  description: string;
  imagePath?: string;
  category: string;
  progress?: number;
  badgeText?: string | null;
  badgeColor?: string;
  className?: string;
  children?: React.ReactNode;
}) => (
  <Card
    className={cn(
      'rounded-3xl overflow-hidden hover:shadow-lg transition-shadow',
      imagePath && 'pt-0',
      className,
    )}
  >
    {imagePath && (
      <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 relative">
        <Image
          src={imagePath ?? '/placeholder.svg'}
          alt={title}
          fill
          className="object-cover"
          sizes="100vw"
          priority
        />
        {badgeText && (
          <Badge
            className={cn(
              'absolute top-3 right-3 text-white rounded-xl',
              badgeColor ?? 'bg-gradient-to-r from-pink-500 to-red-500',
            )}
          >
            {badgeText}
          </Badge>
        )}
      </div>
    )}
    <CardHeader>
      <div className="flex items-start justify-between gap-2">
        <div>
          <CardTitle className="text-lg font-bold">{title}</CardTitle>
          <CardDescription className="mt-1">{description}</CardDescription>
        </div>
        {children}
      </div>
    </CardHeader>
    {progress !== undefined && (
      <CardContent className="pt-0">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-medium">{progress}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </CardContent>
    )}
  </Card>
);

// Stats Card - For displaying metrics and statistics
export const MetricCard = ({
  title,
  value,
  change,
  icon = <TrendingUp className="w-6 h-6 text-violet-600" />,
  trend = 'up',
  className,
}: {
  title: string;
  value: string | number;
  change?: string;
  icon?: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  className?: string;
}) => (
  <Card className={cn('rounded-3xl p-6 border-0 shadow-none', className)}>
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        <h2 className="mt-2">{value}</h2>
        {change && (
          <p
            className={cn(
              'text-sm mt-1',
              trend === 'up'
                ? 'text-green-600'
                : trend === 'down'
                  ? 'text-red-600'
                  : 'text-muted-foreground',
            )}
          >
            {change}
          </p>
        )}
      </div>
      <div className="p-2 bg-gradient-to-br from-violet-50 to-blue-50 rounded-2xl">{icon}</div>
    </div>
  </Card>
);

// Profile Card - For user profiles or team members
export const ProfileCard = ({
  name,
  role,
  avatar,
  bio,
  stats,
  className,
}: {
  name: string;
  role: string;
  avatar?: string;
  bio?: string;
  stats?: { label: string; value: string }[];
  className?: string;
}) => (
  <Card className={cn('rounded-3xl p-4 text-center gap-4', className)}>
    <Avatar className="w-20 h-20 mx-auto">
      <AvatarImage src={avatar || '/placeholder.svg'} />
      <AvatarFallback className="text-lg font-semibold bg-gradient-to-br from-violet-500 to-blue-500 text-white">
        {name
          .split(' ')
          .map((n) => n[0])
          .join('')}
      </AvatarFallback>
    </Avatar>
    <h3>{name}</h3>
    <p className="text-muted-foreground">{role}</p>
    {bio && <p className="text-sm text-muted-foreground mb-4">{bio}</p>}
    {stats && (
      <div className="flex justify-center pt-4 border-t">
        {stats.map((stat, index) => (
          <div key={index} className="text-center">
            <p className="text-lg font-bold">{stat.value}</p>
            <p className="text-xs text-muted-foreground">{stat.label}</p>
          </div>
        ))}
      </div>
    )}
  </Card>
);

// Notification Card - For alerts and notifications
export const NotificationCard = ({
  title,
  message,
  type = 'info',
  timestamp,
  className,
}: {
  title: string;
  message: string;
  type?: 'info' | 'success' | 'warning' | 'error';
  timestamp?: string;
  className?: string;
}) => {
  const typeStyles = {
    info: 'border-l-blue-500 bg-blue-50',
    success: 'border-l-green-500 bg-green-50',
    warning: 'border-l-orange-500 bg-orange-50',
    error: 'border-l-red-500 bg-red-50',
  };

  return (
    <Card className={cn('rounded-2xl border-l-4', typeStyles[type], className)}>
      <CardContent className="px-4 py-0">
        <div className="flex justify-between items-start gap-4">
          <div>
            <h4 className="font-semibold">{title}</h4>
            <p className="text-sm text-muted-foreground mt-1">{message}</p>
          </div>
          {timestamp && <span className="text-xs text-muted-foreground/80">{timestamp}</span>}
        </div>
      </CardContent>
    </Card>
  );
};

// List Item Card - For scrollable lists with flexible content
export const ListItemCard = ({
  children,
  icon = null,
  iconBackground,
  isSelected = false,
  onClick,
  className,
}: {
  children?: React.ReactNode;
  icon?: React.ReactNode;
  iconBackground?: string;
  isSelected?: boolean;
  onClick?: () => void;
  className?: string;
}) => (
  <Card
    className={cn(
      'box-border border-1 shadow-none hover:shadow-sm overflow-hidden rounded-xl p-2 transition-all duration-200 cursor-pointer w-full min-w-0',
      isSelected
        ? 'bg-gradient-to-br from-blue-100 to-emerald-100 to-green-100'
        : 'hover:bg-gradient-to-br hover:from-blue-50/50 hover:to-emerald-50/50 hover:to-green-50/50',
      className,
    )}
    onClick={onClick}
  >
    <CardContent className="px-0">
      <div className="flex flex-row w-full gap-2">
        {icon && (
          <div
            className={cn(
              'w-10 h-10 bg-gradient-to-r text-gray-700 rounded-lg p-2 flex items-center justify-center shrink-0 self-start',
              iconBackground,
            )}
          >
            {icon}
          </div>
        )}

        {/* Fills all remaining width */}
        <div className={cn('flex-1 min-w-0', !icon && 'pl-1')}>
          {/* Force children to span the full width */}
          <div className="w-full max-w-full">{children}</div>
        </div>
      </div>
    </CardContent>
  </Card>
);

// Content Section - Sectioned card component for organized content
export const ContentSection = ({
  header,
  children,
  className,
  headerGradient = 'from-blue-600 via-violet-600 to-blue-700',
}: {
  header: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  headerGradient?: string;
}) => (
  <div className={cn('rounded-3xl bg-white overflow-hidden', className)}>
    <div className={cn('bg-gradient-to-r text-white px-4 py-3', headerGradient)}>
      {typeof header === 'string' ? <h4>{header}</h4> : header}
    </div>
    <div className="p-4">{children}</div>
  </div>
);

// Tag List - For displaying badges/tags
export const TagList = ({ tags, className }: { tags: string[]; className?: string }) => (
  <div className={cn('flex flex-wrap gap-2', className)}>
    {tags.map((tag, index) => (
      <Badge key={index} variant="outline" className="rounded-full">
        {tag}
      </Badge>
    ))}
  </div>
);
