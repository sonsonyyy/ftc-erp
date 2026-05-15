import type { InertiaLinkProps } from '@inertiajs/react';
import { Link, useForm } from '@inertiajs/react';
import InvoiceController from '@/actions/App/Http/Controllers/Billing/InvoiceController';
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
    BillingProjectOption,
    BillingQuotationOption,
    BillingWorkOrderOption,
    InvoiceDetail,
    InvoiceFormDefaults,
    InvoiceLineInput,
    SelectOption,
} from '@/types';

type Props = {
    invoice?: InvoiceDetail;
    customerOptions: SelectOption[];
    quotationOptions: BillingQuotationOption[];
    projectOptions: BillingProjectOption[];
    workOrderOptions: BillingWorkOrderOption[];
    statusOptions: SelectOption[];
    defaults?: InvoiceFormDefaults;
    title: string;
    description: string;
    cancelHref: NonNullable<InertiaLinkProps['href']>;
};

function blankLine(): InvoiceLineInput {
    return {
        description: '',
        unit: '',
        quantity: '1',
        unit_price: '',
        remarks: '',
    };
}

function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-PH', {
        style: 'currency',
        currency: 'PHP',
        maximumFractionDigits: 2,
    }).format(amount);
}

export function InvoiceForm({
    invoice,
    customerOptions,
    quotationOptions,
    projectOptions,
    workOrderOptions,
    statusOptions,
    defaults,
    title,
    description,
    cancelHref,
}: Props) {
    const form = useForm({
        invoice_no: invoice?.invoice_no ?? defaults?.invoice_no ?? '',
        quotation_id: invoice?.quotation_id
            ? String(invoice.quotation_id)
            : defaults?.quotation_id
              ? String(defaults.quotation_id)
              : '',
        customer_id: invoice?.customer_id
            ? String(invoice.customer_id)
            : defaults?.customer_id
              ? String(defaults.customer_id)
              : '',
        project_id: invoice?.project_id
            ? String(invoice.project_id)
            : defaults?.project_id
              ? String(defaults.project_id)
              : '',
        work_order_id: invoice?.work_order_id
            ? String(invoice.work_order_id)
            : defaults?.work_order_id
              ? String(defaults.work_order_id)
              : '',
        invoice_date: invoice?.invoice_date ?? defaults?.invoice_date ?? '',
        due_date: invoice?.due_date ?? defaults?.due_date ?? '',
        tax_amount: String(invoice?.tax_amount ?? defaults?.tax_amount ?? 0),
        status:
            invoice?.stored_status ??
            defaults?.status ??
            String(statusOptions[0]?.value ?? 'draft'),
        remarks: invoice?.remarks ?? '',
        items: invoice?.items?.map((item) => ({
            description: item.description,
            unit: item.unit ?? '',
            quantity: String(item.quantity),
            unit_price: String(item.unit_price),
            remarks: item.remarks ?? '',
        })) ?? [blankLine()],
    });

    const subtotal = form.data.items.reduce((sum, item) => {
        const quantity = Number(item.quantity || 0);
        const unitPrice = Number(item.unit_price || 0);

        return sum + quantity * unitPrice;
    }, 0);
    const total = subtotal + Number(form.data.tax_amount || 0);
    const steps = [
        {
            step: '1',
            title: 'Header',
            caption: 'Reference, customer, and dates.',
        },
        {
            step: '2',
            title: 'Links',
            caption: 'Quotation, project, and work order context.',
        },
        {
            step: '3',
            title: 'Lines',
            caption: 'Billable coverage and totals.',
        },
    ];

    function updateItem(
        index: number,
        key: keyof InvoiceLineInput,
        value: string,
    ) {
        form.setData(
            'items',
            form.data.items.map((item, itemIndex) => {
                if (itemIndex !== index) {
                    return item;
                }

                return {
                    ...item,
                    [key]: value,
                };
            }),
        );
    }

    function addItem() {
        form.setData('items', [...form.data.items, blankLine()]);
    }

    function removeItem(index: number) {
        form.setData(
            'items',
            form.data.items.filter((_, itemIndex) => itemIndex !== index),
        );
    }

    function handleQuotationChange(value: string) {
        form.setData('quotation_id', value);

        const quotation = quotationOptions.find(
            (option) => String(option.value) === value,
        );

        if (quotation?.customer_id) {
            form.setData('customer_id', String(quotation.customer_id));
        }
    }

    function handleProjectChange(value: string) {
        form.setData('project_id', value);

        const project = projectOptions.find(
            (option) => String(option.value) === value,
        );

        if (project?.customer_id) {
            form.setData('customer_id', String(project.customer_id));
        }

        if (project?.quotation_id) {
            form.setData('quotation_id', String(project.quotation_id));
        }
    }

    function handleWorkOrderChange(value: string) {
        form.setData('work_order_id', value);

        const workOrder = workOrderOptions.find(
            (option) => String(option.value) === value,
        );

        if (workOrder?.customer_id) {
            form.setData('customer_id', String(workOrder.customer_id));
        }

        if (workOrder?.project_id) {
            form.setData('project_id', String(workOrder.project_id));
        }

        if (workOrder?.quotation_id) {
            form.setData('quotation_id', String(workOrder.quotation_id));
        }
    }

    function submit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

        form.transform((data) => ({
            invoice_no: data.invoice_no,
            quotation_id:
                data.quotation_id === '' ? null : Number(data.quotation_id),
            customer_id: Number(data.customer_id),
            project_id: data.project_id === '' ? null : Number(data.project_id),
            work_order_id:
                data.work_order_id === '' ? null : Number(data.work_order_id),
            invoice_date: data.invoice_date,
            due_date: data.due_date || null,
            tax_amount: Number(data.tax_amount || 0),
            status: data.status,
            remarks: data.remarks || null,
            items: data.items.map((item) => ({
                description: item.description,
                unit: item.unit || null,
                quantity: Number(item.quantity),
                unit_price: Number(item.unit_price),
                remarks: item.remarks || null,
            })),
        }));

        if (invoice) {
            form.submit(InvoiceController.update(invoice.id), {
                preserveScroll: true,
            });

            return;
        }

        form.submit(InvoiceController.store(), {
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
                        title="Billing header"
                        description="Document reference and collection dates."
                        contentClassName="grid gap-4 md:grid-cols-2 xl:grid-cols-3"
                    >
                        <div className="grid gap-2">
                            <Label htmlFor="invoice_no">Invoice no.</Label>
                            <Input
                                id="invoice_no"
                                value={form.data.invoice_no}
                                onChange={(event) =>
                                    form.setData(
                                        'invoice_no',
                                        event.currentTarget.value,
                                    )
                                }
                            />
                            <InputError message={form.errors.invoice_no} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="status">Status</Label>
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

                        <div className="grid gap-2">
                            <Label htmlFor="customer_id">Customer</Label>
                            <SelectInput
                                id="customer_id"
                                value={form.data.customer_id}
                                onChange={(event) =>
                                    form.setData(
                                        'customer_id',
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

                        <div className="grid gap-2">
                            <Label htmlFor="invoice_date">Invoice date</Label>
                            <Input
                                id="invoice_date"
                                type="date"
                                value={form.data.invoice_date}
                                onChange={(event) =>
                                    form.setData(
                                        'invoice_date',
                                        event.currentTarget.value,
                                    )
                                }
                            />
                            <InputError message={form.errors.invoice_date} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="due_date">Due date</Label>
                            <Input
                                id="due_date"
                                type="date"
                                value={form.data.due_date}
                                onChange={(event) =>
                                    form.setData(
                                        'due_date',
                                        event.currentTarget.value,
                                    )
                                }
                            />
                            <InputError message={form.errors.due_date} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="tax_amount">Tax amount</Label>
                            <Input
                                id="tax_amount"
                                type="number"
                                min="0"
                                step="0.01"
                                value={form.data.tax_amount}
                                onChange={(event) =>
                                    form.setData(
                                        'tax_amount',
                                        event.currentTarget.value,
                                    )
                                }
                            />
                            <InputError message={form.errors.tax_amount} />
                        </div>
                    </FormSectionCard>

                    <FormSectionCard
                        step="2"
                        title="Linked records"
                        description="Tie the invoice back to sales or operations."
                        contentClassName="grid gap-4 md:grid-cols-2 xl:grid-cols-3"
                    >
                        <div className="grid gap-2">
                            <Label htmlFor="quotation_id">Quotation</Label>
                            <SelectInput
                                id="quotation_id"
                                value={form.data.quotation_id}
                                onChange={(event) =>
                                    handleQuotationChange(
                                        event.currentTarget.value,
                                    )
                                }
                            >
                                <option value="">No linked quotation</option>
                                {quotationOptions.map((option) => (
                                    <option
                                        key={option.value}
                                        value={option.value}
                                    >
                                        {option.label}
                                    </option>
                                ))}
                            </SelectInput>
                            <InputError message={form.errors.quotation_id} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="project_id">Project</Label>
                            <SelectInput
                                id="project_id"
                                value={form.data.project_id}
                                onChange={(event) =>
                                    handleProjectChange(
                                        event.currentTarget.value,
                                    )
                                }
                            >
                                <option value="">No linked project</option>
                                {projectOptions.map((option) => (
                                    <option
                                        key={option.value}
                                        value={option.value}
                                    >
                                        {option.label}
                                    </option>
                                ))}
                            </SelectInput>
                            <InputError message={form.errors.project_id} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="work_order_id">Work order</Label>
                            <SelectInput
                                id="work_order_id"
                                value={form.data.work_order_id}
                                onChange={(event) =>
                                    handleWorkOrderChange(
                                        event.currentTarget.value,
                                    )
                                }
                            >
                                <option value="">No linked work order</option>
                                {workOrderOptions.map((option) => (
                                    <option
                                        key={option.value}
                                        value={option.value}
                                    >
                                        {option.label}
                                    </option>
                                ))}
                            </SelectInput>
                            <InputError message={form.errors.work_order_id} />
                        </div>

                        <div className="grid gap-2 md:col-span-2 xl:col-span-3">
                            <Label htmlFor="remarks">Remarks</Label>
                            <Textarea
                                id="remarks"
                                rows={3}
                                value={form.data.remarks}
                                onChange={(event) =>
                                    form.setData(
                                        'remarks',
                                        event.currentTarget.value,
                                    )
                                }
                                placeholder="Optional collection notes or billing context."
                            />
                            <InputError message={form.errors.remarks} />
                        </div>
                    </FormSectionCard>

                    <FormSectionCard
                        step="3"
                        title="Invoice lines"
                        description="Build the billable subtotal."
                        contentClassName="space-y-4"
                    >
                        <div className="flex justify-end">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={addItem}
                            >
                                Add line
                            </Button>
                        </div>

                        {form.data.items.map((item, index) => (
                            <div
                                key={index}
                                className="grid gap-4 rounded-xl border bg-muted/10 p-4 xl:grid-cols-[2fr_0.7fr_0.8fr_1.2fr_auto]"
                            >
                                <div className="grid gap-2 xl:col-span-2">
                                    <Label
                                        htmlFor={`items.${index}.description`}
                                    >
                                        Description
                                    </Label>
                                    <Input
                                        id={`items.${index}.description`}
                                        value={item.description}
                                        onChange={(event) =>
                                            updateItem(
                                                index,
                                                'description',
                                                event.currentTarget.value,
                                            )
                                        }
                                        placeholder="Billing line description"
                                    />
                                    <InputError
                                        message={
                                            form.errors[
                                                `items.${index}.description`
                                            ]
                                        }
                                    />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor={`items.${index}.unit`}>
                                        Unit
                                    </Label>
                                    <Input
                                        id={`items.${index}.unit`}
                                        value={item.unit}
                                        onChange={(event) =>
                                            updateItem(
                                                index,
                                                'unit',
                                                event.currentTarget.value,
                                            )
                                        }
                                        placeholder="lot"
                                    />
                                    <InputError
                                        message={
                                            form.errors[`items.${index}.unit`]
                                        }
                                    />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor={`items.${index}.quantity`}>
                                        Quantity
                                    </Label>
                                    <Input
                                        id={`items.${index}.quantity`}
                                        type="number"
                                        min="0.01"
                                        step="0.01"
                                        value={item.quantity}
                                        onChange={(event) =>
                                            updateItem(
                                                index,
                                                'quantity',
                                                event.currentTarget.value,
                                            )
                                        }
                                    />
                                    <InputError
                                        message={
                                            form.errors[
                                                `items.${index}.quantity`
                                            ]
                                        }
                                    />
                                </div>

                                <div className="grid gap-2">
                                    <Label
                                        htmlFor={`items.${index}.unit_price`}
                                    >
                                        Unit price
                                    </Label>
                                    <Input
                                        id={`items.${index}.unit_price`}
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={item.unit_price}
                                        onChange={(event) =>
                                            updateItem(
                                                index,
                                                'unit_price',
                                                event.currentTarget.value,
                                            )
                                        }
                                    />
                                    <InputError
                                        message={
                                            form.errors[
                                                `items.${index}.unit_price`
                                            ]
                                        }
                                    />
                                </div>

                                <div className="flex items-end">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="w-full"
                                        disabled={form.data.items.length === 1}
                                        onClick={() => removeItem(index)}
                                    >
                                        Remove
                                    </Button>
                                </div>

                                <div className="grid gap-2 xl:col-span-4">
                                    <Label htmlFor={`items.${index}.remarks`}>
                                        Line remarks
                                    </Label>
                                    <Input
                                        id={`items.${index}.remarks`}
                                        value={item.remarks}
                                        onChange={(event) =>
                                            updateItem(
                                                index,
                                                'remarks',
                                                event.currentTarget.value,
                                            )
                                        }
                                        placeholder="Optional line remark"
                                    />
                                    <InputError
                                        message={
                                            form.errors[
                                                `items.${index}.remarks`
                                            ]
                                        }
                                    />
                                </div>

                                <div className="flex items-end justify-end text-sm font-medium text-muted-foreground">
                                    {formatCurrency(
                                        Number(item.quantity || 0) *
                                            Number(item.unit_price || 0) || 0,
                                    )}
                                </div>
                            </div>
                        ))}
                    </FormSectionCard>
                </div>

                <div className="space-y-5 xl:sticky xl:top-6 xl:self-start">
                    <FormSidebarCard
                        title="Totals"
                        description="Live summary from the current lines."
                    >
                        <div className="space-y-3 text-sm">
                            <div className="flex items-center justify-between">
                                <span className="text-muted-foreground">
                                    Subtotal
                                </span>
                                <span className="font-medium">
                                    {formatCurrency(subtotal)}
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-muted-foreground">
                                    Tax
                                </span>
                                <span className="font-medium">
                                    {formatCurrency(
                                        Number(form.data.tax_amount || 0),
                                    )}
                                </span>
                            </div>
                            <div className="flex items-center justify-between border-t pt-3">
                                <span className="font-medium">Total</span>
                                <span className="text-base font-semibold">
                                    {formatCurrency(total)}
                                </span>
                            </div>
                        </div>
                    </FormSidebarCard>

                    <FormSidebarCard
                        title={invoice ? 'Save changes' : 'Create invoice'}
                        description="Collections and attachments continue on the detail page."
                    >
                        <div className="space-y-3">
                            <Button
                                type="button"
                                variant="outline"
                                asChild
                                className="w-full"
                            >
                                <Link href={cancelHref}>Cancel</Link>
                            </Button>

                            <Button
                                disabled={form.processing}
                                className="w-full"
                            >
                                {form.processing
                                    ? 'Saving...'
                                    : invoice
                                      ? 'Update invoice'
                                      : 'Create invoice'}
                            </Button>
                        </div>
                    </FormSidebarCard>
                </div>
            </form>
        </div>
    );
}
