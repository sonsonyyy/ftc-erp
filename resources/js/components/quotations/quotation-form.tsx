import type { InertiaLinkProps } from '@inertiajs/react';
import { Link, useForm } from '@inertiajs/react';
import QuotationController from '@/actions/App/Http/Controllers/Quotations/QuotationController';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type {
    QuotationDetail,
    QuotationFormDefaults,
    QuotationSiteOption,
    SelectOption,
} from '@/types';

type Props = {
    quotation?: QuotationDetail;
    defaults?: QuotationFormDefaults;
    customerOptions: SelectOption[];
    siteOptions: QuotationSiteOption[];
    userOptions: SelectOption[];
    statusOptions?: SelectOption[];
    title: string;
    description: string;
    cancelHref: NonNullable<InertiaLinkProps['href']>;
};

export function QuotationForm({
    quotation,
    defaults,
    customerOptions,
    siteOptions,
    userOptions,
    statusOptions = [],
    title,
    description,
    cancelHref,
}: Props) {
    const form = useForm({
        quotation_no: quotation?.quotation_no ?? '',
        customer_id: quotation?.customer_id
            ? String(quotation.customer_id)
            : defaults?.customer_id
              ? String(defaults.customer_id)
              : '',
        customer_site_id: quotation?.customer_site_id
            ? String(quotation.customer_site_id)
            : defaults?.customer_site_id
              ? String(defaults.customer_site_id)
              : '',
        subject: quotation?.subject ?? '',
        quotation_date: quotation?.quotation_date ?? defaults?.quotation_date ?? '',
        valid_until: quotation?.valid_until ?? '',
        quotation_amount: quotation ? String(quotation.quotation_amount) : '',
        status: quotation?.status ?? defaults?.status ?? 'draft',
        prepared_by_user_id: quotation?.prepared_by_user_id
            ? String(quotation.prepared_by_user_id)
            : '',
        assigned_sales_user_id: quotation?.assigned_sales_user_id
            ? String(quotation.assigned_sales_user_id)
            : '',
        materialized_at: quotation?.materialized_at ?? '',
        lost_reason: quotation?.lost_reason ?? '',
        remarks: quotation?.remarks ?? '',
    });

    const availableSiteOptions =
        form.data.customer_id === ''
            ? []
            : siteOptions.filter(
                  (option) => option.customer_id === Number(form.data.customer_id),
              );

    const isCreate = quotation === undefined;
    const showLostReason = isCreate && form.data.status === 'lost';
    const showMaterializedAt = isCreate && form.data.status === 'awarded';

    function handleCustomerChange(customerId: string) {
        form.setData('customer_id', customerId);

        if (customerId === '') {
            form.setData('customer_site_id', '');

            return;
        }

        const nextSiteOptions = siteOptions.filter(
            (option) => option.customer_id === Number(customerId),
        );

        const selectedSiteStillMatches = nextSiteOptions.some(
            (option) => String(option.value) === form.data.customer_site_id,
        );

        if (!selectedSiteStillMatches) {
            form.setData('customer_site_id', '');
        }
    }

    function submit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

        form.transform((data) => {
            const payload = {
                quotation_no: data.quotation_no,
                customer_id:
                    data.customer_id === '' ? null : Number(data.customer_id),
                customer_site_id:
                    data.customer_site_id === ''
                        ? null
                        : Number(data.customer_site_id),
                subject: data.subject,
                quotation_date: data.quotation_date,
                valid_until: data.valid_until || null,
                quotation_amount: data.quotation_amount,
                prepared_by_user_id:
                    data.prepared_by_user_id === ''
                        ? null
                        : Number(data.prepared_by_user_id),
                assigned_sales_user_id:
                    data.assigned_sales_user_id === ''
                        ? null
                        : Number(data.assigned_sales_user_id),
                remarks: data.remarks || null,
            };

            if (!isCreate) {
                return payload;
            }

            return {
                ...payload,
                status: data.status,
                materialized_at: data.materialized_at || null,
                lost_reason: data.lost_reason || null,
            };
        });

        if (quotation) {
            form.submit(QuotationController.update(quotation.id), {
                preserveScroll: true,
            });

            return;
        }

        form.submit(QuotationController.store(), {
            preserveScroll: true,
        });
    }

    return (
        <div className="space-y-6">
            <Heading title={title} description={description} />

            <form onSubmit={submit} className="grid gap-6 xl:grid-cols-[2fr_1fr]">
                <Card>
                    <CardHeader>
                        <CardTitle>Quotation details</CardTitle>
                        <CardDescription>
                            Track externally prepared quotations and keep the customer, amount, and ownership data clean for reporting.
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="grid gap-5 md:grid-cols-2">
                        <div className="grid gap-2">
                            <Label htmlFor="quotation_no">Quotation number</Label>
                            <Input
                                id="quotation_no"
                                value={form.data.quotation_no}
                                onChange={(event) =>
                                    form.setData('quotation_no', event.currentTarget.value)
                                }
                                placeholder="QTN-00001"
                            />
                            <InputError message={form.errors.quotation_no} />
                        </div>

                        {isCreate && (
                            <div className="grid gap-2">
                                <Label htmlFor="status">Initial status</Label>
                                <select
                                    id="status"
                                    value={form.data.status}
                                    onChange={(event) =>
                                        form.setData('status', event.currentTarget.value)
                                    }
                                    className="border-input focus-visible:border-ring focus-visible:ring-ring/50 h-9 rounded-md border bg-transparent px-3 text-sm outline-none focus-visible:ring-[3px]"
                                >
                                    {statusOptions.map((option) => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                                <InputError message={form.errors.status} />
                            </div>
                        )}

                        <div className="grid gap-2">
                            <Label htmlFor="customer_id">Customer</Label>
                            <select
                                id="customer_id"
                                value={form.data.customer_id}
                                onChange={(event) =>
                                    handleCustomerChange(event.currentTarget.value)
                                }
                                className="border-input focus-visible:border-ring focus-visible:ring-ring/50 h-9 rounded-md border bg-transparent px-3 text-sm outline-none focus-visible:ring-[3px]"
                            >
                                <option value="">Select customer</option>
                                {customerOptions.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                            <InputError message={form.errors.customer_id} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="customer_site_id">Site</Label>
                            <select
                                id="customer_site_id"
                                value={form.data.customer_site_id}
                                onChange={(event) =>
                                    form.setData(
                                        'customer_site_id',
                                        event.currentTarget.value,
                                    )
                                }
                                disabled={form.data.customer_id === ''}
                                className="border-input focus-visible:border-ring focus-visible:ring-ring/50 h-9 rounded-md border bg-transparent px-3 text-sm outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                <option value="">
                                    {form.data.customer_id === ''
                                        ? 'Select customer first'
                                        : 'Optional site'}
                                </option>
                                {availableSiteOptions.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                            <InputError message={form.errors.customer_site_id} />
                        </div>

                        <div className="grid gap-2 md:col-span-2">
                            <Label htmlFor="subject">Subject / title</Label>
                            <Input
                                id="subject"
                                value={form.data.subject}
                                onChange={(event) =>
                                    form.setData('subject', event.currentTarget.value)
                                }
                                placeholder="Annual fire detection system upgrade"
                            />
                            <InputError message={form.errors.subject} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="quotation_date">Quotation date</Label>
                            <Input
                                id="quotation_date"
                                type="date"
                                value={form.data.quotation_date}
                                onChange={(event) =>
                                    form.setData(
                                        'quotation_date',
                                        event.currentTarget.value,
                                    )
                                }
                            />
                            <InputError message={form.errors.quotation_date} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="valid_until">Valid until</Label>
                            <Input
                                id="valid_until"
                                type="date"
                                value={form.data.valid_until}
                                onChange={(event) =>
                                    form.setData('valid_until', event.currentTarget.value)
                                }
                            />
                            <InputError message={form.errors.valid_until} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="quotation_amount">Quotation amount</Label>
                            <Input
                                id="quotation_amount"
                                type="number"
                                min="0"
                                step="0.01"
                                value={form.data.quotation_amount}
                                onChange={(event) =>
                                    form.setData(
                                        'quotation_amount',
                                        event.currentTarget.value,
                                    )
                                }
                                placeholder="0.00"
                            />
                            <InputError message={form.errors.quotation_amount} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="assigned_sales_user_id">
                                Assigned sales owner
                            </Label>
                            <select
                                id="assigned_sales_user_id"
                                value={form.data.assigned_sales_user_id}
                                onChange={(event) =>
                                    form.setData(
                                        'assigned_sales_user_id',
                                        event.currentTarget.value,
                                    )
                                }
                                className="border-input focus-visible:border-ring focus-visible:ring-ring/50 h-9 rounded-md border bg-transparent px-3 text-sm outline-none focus-visible:ring-[3px]"
                            >
                                <option value="">Unassigned</option>
                                {userOptions.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                            <InputError
                                message={form.errors.assigned_sales_user_id}
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="prepared_by_user_id">Prepared by</Label>
                            <select
                                id="prepared_by_user_id"
                                value={form.data.prepared_by_user_id}
                                onChange={(event) =>
                                    form.setData(
                                        'prepared_by_user_id',
                                        event.currentTarget.value,
                                    )
                                }
                                className="border-input focus-visible:border-ring focus-visible:ring-ring/50 h-9 rounded-md border bg-transparent px-3 text-sm outline-none focus-visible:ring-[3px]"
                            >
                                <option value="">Not specified</option>
                                {userOptions.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                            <InputError message={form.errors.prepared_by_user_id} />
                        </div>

                        {showMaterializedAt && (
                            <div className="grid gap-2">
                                <Label htmlFor="materialized_at">
                                    Awarded / materialized date
                                </Label>
                                <Input
                                    id="materialized_at"
                                    type="date"
                                    value={form.data.materialized_at}
                                    onChange={(event) =>
                                        form.setData(
                                            'materialized_at',
                                            event.currentTarget.value,
                                        )
                                    }
                                />
                                <InputError message={form.errors.materialized_at} />
                            </div>
                        )}

                        {showLostReason && (
                            <div className="grid gap-2 md:col-span-2">
                                <Label htmlFor="lost_reason">Lost reason</Label>
                                <Textarea
                                    id="lost_reason"
                                    value={form.data.lost_reason}
                                    onChange={(event) =>
                                        form.setData('lost_reason', event.currentTarget.value)
                                    }
                                    placeholder="Explain why the quotation was lost"
                                />
                                <InputError message={form.errors.lost_reason} />
                            </div>
                        )}

                        <div className="grid gap-2 md:col-span-2">
                            <Label htmlFor="remarks">Remarks</Label>
                            <Textarea
                                id="remarks"
                                value={form.data.remarks}
                                onChange={(event) =>
                                    form.setData('remarks', event.currentTarget.value)
                                }
                                placeholder="Internal notes for follow-ups, assumptions, or handoff context"
                            />
                            <InputError message={form.errors.remarks} />
                        </div>
                    </CardContent>
                </Card>

                <div className="space-y-6">
                    <Card className="h-fit">
                        <CardHeader>
                            <CardTitle>Actions</CardTitle>
                            <CardDescription>
                                Save the quotation record now, then manage status history and attachments from the detail page.
                            </CardDescription>
                        </CardHeader>

                        <CardContent className="space-y-3">
                            <Button className="w-full" disabled={form.processing}>
                                {form.processing
                                    ? 'Saving...'
                                    : quotation
                                      ? 'Update quotation'
                                      : 'Create quotation'}
                            </Button>

                            <Button className="w-full" variant="outline" asChild>
                                <Link href={cancelHref}>Cancel</Link>
                            </Button>
                        </CardContent>
                    </Card>

                    <Card className="h-fit">
                        <CardHeader>
                            <CardTitle>Workflow note</CardTitle>
                        </CardHeader>

                        <CardContent className="space-y-2 text-sm text-muted-foreground">
                            <p>
                                Upload the Excel or PDF file after saving through the quotation detail page.
                            </p>
                            <p>
                                Status changes are handled separately so each transition is logged for KPI reporting.
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </form>
        </div>
    );
}
