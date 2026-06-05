import { Head, Link, router } from '@inertiajs/react';
import { Eye, Plus, Search } from 'lucide-react';
import { useEffect, useState } from 'react';
import { CompactDataTable } from '@/components/compact-data-table';
import { DataTablePaginationFooter } from '@/components/data-table-pagination-footer';
import { DataTableRowActions } from '@/components/data-table-row-actions';
import { FilterSelect } from '@/components/filter-select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cleanQueryParams, toUrl } from '@/lib/utils';
import { dashboard } from '@/routes';
import {
    create as stockReturnsCreate,
    index as stockReturnsIndex,
    show as stockReturnsShow,
} from '@/routes/stock-returns';
import type {
    PaginatedData,
    SelectOption,
    StockReturnFilters,
    StockReturnListItem,
} from '@/types';

type Props = {
    stockReturns: PaginatedData<StockReturnListItem>;
    filters: StockReturnFilters;
    warehouseOptions: SelectOption[];
    can: {
        create: boolean;
    };
};

const stockReturnBreadcrumbs = [
    {
        title: 'Dashboard',
        href: dashboard(),
    },
    {
        title: 'Stock Returns',
        href: stockReturnsIndex(),
    },
];

const perPageOptions = ['5', '10', '15', '25'];

export default function StockReturnsIndex({
    stockReturns,
    filters,
    warehouseOptions,
    can,
}: Props) {
    const [searchInput, setSearchInput] = useState(filters.search);
    const [tableFilters, setTableFilters] = useState({
        warehouse: filters.warehouse === null ? '' : String(filters.warehouse),
        per_page: String(filters.per_page),
    });

    useEffect(() => {
        setTableFilters((currentFilters) => {
            const nextFilters = {
                warehouse:
                    filters.warehouse === null ? '' : String(filters.warehouse),
                per_page: String(filters.per_page),
            };

            if (
                currentFilters.warehouse === nextFilters.warehouse &&
                currentFilters.per_page === nextFilters.per_page
            ) {
                return currentFilters;
            }

            return nextFilters;
        });
    }, [filters.per_page, filters.warehouse]);

    useEffect(() => {
        const normalizedSearch = searchInput.trim();
        const currentWarehouse =
            filters.warehouse === null ? '' : String(filters.warehouse);
        const currentPerPage = String(filters.per_page);

        if (
            normalizedSearch === filters.search &&
            tableFilters.warehouse === currentWarehouse &&
            tableFilters.per_page === currentPerPage
        ) {
            return;
        }

        const timeout = window.setTimeout(() => {
            router.cancelAll();
            router.get(
                toUrl(stockReturnsIndex()),
                cleanQueryParams({
                    search: normalizedSearch,
                    warehouse:
                        tableFilters.warehouse === ''
                            ? undefined
                            : Number(tableFilters.warehouse),
                    per_page: Number(tableFilters.per_page),
                    page: 1,
                }),
                {
                    only: ['stockReturns', 'filters'],
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
        filters.warehouse,
        searchInput,
        tableFilters,
    ]);

    return (
        <>
            <Head title="Stock Returns" />

            <div className="app-page flex flex-1 flex-col gap-6">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                    <div className="space-y-1.5">
                        <h1 className="text-2xl font-semibold tracking-tight">
                            Stock Returns
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Materials returned from project and service work.
                        </p>
                    </div>

                    {can.create && (
                        <Button asChild>
                            <Link href={stockReturnsCreate()}>
                                <Plus />
                                New return
                            </Link>
                        </Button>
                    )}
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
                                placeholder="Search returns"
                                className="h-9 pl-9"
                            />
                        </div>

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
                            pagination={stockReturns}
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
                                <th>Return</th>
                                <th>Warehouse</th>
                                <th>Project / work order</th>
                                <th className="text-right">Items</th>
                                <th className="text-right">Actions</th>
                            </tr>
                        </thead>

                        <tbody>
                            {stockReturns.data.length === 0 && (
                                <tr>
                                    <td
                                        colSpan={5}
                                        className="py-10 text-center text-sm text-muted-foreground"
                                    >
                                        No stock returns matched the current
                                        filters.
                                    </td>
                                </tr>
                            )}

                            {stockReturns.data.map((stockReturn) => (
                                <tr key={stockReturn.id}>
                                    <td>
                                        <div className="space-y-0.5">
                                            <p className="max-w-[14rem] truncate font-semibold text-foreground">
                                                {stockReturn.return_no}
                                            </p>
                                            <p className="max-w-[14rem] truncate text-[13px] text-muted-foreground">
                                                {[
                                                    stockReturn.returned_date,
                                                    stockReturn.created_by,
                                                ]
                                                    .filter(Boolean)
                                                    .join(' • ') || 'No date'}
                                            </p>
                                        </div>
                                    </td>

                                    <td>
                                        <div className="space-y-0.5">
                                            <p className="max-w-[16rem] truncate font-medium text-foreground">
                                                {stockReturn.warehouse
                                                    .warehouse_name ??
                                                    'No warehouse'}
                                            </p>
                                            <p className="max-w-[16rem] truncate text-[13px] text-muted-foreground">
                                                {stockReturn.warehouse
                                                    .warehouse_code ??
                                                    'No warehouse code'}
                                            </p>
                                        </div>
                                    </td>

                                    <td className="text-[13px] text-muted-foreground">
                                        <p className="max-w-[18rem] truncate">
                                            {stockReturn.project.project_no
                                                ? `${stockReturn.project.project_no} • ${stockReturn.project.title ?? 'Project'}`
                                                : 'No project'}
                                        </p>
                                        <p className="max-w-[18rem] truncate">
                                            {stockReturn.work_order
                                                .work_order_no
                                                ? `${stockReturn.work_order.work_order_no} • ${stockReturn.work_order.summary ?? 'Work order'}`
                                                : 'No work order'}
                                        </p>
                                    </td>

                                    <td className="text-right text-[13px] text-muted-foreground">
                                        <p className="font-medium text-foreground tabular-nums">
                                            {stockReturn.total_quantity.toFixed(
                                                2,
                                            )}
                                        </p>
                                        <p>{stockReturn.item_count} lines</p>
                                    </td>

                                    <td className="text-right">
                                        <div className="flex justify-end">
                                            <DataTableRowActions
                                                items={
                                                    stockReturn.can.view
                                                        ? [
                                                              {
                                                                  key: 'open',
                                                                  label: 'Open',
                                                                  icon: Eye,
                                                                  href: stockReturnsShow(
                                                                      stockReturn.id,
                                                                  ),
                                                              },
                                                          ]
                                                        : []
                                                }
                                                label={`Open actions for ${stockReturn.return_no}`}
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

StockReturnsIndex.layout = {
    breadcrumbs: stockReturnBreadcrumbs,
};
