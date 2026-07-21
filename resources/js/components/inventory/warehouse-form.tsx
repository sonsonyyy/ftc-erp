import type { InertiaLinkProps } from '@inertiajs/react';
import { Link, useForm } from '@inertiajs/react';
import WarehouseController from '@/actions/App/Http/Controllers/Inventory/WarehouseController';
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
import type { WarehouseFormData } from '@/types';

type Props = {
    warehouse?: WarehouseFormData;
    title: string;
    description: string;
    cancelHref: NonNullable<InertiaLinkProps['href']>;
};

export function WarehouseForm({
    warehouse,
    title,
    description,
    cancelHref,
}: Props) {
    const form = useForm({
        warehouse_code: warehouse?.warehouse_code ?? '',
        warehouse_name: warehouse?.warehouse_name ?? '',
        address: warehouse?.address ?? '',
        contact_person: warehouse?.contact_person ?? '',
        contact_no: warehouse?.contact_no ?? '',
        is_active: warehouse?.is_active ?? true,
        notes: warehouse?.notes ?? '',
    });

    function submit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

        form.transform((data) => ({
            ...data,
            address: data.address || null,
            contact_person: data.contact_person || null,
            contact_no: data.contact_no || null,
            notes: data.notes || null,
        }));

        if (warehouse?.id) {
            form.submit(WarehouseController.update(warehouse.id), {
                preserveScroll: true,
            });

            return;
        }

        form.submit(WarehouseController.store(), {
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
                        <CardTitle>Warehouse details</CardTitle>
                        <CardDescription>
                            Register the physical stock location and the main
                            contact details used by operations and warehouse
                            staff.
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="grid gap-5 md:grid-cols-2">
                        <div className="grid gap-2">
                            <Label htmlFor="warehouse_code">
                                Warehouse code
                            </Label>
                            <Input
                                id="warehouse_code"
                                value={form.data.warehouse_code}
                                onChange={(event) =>
                                    form.setData(
                                        'warehouse_code',
                                        event.currentTarget.value,
                                    )
                                }
                                placeholder="WH-001"
                            />
                            <InputError message={form.errors.warehouse_code} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="warehouse_name">
                                Warehouse name
                            </Label>
                            <Input
                                id="warehouse_name"
                                value={form.data.warehouse_name}
                                onChange={(event) =>
                                    form.setData(
                                        'warehouse_name',
                                        event.currentTarget.value,
                                    )
                                }
                                placeholder="Main Warehouse"
                            />
                            <InputError message={form.errors.warehouse_name} />
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
                                rows={4}
                                placeholder="Warehouse address"
                            />
                            <InputError message={form.errors.address} />
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
                                placeholder="Warehouse supervisor"
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
                                placeholder="0917 123 4567"
                            />
                            <InputError message={form.errors.contact_no} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="is_active">Availability</Label>
                            <SelectInput
                                id="is_active"
                                value={form.data.is_active ? '1' : '0'}
                                onChange={(event) =>
                                    form.setData(
                                        'is_active',
                                        event.currentTarget.value === '1',
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
                                rows={4}
                                placeholder="Optional operating hours, gate access notes, or handling reminders."
                            />
                            <InputError message={form.errors.notes} />
                        </div>
                    </CardContent>
                </Card>

                <Card className="h-fit">
                    <CardHeader>
                        <CardTitle>Actions</CardTitle>
                        <CardDescription>
                            Balance tracking and stock movement history become
                            available from the warehouse detail page.
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-3">
                        <Button className="w-full" disabled={form.processing}>
                            {form.processing
                                ? 'Saving...'
                                : warehouse?.id
                                  ? 'Update warehouse'
                                  : 'Create warehouse'}
                        </Button>

                        <Button variant="outline" className="w-full" asChild>
                            <Link href={cancelHref}>Cancel</Link>
                        </Button>
                    </CardContent>
                </Card>
            </form>
        </div>
    );
}
