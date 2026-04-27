import { Head, Link } from '@inertiajs/react';
import PayrollRunController from '@/actions/App/Http/Controllers/Payroll/PayrollRunController';
import { dashboard } from '@/routes';
import { show as employeesShow } from '@/routes/employees';
import {
    edit as payrollRunsEdit,
    index as payrollRunsIndex,
    show as payrollRunsShow,
} from '@/routes/payroll-runs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import type { PayrollRunDetail } from '@/types';

type Props = {
    payrollRun: PayrollRunDetail;
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
        month: 'long',
        day: 'numeric',
        year: 'numeric',
    }).format(new Date(date));
}

function statusBadgeClass(status: string): string {
    return (
        {
            draft: 'border-slate-200 bg-slate-100 text-slate-700',
            processed: 'border-emerald-200 bg-emerald-50 text-emerald-700',
            cancelled: 'border-rose-200 bg-rose-50 text-rose-700',
        }[status] ?? 'border-slate-200 bg-slate-100 text-slate-700'
    );
}

export default function PayrollRunsShow({ payrollRun }: Props) {
    return (
        <>
            <Head title={payrollRun.payroll_run_no} />

            <div className="app-page flex flex-1 flex-col gap-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                            <h1 className="text-2xl font-semibold tracking-tight">
                                {payrollRun.payroll_run_no}
                            </h1>
                            <Badge
                                variant="outline"
                                className={statusBadgeClass(payrollRun.status)}
                            >
                                {payrollRun.status_label}
                            </Badge>
                        </div>

                        <p className="text-sm text-muted-foreground">
                            Payroll date {formatDate(payrollRun.payroll_date)} •
                            Prepared by{' '}
                            {payrollRun.prepared_by ?? 'Not recorded'}
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        {payrollRun.can.update && (
                            <Button asChild>
                                <Link href={payrollRunsEdit(payrollRun.id)}>
                                    Edit payroll run
                                </Link>
                            </Button>
                        )}

                        {payrollRun.can.delete && (
                            <Button variant="outline" asChild>
                                <Link
                                    href={PayrollRunController.destroy(
                                        payrollRun.id,
                                    )}
                                    method="delete"
                                    as="button"
                                >
                                    Archive
                                </Link>
                            </Button>
                        )}
                    </div>
                </div>

                <div className="grid gap-4 md:grid-cols-4">
                    <Card>
                        <CardHeader>
                            <CardDescription>Employees</CardDescription>
                            <CardTitle>{payrollRun.entry_count}</CardTitle>
                        </CardHeader>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardDescription>Gross total</CardDescription>
                            <CardTitle>
                                {formatCurrency(payrollRun.gross_total)}
                            </CardTitle>
                        </CardHeader>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardDescription>Total deductions</CardDescription>
                            <CardTitle>
                                {formatCurrency(payrollRun.total_deductions)}
                            </CardTitle>
                        </CardHeader>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardDescription>Net total</CardDescription>
                            <CardTitle>
                                {formatCurrency(payrollRun.net_total)}
                            </CardTitle>
                        </CardHeader>
                    </Card>
                </div>

                <div className="grid gap-6 xl:grid-cols-[1.1fr_1fr]">
                    <Card>
                        <CardHeader>
                            <CardTitle>Run details</CardTitle>
                            <CardDescription>
                                Header values captured for this payroll batch.
                            </CardDescription>
                        </CardHeader>

                        <CardContent className="grid gap-5 md:grid-cols-2">
                            <div>
                                <p className="text-sm text-muted-foreground">
                                    Covered period
                                </p>
                                <p className="mt-1 font-medium">
                                    {formatDate(payrollRun.period_from)} to{' '}
                                    {formatDate(payrollRun.period_to)}
                                </p>
                            </div>

                            <div>
                                <p className="text-sm text-muted-foreground">
                                    Payroll date
                                </p>
                                <p className="mt-1 font-medium">
                                    {formatDate(payrollRun.payroll_date)}
                                </p>
                            </div>

                            <div>
                                <p className="text-sm text-muted-foreground">
                                    Prepared by
                                </p>
                                <p className="mt-1 font-medium">
                                    {payrollRun.prepared_by ?? 'Not recorded'}
                                </p>
                            </div>

                            <div>
                                <p className="text-sm text-muted-foreground">
                                    Status
                                </p>
                                <p className="mt-1 font-medium">
                                    {payrollRun.status_label}
                                </p>
                            </div>

                            <div className="md:col-span-2">
                                <p className="text-sm text-muted-foreground">
                                    Remarks
                                </p>
                                <p className="mt-1 font-medium whitespace-pre-line">
                                    {payrollRun.remarks ?? 'No remarks'}
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Run snapshot</CardTitle>
                            <CardDescription>
                                High-level payout view for quick review before
                                releasing payroll.
                            </CardDescription>
                        </CardHeader>

                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between rounded-lg border px-4 py-3">
                                <span className="text-sm text-muted-foreground">
                                    Average gross pay
                                </span>
                                <span className="font-medium">
                                    {formatCurrency(
                                        payrollRun.entry_count === 0
                                            ? 0
                                            : payrollRun.gross_total /
                                                  payrollRun.entry_count,
                                    )}
                                </span>
                            </div>

                            <div className="flex items-center justify-between rounded-lg border px-4 py-3">
                                <span className="text-sm text-muted-foreground">
                                    Average net pay
                                </span>
                                <span className="font-medium">
                                    {formatCurrency(
                                        payrollRun.entry_count === 0
                                            ? 0
                                            : payrollRun.net_total /
                                                  payrollRun.entry_count,
                                    )}
                                </span>
                            </div>

                            <div className="flex items-center justify-between rounded-lg border px-4 py-3">
                                <span className="text-sm text-muted-foreground">
                                    Average deductions
                                </span>
                                <span className="font-medium">
                                    {formatCurrency(
                                        payrollRun.entry_count === 0
                                            ? 0
                                            : payrollRun.total_deductions /
                                                  payrollRun.entry_count,
                                    )}
                                </span>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Payroll entries</CardTitle>
                        <CardDescription>
                            Employee line items, deduction values, and remarks
                            captured for this run.
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="overflow-x-auto px-0">
                        <table className="min-w-full text-sm">
                            <thead>
                                <tr className="border-b text-left text-muted-foreground">
                                    <th className="px-6 py-3 font-medium">
                                        Employee
                                    </th>
                                    <th className="px-6 py-3 font-medium">
                                        Assignment
                                    </th>
                                    <th className="px-6 py-3 font-medium">
                                        Amounts
                                    </th>
                                    <th className="px-6 py-3 font-medium">
                                        Additional deductions
                                    </th>
                                    <th className="px-6 py-3 font-medium">
                                        Remarks
                                    </th>
                                </tr>
                            </thead>

                            <tbody>
                                {payrollRun.entries.length === 0 && (
                                    <tr>
                                        <td
                                            colSpan={5}
                                            className="px-6 py-10 text-center text-muted-foreground"
                                        >
                                            No payroll entries were saved for
                                            this run.
                                        </td>
                                    </tr>
                                )}

                                {payrollRun.entries.map((entry) => (
                                    <tr
                                        key={entry.id}
                                        className="border-b align-top last:border-0"
                                    >
                                        <td className="px-6 py-4">
                                            <div className="space-y-1">
                                                <p className="font-medium">
                                                    {entry.employee.id ? (
                                                        <Link
                                                            href={employeesShow(
                                                                entry.employee
                                                                    .id,
                                                            )}
                                                            className="underline-offset-4 hover:text-primary hover:underline"
                                                        >
                                                            {entry.employee
                                                                .full_name ??
                                                                'Unlinked employee'}
                                                        </Link>
                                                    ) : (
                                                        (entry.employee
                                                            .full_name ??
                                                        'Unlinked employee')
                                                    )}
                                                </p>
                                                <p className="text-muted-foreground">
                                                    {entry.employee
                                                        .employee_no ??
                                                        'No employee no.'}
                                                </p>
                                            </div>
                                        </td>

                                        <td className="px-6 py-4 text-muted-foreground">
                                            <div className="space-y-1">
                                                <p>
                                                    {entry.employee
                                                        .department_name ??
                                                        'No department'}
                                                </p>
                                                <p>
                                                    {entry.employee
                                                        .position_title ??
                                                        'No position'}
                                                </p>
                                            </div>
                                        </td>

                                        <td className="px-6 py-4">
                                            <div className="space-y-1">
                                                <p className="font-medium">
                                                    Gross{' '}
                                                    {formatCurrency(
                                                        entry.gross_pay,
                                                    )}
                                                </p>
                                                <p className="text-muted-foreground">
                                                    Statutory:{' '}
                                                    {formatCurrency(
                                                        entry.tax_amount +
                                                            entry.sss_amount +
                                                            entry.pagibig_amount +
                                                            entry.philhealth_amount,
                                                    )}
                                                </p>
                                                <p className="text-muted-foreground">
                                                    Other:{' '}
                                                    {formatCurrency(
                                                        entry.other_deductions_amount,
                                                    )}
                                                </p>
                                                <p className="text-muted-foreground">
                                                    Net:{' '}
                                                    {formatCurrency(
                                                        entry.net_pay,
                                                    )}
                                                </p>
                                            </div>
                                        </td>

                                        <td className="px-6 py-4 text-muted-foreground">
                                            <div className="space-y-2">
                                                {entry.deductions.length ===
                                                    0 && (
                                                    <p>
                                                        No additional deductions
                                                    </p>
                                                )}

                                                {entry.deductions.map(
                                                    (deduction) => (
                                                        <div
                                                            key={deduction.id}
                                                            className="rounded-md border px-3 py-2"
                                                        >
                                                            <p className="font-medium text-foreground">
                                                                {
                                                                    deduction.deduction_name
                                                                }
                                                            </p>
                                                            <p>
                                                                {formatCurrency(
                                                                    deduction.amount,
                                                                )}
                                                            </p>
                                                            <p className="text-xs">
                                                                {deduction.remarks ??
                                                                    'No remarks'}
                                                            </p>
                                                        </div>
                                                    ),
                                                )}
                                            </div>
                                        </td>

                                        <td className="px-6 py-4 text-muted-foreground">
                                            {entry.remarks ?? 'No remarks'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

PayrollRunsShow.layout = ({ payrollRun }: Props) => ({
    breadcrumbs: [
        { title: 'Dashboard', href: dashboard() },
        { title: 'Payroll Runs', href: payrollRunsIndex() },
        {
            title: payrollRun.payroll_run_no,
            href: payrollRunsShow(payrollRun.id),
        },
    ],
});
