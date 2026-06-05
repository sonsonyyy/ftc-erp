import { Head, Link, router } from '@inertiajs/react';
import { Archive, Eye, Pencil, Plus, Search } from 'lucide-react';
import { useEffect, useState } from 'react';
import { CompactDataTable } from '@/components/compact-data-table';
import { DataTablePaginationFooter } from '@/components/data-table-pagination-footer';
import { DataTableRowActions } from '@/components/data-table-row-actions';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cleanQueryParams, toUrl } from '@/lib/utils';
import { dashboard } from '@/routes';
import {
    create as warehousesCreate,
    destroy as warehousesDestroy,
    edit as warehousesEdit,
    index as warehousesIndex,
    show as warehousesShow,
} from '@/routes/warehouses';
import type {
    PaginatedData,
    WarehouseFilters,
    WarehouseListItem,
} from '@/types';

type Props = {
    warehouses: PaginatedData<WarehouseListItem>;
    filters: WarehouseFilters;
    can: {
        create: boolean;
    };
};

const warehouseBreadcrumbs = [
    {
        title: 'Dashboard',
        href: dashboard(),
    },
    {
        title: 'Warehouses',
        href: warehousesIndex(),
    },
];

const perPageOptions = ['5', '10', '15', '25'];

function statusBadgeClass(isActive: boolean): string {
    return isActive
        ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
        : 'border-slate-200 bg-slate-100 text-slate-700';
}

export default function WarehousesIndex({ warehouses, filters, can }: Props) {
    const [searchInput, setSearchInput] = useState(filters.search);
    const [tableFilters, setTableFilters] = useState({
        per_page: String(filters.per_page),
    });

    useEffect(() => {
        setTableFilters((currentFilters) => {
            const nextFilters = {
                per_page: String(filters.per_page),
            };

            if (currentFilters.per_page === nextFilters.per_page) {
                return currentFilters;
            }

            return nextFilters;
        });
    }, [filters.per_page]);

    useEffect(() => {
        const normalizedSearch = searchInput.trim();
        const currentPerPage = String(filters.per_page);

        if (
            normalizedSearch === filters.search &&
            tableFilters.per_page === currentPerPage
        ) {
            return;
        }

        const timeout = window.setTimeout(() => {
            router.cancelAll();
            router.get(
                toUrl(warehousesIndex()),
                cleanQueryParams({
                    search: normalizedSearch,
                    per_page: Number(tableFilters.per_page),
                    page: 1,
                }),
                {
                    only: ['warehouses', 'filters'],
                    replace: true,
                    preserveState: true,
                    preserveScroll: true,
                },
            );
        }, 300);

        return () => window.clearTimeout(timeout);
    }, [filters.per_page, filters.search, searchInput, tableFilters]);

    return (
        <>
            <Head title="Warehouses" />

            <div className="app-page flex flex-1 flex-col gap-6">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                    <div className="space-y-1.5">
                        <h1 className="text-2xl font-semibold tracking-tight">
                            Warehouses
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Physical stock locations used across inventory
                            operations.
                        </p>
                    </div>

                    {can.create && (
                        <Button asChild>
                            <Link href={warehousesCreate()}>
                                <Plus />
                                New warehouse
                            </Link>
                        </Button>
                    )}
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
                                placeholder="Search warehouses"
                                className="h-9 pl-9"
                            />
                        </div>
                    </div>
                </div>

                <CompactDataTable
                    footer={
                        <DataTablePaginationFooter
                            pagination={warehouses}
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
                                <th>Warehouse</th>
                                <th>Contact</th>
                                <th>Status</th>
                                <th className="text-right">Items</th>
                                <th className="text-right">Quantity</th>
                                <th className="text-right">Actions</th>
                            </tr>
                        </thead>

                        <tbody>
                            {warehouses.data.length === 0 && (
                                <tr>
                                    <td
                                        colSpan={6}
                                        className="py-10 text-center text-sm text-muted-foreground"
                                    >
                                        No warehouses matched the current
                                        filters.
                                    </td>
                                </tr>
                            )}

                            {warehouses.data.map((warehouse) => (
                                <tr key={warehouse.id}>
                                    <td>
                                        <div className="space-y-0.5">
                                            <p className="max-w-[18rem] truncate font-semibold text-foreground">
                                                {warehouse.warehouse_name}
                                            </p>
                                            <p className="max-w-[18rem] truncate text-[13px] text-muted-foreground">
                                                {warehouse.warehouse_code}
                                            </p>
                                        </div>
                                    </td>

                                    <td>
                                        <div className="space-y-0.5 text-[13px] leading-5 text-muted-foreground">
                                            <p className="max-w-[16rem] truncate">
                                                {warehouse.contact_person ??
                                                    'No contact person'}
                                            </p>
                                            <p className="max-w-[16rem] truncate">
                                                {warehouse.contact_no ??
                                                    'No contact number'}
                                            </p>
                                        </div>
                                    </td>

                                    <td>
                                        <Badge
                                            variant="outline"
                                            className={statusBadgeClass(
                                                warehouse.is_active,
                                            )}
                                        >
                                            {warehouse.is_active
                                                ? 'Active'
                                                : 'Inactive'}
                                        </Badge>
                                    </td>

                                    <td className="text-right font-medium tabular-nums">
                                        {warehouse.stocked_item_count}
                                    </td>

                                    <td className="text-right font-medium text-muted-foreground tabular-nums">
                                        {warehouse.quantity_on_hand.toFixed(2)}
                                    </td>

                                    <td className="text-right">
                                        <div className="flex justify-end">
                                            <DataTableRowActions
                                                items={[
                                                    ...(warehouse.can.view
                                                        ? [
                                                              {
                                                                  key: 'open',
                                                                  label: 'Open',
                                                                  icon: Eye,
                                                                  href: warehousesShow(
                                                                      warehouse.id,
                                                                  ),
                                                              },
                                                          ]
                                                        : []),
                                                    ...(warehouse.can.update
                                                        ? [
                                                              {
                                                                  key: 'edit',
                                                                  label: 'Edit',
                                                                  icon: Pencil,
                                                                  href: warehousesEdit(
                                                                      warehouse.id,
                                                                  ),
                                                              },
                                                          ]
                                                        : []),
                                                    ...(warehouse.can.delete
                                                        ? [
                                                              {
                                                                  key: 'archive',
                                                                  label: 'Archive',
                                                                  icon: Archive,
                                                                  destructive: true,
                                                                  onSelect:
                                                                      () =>
                                                                          router.delete(
                                                                              toUrl(
                                                                                  warehousesDestroy(
                                                                                      warehouse.id,
                                                                                  ),
                                                                              ),
                                                                              {
                                                                                  preserveScroll: true,
                                                                              },
                                                                          ),
                                                              },
                                                          ]
                                                        : []),
                                                ]}
                                                label={`Open actions for ${warehouse.warehouse_name}`}
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

WarehousesIndex.layout = {
    breadcrumbs: warehouseBreadcrumbs,
};
