// apps/web/src/app/(platform)/_components/CopyableText.tsx
'use client';

import { copyToClipboard } from '@/lib/browser/copy-to-clipboard';
import { cn } from '@/lib/utils';
import { Copy } from 'lucide-react';
import { toast } from 'sonner';

interface CopyableTextProps {
  text?: string | null;
  className?: string;
}

export function CopyableText({ text, className }: CopyableTextProps) {
  const handleCopy = async () => {
    if (!text) {
      toast.info('Nothing to copy');
      return;
    }
    const success = await copyToClipboard(text);
    if (success) {
      toast.success('Copied to clipboard');
    } else {
      toast.error('Failed to copy to clipboard');
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={cn('group flex w-full items-center gap-1 cursor-pointer', className)}
      title={text ?? ''}
    >
      {/* Text should take all leftover space and truncate */}
      <span className="flex-1 truncate">{text}</span>

      {/* Icon should never shrink, always visible */}
      <Copy className="h-4 w-4 transition group-hover:scale-105 shrink-0" />
    </button>
  );
}
