import { Head, Link } from '@inertiajs/react';
import { dashboard } from '@/routes';
import {
    index as purchaseReceiptsIndex,
    show as purchaseReceiptsShow,
} from '@/routes/purchase-receipts';
import { FilterSelect } from '@/components/filter-select';
import { DataTableCard } from '@/components/data-table-card';
import { IndexFiltersCard } from '@/components/index-filters-card';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { countActiveFilters } from '@/lib/utils';
import type {
    PaginatedData,
    PurchaseReceiptFilters,
    PurchaseReceiptListItem,
    SelectOption,
} from '@/types';

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
    const activeFilterCount = countActiveFilters(filters);

    return (
        <>
            <Head title="Purchase Receipts" />

            <div className="flex flex-1 flex-col gap-6 p-4">
                <div className="space-y-1">
                    <h1 className="text-2xl font-semibold tracking-tight">
                        Purchase Receipts
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Review received deliveries and the stock postings they
                        generated.
                    </p>
                </div>

                <IndexFiltersCard
                    action={purchaseReceiptsIndex()}
                    resetHref={purchaseReceiptsIndex()}
                    filters={filters}
                    description="Search by receipt number, PO number, supplier reference, supplier, or warehouse."
                    activeFilterCount={activeFilterCount}
                >
                    <Input
                        name="search"
                        defaultValue={filters.search}
                        placeholder="Search receipts"
                    />

                    <FilterSelect
                        name="supplier"
                        defaultValue={filters.supplier ?? ''}
                    >
                        <option value="">All suppliers</option>
                        {supplierOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </FilterSelect>

                    <FilterSelect
                        name="warehouse"
                        defaultValue={filters.warehouse ?? ''}
                    >
                        <option value="">All warehouses</option>
                        {warehouseOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </FilterSelect>
                </IndexFiltersCard>

                <DataTableCard
                    title="Receipt registry"
                    description={`${purchaseReceipts.total} receipt records`}
                    pagination={purchaseReceipts}
                >
                    <table className="min-w-full text-sm">
                        <thead>
                            <tr className="border-b text-left text-muted-foreground">
                                <th className="px-6 py-3 font-medium">
                                    Receipt
                                </th>
                                <th className="px-6 py-3 font-medium">
                                    PO / supplier
                                </th>
                                <th className="px-6 py-3 font-medium">
                                    Warehouse
                                </th>
                                <th className="px-6 py-3 font-medium">
                                    Quantity
                                </th>
                                <th className="px-6 py-3 font-medium">
                                    Received by
                                </th>
                                <th className="px-6 py-3 text-right font-medium">
                                    Actions
                                </th>
                            </tr>
                        </thead>

                        <tbody>
                            {purchaseReceipts.data.length === 0 && (
                                <tr>
                                    <td
                                        colSpan={6}
                                        className="px-6 py-10 text-center text-muted-foreground"
                                    >
                                        No purchase receipts matched the current
                                        filters.
                                    </td>
                                </tr>
                            )}

                            {purchaseReceipts.data.map((purchaseReceipt) => (
                                <tr
                                    key={purchaseReceipt.id}
                                    className="border-b align-top last:border-0"
                                >
                                    <td className="px-6 py-4">
                                        <div className="space-y-1">
                                            <p className="font-medium">
                                                {purchaseReceipt.receipt_no}
                                            </p>
                                            <p className="text-muted-foreground">
                                                {purchaseReceipt.received_date ??
                                                    'No date'}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {purchaseReceipt.supplier_reference ??
                                                    'No supplier reference'}
                                            </p>
                                        </div>
                                    </td>

                                    <td className="px-6 py-4 text-muted-foreground">
                                        <div className="space-y-1">
                                            <p>
                                                {purchaseReceipt.purchase_order
                                                    .po_no ?? 'No PO linked'}
                                            </p>
                                            <p>
                                                {purchaseReceipt.supplier
                                                    .company_name
                                                    ? `${purchaseReceipt.supplier.supplier_code} - ${purchaseReceipt.supplier.company_name}`
                                                    : 'No supplier'}
                                            </p>
                                        </div>
                                    </td>

                                    <td className="px-6 py-4 text-muted-foreground">
                                        <div className="space-y-1">
                                            <p>
                                                {
                                                    purchaseReceipt.warehouse
                                                        .warehouse_code
                                                }
                                            </p>
                                            <p>
                                                {
                                                    purchaseReceipt.warehouse
                                                        .warehouse_name
                                                }
                                            </p>
                                        </div>
                                    </td>

                                    <td className="px-6 py-4 text-muted-foreground">
                                        <div className="space-y-1">
                                            <p>
                                                {
                                                    purchaseReceipt.received_quantity_total
                                                }{' '}
                                                total
                                            </p>
                                            <p>
                                                {purchaseReceipt.item_count}{' '}
                                                items
                                            </p>
                                        </div>
                                    </td>

                                    <td className="px-6 py-4 text-muted-foreground">
                                        {purchaseReceipt.received_by ??
                                            'Not recorded'}
                                    </td>

                                    <td className="px-6 py-4">
                                        <div className="flex justify-end gap-2">
                                            {purchaseReceipt.can.view && (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    asChild
                                                >
                                                    <Link
                                                        href={purchaseReceiptsShow(
                                                            purchaseReceipt.id,
                                                        )}
                                                    >
                                                        Open
                                                    </Link>
                                                </Button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </DataTableCard>
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
