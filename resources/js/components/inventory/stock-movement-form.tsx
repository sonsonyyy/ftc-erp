import type { InertiaLinkProps } from '@inertiajs/react';
import { Link, useForm } from '@inertiajs/react';
import StockMovementController from '@/actions/App/Http/Controllers/Inventory/StockMovementController';
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
import type { SelectOption, StockMovementFormDefaults } from '@/types';

type Props = {
    warehouseOptions: SelectOption[];
    itemOptions: SelectOption[];
    movementTypeOptions: SelectOption[];
    defaults: StockMovementFormDefaults;
    title: string;
    description: string;
    cancelHref: NonNullable<InertiaLinkProps['href']>;
};

export function StockMovementForm({
    warehouseOptions,
    itemOptions,
    movementTypeOptions,
    defaults,
    title,
    description,
    cancelHref,
}: Props) {
    const form = useForm({
        warehouse_id: defaults.warehouse_id
            ? String(defaults.warehouse_id)
            : '',
        inventory_item_id: defaults.inventory_item_id
            ? String(defaults.inventory_item_id)
            : '',
        movement_type: String(movementTypeOptions[0]?.value ?? ''),
        quantity: '',
        unit_cost: '',
        movement_date: defaults.movement_date,
        reference_number: '',
        remarks: '',
    });

    function submit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

        form.transform((data) => ({
            warehouse_id: Number(data.warehouse_id),
            inventory_item_id: Number(data.inventory_item_id),
            movement_type: data.movement_type,
            quantity: Number(data.quantity),
            unit_cost: data.unit_cost === '' ? null : Number(data.unit_cost),
            movement_date: data.movement_date,
            reference_number: data.reference_number || null,
            remarks: data.remarks || null,
        }));

        form.submit(StockMovementController.store(), {
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
                        <CardTitle>Movement details</CardTitle>
                        <CardDescription>
                            Use this only for direct stock in, stock out, and
                            adjustment entries. Issuances and returns should use
                            their dedicated forms.
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="grid gap-5 md:grid-cols-2">
                        <div className="grid gap-2">
                            <Label htmlFor="warehouse_id">Warehouse</Label>
                            <SelectInput
                                id="warehouse_id"
                                value={form.data.warehouse_id}
                                onChange={(event) =>
                                    form.setData(
                                        'warehouse_id',
                                        event.currentTarget.value,
                                    )
                                }
                                className="h-9 rounded-md border border-input bg-transparent px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                            >
                                <option value="">Select warehouse</option>
                                {warehouseOptions.map((option) => (
                                    <option
                                        key={option.value}
                                        value={option.value}
                                    >
                                        {option.label}
                                    </option>
                                ))}
                            </SelectInput>
                            <InputError message={form.errors.warehouse_id} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="inventory_item_id">
                                Inventory item
                            </Label>
                            <SelectInput
                                id="inventory_item_id"
                                value={form.data.inventory_item_id}
                                onChange={(event) =>
                                    form.setData(
                                        'inventory_item_id',
                                        event.currentTarget.value,
                                    )
                                }
                                className="h-9 rounded-md border border-input bg-transparent px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                            >
                                <option value="">Select item</option>
                                {itemOptions.map((option) => (
                                    <option
                                        key={option.value}
                                        value={option.value}
                                    >
                                        {option.label}
                                    </option>
                                ))}
                            </SelectInput>
                            <InputError
                                message={form.errors.inventory_item_id}
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="movement_type">Movement type</Label>
                            <SelectInput
                                id="movement_type"
                                value={form.data.movement_type}
                                onChange={(event) =>
                                    form.setData(
                                        'movement_type',
                                        event.currentTarget.value,
                                    )
                                }
                                className="h-9 rounded-md border border-input bg-transparent px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                            >
                                {movementTypeOptions.map((option) => (
                                    <option
                                        key={option.value}
                                        value={option.value}
                                    >
                                        {option.label}
                                    </option>
                                ))}
                            </SelectInput>
                            <InputError message={form.errors.movement_type} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="movement_date">Movement date</Label>
                            <Input
                                id="movement_date"
                                type="date"
                                value={form.data.movement_date}
                                onChange={(event) =>
                                    form.setData(
                                        'movement_date',
                                        event.currentTarget.value,
                                    )
                                }
                            />
                            <InputError message={form.errors.movement_date} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="quantity">Quantity</Label>
                            <Input
                                id="quantity"
                                type="number"
                                min="0.01"
                                step="0.01"
                                value={form.data.quantity}
                                onChange={(event) =>
                                    form.setData(
                                        'quantity',
                                        event.currentTarget.value,
                                    )
                                }
                            />
                            <InputError message={form.errors.quantity} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="unit_cost">Unit cost</Label>
                            <Input
                                id="unit_cost"
                                type="number"
                                min="0"
                                step="0.01"
                                value={form.data.unit_cost}
                                onChange={(event) =>
                                    form.setData(
                                        'unit_cost',
                                        event.currentTarget.value,
                                    )
                                }
                                placeholder="Optional"
                            />
                            <InputError message={form.errors.unit_cost} />
                        </div>

                        <div className="grid gap-2 md:col-span-2">
                            <Label htmlFor="reference_number">
                                Reference number
                            </Label>
                            <Input
                                id="reference_number"
                                value={form.data.reference_number}
                                onChange={(event) =>
                                    form.setData(
                                        'reference_number',
                                        event.currentTarget.value,
                                    )
                                }
                                placeholder="Delivery receipt or adjustment memo"
                            />
                            <InputError
                                message={form.errors.reference_number}
                            />
                        </div>

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
                                rows={4}
                                placeholder="Why the stock moved and any supporting context."
                            />
                            <InputError message={form.errors.remarks} />
                        </div>
                    </CardContent>
                </Card>

                <Card className="h-fit">
                    <CardHeader>
                        <CardTitle>Actions</CardTitle>
                        <CardDescription>
                            Posted manual movements immediately update the
                            warehouse balance and movement log.
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-3">
                        <Button className="w-full" disabled={form.processing}>
                            {form.processing
                                ? 'Recording...'
                                : 'Record movement'}
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
