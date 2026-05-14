import type { InertiaLinkProps } from '@inertiajs/react';
import { Link, useForm } from '@inertiajs/react';
import PurchaseReceiptController from '@/actions/App/Http/Controllers/Purchasing/PurchaseReceiptController';
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
    PurchaseReceiptFormDefaults,
    PurchaseReceiptLineInput,
    PurchaseReceiptSourceOrder,
    SelectOption,
} from '@/types';
import { SelectInput } from '@/components/ui/select-input';

type Props = {
    purchaseOrder: PurchaseReceiptSourceOrder;
    warehouseOptions: SelectOption[];
    defaults: PurchaseReceiptFormDefaults;
    title: string;
    description: string;
    cancelHref: NonNullable<InertiaLinkProps['href']>;
};

export function PurchaseReceiptForm({
    purchaseOrder,
    warehouseOptions,
    defaults,
    title,
    description,
    cancelHref,
}: Props) {
    const form = useForm({
        receipt_no: defaults.receipt_no,
        warehouse_id: '',
        received_date: defaults.received_date,
        supplier_reference: defaults.supplier_reference ?? '',
        remarks: '',
        items: purchaseOrder.items.map((item) => ({
            purchase_order_item_id: String(item.purchase_order_item_id),
            received_quantity: String(item.remaining_quantity),
            remarks: '',
        })) as PurchaseReceiptLineInput[],
    });

    function updateItem(
        index: number,
        key: keyof PurchaseReceiptLineInput,
        value: string,
    ) {
        form.setData(
            'items',
            form.data.items.map((item, itemIndex) =>
                itemIndex === index ? { ...item, [key]: value } : item,
            ),
        );
    }

    function submit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

        form.transform((data) => ({
            receipt_no: data.receipt_no,
            warehouse_id: Number(data.warehouse_id),
            received_date: data.received_date,
            supplier_reference: data.supplier_reference || null,
            remarks: data.remarks || null,
            items: data.items.map((item) => ({
                purchase_order_item_id: Number(item.purchase_order_item_id),
                received_quantity: Number(item.received_quantity),
                remarks: item.remarks || null,
            })),
        }));

        form.submit(PurchaseReceiptController.store(purchaseOrder.id), {
            preserveScroll: true,
        });
    }

    return (
        <div className="space-y-6">
            <Heading title={title} description={description} />

            <form onSubmit={submit} className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Receipt header</CardTitle>
                        <CardDescription>
                            Record where the stock was received and keep the
                            supplier reference tied to the same delivery.
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                        <div className="grid gap-2">
                            <Label htmlFor="receipt_no">Receipt no.</Label>
                            <Input
                                id="receipt_no"
                                value={form.data.receipt_no}
                                onChange={(event) =>
                                    form.setData(
                                        'receipt_no',
                                        event.currentTarget.value,
                                    )
                                }
                            />
                            <InputError message={form.errors.receipt_no} />
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
                            <Label htmlFor="received_date">Received date</Label>
                            <Input
                                id="received_date"
                                type="date"
                                value={form.data.received_date}
                                onChange={(event) =>
                                    form.setData(
                                        'received_date',
                                        event.currentTarget.value,
                                    )
                                }
                            />
                            <InputError message={form.errors.received_date} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="supplier_reference">
                                Supplier reference
                            </Label>
                            <Input
                                id="supplier_reference"
                                value={form.data.supplier_reference}
                                onChange={(event) =>
                                    form.setData(
                                        'supplier_reference',
                                        event.currentTarget.value,
                                    )
                                }
                                placeholder="DR / SI / supplier delivery reference"
                            />
                            <InputError
                                message={form.errors.supplier_reference}
                            />
                        </div>

                        <div className="grid gap-2 md:col-span-2 xl:col-span-2">
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
                                placeholder="Optional receiving remarks or delivery notes."
                            />
                            <InputError message={form.errors.remarks} />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Received items</CardTitle>
                        <CardDescription>
                            Enter the actual quantity received for each line.
                            The system will update warehouse stock and the
                            purchase-order receipt progress.
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-4">
                        {purchaseOrder.items.map((item, index) => (
                            <div
                                key={item.purchase_order_item_id}
                                className="grid gap-4 rounded-lg border p-4 xl:grid-cols-[2fr_0.9fr_0.9fr_1.2fr]"
                            >
                                <div className="space-y-1">
                                    <p className="font-medium">
                                        {item.inventory_item.item_code} -{' '}
                                        {item.inventory_item.item_name}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        Ordered: {item.ordered_quantity}{' '}
                                        {item.unit}
                                        {' • '}Already received:{' '}
                                        {item.received_quantity_total}{' '}
                                        {item.unit}
                                        {' • '}Remaining:{' '}
                                        {item.remaining_quantity} {item.unit}
                                    </p>
                                </div>

                                <div className="grid gap-2">
                                    <Label
                                        htmlFor={`items.${index}.received_quantity`}
                                    >
                                        Received qty
                                    </Label>
                                    <Input
                                        id={`items.${index}.received_quantity`}
                                        type="number"
                                        min="0.01"
                                        step="0.01"
                                        value={
                                            form.data.items[index]
                                                ?.received_quantity ?? ''
                                        }
                                        onChange={(event) =>
                                            updateItem(
                                                index,
                                                'received_quantity',
                                                event.currentTarget.value,
                                            )
                                        }
                                    />
                                    <InputError
                                        message={
                                            form.errors[
                                                `items.${index}.received_quantity`
                                            ]
                                        }
                                    />
                                </div>

                                <div className="grid gap-2">
                                    <Label>Unit cost</Label>
                                    <Input
                                        value={String(item.unit_cost)}
                                        readOnly
                                    />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor={`items.${index}.remarks`}>
                                        Line remarks
                                    </Label>
                                    <Input
                                        id={`items.${index}.remarks`}
                                        value={
                                            form.data.items[index]?.remarks ??
                                            ''
                                        }
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
                            </div>
                        ))}
                    </CardContent>
                </Card>

                <Card className="h-fit">
                    <CardHeader>
                        <CardTitle>Actions</CardTitle>
                        <CardDescription>
                            Save the receipt now to post the stock-in movement
                            and update the purchase-order progress.
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                        <Button type="button" variant="outline" asChild>
                            <Link href={cancelHref}>Cancel</Link>
                        </Button>

                        <Button disabled={form.processing}>
                            {form.processing
                                ? 'Recording...'
                                : 'Record receipt'}
                        </Button>
                    </CardContent>
                </Card>
            </form>
        </div>
    );
}
