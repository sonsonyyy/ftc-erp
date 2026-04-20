import { Head, Link } from '@inertiajs/react';
import { dashboard } from '@/routes';
import { index as invoicesIndex, show as invoicesShow } from '@/routes/invoices';
import { index as paymentsIndex } from '@/routes/payments';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { PaymentDetail } from '@/types';

type Props = {
    payment: PaymentDetail;
};

function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-PH', {
        style: 'currency',
        currency: 'PHP',
        maximumFractionDigits: 2,
    }).format(amount);
}

function statusBadgeClass(status: string | null): string {
    return {
        issued: 'border-sky-200 bg-sky-50 text-sky-700',
        partially_paid: 'border-amber-200 bg-amber-50 text-amber-700',
        paid: 'border-emerald-200 bg-emerald-50 text-emerald-700',
        overdue: 'border-rose-200 bg-rose-50 text-rose-700',
    }[status ?? ''] ?? 'border-slate-200 bg-slate-100 text-slate-700';
}

export default function PaymentsShow({ payment }: Props) {
    return (
        <>
            <Head title={payment.payment_no} />

            <div className="flex flex-1 flex-col gap-6 p-4">
                <div className="space-y-2">
                    <h1 className="text-2xl font-semibold tracking-tight">{payment.payment_no}</h1>
                    <p className="text-sm text-muted-foreground">
                        {payment.customer.customer_code} - {payment.customer.company_name}
                    </p>
                </div>

                <div className="grid gap-4 md:grid-cols-4">
                    <Card>
                        <CardHeader>
                            <CardDescription>Amount</CardDescription>
                            <CardTitle>{formatCurrency(payment.amount)}</CardTitle>
                        </CardHeader>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardDescription>Method</CardDescription>
                            <CardTitle className="text-base">{payment.payment_method}</CardTitle>
                        </CardHeader>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardDescription>Reference</CardDescription>
                            <CardTitle className="text-base">{payment.reference_no ?? 'Not set'}</CardTitle>
                        </CardHeader>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardDescription>Allocations</CardDescription>
                            <CardTitle>{payment.allocation_count}</CardTitle>
                        </CardHeader>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Payment information</CardTitle>
                        <CardDescription>
                            Receipt details and the user who recorded the payment.
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="grid gap-5 md:grid-cols-2">
                        <div>
                            <p className="text-sm text-muted-foreground">Payment date</p>
                            <p className="mt-1 font-medium">{payment.payment_date ?? 'Not set'}</p>
                        </div>

                        <div>
                            <p className="text-sm text-muted-foreground">Recorded by</p>
                            <p className="mt-1 font-medium">{payment.recorded_by ?? 'Not recorded'}</p>
                        </div>

                        <div className="md:col-span-2">
                            <p className="text-sm text-muted-foreground">Remarks</p>
                            <p className="mt-1 whitespace-pre-line font-medium">{payment.remarks ?? 'No remarks'}</p>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Invoice allocations</CardTitle>
                        <CardDescription>
                            Invoice balances updated by this payment.
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="overflow-x-auto px-0">
                        <table className="min-w-full text-sm">
                            <thead>
                                <tr className="border-b text-left text-muted-foreground">
                                    <th className="px-6 py-3 font-medium">Invoice</th>
                                    <th className="px-6 py-3 font-medium">Linked records</th>
                                    <th className="px-6 py-3 font-medium">Allocated</th>
                                    <th className="px-6 py-3 font-medium">Remaining balance</th>
                                    <th className="px-6 py-3 font-medium">Status</th>
                                    <th className="px-6 py-3 font-medium text-right">Actions</th>
                                </tr>
                            </thead>

                            <tbody>
                                {payment.allocations.map((allocation) => (
                                    <tr key={allocation.id} className="border-b align-top last:border-0">
                                        <td className="px-6 py-4">
                                            <div className="space-y-1">
                                                <p className="font-medium">{allocation.invoice.invoice_no}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    {allocation.invoice.invoice_date ?? 'No invoice date'} • Due {allocation.invoice.due_date ?? 'Not set'}
                                                </p>
                                            </div>
                                        </td>

                                        <td className="px-6 py-4 text-muted-foreground">
                                            <div className="space-y-1">
                                                <p>
                                                    {allocation.invoice.quotation.quotation_no
                                                        ? `Quotation: ${allocation.invoice.quotation.quotation_no}`
                                                        : 'No quotation linked'}
                                                </p>
                                                <p>
                                                    {allocation.invoice.project.project_no
                                                        ? `Project: ${allocation.invoice.project.project_no}`
                                                        : 'No project linked'}
                                                </p>
                                                <p>
                                                    {allocation.invoice.work_order.work_order_no
                                                        ? `Work order: ${allocation.invoice.work_order.work_order_no}`
                                                        : 'No work order linked'}
                                                </p>
                                            </div>
                                        </td>

                                        <td className="px-6 py-4 font-medium">{formatCurrency(allocation.allocated_amount)}</td>
                                        <td className="px-6 py-4">{formatCurrency(allocation.invoice.balance_amount)}</td>
                                        <td className="px-6 py-4">
                                            <Badge variant="outline" className={statusBadgeClass(allocation.invoice.status)}>
                                                {allocation.invoice.status_label}
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex justify-end gap-2">
                                                {allocation.can.view_invoice && allocation.invoice.id !== null && (
                                                    <Button variant="outline" size="sm" asChild>
                                                        <Link href={invoicesShow(allocation.invoice.id)}>Open invoice</Link>
                                                    </Button>
                                                )}
                                            </div>
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

PaymentsShow.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: dashboard(),
        },
        {
            title: 'Payments',
            href: paymentsIndex(),
        },
        {
            title: 'Invoices',
            href: invoicesIndex(),
        },
    ],
};
