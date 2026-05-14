import type { InertiaLinkProps } from '@inertiajs/react';
import { Link, useForm } from '@inertiajs/react';
import CustomerController from '@/actions/App/Http/Controllers/Customers/CustomerController';
import InputError from '@/components/input-error';
import Heading from '@/components/heading';
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
import type { CustomerDetail, SelectOption } from '@/types';
import { SelectInput } from '@/components/ui/select-input';

type Props = {
    customer?: CustomerDetail;
    statusOptions: SelectOption[];
    title: string;
    description: string;
    cancelHref: NonNullable<InertiaLinkProps['href']>;
};

export function CustomerForm({
    customer,
    statusOptions,
    title,
    description,
    cancelHref,
}: Props) {
    const form = useForm({
        customer_code: customer?.customer_code ?? '',
        company_name: customer?.company_name ?? '',
        trade_name: customer?.trade_name ?? '',
        tin: customer?.tin ?? '',
        phone: customer?.phone ?? '',
        email: customer?.email ?? '',
        billing_address: customer?.billing_address ?? '',
        status: customer?.status ?? String(statusOptions[0]?.value ?? 'active'),
        notes: customer?.notes ?? '',
    });

    function submit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

        form.transform((data) => ({
            ...data,
            trade_name: data.trade_name || null,
            tin: data.tin || null,
            phone: data.phone || null,
            email: data.email || null,
            billing_address: data.billing_address || null,
            notes: data.notes || null,
        }));

        if (customer) {
            form.submit(CustomerController.update(customer.id), {
                preserveScroll: true,
            });

            return;
        }

        form.submit(CustomerController.store(), {
            preserveScroll: true,
        });
    }

    return (
        <div className="space-y-6">
            <Heading title={title} description={description} />

            <form
                onSubmit={submit}
                className="grid gap-6 lg:grid-cols-[2fr_1fr]"
            >
                <Card>
                    <CardHeader>
                        <CardTitle>Customer details</CardTitle>
                        <CardDescription>
                            Maintain the customer masterfile used by future
                            quotations, projects, and service work.
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="grid gap-5 md:grid-cols-2">
                        <div className="grid gap-2">
                            <Label htmlFor="customer_code">Customer code</Label>
                            <Input
                                id="customer_code"
                                value={form.data.customer_code}
                                onChange={(event) =>
                                    form.setData(
                                        'customer_code',
                                        event.currentTarget.value,
                                    )
                                }
                                placeholder="CUST-00001"
                            />
                            <InputError message={form.errors.customer_code} />
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
                                className="h-9 rounded-md border border-input bg-transparent px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
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

                        <div className="grid gap-2 md:col-span-2">
                            <Label htmlFor="company_name">Company name</Label>
                            <Input
                                id="company_name"
                                value={form.data.company_name}
                                onChange={(event) =>
                                    form.setData(
                                        'company_name',
                                        event.currentTarget.value,
                                    )
                                }
                                placeholder="ABC Fire Protection Services, Inc."
                            />
                            <InputError message={form.errors.company_name} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="trade_name">Trade name</Label>
                            <Input
                                id="trade_name"
                                value={form.data.trade_name}
                                onChange={(event) =>
                                    form.setData(
                                        'trade_name',
                                        event.currentTarget.value,
                                    )
                                }
                                placeholder="ABC Fire"
                            />
                            <InputError message={form.errors.trade_name} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="tin">TIN</Label>
                            <Input
                                id="tin"
                                value={form.data.tin}
                                onChange={(event) =>
                                    form.setData(
                                        'tin',
                                        event.currentTarget.value,
                                    )
                                }
                                placeholder="000-000-000-000"
                            />
                            <InputError message={form.errors.tin} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="phone">Phone</Label>
                            <Input
                                id="phone"
                                value={form.data.phone}
                                onChange={(event) =>
                                    form.setData(
                                        'phone',
                                        event.currentTarget.value,
                                    )
                                }
                                placeholder="(02) 8123 4567"
                            />
                            <InputError message={form.errors.phone} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                value={form.data.email}
                                onChange={(event) =>
                                    form.setData(
                                        'email',
                                        event.currentTarget.value,
                                    )
                                }
                                placeholder="billing@example.com"
                            />
                            <InputError message={form.errors.email} />
                        </div>

                        <div className="grid gap-2 md:col-span-2">
                            <Label htmlFor="billing_address">
                                Billing address
                            </Label>
                            <Textarea
                                id="billing_address"
                                value={form.data.billing_address}
                                onChange={(event) =>
                                    form.setData(
                                        'billing_address',
                                        event.currentTarget.value,
                                    )
                                }
                                placeholder="Enter billing address"
                            />
                            <InputError message={form.errors.billing_address} />
                        </div>

                        <div className="grid gap-2 md:col-span-2">
                            <Label htmlFor="notes">Notes</Label>
                            <Textarea
                                id="notes"
                                value={form.data.notes}
                                onChange={(event) =>
                                    form.setData(
                                        'notes',
                                        event.currentTarget.value,
                                    )
                                }
                                placeholder="Internal notes about this customer"
                            />
                            <InputError message={form.errors.notes} />
                        </div>
                    </CardContent>
                </Card>

                <Card className="h-fit">
                    <CardHeader>
                        <CardTitle>Actions</CardTitle>
                        <CardDescription>
                            Save the customer record now and manage sites and
                            attachments from the detail page.
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-3">
                        <Button className="w-full" disabled={form.processing}>
                            {form.processing
                                ? 'Saving...'
                                : customer
                                  ? 'Update customer'
                                  : 'Create customer'}
                        </Button>

                        <Button className="w-full" variant="outline" asChild>
                            <Link href={cancelHref}>Cancel</Link>
                        </Button>
                    </CardContent>
                </Card>
            </form>
        </div>
    );
}
