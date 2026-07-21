'use client';

import { format, isSameDay, isValid, parseISO } from 'date-fns';
import { CalendarIcon, X } from 'lucide-react';
import * as React from 'react';
import type { DateRange } from 'react-day-picker';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
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
}: DateRangeFilterProps) {
    const [open, setOpen] = React.useState(false);
    const [draftRange, setDraftRange] = React.useState<DateRange | undefined>(
        undefined,
    );

    const committedRange = React.useMemo<DateRange | undefined>(() => {
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

    React.useEffect(() => {
        if (!open) {
            setDraftRange(committedRange);
        }
    }, [committedRange, open]);

    const selectedRange = open ? draftRange : committedRange;
    const buttonLabel = formatRangeLabel(selectedRange) ?? 'Select date range';
    const canClear = Boolean(committedRange?.from);

    function handleSelect(nextRange: DateRange | undefined): void {
        if (!nextRange?.from && !nextRange?.to) {
            clearSelection();

            return;
        }

        if (
            !selectedRange?.from &&
            nextRange?.from &&
            nextRange?.to &&
            isSameDay(nextRange.from, nextRange.to)
        ) {
            setDraftRange({
                from: nextRange.from,
                to: undefined,
            });

            return;
        }

        setDraftRange(nextRange);

        if (nextRange?.from && nextRange?.to) {
            onFromChange(formatDateValue(nextRange.from));
            onToChange(formatDateValue(nextRange.to));
            setOpen(false);
        }
    }

    function clearSelection(): void {
        setDraftRange(undefined);
        onFromChange('');
        onToChange('');
        setOpen(false);
    }

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <div className={cn('relative w-full sm:w-[280px]', className)}>
                    <Button
                        variant="outline"
                        size="default"
                        data-empty={!selectedRange?.from}
                        className={cn(
                            'h-9 w-full justify-start bg-background pr-9 text-left leading-normal font-normal data-[empty=true]:text-muted-foreground',
                            canClear && 'pr-10',
                        )}
                        aria-label={`${fromLabel} ${toLabel}`.trim()}
                    >
                        <CalendarIcon className="size-4" />
                        <span className="truncate leading-normal">
                            {buttonLabel}
                        </span>
                    </Button>

                    {canClear ? (
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={(event) => {
                                event.preventDefault();
                                event.stopPropagation();
                                clearSelection();
                            }}
                            className="absolute top-1/2 right-1 size-7 -translate-y-1/2 rounded-md text-muted-foreground"
                            aria-label="Clear date range"
                        >
                            <X className="size-4" />
                        </Button>
                    ) : null}
                </div>
            </PopoverTrigger>

            <PopoverContent
                align="start"
                className="w-auto overflow-hidden p-0"
            >
                <Calendar
                    mode="range"
                    defaultMonth={selectedRange?.from ?? committedRange?.from}
                    selected={selectedRange}
                    onSelect={handleSelect}
                    numberOfMonths={2}
                    className="p-3"
                />
            </PopoverContent>
        </Popover>
    );
}
