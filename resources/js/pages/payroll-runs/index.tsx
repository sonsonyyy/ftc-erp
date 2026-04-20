import { Form, Head, Link } from '@inertiajs/react';
import { dashboard } from '@/routes';
import {
    create as payrollRunsCreate,
    edit as payrollRunsEdit,
    index as payrollRunsIndex,
    show as payrollRunsShow,
} from '@/routes/payroll-runs';
import { PaginationLinks } from '@/components/pagination-links';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import type { PaginatedData, PayrollRunListItem, SelectOption } from '@/types';

type Props = {
    payrollRuns: PaginatedData<PayrollRunListItem>;
    filters: {
        search: string;
        status: string;
        from: string | null;
        to: string | null;
    };
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
        processed: 'border-emerald-200 bg-emerald-50 text-emerald-700',
        cancelled: 'border-rose-200 bg-rose-50 text-rose-700',
    }[status] ?? 'border-slate-200 bg-slate-100 text-slate-700';
}

export default function PayrollRunsIndex({
    payrollRuns,
    filters,
    statusOptions,
    can,
}: Props) {
    return (
        <>
            <Head title="Payroll Runs" />

            <div className="flex flex-1 flex-col gap-6 p-4">
                <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                    <div className="space-y-1">
                        <h1 className="text-2xl font-semibold tracking-tight">Payroll Runs</h1>
                        <p className="text-sm text-muted-foreground">
                            Prepare payroll batches with per-employee deductions, then review totals before payout.
                        </p>
                    </div>

                    {can.create && (
                        <Button asChild>
                            <Link href={payrollRunsCreate()}>New payroll run</Link>
                        </Button>
                    )}
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Filters</CardTitle>
                        <CardDescription>
                            Search by payroll run number or employee, then narrow by run status and payroll date window.
                        </CardDescription>
                    </CardHeader>

                    <CardContent>
                        <Form
                            action={payrollRunsIndex()}
                            method="get"
                            options={{ preserveState: true, replace: true }}
                            className="grid gap-3 xl:grid-cols-[2fr_1fr_1fr_1fr_auto_auto]"
                        >
                            <Input
                                name="search"
                                defaultValue={filters.search}
                                placeholder="Search payroll runs"
                            />

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
                                <Link href={payrollRunsIndex()}>Reset</Link>
                            </Button>
                        </Form>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Payroll run list</CardTitle>
                        <CardDescription>{payrollRuns.total} payroll runs recorded</CardDescription>
                    </CardHeader>

                    <CardContent className="overflow-x-auto px-0">
                        <table className="min-w-full text-sm">
                            <thead>
                                <tr className="border-b text-left text-muted-foreground">
                                    <th className="px-6 py-3 font-medium">Run</th>
                                    <th className="px-6 py-3 font-medium">Coverage</th>
                                    <th className="px-6 py-3 font-medium">Totals</th>
                                    <th className="px-6 py-3 font-medium">Status</th>
                                    <th className="px-6 py-3 font-medium">Prepared by</th>
                                    <th className="px-6 py-3 font-medium text-right">Actions</th>
                                </tr>
                            </thead>

                            <tbody>
                                {payrollRuns.data.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-10 text-center text-muted-foreground">
                                            No payroll runs matched the current filters.
                                        </td>
                                    </tr>
                                )}

                                {payrollRuns.data.map((payrollRun) => (
                                    <tr key={payrollRun.id} className="border-b align-top last:border-0">
                                        <td className="px-6 py-4">
                                            <div className="space-y-1">
                                                <p className="font-medium">{payrollRun.payroll_run_no}</p>
                                                <p className="text-muted-foreground">
                                                    Payroll date: {formatDate(payrollRun.payroll_date)}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    {payrollRun.entry_count} employees
                                                </p>
                                            </div>
                                        </td>

                                        <td className="px-6 py-4 text-muted-foreground">
                                            <div className="space-y-1">
                                                <p>From: {formatDate(payrollRun.period_from)}</p>
                                                <p>To: {formatDate(payrollRun.period_to)}</p>
                                            </div>
                                        </td>

                                        <td className="px-6 py-4">
                                            <div className="space-y-1">
                                                <p className="font-medium">{formatCurrency(payrollRun.gross_total)}</p>
                                                <p className="text-muted-foreground">
                                                    Deductions: {formatCurrency(payrollRun.total_deductions)}
                                                </p>
                                                <p className="text-muted-foreground">
                                                    Net: {formatCurrency(payrollRun.net_total)}
                                                </p>
                                            </div>
                                        </td>

                                        <td className="px-6 py-4">
                                            <Badge variant="outline" className={statusBadgeClass(payrollRun.status)}>
                                                {payrollRun.status_label}
                                            </Badge>
                                        </td>

                                        <td className="px-6 py-4 text-muted-foreground">
                                            {payrollRun.prepared_by ?? 'Not recorded'}
                                        </td>

                                        <td className="px-6 py-4">
                                            <div className="flex justify-end gap-2">
                                                {payrollRun.can.view && (
                                                    <Button variant="outline" size="sm" asChild>
                                                        <Link href={payrollRunsShow(payrollRun.id)}>Open</Link>
                                                    </Button>
                                                )}

                                                {payrollRun.can.update && (
                                                    <Button size="sm" asChild>
                                                        <Link href={payrollRunsEdit(payrollRun.id)}>Edit</Link>
                                                    </Button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </CardContent>

                    <PaginationLinks pagination={payrollRuns} />
                </Card>
            </div>
        </>
    );
}

PayrollRunsIndex.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: dashboard() },
        { title: 'Payroll Runs', href: payrollRunsIndex() },
    ],
};
