import { Head, router } from '@inertiajs/react';
import { ChevronDown, Eye, Search, SlidersHorizontal } from 'lucide-react';
import { useEffect, useState } from 'react';
import { CompactDataTable } from '@/components/compact-data-table';
import { DataTablePaginationFooter } from '@/components/data-table-pagination-footer';
import { DataTableRowActions } from '@/components/data-table-row-actions';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuSub,
    DropdownMenuSubContent,
    DropdownMenuSubTrigger,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { cleanQueryParams, toUrl } from '@/lib/utils';
import { dashboard } from '@/routes';
import {
    index as purchaseReceiptsIndex,
    show as purchaseReceiptsShow,
} from '@/routes/purchase-receipts';
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

const purchaseReceiptBreadcrumbs = [
    {
        title: 'Dashboard',
        href: dashboard(),
    },
    {
        title: 'Purchase Receipts',
        href: purchaseReceiptsIndex(),
    },
];

const perPageOptions = ['5', '10', '15', '25'];

export default function PurchaseReceiptsIndex({
    purchaseReceipts,
    filters,
    supplierOptions,
    warehouseOptions,
}: Props) {
    const [searchInput, setSearchInput] = useState(filters.search);
    const [tableFilters, setTableFilters] = useState({
        supplier: filters.supplier === null ? '' : String(filters.supplier),
        warehouse: filters.warehouse === null ? '' : String(filters.warehouse),
        per_page: String(filters.per_page),
    });

    useEffect(() => {
        setTableFilters((currentFilters) => {
            const nextFilters = {
                supplier:
                    filters.supplier === null ? '' : String(filters.supplier),
                warehouse:
                    filters.warehouse === null ? '' : String(filters.warehouse),
                per_page: String(filters.per_page),
            };

            if (
                currentFilters.supplier === nextFilters.supplier &&
                currentFilters.warehouse === nextFilters.warehouse &&
                currentFilters.per_page === nextFilters.per_page
            ) {
                return currentFilters;
            }

            return nextFilters;
        });
    }, [filters.per_page, filters.supplier, filters.warehouse]);

    useEffect(() => {
        const normalizedSearch = searchInput.trim();
        const currentSupplier =
            filters.supplier === null ? '' : String(filters.supplier);
        const currentWarehouse =
            filters.warehouse === null ? '' : String(filters.warehouse);
        const currentPerPage = String(filters.per_page);

        if (
            normalizedSearch === filters.search &&
            tableFilters.supplier === currentSupplier &&
            tableFilters.warehouse === currentWarehouse &&
            tableFilters.per_page === currentPerPage
        ) {
            return;
        }

        const timeout = window.setTimeout(() => {
            router.cancelAll();
            router.get(
                toUrl(purchaseReceiptsIndex()),
                cleanQueryParams({
                    search: normalizedSearch,
                    supplier:
                        tableFilters.supplier === ''
                            ? undefined
                            : Number(tableFilters.supplier),
                    warehouse:
                        tableFilters.warehouse === ''
                            ? undefined
                            : Number(tableFilters.warehouse),
                    per_page: Number(tableFilters.per_page),
                    page: 1,
                }),
                {
                    only: ['purchaseReceipts', 'filters'],
                    replace: true,
                    preserveState: true,
                    preserveScroll: true,
                },
            );
        }, 300);

        return () => window.clearTimeout(timeout);
    }, [
        filters.per_page,
        filters.search,
        filters.supplier,
        filters.warehouse,
        searchInput,
        tableFilters,
    ]);

    const activeFilterCount =
        (tableFilters.supplier === '' ? 0 : 1) +
        (tableFilters.warehouse === '' ? 0 : 1);

    return (
        <>
            <Head title="Purchase Receipts" />

            <div className="app-page flex flex-1 flex-col gap-6">
                <div className="space-y-1.5">
                    <h1 className="text-2xl font-semibold tracking-tight">
                        Purchase Receipts
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Received deliveries and resulting stock entries.
                    </p>
                </div>

                <div className="flex flex-col gap-3">
                    <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center">
                        <div className="relative w-full sm:max-w-sm">
                            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                value={searchInput}
                                onChange={(event) =>
                                    setSearchInput(event.currentTarget.value)
                                }
                                placeholder="Search receipts"
                                className="h-9 pl-9"
                            />
                        </div>

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-9 bg-background"
                                >
                                    <SlidersHorizontal />
                                    Filters
                                    {activeFilterCount > 0 && (
                                        <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary">
                                            {activeFilterCount}
                                        </span>
                                    )}
                                    <ChevronDown />
                                </Button>
                            </DropdownMenuTrigger>

                            <DropdownMenuContent align="start" className="w-56">
                                <DropdownMenuSub>
                                    <DropdownMenuSubTrigger>
                                        Supplier
                                    </DropdownMenuSubTrigger>
                                    <DropdownMenuSubContent className="max-h-80 w-80 overflow-y-auto">
                                        <DropdownMenuRadioGroup
                                            value={
                                                tableFilters.supplier === ''
                                                    ? 'all'
                                                    : tableFilters.supplier
                                            }
                                            onValueChange={(value) => {
                                                router.cancelAll();
                                                setTableFilters(
                                                    (currentFilters) => ({
                                                        ...currentFilters,
                                                        supplier:
                                                            value === 'all'
                                                                ? ''
                                                                : value,
                                                    }),
                                                );
                                            }}
                                        >
                                            <DropdownMenuRadioItem value="all">
                                                All suppliers
                                            </DropdownMenuRadioItem>
                                            {supplierOptions.map((option) => (
                                                <DropdownMenuRadioItem
                                                    key={option.value}
                                                    value={String(option.value)}
                                                >
                                                    {option.label}
                                                </DropdownMenuRadioItem>
                                            ))}
                                        </DropdownMenuRadioGroup>
                                    </DropdownMenuSubContent>
                                </DropdownMenuSub>
                                <DropdownMenuSub>
                                    <DropdownMenuSubTrigger>
                                        Warehouse
                                    </DropdownMenuSubTrigger>
                                    <DropdownMenuSubContent className="max-h-80 w-72 overflow-y-auto">
                                        <DropdownMenuRadioGroup
                                            value={
                                                tableFilters.warehouse === ''
                                                    ? 'all'
                                                    : tableFilters.warehouse
                                            }
                                            onValueChange={(value) => {
                                                router.cancelAll();
                                                setTableFilters(
                                                    (currentFilters) => ({
                                                        ...currentFilters,
                                                        warehouse:
                                                            value === 'all'
                                                                ? ''
                                                                : value,
                                                    }),
                                                );
                                            }}
                                        >
                                            <DropdownMenuRadioItem value="all">
                                                All warehouses
                                            </DropdownMenuRadioItem>
                                            {warehouseOptions.map((option) => (
                                                <DropdownMenuRadioItem
                                                    key={option.value}
                                                    value={String(option.value)}
                                                >
                                                    {option.label}
                                                </DropdownMenuRadioItem>
                                            ))}
                                        </DropdownMenuRadioGroup>
                                    </DropdownMenuSubContent>
                                </DropdownMenuSub>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>

                <CompactDataTable
                    footer={
                        <DataTablePaginationFooter
                            pagination={purchaseReceipts}
                            perPage={tableFilters.per_page}
                            perPageOptions={perPageOptions}
                            onPerPageChange={(value) => {
                                router.cancelAll();
                                setTableFilters((currentFilters) => ({
                                    ...currentFilters,
                                    per_page: value,
                                }));
                            }}
                        />
                    }
                >
                    <table>
                        <thead>
                            <tr>
                                <th>Receipt</th>
                                <th>PO / supplier</th>
                                <th>Warehouse</th>
                                <th className="text-right">Quantity</th>
                                <th>Received by</th>
                                <th className="text-right">Actions</th>
                            </tr>
                        </thead>

                        <tbody>
                            {purchaseReceipts.data.length === 0 && (
                                <tr>
                                    <td
                                        colSpan={6}
                                        className="py-10 text-center text-sm text-muted-foreground"
                                    >
                                        No purchase receipts matched the current
                                        filters.
                                    </td>
                                </tr>
                            )}

                            {purchaseReceipts.data.map((purchaseReceipt) => (
                                <tr key={purchaseReceipt.id}>
                                    <td>
                                        <div className="space-y-0.5">
                                            <p className="max-w-[14rem] truncate font-semibold text-foreground">
                                                {purchaseReceipt.receipt_no}
                                            </p>
                                            <p className="max-w-[16rem] truncate text-[13px] text-muted-foreground">
                                                {[
                                                    purchaseReceipt.received_date,
                                                    purchaseReceipt.supplier_reference,
                                                ]
                                                    .filter(Boolean)
                                                    .join(' • ') ||
                                                    'No receipt date'}
                                            </p>
                                        </div>
                                    </td>

                                    <td>
                                        <div className="space-y-0.5">
                                            <p className="max-w-[18rem] truncate font-medium text-foreground">
                                                {purchaseReceipt.purchase_order
                                                    .po_no ?? 'No PO linked'}
                                            </p>
                                            <p className="max-w-[18rem] truncate text-[13px] text-muted-foreground">
                                                {purchaseReceipt.supplier
                                                    .company_name
                                                    ? `${purchaseReceipt.supplier.supplier_code} • ${purchaseReceipt.supplier.company_name}`
                                                    : 'No supplier'}
                                            </p>
                                        </div>
                                    </td>

                                    <td>
                                        <div className="space-y-0.5">
                                            <p className="max-w-[16rem] truncate font-medium text-foreground">
                                                {purchaseReceipt.warehouse
                                                    .warehouse_name ??
                                                    'No warehouse'}
                                            </p>
                                            <p className="max-w-[16rem] truncate text-[13px] text-muted-foreground">
                                                {purchaseReceipt.warehouse
                                                    .warehouse_code ??
                                                    'No warehouse code'}
                                            </p>
                                        </div>
                                    </td>

                                    <td className="text-right text-[13px] text-muted-foreground">
                                        <p className="font-medium text-foreground tabular-nums">
                                            {purchaseReceipt.received_quantity_total.toFixed(
                                                2,
                                            )}
                                        </p>
                                        <p>
                                            {purchaseReceipt.item_count} items
                                        </p>
                                    </td>

                                    <td className="text-[13px] text-muted-foreground">
                                        {purchaseReceipt.received_by ??
                                            'Not recorded'}
                                    </td>

                                    <td className="text-right">
                                        <div className="flex justify-end">
                                            <DataTableRowActions
                                                items={
                                                    purchaseReceipt.can.view
                                                        ? [
                                                              {
                                                                  key: 'open',
                                                                  label: 'Open',
                                                                  icon: Eye,
                                                                  href: purchaseReceiptsShow(
                                                                      purchaseReceipt.id,
                                                                  ),
                                                              },
                                                          ]
                                                        : []
                                                }
                                                label={`Open actions for ${purchaseReceipt.receipt_no}`}
                                            />
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </CompactDataTable>
            </div>
        </>
    );
}

PurchaseReceiptsIndex.layout = {
    breadcrumbs: purchaseReceiptBreadcrumbs,
};
