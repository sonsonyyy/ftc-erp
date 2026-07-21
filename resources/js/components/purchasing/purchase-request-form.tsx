import type { InertiaLinkProps } from '@inertiajs/react';
import { Link, useForm } from '@inertiajs/react';
import PurchaseRequestController from '@/actions/App/Http/Controllers/Purchasing/PurchaseRequestController';
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
import type {
    PurchaseRequestDetail,
    PurchaseRequestFormDefaults,
    PurchaseRequestLineInput,
    PurchasingItemOption,
    PurchasingWorkOrderOption,
    SelectOption,
} from '@/types';

type Props = {
    purchaseRequest?: PurchaseRequestDetail;
    supplierOptions: SelectOption[];
    projectOptions: SelectOption[];
    workOrderOptions: PurchasingWorkOrderOption[];
    itemOptions: PurchasingItemOption[];
    statusOptions: SelectOption[];
    defaults?: PurchaseRequestFormDefaults;
    title: string;
    description: string;
    cancelHref: NonNullable<InertiaLinkProps['href']>;
};

export function PurchaseRequestForm({
    purchaseRequest,
    supplierOptions,
    projectOptions,
    workOrderOptions,
    itemOptions,
    statusOptions,
    defaults,
    title,
    description,
    cancelHref,
}: Props) {
    const form = useForm({
        request_no: purchaseRequest?.request_no ?? defaults?.request_no ?? '',
        supplier_id: purchaseRequest?.supplier_id
            ? String(purchaseRequest.supplier_id)
            : defaults?.supplier_id
              ? String(defaults.supplier_id)
              : '',
        project_id: purchaseRequest?.project_id
            ? String(purchaseRequest.project_id)
            : defaults?.project_id
              ? String(defaults.project_id)
              : '',
        work_order_id: purchaseRequest?.work_order_id
            ? String(purchaseRequest.work_order_id)
            : defaults?.work_order_id
              ? String(defaults.work_order_id)
              : '',
        request_date:
            purchaseRequest?.request_date ?? defaults?.request_date ?? '',
        needed_by: purchaseRequest?.needed_by ?? '',
        status:
            purchaseRequest?.status ??
            defaults?.status ??
            String(statusOptions[0]?.value ?? 'draft'),
        purpose: purchaseRequest?.purpose ?? '',
        remarks: purchaseRequest?.remarks ?? '',
        items:
            purchaseRequest?.items?.map((item) => ({
                inventory_item_id: String(item.inventory_item_id),
                requested_quantity: String(item.requested_quantity),
                estimated_unit_cost:
                    item.estimated_unit_cost === null
                        ? ''
                        : String(item.estimated_unit_cost),
                remarks: item.remarks ?? '',
            })) ??
            ([
                {
                    inventory_item_id: '',
                    requested_quantity: '',
                    estimated_unit_cost: '',
                    remarks: '',
                },
            ] as PurchaseRequestLineInput[]),
    });

    function updateItem(
        index: number,
        key: keyof PurchaseRequestLineInput,
        value: string,
    ) {
        form.setData(
            'items',
            form.data.items.map((item, itemIndex) => {
                if (itemIndex !== index) {
                    return item;
                }

                const nextItem = {
                    ...item,
                    [key]: value,
                };

                if (key === 'inventory_item_id') {
                    const selectedItem = itemOptions.find(
                        (option) => String(option.value) === value,
                    );

                    if (
                        selectedItem &&
                        nextItem.estimated_unit_cost === '' &&
                        selectedItem.standard_cost !== null
                    ) {
                        nextItem.estimated_unit_cost = String(
                            selectedItem.standard_cost,
                        );
                    }
                }

                return nextItem;
            }),
        );
    }

    function addItem() {
        form.setData('items', [
            ...form.data.items,
            {
                inventory_item_id: '',
                requested_quantity: '',
                estimated_unit_cost: '',
                remarks: '',
            },
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
            request_no: data.request_no,
            supplier_id:
                data.supplier_id === '' ? null : Number(data.supplier_id),
            project_id: data.project_id === '' ? null : Number(data.project_id),
            work_order_id:
                data.work_order_id === '' ? null : Number(data.work_order_id),
            request_date: data.request_date,
            needed_by: data.needed_by || null,
            status: data.status,
            purpose: data.purpose,
            remarks: data.remarks || null,
            items: data.items.map((item) => ({
                inventory_item_id: Number(item.inventory_item_id),
                requested_quantity: Number(item.requested_quantity),
                estimated_unit_cost:
                    item.estimated_unit_cost === ''
                        ? null
                        : Number(item.estimated_unit_cost),
                remarks: item.remarks || null,
            })),
        }));

        if (purchaseRequest) {
            form.submit(PurchaseRequestController.update(purchaseRequest.id), {
                preserveScroll: true,
            });

            return;
        }

        form.submit(PurchaseRequestController.store(), {
            preserveScroll: true,
        });
    }

    return (
        <div className="space-y-6">
            <Heading title={title} description={description} />

            <form onSubmit={submit} className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Request header</CardTitle>
                        <CardDescription>
                            Capture the sourcing context and link the request
                            back to the supplier, project, or work order when
                            available.
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                        <div className="grid gap-2">
                            <Label htmlFor="request_no">Request no.</Label>
                            <Input
                                id="request_no"
                                value={form.data.request_no}
                                onChange={(event) =>
                                    form.setData(
                                        'request_no',
                                        event.currentTarget.value,
                                    )
                                }
                            />
                            <InputError message={form.errors.request_no} />
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
                            <Label htmlFor="request_date">Request date</Label>
                            <Input
                                id="request_date"
                                type="date"
                                value={form.data.request_date}
                                onChange={(event) =>
                                    form.setData(
                                        'request_date',
                                        event.currentTarget.value,
                                    )
                                }
                            />
                            <InputError message={form.errors.request_date} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="supplier_id">
                                Preferred supplier
                            </Label>
                            <SelectInput
                                id="supplier_id"
                                value={form.data.supplier_id}
                                onChange={(event) =>
                                    form.setData(
                                        'supplier_id',
                                        event.currentTarget.value,
                                    )
                                }
                                className="h-9 rounded-md border border-input bg-transparent px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                            >
                                <option value="">No supplier selected</option>
                                {supplierOptions.map((option) => (
                                    <option
                                        key={option.value}
                                        value={option.value}
                                    >
                                        {option.label}
                                    </option>
                                ))}
                            </SelectInput>
                            <InputError message={form.errors.supplier_id} />
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

                        <div className="grid gap-2 xl:col-span-1">
                            <Label htmlFor="needed_by">Needed by</Label>
                            <Input
                                id="needed_by"
                                type="date"
                                value={form.data.needed_by}
                                onChange={(event) =>
                                    form.setData(
                                        'needed_by',
                                        event.currentTarget.value,
                                    )
                                }
                            />
                            <InputError message={form.errors.needed_by} />
                        </div>

                        <div className="grid gap-2 md:col-span-2 xl:col-span-2">
                            <Label htmlFor="purpose">Purpose</Label>
                            <Input
                                id="purpose"
                                value={form.data.purpose}
                                onChange={(event) =>
                                    form.setData(
                                        'purpose',
                                        event.currentTarget.value,
                                    )
                                }
                                placeholder="Reason for procurement"
                            />
                            <InputError message={form.errors.purpose} />
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
                                placeholder="Optional remarks, approval notes, or supplier guidance."
                            />
                            <InputError message={form.errors.remarks} />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <CardTitle>Requested items</CardTitle>
                            <CardDescription>
                                Add each item needed for procurement. Use
                                estimated unit cost when there is a current
                                buying guide or last price reference.
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
                                className="grid gap-4 rounded-lg border p-4 xl:grid-cols-[2fr_0.9fr_1fr_1.2fr_auto]"
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
                                    <Label
                                        htmlFor={`items.${index}.requested_quantity`}
                                    >
                                        Quantity
                                    </Label>
                                    <Input
                                        id={`items.${index}.requested_quantity`}
                                        type="number"
                                        min="0.01"
                                        step="0.01"
                                        value={item.requested_quantity}
                                        onChange={(event) =>
                                            updateItem(
                                                index,
                                                'requested_quantity',
                                                event.currentTarget.value,
                                            )
                                        }
                                    />
                                    <InputError
                                        message={
                                            form.errors[
                                                `items.${index}.requested_quantity`
                                            ]
                                        }
                                    />
                                </div>

                                <div className="grid gap-2">
                                    <Label
                                        htmlFor={`items.${index}.estimated_unit_cost`}
                                    >
                                        Est. unit cost
                                    </Label>
                                    <Input
                                        id={`items.${index}.estimated_unit_cost`}
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={item.estimated_unit_cost}
                                        onChange={(event) =>
                                            updateItem(
                                                index,
                                                'estimated_unit_cost',
                                                event.currentTarget.value,
                                            )
                                        }
                                        placeholder="Optional"
                                    />
                                    <InputError
                                        message={
                                            form.errors[
                                                `items.${index}.estimated_unit_cost`
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

                <Card className="h-fit">
                    <CardHeader>
                        <CardTitle>Actions</CardTitle>
                        <CardDescription>
                            Save the request now. Supplier files and generated
                            purchase orders can be managed from the detail page.
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                        <Button type="button" variant="outline" asChild>
                            <Link href={cancelHref}>Cancel</Link>
                        </Button>

                        <Button disabled={form.processing}>
                            {form.processing
                                ? 'Saving...'
                                : purchaseRequest
                                  ? 'Update request'
                                  : 'Create request'}
                        </Button>
                    </CardContent>
                </Card>
            </form>
        </div>
    );
}
