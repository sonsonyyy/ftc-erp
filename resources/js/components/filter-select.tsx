import * as React from 'react';
import { cn } from '@/lib/utils';

export function FilterSelect({
    className,
    children,
    ...props
}: React.SelectHTMLAttributes<HTMLSelectElement>) {
    return (
        <select
            className={cn(
                'h-9 rounded-lg border border-input bg-background px-3 text-sm transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50',
                className,
            )}
            {...props}
        >
            {children}
        </select>
    );
}
