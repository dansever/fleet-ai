import { formatDate } from '@/lib/core/formatters';
import { cn } from '@/lib/utils';
import type React from 'react';
import { DatePicker, ModernInput, ModernSelect, ModernSwitch, ModernTextarea } from '../Form/Form';

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
  selectOptions,
}: {
  label: string;
  value: string | number | boolean | Date | null;
  valueType: 'string' | 'number' | 'boolean' | 'date' | 'select' | 'null';
  className?: string;
  keyClassName?: string;
  valueClassName?: string;
  editMode?: boolean;
  onChange?: (value: string | number | boolean | Date) => void;
  name?: string;
  selectOptions?: { value: string; label: string }[];
}) => (
  <div
    className={cn(
      'text-sm',
      'text-gray-600 items-center',
      'flex justify-between gap-1 py-1 border-b border-gray-100 last:border-b-0',
      className,
    )}
  >
    <span
      className={cn(
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
          value={value ? value : ''}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => onChange?.(e.target.value)}
          name={name}
          className="max-w-3/5 resize-none leading-tight whitespace-pre-wrap text-left break-words min-h-[40px]"
        />
      ) : valueType === 'number' ? (
        <ModernInput
          type="number"
          value={value ?? ''}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            onChange?.(e.currentTarget.valueAsNumber)
          }
          min={0}
          name={name}
          className="min-w-3/5"
        />
      ) : valueType === 'boolean' ? (
        <ModernSwitch
          checked={!!value}
          onCheckedChange={(checked: boolean) => onChange?.(checked)}
        />
      ) : valueType === 'date' ? (
        <DatePicker
          value={(value as string) ?? ''}
          onChange={(value: string) => onChange?.(value)}
          name={name}
          triggerClassName="max-w-3/5 flex-1"
        />
      ) : valueType === 'select' ? (
        <ModernSelect
          value={(value as string) ?? ''}
          onValueChange={(value: string) => onChange?.(value)}
          options={selectOptions || []}
          triggerClassName="flex-1 min-w-2/5 max-w-3/5"
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
      <div className="max-w-3/5">{formatDate(value as string)}</div>
    ) : (
      <div className="max-w-4/5">
        {value instanceof Date ? formatDate(value) : (value as string | number)}
      </div>
    )}
  </div>
);
