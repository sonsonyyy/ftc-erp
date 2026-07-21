import type { InertiaLinkProps } from '@inertiajs/react';
import { Link, useForm } from '@inertiajs/react';
import InventoryItemController from '@/actions/App/Http/Controllers/Inventory/InventoryItemController';
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
import type { InventoryFormData, SelectOption } from '@/types';

type Props = {
    inventoryItem?: InventoryFormData;
    categoryOptions: SelectOption[];
    statusOptions: SelectOption[];
    title: string;
    description: string;
    cancelHref: NonNullable<InertiaLinkProps['href']>;
};

export function InventoryItemForm({
    inventoryItem,
    categoryOptions,
    statusOptions,
    title,
    description,
    cancelHref,
}: Props) {
    const form = useForm({
        sku: inventoryItem?.sku ?? '',
        item_code: inventoryItem?.item_code ?? '',
        item_name: inventoryItem?.item_name ?? '',
        inventory_category_id: inventoryItem?.inventory_category_id
            ? String(inventoryItem.inventory_category_id)
            : '',
        unit: inventoryItem?.unit ?? '',
        reorder_level: inventoryItem?.reorder_level?.toString() ?? '0',
        standard_cost: inventoryItem?.standard_cost?.toString() ?? '',
        status:
            inventoryItem?.status ??
            String(statusOptions[0]?.value ?? 'active'),
        notes: inventoryItem?.notes ?? '',
    });

    function submit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

        form.transform((data) => ({
            sku: data.sku || null,
            item_code: data.item_code,
            item_name: data.item_name,
            inventory_category_id:
                data.inventory_category_id === ''
                    ? null
                    : Number(data.inventory_category_id),
            unit: data.unit,
            reorder_level: Number(data.reorder_level || 0),
            standard_cost:
                data.standard_cost === '' ? null : Number(data.standard_cost),
            status: data.status,
            notes: data.notes || null,
        }));

        if (inventoryItem?.id) {
            form.submit(InventoryItemController.update(inventoryItem.id), {
                preserveScroll: true,
            });

            return;
        }

        form.submit(InventoryItemController.store(), {
            preserveScroll: true,
        });
    }

    return (
        <div className="space-y-6">
            <Heading title={title} description={description} />

            <form
                onSubmit={submit}
                className="grid gap-6 xl:grid-cols-[2fr_1fr]"
            >
                <Card>
                    <CardHeader>
                        <CardTitle>Item details</CardTitle>
                        <CardDescription>
                            Maintain the company-owned stock master before
                            materials are issued to projects or work orders.
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="grid gap-5 md:grid-cols-2">
                        <div className="grid gap-2">
                            <Label htmlFor="sku">SKU</Label>
                            <Input
                                id="sku"
                                value={form.data.sku}
                                onChange={(event) =>
                                    form.setData(
                                        'sku',
                                        event.currentTarget.value,
                                    )
                                }
                                placeholder="SKU-00125"
                            />
                            <InputError message={form.errors.sku} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="item_code">Item code</Label>
                            <Input
                                id="item_code"
                                value={form.data.item_code}
                                onChange={(event) =>
                                    form.setData(
                                        'item_code',
                                        event.currentTarget.value,
                                    )
                                }
                                placeholder="ITM-00025"
                            />
                            <InputError message={form.errors.item_code} />
                        </div>

                        <div className="grid gap-2 md:col-span-2">
                            <Label htmlFor="item_name">Item name</Label>
                            <Input
                                id="item_name"
                                value={form.data.item_name}
                                onChange={(event) =>
                                    form.setData(
                                        'item_name',
                                        event.currentTarget.value,
                                    )
                                }
                                placeholder="Pendant sprinkler head"
                            />
                            <InputError message={form.errors.item_name} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="inventory_category_id">
                                Category
                            </Label>
                            <SelectInput
                                id="inventory_category_id"
                                value={form.data.inventory_category_id}
                                onChange={(event) =>
                                    form.setData(
                                        'inventory_category_id',
                                        event.currentTarget.value,
                                    )
                                }
                                className="h-9 rounded-md border border-input bg-transparent px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                            >
                                <option value="">No category</option>
                                {categoryOptions.map((option) => (
                                    <option
                                        key={option.value}
                                        value={option.value}
                                    >
                                        {option.label}
                                    </option>
                                ))}
                            </SelectInput>
                            <InputError
                                message={form.errors.inventory_category_id}
                            />
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

                        <div className="grid gap-2">
                            <Label htmlFor="unit">Unit</Label>
                            <Input
                                id="unit"
                                value={form.data.unit}
                                onChange={(event) =>
                                    form.setData(
                                        'unit',
                                        event.currentTarget.value,
                                    )
                                }
                                placeholder="pcs"
                            />
                            <InputError message={form.errors.unit} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="reorder_level">Reorder level</Label>
                            <Input
                                id="reorder_level"
                                type="number"
                                min="0"
                                step="0.01"
                                value={form.data.reorder_level}
                                onChange={(event) =>
                                    form.setData(
                                        'reorder_level',
                                        event.currentTarget.value,
                                    )
                                }
                            />
                            <InputError message={form.errors.reorder_level} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="standard_cost">Standard cost</Label>
                            <Input
                                id="standard_cost"
                                type="number"
                                min="0"
                                step="0.01"
                                value={form.data.standard_cost}
                                onChange={(event) =>
                                    form.setData(
                                        'standard_cost',
                                        event.currentTarget.value,
                                    )
                                }
                                placeholder="0.00"
                            />
                            <InputError message={form.errors.standard_cost} />
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
                                rows={5}
                                placeholder="Optional handling notes, supplier reference, or item usage guidance."
                            />
                            <InputError message={form.errors.notes} />
                        </div>
                    </CardContent>
                </Card>

                <Card className="h-fit">
                    <CardHeader>
                        <CardTitle>Actions</CardTitle>
                        <CardDescription>
                            Stock balances, movements, issuances, and returns
                            are managed after the item record is created.
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-3">
                        <Button className="w-full" disabled={form.processing}>
                            {form.processing
                                ? 'Saving...'
                                : inventoryItem?.id
                                  ? 'Update item'
                                  : 'Create item'}
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
