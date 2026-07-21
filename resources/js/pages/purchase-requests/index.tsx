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
                toUrl(purchaseRequestsIndex()),
                cleanQueryParams({
                    search: normalizedSearch,
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
        searchInput,
        tableFilters,
    ]);

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
                        <ClearableSearchInput
                            value={searchInput}
                            onChange={setSearchInput}
                            placeholder="Search purchase requests"
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
                                                resourceLabel="purchase request"
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
