'use client';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { useStatusStore } from '@/stores/statusStore';
import { Button } from '@/stories/Button/Button';
import { useEffect, useMemo, useState } from 'react';

export function StatusIndicator({ className }: { className?: string }) {
  const { state } = useStatusStore();
  const [isOpen, setIsOpen] = useState(false);

  const badgeStyles = useMemo(() => {
    switch (state.status) {
      case 'idle':
        return {
          textClass: 'text-muted-foreground',
          bgClass: 'bg-muted-foreground/10',
        };
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
        return {
          textClass: 'text-destructive',
          bgClass: 'bg-destructive/10',
        };
      default:
        return {
          textClass: 'text-muted-foreground',
          bgClass: 'bg-muted-foreground/10',
        };
    }
  }, [state.status]);

  const icon = useMemo(() => {
    switch (state.status) {
      case 'idle':
        return <div className="w-3 h-3 rounded-full bg-muted-foreground/30 animate-pulse" />;
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
      default:
        return null;
    }
  }, [state.status]);

  const statusLabel = state.status.charAt(0).toUpperCase() + state.status.slice(1);

  // Ensure body can scroll when dropdown is open
  useEffect(() => {
    if (isOpen) {
      // Remove any overflow hidden that might be applied by Radix
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    }
  }, [isOpen]);

  return (
    <div className={cn('fixed top-4 right-6 z-50 print:hidden', className)}>
      <DropdownMenu modal={false} open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button intent="glass" aria-label="Open system status" className="hover:scale-105">
            <div className="flex items-center gap-3">
              {icon}
              <div className="flex items-center gap-2">
                <div
                  className={cn(
                    'px-2 py-1 rounded-md text-xs font-medium transition-colors',
                    badgeStyles.textClass,
                    badgeStyles.bgClass,
                  )}
                >
                  {state.status.charAt(0).toUpperCase() + state.status.slice(1)}
                </div>
                {state.progress !== undefined && (
                  <span className="text-xs text-muted-foreground">{state.progress}%</span>
                )}
              </div>
              <div className="text-xs text-muted-foreground">▼</div>
            </div>
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          align="end"
          className="w-80 backdrop-blur-md border-0 bg-white/50 hover:cursor-pointer shadow-xl rounded-2xl"
          onWheel={(e) => {
            // Prevent dropdown from closing when scrolling
            e.stopPropagation();
          }}
          onPointerDownOutside={(e) => {
            // Allow clicking outside to close, but prevent scroll events from closing
            if (e.detail.originalEvent.type === 'wheel') {
              e.preventDefault();
            }
          }}
        >
          <div className="p-4 space-y-3">
            <div className="flex items-center gap-3">
              {icon}
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">{state.message}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Last updated: {new Date(state.timestamp).toLocaleTimeString()}
                </p>
              </div>
            </div>

            {typeof state.progress === 'number' && (
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Progress</span>
                  <span className="text-foreground font-medium">{Math.round(state.progress)}%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className="bg-[color:var(--status-processing,#3b82f6)] h-2 rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${Math.max(0, Math.min(100, Math.round(state.progress)))}%` }}
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
            </div>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
