'use client';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { resetGlobalStatus, useStatusStore } from '@/stores/statusStore';
import { Button } from '@/stories/Button/Button';
import type { JobStatus } from '@/types/job';
import { useEffect, useMemo, useState } from 'react';
import { useShallow } from 'zustand/react/shallow';

function StatusIcon({ status }: { status: JobStatus }) {
  switch (status) {
    case 'queued':
    case 'processing':
    case 'analyzing':
      return (
        <div className="relative w-3 h-3">
          <div className="absolute inset-0 rounded-full bg-[color:var(--status-processing,#3b82f6)]/20" />
          <div
            className="absolute inset-0.5 rounded-full animate-spin"
            style={{
              background:
                'conic-gradient(from 0deg, var(--status-processing,#3b82f6), transparent 70%)',
              WebkitMask: 'radial-gradient(circle at center, transparent 55%, black 56%)',
              mask: 'radial-gradient(circle at center, transparent 55%, black 56%)',
            }}
          />
        </div>
      );
    case 'completed':
      return (
        <div className="w-3 h-3 rounded-full bg-[color:var(--status-success,#10b981)] animate-pulse" />
      );
    case 'error':
      return <div className="w-3 h-3 rounded-full bg-destructive animate-pulse" />;
    case 'idle':
    default:
      return <div className="w-3 h-3 rounded-full bg-muted-foreground/30 animate-pulse" />;
  }
}

export function StatusIndicator({ className }: { className?: string }) {
  // Zustand v5: wrap selector with useShallow
  const { status, progress, message, timestamp } = useStatusStore(
    useShallow((s) => ({
      status: s.state.status,
      progress: s.state.progress,
      message: s.state.message,
      timestamp: s.state.timestamp,
    })),
  );

  const [isOpen, setIsOpen] = useState(false);

  // Auto-close shortly after completion
  useEffect(() => {
    if (status === 'completed') {
      const t = setTimeout(() => setIsOpen(false), 1500);
      return () => clearTimeout(t);
    }
  }, [status]);

  // Ensure body can scroll when dropdown is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    }
  }, [isOpen]);

  const statusLabel = useMemo(() => status.charAt(0).toUpperCase() + status.slice(1), [status]);

  const badgeStyles = useMemo(() => {
    switch (status) {
      case 'queued':
      case 'processing':
      case 'analyzing':
        return {
          textClass: 'text-[color:var(--status-processing,#3b82f6)]',
          bgClass: 'bg-[color:var(--status-processing,#3b82f6)]/10',
        };
      case 'completed':
        return {
          textClass: 'text-[color:var(--status-success,#10b981)]',
          bgClass: 'bg-[color:var(--status-success,#10b981)]/10',
        };
      case 'error':
        return { textClass: 'text-destructive', bgClass: 'bg-destructive/10' };
      case 'idle':
      default:
        return { textClass: 'text-muted-foreground', bgClass: 'bg-muted-foreground/10' };
    }
  }, [status]);

  const progressPct =
    typeof progress === 'number' ? Math.max(0, Math.min(100, Math.round(progress))) : undefined;

  return (
    <DropdownMenu modal={false} open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          intent="glass"
          aria-label="Open system status"
          className={cn('hover:scale-100 transition-transform')}
        >
          <div className="flex items-center gap-3">
            <StatusIcon status={status} />
            <div className="flex items-center gap-2">
              <div
                className={cn(
                  'px-2 py-1 rounded-md text-xs font-medium transition-colors',
                  badgeStyles.textClass,
                  badgeStyles.bgClass,
                )}
              >
                {statusLabel}
              </div>
              {typeof progressPct === 'number' && (
                <span className="text-xs text-muted-foreground">{progressPct}%</span>
              )}
            </div>
            <div aria-hidden className="text-xs text-muted-foreground">
              ▼
            </div>
          </div>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-80 backdrop-blur-md border-0 bg-white/50 hover:cursor-pointer shadow-xl rounded-2xl"
        onWheel={(e) => e.stopPropagation()}
        onPointerDownOutside={(e) => {
          // Allow clicking outside to close, but prevent scroll events from closing on wheel
          if ((e as any).detail?.originalEvent?.type === 'wheel') {
            e.preventDefault();
          }
        }}
      >
        <div className="p-4 space-y-3">
          <div className="flex items-center gap-3">
            <StatusIcon status={status} />
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">{message}</p>
              <p className="text-xs text-muted-foreground mt-1">
                Last updated: {timestamp ? new Date(timestamp).toLocaleTimeString() : '—'}
              </p>
            </div>
          </div>

          {typeof progressPct === 'number' && (
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Progress</span>
                <span className="text-foreground font-medium">{progressPct}%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className="bg-[color:var(--status-processing,#3b82f6)] h-2 rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
            </div>
          )}

          <div className="pt-2 border-t border-[color:var(--status-border,rgba(255,255,255,0.1))]">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">System Status</span>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[color:var(--status-success,#10b981)] animate-pulse" />
                <span className="text-[color:var(--status-success,#10b981)] font-medium">
                  Online
                </span>
              </div>
            </div>

            {/* Debug reset button - only show for stuck states */}
            {(status === 'processing' || status === 'queued') && (
              <div className="mt-2 pt-2 border-t border-[color:var(--status-border,rgba(255,255,255,0.1))]">
                <Button
                  size="sm"
                  intent="secondary"
                  text="Reset Status"
                  onClick={() => {
                    console.log('🔄 Manual status reset');
                    resetGlobalStatus();
                  }}
                  className="w-full text-xs"
                />
              </div>
            )}
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
