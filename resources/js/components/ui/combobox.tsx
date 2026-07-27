'use client';

import { Check, ChevronDown, Search, X } from 'lucide-react';
import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';

type SelectValueInput = string | number | readonly string[] | undefined;

export type ComboboxChangeEvent = {
    currentTarget: {
        value: string;
    };
    target: {
        value: string;
    };
};

export type ComboboxOption = {
    value: string;
    label: React.ReactNode;
    displayLabel?: React.ReactNode;
    disabled?: boolean;
    searchLabel?: string;
};

type ExtractedOption = ComboboxOption & {
    disabled: boolean;
    searchLabel: string;
};

type ComboboxProps = {
    id?: string;
    value?: SelectValueInput;
    defaultValue?: SelectValueInput;
    name?: string;
    disabled?: boolean;
    required?: boolean;
    className?: string;
    placeholder?: string;
    searchPlaceholder?: string;
    emptyMessage?: string;
    options?: ComboboxOption[];
    children?: React.ReactNode;
    onChange?: (event: ComboboxChangeEvent) => void;
    onValueChange?: (value: string) => void;
    'aria-describedby'?: string;
    'aria-invalid'?: boolean | 'true' | 'false';
    'aria-label'?: string;
};

function normalizeValue(value: SelectValueInput): string {
    if (Array.isArray(value)) {
        return String(value[0] ?? '');
    }

    return value === undefined ? '' : String(value);
}

function optionLabelToString(label: React.ReactNode): string {
    if (typeof label === 'string') {
        return label;
    }

    if (typeof label === 'number') {
        return String(label);
    }

    if (Array.isArray(label)) {
        return label.map(optionLabelToString).join(' ');
    }

    if (React.isValidElement<{ children?: React.ReactNode }>(label)) {
        return optionLabelToString(label.props.children);
    }

    return '';
}

function extractOptions(children: React.ReactNode): ComboboxOption[] {
    const options: ComboboxOption[] = [];

    React.Children.forEach(children, (child) => {
        if (
            !React.isValidElement<{
                children?: React.ReactNode;
                disabled?: boolean;
                value?: string | number | readonly string[];
            }>(child)
        ) {
            return;
        }

        if (child.type === React.Fragment) {
            options.push(...extractOptions(child.props.children));

            return;
        }

        if (typeof child.type !== 'string' || child.type !== 'option') {
            return;
        }

        options.push({
            value: normalizeValue(child.props.value),
            label: child.props.children,
            disabled: Boolean(child.props.disabled),
        });
    });

    return options;
}

function normalizeOptions(
    options?: ComboboxOption[],
    children?: React.ReactNode,
): ExtractedOption[] {
    return (options ?? extractOptions(children)).map((option) => {
        const searchLabel =
            option.searchLabel ?? optionLabelToString(option.label);

        return {
            ...option,
            disabled: Boolean(option.disabled),
            searchLabel,
        };
    });
}

export function Combobox({
    id,
    value,
    defaultValue,
    name,
    disabled = false,
    required = false,
    className,
    placeholder,
    searchPlaceholder = 'Search...',
    emptyMessage = 'No results found.',
    options: optionItems,
    children,
    onChange,
    onValueChange,
    'aria-describedby': ariaDescribedBy,
    'aria-invalid': ariaInvalid,
    'aria-label': ariaLabel,
}: ComboboxProps) {
    const generatedListboxId = React.useId();
    const listboxId = id ? `${id}-listbox` : generatedListboxId;
    const searchInputRef = React.useRef<HTMLInputElement>(null);
    const optionRefs = React.useRef<Array<HTMLButtonElement | null>>([]);
    const [open, setOpen] = React.useState(false);
    const [query, setQuery] = React.useState('');
    const [internalValue, setInternalValue] = React.useState(() =>
        normalizeValue(defaultValue),
    );

    const options = React.useMemo(
        () => normalizeOptions(optionItems, children),
        [children, optionItems],
    );
    const isControlled = value !== undefined;
    const currentValue = isControlled ? normalizeValue(value) : internalValue;
    const emptyOption = options.find((option) => option.value === '');
    const resolvedPlaceholder =
        placeholder ??
        (typeof emptyOption?.label === 'string'
            ? emptyOption.label
            : undefined) ??
        'Select an option';
    const selectedOption = options.find(
        (option) => option.value === currentValue,
    );
    const displayLabel =
        selectedOption?.displayLabel ?? selectedOption?.label ?? resolvedPlaceholder;
    const canClear = currentValue !== '' && !disabled;
    const normalizedQuery = query.trim().toLocaleLowerCase();
    const visibleOptions = options.filter((option) => {
        if (normalizedQuery === '') {
            return true;
        }

        return option.searchLabel.toLocaleLowerCase().includes(normalizedQuery);
    });

    React.useEffect(() => {
        if (!open) {
            setQuery('');

            return;
        }

        const focusTimer = window.setTimeout(() => {
            searchInputRef.current?.focus();
        }, 0);

        return () => window.clearTimeout(focusTimer);
    }, [open]);

    function dispatchValue(nextValue: string): void {
        if (!isControlled) {
            setInternalValue(nextValue);
        }

        onValueChange?.(nextValue);
        onChange?.({
            currentTarget: { value: nextValue },
            target: { value: nextValue },
        });
    }

    function selectValue(nextValue: string): void {
        dispatchValue(nextValue);
        setOpen(false);
    }

    function clearSelection(event: React.MouseEvent<HTMLButtonElement>): void {
        event.preventDefault();
        event.stopPropagation();
        dispatchValue('');
        setOpen(false);
    }

    function focusOption(index: number): void {
        const enabledOptions = visibleOptions
            .map((option, optionIndex) => ({ option, optionIndex }))
            .filter(({ option }) => !option.disabled);
        const nextOption = enabledOptions[index];

        if (!nextOption) {
            return;
        }

        optionRefs.current[nextOption.optionIndex]?.focus();
    }

    function focusAdjacentOption(
        currentIndex: number,
        direction: 'previous' | 'next',
    ): void {
        const enabledIndexes = visibleOptions
            .map((option, optionIndex) => ({ option, optionIndex }))
            .filter(({ option }) => !option.disabled)
            .map(({ optionIndex }) => optionIndex);
        const currentEnabledIndex = enabledIndexes.indexOf(currentIndex);
        const fallbackIndex = direction === 'previous'
            ? enabledIndexes.length - 1
            : 0;
        const nextEnabledIndex =
            direction === 'previous'
                ? currentEnabledIndex - 1
                : currentEnabledIndex + 1;
        const nextOptionIndex =
            enabledIndexes[nextEnabledIndex] ?? enabledIndexes[fallbackIndex];

        if (nextOptionIndex === undefined) {
            return;
        }

        optionRefs.current[nextOptionIndex]?.focus();
    }

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

            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <div className="relative">
                        <Button
                            id={id}
                            type="button"
                            variant="outline"
                            size="default"
                            role="combobox"
                            aria-controls={listboxId}
                            aria-expanded={open}
                            aria-describedby={ariaDescribedBy}
                            aria-invalid={ariaInvalid}
                            aria-label={ariaLabel ?? resolvedPlaceholder}
                            aria-required={required}
                            disabled={disabled}
                            className={cn(
                                'h-9 w-full justify-between bg-background/88 text-left font-normal shadow-none',
                                currentValue === '' && 'text-muted-foreground',
                                canClear && 'pr-10',
                            )}
                        >
                            <span className="truncate">{displayLabel}</span>
                            {!canClear ? (
                                <ChevronDown className="size-4 shrink-0 opacity-50" />
                            ) : null}
                        </Button>

                        {canClear ? (
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={clearSelection}
                                className="absolute top-1/2 right-1 size-6 -translate-y-1/2 rounded-md text-muted-foreground"
                                aria-label={`Clear ${resolvedPlaceholder.toLocaleLowerCase()}`}
                            >
                                <X className="size-3.5" />
                            </Button>
                        ) : null}
                    </div>
                </PopoverTrigger>

                <PopoverContent
                    align="start"
                    className="w-[var(--radix-popover-trigger-width)] min-w-64 p-0"
                >
                    <div className="border-b p-2">
                        <div className="relative">
                            <Search className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                ref={searchInputRef}
                                value={query}
                                onChange={(event) =>
                                    setQuery(event.currentTarget.value)
                                }
                                onKeyDown={(event) => {
                                    if (event.key === 'ArrowDown') {
                                        event.preventDefault();
                                        focusOption(0);
                                    }
                                }}
                                placeholder={searchPlaceholder}
                                className="h-8 pl-8"
                            />
                        </div>
                    </div>

                    <div
                        id={listboxId}
                        role="listbox"
                        className="max-h-64 overflow-y-auto p-1"
                    >
                        {visibleOptions.length === 0 ? (
                            <div className="px-3 py-6 text-center text-xs text-muted-foreground">
                                {emptyMessage}
                            </div>
                        ) : (
                            visibleOptions.map((option, index) => {
                                const isSelected =
                                    option.value === currentValue;

                                return (
                                    <button
                                        key={`${option.value || 'empty'}-${option.searchLabel}`}
                                        ref={(element) => {
                                            optionRefs.current[index] = element;
                                        }}
                                        type="button"
                                        role="option"
                                        aria-selected={isSelected}
                                        onClick={() =>
                                            selectValue(option.value)
                                        }
                                        onKeyDown={(event) => {
                                            if (event.key === 'ArrowDown') {
                                                event.preventDefault();
                                                focusAdjacentOption(
                                                    index,
                                                    'next',
                                                );
                                            }

                                            if (event.key === 'ArrowUp') {
                                                event.preventDefault();
                                                focusAdjacentOption(
                                                    index,
                                                    'previous',
                                                );
                                            }
                                        }}
                                        disabled={option.disabled}
                                        className={cn(
                                            'flex w-full items-center justify-between gap-2 rounded-md px-2.5 py-1.5 text-left text-sm transition-colors outline-none',
                                            'hover:bg-muted hover:text-foreground',
                                            'focus:bg-muted focus:text-foreground',
                                            'disabled:pointer-events-none disabled:opacity-50',
                                            isSelected &&
                                                'bg-muted text-foreground',
                                        )}
                                    >
                                        <span className="min-w-0 flex-1 overflow-hidden">
                                            {option.label}
                                        </span>
                                        <Check
                                            className={cn(
                                                'size-4 shrink-0 text-primary',
                                                isSelected
                                                    ? 'opacity-100'
                                                    : 'opacity-0',
                                            )}
                                        />
                                    </button>
                                );
                            })
                        )}
                    </div>
                </PopoverContent>
            </Popover>
        </div>
    );
}
