import { Check, ChevronDown, X } from 'lucide-react';
import * as React from 'react';
import { Button } from '@/components/ui/button';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';

const EMPTY_OPTION_VALUE = '__filter-combobox-empty__';

type SelectValueInput = string | number | readonly string[] | undefined;

export type FilterComboboxChangeEvent = {
    currentTarget: {
        value: string;
    };
    target: {
        value: string;
    };
};

type FilterOption = {
    value: string;
    label: React.ReactNode;
    disabled: boolean;
};

type Props = {
    id?: string;
    value?: SelectValueInput;
    defaultValue?: SelectValueInput;
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

function normalizeValue(value: SelectValueInput): string {
    if (Array.isArray(value)) {
        return String(value[0] ?? '');
    }

    return value === undefined ? '' : String(value);
}

function extractOptions(children: React.ReactNode): FilterOption[] {
    const options: FilterOption[] = [];

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

function optionLabelToString(label: React.ReactNode): string {
    if (typeof label === 'string') {
        return label;
    }

    if (typeof label === 'number') {
        return String(label);
    }

    return '';
}

export function FilterCombobox({
    id,
    value,
    defaultValue,
    name,
    disabled = false,
    className,
    placeholder,
    children,
    onChange,
    'aria-describedby': ariaDescribedBy,
    'aria-invalid': ariaInvalid,
    'aria-label': ariaLabel,
}: Props) {
    const options = React.useMemo(() => extractOptions(children), [children]);
    const optionRefs = React.useRef<Array<HTMLButtonElement | null>>([]);
    const [open, setOpen] = React.useState(false);

    const emptyOption = options.find((option) => option.value === '');
    const resolvedPlaceholder =
        placeholder ??
        (typeof emptyOption?.label === 'string'
            ? emptyOption.label
            : undefined) ??
        'Select an option';
    const controlledValue =
        value !== undefined ? normalizeValue(value) : undefined;
    const uncontrolledValue =
        value === undefined ? normalizeValue(defaultValue) : undefined;
    const currentValue = controlledValue ?? uncontrolledValue ?? '';
    const selectedOption = options.find(
        (option) => option.value === currentValue,
    );
    const displayLabel = selectedOption?.label ?? resolvedPlaceholder;
    const canClear = currentValue !== '' && !disabled;

    React.useEffect(() => {
        if (!open) {
            return;
        }

        const focusTimer = window.setTimeout(() => {
            const selectedIndex = options.findIndex(
                (option) => option.value === currentValue && !option.disabled,
            );
            const fallbackIndex = options.findIndex(
                (option) => !option.disabled,
            );
            const nextIndex =
                selectedIndex >= 0 ? selectedIndex : fallbackIndex;

            if (nextIndex >= 0) {
                optionRefs.current[nextIndex]?.focus();
            }
        }, 0);

        return () => window.clearTimeout(focusTimer);
    }, [currentValue, open, options]);

    function dispatchValue(nextValue: string): void {
        onChange?.({
            currentTarget: { value: nextValue },
            target: { value: nextValue },
        });
    }

    function handleSelect(nextValue: string): void {
        dispatchValue(nextValue === EMPTY_OPTION_VALUE ? '' : nextValue);
        setOpen(false);
    }

    function clearSelection(event: React.MouseEvent<HTMLButtonElement>): void {
        event.preventDefault();
        event.stopPropagation();
        dispatchValue('');
        setOpen(false);
    }

    return (
        <div className={cn('relative w-full sm:w-[180px]', className)}>
            {name ? (
                <input type="hidden" name={name} value={currentValue} />
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
                            aria-expanded={open}
                            aria-describedby={ariaDescribedBy}
                            aria-invalid={ariaInvalid}
                            aria-label={ariaLabel ?? resolvedPlaceholder}
                            disabled={disabled}
                            className={cn(
                                'h-9 w-full justify-between bg-background text-left font-normal shadow-none',
                                currentValue === '' && 'text-muted-foreground',
                                'pr-10',
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
                                className="absolute top-1/2 right-1 size-7 -translate-y-1/2 rounded-md text-muted-foreground"
                                aria-label={`Clear ${resolvedPlaceholder.toLowerCase()}`}
                            >
                                <X className="size-4" />
                            </Button>
                        ) : null}
                    </div>
                </PopoverTrigger>

                <PopoverContent
                    align="start"
                    className="w-[var(--radix-popover-trigger-width)] p-0"
                >
                    <div className="max-h-64 overflow-y-auto p-1">
                        {options.map((option, index) => {
                            const optionValue =
                                option.value === ''
                                    ? EMPTY_OPTION_VALUE
                                    : option.value;
                            const isSelected = option.value === currentValue;

                            return (
                                <button
                                    key={`${optionValue}-${optionLabelToString(option.label)}`}
                                    ref={(element) => {
                                        optionRefs.current[index] = element;
                                    }}
                                    type="button"
                                    onClick={() => handleSelect(optionValue)}
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
                                    <span className="truncate">
                                        {option.label}
                                    </span>
                                    <Check
                                        className={cn(
                                            'size-4 shrink-0 text-muted-foreground',
                                            !isSelected && 'opacity-0',
                                        )}
                                    />
                                </button>
                            );
                        })}
                    </div>
                </PopoverContent>
            </Popover>
        </div>
    );
}
