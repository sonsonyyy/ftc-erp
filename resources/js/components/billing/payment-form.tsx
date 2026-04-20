import type { InertiaLinkProps } from '@inertiajs/react';
import { Link, useForm } from '@inertiajs/react';
import PaymentController from '@/actions/App/Http/Controllers/Billing/PaymentController';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type {
    PaymentAllocationInput,
    PaymentFormDefaults,
    PaymentInvoiceOption,
    PaymentMethodOption,
    SelectOption,
} from '@/types';

type Props = {
    customerOptions: SelectOption[];
    invoiceOptions: PaymentInvoiceOption[];
    paymentMethodOptions: PaymentMethodOption[];
    defaults?: PaymentFormDefaults;
    title: string;
    description: string;
    cancelHref: NonNullable<InertiaLinkProps['href']>;
};

function blankAllocation(): PaymentAllocationInput {
    return {
        invoice_id: '',
        allocated_amount: '',
    };
}

function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-PH', {
        style: 'currency',
        currency: 'PHP',
        maximumFractionDigits: 2,
    }).format(amount);
}

export function PaymentForm({
    customerOptions,
    invoiceOptions,
    paymentMethodOptions,
    defaults,
    title,
    description,
    cancelHref,
}: Props) {
    const form = useForm({
        payment_no: defaults?.payment_no ?? '',
        customer_id: defaults?.customer_id ? String(defaults.customer_id) : '',
        payment_date: defaults?.payment_date ?? '',
        amount: String(defaults?.amount ?? 0),
        payment_method: defaults?.payment_method ?? String(paymentMethodOptions[0]?.value ?? 'Cash'),
        reference_no: defaults?.reference_no ?? '',
        remarks: defaults?.remarks ?? '',
        allocations: defaults?.allocations.length
            ? defaults.allocations.map((allocation) => ({
                  invoice_id: String(allocation.invoice_id),
                  allocated_amount: String(allocation.allocated_amount),
              }))
            : [blankAllocation()],
    });

    const filteredInvoiceOptions = form.data.customer_id === ''
        ? invoiceOptions
        : invoiceOptions.filter((option) => String(option.customer_id) === form.data.customer_id);

    const allocatedTotal = form.data.allocations.reduce(
        (sum, allocation) => sum + Number(allocation.allocated_amount || 0),
        0,
    );
    const remainingAmount = Number(form.data.amount || 0) - allocatedTotal;

    function updateAllocation(index: number, key: keyof PaymentAllocationInput, value: string) {
        form.setData(
            'allocations',
            form.data.allocations.map((allocation, allocationIndex) => {
                if (allocationIndex !== index) {
                    return allocation;
                }

                const nextAllocation = {
                    ...allocation,
                    [key]: value,
                };

                if (key === 'invoice_id') {
                    const invoice = invoiceOptions.find((option) => String(option.value) === value);

                    if (invoice?.customer_id) {
                        form.setData('customer_id', String(invoice.customer_id));
                    }

                    if (invoice && nextAllocation.allocated_amount === '') {
                        nextAllocation.allocated_amount = String(invoice.remaining_balance);
                    }
                }

                return nextAllocation;
            }),
        );
    }

    function handleCustomerChange(value: string) {
        form.setData('customer_id', value);
        form.setData('allocations', [blankAllocation()]);
    }

    function addAllocation() {
        form.setData('allocations', [...form.data.allocations, blankAllocation()]);
    }

    function removeAllocation(index: number) {
        form.setData(
            'allocations',
            form.data.allocations.filter((_, allocationIndex) => allocationIndex !== index),
        );
    }

    function submit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

        form.transform((data) => ({
            payment_no: data.payment_no,
            customer_id: Number(data.customer_id),
            payment_date: data.payment_date,
            amount: Number(data.amount),
            payment_method: data.payment_method,
            reference_no: data.reference_no || null,
            remarks: data.remarks || null,
            allocations: data.allocations.map((allocation) => ({
                invoice_id: Number(allocation.invoice_id),
                allocated_amount: Number(allocation.allocated_amount),
            })),
        }));

        form.submit(PaymentController.store(), {
            preserveScroll: true,
        });
    }

    return (
        <div className="space-y-6">
            <Heading title={title} description={description} />

            <form onSubmit={submit} className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Payment header</CardTitle>
                        <CardDescription>
                            Record the receipt details first, then allocate the amount across the customer’s open invoices.
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                        <div className="grid gap-2">
                            <Label htmlFor="payment_no">Payment no.</Label>
                            <Input
                                id="payment_no"
                                value={form.data.payment_no}
                                onChange={(event) => form.setData('payment_no', event.currentTarget.value)}
                            />
                            <InputError message={form.errors.payment_no} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="customer_id">Customer</Label>
                            <select
                                id="customer_id"
                                value={form.data.customer_id}
                                onChange={(event) => handleCustomerChange(event.currentTarget.value)}
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
                            <Label htmlFor="payment_date">Payment date</Label>
                            <Input
                                id="payment_date"
                                type="date"
                                value={form.data.payment_date}
                                onChange={(event) => form.setData('payment_date', event.currentTarget.value)}
                            />
                            <InputError message={form.errors.payment_date} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="amount">Amount</Label>
                            <Input
                                id="amount"
                                type="number"
                                min="0.01"
                                step="0.01"
                                value={form.data.amount}
                                onChange={(event) => form.setData('amount', event.currentTarget.value)}
                            />
                            <InputError message={form.errors.amount} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="payment_method">Payment method</Label>
                            <select
                                id="payment_method"
                                value={form.data.payment_method}
                                onChange={(event) => form.setData('payment_method', event.currentTarget.value)}
                                className="border-input focus-visible:border-ring focus-visible:ring-ring/50 h-9 rounded-md border bg-transparent px-3 text-sm outline-none focus-visible:ring-[3px]"
                            >
                                {paymentMethodOptions.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                            <InputError message={form.errors.payment_method} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="reference_no">Reference no.</Label>
                            <Input
                                id="reference_no"
                                value={form.data.reference_no}
                                onChange={(event) => form.setData('reference_no', event.currentTarget.value)}
                                placeholder="Check number, transfer reference, etc."
                            />
                            <InputError message={form.errors.reference_no} />
                        </div>

                        <div className="grid gap-2 md:col-span-2 xl:col-span-3">
                            <Label htmlFor="remarks">Remarks</Label>
                            <Textarea
                                id="remarks"
                                rows={3}
                                value={form.data.remarks}
                                onChange={(event) => form.setData('remarks', event.currentTarget.value)}
                                placeholder="Optional collection notes or bank reference context."
                            />
                            <InputError message={form.errors.remarks} />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <CardTitle>Allocations</CardTitle>
                            <CardDescription>
                                Allocate the received amount across one or more open invoices for the selected customer.
                            </CardDescription>
                        </div>

                        <Button type="button" variant="outline" onClick={addAllocation}>
                            Add allocation
                        </Button>
                    </CardHeader>

                    <CardContent className="space-y-4">
                        {form.data.allocations.map((allocation, index) => (
                            <div key={index} className="grid gap-4 rounded-lg border p-4 xl:grid-cols-[2fr_1fr_auto]">
                                <div className="grid gap-2">
                                    <Label htmlFor={`allocations.${index}.invoice_id`}>Invoice</Label>
                                    <select
                                        id={`allocations.${index}.invoice_id`}
                                        value={allocation.invoice_id}
                                        onChange={(event) => updateAllocation(index, 'invoice_id', event.currentTarget.value)}
                                        className="border-input focus-visible:border-ring focus-visible:ring-ring/50 h-9 rounded-md border bg-transparent px-3 text-sm outline-none focus-visible:ring-[3px]"
                                    >
                                        <option value="">Select invoice</option>
                                        {filteredInvoiceOptions.map((option) => (
                                            <option key={option.value} value={option.value}>
                                                {option.label} • Bal {formatCurrency(option.remaining_balance)}
                                            </option>
                                        ))}
                                    </select>
                                    <InputError message={form.errors[`allocations.${index}.invoice_id`]} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor={`allocations.${index}.allocated_amount`}>Allocated amount</Label>
                                    <Input
                                        id={`allocations.${index}.allocated_amount`}
                                        type="number"
                                        min="0.01"
                                        step="0.01"
                                        value={allocation.allocated_amount}
                                        onChange={(event) => updateAllocation(index, 'allocated_amount', event.currentTarget.value)}
                                    />
                                    <InputError message={form.errors[`allocations.${index}.allocated_amount`]} />
                                </div>

                                <div className="flex items-end">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="w-full"
                                        disabled={form.data.allocations.length === 1}
                                        onClick={() => removeAllocation(index)}
                                    >
                                        Remove
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>

                <div className="grid gap-6 xl:grid-cols-[1fr_320px]">
                    <Card>
                        <CardHeader>
                            <CardTitle>Actions</CardTitle>
                            <CardDescription>
                                Save the payment now. Invoice balances and statuses will update automatically after allocation.
                            </CardDescription>
                        </CardHeader>

                        <CardContent className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                            <Button type="button" variant="outline" asChild>
                                <Link href={cancelHref}>Cancel</Link>
                            </Button>

                            <Button disabled={form.processing}>
                                {form.processing ? 'Saving...' : 'Record payment'}
                            </Button>
                        </CardContent>
                    </Card>

                    <Card className="h-fit">
                        <CardHeader>
                            <CardTitle>Allocation summary</CardTitle>
                            <CardDescription>
                                Keep the receipt amount and allocations balanced before saving.
                            </CardDescription>
                        </CardHeader>

                        <CardContent className="space-y-3 text-sm">
                            <div className="flex items-center justify-between">
                                <span className="text-muted-foreground">Payment amount</span>
                                <span className="font-medium">
                                    {formatCurrency(Number(form.data.amount || 0))}
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-muted-foreground">Allocated total</span>
                                <span className="font-medium">
                                    {formatCurrency(allocatedTotal)}
                                </span>
                            </div>
                            <div className="flex items-center justify-between border-t pt-3">
                                <span className="font-medium">Remaining to allocate</span>
                                <span className={`font-semibold ${remainingAmount === 0 ? 'text-emerald-600' : 'text-amber-600'}`}>
                                    {formatCurrency(remainingAmount)}
                                </span>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </form>
        </div>
    );
}
