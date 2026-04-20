import type { InertiaLinkProps } from '@inertiajs/react';
import { Link, useForm } from '@inertiajs/react';
import SupplierController from '@/actions/App/Http/Controllers/Purchasing/SupplierController';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { SupplierDetail } from '@/types';

type Props = {
    supplier?: SupplierDetail;
    title: string;
    description: string;
    cancelHref: NonNullable<InertiaLinkProps['href']>;
};

export function SupplierForm({ supplier, title, description, cancelHref }: Props) {
    const form = useForm({
        supplier_code: supplier?.supplier_code ?? '',
        company_name: supplier?.company_name ?? '',
        contact_person: supplier?.contact_person ?? '',
        phone: supplier?.phone ?? '',
        email: supplier?.email ?? '',
        tin: supplier?.tin ?? '',
        address: supplier?.address ?? '',
        payment_terms: supplier?.payment_terms ?? '',
        is_active: supplier?.is_active ?? true,
        notes: supplier?.notes ?? '',
    });

    function submit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

        form.transform((data) => ({
            ...data,
            contact_person: data.contact_person || null,
            phone: data.phone || null,
            email: data.email || null,
            tin: data.tin || null,
            address: data.address || null,
            payment_terms: data.payment_terms || null,
            notes: data.notes || null,
        }));

        if (supplier) {
            form.submit(SupplierController.update(supplier.id), {
                preserveScroll: true,
            });

            return;
        }

        form.submit(SupplierController.store(), {
            preserveScroll: true,
        });
    }

    return (
        <div className="space-y-6">
            <Heading title={title} description={description} />

            <form onSubmit={submit} className="grid gap-6 xl:grid-cols-[2fr_1fr]">
                <Card>
                    <CardHeader>
                        <CardTitle>Supplier details</CardTitle>
                        <CardDescription>
                            Maintain the supplier registry used by purchase requests, purchase orders, and receiving.
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="grid gap-5 md:grid-cols-2">
                        <div className="grid gap-2">
                            <Label htmlFor="supplier_code">Supplier code</Label>
                            <Input
                                id="supplier_code"
                                value={form.data.supplier_code}
                                onChange={(event) => form.setData('supplier_code', event.currentTarget.value)}
                                placeholder="SUP-00001"
                            />
                            <InputError message={form.errors.supplier_code} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="is_active">Activity</Label>
                            <select
                                id="is_active"
                                value={form.data.is_active ? '1' : '0'}
                                onChange={(event) => form.setData('is_active', event.currentTarget.value === '1')}
                                className="border-input focus-visible:border-ring focus-visible:ring-ring/50 h-9 rounded-md border bg-transparent px-3 text-sm outline-none focus-visible:ring-[3px]"
                            >
                                <option value="1">Active</option>
                                <option value="0">Inactive</option>
                            </select>
                            <InputError message={form.errors.is_active} />
                        </div>

                        <div className="grid gap-2 md:col-span-2">
                            <Label htmlFor="company_name">Company name</Label>
                            <Input
                                id="company_name"
                                value={form.data.company_name}
                                onChange={(event) => form.setData('company_name', event.currentTarget.value)}
                                placeholder="ABC Industrial Supply Corporation"
                            />
                            <InputError message={form.errors.company_name} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="contact_person">Contact person</Label>
                            <Input
                                id="contact_person"
                                value={form.data.contact_person}
                                onChange={(event) => form.setData('contact_person', event.currentTarget.value)}
                                placeholder="Primary purchasing contact"
                            />
                            <InputError message={form.errors.contact_person} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="payment_terms">Payment terms</Label>
                            <Input
                                id="payment_terms"
                                value={form.data.payment_terms}
                                onChange={(event) => form.setData('payment_terms', event.currentTarget.value)}
                                placeholder="30 days"
                            />
                            <InputError message={form.errors.payment_terms} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="phone">Phone</Label>
                            <Input
                                id="phone"
                                value={form.data.phone}
                                onChange={(event) => form.setData('phone', event.currentTarget.value)}
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
                                onChange={(event) => form.setData('email', event.currentTarget.value)}
                                placeholder="purchasing@supplier.com"
                            />
                            <InputError message={form.errors.email} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="tin">TIN</Label>
                            <Input
                                id="tin"
                                value={form.data.tin}
                                onChange={(event) => form.setData('tin', event.currentTarget.value)}
                                placeholder="000-000-000-000"
                            />
                            <InputError message={form.errors.tin} />
                        </div>

                        <div className="grid gap-2 md:col-span-2">
                            <Label htmlFor="address">Address</Label>
                            <Textarea
                                id="address"
                                value={form.data.address}
                                onChange={(event) => form.setData('address', event.currentTarget.value)}
                                rows={3}
                                placeholder="Supplier office or warehouse address"
                            />
                            <InputError message={form.errors.address} />
                        </div>

                        <div className="grid gap-2 md:col-span-2">
                            <Label htmlFor="notes">Notes</Label>
                            <Textarea
                                id="notes"
                                value={form.data.notes}
                                onChange={(event) => form.setData('notes', event.currentTarget.value)}
                                rows={4}
                                placeholder="Optional supplier notes, accreditations, or reminders."
                            />
                            <InputError message={form.errors.notes} />
                        </div>
                    </CardContent>
                </Card>

                <Card className="h-fit">
                    <CardHeader>
                        <CardTitle>Actions</CardTitle>
                        <CardDescription>
                            Save the supplier record now. Purchase requests, orders, and attachments can be handled from the detail page.
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-3">
                        <Button className="w-full" disabled={form.processing}>
                            {form.processing
                                ? 'Saving...'
                                : supplier
                                  ? 'Update supplier'
                                  : 'Create supplier'}
                        </Button>

                        <Button type="button" variant="outline" className="w-full" asChild>
                            <Link href={cancelHref}>Cancel</Link>
                        </Button>
                    </CardContent>
                </Card>
            </form>
        </div>
    );
}
