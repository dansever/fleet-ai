'use client';

import type React from 'react';

import { CopyableText } from '@/components/miscellaneous/CopyableText';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { ModernSwitch } from '@/stories/Form/Form';
import { format } from 'date-fns';
import { DatePicker, ModernInput, NumberInput } from '../Form/Form';

export interface SelectOption {
  value: string;
  label: React.ReactNode;
}

export interface KeyValuePairProps {
  label: string;
  value?: string | number | boolean | null;
  valueType: 'string' | 'number' | 'boolean' | 'date' | 'select' | 'email' | 'null';
  editMode?: boolean;
  name?: string;
  selectOptions?: SelectOption[];
  onChange?: (value: string | number | boolean) => void;
  className?: string;
  keyClassName?: string;
  valueClassName?: string;
  placeholder?: string;
  step?: number;
  min?: number;
  max?: number;
}

export const KeyValuePair: React.FC<KeyValuePairProps> = ({
  label,
  value,
  valueType,
  editMode = false,
  name,
  selectOptions = [],
  onChange,
  className = '',
  keyClassName = '',
  valueClassName = '',
  placeholder,
  step = 1,
  min = 0,
  max,
}) => {
  const handleChange = (newValue: string | number | boolean) => {
    onChange?.(newValue);
  };

  const renderValue = () => {
    if (editMode) {
      switch (valueType) {
        case 'string':
          return (
            <ModernInput
              type="text"
              value={(value as string) || ''}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange(e.target.value)}
              placeholder={placeholder || `Enter ${label.toLowerCase()}`}
              name={name}
            />
          );
        case 'number':
          return (
            <NumberInput
              value={value as number | undefined}
              onChange={(value) => handleChange(value)}
              placeholder={placeholder || '0'}
              name={name}
              step={step}
              min={min}
              max={max}
            />
          );
        case 'boolean':
          return (
            <div className="flex items-center">
              <ModernSwitch
                checked={(value as boolean) || false}
                onCheckedChange={handleChange}
                name={name}
              />
              <span className="ml-2 text-sm text-gray-600">{value ? 'Enabled' : 'Disabled'}</span>
            </div>
          );
        case 'date':
          return (
            <DatePicker
              value={(value as string) || ''}
              onChange={(value: string) => handleChange(value)}
              triggerClassName=""
            />
          );
        case 'select':
          return (
            <Select value={(value as string) || ''} onValueChange={handleChange} name={name}>
              <SelectTrigger className="rounded-xl border-gray-200 focus:border-blue-300">
                <SelectValue placeholder={placeholder || 'Select an option'} />
              </SelectTrigger>
              <SelectContent className="rounded-2xl">
                {selectOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value} className="rounded-lg">
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          );
        case 'email':
          return (
            <ModernInput
              type="email"
              value={(value as string) || ''}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange(e.target.value)}
              placeholder={placeholder || 'Enter email address'}
              name={name}
            />
          );
        default:
          return <span className="text-gray-400 italic">No value</span>;
      }
    }

    // Display mode
    switch (valueType) {
      case 'string':
        return (
          <span className={cn('text-gray-900', valueClassName)}>
            {value || <span className="text-gray-400 italic">Not set</span>}
          </span>
        );
      case 'number':
        return (
          <span className={cn('text-gray-900', valueClassName)}>
            {value !== null && value !== undefined ? (
              Number(value).toLocaleString()
            ) : (
              <span className="text-gray-400 italic">Not set</span>
            )}
          </span>
        );
      case 'boolean':
        return (
          <div className="flex items-center">
            <div
              className={cn('w-2 h-2 rounded-full mr-2', value ? 'bg-green-500' : 'bg-gray-400')}
            />
            <span
              className={cn('text-sm', value ? 'text-green-700' : 'text-gray-600', valueClassName)}
            >
              {value ? 'Yes' : 'No'}
            </span>
          </div>
        );
      case 'date':
        return (
          <span className={cn('text-gray-900', valueClassName)}>
            {value ? (
              format(new Date(value as string), 'MMM dd, yyyy')
            ) : (
              <span className="text-gray-400 italic">Not set</span>
            )}
          </span>
        );
      case 'select':
        const selectedOption = selectOptions.find((opt) => opt.value === value);
        return (
          <span className={cn('text-gray-900', valueClassName)}>
            {selectedOption?.label || <span className="text-gray-400 italic">Not selected</span>}
          </span>
        );
      case 'email':
        return value ? (
          <div className="flex items-center">
            <CopyableText value={value as string} />
          </div>
        ) : (
          <span className="text-gray-400 italic">No email</span>
        );
      case 'null':
      default:
        return <span className="text-gray-400 italic">No value</span>;
    }
  };

  return (
    <div
      className={cn(
        'flex flex-col sm:flex-row gap-1 sm:items-center py-1.5 border-b border-gray-100 last:border-b-0',
        className,
      )}
    >
      <div
        className={cn(
          'text-sm font-medium sm:w-1/3 sm:pr-1 break-words whitespace-normal',
          keyClassName,
        )}
      >
        {label}
      </div>
      <div className="sm:w-2/3 text-sm">{renderValue()}</div>
    </div>
  );
};

KeyValuePair.displayName = 'KeyValuePair';
