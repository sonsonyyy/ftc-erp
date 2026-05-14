import type { InertiaLinkProps } from '@inertiajs/react';
import { Link, useForm } from '@inertiajs/react';
import CustomerSiteController from '@/actions/App/Http/Controllers/Customers/CustomerSiteController';
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
import type { SelectOption, SiteDetail } from '@/types';
import { SelectInput } from '@/components/ui/select-input';

type Props = {
    site?: SiteDetail;
    customerOptions: SelectOption[];
    defaults?: {
        customer_id: number | null;
        is_active: boolean;
    };
    title: string;
    description: string;
    cancelHref: NonNullable<InertiaLinkProps['href']>;
};

export function SiteForm({
    site,
    customerOptions,
    defaults,
    title,
    description,
    cancelHref,
}: Props) {
    const form = useForm({
        customer_id: String(site?.customer.id ?? defaults?.customer_id ?? ''),
        site_code: site?.site_code ?? '',
        site_name: site?.site_name ?? '',
        contact_person: site?.contact_person ?? '',
        contact_no: site?.contact_no ?? '',
        email: site?.email ?? '',
        address: site?.address ?? '',
        city: site?.city ?? '',
        province: site?.province ?? '',
        notes: site?.notes ?? '',
        is_active: site
            ? site.is_active
                ? '1'
                : '0'
            : defaults?.is_active === false
              ? '0'
              : '1',
    });

    function submit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

        form.transform((data) => ({
            ...data,
            customer_id: Number(data.customer_id),
            site_code: data.site_code || null,
            contact_person: data.contact_person || null,
            contact_no: data.contact_no || null,
            email: data.email || null,
            city: data.city || null,
            province: data.province || null,
            notes: data.notes || null,
            is_active: data.is_active === '1',
        }));

        if (site) {
            form.submit(CustomerSiteController.update(site.id), {
                preserveScroll: true,
            });

            return;
        }

        form.submit(CustomerSiteController.store(), {
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
                        <CardTitle>Site details</CardTitle>
                        <CardDescription>
                            Keep each project or service location tied to the
                            correct customer record.
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="grid gap-5 md:grid-cols-2">
                        <div className="grid gap-2 md:col-span-2">
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
                                className="h-9 rounded-md border border-input bg-transparent px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                            >
                                <option value="">Select a customer</option>
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
                            <Label htmlFor="site_code">Site code</Label>
                            <Input
                                id="site_code"
                                value={form.data.site_code}
                                onChange={(event) =>
                                    form.setData(
                                        'site_code',
                                        event.currentTarget.value,
                                    )
                                }
                                placeholder="SITE-00001"
                            />
                            <InputError message={form.errors.site_code} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="is_active">Site status</Label>
                            <SelectInput
                                id="is_active"
                                value={form.data.is_active}
                                onChange={(event) =>
                                    form.setData(
                                        'is_active',
                                        event.currentTarget.value,
                                    )
                                }
                                className="h-9 rounded-md border border-input bg-transparent px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                            >
                                <option value="1">Active</option>
                                <option value="0">Inactive</option>
                            </SelectInput>
                            <InputError message={form.errors.is_active} />
                        </div>

                        <div className="grid gap-2 md:col-span-2">
                            <Label htmlFor="site_name">Site name</Label>
                            <Input
                                id="site_name"
                                value={form.data.site_name}
                                onChange={(event) =>
                                    form.setData(
                                        'site_name',
                                        event.currentTarget.value,
                                    )
                                }
                                placeholder="Main office, warehouse, branch site, etc."
                            />
                            <InputError message={form.errors.site_name} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="contact_person">
                                Contact person
                            </Label>
                            <Input
                                id="contact_person"
                                value={form.data.contact_person}
                                onChange={(event) =>
                                    form.setData(
                                        'contact_person',
                                        event.currentTarget.value,
                                    )
                                }
                                placeholder="On-site coordinator"
                            />
                            <InputError message={form.errors.contact_person} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="contact_no">Contact number</Label>
                            <Input
                                id="contact_no"
                                value={form.data.contact_no}
                                onChange={(event) =>
                                    form.setData(
                                        'contact_no',
                                        event.currentTarget.value,
                                    )
                                }
                                placeholder="0917 000 0000"
                            />
                            <InputError message={form.errors.contact_no} />
                        </div>

                        <div className="grid gap-2 md:col-span-2">
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
                                placeholder="site.contact@example.com"
                            />
                            <InputError message={form.errors.email} />
                        </div>

                        <div className="grid gap-2 md:col-span-2">
                            <Label htmlFor="address">Address</Label>
                            <Textarea
                                id="address"
                                value={form.data.address}
                                onChange={(event) =>
                                    form.setData(
                                        'address',
                                        event.currentTarget.value,
                                    )
                                }
                                placeholder="Full service or project site address"
                            />
                            <InputError message={form.errors.address} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="city">City / Municipality</Label>
                            <Input
                                id="city"
                                value={form.data.city}
                                onChange={(event) =>
                                    form.setData(
                                        'city',
                                        event.currentTarget.value,
                                    )
                                }
                                placeholder="Quezon City"
                            />
                            <InputError message={form.errors.city} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="province">Province</Label>
                            <Input
                                id="province"
                                value={form.data.province}
                                onChange={(event) =>
                                    form.setData(
                                        'province',
                                        event.currentTarget.value,
                                    )
                                }
                                placeholder="Metro Manila"
                            />
                            <InputError message={form.errors.province} />
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
                                placeholder="Access instructions, billing notes, schedule reminders, etc."
                            />
                            <InputError message={form.errors.notes} />
                        </div>
                    </CardContent>
                </Card>

                <Card className="h-fit">
                    <CardHeader>
                        <CardTitle>Actions</CardTitle>
                        <CardDescription>
                            Save the site record now and manage attachments from
                            the detail page.
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-3">
                        <Button className="w-full" disabled={form.processing}>
                            {form.processing
                                ? 'Saving...'
                                : site
                                  ? 'Update site'
                                  : 'Create site'}
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
