import * as React from 'react';
import {
    SelectInput,
    type SelectInputProps,
} from '@/components/ui/select-input';

type FilterSelectProps = Omit<SelectInputProps, 'children'> & {
    children: React.ReactNode;
};

export function FilterSelect({
    className,
    children,
    ...props
}: FilterSelectProps) {
    return (
        <SelectInput className={className} {...props}>
            {children}
        </SelectInput>
    );
}
