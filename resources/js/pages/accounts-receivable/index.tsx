import { Form, Head, Link } from '@inertiajs/react';
import { dashboard } from '@/routes';
import { index as accountsReceivableIndex } from '@/routes/accounts-receivable';
import { show as invoicesShow } from '@/routes/invoices';
import { PaginationLinks } from '@/components/pagination-links';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type {
    AccountsReceivableRow,
    AccountsReceivableSummary,
    InvoiceFilters,
    PaginatedData,
    SelectOption,
} from '@/types';

type Props = {
    report: PaginatedData<AccountsReceivableRow>;
    summary: AccountsReceivableSummary;
    filters: InvoiceFilters;
    customerOptions: SelectOption[];
    statusOptions: SelectOption[];
};

function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-PH', {
        style: 'currency',
        currency: 'PHP',
        maximumFractionDigits: 2,
    }).format(amount);
}

function statusBadgeClass(status: string): string {
    return {
        issued: 'border-sky-200 bg-sky-50 text-sky-700',
        partially_paid: 'border-amber-200 bg-amber-50 text-amber-700',
        paid: 'border-emerald-200 bg-emerald-50 text-emerald-700',
        overdue: 'border-rose-200 bg-rose-50 text-rose-700',
    }[status] ?? 'border-slate-200 bg-slate-100 text-slate-700';
}

export default function AccountsReceivableIndex({
    report,
    summary,
    filters,
    customerOptions,
    statusOptions,
}: Props) {
    return (
        <>
            <Head title="Accounts Receivable" />

            <div className="flex flex-1 flex-col gap-6 p-4">
                <div className="space-y-1">
                    <h1 className="text-2xl font-semibold tracking-tight">Accounts Receivable</h1>
                    <p className="text-sm text-muted-foreground">
                        Review current, overdue, partial, and paid billing visibility using live invoice and payment balances.
                    </p>
                </div>

                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    <Card>
                        <CardHeader>
                            <CardDescription>Total outstanding</CardDescription>
                            <CardTitle>{formatCurrency(summary.total_outstanding)}</CardTitle>
                        </CardHeader>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardDescription>Current balance</CardDescription>
                            <CardTitle>{formatCurrency(summary.current_balance)}</CardTitle>
                        </CardHeader>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardDescription>Overdue balance</CardDescription>
                            <CardTitle>{formatCurrency(summary.overdue_balance)}</CardTitle>
                        </CardHeader>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardDescription>Partially paid balance</CardDescription>
                            <CardTitle>{formatCurrency(summary.partially_paid_balance)}</CardTitle>
                        </CardHeader>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardDescription>Paid invoices</CardDescription>
                            <CardTitle>{summary.paid_invoice_count}</CardTitle>
                        </CardHeader>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardDescription>Paid invoice value</CardDescription>
                            <CardTitle>{formatCurrency(summary.paid_invoice_value)}</CardTitle>
                        </CardHeader>
                    </Card>
                </div>

                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
                    <Card>
                        <CardHeader>
                            <CardDescription>Current bucket</CardDescription>
                            <CardTitle>{formatCurrency(summary.bucket_totals.current)}</CardTitle>
                        </CardHeader>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardDescription>1-30 days</CardDescription>
                            <CardTitle>{formatCurrency(summary.bucket_totals.days_1_30)}</CardTitle>
                        </CardHeader>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardDescription>31-60 days</CardDescription>
                            <CardTitle>{formatCurrency(summary.bucket_totals.days_31_60)}</CardTitle>
                        </CardHeader>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardDescription>61-90 days</CardDescription>
                            <CardTitle>{formatCurrency(summary.bucket_totals.days_61_90)}</CardTitle>
                        </CardHeader>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardDescription>91+ days</CardDescription>
                            <CardTitle>{formatCurrency(summary.bucket_totals.days_91_plus)}</CardTitle>
                        </CardHeader>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Filters</CardTitle>
                        <CardDescription>
                            Filter the aging view by customer, billing status, and invoice date range.
                        </CardDescription>
                    </CardHeader>

                    <CardContent>
                        <Form
                            action={accountsReceivableIndex()}
                            method="get"
                            options={{ preserveState: true, replace: true }}
                            className="grid gap-3 xl:grid-cols-[2fr_1.3fr_1fr_1fr_1fr_auto_auto]"
                        >
                            <Input name="search" defaultValue={filters.search} placeholder="Search AR rows" />

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
                                <Link href={accountsReceivableIndex()}>Reset</Link>
                            </Button>
                        </Form>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Aging detail</CardTitle>
                        <CardDescription>{report.total} billing rows in the current view</CardDescription>
                    </CardHeader>

                    <CardContent className="overflow-x-auto px-0">
                        <table className="min-w-full text-sm">
                            <thead>
                                <tr className="border-b text-left text-muted-foreground">
                                    <th className="px-6 py-3 font-medium">Invoice</th>
                                    <th className="px-6 py-3 font-medium">Customer</th>
                                    <th className="px-6 py-3 font-medium">Linked records</th>
                                    <th className="px-6 py-3 font-medium">Aging</th>
                                    <th className="px-6 py-3 font-medium">Amounts</th>
                                    <th className="px-6 py-3 font-medium">Status</th>
                                    <th className="px-6 py-3 font-medium text-right">Actions</th>
                                </tr>
                            </thead>

                            <tbody>
                                {report.data.length === 0 && (
                                    <tr>
                                        <td colSpan={7} className="px-6 py-10 text-center text-muted-foreground">
                                            No AR rows matched the current filters.
                                        </td>
                                    </tr>
                                )}

                                {report.data.map((row) => (
                                    <tr key={row.id} className="border-b align-top last:border-0">
                                        <td className="px-6 py-4">
                                            <div className="space-y-1">
                                                <p className="font-medium">{row.invoice_no}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    {row.invoice_date ?? 'No invoice date'} • Due {row.due_date ?? 'Not set'}
                                                </p>
                                            </div>
                                        </td>

                                        <td className="px-6 py-4 text-muted-foreground">
                                            {row.customer.customer_code} - {row.customer.company_name}
                                        </td>

                                        <td className="px-6 py-4 text-muted-foreground">
                                            <div className="space-y-1">
                                                <p>
                                                    {row.project.project_no
                                                        ? `Project: ${row.project.project_no}`
                                                        : 'No project linked'}
                                                </p>
                                                <p>
                                                    {row.work_order.work_order_no
                                                        ? `Work order: ${row.work_order.work_order_no}`
                                                        : 'No work order linked'}
                                                </p>
                                            </div>
                                        </td>

                                        <td className="px-6 py-4">
                                            <div className="space-y-1">
                                                <p className="font-medium">{row.aging_bucket}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    {row.age_days === null ? 'No overdue age' : `${row.age_days} day(s)`}
                                                </p>
                                            </div>
                                        </td>

                                        <td className="px-6 py-4">
                                            <div className="space-y-1">
                                                <p className="font-medium">{formatCurrency(row.total_amount)}</p>
                                                <p className="text-muted-foreground">
                                                    Paid: {formatCurrency(row.paid_amount)}
                                                </p>
                                                <p className="text-muted-foreground">
                                                    Balance: {formatCurrency(row.balance_amount)}
                                                </p>
                                            </div>
                                        </td>

                                        <td className="px-6 py-4">
                                            <Badge variant="outline" className={statusBadgeClass(row.status)}>
                                                {row.status_label}
                                            </Badge>
                                        </td>

                                        <td className="px-6 py-4">
                                            <div className="flex justify-end gap-2">
                                                <Button variant="outline" size="sm" asChild>
                                                    <Link href={invoicesShow(row.id)}>Open</Link>
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </CardContent>

                    <PaginationLinks pagination={report} />
                </Card>
            </div>
        </>
    );
}

AccountsReceivableIndex.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: dashboard(),
        },
        {
            title: 'Accounts Receivable',
            href: accountsReceivableIndex(),
        },
    ],
};
