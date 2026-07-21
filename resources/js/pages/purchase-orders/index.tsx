import { Head, Link, router } from '@inertiajs/react';
import { Eye, Pencil, Plus } from 'lucide-react';
import { useEffect, useState } from 'react';
import { ClearableSearchInput } from '@/components/clearable-search-input';
import { CompactDataTable } from '@/components/compact-data-table';
import { DataTablePaginationFooter } from '@/components/data-table-pagination-footer';
import { DataTableRowActions } from '@/components/data-table-row-actions';
import { FilterSelect } from '@/components/filter-select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cleanQueryParams, toUrl } from '@/lib/utils';
import { dashboard } from '@/routes';
import {
    create as purchaseOrdersCreate,
    edit as purchaseOrdersEdit,
    index as purchaseOrdersIndex,
    show as purchaseOrdersShow,
} from '@/routes/purchase-orders';
import type {
    PaginatedData,
    PurchaseOrderFilters,
    PurchaseOrderListItem,
    SelectOption,
} from '@/types';

type Props = {
    purchaseOrders: PaginatedData<PurchaseOrderListItem>;
    filters: PurchaseOrderFilters;
    statusOptions: SelectOption[];
    can: {
        create: boolean;
    };
};

const purchaseOrderBreadcrumbs = [
    {
        title: 'Dashboard',
        href: dashboard(),
    },
    {
        title: 'Purchase Orders',
        href: purchaseOrdersIndex(),
    },
];

const perPageOptions = ['5', '10', '15', '25'];

function statusBadgeClass(status: string): string {
    return (
        {
            draft: 'border-slate-200 bg-slate-100 text-slate-700',
            submitted: 'border-sky-200 bg-sky-50 text-sky-700',
            approved: 'border-emerald-200 bg-emerald-50 text-emerald-700',
            partially_received: 'border-amber-200 bg-amber-50 text-amber-700',
            fully_received: 'border-teal-200 bg-teal-50 text-teal-700',
            cancelled: 'border-rose-200 bg-rose-50 text-rose-700',
        }[status] ?? 'border-slate-200 bg-slate-100 text-slate-700'
    );
}

export default function PurchaseOrdersIndex({
    purchaseOrders,
    filters,
    statusOptions,
    can,
}: Props) {
    const [searchInput, setSearchInput] = useState(filters.search);
    const [tableFilters, setTableFilters] = useState({
        status: filters.status,
        per_page: String(filters.per_page),
    });

    useEffect(() => {
        const syncFilters = window.setTimeout(() => {
            setTableFilters((currentFilters) => {
                const nextFilters = {
                    status: filters.status,
                    per_page: String(filters.per_page),
                };

                if (
                    currentFilters.status === nextFilters.status &&
                    currentFilters.per_page === nextFilters.per_page
                ) {
                    return currentFilters;
                }

                return nextFilters;
            });
        }, 0);

        return () => window.clearTimeout(syncFilters);
    }, [filters.per_page, filters.status]);

    useEffect(() => {
        const normalizedSearch = searchInput.trim();
        const currentPerPage = String(filters.per_page);

        if (
            normalizedSearch === filters.search &&
            tableFilters.status === filters.status &&
            tableFilters.per_page === currentPerPage
        ) {
            return;
        }

        const timeout = window.setTimeout(() => {
            router.cancelAll();
            router.get(
                toUrl(purchaseOrdersIndex()),
                cleanQueryParams({
                    search: normalizedSearch,
                    status: tableFilters.status,
                    per_page: Number(tableFilters.per_page),
                    page: 1,
                }),
                {
                    only: ['purchaseOrders', 'filters'],
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
        searchInput,
        tableFilters,
    ]);

    return (
        <>
            <Head title="Purchase Orders" />

            <div className="app-page flex flex-1 flex-col gap-6">
                <div className="space-y-1.5">
                    <h1 className="text-2xl font-semibold tracking-tight">
                        Purchase Orders
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Order release and receiving progress by supplier.
                    </p>
                </div>

                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center">
                        <ClearableSearchInput
                            value={searchInput}
                            onChange={setSearchInput}
                            placeholder="Search purchase orders"
                        />

                        <FilterSelect
                            value={tableFilters.status}
                            onChange={(event) => {
                                router.cancelAll();
                                setTableFilters((currentFilters) => ({
                                    ...currentFilters,
                                    status: event.currentTarget.value,
                                }));
                            }}
                            className="w-full sm:w-[180px]"
                        >
                            <option value="">All statuses</option>
                            {statusOptions.map((option) => (
                                <option
                                    key={option.value}
                                    value={String(option.value)}
                                >
                                    {option.label}
                                </option>
                            ))}
                        </FilterSelect>
                    </div>

                    {can.create ? (
                        <Button asChild className="lg:shrink-0">
                            <Link href={purchaseOrdersCreate()}>
                                <Plus />
                                New purchase order
                            </Link>
                        </Button>
                    ) : null}
                </div>

                <CompactDataTable
                    footer={
                        <DataTablePaginationFooter
                            pagination={purchaseOrders}
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
                                <th>PO</th>
                                <th>Supplier / linkage</th>
                                <th>Dates</th>
                                <th>Status</th>
                                <th className="text-right">Receiving</th>
                                <th className="text-right">Actions</th>
                            </tr>
                        </thead>

                        <tbody>
                            {purchaseOrders.data.length === 0 && (
                                <tr>
                                    <td
                                        colSpan={6}
                                        className="py-10 text-center text-sm text-muted-foreground"
                                    >
                                        No purchase orders matched the current
                                        filters.
                                    </td>
                                </tr>
                            )}

                            {purchaseOrders.data.map((purchaseOrder) => (
                                <tr key={purchaseOrder.id}>
                                    <td>
                                        <div className="space-y-0.5">
                                            <p className="max-w-[14rem] truncate font-semibold text-foreground">
                                                {purchaseOrder.po_no}
                                            </p>
                                            <p className="max-w-[16rem] truncate text-[13px] text-muted-foreground">
                                                {purchaseOrder.supplier_reference ??
                                                    'No supplier reference'}
                                            </p>
                                        </div>
                                    </td>

                                    <td>
                                        <div className="space-y-0.5">
                                            <p className="max-w-[18rem] truncate font-medium text-foreground">
                                                {purchaseOrder.supplier
                                                    .company_name
                                                    ? `${purchaseOrder.supplier.supplier_code} • ${purchaseOrder.supplier.company_name}`
                                                    : 'No supplier'}
                                            </p>
                                            <p className="max-w-[18rem] truncate text-[13px] text-muted-foreground">
                                                {purchaseOrder.purchase_request
                                                    .request_no
                                                    ? `PR • ${purchaseOrder.purchase_request.request_no}`
                                                    : purchaseOrder.project
                                                            .project_no
                                                      ? `${purchaseOrder.project.project_no} • ${purchaseOrder.project.title ?? 'Project'}`
                                                      : purchaseOrder.work_order
                                                              .work_order_no
                                                        ? `${purchaseOrder.work_order.work_order_no} • ${purchaseOrder.work_order.summary ?? 'Work order'}`
                                                        : 'No linked request or job'}
                                            </p>
                                        </div>
                                    </td>

                                    <td className="text-[13px] text-muted-foreground">
                                        <p>
                                            {purchaseOrder.order_date ??
                                                'No order date'}
                                        </p>
                                        <p>
                                            {purchaseOrder.expected_date ??
                                                'No expected date'}
                                        </p>
                                    </td>

                                    <td>
                                        <Badge
                                            variant="outline"
                                            className={statusBadgeClass(
                                                purchaseOrder.status,
                                            )}
                                        >
                                            {purchaseOrder.status_label}
                                        </Badge>
                                    </td>

                                    <td className="text-right text-[13px] text-muted-foreground">
                                        <p className="font-medium text-foreground tabular-nums">
                                            Ordered{' '}
                                            {purchaseOrder.ordered_quantity_total.toFixed(
                                                2,
                                            )}
                                        </p>
                                        <p>
                                            Received{' '}
                                            {purchaseOrder.received_quantity_total.toFixed(
                                                2,
                                            )}{' '}
                                            • {purchaseOrder.receipt_count}{' '}
                                            receipts
                                        </p>
                                    </td>

                                    <td className="text-right">
                                        <div className="flex justify-end">
                                            <DataTableRowActions
                                                resourceLabel="purchase order"
                                                items={[
                                                    ...(purchaseOrder.can.view
                                                        ? [
                                                              {
                                                                  key: 'open',
                                                                  label: 'Open',
                                                                  icon: Eye,
                                                                  href: purchaseOrdersShow(
                                                                      purchaseOrder.id,
                                                                  ),
                                                              },
                                                          ]
                                                        : []),
                                                    ...(purchaseOrder.can.update
                                                        ? [
                                                              {
                                                                  key: 'edit',
                                                                  label: 'Edit',
                                                                  icon: Pencil,
                                                                  href: purchaseOrdersEdit(
                                                                      purchaseOrder.id,
                                                                  ),
                                                              },
                                                          ]
                                                        : []),
                                                ]}
                                                label={`Open actions for ${purchaseOrder.po_no}`}
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

PurchaseOrdersIndex.layout = {
    breadcrumbs: purchaseOrderBreadcrumbs,
};
