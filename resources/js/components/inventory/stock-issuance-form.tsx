import type { InertiaLinkProps } from '@inertiajs/react';
import { Link, useForm } from '@inertiajs/react';
import StockIssuanceController from '@/actions/App/Http/Controllers/Inventory/StockIssuanceController';
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
import { Textarea } from '@/components/ui/textarea';
import type {
    SelectOption,
    StockIssuanceDefaults,
    StockLineItemInput,
    StockWorkOrderOption,
} from '@/types';
import { SelectInput } from '@/components/ui/select-input';

type Props = {
    warehouseOptions: SelectOption[];
    projectOptions: SelectOption[];
    workOrderOptions: StockWorkOrderOption[];
    itemOptions: SelectOption[];
    defaults: StockIssuanceDefaults;
    title: string;
    description: string;
    cancelHref: NonNullable<InertiaLinkProps['href']>;
};

export function StockIssuanceForm({
    warehouseOptions,
    projectOptions,
    workOrderOptions,
    itemOptions,
    defaults,
    title,
    description,
    cancelHref,
}: Props) {
    const form = useForm({
        issuance_no: defaults.issuance_no,
        warehouse_id: '',
        project_id: defaults.project_id ? String(defaults.project_id) : '',
        work_order_id: defaults.work_order_id
            ? String(defaults.work_order_id)
            : '',
        issued_date: defaults.issued_date,
        remarks: '',
        items: [
            { inventory_item_id: '', quantity: '', remarks: '' },
        ] as StockLineItemInput[],
    });

    function updateItem(
        index: number,
        key: keyof StockLineItemInput,
        value: string,
    ) {
        form.setData(
            'items',
            form.data.items.map((item, itemIndex) =>
                itemIndex === index ? { ...item, [key]: value } : item,
            ),
        );
    }

    function addItem() {
        form.setData('items', [
            ...form.data.items,
            { inventory_item_id: '', quantity: '', remarks: '' },
        ]);
    }

    function removeItem(index: number) {
        form.setData(
            'items',
            form.data.items.filter((_, itemIndex) => itemIndex !== index),
        );
    }

    function handleWorkOrderChange(value: string) {
        form.setData('work_order_id', value);

        const workOrder = workOrderOptions.find(
            (option) => String(option.value) === value,
        );

        if (workOrder?.project_id) {
            form.setData('project_id', String(workOrder.project_id));
        }
    }

    function submit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

        form.transform((data) => ({
            issuance_no: data.issuance_no,
            warehouse_id: Number(data.warehouse_id),
            project_id: data.project_id === '' ? null : Number(data.project_id),
            work_order_id:
                data.work_order_id === '' ? null : Number(data.work_order_id),
            issued_date: data.issued_date,
            remarks: data.remarks || null,
            items: data.items.map((item) => ({
                inventory_item_id: Number(item.inventory_item_id),
                quantity: Number(item.quantity),
                remarks: item.remarks || null,
            })),
        }));

        form.submit(StockIssuanceController.store(), {
            preserveScroll: true,
        });
    }

    return (
        <div className="space-y-6">
            <Heading title={title} description={description} />

            <form onSubmit={submit} className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Issuance header</CardTitle>
                        <CardDescription>
                            Record which warehouse released the stock and which
                            operational record received it.
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                        <div className="grid gap-2">
                            <Label htmlFor="issuance_no">Issuance no.</Label>
                            <Input
                                id="issuance_no"
                                value={form.data.issuance_no}
                                onChange={(event) =>
                                    form.setData(
                                        'issuance_no',
                                        event.currentTarget.value,
                                    )
                                }
                            />
                            <InputError message={form.errors.issuance_no} />
                        </div>

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
                            <Label htmlFor="issued_date">Issued date</Label>
                            <Input
                                id="issued_date"
                                type="date"
                                value={form.data.issued_date}
                                onChange={(event) =>
                                    form.setData(
                                        'issued_date',
                                        event.currentTarget.value,
                                    )
                                }
                            />
                            <InputError message={form.errors.issued_date} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="project_id">Project</Label>
                            <SelectInput
                                id="project_id"
                                value={form.data.project_id}
                                onChange={(event) =>
                                    form.setData(
                                        'project_id',
                                        event.currentTarget.value,
                                    )
                                }
                                className="h-9 rounded-md border border-input bg-transparent px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                            >
                                <option value="">No project selected</option>
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
                                className="h-9 rounded-md border border-input bg-transparent px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                            >
                                <option value="">No work order selected</option>
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
                                value={form.data.remarks}
                                onChange={(event) =>
                                    form.setData(
                                        'remarks',
                                        event.currentTarget.value,
                                    )
                                }
                                rows={3}
                                placeholder="Optional issuance notes or supporting details."
                            />
                            <InputError message={form.errors.remarks} />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <CardTitle>Issued items</CardTitle>
                            <CardDescription>
                                Add each inventory line being issued. Validation
                                will stop the entry if the warehouse balance is
                                insufficient.
                            </CardDescription>
                        </div>

                        <Button
                            type="button"
                            variant="outline"
                            onClick={addItem}
                        >
                            Add line
                        </Button>
                    </CardHeader>

                    <CardContent className="space-y-4">
                        {form.data.items.map((item, index) => (
                            <div
                                key={index}
                                className="grid gap-4 rounded-lg border p-4 md:grid-cols-[2fr_0.8fr_1.2fr_auto]"
                            >
                                <div className="grid gap-2">
                                    <Label
                                        htmlFor={`items.${index}.inventory_item_id`}
                                    >
                                        Inventory item
                                    </Label>
                                    <SelectInput
                                        id={`items.${index}.inventory_item_id`}
                                        value={item.inventory_item_id}
                                        onChange={(event) =>
                                            updateItem(
                                                index,
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
                                        message={
                                            form.errors[
                                                `items.${index}.inventory_item_id`
                                            ]
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
                                        placeholder="Optional"
                                    />
                                    <InputError
                                        message={
                                            form.errors[
                                                `items.${index}.remarks`
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
                            </div>
                        ))}
                    </CardContent>
                </Card>

                <div className="flex flex-col gap-3 md:flex-row md:justify-end">
                    <Button variant="outline" asChild>
                        <Link href={cancelHref}>Cancel</Link>
                    </Button>

                    <Button disabled={form.processing}>
                        {form.processing
                            ? 'Recording issuance...'
                            : 'Record issuance'}
                    </Button>
                </div>
            </form>
        </div>
    );
}
