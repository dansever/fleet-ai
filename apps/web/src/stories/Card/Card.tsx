'use client';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { TrendingUp } from 'lucide-react';
import type React from 'react';
import { forwardRef } from 'react';

// Common standardized props for all cards
export interface StandardCardProps extends React.ComponentPropsWithoutRef<typeof Card> {
  className?: string;
  // Header options (either simple or custom)
  header?: React.ReactNode; // Takes precedence over title/subtitle
  headerClassName?: string;
  title?: string;
  subtitle?: string;
  icon?: React.ReactNode;
  actions?: React.ReactNode;
  // Content
  body?: React.ReactNode;
  // footer
  footer?: React.ReactNode;
  children?: React.ReactNode;
}

// Surface Card - Minimal base surface for custom layouts
export const BaseCard = ({
  className,
  headerClassName,
  header,
  title,
  subtitle,
  actions,
  children,
}: StandardCardProps) => (
  <Card className={cn('w-full rounded-3xl shadow-none border-0 overflow-hidden pt-0', className)}>
    {header
      ? header
      : (title || subtitle) && (
          <CardHeader
            className={cn(
              'py-2 flex flex items-center justify-between',
              'bg-gradient-to-r',
              headerClassName,
            )}
          >
            <div className="flex flex-col space-y-0 flex-1">
              <h3>{title}</h3>
              <h5>{subtitle}</h5>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">{actions}</div>
          </CardHeader>
        )}
    {children}
  </Card>
);

/**
 * MetricCard
 * - Minimal, flexible API
 * - Beautiful defaults with full override capability
 * - Sensible a11y and resilience for undefined/empty props
 */

export type MetricCardProps = {
  /** Main label shown at the top-left */
  title?: React.ReactNode;
  /** Optional smaller text under the title */
  subtitle?: React.ReactNode;

  /** Primary value. Accepts string, number or a custom node (e.g., <span>12%</span>) */
  value?: React.ReactNode;

  /**
   * Optional change indicator (e.g., "+12% MoM" or "-3.1% since yesterday").
   * If `changeClassName` is not provided, color is inferred automatically:
   *  - leading '-' → negative (red)
   *  - leading '+' or no sign → positive (green)
   *  - set `neutralChange` true to force neutral color
   */
  change?: React.ReactNode;
  neutralChange?: boolean;
  changeClassName?: string; // full override for change color/typography
  changeVisuallyHiddenLabel?: string; // a11y helper for screen readers

  /** Optional right-side icon */
  icon?: React.ReactNode;
  /** Background classes for the icon container */
  iconBgClassName?: string;

  /** Fully custom header override (replaces title/subtitle/actions area) */
  header?: React.ReactNode;
  /** Right-aligned header actions (buttons, menus, etc.) */
  actions?: React.ReactNode;

  /** Optional content below the stat row */
  children?: React.ReactNode;
  /** Optional footer separated by a divider */
  footer?: React.ReactNode;

  /** Layout/style overrides */
  className?: string;
} & React.ComponentPropsWithoutRef<typeof Card>;

const inferChangeTone = (
  change: React.ReactNode,
  neutral?: boolean,
): 'positive' | 'negative' | 'neutral' => {
  if (neutral) return 'neutral';
  if (typeof change === 'string') {
    const trimmed = change.trim();
    if (trimmed.startsWith('-')) return 'negative';
    if (trimmed.startsWith('+')) return 'positive';
  }
  if (typeof change === 'number') return change < 0 ? 'negative' : 'positive';
  return 'neutral';
};

export const MetricCard = forwardRef<HTMLDivElement, MetricCardProps>(
  (
    {
      title,
      subtitle,
      value,
      change,
      neutralChange,
      changeClassName,
      changeVisuallyHiddenLabel,
      icon = <TrendingUp className="w-5 h-5" aria-hidden="true" />,
      iconBgClassName = 'p-2 rounded-2xl bg-gradient-to-br from-violet-200 to-blue-100',
      header,
      actions,
      children,
      footer,
      className,
      ...cardProps
    },
    ref,
  ) => {
    const tone = inferChangeTone(change ?? '', neutralChange);

    const toneClass =
      changeClassName ??
      (tone === 'positive'
        ? 'text-green-600'
        : tone === 'negative'
          ? 'text-red-600'
          : 'text-muted-foreground');

    return (
      <Card
        ref={ref}
        className={cn(
          'rounded-3xl border-0 px-4 py-1 sm:py-2 md:py-3',
          'flex flex-col gap-4',
          className,
        )}
        {...cardProps}
      >
        {(header || title) && (
          <div className="flex items-start justify-between gap-3">
            {header ? (
              header
            ) : (
              <div className="min-w-0">
                {title && (
                  <p
                    className="text-sm font-medium text-muted-foreground truncate"
                    title={typeof title === 'string' ? title : undefined}
                  >
                    {title}
                  </p>
                )}
                {subtitle && (
                  <p
                    className="text-xs text-muted-foreground/80 truncate"
                    title={typeof subtitle === 'string' ? subtitle : undefined}
                  >
                    {subtitle}
                  </p>
                )}
              </div>
            )}
            {actions && <div className="flex items-center gap-2 flex-shrink-0">{actions}</div>}
          </div>
        )}

        <div className="flex items-center justify-between gap-4">
          <div className="min-w-0">
            {value !== undefined && value !== null && (
              <h3 className="text-2xl sm:text-3xl font-semibold leading-tight tracking-tight">
                {value}
              </h3>
            )}
            {change !== undefined && change !== null && (
              <p className={cn('text-sm mt-1', toneClass)}>
                {changeVisuallyHiddenLabel && (
                  <span className="sr-only">{changeVisuallyHiddenLabel}</span>
                )}
                {change}
              </p>
            )}
          </div>

          {icon && (
            <div className={cn('flex-shrink-0', iconBgClassName)} aria-hidden="true">
              {icon}
            </div>
          )}
        </div>

        {children && <div className="mt-1">{children}</div>}

        {footer && <div className="mt-3 pt-3 border-t">{footer}</div>}
      </Card>
    );
  },
);

// List Item Card - For scrollable lists with flexible content (renamed from ListItemCard)
export const ListItemCard = ({
  title,
  subtitle,
  header,
  icon = null,
  iconBackgroundClassName,
  isSelected = false,
  onClick,
  actions,
  children,
  footer,
  className,
}: StandardCardProps & {
  icon?: React.ReactNode;
  iconBackgroundClassName?: string;
  isSelected?: boolean;
  onClick?: () => void;
}) => (
  <Card
    className={cn(
      'border border-muted bg-gradient-to-br shadow-none overflow-hidden rounded-xl p-2 transition-colors duration-300 ease-in-out cursor-pointer w-full min-w-0',
      isSelected
        ? 'border-purple-100 from-blue-200/40 via-purple-200/40 to-orange-100'
        : 'hover:from-blue-50/50 hover:via-purple-50/50 hover:to-orange-50/50',
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
                iconBackgroundClassName,
              )}
            >
              {icon}
            </div>
          )}

          <div className={cn('flex-1 min-w-0')}>
            <div className="flex items-start justify-between gap-2 w-full max-w-full">
              <div className="min-w-0 flex-1">
                {title && <h4 className="font-medium truncate">{title}</h4>}
                {subtitle && <p className="text-sm text-muted-foreground truncate">{subtitle}</p>}
                {children && <div>{children}</div>}
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
