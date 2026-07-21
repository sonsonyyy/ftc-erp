import type { InertiaLinkProps } from '@inertiajs/react';
import { Link, useForm } from '@inertiajs/react';
import QuotationController from '@/actions/App/Http/Controllers/Quotations/QuotationController';
import {
    FormPageHeader,
    FormSectionCard,
    FormSidebarCard,
    FormSteps,
} from '@/components/form-layout';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SelectInput } from '@/components/ui/select-input';
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
        quotation_date:
            quotation?.quotation_date ?? defaults?.quotation_date ?? '',
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
                  (option) =>
                      option.customer_id === Number(form.data.customer_id),
              );

    const isCreate = quotation === undefined;
    const showLostReason = isCreate && form.data.status === 'lost';
    const showMaterializedAt = isCreate && form.data.status === 'awarded';
    const steps = [
        {
            step: '1',
            title: 'Record',
            caption: 'Number, subject, and commercial value.',
        },
        {
            step: '2',
            title: 'Customer',
            caption: 'Account, site, and timeline.',
        },
        {
            step: '3',
            title: 'Ownership',
            caption: 'Routing notes before handoff.',
        },
    ];

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
        <div className="space-y-5">
            <FormPageHeader title={title} description={description} />
            <FormSteps items={steps} />

            <form
                onSubmit={submit}
                className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]"
            >
                <div className="space-y-5">
                    <FormSectionCard
                        step="1"
                        title="Quotation record"
                        description="Core commercial details."
                        contentClassName="grid gap-4 md:grid-cols-2"
                    >
                        <div className="grid gap-2">
                            <Label htmlFor="quotation_no">
                                Quotation number
                            </Label>
                            <Input
                                id="quotation_no"
                                value={form.data.quotation_no}
                                onChange={(event) =>
                                    form.setData(
                                        'quotation_no',
                                        event.currentTarget.value,
                                    )
                                }
                                placeholder="QTN-00001"
                            />
                            <InputError message={form.errors.quotation_no} />
                        </div>

                        {isCreate && (
                            <div className="grid gap-2">
                                <Label htmlFor="status">Initial status</Label>
                                <SelectInput
                                    id="status"
                                    value={form.data.status}
                                    onChange={(event) =>
                                        form.setData(
                                            'status',
                                            event.currentTarget.value,
                                        )
                                    }
                                >
                                    {statusOptions.map((option) => (
                                        <option
                                            key={option.value}
                                            value={option.value}
                                        >
                                            {option.label}
                                        </option>
                                    ))}
                                </SelectInput>
                                <InputError message={form.errors.status} />
                            </div>
                        )}

                        <div className="grid gap-2">
                            <Label htmlFor="customer_id">Customer</Label>
                            <SelectInput
                                id="customer_id"
                                value={form.data.customer_id}
                                onChange={(event) =>
                                    handleCustomerChange(
                                        event.currentTarget.value,
                                    )
                                }
                            >
                                <option value="">Select customer</option>
                                {customerOptions.map((option) => (
                                    <option
                                        key={option.value}
                                        value={option.value}
                                    >
                                        {option.label}
                                    </option>
                                ))}
                            </SelectInput>
                            <InputError message={form.errors.customer_id} />
                        </div>

                        <div className="grid gap-2 md:col-span-2">
                            <Label htmlFor="subject">Subject / title</Label>
                            <Input
                                id="subject"
                                value={form.data.subject}
                                onChange={(event) =>
                                    form.setData(
                                        'subject',
                                        event.currentTarget.value,
                                    )
                                }
                                placeholder="Annual fire detection system upgrade"
                            />
                            <InputError message={form.errors.subject} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="quotation_date">
                                Quotation date
                            </Label>
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
                                    form.setData(
                                        'valid_until',
                                        event.currentTarget.value,
                                    )
                                }
                            />
                            <InputError message={form.errors.valid_until} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="quotation_amount">
                                Quotation amount
                            </Label>
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
                            <InputError
                                message={form.errors.quotation_amount}
                            />
                        </div>
                    </FormSectionCard>

                    <FormSectionCard
                        step="2"
                        title="Customer and schedule"
                        description="Who the quotation is for."
                        contentClassName="grid gap-4 md:grid-cols-2"
                    >
                        <div className="grid gap-2">
                            <Label htmlFor="customer_site_id">Site</Label>
                            <SelectInput
                                id="customer_site_id"
                                value={form.data.customer_site_id}
                                onChange={(event) =>
                                    form.setData(
                                        'customer_site_id',
                                        event.currentTarget.value,
                                    )
                                }
                                disabled={form.data.customer_id === ''}
                            >
                                <option value="">
                                    {form.data.customer_id === ''
                                        ? 'Select customer first'
                                        : 'Optional site'}
                                </option>
                                {availableSiteOptions.map((option) => (
                                    <option
                                        key={option.value}
                                        value={option.value}
                                    >
                                        {option.label}
                                    </option>
                                ))}
                            </SelectInput>
                            <InputError
                                message={form.errors.customer_site_id}
                            />
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
                                <InputError
                                    message={form.errors.materialized_at}
                                />
                            </div>
                        )}
                    </FormSectionCard>

                    <FormSectionCard
                        step="3"
                        title="Ownership and notes"
                        description="Internal routing before status history starts."
                        contentClassName="grid gap-4 md:grid-cols-2"
                    >
                        <div className="grid gap-2">
                            <Label htmlFor="assigned_sales_user_id">
                                Assigned sales owner
                            </Label>
                            <SelectInput
                                id="assigned_sales_user_id"
                                value={form.data.assigned_sales_user_id}
                                onChange={(event) =>
                                    form.setData(
                                        'assigned_sales_user_id',
                                        event.currentTarget.value,
                                    )
                                }
                            >
                                <option value="">Unassigned</option>
                                {userOptions.map((option) => (
                                    <option
                                        key={option.value}
                                        value={option.value}
                                    >
                                        {option.label}
                                    </option>
                                ))}
                            </SelectInput>
                            <InputError
                                message={form.errors.assigned_sales_user_id}
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="prepared_by_user_id">
                                Prepared by
                            </Label>
                            <SelectInput
                                id="prepared_by_user_id"
                                value={form.data.prepared_by_user_id}
                                onChange={(event) =>
                                    form.setData(
                                        'prepared_by_user_id',
                                        event.currentTarget.value,
                                    )
                                }
                            >
                                <option value="">Not specified</option>
                                {userOptions.map((option) => (
                                    <option
                                        key={option.value}
                                        value={option.value}
                                    >
                                        {option.label}
                                    </option>
                                ))}
                            </SelectInput>
                            <InputError
                                message={form.errors.prepared_by_user_id}
                            />
                        </div>

                        {showLostReason && (
                            <div className="grid gap-2 md:col-span-2">
                                <Label htmlFor="lost_reason">Lost reason</Label>
                                <Textarea
                                    id="lost_reason"
                                    value={form.data.lost_reason}
                                    onChange={(event) =>
                                        form.setData(
                                            'lost_reason',
                                            event.currentTarget.value,
                                        )
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
                                    form.setData(
                                        'remarks',
                                        event.currentTarget.value,
                                    )
                                }
                                placeholder="Internal notes for follow-ups, assumptions, or handoff context"
                            />
                            <InputError message={form.errors.remarks} />
                        </div>
                    </FormSectionCard>
                </div>

                <div className="space-y-5 xl:sticky xl:top-6 xl:self-start">
                    <FormSidebarCard
                        title={quotation ? 'Save changes' : 'Create quotation'}
                        description="Attachments and status history continue after save."
                    >
                        <div className="space-y-3">
                            <Button
                                className="w-full"
                                disabled={form.processing}
                            >
                                {form.processing
                                    ? 'Saving...'
                                    : quotation
                                      ? 'Update quotation'
                                      : 'Create quotation'}
                            </Button>

                            <Button
                                className="w-full"
                                variant="outline"
                                asChild
                            >
                                <Link href={cancelHref}>Cancel</Link>
                            </Button>
                        </div>
                    </FormSidebarCard>

                    <FormSidebarCard
                        title="After save"
                        description="Use the detail page for file uploads and status transitions."
                    />
                </div>
            </form>
        </div>
    );
}
