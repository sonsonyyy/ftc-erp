import { Search, X } from 'lucide-react';
import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

type Props = {
    value: string;
    onChange: (value: string) => void;
    placeholder: string;
    wrapperClassName?: string;
    inputClassName?: string;
    disabled?: boolean;
    'aria-label'?: string;
};

export function ClearableSearchInput({
    value,
    onChange,
    placeholder,
    wrapperClassName,
    inputClassName,
    disabled = false,
    'aria-label': ariaLabel,
}: Props) {
    const inputRef = React.useRef<HTMLInputElement | null>(null);
    const canClear = value.trim().length > 0 && !disabled;

    function clearValue(): void {
        onChange('');
        inputRef.current?.focus();
    }

    return (
        <div
            className={cn('relative w-full sm:max-w-[19rem]', wrapperClassName)}
        >
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />

            <Input
                ref={inputRef}
                value={value}
                onChange={(event) => onChange(event.currentTarget.value)}
                placeholder={placeholder}
                className={cn('h-9 pr-9 pl-9', inputClassName)}
                disabled={disabled}
                aria-label={ariaLabel ?? placeholder}
            />

            {canClear ? (
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={clearValue}
                    className="absolute top-1/2 right-1 size-7 -translate-y-1/2 rounded-md text-muted-foreground"
                    aria-label={`Clear ${placeholder.toLowerCase()}`}
                >
                    <X className="size-4" />
                </Button>
            ) : null}
        </div>
    );
}
