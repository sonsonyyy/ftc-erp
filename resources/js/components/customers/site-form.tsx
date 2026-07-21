import type { InertiaLinkProps } from '@inertiajs/react';
import { Link, useForm } from '@inertiajs/react';
import CustomerSiteController from '@/actions/App/Http/Controllers/Customers/CustomerSiteController';
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
import { SelectInput } from '@/components/ui/select-input';
import { Textarea } from '@/components/ui/textarea';
import type { SelectOption, SiteDetail } from '@/types';

type SiteFormData = {
    customer_id: string;
    site_name: string;
    contact_person: string;
    contact_no: string;
    email: string;
    address: string;
    city: string;
    province: string;
    notes: string;
    is_active: '0' | '1';
};

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
    const isEditing = site !== undefined;

    const form = useForm<SiteFormData>({
        customer_id: String(site?.customer.id ?? defaults?.customer_id ?? ''),
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

    function setField<K extends keyof SiteFormData>(
        field: K,
        value: SiteFormData[K],
    ): void {
        form.setData(field, value as never);
        form.clearErrors(field);
    }

    function submit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

        form.transform((data) => ({
            ...data,
            customer_id: Number(data.customer_id),
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
                autoComplete="off"
            >
                <Card>
                    <CardHeader>
                        <CardTitle>Site details</CardTitle>
                        <CardDescription>
                            Keep each project or service location linked to the
                            right customer record.
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="grid gap-5 md:grid-cols-2">
                        <div className="grid gap-2 md:col-span-2">
                            <Label htmlFor="customer_id">
                                Customer{' '}
                                <span className="text-destructive">*</span>
                            </Label>
                            <SelectInput
                                id="customer_id"
                                value={form.data.customer_id}
                                required
                                aria-invalid={Boolean(form.errors.customer_id)}
                                onChange={(event) =>
                                    setField(
                                        'customer_id',
                                        event.currentTarget.value,
                                    )
                                }
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

                        {isEditing ? (
                            <div className="grid gap-2">
                                <Label htmlFor="site_code">Site code</Label>
                                <Input
                                    id="site_code"
                                    value={site?.site_code ?? ''}
                                    readOnly
                                    aria-readonly="true"
                                    className="bg-muted/30"
                                    autoComplete="off"
                                />
                            </div>
                        ) : null}

                        <div className="grid gap-2">
                            <Label htmlFor="is_active">
                                Site status{' '}
                                <span className="text-destructive">*</span>
                            </Label>
                            <SelectInput
                                id="is_active"
                                value={form.data.is_active}
                                required
                                aria-invalid={Boolean(form.errors.is_active)}
                                onChange={(event) =>
                                    setField(
                                        'is_active',
                                        event.currentTarget.value as '0' | '1',
                                    )
                                }
                            >
                                <option value="1">Active</option>
                                <option value="0">Inactive</option>
                            </SelectInput>
                            <InputError message={form.errors.is_active} />
                        </div>

                        <div className="grid gap-2 md:col-span-2">
                            <Label htmlFor="site_name">
                                Site name{' '}
                                <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                id="site_name"
                                required
                                aria-invalid={Boolean(form.errors.site_name)}
                                value={form.data.site_name}
                                onChange={(event) =>
                                    setField(
                                        'site_name',
                                        event.currentTarget.value,
                                    )
                                }
                                placeholder="Main office, warehouse, branch site, etc."
                                autoComplete="off"
                            />
                            <InputError message={form.errors.site_name} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="contact_person">
                                Contact person
                            </Label>
                            <Input
                                id="contact_person"
                                aria-invalid={Boolean(
                                    form.errors.contact_person,
                                )}
                                value={form.data.contact_person}
                                onChange={(event) =>
                                    setField(
                                        'contact_person',
                                        event.currentTarget.value,
                                    )
                                }
                                placeholder="On-site coordinator"
                                autoComplete="off"
                            />
                            <InputError message={form.errors.contact_person} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="contact_no">Contact number</Label>
                            <Input
                                id="contact_no"
                                aria-invalid={Boolean(form.errors.contact_no)}
                                value={form.data.contact_no}
                                onChange={(event) =>
                                    setField(
                                        'contact_no',
                                        event.currentTarget.value,
                                    )
                                }
                                placeholder="0917 000 0000"
                                autoComplete="off"
                            />
                            <InputError message={form.errors.contact_no} />
                        </div>

                        <div className="grid gap-2 md:col-span-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                aria-invalid={Boolean(form.errors.email)}
                                value={form.data.email}
                                onChange={(event) =>
                                    setField('email', event.currentTarget.value)
                                }
                                placeholder="site.contact@example.com"
                                autoComplete="off"
                            />
                            <InputError message={form.errors.email} />
                        </div>

                        <div className="grid gap-2 md:col-span-2">
                            <Label htmlFor="address">
                                Address{' '}
                                <span className="text-destructive">*</span>
                            </Label>
                            <Textarea
                                id="address"
                                required
                                aria-invalid={Boolean(form.errors.address)}
                                value={form.data.address}
                                onChange={(event) =>
                                    setField(
                                        'address',
                                        event.currentTarget.value,
                                    )
                                }
                                placeholder="Full service or project site address"
                                autoComplete="off"
                            />
                            <InputError message={form.errors.address} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="city">City / Municipality</Label>
                            <Input
                                id="city"
                                aria-invalid={Boolean(form.errors.city)}
                                value={form.data.city}
                                onChange={(event) =>
                                    setField('city', event.currentTarget.value)
                                }
                                placeholder="Quezon City"
                                autoComplete="off"
                            />
                            <InputError message={form.errors.city} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="province">Province</Label>
                            <Input
                                id="province"
                                aria-invalid={Boolean(form.errors.province)}
                                value={form.data.province}
                                onChange={(event) =>
                                    setField(
                                        'province',
                                        event.currentTarget.value,
                                    )
                                }
                                placeholder="Metro Manila"
                                autoComplete="off"
                            />
                            <InputError message={form.errors.province} />
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
                                placeholder="Access instructions, billing notes, schedule reminders, etc."
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
                            Save now and manage attachments from the detail
                            page.
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
