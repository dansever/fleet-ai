'use client';

import type React from 'react';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { formatDate } from '@/lib/core/formatters';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { ChevronDown, Eye, EyeOff, Minus, Plus, Search, Upload, X } from 'lucide-react';
import { useEffect, useState } from 'react';

export const formStyles = {
  // Base input styling - consistent across all form elements
  input: cn(
    'h-11 px-4 py-2 text-sm font-medium',
    'rounded-xl border border-slate-200 bg-white',
    'placeholder:text-slate-400 placeholder:font-normal',
    'transition-all duration-200',
    'focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:ring-offset-0',
    'hover:border-slate-300',
    'disabled:bg-slate-50 disabled:text-slate-500 disabled:cursor-not-allowed',
  ),

  // Label styling
  label: cn('text-sm font-semibold text-slate-700 mb-2 block'),

  // Error styling
  error: cn('text-xs font-medium text-red-600 mt-1'),

  // Helper text styling
  helper: cn('text-xs text-slate-500 mt-1'),
};

export const ModernInput = ({
  label,
  error,
  helper,
  placeholder,
  type = 'text',
  className,
  icon,
  ...props
}: {
  label?: string;
  error?: string;
  helper?: string;
  placeholder?: string;
  type?: string;
  className?: string;
  icon?: React.ReactNode;
  [key: string]: unknown;
}) => (
  <div className="w-full">
    {label && <label className={formStyles.label}>{label}</label>}
    <div className="relative">
      {icon && (
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400">
          {icon}
        </div>
      )}
      <Input
        type={type}
        autoComplete="off"
        placeholder={placeholder}
        className={cn(
          formStyles.input,
          icon && 'pl-10',
          error && 'border-red-300 focus:border-red-500 focus:ring-red-500/20',
          className,
        )}
        {...props}
      />
    </div>
    {error && <p className={formStyles.error}>{error}</p>}
    {helper && !error && <p className={formStyles.helper}>{helper}</p>}
  </div>
);

export const SearchInput = ({
  label,
  placeholder = 'Search...',
  className,
  ...props
}: {
  label?: string;
  placeholder?: string;
  className?: string;
  [key: string]: unknown;
}) => (
  <div className="w-full">
    {label && <label className={formStyles.label}>{label}</label>}
    <div className="relative">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
      <Input
        type="search"
        autoComplete="off"
        placeholder={placeholder}
        className={cn(formStyles.input, 'pl-10', className)}
        {...props}
      />
    </div>
  </div>
);

export const PasswordInput = ({
  label,
  error,
  helper,
  placeholder = 'Enter password',
  className,
  ...props
}: {
  label?: string;
  error?: string;
  helper?: string;
  placeholder?: string;
  className?: string;
  [key: string]: unknown;
}) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="w-full">
      {label && <label className={formStyles.label}>{label}</label>}
      <div className="relative">
        <Input
          type={showPassword ? 'text' : 'password'}
          placeholder={placeholder}
          className={cn(
            formStyles.input,
            'pr-10',
            error && 'border-red-300 focus:border-red-500 focus:ring-red-500/20',
            className,
          )}
          {...props}
        />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 hover:bg-slate-100"
          onClick={() => setShowPassword(!showPassword)}
        >
          {showPassword ? (
            <EyeOff className="h-4 w-4 text-slate-400" />
          ) : (
            <Eye className="h-4 w-4 text-slate-400" />
          )}
          <span className="sr-only">{showPassword ? 'Hide password' : 'Show password'}</span>
        </Button>
      </div>
      {error && <p className={formStyles.error}>{error}</p>}
      {helper && !error && <p className={formStyles.helper}>{helper}</p>}
    </div>
  );
};

export const NumberInput = ({
  label,
  error,
  helper,
  placeholder,
  min,
  max,
  step = 1,
  className,
  value,
  onChange,
  ...props
}: {
  label?: string;
  error?: string;
  helper?: string;
  placeholder?: string;
  min?: number;
  max?: number;
  step?: number;
  className?: string;
  value?: number;
  onChange?: (value: number) => void;
  [key: string]: unknown;
}) => {
  const handleIncrement = () => {
    const newValue = (value || 0) + step;
    if (max === undefined || newValue <= max) {
      onChange?.(newValue);
    }
  };

  const handleDecrement = () => {
    const newValue = (value || 0) - step;
    if (min === undefined || newValue >= min) {
      onChange?.(newValue);
    }
  };

  return (
    <div className="w-full">
      <div className="relative">
        <Input
          type="number"
          placeholder={placeholder}
          min={min}
          max={max}
          step={step}
          value={value || ''}
          onChange={(e) => onChange?.(Number.parseFloat(e.target.value) || 0)}
          className={cn(
            formStyles.input,
            error && 'border-red-300 focus:border-red-500 focus:ring-red-500/20',
            className,
          )}
          {...props}
        />
        <div className="absolute right-1 top-1/2 transform -translate-y-1/2 flex">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-8 w-6 p-0 hover:bg-slate-100"
            onClick={handleDecrement}
            disabled={min !== undefined && (value || 0) <= min}
          >
            <Minus className="h-3 w-3 text-slate-400" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-8 w-6 p-0 hover:bg-slate-100"
            onClick={handleIncrement}
            disabled={max !== undefined && (value || 0) >= max}
          >
            <Plus className="h-3 w-3 text-slate-400" />
          </Button>
        </div>
      </div>
      {error && <p className={formStyles.error}>{error}</p>}
      {helper && !error && <p className={formStyles.helper}>{helper}</p>}
    </div>
  );
};

export const ModernTextarea = ({
  label,
  error,
  helper,
  placeholder,
  className,
  rows = 4,
  ...props
}: {
  label?: string;
  error?: string;
  helper?: string;
  placeholder?: string;
  className?: string;
  rows?: number;
  [key: string]: unknown;
}) => (
  <div className="w-full">
    {label && <label className={formStyles.label}>{label}</label>}
    <Textarea
      placeholder={placeholder}
      autoComplete="off"
      rows={rows}
      className={cn(
        formStyles.input,
        'min-h-[80px] max-h-[200px] resize-y',
        error && 'border-red-300 focus:border-red-500 focus:ring-red-500/20',
        className,
      )}
      {...props}
    />
    {error && <p className={formStyles.error}>{error}</p>}
    {helper && !error && <p className={formStyles.helper}>{helper}</p>}
  </div>
);

export const ModernSelect = ({
  label,
  error,
  helper,
  placeholder = 'Select an option',
  options,
  TriggerClassName,
  ...props
}: {
  label?: string;
  error?: string;
  helper?: string;
  placeholder?: string;
  options: { value: string; label: React.ReactNode }[];
  TriggerClassName?: string;
  [key: string]: unknown;
}) => (
  <div className="w-full">
    {label && <label className={formStyles.label}>{label}</label>}
    <Select {...props}>
      <SelectTrigger
        className={cn(
          formStyles.input,
          'cursor-pointer',
          error && 'border-red-300 focus:border-red-500 focus:ring-red-500/20',
          TriggerClassName,
        )}
      >
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent className="rounded-xl border border-slate-200 bg-white">
        {options.map((option) => (
          <SelectItem
            key={option.value}
            value={option.value}
            className="rounded-lg py-2 px-3 text-sm font-medium hover:bg-slate-50 focus:bg-slate-50"
          >
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
    {error && <p className={formStyles.error}>{error}</p>}
    {helper && !error && <p className={formStyles.helper}>{helper}</p>}
  </div>
);

export const ModernSwitch = ({
  label,
  description,
  className,
  ...props
}: {
  label?: string;
  description?: string;
  className?: string;
  [key: string]: unknown;
}) => (
  <div className="flex items-start space-x-3">
    <Switch {...props} className="mt-1" />
    {(label || description) && (
      <div className="flex-1">
        {label && <p className="text-sm font-semibold text-slate-700">{label}</p>}
        {description && <p className="text-xs text-slate-500 mt-1">{description}</p>}
      </div>
    )}
  </div>
);

export const DatePicker = ({
  label,
  error,
  helper,
  value = undefined,
  onChange,
  fromYear = 2020,
  toYear = 2030,
  className,
  ...props
}: {
  label?: string;
  error?: string;
  helper?: string;
  value?: string;
  onChange?: (value: string) => void;
  fromYear?: number;
  toYear?: number;
  className?: string;
  [key: string]: unknown;
}) => {
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState<Date | undefined>(value ? new Date(value) : undefined);

  useEffect(() => {
    setDate(value ? new Date(value) : undefined);
  }, [value]);

  return (
    <div className="w-full">
      {label && <label className={formStyles.label}>{label}</label>}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              formStyles.input,
              'justify-between font-normal',
              !date && 'text-slate-400',
              error && 'border-red-300 focus:border-red-500 focus:ring-red-500/20',
              className,
            )}
          >
            {date ? formatDate(date) : 'Select date'}
            <ChevronDown className="h-4 w-4 text-slate-400" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0 border border-slate-200 rounded-xl" align="start">
          <Calendar
            mode="single"
            className="rounded-xl"
            selected={date}
            captionLayout="dropdown"
            onSelect={(date) => {
              if (!date) return;
              const localDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
              setDate(localDate);
              onChange?.(format(localDate, 'yyyy-MM-dd'));
              setOpen(false);
            }}
            fromYear={fromYear}
            toYear={toYear}
          />
        </PopoverContent>
      </Popover>
      {error && <p className={formStyles.error}>{error}</p>}
      {helper && !error && <p className={formStyles.helper}>{helper}</p>}
    </div>
  );
};

export const FileUpload = ({
  label,
  error,
  helper,
  accept,
  multiple = false,
  className,
  onFileSelect,
  ...props
}: {
  label?: string;
  error?: string;
  helper?: string;
  accept?: string;
  multiple?: boolean;
  className?: string;
  onFileSelect?: (files: FileList | null) => void;
  [key: string]: unknown;
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [files, setFiles] = useState<File[]>([]);

  const handleFiles = (fileList: FileList | null) => {
    if (fileList) {
      const newFiles = Array.from(fileList);
      setFiles(multiple ? [...files, ...newFiles] : newFiles);
      onFileSelect?.(fileList);
    }
  };

  const removeFile = (index: number) => {
    const newFiles = files.filter((_, i) => i !== index);
    setFiles(newFiles);
  };

  return (
    <div className="w-full">
      {label && <label className={formStyles.label}>{label}</label>}
      <div
        className={cn(
          'relative border-2 border-dashed rounded-xl p-6 text-center transition-colors',
          dragActive ? 'border-blue-500 bg-blue-50' : 'border-slate-300 hover:border-slate-400',
          error && 'border-red-300',
          className,
        )}
        onDragEnter={() => setDragActive(true)}
        onDragLeave={() => setDragActive(false)}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          setDragActive(false);
          handleFiles(e.dataTransfer.files);
        }}
      >
        <input
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={(e) => handleFiles(e.target.files)}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          {...props}
        />
        <Upload className="mx-auto h-8 w-8 text-slate-400 mb-2" />
        <p className="text-sm font-medium text-slate-600 mb-1">
          Drop files here or click to browse
        </p>
        <p className="text-xs text-slate-400">
          {accept ? `Accepted formats: ${accept}` : 'All file types accepted'}
        </p>
      </div>

      {files.length > 0 && (
        <div className="mt-3 space-y-2">
          {files.map((file, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-2 bg-slate-50 rounded-lg"
            >
              <span className="text-sm font-medium text-slate-700 truncate">{file.name}</span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 hover:bg-slate-200"
                onClick={() => removeFile(index)}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {error && <p className={formStyles.error}>{error}</p>}
      {helper && !error && <p className={formStyles.helper}>{helper}</p>}
    </div>
  );
};
