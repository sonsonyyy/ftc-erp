import * as React from 'react';
import {
    FilterCombobox,
    type FilterComboboxChangeEvent,
} from '@/components/filter-combobox';

type FilterSelectProps = {
    id?: string;
    value?: string | number | readonly string[] | undefined;
    defaultValue?: string | number | readonly string[] | undefined;
    name?: string;
    disabled?: boolean;
    required?: boolean;
    className?: string;
    placeholder?: string;
    children: React.ReactNode;
    onChange?: (event: FilterComboboxChangeEvent) => void;
    'aria-describedby'?: string;
    'aria-invalid'?: boolean | 'true' | 'false';
    'aria-label'?: string;
};

export function FilterSelect({ children, ...props }: FilterSelectProps) {
    return <FilterCombobox {...props}>{children}</FilterCombobox>;
}
