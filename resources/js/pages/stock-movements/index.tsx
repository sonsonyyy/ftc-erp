import { Head, Link, router } from '@inertiajs/react';
import { ChevronDown, Plus, Search, SlidersHorizontal } from 'lucide-react';
import { useEffect, useState } from 'react';
import { CompactDataTable } from '@/components/compact-data-table';
import { DataTablePaginationFooter } from '@/components/data-table-pagination-footer';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuSeparator,
    DropdownMenuSub,
    DropdownMenuSubContent,
    DropdownMenuSubTrigger,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { cleanQueryParams, toUrl } from '@/lib/utils';
import { dashboard } from '@/routes';
import {
    create as stockMovementsCreate,
    index as stockMovementsIndex,
} from '@/routes/stock-movements';
import type {
    PaginatedData,
    SelectOption,
    StockMovementFilters,
    StockMovementListItem,
} from '@/types';

type Props = {
    movements: PaginatedData<StockMovementListItem>;
    filters: StockMovementFilters;
    warehouseOptions: SelectOption[];
    itemOptions: SelectOption[];
    movementTypeOptions: SelectOption[];
    can: {
        create: boolean;
    };
};

const stockMovementBreadcrumbs = [
    {
        title: 'Dashboard',
        href: dashboard(),
    },
    {
        title: 'Stock Movements',
        href: stockMovementsIndex(),
    },
];

const perPageOptions = ['5', '10', '15', '25'];

export default function StockMovementsIndex({
    movements,
    filters,
    warehouseOptions,
    itemOptions,
    movementTypeOptions,
    can,
}: Props) {
    const [searchInput, setSearchInput] = useState(filters.search);
    const [tableFilters, setTableFilters] = useState({
        warehouse: filters.warehouse === null ? '' : String(filters.warehouse),
        item: filters.item === null ? '' : String(filters.item),
        type: filters.type,
        per_page: String(filters.per_page),
    });

    useEffect(() => {
        setTableFilters((currentFilters) => {
            const nextFilters = {
                warehouse:
                    filters.warehouse === null ? '' : String(filters.warehouse),
                item: filters.item === null ? '' : String(filters.item),
                type: filters.type,
                per_page: String(filters.per_page),
            };

            if (
                currentFilters.warehouse === nextFilters.warehouse &&
                currentFilters.item === nextFilters.item &&
                currentFilters.type === nextFilters.type &&
                currentFilters.per_page === nextFilters.per_page
            ) {
                return currentFilters;
            }

            return nextFilters;
        });
    }, [filters.item, filters.per_page, filters.type, filters.warehouse]);

    useEffect(() => {
        const normalizedSearch = searchInput.trim();
        const currentWarehouse =
            filters.warehouse === null ? '' : String(filters.warehouse);
        const currentItem = filters.item === null ? '' : String(filters.item);
        const currentPerPage = String(filters.per_page);

        if (
            normalizedSearch === filters.search &&
            tableFilters.warehouse === currentWarehouse &&
            tableFilters.item === currentItem &&
            tableFilters.type === filters.type &&
            tableFilters.per_page === currentPerPage
        ) {
            return;
        }

        const timeout = window.setTimeout(() => {
            router.cancelAll();
            router.get(
                toUrl(stockMovementsIndex()),
                cleanQueryParams({
                    search: normalizedSearch,
                    warehouse:
                        tableFilters.warehouse === ''
                            ? undefined
                            : Number(tableFilters.warehouse),
                    item:
                        tableFilters.item === ''
                            ? undefined
                            : Number(tableFilters.item),
                    type: tableFilters.type,
                    per_page: Number(tableFilters.per_page),
                    page: 1,
                }),
                {
                    only: ['movements', 'filters'],
                    replace: true,
                    preserveState: true,
                    preserveScroll: true,
                },
            );
        }, 300);

        return () => window.clearTimeout(timeout);
    }, [
        filters.item,
        filters.per_page,
        filters.search,
        filters.type,
        filters.warehouse,
        searchInput,
        tableFilters,
    ]);

    const activeFilterCount =
        (tableFilters.warehouse === '' ? 0 : 1) +
        (tableFilters.item === '' ? 0 : 1) +
        (tableFilters.type === '' ? 0 : 1);

    return (
        <>
            <Head title="Stock Movements" />

            <div className="app-page flex flex-1 flex-col gap-6">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                    <div className="space-y-1.5">
                        <h1 className="text-2xl font-semibold tracking-tight">
                            Stock Movements
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Warehouse movement history and manual adjustments.
                        </p>
                    </div>

                    {can.create && (
                        <Button asChild>
                            <Link href={stockMovementsCreate()}>
                                <Plus />
                                Manual movement
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
                                placeholder="Search movements"
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
                                <DropdownMenuLabel>
                                    Movement type
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuRadioGroup
                                    value={
                                        tableFilters.type === ''
                                            ? 'all'
                                            : tableFilters.type
                                    }
                                    onValueChange={(value) => {
                                        router.cancelAll();
                                        setTableFilters((currentFilters) => ({
                                            ...currentFilters,
                                            type: value === 'all' ? '' : value,
                                        }));
                                    }}
                                >
                                    <DropdownMenuRadioItem value="all">
                                        All types
                                    </DropdownMenuRadioItem>
                                    {movementTypeOptions.map((option) => (
                                        <DropdownMenuRadioItem
                                            key={option.value}
                                            value={String(option.value)}
                                        >
                                            {option.label}
                                        </DropdownMenuRadioItem>
                                    ))}
                                </DropdownMenuRadioGroup>
                                <DropdownMenuSeparator />
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
                                <DropdownMenuSub>
                                    <DropdownMenuSubTrigger>
                                        Item
                                    </DropdownMenuSubTrigger>
                                    <DropdownMenuSubContent className="max-h-80 w-80 overflow-y-auto">
                                        <DropdownMenuRadioGroup
                                            value={
                                                tableFilters.item === ''
                                                    ? 'all'
                                                    : tableFilters.item
                                            }
                                            onValueChange={(value) => {
                                                router.cancelAll();
                                                setTableFilters(
                                                    (currentFilters) => ({
                                                        ...currentFilters,
                                                        item:
                                                            value === 'all'
                                                                ? ''
                                                                : value,
                                                    }),
                                                );
                                            }}
                                        >
                                            <DropdownMenuRadioItem value="all">
                                                All items
                                            </DropdownMenuRadioItem>
                                            {itemOptions.map((option) => (
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
                            pagination={movements}
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
                                <th>Movement</th>
                                <th>Item</th>
                                <th>Warehouse</th>
                                <th>Context</th>
                                <th className="text-right">Qty</th>
                                <th className="text-right">Balance</th>
                                <th>Recorded</th>
                            </tr>
                        </thead>

                        <tbody>
                            {movements.data.length === 0 && (
                                <tr>
                                    <td
                                        colSpan={7}
                                        className="py-10 text-center text-sm text-muted-foreground"
                                    >
                                        No stock movements matched the current
                                        filters.
                                    </td>
                                </tr>
                            )}

                            {movements.data.map((movement) => (
                                <tr key={movement.id}>
                                    <td>
                                        <div className="space-y-1">
                                            <Badge variant="outline">
                                                {movement.movement_type_label}
                                            </Badge>
                                            <p className="max-w-[16rem] truncate text-[13px] text-muted-foreground">
                                                {movement.reference_number ??
                                                    movement.remarks ??
                                                    'No reference'}
                                            </p>
                                        </div>
                                    </td>

                                    <td>
                                        <div className="space-y-0.5">
                                            <p className="max-w-[18rem] truncate font-semibold text-foreground">
                                                {movement.inventory_item
                                                    .item_name ?? 'No item'}
                                            </p>
                                            <p className="max-w-[18rem] truncate text-[13px] text-muted-foreground">
                                                {[
                                                    movement.inventory_item
                                                        .item_code,
                                                    movement.inventory_item
                                                        .unit,
                                                ]
                                                    .filter(Boolean)
                                                    .join(' • ') ||
                                                    'No item code'}
                                            </p>
                                        </div>
                                    </td>

                                    <td>
                                        <div className="space-y-0.5">
                                            <p className="max-w-[16rem] truncate font-medium text-foreground">
                                                {movement.warehouse
                                                    .warehouse_name ??
                                                    'No warehouse'}
                                            </p>
                                            <p className="max-w-[16rem] truncate text-[13px] text-muted-foreground">
                                                {movement.warehouse
                                                    .warehouse_code ??
                                                    'No warehouse code'}
                                            </p>
                                        </div>
                                    </td>

                                    <td className="text-[13px] text-muted-foreground">
                                        <p className="max-w-[14rem] truncate">
                                            {movement.project.project_no ??
                                                'No project'}
                                        </p>
                                        <p className="max-w-[14rem] truncate">
                                            {movement.work_order
                                                .work_order_no ??
                                                'No work order'}
                                        </p>
                                    </td>

                                    <td className="text-right font-medium tabular-nums">
                                        {movement.quantity.toFixed(2)}
                                    </td>

                                    <td className="text-right font-medium tabular-nums">
                                        {movement.balance_after.toFixed(2)}
                                    </td>

                                    <td className="text-[13px] text-muted-foreground">
                                        <p>
                                            {movement.movement_date ??
                                                'No date'}
                                        </p>
                                        <p className="max-w-[10rem] truncate">
                                            {movement.created_by ?? 'System'}
                                        </p>
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

StockMovementsIndex.layout = {
    breadcrumbs: stockMovementBreadcrumbs,
};
