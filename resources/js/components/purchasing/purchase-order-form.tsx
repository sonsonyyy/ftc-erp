import type { InertiaLinkProps } from '@inertiajs/react';
import { Link, useForm } from '@inertiajs/react';
import PurchaseOrderController from '@/actions/App/Http/Controllers/Purchasing/PurchaseOrderController';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type {
    PurchaseOrderDetail,
    PurchaseOrderFormDefaults,
    PurchaseOrderLineInput,
    PurchaseOrderRequestOption,
    PurchasingItemOption,
    PurchasingWorkOrderOption,
    SelectOption,
} from '@/types';

type Props = {
    purchaseOrder?: PurchaseOrderDetail;
    supplierOptions: SelectOption[];
    purchaseRequestOptions: PurchaseOrderRequestOption[];
    projectOptions: SelectOption[];
    workOrderOptions: PurchasingWorkOrderOption[];
    itemOptions: PurchasingItemOption[];
    statusOptions: SelectOption[];
    defaults?: PurchaseOrderFormDefaults;
    title: string;
    description: string;
    cancelHref: NonNullable<InertiaLinkProps['href']>;
};

function blankLine(): PurchaseOrderLineInput {
    return {
        purchase_request_item_id: '',
        inventory_item_id: '',
        ordered_quantity: '',
        unit_cost: '',
        remarks: '',
    };
}

export function PurchaseOrderForm({
    purchaseOrder,
    supplierOptions,
    purchaseRequestOptions,
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
        po_no: purchaseOrder?.po_no ?? defaults?.po_no ?? '',
        purchase_request_id: purchaseOrder?.purchase_request.id ? String(purchaseOrder.purchase_request.id) : defaults?.purchase_request_id ? String(defaults.purchase_request_id) : '',
        supplier_id: purchaseOrder?.supplier_id ? String(purchaseOrder.supplier_id) : defaults?.supplier_id ? String(defaults.supplier_id) : '',
        project_id: purchaseOrder?.project_id ? String(purchaseOrder.project_id) : defaults?.project_id ? String(defaults.project_id) : '',
        work_order_id: purchaseOrder?.work_order_id ? String(purchaseOrder.work_order_id) : defaults?.work_order_id ? String(defaults.work_order_id) : '',
        order_date: purchaseOrder?.order_date ?? defaults?.order_date ?? '',
        expected_date: purchaseOrder?.expected_date ?? '',
        status: purchaseOrder?.status ?? defaults?.status ?? String(statusOptions[0]?.value ?? 'draft'),
        supplier_reference: purchaseOrder?.supplier_reference ?? '',
        remarks: purchaseOrder?.remarks ?? '',
        items: purchaseOrder?.items?.map((item) => ({
            purchase_request_item_id: item.purchase_request_item_id ? String(item.purchase_request_item_id) : '',
            inventory_item_id: String(item.inventory_item_id),
            ordered_quantity: String(item.ordered_quantity),
            unit_cost: String(item.unit_cost),
            remarks: item.remarks ?? '',
        })) ?? (defaults?.items.length
            ? defaults.items.map((item) => ({
                  purchase_request_item_id: String(item.purchase_request_item_id),
                  inventory_item_id: String(item.inventory_item_id),
                  ordered_quantity: String(item.ordered_quantity),
                  unit_cost: String(item.unit_cost),
                  remarks: item.remarks ?? '',
              }))
            : [blankLine()]),
    });

    function updateItem(index: number, key: keyof PurchaseOrderLineInput, value: string) {
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
                    const selectedItem = itemOptions.find((option) => String(option.value) === value);

                    if (selectedItem && nextItem.unit_cost === '' && selectedItem.standard_cost !== null) {
                        nextItem.unit_cost = String(selectedItem.standard_cost);
                    }
                }

                return nextItem;
            }),
        );
    }

    function addItem() {
        form.setData('items', [...form.data.items, blankLine()]);
    }

    function removeItem(index: number) {
        form.setData(
            'items',
            form.data.items.filter((_, itemIndex) => itemIndex !== index),
        );
    }

    function handlePurchaseRequestChange(value: string) {
        form.setData('purchase_request_id', value);

        const purchaseRequest = purchaseRequestOptions.find((option) => String(option.value) === value);

        if (!purchaseRequest) {
            return;
        }

        if (purchaseRequest.supplier_id) {
            form.setData('supplier_id', String(purchaseRequest.supplier_id));
        }

        form.setData('project_id', purchaseRequest.project_id ? String(purchaseRequest.project_id) : '');
        form.setData('work_order_id', purchaseRequest.work_order_id ? String(purchaseRequest.work_order_id) : '');

        form.setData(
            'items',
            purchaseRequest.items.length > 0
                ? purchaseRequest.items.map((item) => ({
                      purchase_request_item_id: String(item.purchase_request_item_id),
                      inventory_item_id: String(item.inventory_item_id),
                      ordered_quantity: String(item.ordered_quantity),
                      unit_cost: String(item.unit_cost),
                      remarks: item.remarks ?? '',
                  }))
                : [blankLine()],
        );
    }

    function handleWorkOrderChange(value: string) {
        form.setData('work_order_id', value);

        const workOrder = workOrderOptions.find((option) => String(option.value) === value);

        if (workOrder?.project_id) {
            form.setData('project_id', String(workOrder.project_id));
        }
    }

    function submit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

        form.transform((data) => ({
            po_no: data.po_no,
            purchase_request_id: data.purchase_request_id === '' ? null : Number(data.purchase_request_id),
            supplier_id: Number(data.supplier_id),
            project_id: data.project_id === '' ? null : Number(data.project_id),
            work_order_id: data.work_order_id === '' ? null : Number(data.work_order_id),
            order_date: data.order_date,
            expected_date: data.expected_date || null,
            status: data.status,
            supplier_reference: data.supplier_reference || null,
            remarks: data.remarks || null,
            items: data.items.map((item) => ({
                purchase_request_item_id: item.purchase_request_item_id === '' ? null : Number(item.purchase_request_item_id),
                inventory_item_id: Number(item.inventory_item_id),
                ordered_quantity: Number(item.ordered_quantity),
                unit_cost: Number(item.unit_cost),
                remarks: item.remarks || null,
            })),
        }));

        if (purchaseOrder) {
            form.submit(PurchaseOrderController.update(purchaseOrder.id), {
                preserveScroll: true,
            });

            return;
        }

        form.submit(PurchaseOrderController.store(), {
            preserveScroll: true,
        });
    }

    return (
        <div className="space-y-6">
            <Heading title={title} description={description} />

            <form onSubmit={submit} className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Order header</CardTitle>
                        <CardDescription>
                            Capture the supplier, linked request, and delivery expectation before receiving begins.
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                        <div className="grid gap-2">
                            <Label htmlFor="po_no">PO no.</Label>
                            <Input
                                id="po_no"
                                value={form.data.po_no}
                                onChange={(event) => form.setData('po_no', event.currentTarget.value)}
                            />
                            <InputError message={form.errors.po_no} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="status">Status</Label>
                            <select
                                id="status"
                                value={form.data.status}
                                onChange={(event) => form.setData('status', event.currentTarget.value)}
                                className="border-input focus-visible:border-ring focus-visible:ring-ring/50 h-9 rounded-md border bg-transparent px-3 text-sm outline-none focus-visible:ring-[3px]"
                            >
                                {statusOptions.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                            <InputError message={form.errors.status} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="order_date">Order date</Label>
                            <Input
                                id="order_date"
                                type="date"
                                value={form.data.order_date}
                                onChange={(event) => form.setData('order_date', event.currentTarget.value)}
                            />
                            <InputError message={form.errors.order_date} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="purchase_request_id">Linked purchase request</Label>
                            <select
                                id="purchase_request_id"
                                value={form.data.purchase_request_id}
                                onChange={(event) => handlePurchaseRequestChange(event.currentTarget.value)}
                                className="border-input focus-visible:border-ring focus-visible:ring-ring/50 h-9 rounded-md border bg-transparent px-3 text-sm outline-none focus-visible:ring-[3px]"
                            >
                                <option value="">No linked request</option>
                                {purchaseRequestOptions.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                            <InputError message={form.errors.purchase_request_id} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="supplier_id">Supplier</Label>
                            <select
                                id="supplier_id"
                                value={form.data.supplier_id}
                                onChange={(event) => form.setData('supplier_id', event.currentTarget.value)}
                                className="border-input focus-visible:border-ring focus-visible:ring-ring/50 h-9 rounded-md border bg-transparent px-3 text-sm outline-none focus-visible:ring-[3px]"
                            >
                                <option value="">Select supplier</option>
                                {supplierOptions.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                            <InputError message={form.errors.supplier_id} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="expected_date">Expected date</Label>
                            <Input
                                id="expected_date"
                                type="date"
                                value={form.data.expected_date}
                                onChange={(event) => form.setData('expected_date', event.currentTarget.value)}
                            />
                            <InputError message={form.errors.expected_date} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="project_id">Project</Label>
                            <select
                                id="project_id"
                                value={form.data.project_id}
                                onChange={(event) => form.setData('project_id', event.currentTarget.value)}
                                className="border-input focus-visible:border-ring focus-visible:ring-ring/50 h-9 rounded-md border bg-transparent px-3 text-sm outline-none focus-visible:ring-[3px]"
                            >
                                <option value="">No project selected</option>
                                {projectOptions.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                            <InputError message={form.errors.project_id} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="work_order_id">Work order</Label>
                            <select
                                id="work_order_id"
                                value={form.data.work_order_id}
                                onChange={(event) => handleWorkOrderChange(event.currentTarget.value)}
                                className="border-input focus-visible:border-ring focus-visible:ring-ring/50 h-9 rounded-md border bg-transparent px-3 text-sm outline-none focus-visible:ring-[3px]"
                            >
                                <option value="">No work order selected</option>
                                {workOrderOptions.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                            <InputError message={form.errors.work_order_id} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="supplier_reference">Supplier reference</Label>
                            <Input
                                id="supplier_reference"
                                value={form.data.supplier_reference}
                                onChange={(event) => form.setData('supplier_reference', event.currentTarget.value)}
                                placeholder="Supplier quote or reference no."
                            />
                            <InputError message={form.errors.supplier_reference} />
                        </div>

                        <div className="grid gap-2 md:col-span-2 xl:col-span-3">
                            <Label htmlFor="remarks">Remarks</Label>
                            <Textarea
                                id="remarks"
                                value={form.data.remarks}
                                onChange={(event) => form.setData('remarks', event.currentTarget.value)}
                                rows={3}
                                placeholder="Optional ordering notes, delivery expectations, or approval remarks."
                            />
                            <InputError message={form.errors.remarks} />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <CardTitle>Ordered items</CardTitle>
                            <CardDescription>
                                Encode each ordered line. If you select a purchase request, its current requested items will be pulled into the form.
                            </CardDescription>
                        </div>

                        <Button type="button" variant="outline" onClick={addItem}>
                            Add line
                        </Button>
                    </CardHeader>

                    <CardContent className="space-y-4">
                        {form.data.items.map((item, index) => (
                            <div key={index} className="grid gap-4 rounded-lg border p-4 xl:grid-cols-[2fr_0.9fr_0.9fr_1.2fr_auto]">
                                <div className="grid gap-2">
                                    <Label htmlFor={`items.${index}.inventory_item_id`}>Inventory item</Label>
                                    <select
                                        id={`items.${index}.inventory_item_id`}
                                        value={item.inventory_item_id}
                                        onChange={(event) => updateItem(index, 'inventory_item_id', event.currentTarget.value)}
                                        className="border-input focus-visible:border-ring focus-visible:ring-ring/50 h-9 rounded-md border bg-transparent px-3 text-sm outline-none focus-visible:ring-[3px]"
                                    >
                                        <option value="">Select item</option>
                                        {itemOptions.map((option) => (
                                            <option key={option.value} value={option.value}>
                                                {option.label}
                                            </option>
                                        ))}
                                    </select>
                                    <InputError message={form.errors[`items.${index}.inventory_item_id`]} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor={`items.${index}.ordered_quantity`}>Ordered qty</Label>
                                    <Input
                                        id={`items.${index}.ordered_quantity`}
                                        type="number"
                                        min="0.01"
                                        step="0.01"
                                        value={item.ordered_quantity}
                                        onChange={(event) => updateItem(index, 'ordered_quantity', event.currentTarget.value)}
                                    />
                                    <InputError message={form.errors[`items.${index}.ordered_quantity`]} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor={`items.${index}.unit_cost`}>Unit cost</Label>
                                    <Input
                                        id={`items.${index}.unit_cost`}
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={item.unit_cost}
                                        onChange={(event) => updateItem(index, 'unit_cost', event.currentTarget.value)}
                                    />
                                    <InputError message={form.errors[`items.${index}.unit_cost`]} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor={`items.${index}.remarks`}>Line remarks</Label>
                                    <Input
                                        id={`items.${index}.remarks`}
                                        value={item.remarks}
                                        onChange={(event) => updateItem(index, 'remarks', event.currentTarget.value)}
                                        placeholder="Optional"
                                    />
                                    <InputError message={form.errors[`items.${index}.remarks`]} />
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
                            Save the PO now. Receiving and attachment management happen from the detail page once the order is ready.
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                        <Button type="button" variant="outline" asChild>
                            <Link href={cancelHref}>Cancel</Link>
                        </Button>

                        <Button disabled={form.processing}>
                            {form.processing
                                ? 'Saving...'
                                : purchaseOrder
                                  ? 'Update purchase order'
                                  : 'Create purchase order'}
                        </Button>
                    </CardContent>
                </Card>
            </form>
        </div>
    );
}
