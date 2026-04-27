import { Form, Head, Link } from '@inertiajs/react';
import { useState } from 'react';
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
    metrics: QuotationKpiMetrics;
    statusBreakdown: QuotationStatusBreakdownItem[];
    topCustomersByQuotationValue: QuotationCustomerKpiItem[];
    topCustomersByAwardedValue: QuotationCustomerKpiItem[];
    lostReasons: QuotationLostReasonItem[];
    can: {
        view_registry: boolean;
    };
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
    metrics,
    statusBreakdown,
    topCustomersByQuotationValue,
    topCustomersByAwardedValue,
    lostReasons,
    can,
}: Props) {
    const [selectedRange, setSelectedRange] = useState(filters.range);
    const showCustomRange = selectedRange === 'custom';

    return (
        <>
            <Head title="Quotation Sales KPI" />

            <div className="app-page flex flex-1 flex-col gap-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                    <div className="space-y-1">
                        <h1 className="text-2xl font-semibold tracking-tight">
                            Quotation Sales KPI
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Monitor quotation throughput, conversion, awarded
                            value, and loss patterns using source transactions
                            only.
                        </p>
                    </div>

                    {can.view_registry && (
                        <Button variant="outline" asChild>
                            <Link href={quotationsIndex()}>
                                Back to registry
                            </Link>
                        </Button>
                    )}
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
                        <Form
                            action={quotationsKpi()}
                            method="get"
                            options={{ preserveState: true, replace: true }}
                            className="grid gap-3 xl:grid-cols-[1.5fr_1fr_1fr_1fr_auto_auto]"
                        >
                            <select
                                name="customer"
                                defaultValue={filters.customer ?? ''}
                                className="h-9 rounded-md border border-input bg-transparent px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
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
                            </select>

                            <select
                                name="range"
                                defaultValue={filters.range}
                                onChange={(event) =>
                                    setSelectedRange(event.currentTarget.value)
                                }
                                className="h-9 rounded-md border border-input bg-transparent px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                            >
                                {rangeOptions.map((option) => (
                                    <option
                                        key={option.value}
                                        value={option.value}
                                    >
                                        {option.label}
                                    </option>
                                ))}
                            </select>

                            <Input
                                name="from"
                                type="date"
                                defaultValue={filters.from ?? ''}
                                disabled={!showCustomRange}
                            />

                            <Input
                                name="to"
                                type="date"
                                defaultValue={filters.to ?? ''}
                                disabled={!showCustomRange}
                            />

                            <Button type="submit">Apply</Button>

                            <Button variant="outline" asChild>
                                <Link href={quotationsKpi()}>Reset</Link>
                            </Button>
                        </Form>
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
