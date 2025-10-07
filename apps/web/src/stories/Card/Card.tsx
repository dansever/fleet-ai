'use client';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type React from 'react';
import { forwardRef } from 'react';

// ==============================================================
// CardProps
// ==============================================================

export interface CardProps extends React.ComponentPropsWithoutRef<typeof Card> {
  className?: string;
  cardType?: 'main' | 'inner';
  // Header options (either simple or custom)
  header?: React.ReactNode; // Takes precedence over title/subtitle
  headerClassName?: string;
  title?: string;
  subtitle?: string | React.ReactNode;
  icon?: React.ReactNode;
  actions?: React.ReactNode;
  // footer
  footer?: React.ReactNode;
  // children
  children?: React.ReactNode;
  contentClassName?: string;
}

// ==============================================================
// BaseCard
// ==============================================================

export const BaseCard = ({
  className,
  cardType = 'main',
  headerClassName,
  header,
  icon,
  title,
  subtitle,
  actions,
  children,
  contentClassName,
  footer,
}: CardProps) => {
  const hasHeaderParams = header || title || subtitle || actions;
  return (
    <Card
      className={cn(
        'w-full rounded-3xl border-slate-200 shadow-none overflow-hidden',
        hasHeaderParams && 'pt-0',
        { 'gap-2': cardType === 'inner' },
        className,
      )}
    >
      {hasHeaderParams ? (
        <CardHeader
          className={cn(
            { 'px-4 lg:px-6': cardType === 'inner' },
            'pt-4 pb-1 bg-gradient-to-r',
            headerClassName,
          )}
        >
          {header
            ? header
            : (title || subtitle || actions) && (
                <div className={cn('flex flex-row items-start justify-between gap-2')}>
                  <div className="flex flex-col flex-1 w-full items-start justify-between gap-0">
                    <div className="flex flex-row items-center gap-2">
                      {icon && icon}
                      <div className="flex flex-col gap-1">
                        {cardType === 'main' ? <h2>{title}</h2> : <h3>{title}</h3>}
                        {typeof subtitle === 'string' ? (
                          <div className="leading-tight">{subtitle}</div>
                        ) : (
                          subtitle
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 max-w-3/5">{actions}</div>
                </div>
              )}
        </CardHeader>
      ) : null}
      <CardContent className={cn({ 'px-4 lg:px-6': cardType === 'inner' }, contentClassName)}>
        {children}
      </CardContent>
      {footer && <CardFooter>{footer}</CardFooter>}
    </Card>
  );
};

// ==============================================================
// MetricCard
// ==============================================================

export type MetricTone = 'positive' | 'negative' | 'neutral';

export type MetricCardProps = React.HTMLAttributes<HTMLDivElement> & {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  /** Main KPI value. Accepts text or React node for formatting. */
  value?: React.ReactNode;
  /** Delta text, e.g. "+12% MoM" or "-3.1". */
  change?: React.ReactNode;
  /** Force tone; otherwise inferred from the first char of `change` if string. */
  tone?: MetricTone;
  /** Optional icon shown on the right. */
  icon?: React.ReactNode;
  /** Optional custom header/actions area. When provided, it replaces the default title/subtitle row. */
  header?: React.ReactNode;
  /** Optional footer content (notes, links). */
  footer?: React.ReactNode;
};

const toneToClass: Record<MetricTone, string> = {
  positive: 'text-green-600',
  negative: 'text-red-600',
  neutral: 'text-muted-foreground',
};

function inferTone(change: React.ReactNode | undefined): MetricTone {
  if (typeof change === 'string' && change.trim()) {
    const first = change.trim()[0];
    if (first === '+') return 'positive';
    if (first === '-') return 'negative';
  }
  return 'neutral';
}

export const MetricCard = forwardRef<HTMLDivElement, MetricCardProps>(
  (
    { title, subtitle, value, change, tone, icon, header, footer, className, children, ...rest },
    ref,
  ) => {
    const resolvedTone = tone ?? inferTone(change);

    return (
      <Card
        ref={ref}
        className={cn(' rounded-2xl shadow-none p-4', 'flex flex-col gap-2', className)}
        {...rest}
      >
        {(header || title) && (
          <div className="flex items-start justify-between gap-2">
            {header ? (
              header
            ) : (
              <div className="min-w-0">
                <p
                  className="truncate text-sm font-medium text-muted-foreground"
                  title={typeof title === 'string' ? title : undefined}
                >
                  {title}
                </p>
                {subtitle && (
                  <p
                    className="truncate text-xs text-muted-foreground/80"
                    title={typeof subtitle === 'string' ? subtitle : undefined}
                  >
                    {subtitle}
                  </p>
                )}
              </div>
            )}
            {icon && (
              <div
                className="flex-shrink-0 rounded-2xl bg-gradient-to-br from-violet-200 to-blue-100 p-2"
                aria-hidden
              >
                {icon}
              </div>
            )}
          </div>
        )}
        <div className="flex flex-col gap-1">
          {(value !== undefined || change !== undefined) && (
            <div className="flex items-end gap-4">
              {value !== undefined && (
                <h2 className="p-0 truncate font-semibold leading-tight tracking-tight flex-shrink-0">
                  {value}
                </h2>
              )}
              {change !== undefined && (
                <p className={cn('text-sm p-0 flex-1', toneToClass[resolvedTone])}>{change}</p>
              )}
            </div>
          )}
          {footer && <div className="text-xs text-muted-foreground">{footer}</div>}
        </div>
      </Card>
    );
  },
);

MetricCard.displayName = 'MetricCard';

// ==============================================================
// List Item Card
// ==============================================================

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
}: CardProps & {
  icon?: React.ReactNode;
  iconBackgroundClassName?: string;
  isSelected?: boolean;
  onClick?: () => void;
}) => (
  <Card
    className={cn(
      'border border-muted bg-gradient-to-br shadow-none overflow-hidden rounded-xl p-2 transition-colors duration-300 ease-in-out cursor-pointer w-full min-w-0',
      isSelected
        ? 'border-purple-100 from-red-100/60 via-purple-100/60 to-orange-100'
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
                {title && <p className="truncate font-semibold">{title}</p>}
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
