import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

interface TimePeriodSelectorProps {
  value: number;
  onChange: (days: number) => void;
  className?: string;
}

const options = [
  { label: 'Week', value: 7 },
  { label: 'Month', value: 30 },
  { label: '6 Months', value: 180 },
  { label: 'Year', value: 365 },
  { label: 'All', value: 99999 },
];

export function TimePeriodSelector({ value, onChange, className }: TimePeriodSelectorProps) {
  return (
    <Select value={value.toString()} onValueChange={(val) => onChange(Number(val))}>
      <SelectTrigger className={cn('w-full bg-white', className)}>
        <SelectValue placeholder="Select time range" />
      </SelectTrigger>
      <SelectContent>
        {options.map((opt) => (
          <SelectItem key={opt.value} value={opt.value.toString()}>
            {opt.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
