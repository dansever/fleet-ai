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

// Common standardized props for all cards
export interface StandardCardProps {
  className?: string;
  // Header options (either simple or custom)
  title?: string;
  subtitle?: string;
  header?: React.ReactNode; // Takes precedence over title/subtitle
  // Actions (consistent naming)
  actions?: React.ReactNode;
  // Content
  children?: React.ReactNode;
  // Optional footer
  footer?: React.ReactNode;
}

// Main Card - For displaying main content with header and actions
export const MainCard = ({
  title,
  subtitle,
  header, // Custom header option
  headerGradient = 'from-violet-600 via-blue-600 to-indigo-700',
  neutralHeader = false,
  actions,
  children,
  footer,
  className,
}: StandardCardProps & {
  headerGradient?: string;
  neutralHeader?: boolean;
}) => (
  <Card
    className={cn('rounded-3xl pt-0 pb-4 gap-2 border-0 shadow-none overflow-hidden', className)}
  >
    {(header || title) && (
      <CardHeader className="px-0">
        {header ? (
          header
        ) : (
          <div
            className={cn(
              'px-6 py-2 relative overflow-hidden',
              neutralHeader
                ? 'bg-white text-gray-900'
                : `bg-gradient-to-r text-white ${headerGradient}`,
            )}
          >
            {!neutralHeader && (
              <div className="absolute inset-0 bg-white/5 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[length:20px_20px]" />
            )}

            <div className="relative z-10 flex items-center justify-between gap-2">
              <div className="flex flex-col gap-1">
                <h3 className="text-balance">{title}</h3>
                {subtitle && (
                  <p className={cn(neutralHeader ? 'text-gray-600' : 'text-white/80')}>
                    {subtitle}
                  </p>
                )}
              </div>
              {actions && <div className="flex items-center gap-2 flex-shrink-0">{actions}</div>}
            </div>
          </div>
        )}
      </CardHeader>
    )}

    {/* Content area */}
    <CardContent>{children}</CardContent>
    {footer && <CardContent>{footer}</CardContent>}
  </Card>
);

// Feature Card - For showcasing features or services
export const FeatureCard = ({
  title,
  subtitle, // Add for consistency
  header,
  icon,
  palette = GradientPalette.VioletPinkRose,
  actions, // Renamed from buttonChildren
  children, // Renamed from bodyChildren
  footer,
  className,
}: StandardCardProps & {
  icon?: React.ReactNode;
  palette?: GradientPalette;
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
        {header ? (
          header
        ) : (
          <div className="flex items-center gap-3 mb-4 justify-between">
            <div className="flex flex-row gap-2 items-center">
              {icon && (
                <div className="p-2 bg-white/15 backdrop-blur-sm rounded-2xl border border-white/20">
                  {icon}
                </div>
              )}
              <div>
                <h3 className="font-semibold">{title}</h3>
                {subtitle && <p className="text-white/70 text-sm">{subtitle}</p>}
              </div>
            </div>
            {actions && <div className="flex items-center gap-2 flex-shrink-0">{actions}</div>}
          </div>
        )}
        <div className="text-white/85">{children}</div>
        {footer && <div className="text-white/75 mt-3">{footer}</div>}
      </div>
    </Card>
  );
};

// Project Card - For displaying projects or portfolio items
export const ProjectCard = ({
  title,
  subtitle, // Use instead of description for consistency
  header,
  imagePath,
  progress,
  badgeText,
  badgeColor,
  actions, // Clarify that children are actions
  children, // Main content
  footer,
  className,
}: StandardCardProps & {
  imagePath?: string;
  progress?: number;
  badgeText?: string | null;
  badgeColor?: string;
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
          alt={title || 'Project Image'}
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
    {(header || title) && (
      <CardHeader>
        {header ? (
          header
        ) : (
          <div className="flex items-start justify-between gap-2">
            <div>
              <CardTitle className="text-lg font-bold">{title}</CardTitle>
              {subtitle && <CardDescription className="mt-1">{subtitle}</CardDescription>}
            </div>
            {actions && <div className="flex items-center gap-2 flex-shrink-0">{actions}</div>}
          </div>
        )}
      </CardHeader>
    )}
    <CardContent>{children}</CardContent>
    {footer && <CardContent>{footer}</CardContent>}
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
  subtitle,
  header,
  value,
  change,
  icon = <TrendingUp className="w-6 h-6 text-violet-600" />,
  trend = 'up',
  actions,
  children,
  footer,
  className,
}: StandardCardProps & {
  value?: string | number;
  change?: string;
  icon?: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
}) => (
  <Card className={cn('rounded-3xl p-4 border-0 shadow-none gap-4', className)}>
    {(header || title) && (
      <div className="">
        {header ? (
          header
        ) : (
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">{title}</p>
              {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
            </div>
            {actions && <div className="flex items-center gap-2 flex-shrink-0">{actions}</div>}
          </div>
        )}
      </div>
    )}
    <div className="flex items-center justify-between">
      <div>
        {value && <h1>{value}</h1>}
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
    {children && <div className="mt-4">{children}</div>}
    {footer && <div className="mt-4 pt-4 border-t">{footer}</div>}
  </Card>
);

// Profile Card - For user profiles or team members
export const ProfileCard = ({
  title, // name
  subtitle, // role
  header,
  avatar,
  bio,
  stats,
  actions,
  children,
  footer,
  className,
}: StandardCardProps & {
  avatar?: string;
  bio?: string;
  stats?: { label: string; value: string }[];
}) => (
  <Card className={cn('rounded-3xl p-4 text-center gap-4 border-0 shadow-none', className)}>
    {header ? (
      header
    ) : (
      <>
        <Avatar className="w-20 h-20 mx-auto">
          <AvatarImage src={avatar || '/placeholder.svg'} />
          <AvatarFallback className="text-lg font-semibold bg-gradient-to-br from-violet-500 to-blue-500 text-white">
            {title
              ?.split(' ')
              .map((n) => n[0])
              .join('') || 'U'}
          </AvatarFallback>
        </Avatar>
        <div>
          <h3>{title}</h3>
          {subtitle && <p className="text-muted-foreground">{subtitle}</p>}
          {actions && <div className="flex justify-center gap-2 mt-2">{actions}</div>}
        </div>
      </>
    )}
    {bio && <p className="text-sm text-muted-foreground mb-4">{bio}</p>}
    {children && <div className="mb-4">{children}</div>}
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
    {footer && <div className="pt-4 border-t">{footer}</div>}
  </Card>
);

// List Item Card - For scrollable lists with flexible content (renamed from ListItemCard)
export const ListItemCard = ({
  title,
  subtitle,
  header,
  icon = null,
  iconBackground,
  isSelected = false,
  onClick,
  actions,
  children,
  footer,
  className,
}: StandardCardProps & {
  icon?: React.ReactNode;
  iconBackground?: string;
  isSelected?: boolean;
  onClick?: () => void;
}) => (
  <Card
    className={cn(
      'border-1 border-muted shadow-none overflow-hidden rounded-xl p-2 transition-all duration-200 cursor-pointer w-full min-w-0',
      isSelected
        ? 'border-purple-200 bg-gradient-to-br from-blue-200/80 via-purple-200/80 to-pink-200/80'
        : 'hover:bg-gradient-to-br hover:from-blue-50/50 hover:via-pink-50/50 hover:to-purple-50/50',
      className,
    )}
    onClick={onClick}
  >
    <CardContent className="px-0">
      {header ? (
        header
      ) : (
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
            <div className="flex items-start justify-between gap-2 w-full max-w-full">
              <div className="min-w-0 flex-1">
                {title && <h4 className="font-medium truncate">{title}</h4>}
                {subtitle && <p className="text-sm text-muted-foreground truncate">{subtitle}</p>}
                {children && <div className="mt-1">{children}</div>}
              </div>
              {actions && <div className="flex items-center gap-2 flex-shrink-0">{actions}</div>}
            </div>
          </div>
        </div>
      )}
      {footer && <div className="mt-2 pt-2 border-t">{footer}</div>}
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
