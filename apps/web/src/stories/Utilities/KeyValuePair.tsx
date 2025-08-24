import { formatDate } from '@/lib/core/formatters';
import { cn } from '@/lib/utils';
import type React from 'react';
import { DatePicker, ModernInput, ModernSwitch, ModernTextarea } from '../Form/Form';

// Key-Value Pair - For displaying structured information
export const KeyValuePair = ({
  label,
  value,
  valueType = 'string',
  className,
  keyClassName,
  valueClassName,
  editMode = false,
  onChange,
  name,
}: {
  label: string;
  value: string | number | boolean | Date | null;
  valueType: 'string' | 'number' | 'boolean' | 'date' | 'null';
  className?: string;
  keyClassName?: string;
  valueClassName?: string;
  editMode?: boolean;
  onChange?: (value: string | number | boolean | Date) => void;
  name?: string;
}) => (
  <div
    className={cn(
      'text-xs md:text-sm lg:text-base',
      'text-gray-600',
      'flex justify-between gap-1 py-1 border-b border-gray-100 last:border-b-0',
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
      valueType === 'string' ? (
        <ModernTextarea
          value={value}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => onChange?.(e.target.value)}
          name={name}
          className="max-w-3/5 resize-none leading-tight whitespace-pre-wrap text-left break-words min-h-[40px]"
        />
      ) : valueType === 'number' ? (
        <ModernInput
          type="number"
          value={value}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            onChange?.(e.currentTarget.valueAsNumber)
          }
          name={name}
          className="max-w-3/5"
        />
      ) : valueType === 'boolean' ? (
        <ModernSwitch checked={value} onCheckedChange={(checked: boolean) => onChange?.(checked)} />
      ) : valueType === 'date' ? (
        <DatePicker
          value={value as Date}
          onChange={(value: Date) => onChange?.(value)}
          name={name}
          triggerClassName="max-w-2/4"
        />
      ) : (
        <div className="max-w-3/5">{value instanceof Date ? formatDate(value) : value}</div>
      )
    ) : valueType === 'boolean' ? (
      <span
        className={`px-2 py-1 rounded text-xs font-medium ${
          value ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}
      >
        {value ? 'Yes' : 'No'}
      </span>
    ) : valueType === 'date' ? (
      <div className="max-w-3/5">{formatDate(value as Date)}</div>
    ) : (
      <div className="max-w-3/5">{value as string | number}</div>
    )}
  </div>
);
