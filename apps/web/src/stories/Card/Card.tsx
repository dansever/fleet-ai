'use client';

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
  [GradientPalette.PinkPurpleBlue]: 'from-pink-500/90 via-purple-600/90 to-blue-700/90',
  [GradientPalette.RoseFuchsiaIndigo]: 'from-rose-500/90 via-fuchsia-600/90 to-indigo-700/90',
  [GradientPalette.SkyIndigoViolet]: 'from-sky-600/90 via-indigo-700/90 to-violet-800/90',
  [GradientPalette.VioletPinkRose]: 'from-violet-600/90 via-pink-600/90 to-rose-700/90',
  [GradientPalette.CyanBluePurple]: 'from-cyan-500/90 via-blue-600/90 to-purple-700/90',
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
    <Card className={cn('rounded-3xl border-0 overflow-hidden p-0 relative group', className)}>
      <div className="absolute inset-0 pointer-events-none">
        <div
          className={cn(
            'absolute -inset-24 blur-2xl opacity-70 bg-gradient-to-br transition-all duration-500 group-hover:opacity-80',
            chosenGradient,
          )}
        />
        <div className="absolute inset-0 bg-white/10 backdrop-blur-md border border-white/20" />
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-black/5" />
      </div>

      {/* Foreground content */}
      <div className="relative z-10 p-6 text-white">
        <div className="flex items-center gap-3 mb-4 justify-between">
          <div className="flex flex-row gap-2 items-center">
            {icon && (
              <div className="p-2 bg-white/15 backdrop-blur-sm rounded-2xl border border-white/20">
                {icon}
              </div>
            )}
            <h3 className="font-semibold">{title}</h3>
          </div>
          {buttonChildren}
        </div>
        <p className="text-white/85">{description}</p>
        {bodyChildren && <div className="text-white/75 mt-3">{bodyChildren}</div>}
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
      'rounded-3xl overflow-hidden shadow-none border-0',
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
  <Card className={cn('rounded-3xl p-4 text-center gap-4 border-0 shadow-none', className)}>
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

// List Item Card - For scrollable lists with flexible content (renamed from ListItemCard)
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
      'border-0 shadow-none overflow-hidden rounded-xl p-2 transition-all duration-200 cursor-pointer w-full min-w-0',
      isSelected
        ? 'border-0 bg-gradient-to-br from-blue-200/80 via-pink-200/80 to-purple-200/80'
        : 'border-1 border-primary/20 hover:bg-gradient-to-br hover:from-blue-50/50 hover:via-pink-50/50 hover:to-purple-50/50',
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

        <div className={cn('flex-1 min-w-0', !icon && 'pl-1')}>
          <div className="w-full max-w-full">{children}</div>
        </div>
      </div>
    </CardContent>
  </Card>
);

// Badge Group - For displaying badges/tags (renamed from TagList)
export const BadgeGroup = ({ tags, className }: { tags: string[]; className?: string }) => (
  <div className={cn('flex flex-wrap gap-2', className)}>
    {tags.map((tag, index) => (
      <Badge key={index} variant="outline" className="rounded-full">
        {tag}
      </Badge>
    ))}
  </div>
);

// Main Card - For displaying main content with header and actions
export const MainCard = ({
  title,
  subtitle,
  headerActions,
  children,
  className,
  headerGradient = 'from-violet-600 via-blue-600 to-indigo-700',
  neutralHeader = false, // Added neutralHeader parameter
}: {
  title: string;
  subtitle?: string;
  headerActions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  headerGradient?: string;
  neutralHeader?: boolean; // New prop for neutral header styling
}) => (
  <Card className={cn('rounded-3xl p-0 border-0 shadow-none overflow-hidden gap-2', className)}>
    <CardHeader className="p-0">
      <div
        className={cn(
          'px-6 py-4 relative overflow-hidden',
          neutralHeader
            ? 'bg-white text-gray-900'
            : `bg-gradient-to-r text-white ${headerGradient}`,
        )}
      >
        {!neutralHeader && (
          <div className="absolute inset-0 bg-white/5 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[length:20px_20px]" />
        )}

        <div className="relative z-10 flex items-center justify-between">
          <div>
            <h3 className="text-xl font-semibold text-balance">{title}</h3>
            {subtitle && (
              <p className={cn('text-sm mt-1', neutralHeader ? 'text-gray-600' : 'text-white/80')}>
                {subtitle}
              </p>
            )}
          </div>
          {headerActions && <div className="flex items-center gap-2">{headerActions}</div>}
        </div>
      </div>
    </CardHeader>

    {/* Content area */}
    <CardContent className="p-4">{children}</CardContent>
  </Card>
);
