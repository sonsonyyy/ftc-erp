import { Link, router } from '@inertiajs/react';
import type { InertiaLinkProps } from '@inertiajs/react';
import {
    Download,
    Ellipsis,
    RotateCcw,
    Search,
    SlidersHorizontal,
} from 'lucide-react';
import {
    Children,
    cloneElement,
    isValidElement,
    useEffect,
    useMemo,
    useState,
} from 'react';
import type { ChangeEvent, ReactElement, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn, cleanQueryParams, countActiveFilters, toUrl } from '@/lib/utils';

type FilterValues = Record<
    string,
    string | number | boolean | null | undefined
>;

type FilterFieldProps = {
    name?: string;
    onChange?: (
        event: ChangeEvent<HTMLInputElement | HTMLSelectElement>,
    ) => void;
    className?: string;
    defaultValue?: string | number | readonly string[];
    value?: string | number | readonly string[];
};

type FilterFieldElement = ReactElement<FilterFieldProps>;

type Props = {
    action: NonNullable<InertiaLinkProps['href']>;
    resetHref: NonNullable<InertiaLinkProps['href']>;
    filters?: FilterValues;
    exportHref?: NonNullable<InertiaLinkProps['href']>;
    title?: string;
    description: string;
    activeFilterCount?: number;
    fieldsClassName?: string;
    debounceMs?: number;
    children: ReactNode;
};

function normalizeFilters(
    filters: FilterValues,
): Record<string, string | number> {
    return Object.fromEntries(
        Object.entries(filters).map(([key, value]) => [
            key,
            typeof value === 'number'
                ? value
                : typeof value === 'boolean'
                  ? String(Number(value))
                  : (value ?? ''),
        ]),
    );
}

export function IndexFiltersCard({
    action,
    resetHref,
    filters = {},
    exportHref,
    title = 'Filters',
    description,
    activeFilterCount,
    fieldsClassName,
    debounceMs = 300,
    children,
}: Props) {
    const normalizedFilters = useMemo(
        () => normalizeFilters(filters),
        [filters],
    );
    const serverSignature = useMemo(
        () => JSON.stringify(cleanQueryParams(normalizedFilters)),
        [normalizedFilters],
    );
    const [formValues, setFormValues] = useState(normalizedFilters);
    const allFields = Children.toArray(children).filter(
        (child): child is FilterFieldElement => {
            return (
                isValidElement<FilterFieldProps>(child) &&
                typeof child.props.name === 'string'
            );
        },
    );
    const [primaryField, ...advancedFields] = allFields;
    const primaryFieldName = primaryField?.props.name;
    const advancedFilterSource = primaryFieldName
        ? Object.fromEntries(
              Object.entries(filters).filter(
                  ([key]) => key !== primaryFieldName,
              ),
          )
        : filters;
    const [isAdvancedOpen, setIsAdvancedOpen] = useState(
        countActiveFilters(advancedFilterSource) > 0,
    );
    const querySignature = useMemo(
        () => JSON.stringify(cleanQueryParams(formValues)),
        [formValues],
    );
    const secondaryFilterCount = countActiveFilters(advancedFilterSource);
    const resolvedActiveFilterCount =
        activeFilterCount === undefined
            ? secondaryFilterCount
            : Math.min(activeFilterCount, secondaryFilterCount);
    const hasActiveFilters = resolvedActiveFilterCount > 0;

    useEffect(() => {
        setFormValues(normalizedFilters);
    }, [normalizedFilters]);

    useEffect(() => {
        if (querySignature === serverSignature) {
            return;
        }

        const timer = window.setTimeout(() => {
            router.get(toUrl(action), cleanQueryParams(formValues), {
                replace: true,
                preserveState: true,
                preserveScroll: true,
            });
        }, debounceMs);

        return () => window.clearTimeout(timer);
    }, [action, debounceMs, formValues, querySignature, serverSignature]);

    function updateFieldValue(
        event: ChangeEvent<HTMLInputElement | HTMLSelectElement>,
    ) {
        const { name, value } = event.target;

        setFormValues((currentValues) => ({
            ...currentValues,
            [name]: value,
        }));
    }

    function renderField(field: FilterFieldElement, index: number) {
        const { name } = field.props;

        if (!name) {
            return field;
        }

        const existingOnChange = field.props.onChange;

        return cloneElement(field, {
            key: `${name}-${index}`,
            value: formValues[name] ?? '',
            defaultValue: undefined,
            className: cn(
                name === primaryFieldName ? undefined : 'w-full',
                field.props.className,
            ),
            onChange: (
                event: ChangeEvent<HTMLInputElement | HTMLSelectElement>,
            ) => {
                existingOnChange?.(event);
                updateFieldValue(event);
            },
        });
    }

    function renderPrimaryField() {
        if (!primaryField) {
            return null;
        }

        const renderedField = renderField(primaryField, 0);

        if (primaryField.props.name !== 'search') {
            return renderedField;
        }

        return (
            <div className="relative w-full">
                <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                {cloneElement(renderedField, {
                    className: cn('h-9 pl-9', renderedField.props.className),
                })}
            </div>
        );
    }

    return (
        <div className="space-y-3">
            <div className="flex flex-col gap-3 rounded-lg border border-border/70 bg-card px-4 py-3 shadow-sm lg:flex-row lg:items-center lg:justify-between">
                <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center">
                    <div className="w-full sm:max-w-sm">
                        {renderPrimaryField()}
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        {advancedFields.length > 0 && (
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="h-9 bg-background"
                                onClick={() =>
                                    setIsAdvancedOpen(
                                        (currentValue) => !currentValue,
                                    )
                                }
                            >
                                <SlidersHorizontal />
                                {title}
                                {hasActiveFilters && (
                                    <span className="rounded-md bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary">
                                        {resolvedActiveFilterCount}
                                    </span>
                                )}
                            </Button>
                        )}

                        {hasActiveFilters && (
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-9"
                                asChild
                            >
                                <Link href={resetHref} preserveScroll>
                                    <RotateCcw />
                                    Reset
                                </Link>
                            </Button>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {exportHref && (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    className="h-9 bg-background"
                                >
                                    <Ellipsis />
                                    Actions
                                </Button>
                            </DropdownMenuTrigger>

                            <DropdownMenuContent
                                align="end"
                                className="min-w-48"
                            >
                                <DropdownMenuItem asChild>
                                    <a href={toUrl(exportHref)}>
                                        <Download />
                                        Export CSV
                                    </a>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    )}
                </div>
            </div>

            {advancedFields.length > 0 && isAdvancedOpen && (
                <div className="rounded-lg border border-border/70 bg-card px-4 py-3 shadow-sm">
                    {description && (
                        <p className="mb-3 text-[13px] text-muted-foreground">
                            {description}
                        </p>
                    )}

                    <div
                        className={cn(
                            'grid gap-3 md:grid-cols-2 xl:grid-cols-4',
                            fieldsClassName,
                        )}
                    >
                        {advancedFields.map((field, index) =>
                            renderField(field, index + 1),
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
