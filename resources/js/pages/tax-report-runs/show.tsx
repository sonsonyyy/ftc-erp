import { Head, Link } from '@inertiajs/react';
import TaxReportRunController from '@/actions/App/Http/Controllers/Tax/TaxReportRunController';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { dashboard } from '@/routes';
import { show as customersShow } from '@/routes/customers';
import { show as employeesShow } from '@/routes/employees';
import { show as invoicesShow } from '@/routes/invoices';
import { show as payrollRunsShow } from '@/routes/payroll-runs';
import {
    index as taxReportRunsIndex,
    show as taxReportRunsShow,
} from '@/routes/tax-report-runs';
import { index as vatRecordsIndex } from '@/routes/vat-records';
import { index as withholdingRecordsIndex } from '@/routes/withholding-records';
import type { TaxReportRunDetail } from '@/types';

type Props = {
    taxReportRun: TaxReportRunDetail;
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

function formatDateTime(date: string | null): string {
    if (!date) {
        return 'Not generated';
    }

    return new Intl.DateTimeFormat('en-PH', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
    }).format(new Date(date));
}

function toNumber(value: unknown): number | null {
    return typeof value === 'number' ? value : null;
}

function toStringValue(value: unknown): string | null {
    return typeof value === 'string' ? value : null;
}

export default function TaxReportRunsShow({ taxReportRun }: Props) {
    return (
        <>
            <Head title={taxReportRun.report_no} />

            <div className="app-page flex flex-1 flex-col gap-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div className="space-y-1">
                        <h1 className="text-2xl font-semibold tracking-tight">
                            {taxReportRun.report_no}
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            {taxReportRun.report_type_label} • Generated{' '}
                            {formatDateTime(taxReportRun.generated_at)}
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        <Button variant="outline" asChild>
                            <Link href={withholdingRecordsIndex()}>
                                Withholding records
                            </Link>
                        </Button>

                        <Button variant="outline" asChild>
                            <Link href={vatRecordsIndex()}>VAT records</Link>
                        </Button>

                        {taxReportRun.can.delete && (
                            <Button asChild>
                                <Link
                                    href={TaxReportRunController.destroy(
                                        taxReportRun.id,
                                    )}
                                    method="delete"
                                    as="button"
                                >
                                    Archive run
                                </Link>
                            </Button>
                        )}
                    </div>
                </div>

                <div className="grid gap-4 md:grid-cols-4">
                    <Card>
                        <CardHeader>
                            <CardDescription>Items</CardDescription>
                            <CardTitle>{taxReportRun.item_count}</CardTitle>
                        </CardHeader>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardDescription>Base total</CardDescription>
                            <CardTitle>
                                {formatCurrency(taxReportRun.base_amount_total)}
                            </CardTitle>
                        </CardHeader>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardDescription>Amount total</CardDescription>
                            <CardTitle>
                                {formatCurrency(taxReportRun.amount_total)}
                            </CardTitle>
                        </CardHeader>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardDescription>VAT total</CardDescription>
                            <CardTitle>
                                {formatCurrency(taxReportRun.vat_amount_total)}
                            </CardTitle>
                        </CardHeader>
                    </Card>
                </div>

                <div className="grid gap-6 xl:grid-cols-[1.1fr_1fr]">
                    <Card>
                        <CardHeader>
                            <CardTitle>Run details</CardTitle>
                            <CardDescription>
                                Saved report metadata and the period this run
                                covered.
                            </CardDescription>
                        </CardHeader>

                        <CardContent className="grid gap-5 md:grid-cols-2">
                            <div>
                                <p className="text-sm text-muted-foreground">
                                    Report type
                                </p>
                                <p className="mt-1 font-medium">
                                    {taxReportRun.report_type_label}
                                </p>
                            </div>

                            <div>
                                <p className="text-sm text-muted-foreground">
                                    Generated by
                                </p>
                                <p className="mt-1 font-medium">
                                    {taxReportRun.generated_by ??
                                        'Unknown user'}
                                </p>
                            </div>

                            <div>
                                <p className="text-sm text-muted-foreground">
                                    Period from
                                </p>
                                <p className="mt-1 font-medium">
                                    {formatDate(taxReportRun.period_from)}
                                </p>
                            </div>

                            <div>
                                <p className="text-sm text-muted-foreground">
                                    Period to
                                </p>
                                <p className="mt-1 font-medium">
                                    {formatDate(taxReportRun.period_to)}
                                </p>
                            </div>

                            <div className="md:col-span-2">
                                <p className="text-sm text-muted-foreground">
                                    Remarks
                                </p>
                                <p className="mt-1 font-medium whitespace-pre-line">
                                    {taxReportRun.remarks ?? 'No remarks'}
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Run totals</CardTitle>
                            <CardDescription>
                                Snapshot totals based on the source records
                                captured at generation time.
                            </CardDescription>
                        </CardHeader>

                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between rounded-lg border px-4 py-3">
                                <span className="text-sm text-muted-foreground">
                                    Base total
                                </span>
                                <span className="font-medium">
                                    {formatCurrency(
                                        taxReportRun.base_amount_total,
                                    )}
                                </span>
                            </div>
                            <div className="flex items-center justify-between rounded-lg border px-4 py-3">
                                <span className="text-sm text-muted-foreground">
                                    Amount total
                                </span>
                                <span className="font-medium">
                                    {formatCurrency(taxReportRun.amount_total)}
                                </span>
                            </div>
                            <div className="flex items-center justify-between rounded-lg border px-4 py-3">
                                <span className="text-sm text-muted-foreground">
                                    VAT total
                                </span>
                                <span className="font-medium">
                                    {formatCurrency(
                                        taxReportRun.vat_amount_total,
                                    )}
                                </span>
                            </div>
                            <div className="flex items-center justify-between rounded-lg border px-4 py-3">
                                <span className="text-sm text-muted-foreground">
                                    Gross total
                                </span>
                                <span className="font-medium">
                                    {formatCurrency(
                                        taxReportRun.gross_amount_total,
                                    )}
                                </span>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Report items</CardTitle>
                        <CardDescription>
                            Snapshot lines captured from the source records at
                            the time the report run was generated.
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="overflow-x-auto px-0">
                        <table className="min-w-full text-sm">
                            <thead>
                                <tr className="border-b text-left text-muted-foreground">
                                    <th className="px-6 py-3 font-medium">
                                        Date / type
                                    </th>
                                    <th className="px-6 py-3 font-medium">
                                        Reference
                                    </th>
                                    <th className="px-6 py-3 font-medium">
                                        Subject
                                    </th>
                                    <th className="px-6 py-3 font-medium">
                                        Amounts
                                    </th>
                                    <th className="px-6 py-3 text-right font-medium">
                                        Source
                                    </th>
                                </tr>
                            </thead>

                            <tbody>
                                {taxReportRun.items.length === 0 && (
                                    <tr>
                                        <td
                                            colSpan={5}
                                            className="px-6 py-10 text-center text-muted-foreground"
                                        >
                                            No source records were captured for
                                            this run.
                                        </td>
                                    </tr>
                                )}

                                {taxReportRun.items.map((item) => {
                                    const employeeId = toNumber(
                                        item.payload.employee_id,
                                    );
                                    const payrollRunId = toNumber(
                                        item.payload.payroll_run_id,
                                    );
                                    const invoiceId = toNumber(
                                        item.payload.invoice_id,
                                    );
                                    const customerId = toNumber(
                                        item.payload.customer_id,
                                    );
                                    const payrollRunNo = toStringValue(
                                        item.payload.payroll_run_no,
                                    );
                                    const invoiceNo = toStringValue(
                                        item.payload.invoice_no,
                                    );

                                    return (
                                        <tr
                                            key={item.id}
                                            className="border-b align-top last:border-0"
                                        >
                                            <td className="px-6 py-4">
                                                <div className="space-y-1">
                                                    <p className="font-medium">
                                                        {formatDate(
                                                            item.record_date,
                                                        )}
                                                    </p>
                                                    <p className="text-muted-foreground">
                                                        {item.line_type_label}
                                                    </p>
                                                </div>
                                            </td>

                                            <td className="px-6 py-4 text-muted-foreground">
                                                {item.reference_no ??
                                                    'No reference'}
                                            </td>

                                            <td className="px-6 py-4">
                                                <div className="space-y-1">
                                                    <p className="font-medium">
                                                        {item.subject_name ??
                                                            'No subject'}
                                                    </p>
                                                    <p className="text-muted-foreground">
                                                        {item.subject_tin ??
                                                            'No TIN'}
                                                    </p>
                                                </div>
                                            </td>

                                            <td className="px-6 py-4">
                                                <div className="space-y-1">
                                                    <p className="font-medium">
                                                        Base{' '}
                                                        {formatCurrency(
                                                            item.base_amount,
                                                        )}
                                                    </p>
                                                    <p className="text-muted-foreground">
                                                        Amount{' '}
                                                        {formatCurrency(
                                                            item.amount,
                                                        )}
                                                    </p>
                                                    <p className="text-muted-foreground">
                                                        VAT{' '}
                                                        {formatCurrency(
                                                            item.vat_amount,
                                                        )}
                                                    </p>
                                                    <p className="text-muted-foreground">
                                                        Gross{' '}
                                                        {formatCurrency(
                                                            item.gross_amount,
                                                        )}
                                                    </p>
                                                </div>
                                            </td>

                                            <td className="px-6 py-4">
                                                <div className="flex justify-end gap-2">
                                                    {employeeId && (
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            asChild
                                                        >
                                                            <Link
                                                                href={employeesShow(
                                                                    employeeId,
                                                                )}
                                                            >
                                                                Employee
                                                            </Link>
                                                        </Button>
                                                    )}

                                                    {payrollRunId && (
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            asChild
                                                        >
                                                            <Link
                                                                href={payrollRunsShow(
                                                                    payrollRunId,
                                                                )}
                                                            >
                                                                {payrollRunNo ??
                                                                    'Payroll run'}
                                                            </Link>
                                                        </Button>
                                                    )}

                                                    {customerId && (
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            asChild
                                                        >
                                                            <Link
                                                                href={customersShow(
                                                                    customerId,
                                                                )}
                                                            >
                                                                Customer
                                                            </Link>
                                                        </Button>
                                                    )}

                                                    {invoiceId && (
                                                        <Button
                                                            size="sm"
                                                            asChild
                                                        >
                                                            <Link
                                                                href={invoicesShow(
                                                                    invoiceId,
                                                                )}
                                                            >
                                                                {invoiceNo ??
                                                                    'Invoice'}
                                                            </Link>
                                                        </Button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

TaxReportRunsShow.layout = ({ taxReportRun }: Props) => ({
    breadcrumbs: [
        { title: 'Dashboard', href: dashboard() },
        { title: 'Tax Report Runs', href: taxReportRunsIndex() },
        {
            title: taxReportRun.report_no,
            href: taxReportRunsShow(taxReportRun.id),
        },
    ],
});
