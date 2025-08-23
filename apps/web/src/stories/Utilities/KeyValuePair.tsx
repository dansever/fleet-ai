import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import type React from 'react';

// Key-Value Pair - For displaying structured information
export const KeyValuePair = ({
  label,
  value,
  className,
  keyClassName,
  valueClassName,
  editMode = false,
  onChange,
  name,
}: {
  label: string;
  value: string | number | boolean | React.ReactNode;
  className?: string;
  keyClassName?: string;
  valueClassName?: string;
  editMode?: boolean;
  onChange?: (value: string | number | boolean) => void;
  name?: string;
}) => (
  <div
    className={cn(
      'text-xs md:text-sm lg:text-base',
      'text-gray-600',
      'flex justify-between gap-2 py-1 border-b border-gray-100 last:border-b-0',
      className,
    )}
  >
    <span
      className={cn(
        'text-xs md:text-sm lg:text-base',
        'text-gray-600',
        'font-semibold max-w-2/5 line-clamp-2 break-words',
        keyClassName,
      )}
    >
      {label}
    </span>

    <span className={cn('text-left', valueClassName)}>
      {editMode ? (
        typeof value === 'string' ? (
          <Textarea
            value={value}
            onChange={(e) => onChange?.(e.target.value)}
            name={name}
            rows={2}
            className="w-full resize-none min-h-[2.5rem] leading-tight whitespace-pre-wrap break-words"
          />
        ) : typeof value === 'number' ? (
          <Input
            type="number"
            value={value}
            onChange={(e) => onChange?.(e.currentTarget.valueAsNumber)}
            name={name}
            className="w-full"
          />
        ) : typeof value === 'boolean' ? (
          <Switch
            checked={value}
            onCheckedChange={(checked) => onChange?.(checked)} // keep boolean
            name={name}
          />
        ) : (
          value
        )
      ) : typeof value === 'boolean' ? (
        <span
          className={`px-2 py-1 rounded text-xs font-medium ${
            value ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}
        >
          {value ? 'Yes' : 'No'}
        </span>
      ) : (
        value
      )}
    </span>
  </div>
);
