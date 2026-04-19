import { Head, Link, useForm } from '@inertiajs/react';
import QuotationController from '@/actions/App/Http/Controllers/Quotations/QuotationController';
import { dashboard } from '@/routes';
import { show as customersShow } from '@/routes/customers';
import {
    edit as quotationsEdit,
    index as quotationsIndex,
    kpi as quotationsKpi,
} from '@/routes/quotations';
import { show as sitesShow } from '@/routes/sites';
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
import InputError from '@/components/input-error';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { QuotationDetail, SelectOption } from '@/types';

type Props = {
    quotation: QuotationDetail;
    statusOptions: SelectOption[];
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

export default function QuotationsShow({ quotation, statusOptions }: Props) {
    const statusForm = useForm({
        status: quotation.status,
        remarks: '',
        lost_reason: quotation.lost_reason ?? '',
        materialized_at: quotation.materialized_at ?? quotation.quotation_date ?? '',
    });

    const requiresLostReason = statusForm.data.status === 'lost';
    const requiresMaterializedAt = statusForm.data.status === 'awarded';

    function submitStatus(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

        statusForm.transform((data) => ({
            status: data.status,
            remarks: data.remarks || null,
            lost_reason: data.lost_reason || null,
            materialized_at: data.materialized_at || null,
        }));

        statusForm.submit(QuotationController.updateStatus(quotation.id), {
            preserveScroll: true,
        });
    }

    return (
        <>
            <Head title={quotation.quotation_no} />

            <div className="flex flex-1 flex-col gap-6 p-4">
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                            <h1 className="text-2xl font-semibold tracking-tight">
                                {quotation.quotation_no}
                            </h1>
                            <Badge
                                variant="outline"
                                className={statusBadgeClass(quotation.status)}
                            >
                                {quotation.status_label}
                            </Badge>
                        </div>

                        <p className="text-sm text-muted-foreground">
                            {quotation.subject}
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        {quotation.customer.id && (
                            <Button variant="outline" asChild>
                                <Link href={customersShow(quotation.customer.id)}>
                                    View customer
                                </Link>
                            </Button>
                        )}

                        <Button variant="outline" asChild>
                            <Link href={quotationsKpi()}>Sales KPI</Link>
                        </Button>

                        {quotation.can.update && (
                            <Button asChild>
                                <Link href={quotationsEdit(quotation.id)}>
                                    Edit quotation
                                </Link>
                            </Button>
                        )}

                        {quotation.can.delete && (
                            <Button variant="outline" asChild>
                                <Link
                                    href={QuotationController.destroy(quotation.id)}
                                    method="delete"
                                    as="button"
                                >
                                    Archive
                                </Link>
                            </Button>
                        )}
                    </div>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                    <Card>
                        <CardHeader>
                            <CardDescription>Quoted amount</CardDescription>
                            <CardTitle>{formatCurrency(quotation.quotation_amount)}</CardTitle>
                        </CardHeader>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardDescription>Valid until</CardDescription>
                            <CardTitle className="text-base">
                                {formatDate(quotation.valid_until)}
                            </CardTitle>
                        </CardHeader>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardDescription>Attachments</CardDescription>
                            <CardTitle>{quotation.attachment_count}</CardTitle>
                        </CardHeader>
                    </Card>
                </div>

                <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Quotation information</CardTitle>
                                <CardDescription>
                                    Core quotation record details used for KPI reporting and downstream handoff.
                                </CardDescription>
                            </CardHeader>

                            <CardContent className="grid gap-5 md:grid-cols-2">
                                <div>
                                    <p className="text-sm text-muted-foreground">
                                        Customer
                                    </p>
                                    {quotation.customer.id ? (
                                        <Link
                                            href={customersShow(quotation.customer.id)}
                                            className="mt-1 inline-flex font-medium hover:underline"
                                        >
                                            {quotation.customer.customer_code} -{' '}
                                            {quotation.customer.company_name}
                                        </Link>
                                    ) : (
                                        <p className="mt-1 font-medium">Not linked</p>
                                    )}
                                </div>

                                <div>
                                    <p className="text-sm text-muted-foreground">Site</p>
                                    {quotation.site.id ? (
                                        <Link
                                            href={sitesShow(quotation.site.id)}
                                            className="mt-1 inline-flex font-medium hover:underline"
                                        >
                                            {quotation.site.site_name}
                                            {quotation.site.site_code &&
                                                ` (${quotation.site.site_code})`}
                                        </Link>
                                    ) : (
                                        <p className="mt-1 font-medium">No site linked</p>
                                    )}
                                </div>

                                <div>
                                    <p className="text-sm text-muted-foreground">
                                        Quotation date
                                    </p>
                                    <p className="mt-1 font-medium">
                                        {formatDate(quotation.quotation_date)}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-sm text-muted-foreground">
                                        Awarded / materialized date
                                    </p>
                                    <p className="mt-1 font-medium">
                                        {formatDate(quotation.materialized_at)}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-sm text-muted-foreground">
                                        Prepared by
                                    </p>
                                    <p className="mt-1 font-medium">
                                        {quotation.prepared_by.name ?? 'Not set'}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-sm text-muted-foreground">
                                        Assigned sales owner
                                    </p>
                                    <p className="mt-1 font-medium">
                                        {quotation.assigned_sales_user.name ?? 'Unassigned'}
                                    </p>
                                </div>

                                <div className="md:col-span-2">
                                    <p className="text-sm text-muted-foreground">
                                        Site address
                                    </p>
                                    <p className="mt-1 whitespace-pre-line font-medium">
                                        {quotation.site.address ??
                                            ([quotation.site.city, quotation.site.province]
                                                .filter(Boolean)
                                                .join(', ') ||
                                                'Not set')}
                                    </p>
                                </div>

                                <div className="md:col-span-2">
                                    <p className="text-sm text-muted-foreground">
                                        Lost reason
                                    </p>
                                    <p className="mt-1 whitespace-pre-line font-medium">
                                        {quotation.lost_reason ?? 'Not applicable'}
                                    </p>
                                </div>

                                <div className="md:col-span-2">
                                    <p className="text-sm text-muted-foreground">
                                        Remarks
                                    </p>
                                    <p className="mt-1 whitespace-pre-line font-medium">
                                        {quotation.remarks ?? 'No remarks'}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Status history</CardTitle>
                                <CardDescription>
                                    Every recorded quotation status transition appears here.
                                </CardDescription>
                            </CardHeader>

                            <CardContent className="space-y-3">
                                {(quotation.status_history ?? []).map((entry) => (
                                    <div
                                        key={entry.id}
                                        className="rounded-lg border px-4 py-3"
                                    >
                                        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <Badge variant="outline">
                                                    {entry.from_status_label ?? 'Created'}
                                                </Badge>
                                                <span className="text-muted-foreground">
                                                    to
                                                </span>
                                                <Badge
                                                    variant="outline"
                                                    className={statusBadgeClass(
                                                        entry.to_status,
                                                    )}
                                                >
                                                    {entry.to_status_label}
                                                </Badge>
                                            </div>

                                            <p className="text-sm text-muted-foreground">
                                                {formatDateTime(entry.changed_at)}
                                            </p>
                                        </div>

                                        <div className="mt-3 space-y-1 text-sm">
                                            <p className="text-muted-foreground">
                                                Changed by:{' '}
                                                <span className="font-medium text-foreground">
                                                    {entry.changed_by ?? 'System'}
                                                </span>
                                            </p>
                                            <p className="text-muted-foreground">
                                                Remarks:{' '}
                                                <span className="font-medium text-foreground">
                                                    {entry.remarks ?? 'No remarks'}
                                                </span>
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    </div>

                    <div className="space-y-6">
                        {quotation.can.change_status && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Update status</CardTitle>
                                    <CardDescription>
                                        Move the quotation forward and keep the KPI trail accurate.
                                    </CardDescription>
                                </CardHeader>

                                <CardContent>
                                    <form
                                        onSubmit={submitStatus}
                                        className="space-y-4"
                                    >
                                        <div className="grid gap-2">
                                            <Label htmlFor="status">New status</Label>
                                            <select
                                                id="status"
                                                value={statusForm.data.status}
                                                onChange={(event) =>
                                                    statusForm.setData(
                                                        'status',
                                                        event.currentTarget.value,
                                                    )
                                                }
                                                className="border-input focus-visible:border-ring focus-visible:ring-ring/50 h-9 rounded-md border bg-transparent px-3 text-sm outline-none focus-visible:ring-[3px]"
                                            >
                                                {statusOptions.map((option) => (
                                                    <option
                                                        key={option.value}
                                                        value={option.value}
                                                    >
                                                        {option.label}
                                                    </option>
                                                ))}
                                            </select>
                                            <InputError
                                                message={statusForm.errors.status}
                                            />
                                        </div>

                                        {requiresMaterializedAt && (
                                            <div className="grid gap-2">
                                                <Label htmlFor="materialized_at">
                                                    Awarded / materialized date
                                                </Label>
                                                <Input
                                                    id="materialized_at"
                                                    type="date"
                                                    value={statusForm.data.materialized_at}
                                                    onChange={(event) =>
                                                        statusForm.setData(
                                                            'materialized_at',
                                                            event.currentTarget.value,
                                                        )
                                                    }
                                                />
                                                <InputError
                                                    message={
                                                        statusForm.errors
                                                            .materialized_at
                                                    }
                                                />
                                            </div>
                                        )}

                                        {requiresLostReason && (
                                            <div className="grid gap-2">
                                                <Label htmlFor="lost_reason">
                                                    Lost reason
                                                </Label>
                                                <Textarea
                                                    id="lost_reason"
                                                    value={statusForm.data.lost_reason}
                                                    onChange={(event) =>
                                                        statusForm.setData(
                                                            'lost_reason',
                                                            event.currentTarget.value,
                                                        )
                                                    }
                                                    placeholder="Explain why the quotation was lost"
                                                />
                                                <InputError
                                                    message={
                                                        statusForm.errors
                                                            .lost_reason
                                                    }
                                                />
                                            </div>
                                        )}

                                        <div className="grid gap-2">
                                            <Label htmlFor="remarks">
                                                Status remarks
                                            </Label>
                                            <Textarea
                                                id="remarks"
                                                value={statusForm.data.remarks}
                                                onChange={(event) =>
                                                    statusForm.setData(
                                                        'remarks',
                                                        event.currentTarget.value,
                                                    )
                                                }
                                                placeholder="Add context for this transition"
                                            />
                                            <InputError
                                                message={statusForm.errors.remarks}
                                            />
                                        </div>

                                        <Button
                                            className="w-full"
                                            disabled={statusForm.processing}
                                        >
                                            {statusForm.processing
                                                ? 'Updating...'
                                                : 'Update status'}
                                        </Button>
                                    </form>
                                </CardContent>
                            </Card>
                        )}

                        <RecordAttachmentsCard
                            attachments={quotation.attachments ?? []}
                            attachableType="quotation"
                            attachableId={quotation.id}
                            canUpload={quotation.can.upload_attachments}
                            canUnlink={quotation.can.remove_attachments}
                            title="Quotation attachments"
                            description="Link the Excel file, signed copy, or supporting files to this quotation record."
                        />
                    </div>
                </div>
            </div>
        </>
    );
}

QuotationsShow.layout = {
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
            title: 'Quotation details',
            href: quotationsIndex(),
        },
    ],
};
