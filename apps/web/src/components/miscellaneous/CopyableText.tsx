'use client';

import { cn } from '@/lib/utils';
import { CopyIcon } from 'lucide-react';
import * as React from 'react';
import { toast } from 'sonner';

type RenderFn = (args: { copied: boolean }) => React.ReactNode;

export type CopyableTextProps = Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  'onClick' | 'children'
> & {
  value: string; // text to copy
  resetDelay?: number; // ms to reset "copied" state
  onCopied?: () => void; // callback after successful copy
  children?: React.ReactNode | RenderFn; // optional render control
};

export const CopyableText = React.forwardRef<HTMLButtonElement, CopyableTextProps>(
  ({ value, resetDelay = 1500, onCopied, title, className, children, ...buttonProps }, ref) => {
    const [copied, setCopied] = React.useState(false);
    const timerRef = React.useRef<number | null>(null);

    React.useEffect(() => {
      return () => {
        if (timerRef.current) window.clearTimeout(timerRef.current);
      };
    }, []);

    const handleCopy = async (e: React.MouseEvent<HTMLButtonElement>) => {
      try {
        await navigator.clipboard.writeText(value);
        setCopied(true);
        onCopied?.();
        if (resetDelay > 0) {
          timerRef.current = window.setTimeout(() => setCopied(false), resetDelay);
        }
        toast.info('Copied to clipboard');
      } catch (err) {
        // optional: surface error or toast
        console.error('Copy failed', err);
      }

      // Do not stop consumers from also listening to onClick
      buttonProps.onChange?.(e);
    };

    const content =
      typeof children === 'function' ? (children as RenderFn)({ copied }) : (children ?? value);

    return (
      <button
        ref={ref}
        type="button"
        onClick={handleCopy}
        title={title ?? value}
        aria-label={title ?? 'Copy to clipboard'}
        data-state={copied ? 'copied' : 'idle'}
        className={cn(
          'w-full cursor-pointer flex flex-row items-center text-left gap-1 opacity-90 hover:opacity-100 hover:scale-102 transition-all',
          className,
        )}
        {...buttonProps}
      >
        {/* Text with truncation */}
        <span className="truncate flex-1">{content}</span>

        {/* Always show copy icon */}
        <CopyIcon className="h-4 w-4 flex-shrink-0" />
      </button>
    );
  },
);

CopyableText.displayName = 'CopyableText';
