import * as React from 'react';
import { cn } from '@/lib/utils';

function Textarea({
    className,
    ...props
}: React.ComponentProps<'textarea'>) {
    return (
        <textarea
            data-slot="textarea"
            className={cn(
                'border-input placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground flex min-h-24 w-full rounded-md border bg-background/80 px-3 py-2 text-sm shadow-none transition-[color,box-shadow] outline-none resize-y',
                'focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/25',
                'aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive',
                'disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50',
                className,
            )}
            {...props}
        />
    );
}

export { Textarea };
