import React from 'react';
import { Filter, Check } from 'lucide-react';
import { Dropdown } from '@/components/ui/dropdown';
import { Button } from '@/components/ui/button';

export interface FilterOption {
  label: string;
  value: string;
}

interface FilterDropdownProps {
  label: string;
  options: FilterOption[];
  selectedValue: string;
  onChange: (value: string) => void;
  className?: string;
}

export const FilterDropdown: React.FC<FilterDropdownProps> = ({
  label,
  options,
  selectedValue,
  onChange,
  className,
}) => {
  const currentOption = options.find((o) => o.value === selectedValue);
  const isFiltered = selectedValue !== '' && selectedValue !== 'all';

  const items = options.map((opt) => ({
    label: (
      <div className="flex items-center justify-between w-full">
        <span>{opt.label}</span>
        {opt.value === selectedValue && <Check className="w-3.5 h-3.5 text-blue-600" />}
      </div>
    ),
    onClick: () => onChange(opt.value),
  }));

  return (
    <Dropdown
      className={className}
      trigger={
        <Button variant={isFiltered ? 'primary' : 'outline'} size="sm" className="h-9 gap-2">
          <Filter className="w-3.5 h-3.5" />
          <span>
            {label}
            {isFiltered && currentOption ? `: ${currentOption.label}` : ''}
          </span>
        </Button>
      }
      items={items}
    />
  );
};

