import { Head, Link, router } from '@inertiajs/react';
import {
    ArrowUpRight,
    BadgePercent,
    CalendarRange,
    CircleDollarSign,
    ClipboardCheck,
    FileText,
    Filter,
    RotateCcw,
    TimerReset,
    Trophy,
    Users,
    XCircle,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { ComponentProps, ReactNode } from 'react';
import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Combobox } from '@/components/ui/combobox';
import type { ComboboxOption } from '@/components/ui/combobox';
import { DatePicker } from '@/components/ui/date-picker';
import { SelectInput } from '@/components/ui/select-input';
import { cleanQueryParams, cn, toUrl } from '@/lib/utils';
import { dashboard } from '@/routes';
import {
    index as quotationsIndex,
    kpi as quotationsKpi,
} from '@/routes/quotations';
import type {
    QuotationCustomerKpiItem,
    QuotationKpiFilters,
    QuotationKpiMetrics,
    QuotationLostReasonItem,
    QuotationStatusBreakdownItem,
    SelectOption,
} from '@/types';

type Props = {
    filters: QuotationKpiFilters;
    rangeOptions: SelectOption[];
    customerOptions: SelectOption[];
    statusOptions: SelectOption[];
    metrics: QuotationKpiMetrics;
    statusBreakdown: QuotationStatusBreakdownItem[];
    topCustomersByQuotationValue: QuotationCustomerKpiItem[];
    topCustomersByAwardedValue: QuotationCustomerKpiItem[];
    lostReasons: QuotationLostReasonItem[];
    can?: {
        view_registry: boolean;
    };
};

type LinkHref = ComponentProps<typeof Link>['href'];

function formatCurrency(amount: number, maximumFractionDigits = 2): string {
    return new Intl.NumberFormat('en-PH', {
        style: 'currency',
        currency: 'PHP',
        maximumFractionDigits,
    }).format(amount);
}

function formatCompactCurrency(amount: number): string {
    if (amount >= 1_000_000) {
        return `₱${stripTrailingZeros((amount / 1_000_000).toFixed(2))}M`;
    }

    if (amount >= 1_000) {
        return `₱${stripTrailingZeros((amount / 1_000).toFixed(0))}K`;
    }

    return `₱${stripTrailingZeros(amount.toFixed(0))}`;
}

function stripTrailingZeros(value: string): string {
    return value.replace(/\.0+$/, '').replace(/(\.\d*[1-9])0+$/, '$1');
}

function formatNumber(value: number): string {
    return new Intl.NumberFormat('en-PH').format(value);
}

function formatPercent(value: number): string {
    return `${value.toFixed(2)}%`;
}

function formatDays(value: number | null): string {
    return value === null ? 'N/A' : `${value} days`;
}

function getCustomerLabelParts(label: string): {
    name: string;
    number: string | null;
} {
    const [customerNumber, ...customerNameParts] = label.split(' - ');
    const customerName = customerNameParts.join(' - ').trim();

    if (customerName === '') {
        return {
            name: label,
            number: null,
        };
    }

    return {
        name: customerName,
        number: customerNumber.trim() || null,
    };
}

function SectionAction({ href, label }: { href: LinkHref; label: string }) {
    return (
        <Button
            variant="outline"
            size="sm"
            asChild
            className="h-8 gap-1.5 rounded-md px-3 text-[11px] font-medium"
        >
            <Link href={href}>
                <ArrowUpRight className="size-3.5" />
                {label}
            </Link>
        </Button>
    );
}

function MetricCard({
    icon: Icon,
    title,
    children,
    accentClassName,
    iconWrapperClassName,
    iconClassName,
    className,
}: {
    icon: LucideIcon;
    title: string;
    children: ReactNode;
    accentClassName: string;
    iconWrapperClassName: string;
    iconClassName: string;
    className?: string;
}) {
    return (
        <Card
            className={cn(
                'relative h-full gap-3 overflow-hidden border-transparent bg-white/96 py-4 shadow-[0_22px_48px_-34px_rgba(15,23,42,0.24)]',
                className,
            )}
        >
            <div
                className={cn(
                    'pointer-events-none absolute inset-x-0 top-0 h-1 rounded-t-lg',
                    accentClassName,
                )}
            />

            <CardHeader className="space-y-1.5 px-4 pt-1 pb-0">
                <div className="flex items-center gap-3">
                    <div
                        className={cn(
                            'flex size-9 shrink-0 items-center justify-center rounded-lg border border-transparent shadow-[0_16px_32px_-20px_rgba(15,23,42,0.28)]',
                            iconWrapperClassName,
                        )}
                    >
                        <Icon className={cn('size-[18px]', iconClassName)} />
                    </div>
                    <CardTitle className="text-[15px]">{title}</CardTitle>
                </div>
            </CardHeader>

            <CardContent className="grid gap-3 px-4">{children}</CardContent>
        </Card>
    );
}

function SectionHeader({
    icon: Icon,
    title,
    action,
    iconWrapperClassName,
    iconClassName,
}: {
    icon: LucideIcon;
    title: string;
    action?: ReactNode;
    iconWrapperClassName: string;
    iconClassName: string;
}) {
    return (
        <CardHeader className="flex flex-row items-center justify-between gap-3 px-4 pb-0">
            <div className="flex min-w-0 items-center gap-3">
                <div
                    className={cn(
                        'flex size-9 shrink-0 items-center justify-center rounded-lg border bg-background/92 shadow-[0_12px_24px_-20px_rgba(15,23,42,0.18)]',
                        iconWrapperClassName,
                    )}
                >
                    <Icon className={cn('size-[18px]', iconClassName)} />
                </div>
                <CardTitle className="truncate text-[15px]">{title}</CardTitle>
            </div>
            {action}
        </CardHeader>
    );
}

function StatBox({
    label,
    value,
    caption,
    className,
}: {
    label: string;
    value: string;
    caption?: string;
    className?: string;
}) {
    return (
        <div
            className={cn(
                'rounded-lg bg-background/92 px-3 py-2.5 shadow-[0_10px_20px_-18px_rgba(15,23,42,0.18)]',
                className,
            )}
        >
            <p className="text-[10px] font-medium tracking-[0.18em] text-muted-foreground uppercase">
                {label}
            </p>
            <p className="mt-1 truncate text-lg font-semibold tracking-tight">
                {value}
            </p>
            {caption ? (
                <p className="mt-1 text-[11px] leading-4.5 text-muted-foreground">
                    {caption}
                </p>
            ) : null}
        </div>
    );
}

function EmptyPanel({ message }: { message: string }) {
    return (
        <div className="flex min-h-[96px] items-center justify-center rounded-lg border border-dashed bg-muted/25 px-4 text-center text-[11px] leading-5 text-muted-foreground">
            {message}
        </div>
    );
}

function StatusTile({ item }: { item: QuotationStatusBreakdownItem }) {
    return (
        <div className="flex items-center justify-between gap-3 rounded-lg bg-background/88 px-3 py-2 text-[12px] shadow-[0_10px_20px_-18px_rgba(15,23,42,0.16)]">
            <span className="truncate text-muted-foreground">{item.label}</span>
            <Badge
                variant="outline"
                className="rounded-md bg-white/88 px-2 text-[11px]"
            >
                {formatNumber(item.count)}
            </Badge>
        </div>
    );
}

function CustomerRankingRow({
    item,
    caption,
}: {
    item: QuotationCustomerKpiItem;
    caption: string;
}) {
    const customerCode = item.customer.customer_code ?? 'No code';
    const companyName = item.customer.company_name ?? 'Unassigned customer';

    return (
        <div className="rounded-lg bg-background/88 px-3 py-3 shadow-[0_10px_20px_-18px_rgba(15,23,42,0.16)]">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                    <p className="truncate text-[13px] font-medium text-foreground">
                        {customerCode} - {companyName}
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                        {formatNumber(item.quotation_count)} {caption}
                    </p>
                </div>
                <p className="shrink-0 text-[13px] font-semibold">
                    {formatCurrency(item.total_value)}
                </p>
            </div>
        </div>
    );
}

function LostReasonRow({ item }: { item: QuotationLostReasonItem }) {
    return (
        <div className="flex items-center justify-between gap-3 rounded-lg bg-background/88 px-3 py-2.5 shadow-[0_10px_20px_-18px_rgba(15,23,42,0.16)]">
            <p className="min-w-0 truncate text-[13px] font-medium">
                {item.lost_reason}
            </p>
            <Badge variant="outline" className="rounded-md bg-white/88">
                {formatNumber(item.lost_count)}
            </Badge>
        </div>
    );
}

export default function QuotationsKpi({
    filters,
    rangeOptions,
    customerOptions,
    statusOptions,
    metrics,
    statusBreakdown,
    topCustomersByQuotationValue,
    topCustomersByAwardedValue,
    lostReasons,
    can,
}: Props) {
    const [kpiFilters, setKpiFilters] = useState({
        customer: filters.customer === null ? '' : String(filters.customer),
        status: filters.status,
        range: filters.range,
        from: filters.from ?? '',
        to: filters.to ?? '',
    });
    const showCustomRange = kpiFilters.range === 'custom';
    const customerComboboxOptions: ComboboxOption[] = customerOptions.map(
        (option) => {
            const customer = getCustomerLabelParts(option.label);

            return {
                value: String(option.value),
                displayLabel: customer.name,
                searchLabel: option.label,
                label: (
                    <span className="flex min-w-0 flex-col gap-0.5">
                        <span className="truncate font-medium text-foreground">
                            {customer.name}
                        </span>
                        {customer.number ? (
                            <span className="truncate text-xs text-muted-foreground">
                                {customer.number}
                            </span>
                        ) : null}
                    </span>
                ),
            };
        },
    );

    useEffect(() => {
        const syncFilters = window.setTimeout(() => {
            setKpiFilters((currentFilters) => {
                const nextFilters = {
                    customer:
                        filters.customer === null
                            ? ''
                            : String(filters.customer),
                    status: filters.status,
                    range: filters.range,
                    from: filters.from ?? '',
                    to: filters.to ?? '',
                };

                if (
                    currentFilters.customer === nextFilters.customer &&
                    currentFilters.status === nextFilters.status &&
                    currentFilters.range === nextFilters.range &&
                    currentFilters.from === nextFilters.from &&
                    currentFilters.to === nextFilters.to
                ) {
                    return currentFilters;
                }

                return nextFilters;
            });
        }, 0);

        return () => window.clearTimeout(syncFilters);
    }, [
        filters.customer,
        filters.from,
        filters.range,
        filters.status,
        filters.to,
    ]);

    useEffect(() => {
        const currentCustomer =
            filters.customer === null ? '' : String(filters.customer);
        const currentFrom = filters.from ?? '';
        const currentTo = filters.to ?? '';

        if (
            kpiFilters.customer === currentCustomer &&
            kpiFilters.status === filters.status &&
            kpiFilters.range === filters.range &&
            kpiFilters.from === currentFrom &&
            kpiFilters.to === currentTo
        ) {
            return;
        }

        const timeout = window.setTimeout(() => {
            router.cancelAll();
            router.get(
                toUrl(quotationsKpi()),
                cleanQueryParams({
                    customer:
                        kpiFilters.customer === ''
                            ? undefined
                            : Number(kpiFilters.customer),
                    status: kpiFilters.status || undefined,
                    range: kpiFilters.range,
                    from:
                        kpiFilters.range === 'custom'
                            ? kpiFilters.from || undefined
                            : undefined,
                    to:
                        kpiFilters.range === 'custom'
                            ? kpiFilters.to || undefined
                            : undefined,
                }),
                {
                    only: [
                        'filters',
                        'metrics',
                        'statusBreakdown',
                        'topCustomersByQuotationValue',
                        'topCustomersByAwardedValue',
                        'lostReasons',
                    ],
                    replace: true,
                    preserveState: true,
                    preserveScroll: true,
                },
            );
        }, 250);

        return () => window.clearTimeout(timeout);
    }, [
        filters.customer,
        filters.from,
        filters.range,
        filters.status,
        filters.to,
        kpiFilters,
    ]);

    return (
        <>
            <Head title="Quotation Sales KPI" />

            <div className="app-page flex flex-1 flex-col gap-5">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
                    <div className="space-y-1">
                        <h1 className="text-lg font-semibold tracking-tight sm:text-xl">
                            Quotation Sales KPI
                        </h1>
                        <p className="text-xs text-muted-foreground sm:text-sm">
                            Monitor quotation throughput, conversion, awarded
                            value, and loss patterns using source transactions
                            only.
                        </p>
                    </div>

                    {can?.view_registry ? (
                        <SectionAction
                            href={quotationsIndex()}
                            label="Open quotations"
                        />
                    ) : null}
                </div>

                <Card className="gap-3 border-transparent bg-white/95 py-4 shadow-[0_22px_48px_-34px_rgba(15,23,42,0.22)]">
                    <SectionHeader
                        icon={Filter}
                        title="Filters"
                        iconWrapperClassName="border-teal-100/80 bg-teal-50 text-teal-700"
                        iconClassName="text-teal-700"
                        action={
                            <Button
                                variant="default"
                                size="sm"
                                asChild
                                className="h-8 rounded-md border border-teal-700 bg-teal-700 px-3 text-[11px] font-medium text-white shadow-[0_12px_24px_-18px_rgba(15,118,110,0.55)] hover:bg-teal-800 hover:text-white"
                            >
                                <Link href={quotationsKpi()}>
                                    <RotateCcw className="size-3.5" />
                                    Reset filters
                                </Link>
                            </Button>
                        }
                    />

                    <CardContent className="px-4 pb-1">
                        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-[minmax(13rem,1.4fr)_minmax(9rem,1fr)_minmax(9rem,1fr)_minmax(9rem,1fr)_minmax(9rem,1fr)]">
                            <Combobox
                                value={kpiFilters.customer}
                                placeholder="All customers"
                                searchPlaceholder="Search customers..."
                                emptyMessage="No customers found."
                                options={[
                                    {
                                        value: '',
                                        label: 'All customers',
                                        displayLabel: 'All customers',
                                        searchLabel: 'All customers',
                                    },
                                    ...customerComboboxOptions,
                                ]}
                                onChange={(event) =>
                                    setKpiFilters((currentFilters) => ({
                                        ...currentFilters,
                                        customer: event.currentTarget.value,
                                    }))
                                }
                            />

                            <SelectInput
                                value={kpiFilters.status}
                                onChange={(event) =>
                                    setKpiFilters((currentFilters) => ({
                                        ...currentFilters,
                                        status: event.currentTarget.value,
                                    }))
                                }
                            >
                                <option value="">All types</option>
                                {statusOptions.map((option) => (
                                    <option
                                        key={option.value}
                                        value={option.value}
                                    >
                                        {option.label}
                                    </option>
                                ))}
                            </SelectInput>

                            <SelectInput
                                value={kpiFilters.range}
                                onChange={(event) =>
                                    setKpiFilters((currentFilters) => ({
                                        ...currentFilters,
                                        range: event.currentTarget.value,
                                    }))
                                }
                            >
                                {rangeOptions.map((option) => (
                                    <option
                                        key={option.value}
                                        value={option.value}
                                    >
                                        {option.label}
                                    </option>
                                ))}
                            </SelectInput>

                            <DatePicker
                                value={kpiFilters.from}
                                placeholder="From date"
                                aria-label="From date"
                                interactive={showCustomRange}
                                onChange={(value) =>
                                    setKpiFilters((currentFilters) => ({
                                        ...currentFilters,
                                        range: 'custom',
                                        from: value,
                                    }))
                                }
                            />

                            <DatePicker
                                value={kpiFilters.to}
                                placeholder="To date"
                                aria-label="To date"
                                interactive={showCustomRange}
                                onChange={(value) =>
                                    setKpiFilters((currentFilters) => ({
                                        ...currentFilters,
                                        range: 'custom',
                                        to: value,
                                    }))
                                }
                            />
                        </div>
                    </CardContent>
                </Card>

                <div className="grid gap-3 sm:grid-cols-2 md:auto-rows-fr xl:grid-cols-4">
                    <MetricCard
                        icon={FileText}
                        title="Pipeline"
                        accentClassName="bg-teal-600"
                        iconWrapperClassName="bg-teal-700"
                        iconClassName="text-white"
                    >
                        <div className="grid grid-cols-2 gap-2">
                            <StatBox
                                label="Submitted"
                                value={formatNumber(metrics.total_submitted)}
                            />
                            <StatBox
                                label="Pending"
                                value={formatNumber(metrics.pending_count)}
                            />
                        </div>
                    </MetricCard>

                    <MetricCard
                        icon={BadgePercent}
                        title="Conversion"
                        accentClassName="bg-cyan-600"
                        iconWrapperClassName="bg-cyan-700"
                        iconClassName="text-white"
                    >
                        <div className="grid grid-cols-2 gap-2">
                            <StatBox
                                label="Awarded"
                                value={formatNumber(metrics.total_awarded)}
                            />
                            <StatBox
                                label="Rate"
                                value={formatPercent(metrics.conversion_rate)}
                            />
                        </div>
                    </MetricCard>

                    <MetricCard
                        icon={CircleDollarSign}
                        title="Value"
                        accentClassName="bg-emerald-600"
                        iconWrapperClassName="bg-emerald-700"
                        iconClassName="text-white"
                    >
                        <div className="grid grid-cols-2 gap-2">
                            <StatBox
                                label="Quoted"
                                value={formatCompactCurrency(
                                    metrics.total_quotation_value,
                                )}
                                caption={formatCurrency(
                                    metrics.total_quotation_value,
                                )}
                            />
                            <StatBox
                                label="Awarded"
                                value={formatCompactCurrency(
                                    metrics.awarded_value,
                                )}
                                caption={formatCurrency(metrics.awarded_value)}
                            />
                        </div>
                    </MetricCard>

                    <MetricCard
                        icon={TimerReset}
                        title="Cycle / Loss"
                        accentClassName="bg-amber-600"
                        iconWrapperClassName="bg-amber-700"
                        iconClassName="text-white"
                    >
                        <div className="grid grid-cols-2 gap-2">
                            <StatBox
                                label="Cycle"
                                value={formatDays(
                                    metrics.average_days_to_materialize,
                                )}
                            />
                            <StatBox
                                label="Lost"
                                value={formatNumber(metrics.lost_count)}
                            />
                        </div>
                    </MetricCard>
                </div>

                <div className="grid gap-3 xl:grid-cols-[1.2fr_0.8fr]">
                    <Card className="gap-3 border-transparent bg-white/95 py-4">
                        <SectionHeader
                            icon={ClipboardCheck}
                            title="Status breakdown"
                            iconWrapperClassName="border-cyan-100/80 bg-cyan-50 text-cyan-700"
                            iconClassName="text-cyan-700"
                        />

                        <CardContent className="grid gap-2 px-4 pb-1 sm:grid-cols-2">
                            {statusBreakdown.map((item) => (
                                <StatusTile key={item.status} item={item} />
                            ))}
                        </CardContent>
                    </Card>

                    <Card className="gap-3 border-rose-100/70 bg-rose-50/45 py-4 shadow-[0_22px_48px_-34px_rgba(190,18,60,0.22)]">
                        <SectionHeader
                            icon={XCircle}
                            title="Loss snapshot"
                            iconWrapperClassName="border-rose-100/80 bg-rose-50 text-rose-700"
                            iconClassName="text-rose-700"
                        />

                        <CardContent className="grid gap-2 px-4 pb-1">
                            <StatBox
                                label="Lost quotations"
                                value={formatNumber(metrics.lost_count)}
                                caption="Filtered quotations currently marked as lost"
                            />
                            <StatBox
                                label="Value conversion"
                                value={formatPercent(
                                    metrics.value_conversion_rate,
                                )}
                                caption="Awarded value against submitted value"
                            />
                        </CardContent>
                    </Card>
                </div>

                <div className="grid gap-3 xl:grid-cols-2">
                    <Card className="gap-3 border-transparent bg-white/95 py-4">
                        <SectionHeader
                            icon={Users}
                            title="Top customers by quotation value"
                            iconWrapperClassName="border-teal-100/80 bg-teal-50 text-teal-700"
                            iconClassName="text-teal-700"
                        />

                        <CardContent className="space-y-2 px-4 pb-1">
                            {topCustomersByQuotationValue.length === 0 ? (
                                <EmptyPanel message="No quotation data matched the current filters." />
                            ) : (
                                topCustomersByQuotationValue.map((item) => (
                                    <CustomerRankingRow
                                        key={`${item.customer.id}-${item.customer.company_name}-quotation`}
                                        item={item}
                                        caption="quotation(s)"
                                    />
                                ))
                            )}
                        </CardContent>
                    </Card>

                    <Card className="gap-3 border-transparent bg-white/95 py-4">
                        <SectionHeader
                            icon={Trophy}
                            title="Top customers by awarded value"
                            iconWrapperClassName="border-emerald-100/80 bg-emerald-50 text-emerald-700"
                            iconClassName="text-emerald-700"
                        />

                        <CardContent className="space-y-2 px-4 pb-1">
                            {topCustomersByAwardedValue.length === 0 ? (
                                <EmptyPanel message="No awarded quotations matched the current filters." />
                            ) : (
                                topCustomersByAwardedValue.map((item) => (
                                    <CustomerRankingRow
                                        key={`${item.customer.id}-${item.customer.company_name}-awarded`}
                                        item={item}
                                        caption="awarded quotation(s)"
                                    />
                                ))
                            )}
                        </CardContent>
                    </Card>
                </div>

                <Card className="gap-3 border-amber-100/75 bg-amber-50/40 py-4 shadow-[0_22px_48px_-34px_rgba(180,83,9,0.22)]">
                    <SectionHeader
                        icon={CalendarRange}
                        title="Lost reasons summary"
                        iconWrapperClassName="border-amber-100/80 bg-amber-50 text-amber-700"
                        iconClassName="text-amber-700"
                    />

                    <CardContent className="grid gap-2 px-4 pb-1 sm:grid-cols-2 xl:grid-cols-3">
                        {lostReasons.length === 0 ? (
                            <div className="sm:col-span-2 xl:col-span-3">
                                <EmptyPanel message="No lost quotations matched the current filters." />
                            </div>
                        ) : (
                            lostReasons.map((item) => (
                                <LostReasonRow
                                    key={item.lost_reason}
                                    item={item}
                                />
                            ))
                        )}
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

QuotationsKpi.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: dashboard(),
        },
        {
            title: 'Quotations',
            href: quotationsIndex(),
        },
        {
            title: 'Sales KPI',
            href: quotationsKpi(),
        },
    ],
};
