'use client';

import { Calendar } from '@/components/ui/calendar';
import { Checkbox } from '@/components/ui/checkbox';
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
import { Button } from '@/stories/Button/Button';
import { ChevronDown, Eye, EyeOff, Search } from 'lucide-react';
import { useState } from 'react';

// Modern Input Field
export const ModernInput = ({
  placeholder,
  type = 'text',
  className,
  ...props
}: {
  placeholder?: string;
  type?: string;
  className?: string;
  [key: string]: any;
}) => (
  <Input
    type={type}
    placeholder={placeholder}
    className="w-full rounded-2xl border-2 focus:border-primary/50 focus:ring-0"
    {...props}
  />
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
      placeholder={placeholder}
      className="w-full rounded-2xl bg-muted pl-9 pr-4 py-2 border-0 focus:ring-2 focus:ring-primary/20"
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
    className="w-full rounded-2xl border-2 focus:border-primary/50 focus:ring-0 min-h-[80px]"
    {...props}
  />
);

// Modern Select
export const ModernSelect = ({
  placeholder = 'Select an option',
  options,
  className,
  ...props
}: {
  placeholder?: string;
  options: { value: string; label: string }[];
  className?: string;
  [key: string]: any;
}) => (
  <Select {...props}>
    <SelectTrigger className="w-full rounded-2xl border-2 focus:border-primary/50 focus:ring-0">
      <SelectValue placeholder={placeholder} />
    </SelectTrigger>
    <SelectContent className="rounded-2xl">
      {options.map((option) => (
        <SelectItem key={option.value} value={option.value}>
          {option.label}
        </SelectItem>
      ))}
    </SelectContent>
  </Select>
);

// Checkbox with modern styling
export const ModernCheckbox = ({
  className,
  ...props
}: {
  className?: string;
  [key: string]: any;
}) => (
  <Checkbox
    className="rounded-sm border-2 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
    {...props}
  />
);

// Switch with modern styling
export const ModernSwitch = ({
  className,
  ...props
}: {
  className?: string;
  [key: string]: any;
}) => <Switch {...props} />;

// DatePicker component with modern styling
export const DatePicker = ({
  value = undefined,
  onChange,
  fromYear = 2025,
  toYear = 2030,
  ...props
}: {
  value?: Date;
  onChange?: (value: Date) => void;
  fromYear?: number;
  toYear?: number;
  [key: string]: any;
}) => {
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState<Date | undefined>(value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          intent="secondary"
          id="date"
          className="w-full justify-start font-normal"
          text={date ? formatDate(date) : 'Select date'}
          icon={ChevronDown}
        />
      </PopoverTrigger>
      <PopoverContent className="w-auto overflow-hidden p-0 border-0" align="start">
        <Calendar
          mode="single"
          className="rounded-2xl border-2 focus:border-primary/50 focus:ring-0"
          selected={date}
          captionLayout="dropdown"
          onSelect={(date) => {
            setDate(date);
            setOpen(false);
          }}
          fromYear={fromYear}
          toYear={toYear}
        />
      </PopoverContent>
    </Popover>
  );
};
