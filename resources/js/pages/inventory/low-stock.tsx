import { Head, router } from '@inertiajs/react';
import { Eye, Search } from 'lucide-react';
import { useEffect, useState } from 'react';
import { CompactDataTable } from '@/components/compact-data-table';
import { DataTablePaginationFooter } from '@/components/data-table-pagination-footer';
import { DataTableRowActions } from '@/components/data-table-row-actions';
import { FilterSelect } from '@/components/filter-select';
import { Input } from '@/components/ui/input';
import { cleanQueryParams, toUrl } from '@/lib/utils';
import { dashboard } from '@/routes';
import {
    index as inventoryIndex,
    lowStock as inventoryLowStock,
    show as inventoryShow,
} from '@/routes/inventory';
import type {
    LowStockFilters,
    LowStockItem,
    PaginatedData,
    SelectOption,
} from '@/types';

type Props = {
    lowStockItems: PaginatedData<LowStockItem>;
    filters: LowStockFilters;
    categoryOptions: SelectOption[];
    warehouseOptions: SelectOption[];
};

const lowStockBreadcrumbs = [
    {
        title: 'Dashboard',
        href: dashboard(),
    },
    {
        title: 'Inventory Items',
        href: inventoryIndex(),
    },
    {
        title: 'Low Stock',
        href: inventoryLowStock(),
    },
];

const perPageOptions = ['5', '10', '15', '25'];

export default function InventoryLowStock({
    lowStockItems,
    filters,
    categoryOptions,
    warehouseOptions,
}: Props) {
    const [searchInput, setSearchInput] = useState(filters.search);
    const [tableFilters, setTableFilters] = useState({
        category: filters.category === null ? '' : String(filters.category),
        warehouse: filters.warehouse === null ? '' : String(filters.warehouse),
        per_page: String(filters.per_page),
    });

    useEffect(() => {
        setTableFilters((currentFilters) => {
            const nextFilters = {
                category:
                    filters.category === null ? '' : String(filters.category),
                warehouse:
                    filters.warehouse === null ? '' : String(filters.warehouse),
                per_page: String(filters.per_page),
            };

            if (
                currentFilters.category === nextFilters.category &&
                currentFilters.warehouse === nextFilters.warehouse &&
                currentFilters.per_page === nextFilters.per_page
            ) {
                return currentFilters;
            }

            return nextFilters;
        });
    }, [filters.category, filters.per_page, filters.warehouse]);

    useEffect(() => {
        const normalizedSearch = searchInput.trim();
        const currentCategory =
            filters.category === null ? '' : String(filters.category);
        const currentWarehouse =
            filters.warehouse === null ? '' : String(filters.warehouse);
        const currentPerPage = String(filters.per_page);

        if (
            normalizedSearch === filters.search &&
            tableFilters.category === currentCategory &&
            tableFilters.warehouse === currentWarehouse &&
            tableFilters.per_page === currentPerPage
        ) {
            return;
        }

        const timeout = window.setTimeout(() => {
            router.cancelAll();
            router.get(
                toUrl(inventoryLowStock()),
                cleanQueryParams({
                    search: normalizedSearch,
                    category:
                        tableFilters.category === ''
                            ? undefined
                            : Number(tableFilters.category),
                    warehouse:
                        tableFilters.warehouse === ''
                            ? undefined
                            : Number(tableFilters.warehouse),
                    per_page: Number(tableFilters.per_page),
                    page: 1,
                }),
                {
                    only: ['lowStockItems', 'filters'],
                    replace: true,
                    preserveState: true,
                    preserveScroll: true,
                },
            );
        }, 300);

        return () => window.clearTimeout(timeout);
    }, [
        filters.category,
        filters.per_page,
        filters.search,
        filters.warehouse,
        searchInput,
        tableFilters,
    ]);

    return (
        <>
            <Head title="Low Stock" />

            <div className="app-page flex flex-1 flex-col gap-6">
                <div className="space-y-1.5">
                    <h1 className="text-2xl font-semibold tracking-tight">
                        Low Stock
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Review active items already below reorder level.
                    </p>
                </div>

                <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
                    <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center">
                        <div className="relative w-full sm:max-w-sm">
                            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                value={searchInput}
                                onChange={(event) =>
                                    setSearchInput(event.currentTarget.value)
                                }
                                placeholder="Search low-stock items"
                                className="h-9 pl-9"
                            />
                        </div>

                        <FilterSelect
                            value={tableFilters.category}
                            onChange={(event) => {
                                router.cancelAll();
                                setTableFilters((currentFilters) => ({
                                    ...currentFilters,
                                    category: event.currentTarget.value,
                                }));
                            }}
                            className="w-full sm:w-[220px]"
                        >
                            <option value="">All categories</option>
                            {categoryOptions.map((option) => (
                                <option
                                    key={option.value}
                                    value={String(option.value)}
                                >
                                    {option.label}
                                </option>
                            ))}
                        </FilterSelect>

                        <FilterSelect
                            value={tableFilters.warehouse}
                            onChange={(event) => {
                                router.cancelAll();
                                setTableFilters((currentFilters) => ({
                                    ...currentFilters,
                                    warehouse: event.currentTarget.value,
                                }));
                            }}
                            className="w-full sm:w-[220px]"
                        >
                            <option value="">All warehouses</option>
                            {warehouseOptions.map((option) => (
                                <option
                                    key={option.value}
                                    value={String(option.value)}
                                >
                                    {option.label}
                                </option>
                            ))}
                        </FilterSelect>
                    </div>
                </div>

                <CompactDataTable
                    footer={
                        <DataTablePaginationFooter
                            pagination={lowStockItems}
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
                                <th>Item</th>
                                <th>Category</th>
                                <th className="text-right">On hand</th>
                                <th className="text-right">Reorder</th>
                                <th className="text-right">Shortage</th>
                                <th className="text-right">Actions</th>
                            </tr>
                        </thead>

                        <tbody>
                            {lowStockItems.data.length === 0 && (
                                <tr>
                                    <td
                                        colSpan={6}
                                        className="py-10 text-center text-sm text-muted-foreground"
                                    >
                                        No low-stock items matched the current
                                        filters.
                                    </td>
                                </tr>
                            )}

                            {lowStockItems.data.map((item) => (
                                <tr key={item.id}>
                                    <td>
                                        <div className="space-y-0.5">
                                            <p className="max-w-[18rem] truncate font-semibold text-foreground">
                                                {item.item_name}
                                            </p>
                                            <p className="max-w-[18rem] truncate text-[13px] text-muted-foreground">
                                                {[
                                                    item.item_code,
                                                    item.sku,
                                                    item.unit,
                                                ]
                                                    .filter(Boolean)
                                                    .join(' • ')}
                                            </p>
                                        </div>
                                    </td>

                                    <td className="text-[13px] text-muted-foreground">
                                        <p className="max-w-[12rem] truncate">
                                            {item.category.name ??
                                                'Uncategorized'}
                                        </p>
                                    </td>

                                    <td className="text-right font-medium text-muted-foreground tabular-nums">
                                        {item.quantity_on_hand.toFixed(2)}
                                    </td>

                                    <td className="text-right font-medium text-muted-foreground tabular-nums">
                                        {item.reorder_level.toFixed(2)}
                                    </td>

                                    <td className="text-right font-semibold text-amber-700 tabular-nums">
                                        {item.shortage.toFixed(2)}
                                    </td>

                                    <td className="text-right">
                                        <div className="flex justify-end">
                                            <DataTableRowActions
                                                items={[
                                                    ...(item.can.view
                                                        ? [
                                                              {
                                                                  key: 'open',
                                                                  label: 'Open',
                                                                  icon: Eye,
                                                                  href: inventoryShow(
                                                                      item.id,
                                                                  ),
                                                              },
                                                          ]
                                                        : []),
                                                ]}
                                                label={`Open actions for ${item.item_name}`}
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

InventoryLowStock.layout = {
    breadcrumbs: lowStockBreadcrumbs,
};
