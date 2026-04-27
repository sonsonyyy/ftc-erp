import { Head, Link, router } from '@inertiajs/react';
import {
    ChevronDown,
    Eye,
    Pencil,
    Plus,
    Search,
    SlidersHorizontal,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { CompactDataTable } from '@/components/compact-data-table';
import { DataTablePaginationFooter } from '@/components/data-table-pagination-footer';
import { DataTableRowActions } from '@/components/data-table-row-actions';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
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
    create as purchaseRequestsCreate,
    edit as purchaseRequestsEdit,
    index as purchaseRequestsIndex,
    show as purchaseRequestsShow,
} from '@/routes/purchase-requests';
import type {
    PaginatedData,
    PurchaseRequestFilters,
    PurchaseRequestListItem,
    SelectOption,
} from '@/types';

type Props = {
    purchaseRequests: PaginatedData<PurchaseRequestListItem>;
    filters: PurchaseRequestFilters;
    supplierOptions: SelectOption[];
    statusOptions: SelectOption[];
    can: {
        create: boolean;
    };
};

const purchaseRequestBreadcrumbs = [
    {
        title: 'Dashboard',
        href: dashboard(),
    },
    {
        title: 'Purchase Requests',
        href: purchaseRequestsIndex(),
    },
];

const perPageOptions = ['5', '10', '15', '25'];

function statusBadgeClass(status: string): string {
    return (
        {
            draft: 'border-slate-200 bg-slate-100 text-slate-700',
            submitted: 'border-sky-200 bg-sky-50 text-sky-700',
            ordered: 'border-emerald-200 bg-emerald-50 text-emerald-700',
            cancelled: 'border-rose-200 bg-rose-50 text-rose-700',
        }[status] ?? 'border-slate-200 bg-slate-100 text-slate-700'
    );
}

export default function PurchaseRequestsIndex({
    purchaseRequests,
    filters,
    supplierOptions,
    statusOptions,
    can,
}: Props) {
    const [searchInput, setSearchInput] = useState(filters.search);
    const [tableFilters, setTableFilters] = useState({
        supplier: filters.supplier === null ? '' : String(filters.supplier),
        status: filters.status,
        per_page: String(filters.per_page),
    });

    useEffect(() => {
        setTableFilters((currentFilters) => {
            const nextFilters = {
                supplier:
                    filters.supplier === null ? '' : String(filters.supplier),
                status: filters.status,
                per_page: String(filters.per_page),
            };

            if (
                currentFilters.supplier === nextFilters.supplier &&
                currentFilters.status === nextFilters.status &&
                currentFilters.per_page === nextFilters.per_page
            ) {
                return currentFilters;
            }

            return nextFilters;
        });
    }, [filters.per_page, filters.status, filters.supplier]);

    useEffect(() => {
        const normalizedSearch = searchInput.trim();
        const currentSupplier =
            filters.supplier === null ? '' : String(filters.supplier);
        const currentPerPage = String(filters.per_page);

        if (
            normalizedSearch === filters.search &&
            tableFilters.supplier === currentSupplier &&
            tableFilters.status === filters.status &&
            tableFilters.per_page === currentPerPage
        ) {
            return;
        }

        const timeout = window.setTimeout(() => {
            router.cancelAll();
            router.get(
                toUrl(purchaseRequestsIndex()),
                cleanQueryParams({
                    search: normalizedSearch,
                    supplier:
                        tableFilters.supplier === ''
                            ? undefined
                            : Number(tableFilters.supplier),
                    status: tableFilters.status,
                    per_page: Number(tableFilters.per_page),
                    page: 1,
                }),
                {
                    only: ['purchaseRequests', 'filters'],
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
        filters.status,
        filters.supplier,
        searchInput,
        tableFilters,
    ]);

    const activeFilterCount =
        (tableFilters.supplier === '' ? 0 : 1) +
        (tableFilters.status === '' ? 0 : 1);

    return (
        <>
            <Head title="Purchase Requests" />

            <div className="app-page flex flex-1 flex-col gap-6">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                    <div className="space-y-1.5">
                        <h1 className="text-2xl font-semibold tracking-tight">
                            Purchase Requests
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Internal sourcing requests before order release.
                        </p>
                    </div>

                    {can.create && (
                        <Button asChild>
                            <Link href={purchaseRequestsCreate()}>
                                <Plus />
                                New request
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
                                placeholder="Search purchase requests"
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
                                <DropdownMenuRadioGroup
                                    value={
                                        tableFilters.status === ''
                                            ? 'all'
                                            : tableFilters.status
                                    }
                                    onValueChange={(value) => {
                                        router.cancelAll();
                                        setTableFilters((currentFilters) => ({
                                            ...currentFilters,
                                            status:
                                                value === 'all' ? '' : value,
                                        }));
                                    }}
                                >
                                    <DropdownMenuRadioItem value="all">
                                        All statuses
                                    </DropdownMenuRadioItem>
                                    <DropdownMenuSeparator />
                                    {statusOptions.map((option) => (
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
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>

                <CompactDataTable
                    footer={
                        <DataTablePaginationFooter
                            pagination={purchaseRequests}
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
                                <th>Request</th>
                                <th>Supplier / context</th>
                                <th>Dates</th>
                                <th>Status</th>
                                <th className="text-right">Lines</th>
                                <th className="text-right">Actions</th>
                            </tr>
                        </thead>

                        <tbody>
                            {purchaseRequests.data.length === 0 && (
                                <tr>
                                    <td
                                        colSpan={6}
                                        className="py-10 text-center text-sm text-muted-foreground"
                                    >
                                        No purchase requests matched the current
                                        filters.
                                    </td>
                                </tr>
                            )}

                            {purchaseRequests.data.map((purchaseRequest) => (
                                <tr key={purchaseRequest.id}>
                                    <td>
                                        <div className="space-y-0.5">
                                            <p className="max-w-[14rem] truncate font-semibold text-foreground">
                                                {purchaseRequest.request_no}
                                            </p>
                                            <p className="max-w-[18rem] truncate text-[13px] text-muted-foreground">
                                                {purchaseRequest.purpose}
                                            </p>
                                        </div>
                                    </td>

                                    <td>
                                        <div className="space-y-0.5">
                                            <p className="max-w-[18rem] truncate font-medium text-foreground">
                                                {purchaseRequest.supplier
                                                    .company_name
                                                    ? `${purchaseRequest.supplier.supplier_code} • ${purchaseRequest.supplier.company_name}`
                                                    : 'No supplier selected'}
                                            </p>
                                            <p className="max-w-[18rem] truncate text-[13px] text-muted-foreground">
                                                {purchaseRequest.project
                                                    .project_no
                                                    ? `${purchaseRequest.project.project_no} • ${purchaseRequest.project.title ?? 'Project'}`
                                                    : purchaseRequest.work_order
                                                            .work_order_no
                                                      ? `${purchaseRequest.work_order.work_order_no} • ${purchaseRequest.work_order.summary ?? 'Work order'}`
                                                      : 'No project or work order'}
                                            </p>
                                        </div>
                                    </td>

                                    <td className="text-[13px] text-muted-foreground">
                                        <p>
                                            {purchaseRequest.request_date ??
                                                'No request date'}
                                        </p>
                                        <p>
                                            {purchaseRequest.needed_by ??
                                                'No needed-by date'}
                                        </p>
                                    </td>

                                    <td>
                                        <Badge
                                            variant="outline"
                                            className={statusBadgeClass(
                                                purchaseRequest.status,
                                            )}
                                        >
                                            {purchaseRequest.status_label}
                                        </Badge>
                                    </td>

                                    <td className="text-right text-[13px] text-muted-foreground">
                                        <p className="font-medium text-foreground tabular-nums">
                                            {purchaseRequest.item_count} items
                                        </p>
                                        <p>
                                            {
                                                purchaseRequest.purchase_order_count
                                            }{' '}
                                            orders
                                        </p>
                                    </td>

                                    <td className="text-right">
                                        <div className="flex justify-end">
                                            <DataTableRowActions
                                                items={[
                                                    ...(purchaseRequest.can.view
                                                        ? [
                                                              {
                                                                  key: 'open',
                                                                  label: 'Open',
                                                                  icon: Eye,
                                                                  href: purchaseRequestsShow(
                                                                      purchaseRequest.id,
                                                                  ),
                                                              },
                                                          ]
                                                        : []),
                                                    ...(purchaseRequest.can
                                                        .update
                                                        ? [
                                                              {
                                                                  key: 'edit',
                                                                  label: 'Edit',
                                                                  icon: Pencil,
                                                                  href: purchaseRequestsEdit(
                                                                      purchaseRequest.id,
                                                                  ),
                                                              },
                                                          ]
                                                        : []),
                                                ]}
                                                label={`Open actions for ${purchaseRequest.request_no}`}
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

PurchaseRequestsIndex.layout = {
    breadcrumbs: purchaseRequestBreadcrumbs,
};
