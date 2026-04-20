import { Form, Head, Link } from '@inertiajs/react';
import { dashboard } from '@/routes';
import { create as invoicesCreate, edit as invoicesEdit, index as invoicesIndex, show as invoicesShow } from '@/routes/invoices';
import { create as paymentsCreate } from '@/routes/payments';
import { PaginationLinks } from '@/components/pagination-links';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import type { InvoiceFilters, InvoiceListItem, PaginatedData, SelectOption } from '@/types';

type Props = {
    invoices: PaginatedData<InvoiceListItem>;
    filters: InvoiceFilters;
    customerOptions: SelectOption[];
    statusOptions: SelectOption[];
    can: {
        create: boolean;
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
        issued: 'border-sky-200 bg-sky-50 text-sky-700',
        partially_paid: 'border-amber-200 bg-amber-50 text-amber-700',
        paid: 'border-emerald-200 bg-emerald-50 text-emerald-700',
        overdue: 'border-rose-200 bg-rose-50 text-rose-700',
        cancelled: 'border-stone-200 bg-stone-100 text-stone-700',
    }[status] ?? 'border-slate-200 bg-slate-100 text-slate-700';
}

export default function InvoicesIndex({
    invoices,
    filters,
    customerOptions,
    statusOptions,
    can,
}: Props) {
    return (
        <>
            <Head title="Invoices" />

            <div className="flex flex-1 flex-col gap-6 p-4">
                <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                    <div className="space-y-1">
                        <h1 className="text-2xl font-semibold tracking-tight">Invoices</h1>
                        <p className="text-sm text-muted-foreground">
                            Manage customer billings, linked operational references, and receivable balances in one place.
                        </p>
                    </div>

                    {can.create && (
                        <Button asChild>
                            <Link href={invoicesCreate()}>New invoice</Link>
                        </Button>
                    )}
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Filters</CardTitle>
                        <CardDescription>
                            Search by invoice number, customer, quotation, project, work order, or billing remarks.
                        </CardDescription>
                    </CardHeader>

                    <CardContent>
                        <Form
                            action={invoicesIndex()}
                            method="get"
                            options={{ preserveState: true, replace: true }}
                            className="grid gap-3 xl:grid-cols-[2fr_1.3fr_1fr_1fr_1fr_auto_auto]"
                        >
                            <Input
                                name="search"
                                defaultValue={filters.search}
                                placeholder="Search invoices"
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

                            <Input name="from" type="date" defaultValue={filters.from ?? ''} />
                            <Input name="to" type="date" defaultValue={filters.to ?? ''} />

                            <Button type="submit">Apply</Button>

                            <Button variant="outline" asChild>
                                <Link href={invoicesIndex()}>Reset</Link>
                            </Button>
                        </Form>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Invoice list</CardTitle>
                        <CardDescription>{invoices.total} invoice records</CardDescription>
                    </CardHeader>

                    <CardContent className="overflow-x-auto px-0">
                        <table className="min-w-full text-sm">
                            <thead>
                                <tr className="border-b text-left text-muted-foreground">
                                    <th className="px-6 py-3 font-medium">Invoice</th>
                                    <th className="px-6 py-3 font-medium">Linked records</th>
                                    <th className="px-6 py-3 font-medium">Dates</th>
                                    <th className="px-6 py-3 font-medium">Amounts</th>
                                    <th className="px-6 py-3 font-medium">Status</th>
                                    <th className="px-6 py-3 font-medium text-right">Actions</th>
                                </tr>
                            </thead>

                            <tbody>
                                {invoices.data.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-10 text-center text-muted-foreground">
                                            No invoices matched the current filters.
                                        </td>
                                    </tr>
                                )}

                                {invoices.data.map((invoice) => (
                                    <tr key={invoice.id} className="border-b align-top last:border-0">
                                        <td className="px-6 py-4">
                                            <div className="space-y-1">
                                                <p className="font-medium">{invoice.invoice_no}</p>
                                                <p className="text-muted-foreground">
                                                    {invoice.customer.customer_code} - {invoice.customer.company_name}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    {invoice.payment_count} payments • {invoice.attachment_count} attachments
                                                </p>
                                            </div>
                                        </td>

                                        <td className="px-6 py-4 text-muted-foreground">
                                            <div className="space-y-1">
                                                <p>
                                                    {invoice.quotation.quotation_no
                                                        ? `Quotation: ${invoice.quotation.quotation_no}`
                                                        : 'No quotation linked'}
                                                </p>
                                                <p>
                                                    {invoice.project.project_no
                                                        ? `Project: ${invoice.project.project_no}`
                                                        : 'No project linked'}
                                                </p>
                                                <p>
                                                    {invoice.work_order.work_order_no
                                                        ? `Work order: ${invoice.work_order.work_order_no}`
                                                        : 'No work order linked'}
                                                </p>
                                            </div>
                                        </td>

                                        <td className="px-6 py-4 text-muted-foreground">
                                            <div className="space-y-1">
                                                <p>Invoice: {formatDate(invoice.invoice_date)}</p>
                                                <p>Due: {formatDate(invoice.due_date)}</p>
                                            </div>
                                        </td>

                                        <td className="px-6 py-4">
                                            <div className="space-y-1">
                                                <p className="font-medium">{formatCurrency(invoice.total_amount)}</p>
                                                <p className="text-muted-foreground">
                                                    Paid: {formatCurrency(invoice.paid_amount)}
                                                </p>
                                                <p className="text-muted-foreground">
                                                    Balance: {formatCurrency(invoice.balance_amount)}
                                                </p>
                                            </div>
                                        </td>

                                        <td className="px-6 py-4">
                                            <Badge variant="outline" className={statusBadgeClass(invoice.status)}>
                                                {invoice.status_label}
                                            </Badge>
                                        </td>

                                        <td className="px-6 py-4">
                                            <div className="flex justify-end gap-2">
                                                {invoice.can.record_payment && (
                                                    <Button variant="outline" size="sm" asChild>
                                                        <Link href={paymentsCreate({ query: { invoice: invoice.id } })}>
                                                            Collect
                                                        </Link>
                                                    </Button>
                                                )}

                                                {invoice.can.view && (
                                                    <Button variant="outline" size="sm" asChild>
                                                        <Link href={invoicesShow(invoice.id)}>Open</Link>
                                                    </Button>
                                                )}

                                                {invoice.can.update && (
                                                    <Button size="sm" asChild>
                                                        <Link href={invoicesEdit(invoice.id)}>Edit</Link>
                                                    </Button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </CardContent>

                    <PaginationLinks pagination={invoices} />
                </Card>
            </div>
        </>
    );
}

InvoicesIndex.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: dashboard(),
        },
        {
            title: 'Invoices',
            href: invoicesIndex(),
        },
    ],
};
