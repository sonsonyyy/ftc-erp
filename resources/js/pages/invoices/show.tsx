import { Head, Link } from '@inertiajs/react';
import InvoiceController from '@/actions/App/Http/Controllers/Billing/InvoiceController';
import { dashboard } from '@/routes';
import {
    create as paymentsCreate,
    show as paymentsShow,
} from '@/routes/payments';
import {
    edit as invoicesEdit,
    index as invoicesIndex,
} from '@/routes/invoices';
import { RecordAttachmentsCard } from '@/components/attachments/record-attachments-card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import type { InvoiceDetail } from '@/types';

type Props = {
    invoice: InvoiceDetail;
};

function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-PH', {
        style: 'currency',
        currency: 'PHP',
        maximumFractionDigits: 2,
    }).format(amount);
}

function formatDateTime(date: string | null): string {
    if (!date) {
        return 'Not recorded';
    }

    return new Intl.DateTimeFormat('en-PH', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
    }).format(new Date(date));
}

function statusBadgeClass(status: string): string {
    return (
        {
            draft: 'border-slate-200 bg-slate-100 text-slate-700',
            issued: 'border-sky-200 bg-sky-50 text-sky-700',
            partially_paid: 'border-amber-200 bg-amber-50 text-amber-700',
            paid: 'border-emerald-200 bg-emerald-50 text-emerald-700',
            overdue: 'border-rose-200 bg-rose-50 text-rose-700',
            cancelled: 'border-stone-200 bg-stone-100 text-stone-700',
        }[status] ?? 'border-slate-200 bg-slate-100 text-slate-700'
    );
}

function approvalBadgeClass(state: string): string {
    return (
        {
            pending: 'border-amber-200 bg-amber-50 text-amber-700',
            approved: 'border-emerald-200 bg-emerald-50 text-emerald-700',
        }[state] ?? 'border-slate-200 bg-slate-100 text-slate-700'
    );
}

export default function InvoicesShow({ invoice }: Props) {
    const items = invoice.items ?? [];
    const payments = invoice.payments ?? [];
    const attachments = invoice.attachments ?? [];

    return (
        <>
            <Head title={invoice.invoice_no} />

            <div className="app-page flex flex-1 flex-col gap-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                            <h1 className="text-2xl font-semibold tracking-tight">
                                {invoice.invoice_no}
                            </h1>
                            <Badge
                                variant="outline"
                                className={statusBadgeClass(invoice.status)}
                            >
                                {invoice.status_label}
                            </Badge>
                            {invoice.approval_state !== 'not_requested' && (
                                <Badge
                                    variant="outline"
                                    className={approvalBadgeClass(
                                        invoice.approval_state,
                                    )}
                                >
                                    {invoice.approval_state_label}
                                </Badge>
                            )}
                        </div>

                        <p className="text-sm text-muted-foreground">
                            {invoice.customer.customer_code} -{' '}
                            {invoice.customer.company_name}
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        {invoice.can.submit && (
                            <Button variant="outline" asChild>
                                <Link
                                    href={InvoiceController.submit(invoice.id)}
                                    method="patch"
                                    as="button"
                                >
                                    Submit for approval
                                </Link>
                            </Button>
                        )}

                        {invoice.can.approve && (
                            <Button asChild>
                                <Link
                                    href={InvoiceController.approve(invoice.id)}
                                    method="patch"
                                    as="button"
                                >
                                    Approve and issue
                                </Link>
                            </Button>
                        )}

                        {invoice.can.record_payment && (
                            <Button variant="outline" asChild>
                                <Link
                                    href={paymentsCreate({
                                        query: { invoice: invoice.id },
                                    })}
                                >
                                    Record payment
                                </Link>
                            </Button>
                        )}

                        {invoice.can.update && (
                            <Button variant="outline" asChild>
                                <Link href={invoicesEdit(invoice.id)}>
                                    Edit invoice
                                </Link>
                            </Button>
                        )}

                        {invoice.can.delete && (
                            <Button variant="outline" asChild>
                                <Link
                                    href={InvoiceController.destroy(invoice.id)}
                                    method="delete"
                                    as="button"
                                >
                                    Archive
                                </Link>
                            </Button>
                        )}
                    </div>
                </div>

                <div className="grid gap-4 md:grid-cols-5">
                    <Card>
                        <CardHeader>
                            <CardDescription>Total amount</CardDescription>
                            <CardTitle>
                                {formatCurrency(invoice.total_amount)}
                            </CardTitle>
                        </CardHeader>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardDescription>Balance amount</CardDescription>
                            <CardTitle>
                                {formatCurrency(invoice.balance_amount)}
                            </CardTitle>
                        </CardHeader>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardDescription>Paid amount</CardDescription>
                            <CardTitle>
                                {formatCurrency(invoice.paid_amount)}
                            </CardTitle>
                        </CardHeader>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardDescription>Approval</CardDescription>
                            <CardTitle className="text-base">
                                {invoice.approval_state_label}
                            </CardTitle>
                            <p className="text-xs text-muted-foreground">
                                {invoice.approved_at
                                    ? `Approved by ${invoice.approved_by ?? 'Unknown'}`
                                    : invoice.approval_requested_at
                                      ? `Submitted by ${invoice.approval_requested_by ?? 'Unknown'}`
                                      : 'Submit when the billing is ready for review.'}
                            </p>
                        </CardHeader>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardDescription>Attachments</CardDescription>
                            <CardTitle>{invoice.attachment_count}</CardTitle>
                        </CardHeader>
                    </Card>
                </div>

                <div className="grid gap-6 xl:grid-cols-[1.35fr_1fr]">
                    <Card>
                        <CardHeader>
                            <CardTitle>Invoice information</CardTitle>
                            <CardDescription>
                                Billing context, linked records, and collection
                                timing for this invoice.
                            </CardDescription>
                        </CardHeader>

                        <CardContent className="grid gap-5 md:grid-cols-2">
                            <div>
                                <p className="text-sm text-muted-foreground">
                                    Quotation
                                </p>
                                <p className="mt-1 font-medium">
                                    {invoice.quotation.quotation_no
                                        ? `${invoice.quotation.quotation_no} - ${invoice.quotation.subject}`
                                        : 'Not linked'}
                                </p>
                            </div>

                            <div>
                                <p className="text-sm text-muted-foreground">
                                    Project
                                </p>
                                <p className="mt-1 font-medium">
                                    {invoice.project.project_no
                                        ? `${invoice.project.project_no} - ${invoice.project.title}`
                                        : 'Not linked'}
                                </p>
                            </div>

                            <div>
                                <p className="text-sm text-muted-foreground">
                                    Work order
                                </p>
                                <p className="mt-1 font-medium">
                                    {invoice.work_order.work_order_no
                                        ? `${invoice.work_order.work_order_no} - ${invoice.work_order.summary}`
                                        : 'Not linked'}
                                </p>
                            </div>

                            <div>
                                <p className="text-sm text-muted-foreground">
                                    Issued by
                                </p>
                                <p className="mt-1 font-medium">
                                    {invoice.issued_by ?? 'Not recorded'}
                                </p>
                            </div>

                            <div>
                                <p className="text-sm text-muted-foreground">
                                    Invoice date
                                </p>
                                <p className="mt-1 font-medium">
                                    {invoice.invoice_date ?? 'Not set'}
                                </p>
                            </div>

                            <div>
                                <p className="text-sm text-muted-foreground">
                                    Due date
                                </p>
                                <p className="mt-1 font-medium">
                                    {invoice.due_date ?? 'Not set'}
                                </p>
                            </div>

                            <div className="md:col-span-2">
                                <p className="text-sm text-muted-foreground">
                                    Remarks
                                </p>
                                <p className="mt-1 font-medium whitespace-pre-line">
                                    {invoice.remarks ?? 'No remarks'}
                                </p>
                            </div>

                            <div>
                                <p className="text-sm text-muted-foreground">
                                    Submitted for approval
                                </p>
                                <p className="mt-1 font-medium">
                                    {invoice.approval_requested_at
                                        ? formatDateTime(
                                              invoice.approval_requested_at,
                                          )
                                        : 'Not submitted'}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    {invoice.approval_requested_by ??
                                        'No requester'}
                                </p>
                            </div>

                            <div>
                                <p className="text-sm text-muted-foreground">
                                    Approved
                                </p>
                                <p className="mt-1 font-medium">
                                    {invoice.approved_at
                                        ? formatDateTime(invoice.approved_at)
                                        : 'Not approved'}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    {invoice.approved_by ?? 'No approver'}
                                </p>
                            </div>

                            <div className="md:col-span-2">
                                <p className="text-sm text-muted-foreground">
                                    Approval notes
                                </p>
                                <p className="mt-1 font-medium whitespace-pre-line">
                                    {invoice.approval_notes ??
                                        'No approval notes'}
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Applied payments</CardTitle>
                            <CardDescription>
                                Recorded collections already allocated to this
                                invoice.
                            </CardDescription>
                        </CardHeader>

                        <CardContent className="space-y-3">
                            {payments.length === 0 && (
                                <div className="rounded-lg border border-dashed px-4 py-6 text-sm text-muted-foreground">
                                    No payments allocated yet.
                                </div>
                            )}

                            {payments.map((payment) => (
                                <div
                                    key={payment.id}
                                    className="rounded-lg border px-4 py-3"
                                >
                                    <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                                        <div className="space-y-1">
                                            <p className="font-medium">
                                                {payment.payment_no}
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                {payment.payment_method ??
                                                    'No method'}{' '}
                                                •{' '}
                                                {formatCurrency(
                                                    payment.allocated_amount,
                                                )}
                                            </p>
                                            {payment.reference_no && (
                                                <p className="text-xs text-muted-foreground">
                                                    Ref: {payment.reference_no}
                                                </p>
                                            )}
                                        </div>

                                        <p className="text-sm text-muted-foreground">
                                            {payment.payment_date ?? 'No date'}
                                        </p>
                                    </div>

                                    {payment.can.view &&
                                        payment.id !== null && (
                                            <div className="mt-3">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    asChild
                                                >
                                                    <Link
                                                        href={paymentsShow(
                                                            payment.id,
                                                        )}
                                                    >
                                                        Open
                                                    </Link>
                                                </Button>
                                            </div>
                                        )}
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Invoice lines</CardTitle>
                        <CardDescription>
                            Itemized coverage used to calculate the subtotal and
                            final billing value.
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="overflow-x-auto px-0">
                        <table className="min-w-full text-sm">
                            <thead>
                                <tr className="border-b text-left text-muted-foreground">
                                    <th className="px-6 py-3 font-medium">
                                        Description
                                    </th>
                                    <th className="px-6 py-3 font-medium">
                                        Unit
                                    </th>
                                    <th className="px-6 py-3 font-medium">
                                        Quantity
                                    </th>
                                    <th className="px-6 py-3 font-medium">
                                        Unit price
                                    </th>
                                    <th className="px-6 py-3 font-medium">
                                        Line total
                                    </th>
                                    <th className="px-6 py-3 font-medium">
                                        Remarks
                                    </th>
                                </tr>
                            </thead>

                            <tbody>
                                {items.map((item) => (
                                    <tr
                                        key={item.id}
                                        className="border-b last:border-0"
                                    >
                                        <td className="px-6 py-4 font-medium">
                                            {item.description}
                                        </td>
                                        <td className="px-6 py-4">
                                            {item.unit ?? 'N/A'}
                                        </td>
                                        <td className="px-6 py-4">
                                            {item.quantity}
                                        </td>
                                        <td className="px-6 py-4">
                                            {formatCurrency(item.unit_price)}
                                        </td>
                                        <td className="px-6 py-4">
                                            {formatCurrency(item.line_total)}
                                        </td>
                                        <td className="px-6 py-4 text-muted-foreground">
                                            {item.remarks ?? 'No remarks'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </CardContent>
                </Card>

                <RecordAttachmentsCard
                    attachments={attachments}
                    attachableType="invoice"
                    attachableId={invoice.id}
                    canUpload={invoice.can.upload_attachments}
                    canUnlink={invoice.can.remove_attachments}
                />
            </div>
        </>
    );
}

InvoicesShow.layout = {
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
