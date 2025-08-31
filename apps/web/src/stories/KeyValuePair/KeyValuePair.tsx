'use client';

import type React from 'react';

import { CopyableText } from '@/components/miscellaneous/CopyableText';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { DatePicker } from '../Form/Form';

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
}) => {
  const handleChange = (newValue: string | number | boolean) => {
    onChange?.(newValue);
  };

  const renderValue = () => {
    if (editMode) {
      switch (valueType) {
        case 'string':
          return (
            <Input
              type="text"
              value={(value as string) || ''}
              onChange={(e) => handleChange(e.target.value)}
              placeholder={placeholder || `Enter ${label.toLowerCase()}`}
              className="rounded-xl border-gray-200 focus:border-blue-300 focus:ring-blue-200"
              name={name}
            />
          );
        case 'number':
          return (
            <Input
              type="number"
              value={(value as number) || ''}
              onChange={(e) => handleChange(Number(e.target.value))}
              placeholder={placeholder || '0'}
              className="rounded-xl border-gray-200 focus:border-blue-300 focus:ring-blue-200"
              name={name}
            />
          );
        case 'boolean':
          return (
            <div className="flex items-center">
              <Switch
                checked={(value as boolean) || false}
                onCheckedChange={handleChange}
                name={name}
                className="scale-125"
              />
              <span className="ml-2 text-sm text-gray-600">{value ? 'Enabled' : 'Disabled'}</span>
            </div>
          );
        case 'date':
          return (
            <DatePicker
              value={(value as string) || ''}
              onChange={(value: string) => handleChange(value)}
              triggerClassName="rounded-xl border-gray-200 focus:border-blue-300"
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
            <Input
              type="email"
              value={(value as string) || ''}
              onChange={(e) => handleChange(e.target.value)}
              placeholder={placeholder || 'Enter email address'}
              className="rounded-xl border-gray-200 focus:border-blue-300 focus:ring-blue-200"
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
          <span className={cn('text-gray-900 font-mono', valueClassName)}>
            {value !== null && value !== undefined ? (
              value.toLocaleString()
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
        'flex flex-col sm:flex-row sm:items-center py-3 border-b border-gray-100 last:border-b-0',
        className,
      )}
    >
      <div
        className={cn(
          'text-sm font-medium text-gray-700 mb-1 sm:mb-0 sm:w-1/3 sm:pr-4',
          keyClassName,
        )}
      >
        {label}
      </div>
      <div className="sm:w-2/3">{renderValue()}</div>
    </div>
  );
};

KeyValuePair.displayName = 'KeyValuePair';
