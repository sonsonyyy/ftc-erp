'use client';

import { format, isValid, parseISO } from 'date-fns';
import { CalendarIcon, X } from 'lucide-react';
import * as React from 'react';
import { Button, buttonVariants } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';

type DatePickerProps = {
    id?: string;
    value?: string;
    defaultValue?: string;
    name?: string;
    disabled?: boolean;
    interactive?: boolean;
    required?: boolean;
    className?: string;
    placeholder?: string;
    onChange?: (value: string) => void;
    'aria-describedby'?: string;
    'aria-invalid'?: boolean | 'true' | 'false';
    'aria-label'?: string;
};

function parseDateValue(value: string | undefined): Date | undefined {
    if (!value) {
        return undefined;
    }

    const parsedDate = parseISO(value);

    return isValid(parsedDate) ? parsedDate : undefined;
}

function formatDateValue(date: Date): string {
    return format(date, 'yyyy-MM-dd');
}

function formatDateLabel(value: string): string {
    const date = parseDateValue(value);

    return date ? format(date, 'MM/dd/yyyy') : value;
}

export function DatePicker({
    id,
    value,
    defaultValue,
    name,
    disabled = false,
    interactive = true,
    required = false,
    className,
    placeholder = 'Select date',
    onChange,
    'aria-describedby': ariaDescribedBy,
    'aria-invalid': ariaInvalid,
    'aria-label': ariaLabel,
}: DatePickerProps) {
    const [open, setOpen] = React.useState(false);
    const [internalValue, setInternalValue] = React.useState(
        defaultValue ?? '',
    );
    const isControlled = value !== undefined;
    const currentValue = isControlled ? value : internalValue;
    const selectedDate = parseDateValue(currentValue);
    const canClear = currentValue !== '' && !disabled && interactive;

    function dispatchValue(nextValue: string): void {
        if (!isControlled) {
            setInternalValue(nextValue);
        }

        onChange?.(nextValue);
    }

    function handleSelect(date: Date | undefined): void {
        if (!date) {
            return;
        }

        dispatchValue(formatDateValue(date));
        setOpen(false);
    }

    function clearSelection(event: React.MouseEvent<HTMLButtonElement>): void {
        event.preventDefault();
        event.stopPropagation();
        dispatchValue('');
        setOpen(false);
    }

    const triggerContent = (
        <>
            <CalendarIcon className="size-4" />
            <span className="truncate">
                {currentValue ? formatDateLabel(currentValue) : placeholder}
            </span>
        </>
    );

    const trigger = (
        <div className="relative">
            {interactive ? (
                <Button
                    id={id}
                    type="button"
                    variant="outline"
                    size="default"
                    data-empty={!selectedDate}
                    aria-describedby={ariaDescribedBy}
                    aria-invalid={ariaInvalid}
                    aria-label={ariaLabel ?? placeholder}
                    aria-required={required}
                    disabled={disabled}
                    className={cn(
                        'h-9 w-full justify-start bg-background/88 pr-9 text-left font-normal shadow-none data-[empty=true]:text-muted-foreground',
                        canClear && 'pr-10',
                    )}
                >
                    {triggerContent}
                </Button>
            ) : (
                <div
                    id={id}
                    role="textbox"
                    data-empty={!selectedDate}
                    aria-describedby={ariaDescribedBy}
                    aria-invalid={ariaInvalid}
                    aria-label={ariaLabel ?? placeholder}
                    aria-readonly="true"
                    aria-required={required}
                    aria-disabled={disabled}
                    className={cn(
                        buttonVariants({
                            variant: 'outline',
                            size: 'default',
                        }),
                        'h-9 w-full justify-start bg-background/88 pr-9 text-left font-normal shadow-none hover:bg-background/88 hover:text-foreground data-[empty=true]:text-muted-foreground',
                        disabled && 'pointer-events-none opacity-50',
                    )}
                >
                    {triggerContent}
                </div>
            )}

            {canClear ? (
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={clearSelection}
                    className="absolute top-1/2 right-1 size-6 -translate-y-1/2 rounded-md text-muted-foreground"
                    aria-label={`Clear ${placeholder.toLocaleLowerCase()}`}
                >
                    <X className="size-3.5" />
                </Button>
            ) : null}
        </div>
    );

    return (
        <div className={cn('relative w-full', className)}>
            {name ? (
                <input
                    type="hidden"
                    name={name}
                    value={currentValue}
                    required={required}
                />
            ) : null}

            {interactive ? (
                <Popover open={open} onOpenChange={setOpen}>
                    <PopoverTrigger asChild>{trigger}</PopoverTrigger>

                    <PopoverContent
                        align="start"
                        className="w-auto overflow-hidden p-0"
                    >
                        <Calendar
                            mode="single"
                            defaultMonth={selectedDate}
                            selected={selectedDate}
                            onSelect={handleSelect}
                        />
                    </PopoverContent>
                </Popover>
            ) : (
                trigger
            )}
        </div>
    );
}
