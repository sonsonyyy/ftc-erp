import { Head, Link, router } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { dashboard } from '@/routes';
import {
    index as quotationsIndex,
    kpi as quotationsKpi,
} from '@/routes/quotations';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { cleanQueryParams, toUrl } from '@/lib/utils';
import type {
    QuotationCustomerKpiItem,
    QuotationKpiFilters,
    QuotationKpiMetrics,
    QuotationLostReasonItem,
    QuotationStatusBreakdownItem,
    SelectOption,
} from '@/types';
import { SelectInput } from '@/components/ui/select-input';

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
};

function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-PH', {
        style: 'currency',
        currency: 'PHP',
        maximumFractionDigits: 2,
    }).format(amount);
}

function formatPercent(value: number): string {
    return `${value.toFixed(2)}%`;
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
}: Props) {
    const [kpiFilters, setKpiFilters] = useState({
        customer: filters.customer === null ? '' : String(filters.customer),
        status: filters.status,
        range: filters.range,
        from: filters.from ?? '',
        to: filters.to ?? '',
    });
    const showCustomRange = kpiFilters.range === 'custom';

    useEffect(() => {
        setKpiFilters((currentFilters) => {
            const nextFilters = {
                customer:
                    filters.customer === null ? '' : String(filters.customer),
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

            <div className="app-page flex flex-1 flex-col gap-6">
                <div className="space-y-1">
                    <h1 className="text-2xl font-semibold tracking-tight">
                        Quotation Sales KPI
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Monitor quotation throughput, conversion, awarded value,
                        and loss patterns using source transactions only.
                    </p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Filters</CardTitle>
                        <CardDescription>
                            Adjust the reporting window and optionally focus on
                            one customer.
                        </CardDescription>
                    </CardHeader>

                    <CardContent>
                        <div className="grid gap-3 xl:grid-cols-[1.4fr_1fr_1fr_1fr_1fr_auto]">
                            <SelectInput
                                value={kpiFilters.customer}
                                onChange={(event) =>
                                    setKpiFilters((currentFilters) => ({
                                        ...currentFilters,
                                        customer: event.currentTarget.value,
                                    }))
                                }
                            >
                                <option value="">All customers</option>
                                {customerOptions.map((option) => (
                                    <option
                                        key={option.value}
                                        value={option.value}
                                    >
                                        {option.label}
                                    </option>
                                ))}
                            </SelectInput>

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

                            <Input
                                type="date"
                                value={kpiFilters.from}
                                onChange={(event) =>
                                    setKpiFilters((currentFilters) => ({
                                        ...currentFilters,
                                        range: 'custom',
                                        from: event.currentTarget.value,
                                    }))
                                }
                                disabled={!showCustomRange}
                            />

                            <Input
                                type="date"
                                value={kpiFilters.to}
                                onChange={(event) =>
                                    setKpiFilters((currentFilters) => ({
                                        ...currentFilters,
                                        range: 'custom',
                                        to: event.currentTarget.value,
                                    }))
                                }
                                disabled={!showCustomRange}
                            />

                            <Button
                                variant="outline"
                                asChild
                                className="xl:justify-self-end"
                            >
                                <Link href={quotationsKpi()}>Reset</Link>
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    <Card>
                        <CardHeader>
                            <CardDescription>Total submitted</CardDescription>
                            <CardTitle>{metrics.total_submitted}</CardTitle>
                        </CardHeader>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardDescription>Total awarded</CardDescription>
                            <CardTitle>{metrics.total_awarded}</CardTitle>
                        </CardHeader>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardDescription>Conversion rate</CardDescription>
                            <CardTitle>
                                {formatPercent(metrics.conversion_rate)}
                            </CardTitle>
                        </CardHeader>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardDescription>
                                Value conversion rate
                            </CardDescription>
                            <CardTitle>
                                {formatPercent(metrics.value_conversion_rate)}
                            </CardTitle>
                        </CardHeader>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardDescription>
                                Total quotation value
                            </CardDescription>
                            <CardTitle className="text-base">
                                {formatCurrency(metrics.total_quotation_value)}
                            </CardTitle>
                        </CardHeader>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardDescription>Awarded value</CardDescription>
                            <CardTitle className="text-base">
                                {formatCurrency(metrics.awarded_value)}
                            </CardTitle>
                        </CardHeader>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardDescription>
                                Pending quotations
                            </CardDescription>
                            <CardTitle>{metrics.pending_count}</CardTitle>
                        </CardHeader>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardDescription>
                                Average days to materialize
                            </CardDescription>
                            <CardTitle>
                                {metrics.average_days_to_materialize ?? 'N/A'}
                            </CardTitle>
                        </CardHeader>
                    </Card>
                </div>

                <div className="grid gap-6 xl:grid-cols-[1.2fr_1fr]">
                    <Card>
                        <CardHeader>
                            <CardTitle>Status breakdown</CardTitle>
                            <CardDescription>
                                Current filtered counts by quotation status.
                            </CardDescription>
                        </CardHeader>

                        <CardContent className="flex flex-wrap gap-2">
                            {statusBreakdown.map((item) => (
                                <Badge key={item.status} variant="outline">
                                    {item.label}: {item.count}
                                </Badge>
                            ))}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Loss snapshot</CardTitle>
                            <CardDescription>
                                Filtered quotations currently marked as lost.
                            </CardDescription>
                        </CardHeader>

                        <CardContent>
                            <p className="text-3xl font-semibold">
                                {metrics.lost_count}
                            </p>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid gap-6 xl:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>
                                Top customers by quotation value
                            </CardTitle>
                        </CardHeader>

                        <CardContent className="space-y-3">
                            {topCustomersByQuotationValue.length === 0 && (
                                <div className="rounded-lg border border-dashed px-4 py-6 text-sm text-muted-foreground">
                                    No quotation data matched the current
                                    filters.
                                </div>
                            )}

                            {topCustomersByQuotationValue.map((item) => (
                                <div
                                    key={`${item.customer.id}-${item.customer.company_name}`}
                                    className="rounded-lg border px-4 py-3"
                                >
                                    <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                                        <div>
                                            <p className="font-medium">
                                                {item.customer.customer_code} -{' '}
                                                {item.customer.company_name}
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                {item.quotation_count}{' '}
                                                quotation(s)
                                            </p>
                                        </div>

                                        <p className="font-medium">
                                            {formatCurrency(item.total_value)}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>
                                Top customers by awarded value
                            </CardTitle>
                        </CardHeader>

                        <CardContent className="space-y-3">
                            {topCustomersByAwardedValue.length === 0 && (
                                <div className="rounded-lg border border-dashed px-4 py-6 text-sm text-muted-foreground">
                                    No awarded quotations matched the current
                                    filters.
                                </div>
                            )}

                            {topCustomersByAwardedValue.map((item) => (
                                <div
                                    key={`${item.customer.id}-${item.customer.company_name}`}
                                    className="rounded-lg border px-4 py-3"
                                >
                                    <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                                        <div>
                                            <p className="font-medium">
                                                {item.customer.customer_code} -{' '}
                                                {item.customer.company_name}
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                {item.quotation_count} awarded
                                                quotation(s)
                                            </p>
                                        </div>

                                        <p className="font-medium">
                                            {formatCurrency(item.total_value)}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Lost reasons summary</CardTitle>
                        <CardDescription>
                            Ranked reasons from quotations marked as lost.
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-3">
                        {lostReasons.length === 0 && (
                            <div className="rounded-lg border border-dashed px-4 py-6 text-sm text-muted-foreground">
                                No lost quotations matched the current filters.
                            </div>
                        )}

                        {lostReasons.map((item) => (
                            <div
                                key={item.lost_reason}
                                className="flex items-center justify-between rounded-lg border px-4 py-3"
                            >
                                <p className="font-medium">
                                    {item.lost_reason}
                                </p>
                                <Badge variant="outline">
                                    {item.lost_count}
                                </Badge>
                            </div>
                        ))}
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
