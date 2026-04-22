import { Link, router, type InertiaLinkProps } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn, cleanQueryParams, countActiveFilters, toUrl } from '@/lib/utils';
import { Download, Ellipsis, RotateCcw, SlidersHorizontal } from 'lucide-react';
import {
    Children,
    cloneElement,
    isValidElement,
    useEffect,
    useMemo,
    useState,
    type ChangeEvent,
    type ReactElement,
    type ReactNode,
} from 'react';

type FilterValues = Record<
    string,
    string | number | boolean | null | undefined
>;

type FilterFieldProps = {
    name?: string;
    onChange?: (
        event: ChangeEvent<HTMLInputElement | HTMLSelectElement>,
    ) => void;
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
    const [isAdvancedOpen, setIsAdvancedOpen] = useState(
        countActiveFilters(filters) > 0,
    );
    const querySignature = useMemo(
        () => JSON.stringify(cleanQueryParams(formValues)),
        [formValues],
    );
    const resolvedActiveFilterCount =
        activeFilterCount ?? countActiveFilters(filters);
    const hasActiveFilters = resolvedActiveFilterCount > 0;
    const allFields = Children.toArray(children).filter(
        (child): child is FilterFieldElement => {
            return (
                isValidElement<FilterFieldProps>(child) &&
                typeof child.props.name === 'string'
            );
        },
    );
    const [primaryField, ...advancedFields] = allFields;

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
            onChange: (
                event: ChangeEvent<HTMLInputElement | HTMLSelectElement>,
            ) => {
                existingOnChange?.(event);
                updateFieldValue(event);
            },
        });
    }

    return (
        <Card className="border-border/70 shadow-sm">
            <CardHeader className="gap-1 pb-0">
                <CardTitle>{title}</CardTitle>
                <CardDescription>{description}</CardDescription>
                {hasActiveFilters && (
                    <p className="text-xs text-muted-foreground">
                        {resolvedActiveFilterCount} active filter
                        {resolvedActiveFilterCount === 1 ? '' : 's'}
                    </p>
                )}
            </CardHeader>

            <CardContent className="space-y-4">
                <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
                    <div className="flex flex-1 flex-col gap-3 md:flex-row md:items-center">
                        <div className="w-full md:max-w-lg">
                            {primaryField && renderField(primaryField, 0)}
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                            {advancedFields.length > 0 && (
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() =>
                                        setIsAdvancedOpen(
                                            (currentValue) => !currentValue,
                                        )
                                    }
                                >
                                    <SlidersHorizontal />
                                    Filters
                                    {hasActiveFilters && (
                                        <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
                                            {resolvedActiveFilterCount}
                                        </span>
                                    )}
                                </Button>
                            )}

                            {hasActiveFilters && (
                                <Button variant="ghost" asChild>
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
                                    <Button type="button" variant="outline">
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
                    <div className="rounded-xl border bg-muted/15 p-4">
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
            </CardContent>
        </Card>
    );
}
