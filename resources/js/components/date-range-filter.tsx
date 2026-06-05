'use client';

import { format, isValid, parseISO } from 'date-fns';
import { CalendarIcon, X } from 'lucide-react';
import * as React from 'react';
import type { DateRange } from 'react-day-picker';

import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';

type DateRangeFilterProps = {
    from: string;
    to: string;
    fromLabel: string;
    toLabel: string;
    onFromChange: (value: string) => void;
    onToChange: (value: string) => void;
    className?: string;
    placeholder?: string;
};

function parseDateValue(value: string): Date | undefined {
    if (!value) {
        return undefined;
    }

    const parsedDate = parseISO(value);

    return isValid(parsedDate) ? parsedDate : undefined;
}

function formatDateValue(date: Date): string {
    return format(date, 'yyyy-MM-dd');
}

function formatRangeLabel(dateRange: DateRange | undefined): string | null {
    if (!dateRange?.from) {
        return null;
    }

    if (!dateRange.to) {
        return format(dateRange.from, 'MMM dd, yyyy');
    }

    return `${format(dateRange.from, 'MMM dd, yyyy')} - ${format(dateRange.to, 'MMM dd, yyyy')}`;
}

export function DateRangeFilter({
    from,
    to,
    fromLabel,
    toLabel,
    onFromChange,
    onToChange,
    className,
    placeholder,
}: DateRangeFilterProps) {
    const [open, setOpen] = React.useState(false);

    const selectedRange = React.useMemo<DateRange | undefined>(() => {
        const fromDate = parseDateValue(from);
        const toDate = parseDateValue(to);

        if (!fromDate && !toDate) {
            return undefined;
        }

        return {
            from: fromDate,
            to: toDate,
        };
    }, [from, to]);

    const buttonLabel =
        formatRangeLabel(selectedRange) ??
        placeholder ??
        `${fromLabel} - ${toLabel}`;

    function handleSelect(nextRange: DateRange | undefined): void {
        onFromChange(nextRange?.from ? formatDateValue(nextRange.from) : '');
        onToChange(nextRange?.to ? formatDateValue(nextRange.to) : '');

        if (nextRange?.from && nextRange?.to) {
            setOpen(false);
        }
    }

    function clearSelection(): void {
        onFromChange('');
        onToChange('');
        setOpen(false);
    }

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    size="default"
                    data-empty={!selectedRange?.from}
                    className={cn(
                        'h-9 w-full justify-start bg-background text-left font-normal data-[empty=true]:text-muted-foreground sm:w-[280px]',
                        className,
                    )}
                >
                    <CalendarIcon className="size-4" />
                    <span className="truncate">{buttonLabel}</span>
                </Button>
            </PopoverTrigger>

            <PopoverContent align="start" className="w-auto p-0">
                <Calendar
                    mode="range"
                    defaultMonth={selectedRange?.from}
                    selected={selectedRange}
                    onSelect={handleSelect}
                    numberOfMonths={2}
                />

                {selectedRange?.from ? (
                    <div className="flex justify-end border-t px-3 py-2">
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={clearSelection}
                            className="h-7 px-2 text-xs"
                        >
                            <X className="size-3.5" />
                            Clear
                        </Button>
                    </div>
                ) : null}
            </PopoverContent>
        </Popover>
    );
}
