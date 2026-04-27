import { Head, Link, router } from '@inertiajs/react';
import {
    ChevronDown,
    Eye,
    Plus,
    Search,
    SlidersHorizontal,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { CompactDataTable } from '@/components/compact-data-table';
import { DataTablePaginationFooter } from '@/components/data-table-pagination-footer';
import { DataTableRowActions } from '@/components/data-table-row-actions';
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
    create as stockIssuancesCreate,
    index as stockIssuancesIndex,
    show as stockIssuancesShow,
} from '@/routes/stock-issuances';
import type {
    PaginatedData,
    SelectOption,
    StockIssuanceFilters,
    StockIssuanceListItem,
    StockWorkOrderOption,
} from '@/types';

type Props = {
    stockIssuances: PaginatedData<StockIssuanceListItem>;
    filters: StockIssuanceFilters;
    warehouseOptions: SelectOption[];
    projectOptions: SelectOption[];
    workOrderOptions: StockWorkOrderOption[];
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
    projectOptions,
    workOrderOptions,
    can,
}: Props) {
    const [searchInput, setSearchInput] = useState(filters.search);
    const [tableFilters, setTableFilters] = useState({
        warehouse: filters.warehouse === null ? '' : String(filters.warehouse),
        project: filters.project === null ? '' : String(filters.project),
        work_order:
            filters.work_order === null ? '' : String(filters.work_order),
        per_page: String(filters.per_page),
    });

    useEffect(() => {
        setTableFilters((currentFilters) => {
            const nextFilters = {
                warehouse:
                    filters.warehouse === null ? '' : String(filters.warehouse),
                project:
                    filters.project === null ? '' : String(filters.project),
                work_order:
                    filters.work_order === null
                        ? ''
                        : String(filters.work_order),
                per_page: String(filters.per_page),
            };

            if (
                currentFilters.warehouse === nextFilters.warehouse &&
                currentFilters.project === nextFilters.project &&
                currentFilters.work_order === nextFilters.work_order &&
                currentFilters.per_page === nextFilters.per_page
            ) {
                return currentFilters;
            }

            return nextFilters;
        });
    }, [
        filters.per_page,
        filters.project,
        filters.warehouse,
        filters.work_order,
    ]);

    useEffect(() => {
        const normalizedSearch = searchInput.trim();
        const currentWarehouse =
            filters.warehouse === null ? '' : String(filters.warehouse);
        const currentProject =
            filters.project === null ? '' : String(filters.project);
        const currentWorkOrder =
            filters.work_order === null ? '' : String(filters.work_order);
        const currentPerPage = String(filters.per_page);

        if (
            normalizedSearch === filters.search &&
            tableFilters.warehouse === currentWarehouse &&
            tableFilters.project === currentProject &&
            tableFilters.work_order === currentWorkOrder &&
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
                    project:
                        tableFilters.project === ''
                            ? undefined
                            : Number(tableFilters.project),
                    work_order:
                        tableFilters.work_order === ''
                            ? undefined
                            : Number(tableFilters.work_order),
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
        filters.project,
        filters.search,
        filters.warehouse,
        filters.work_order,
        searchInput,
        tableFilters,
    ]);

    const activeFilterCount =
        (tableFilters.warehouse === '' ? 0 : 1) +
        (tableFilters.project === '' ? 0 : 1) +
        (tableFilters.work_order === '' ? 0 : 1);

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
                        <div className="relative w-full sm:max-w-sm">
                            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                value={searchInput}
                                onChange={(event) =>
                                    setSearchInput(event.currentTarget.value)
                                }
                                placeholder="Search issuances"
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
                                        Project
                                    </DropdownMenuSubTrigger>
                                    <DropdownMenuSubContent className="max-h-80 w-80 overflow-y-auto">
                                        <DropdownMenuRadioGroup
                                            value={
                                                tableFilters.project === ''
                                                    ? 'all'
                                                    : tableFilters.project
                                            }
                                            onValueChange={(value) => {
                                                router.cancelAll();
                                                setTableFilters(
                                                    (currentFilters) => ({
                                                        ...currentFilters,
                                                        project:
                                                            value === 'all'
                                                                ? ''
                                                                : value,
                                                    }),
                                                );
                                            }}
                                        >
                                            <DropdownMenuRadioItem value="all">
                                                All projects
                                            </DropdownMenuRadioItem>
                                            {projectOptions.map((option) => (
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
                                        Work order
                                    </DropdownMenuSubTrigger>
                                    <DropdownMenuSubContent className="max-h-80 w-80 overflow-y-auto">
                                        <DropdownMenuRadioGroup
                                            value={
                                                tableFilters.work_order === ''
                                                    ? 'all'
                                                    : tableFilters.work_order
                                            }
                                            onValueChange={(value) => {
                                                router.cancelAll();
                                                setTableFilters(
                                                    (currentFilters) => ({
                                                        ...currentFilters,
                                                        work_order:
                                                            value === 'all'
                                                                ? ''
                                                                : value,
                                                    }),
                                                );
                                            }}
                                        >
                                            <DropdownMenuRadioItem value="all">
                                                All work orders
                                            </DropdownMenuRadioItem>
                                            {workOrderOptions.map((option) => (
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
