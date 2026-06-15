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
import type { CustomerDetail } from '@/types';

type CustomerFormData = {
    company_name: string;
    trade_name: string;
    tin: string;
    phone: string;
    email: string;
    billing_address: string;
    notes: string;
};

type Props = {
    customer?: CustomerDetail;
    title: string;
    description: string;
    cancelHref: NonNullable<InertiaLinkProps['href']>;
};

export function CustomerForm({
    customer,
    title,
    description,
    cancelHref,
}: Props) {
    const isEditing = customer !== undefined;

    const form = useForm<CustomerFormData>({
        company_name: customer?.company_name ?? '',
        trade_name: customer?.trade_name ?? '',
        tin: customer?.tin ?? '',
        phone: customer?.phone ?? '',
        email: customer?.email ?? '',
        billing_address: customer?.billing_address ?? '',
        notes: customer?.notes ?? '',
    });

    function setField<K extends keyof CustomerFormData>(
        field: K,
        value: CustomerFormData[K],
    ): void {
        form.setData(field, value as never);
        form.clearErrors(field);
    }

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
                autoComplete="off"
            >
                <Card>
                    <CardHeader>
                        <CardTitle>Customer details</CardTitle>
                        <CardDescription>
                            Capture the primary customer record used across sales and operations.
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="grid gap-5 md:grid-cols-2">
                        {isEditing ? (
                            <div className="grid gap-2">
                                <Label htmlFor="customer_code">
                                    Customer code
                                </Label>
                                <Input
                                    id="customer_code"
                                    value={customer?.customer_code ?? ''}
                                    readOnly
                                    aria-readonly="true"
                                    className="bg-muted/30"
                                    autoComplete="off"
                                />
                            </div>
                        ) : null}

                        <div className="grid gap-2 md:col-span-2">
                            <Label htmlFor="company_name">
                                Company name{' '}
                                <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                id="company_name"
                                required
                                aria-invalid={Boolean(form.errors.company_name)}
                                value={form.data.company_name}
                                onChange={(event) =>
                                    setField(
                                        'company_name',
                                        event.currentTarget.value,
                                    )
                                }
                                placeholder="ABC Fire Protection Services, Inc."
                                autoComplete="off"
                            />
                            <InputError message={form.errors.company_name} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="trade_name">Trade name</Label>
                            <Input
                                id="trade_name"
                                aria-invalid={Boolean(form.errors.trade_name)}
                                value={form.data.trade_name}
                                onChange={(event) =>
                                    setField(
                                        'trade_name',
                                        event.currentTarget.value,
                                    )
                                }
                                placeholder="ABC Fire"
                                autoComplete="off"
                            />
                            <InputError message={form.errors.trade_name} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="tin">TIN</Label>
                            <Input
                                id="tin"
                                aria-invalid={Boolean(form.errors.tin)}
                                value={form.data.tin}
                                onChange={(event) =>
                                    setField('tin', event.currentTarget.value)
                                }
                                placeholder="000-000-000-000"
                                autoComplete="off"
                            />
                            <InputError message={form.errors.tin} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="phone">Phone</Label>
                            <Input
                                id="phone"
                                aria-invalid={Boolean(form.errors.phone)}
                                value={form.data.phone}
                                onChange={(event) =>
                                    setField('phone', event.currentTarget.value)
                                }
                                placeholder="(02) 8123 4567"
                                autoComplete="off"
                            />
                            <InputError message={form.errors.phone} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                aria-invalid={Boolean(form.errors.email)}
                                value={form.data.email}
                                onChange={(event) =>
                                    setField('email', event.currentTarget.value)
                                }
                                placeholder="billing@example.com"
                                autoComplete="off"
                            />
                            <InputError message={form.errors.email} />
                        </div>

                        <div className="grid gap-2 md:col-span-2">
                            <Label htmlFor="billing_address">
                                Billing address
                            </Label>
                            <Textarea
                                id="billing_address"
                                aria-invalid={Boolean(
                                    form.errors.billing_address,
                                )}
                                value={form.data.billing_address}
                                onChange={(event) =>
                                    setField(
                                        'billing_address',
                                        event.currentTarget.value,
                                    )
                                }
                                placeholder="Enter billing address"
                                autoComplete="off"
                            />
                            <InputError message={form.errors.billing_address} />
                        </div>

                        <div className="grid gap-2 md:col-span-2">
                            <Label htmlFor="notes">Notes</Label>
                            <Textarea
                                id="notes"
                                aria-invalid={Boolean(form.errors.notes)}
                                value={form.data.notes}
                                onChange={(event) =>
                                    setField('notes', event.currentTarget.value)
                                }
                                placeholder="Internal notes about this customer"
                                autoComplete="off"
                            />
                            <InputError message={form.errors.notes} />
                        </div>
                    </CardContent>
                </Card>

                <Card className="h-fit">
                    <CardHeader>
                        <CardTitle>Actions</CardTitle>
                        <CardDescription>
                            Save the customer record to continue.
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
