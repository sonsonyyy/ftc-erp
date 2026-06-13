import { Head, Link, router } from '@inertiajs/react';
import { Eye, Plus, Search } from 'lucide-react';
import { useEffect, useState } from 'react';
import { ClearableSearchInput } from '@/components/clearable-search-input';
import { CompactDataTable } from '@/components/compact-data-table';
import { DataTablePaginationFooter } from '@/components/data-table-pagination-footer';
import { DataTableRowActions } from '@/components/data-table-row-actions';
import { FilterSelect } from '@/components/filter-select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cleanQueryParams, toUrl } from '@/lib/utils';
import { dashboard } from '@/routes';
import {
    create as stockIssuancesCreate,
    index as stockIssuancesIndex,
    show as stockIssuancesShow,
} from '@/routes/stock-issuances';
import type {
    PaginatedData,
    SelectOption,
    StockIssuanceFilters,
    StockIssuanceListItem,
} from '@/types';

type Props = {
    stockIssuances: PaginatedData<StockIssuanceListItem>;
    filters: StockIssuanceFilters;
    warehouseOptions: SelectOption[];
    can: {
        create: boolean;
    };
};

const stockIssuanceBreadcrumbs = [
    {
        title: 'Dashboard',
        href: dashboard(),
    },
    {
        title: 'Stock Issuances',
        href: stockIssuancesIndex(),
    },
];

const perPageOptions = ['5', '10', '15', '25'];

export default function StockIssuancesIndex({
    stockIssuances,
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
                toUrl(stockIssuancesIndex()),
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
                    only: ['stockIssuances', 'filters'],
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
            <Head title="Stock Issuances" />

            <div className="app-page flex flex-1 flex-col gap-6">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                    <div className="space-y-1.5">
                        <h1 className="text-2xl font-semibold tracking-tight">
                            Stock Issuances
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Materials released to projects and service work.
                        </p>
                    </div>

                    {can.create && (
                        <Button asChild>
                            <Link href={stockIssuancesCreate()}>
                                <Plus />
                                New issuance
                            </Link>
                        </Button>
                    )}
                </div>

                <div className="flex flex-col gap-3">
                    <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center">
                        <ClearableSearchInput
                            value={searchInput}
                            onChange={setSearchInput}
                            placeholder="Search issuances"
                        />

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
                            pagination={stockIssuances}
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
                                <th>Issuance</th>
                                <th>Warehouse</th>
                                <th>Project / work order</th>
                                <th className="text-right">Items</th>
                                <th className="text-right">Actions</th>
                            </tr>
                        </thead>

                        <tbody>
                            {stockIssuances.data.length === 0 && (
                                <tr>
                                    <td
                                        colSpan={5}
                                        className="py-10 text-center text-sm text-muted-foreground"
                                    >
                                        No stock issuances matched the current
                                        filters.
                                    </td>
                                </tr>
                            )}

                            {stockIssuances.data.map((issuance) => (
                                <tr key={issuance.id}>
                                    <td>
                                        <div className="space-y-0.5">
                                            <p className="max-w-[14rem] truncate font-semibold text-foreground">
                                                {issuance.issuance_no}
                                            </p>
                                            <p className="max-w-[14rem] truncate text-[13px] text-muted-foreground">
                                                {[
                                                    issuance.issued_date,
                                                    issuance.created_by,
                                                ]
                                                    .filter(Boolean)
                                                    .join(' • ') || 'No date'}
                                            </p>
                                        </div>
                                    </td>

                                    <td>
                                        <div className="space-y-0.5">
                                            <p className="max-w-[16rem] truncate font-medium text-foreground">
                                                {issuance.warehouse
                                                    .warehouse_name ??
                                                    'No warehouse'}
                                            </p>
                                            <p className="max-w-[16rem] truncate text-[13px] text-muted-foreground">
                                                {issuance.warehouse
                                                    .warehouse_code ??
                                                    'No warehouse code'}
                                            </p>
                                        </div>
                                    </td>

                                    <td className="text-[13px] text-muted-foreground">
                                        <p className="max-w-[18rem] truncate">
                                            {issuance.project.project_no
                                                ? `${issuance.project.project_no} • ${issuance.project.title ?? 'Project'}`
                                                : 'No project'}
                                        </p>
                                        <p className="max-w-[18rem] truncate">
                                            {issuance.work_order.work_order_no
                                                ? `${issuance.work_order.work_order_no} • ${issuance.work_order.summary ?? 'Work order'}`
                                                : 'No work order'}
                                        </p>
                                    </td>

                                    <td className="text-right text-[13px] text-muted-foreground">
                                        <p className="font-medium text-foreground tabular-nums">
                                            {issuance.total_quantity.toFixed(2)}
                                        </p>
                                        <p>{issuance.item_count} lines</p>
                                    </td>

                                    <td className="text-right">
                                        <div className="flex justify-end">
                                            <DataTableRowActions
                                                resourceLabel="stock issuance"
                                                items={
                                                    issuance.can.view
                                                        ? [
                                                              {
                                                                  key: 'open',
                                                                  label: 'Open',
                                                                  icon: Eye,
                                                                  href: stockIssuancesShow(
                                                                      issuance.id,
                                                                  ),
                                                              },
                                                          ]
                                                        : []
                                                }
                                                label={`Open actions for ${issuance.issuance_no}`}
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

StockIssuancesIndex.layout = {
    breadcrumbs: stockIssuanceBreadcrumbs,
};
