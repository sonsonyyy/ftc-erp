import { Form, Head, Link } from '@inertiajs/react';
import { dashboard } from '@/routes';
import { index as purchaseReceiptsIndex, show as purchaseReceiptsShow } from '@/routes/purchase-receipts';
import { PaginationLinks } from '@/components/pagination-links';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import type { PaginatedData, PurchaseReceiptFilters, PurchaseReceiptListItem, SelectOption } from '@/types';

type Props = {
    purchaseReceipts: PaginatedData<PurchaseReceiptListItem>;
    filters: PurchaseReceiptFilters;
    supplierOptions: SelectOption[];
    warehouseOptions: SelectOption[];
};

export default function PurchaseReceiptsIndex({
    purchaseReceipts,
    filters,
    supplierOptions,
    warehouseOptions,
}: Props) {
    return (
        <>
            <Head title="Purchase Receipts" />

            <div className="flex flex-1 flex-col gap-6 p-4">
                <div className="space-y-1">
                    <h1 className="text-2xl font-semibold tracking-tight">Purchase Receipts</h1>
                    <p className="text-sm text-muted-foreground">
                        Review received deliveries and the stock postings they generated.
                    </p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Filters</CardTitle>
                        <CardDescription>
                            Search by receipt number, PO number, supplier reference, supplier, or warehouse.
                        </CardDescription>
                    </CardHeader>

                    <CardContent>
                        <Form
                            action={purchaseReceiptsIndex()}
                            method="get"
                            options={{ preserveState: true, replace: true }}
                            className="grid gap-3 xl:grid-cols-[2fr_1.2fr_1.2fr_auto_auto]"
                        >
                            <Input
                                name="search"
                                defaultValue={filters.search}
                                placeholder="Search receipts"
                            />

                            <select
                                name="supplier"
                                defaultValue={filters.supplier ?? ''}
                                className="border-input focus-visible:border-ring focus-visible:ring-ring/50 h-9 rounded-md border bg-transparent px-3 text-sm outline-none focus-visible:ring-[3px]"
                            >
                                <option value="">All suppliers</option>
                                {supplierOptions.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>

                            <select
                                name="warehouse"
                                defaultValue={filters.warehouse ?? ''}
                                className="border-input focus-visible:border-ring focus-visible:ring-ring/50 h-9 rounded-md border bg-transparent px-3 text-sm outline-none focus-visible:ring-[3px]"
                            >
                                <option value="">All warehouses</option>
                                {warehouseOptions.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>

                            <Button type="submit">Apply</Button>

                            <Button variant="outline" asChild>
                                <Link href={purchaseReceiptsIndex()}>Reset</Link>
                            </Button>
                        </Form>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Receipt registry</CardTitle>
                        <CardDescription>{purchaseReceipts.total} receipt records</CardDescription>
                    </CardHeader>

                    <CardContent className="overflow-x-auto px-0">
                        <table className="min-w-full text-sm">
                            <thead>
                                <tr className="border-b text-left text-muted-foreground">
                                    <th className="px-6 py-3 font-medium">Receipt</th>
                                    <th className="px-6 py-3 font-medium">PO / supplier</th>
                                    <th className="px-6 py-3 font-medium">Warehouse</th>
                                    <th className="px-6 py-3 font-medium">Quantity</th>
                                    <th className="px-6 py-3 font-medium">Received by</th>
                                    <th className="px-6 py-3 font-medium text-right">Actions</th>
                                </tr>
                            </thead>

                            <tbody>
                                {purchaseReceipts.data.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-10 text-center text-muted-foreground">
                                            No purchase receipts matched the current filters.
                                        </td>
                                    </tr>
                                )}

                                {purchaseReceipts.data.map((purchaseReceipt) => (
                                    <tr key={purchaseReceipt.id} className="border-b align-top last:border-0">
                                        <td className="px-6 py-4">
                                            <div className="space-y-1">
                                                <p className="font-medium">{purchaseReceipt.receipt_no}</p>
                                                <p className="text-muted-foreground">
                                                    {purchaseReceipt.received_date ?? 'No date'}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    {purchaseReceipt.supplier_reference ?? 'No supplier reference'}
                                                </p>
                                            </div>
                                        </td>

                                        <td className="px-6 py-4 text-muted-foreground">
                                            <div className="space-y-1">
                                                <p>{purchaseReceipt.purchase_order.po_no ?? 'No PO linked'}</p>
                                                <p>
                                                    {purchaseReceipt.supplier.company_name
                                                        ? `${purchaseReceipt.supplier.supplier_code} - ${purchaseReceipt.supplier.company_name}`
                                                        : 'No supplier'}
                                                </p>
                                            </div>
                                        </td>

                                        <td className="px-6 py-4 text-muted-foreground">
                                            <div className="space-y-1">
                                                <p>{purchaseReceipt.warehouse.warehouse_code}</p>
                                                <p>{purchaseReceipt.warehouse.warehouse_name}</p>
                                            </div>
                                        </td>

                                        <td className="px-6 py-4 text-muted-foreground">
                                            <div className="space-y-1">
                                                <p>{purchaseReceipt.received_quantity_total} total</p>
                                                <p>{purchaseReceipt.item_count} items</p>
                                            </div>
                                        </td>

                                        <td className="px-6 py-4 text-muted-foreground">
                                            {purchaseReceipt.received_by ?? 'Not recorded'}
                                        </td>

                                        <td className="px-6 py-4">
                                            <div className="flex justify-end gap-2">
                                                {purchaseReceipt.can.view && (
                                                    <Button variant="outline" size="sm" asChild>
                                                        <Link href={purchaseReceiptsShow(purchaseReceipt.id)}>Open</Link>
                                                    </Button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </CardContent>

                    <PaginationLinks pagination={purchaseReceipts} />
                </Card>
            </div>
        </>
    );
}

PurchaseReceiptsIndex.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: dashboard() },
        { title: 'Purchase Receipts', href: purchaseReceiptsIndex() },
    ],
};
