'use client';

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
import { Button } from '@/stories/Button/Button';
import { format } from 'date-fns';
import { ChevronDown, Eye, EyeOff, Search } from 'lucide-react';
import { useState } from 'react';

// Modern Input Field
export const ModernInput = ({
  placeholder,
  type = 'text',
  className,
  icon,
  ...props
}: {
  placeholder?: string;
  type?: string;
  className?: string;
  icon?: React.ReactNode;
  [key: string]: any;
}) => (
  <div className="relative">
    {icon && <div className="absolute left-3 top-1/2 transform -translate-y-1/2">{icon}</div>}
    <Input
      type={type}
      autoComplete="off"
      placeholder={placeholder}
      className={cn(
        'w-full rounded-xl border-2 pr-4 focus:border-primary/50 focus:ring-0',
        icon && 'pl-10',
        className,
      )}
      {...props}
    />
  </div>
);

// Search Input
export const SearchInput = ({
  placeholder = 'Search...',
  className,
  ...props
}: {
  placeholder?: string;
  className?: string;
  [key: string]: any;
}) => (
  <div className="relative w-full">
    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
    <Input
      type="search"
      autoComplete="off"
      placeholder={placeholder}
      className="w-full rounded-2xl bg-muted pl-9 pr-4 border-0 focus:ring-2 focus:ring-primary/20"
      {...props}
    />
  </div>
);

// Password Input with toggle
export const PasswordInput = ({
  placeholder = 'Enter password',
  className,
  ...props
}: {
  placeholder?: string;
  className?: string;
  [key: string]: any;
}) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="relative w-full">
      <Input
        type={showPassword ? 'text' : 'password'}
        placeholder={placeholder}
        className="w-full rounded-2xl border-2 focus:border-primary/50 focus:ring-0 pr-10"
        {...props}
      />
      <Button
        intent="ghost"
        size="sm"
        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
        onClick={() => setShowPassword(!showPassword)}
        text={showPassword ? 'Hide password' : 'Show password'}
        icon={showPassword ? EyeOff : Eye}
      />
    </div>
  );
};

// Modern Textarea
export const ModernTextarea = ({
  placeholder,
  className,
  ...props
}: {
  placeholder?: string;
  className?: string;
  [key: string]: any;
}) => (
  <Textarea
    placeholder={placeholder}
    autoComplete="off"
    className={cn(
      'rounded-2xl border-2 focus:border-primary/50 focus:ring-0',
      'min-h-[60px] max-h-[160px]',
      className,
    )}
    {...props}
  />
);

// Modern Select
export const ModernSelect = ({
  placeholder = 'Select an option',
  options,
  triggerClassName,
  ...props
}: {
  placeholder?: string;
  options: { value: string; label: React.ReactNode }[];
  triggerClassName?: string;
  [key: string]: any;
}) => {
  const selected = options.find((opt) => opt.value === props.value);

  return (
    <Select {...props}>
      <SelectTrigger
        className={cn('rounded-xl border-2 focus:border-primary/50 focus:ring-0', triggerClassName)}
      >
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent className="rounded-2xl">
        {options.map((option) => (
          <SelectItem
            key={option.value}
            value={option.value}
            className="whitespace-normal py-2 leading-snug text-left min-h-[40px]"
          >
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

// Switch with modern styling
export const ModernSwitch = ({
  className,
  ...props
}: {
  className?: string;
  [key: string]: any;
}) => <Switch {...props} className="cursor-pointer scale-125" />;

// DatePicker component with modern styling
export const DatePicker = ({
  value = undefined,
  onChange,
  fromYear = 2025,
  toYear = 2030,
  triggerClassName,
  calendarClassName,
  ...props
}: {
  value?: string;
  onChange?: (value: string) => void;
  fromYear?: number;
  toYear?: number;
  [key: string]: any;
}) => {
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState<Date | undefined>(value ? new Date(value) : undefined);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          intent="secondary"
          id="date"
          className={cn('w-full justify-start font-normal', triggerClassName)}
          text={date ? formatDate(date) : 'Select date'}
          icon={ChevronDown}
        />
      </PopoverTrigger>
      <PopoverContent className="w-auto overflow-hidden p-0 border-0 rounded-2xl" align="start">
        <Calendar
          mode="single"
          className={cn(
            'rounded-2xl border-2 focus:border-primary/50 focus:ring-0',
            calendarClassName,
          )}
          selected={date}
          captionLayout="dropdown"
          onSelect={(date) => {
            if (!date) return;
            const localDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
            setDate(localDate);
            onChange?.(format(localDate, 'yyyy-MM-dd')); // <-- returns a string
            setOpen(false);
          }}
          fromYear={fromYear}
          toYear={toYear}
        />
      </PopoverContent>
    </Popover>
  );
};
