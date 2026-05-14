import * as React from 'react';
import { cn } from '@/lib/utils';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from './select';

const EMPTY_OPTION_VALUE = '__select-input-empty__';

type SelectValueInput = string | number | readonly string[] | undefined;

export type SelectInputChangeEvent = {
    currentTarget: {
        value: string;
    };
    target: {
        value: string;
    };
};

type SelectOption = {
    value: string;
    label: React.ReactNode;
    disabled: boolean;
};

export type SelectInputProps = {
    id?: string;
    value?: SelectValueInput;
    defaultValue?: SelectValueInput;
    name?: string;
    disabled?: boolean;
    required?: boolean;
    className?: string;
    placeholder?: string;
    children: React.ReactNode;
    onChange?: (event: SelectInputChangeEvent) => void;
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

function extractOptions(children: React.ReactNode): SelectOption[] {
    const options: SelectOption[] = [];

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

export function SelectInput({
    id,
    value,
    defaultValue,
    name,
    disabled = false,
    required = false,
    className,
    placeholder,
    children,
    onChange,
    'aria-describedby': ariaDescribedBy,
    'aria-invalid': ariaInvalid,
    'aria-label': ariaLabel,
}: SelectInputProps) {
    const options = React.useMemo(() => extractOptions(children), [children]);
    const emptyOption = options.find((option) => option.value === '');
    const resolvedPlaceholder =
        placeholder ??
        (typeof emptyOption?.label === 'string' ? emptyOption.label : undefined) ??
        'Select an option';
    const controlledValue = value !== undefined ? normalizeValue(value) : undefined;
    const uncontrolledValue =
        value === undefined ? normalizeValue(defaultValue) : undefined;
    const currentValue = controlledValue ?? uncontrolledValue ?? '';
    const selectValue =
        currentValue === '' && emptyOption
            ? EMPTY_OPTION_VALUE
            : currentValue === ''
              ? undefined
              : currentValue;

    function handleValueChange(nextValue: string): void {
        const resolvedValue =
            nextValue === EMPTY_OPTION_VALUE ? '' : nextValue;

        onChange?.({
            currentTarget: { value: resolvedValue },
            target: { value: resolvedValue },
        });
    }

    return (
        <>
            {name ? <input type="hidden" name={name} value={currentValue} /> : null}

            <Select
                disabled={disabled}
                required={required}
                {...(controlledValue !== undefined
                    ? { value: selectValue }
                    : { defaultValue: selectValue })}
                onValueChange={handleValueChange}
            >
                <SelectTrigger
                    id={id}
                    aria-describedby={ariaDescribedBy}
                    aria-invalid={ariaInvalid}
                    aria-label={ariaLabel}
                    className={cn('w-full min-w-0', className)}
                >
                    <SelectValue placeholder={resolvedPlaceholder} />
                </SelectTrigger>

                <SelectContent position="item-aligned" className="max-h-80">
                    {options.map((option) => (
                        <SelectItem
                            key={`${option.value || 'empty'}-${String(option.label)}`}
                            value={
                                option.value === ''
                                    ? EMPTY_OPTION_VALUE
                                    : option.value
                            }
                            disabled={option.disabled}
                        >
                            {option.label}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </>
    );
}
