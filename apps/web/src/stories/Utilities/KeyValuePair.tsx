import { cn } from '@/lib/utils';
import type React from 'react';
import { ModernInput, ModernSwitch, ModernTextarea } from '../Form/Form';

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

    {editMode ? (
      typeof value === 'string' ? (
        <ModernTextarea
          value={value}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => onChange?.(e.target.value)}
          name={name}
          className="max-w-3/5 resize-none leading-tight whitespace-pre-wrap text-left break-words min-h-[40px]"
        />
      ) : typeof value === 'number' ? (
        <ModernInput
          type="number"
          value={value}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            onChange?.(e.currentTarget.valueAsNumber)
          }
          name={name}
          className="max-w-3/5"
        />
      ) : typeof value === 'boolean' ? (
        <ModernSwitch checked={value} onCheckedChange={(checked: boolean) => onChange?.(checked)} />
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
  </div>
);
