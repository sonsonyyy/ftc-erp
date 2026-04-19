import { Form, Head, Link } from '@inertiajs/react';
import { dashboard } from '@/routes';
import {
    create as quotationsCreate,
    edit as quotationsEdit,
    index as quotationsIndex,
    kpi as quotationsKpi,
    show as quotationsShow,
} from '@/routes/quotations';
import { PaginationLinks } from '@/components/pagination-links';
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
    PaginatedData,
    QuotationFilters,
    QuotationListItem,
    SelectOption,
} from '@/types';

type Props = {
    quotations: PaginatedData<QuotationListItem>;
    filters: QuotationFilters;
    customerOptions: SelectOption[];
    statusOptions: SelectOption[];
    can: {
        create: boolean;
        view_kpi: boolean;
    };
};

function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-PH', {
        style: 'currency',
        currency: 'PHP',
        maximumFractionDigits: 2,
    }).format(amount);
}

function formatDate(date: string | null): string {
    if (!date) {
        return 'Not set';
    }

    return new Intl.DateTimeFormat('en-PH', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    }).format(new Date(date));
}

function statusBadgeClass(status: string): string {
    return {
        draft: 'border-slate-200 bg-slate-100 text-slate-700',
        submitted: 'border-sky-200 bg-sky-50 text-sky-700',
        under_review: 'border-amber-200 bg-amber-50 text-amber-700',
        awarded: 'border-emerald-200 bg-emerald-50 text-emerald-700',
        lost: 'border-rose-200 bg-rose-50 text-rose-700',
        cancelled: 'border-stone-200 bg-stone-100 text-stone-700',
        expired: 'border-orange-200 bg-orange-50 text-orange-700',
    }[status] ?? 'border-slate-200 bg-slate-100 text-slate-700';
}

export default function QuotationsIndex({
    quotations,
    filters,
    customerOptions,
    statusOptions,
    can,
}: Props) {
    return (
        <>
            <Head title="Quotations" />

            <div className="flex flex-1 flex-col gap-6 p-4">
                <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                    <div className="space-y-1">
                        <h1 className="text-2xl font-semibold tracking-tight">
                            Quotations
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Track externally prepared quotations, monitor status movement, and keep sales reporting tied to the source records.
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        {can.view_kpi && (
                            <Button variant="outline" asChild>
                                <Link href={quotationsKpi()}>Sales KPI</Link>
                            </Button>
                        )}

                        {can.create && (
                            <Button asChild>
                                <Link href={quotationsCreate()}>New quotation</Link>
                            </Button>
                        )}
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Filters</CardTitle>
                        <CardDescription>
                            Search by quotation number, subject, customer, site, or lost reason.
                        </CardDescription>
                    </CardHeader>

                    <CardContent>
                        <Form
                            action={quotationsIndex()}
                            method="get"
                            options={{ preserveState: true, replace: true }}
                            className="grid gap-3 xl:grid-cols-[2fr_1.3fr_1fr_1fr_1fr_auto_auto]"
                        >
                            <Input
                                name="search"
                                defaultValue={filters.search}
                                placeholder="Search quotations"
                            />

                            <select
                                name="customer"
                                defaultValue={filters.customer ?? ''}
                                className="border-input focus-visible:border-ring focus-visible:ring-ring/50 h-9 rounded-md border bg-transparent px-3 text-sm outline-none focus-visible:ring-[3px]"
                            >
                                <option value="">All customers</option>
                                {customerOptions.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>

                            <select
                                name="status"
                                defaultValue={filters.status}
                                className="border-input focus-visible:border-ring focus-visible:ring-ring/50 h-9 rounded-md border bg-transparent px-3 text-sm outline-none focus-visible:ring-[3px]"
                            >
                                <option value="">All statuses</option>
                                {statusOptions.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>

                            <Input
                                name="from"
                                type="date"
                                defaultValue={filters.from ?? ''}
                            />

                            <Input
                                name="to"
                                type="date"
                                defaultValue={filters.to ?? ''}
                            />

                            <Button type="submit">Apply</Button>

                            <Button variant="outline" asChild>
                                <Link href={quotationsIndex()}>Reset</Link>
                            </Button>
                        </Form>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Quotation registry</CardTitle>
                        <CardDescription>
                            {quotations.total} quotation records
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="overflow-x-auto px-0">
                        <table className="min-w-full text-sm">
                            <thead>
                                <tr className="border-b text-left text-muted-foreground">
                                    <th className="px-6 py-3 font-medium">Quotation</th>
                                    <th className="px-6 py-3 font-medium">Customer / site</th>
                                    <th className="px-6 py-3 font-medium">Dates</th>
                                    <th className="px-6 py-3 font-medium">Amount</th>
                                    <th className="px-6 py-3 font-medium">Status</th>
                                    <th className="px-6 py-3 font-medium">Attachments</th>
                                    <th className="px-6 py-3 font-medium text-right">
                                        Actions
                                    </th>
                                </tr>
                            </thead>

                            <tbody>
                                {quotations.data.length === 0 && (
                                    <tr>
                                        <td
                                            colSpan={7}
                                            className="px-6 py-10 text-center text-muted-foreground"
                                        >
                                            No quotations matched the current filters.
                                        </td>
                                    </tr>
                                )}

                                {quotations.data.map((quotation) => (
                                    <tr
                                        key={quotation.id}
                                        className="border-b align-top last:border-0"
                                    >
                                        <td className="px-6 py-4">
                                            <div className="space-y-1">
                                                <p className="font-medium">
                                                    {quotation.quotation_no}
                                                </p>
                                                <p className="text-muted-foreground">
                                                    {quotation.subject}
                                                </p>
                                                {quotation.assigned_sales_user && (
                                                    <p className="text-xs text-muted-foreground">
                                                        Sales owner: {quotation.assigned_sales_user}
                                                    </p>
                                                )}
                                            </div>
                                        </td>

                                        <td className="px-6 py-4 text-muted-foreground">
                                            <div className="space-y-1">
                                                <p>
                                                    {quotation.customer.customer_code} -{' '}
                                                    {quotation.customer.company_name}
                                                </p>
                                                <p>
                                                    {quotation.site.site_name ??
                                                        'No site linked'}
                                                </p>
                                            </div>
                                        </td>

                                        <td className="px-6 py-4 text-muted-foreground">
                                            <div className="space-y-1">
                                                <p>
                                                    Quote: {formatDate(quotation.quotation_date)}
                                                </p>
                                                <p>
                                                    Valid until:{' '}
                                                    {formatDate(quotation.valid_until)}
                                                </p>
                                            </div>
                                        </td>

                                        <td className="px-6 py-4 font-medium">
                                            {formatCurrency(quotation.quotation_amount)}
                                        </td>

                                        <td className="px-6 py-4">
                                            <Badge
                                                variant="outline"
                                                className={statusBadgeClass(
                                                    quotation.status,
                                                )}
                                            >
                                                {quotation.status_label}
                                            </Badge>
                                        </td>

                                        <td className="px-6 py-4">
                                            {quotation.attachment_count}
                                        </td>

                                        <td className="px-6 py-4">
                                            <div className="flex justify-end gap-2">
                                                {quotation.can.view && (
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        asChild
                                                    >
                                                        <Link
                                                            href={quotationsShow(
                                                                quotation.id,
                                                            )}
                                                        >
                                                            Open
                                                        </Link>
                                                    </Button>
                                                )}

                                                {quotation.can.update && (
                                                    <Button size="sm" asChild>
                                                        <Link
                                                            href={quotationsEdit(
                                                                quotation.id,
                                                            )}
                                                        >
                                                            Edit
                                                        </Link>
                                                    </Button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </CardContent>

                    <PaginationLinks pagination={quotations} />
                </Card>
            </div>
        </>
    );
}

QuotationsIndex.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: dashboard(),
        },
        {
            title: 'Quotations',
            href: quotationsIndex(),
        },
    ],
};
