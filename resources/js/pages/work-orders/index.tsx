import { Head, Link, router } from '@inertiajs/react';
import {
    Archive,
    ChevronDown,
    Download,
    Ellipsis,
    Eye,
    Pencil,
    Plus,
    Search,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { CompactDataTable } from '@/components/compact-data-table';
import { DataTablePaginationFooter } from '@/components/data-table-pagination-footer';
import { DataTableRowActions } from '@/components/data-table-row-actions';
import { FilterSelect } from '@/components/filter-select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { cleanQueryParams, toUrl } from '@/lib/utils';
import { dashboard } from '@/routes';
import {
    create as workOrdersCreate,
    destroy as workOrdersDestroy,
    edit as workOrdersEdit,
    index as workOrdersIndex,
    show as workOrdersShow,
} from '@/routes/work-orders';
import type {
    PaginatedData,
    SelectOption,
    WorkOrderFilters,
    WorkOrderListItem,
} from '@/types';

type Props = {
    workOrders: PaginatedData<WorkOrderListItem>;
    filters: WorkOrderFilters;
    statusOptions: SelectOption[];
    priorityOptions: SelectOption[];
    serviceTypeOptions: SelectOption[];
    can: {
        create: boolean;
    };
};

const workOrderBreadcrumbs = [
    {
        title: 'Dashboard',
        href: dashboard(),
    },
    {
        title: 'Work Orders',
        href: workOrdersIndex(),
    },
];

const perPageOptions = ['5', '10', '15', '25'];

function formatDate(date: string | null): string {
    if (!date) {
        return 'Not set';
    }

    return new Intl.DateTimeFormat('en-PH', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    }).format(new Date(date));
}

function priorityBadgeClass(priority: string): string {
    return (
        {
            low: 'border-slate-200 bg-slate-100 text-slate-700',
            normal: 'border-sky-200 bg-sky-50 text-sky-700',
            high: 'border-amber-200 bg-amber-50 text-amber-700',
            urgent: 'border-rose-200 bg-rose-50 text-rose-700',
        }[priority] ?? 'border-slate-200 bg-slate-100 text-slate-700'
    );
}

function statusBadgeClass(status: string): string {
    return (
        {
            draft: 'border-slate-200 bg-slate-100 text-slate-700',
            scheduled: 'border-sky-200 bg-sky-50 text-sky-700',
            in_progress: 'border-amber-200 bg-amber-50 text-amber-700',
            for_review: 'border-orange-200 bg-orange-50 text-orange-700',
            completed: 'border-emerald-200 bg-emerald-50 text-emerald-700',
            closed: 'border-stone-200 bg-stone-100 text-stone-700',
            cancelled: 'border-rose-200 bg-rose-50 text-rose-700',
        }[status] ?? 'border-slate-200 bg-slate-100 text-slate-700'
    );
}

export default function WorkOrdersIndex({
    workOrders,
    filters,
    statusOptions,
    priorityOptions,
    serviceTypeOptions,
    can,
}: Props) {
    const [searchInput, setSearchInput] = useState(filters.search);
    const [tableFilters, setTableFilters] = useState({
        status: filters.status,
        priority: filters.priority,
        service_type: filters.service_type,
        per_page: String(filters.per_page),
    });

    useEffect(() => {
        setTableFilters((currentFilters) => {
            const nextFilters = {
                status: filters.status,
                priority: filters.priority,
                service_type: filters.service_type,
                per_page: String(filters.per_page),
            };

            if (
                currentFilters.status === nextFilters.status &&
                currentFilters.priority === nextFilters.priority &&
                currentFilters.service_type === nextFilters.service_type &&
                currentFilters.per_page === nextFilters.per_page
            ) {
                return currentFilters;
            }

            return nextFilters;
        });
    }, [
        filters.per_page,
        filters.priority,
        filters.service_type,
        filters.status,
    ]);

    useEffect(() => {
        const normalizedSearch = searchInput.trim();
        const currentPerPage = String(filters.per_page);

        if (
            normalizedSearch === filters.search &&
            tableFilters.status === filters.status &&
            tableFilters.priority === filters.priority &&
            tableFilters.service_type === filters.service_type &&
            tableFilters.per_page === currentPerPage
        ) {
            return;
        }

        const timeout = window.setTimeout(() => {
            router.cancelAll();
            router.get(
                toUrl(workOrdersIndex()),
                cleanQueryParams({
                    search: normalizedSearch,
                    status: tableFilters.status,
                    priority: tableFilters.priority,
                    service_type: tableFilters.service_type,
                    per_page: Number(tableFilters.per_page),
                    page: 1,
                }),
                {
                    only: ['workOrders', 'filters'],
                    replace: true,
                    preserveState: true,
                    preserveScroll: true,
                },
            );
        }, 300);

        return () => window.clearTimeout(timeout);
    }, [
        filters.per_page,
        filters.priority,
        filters.search,
        filters.service_type,
        filters.status,
        searchInput,
        tableFilters,
    ]);
    const exportHref = workOrdersIndex({
        query: cleanQueryParams({
            search: searchInput.trim(),
            status: tableFilters.status,
            priority: tableFilters.priority,
            service_type: tableFilters.service_type,
            export: 'csv',
        }),
    });

    return (
        <>
            <Head title="Work Orders" />

            <div className="app-page flex flex-1 flex-col gap-6">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                    <div className="space-y-1.5">
                        <h1 className="text-2xl font-semibold tracking-tight">
                            Work Orders
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Coordinate field jobs, schedules, and execution.
                        </p>
                    </div>

                    {can.create && (
                        <Button asChild>
                            <Link href={workOrdersCreate()}>
                                <Plus />
                                New work order
                            </Link>
                        </Button>
                    )}
                </div>

                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center">
                        <div className="relative w-full sm:max-w-sm">
                            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                value={searchInput}
                                onChange={(event) =>
                                    setSearchInput(event.currentTarget.value)
                                }
                                placeholder="Search work orders, customers, or projects"
                                className="h-9 pl-9"
                            />
                        </div>

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

                        <FilterSelect
                            value={tableFilters.priority}
                            onChange={(event) => {
                                router.cancelAll();
                                setTableFilters((currentFilters) => ({
                                    ...currentFilters,
                                    priority: event.currentTarget.value,
                                }));
                            }}
                            className="w-full sm:w-[170px]"
                        >
                            <option value="">All priorities</option>
                            {priorityOptions.map((option) => (
                                <option
                                    key={option.value}
                                    value={String(option.value)}
                                >
                                    {option.label}
                                </option>
                            ))}
                        </FilterSelect>

                        <FilterSelect
                            value={tableFilters.service_type}
                            onChange={(event) => {
                                router.cancelAll();
                                setTableFilters((currentFilters) => ({
                                    ...currentFilters,
                                    service_type: event.currentTarget.value,
                                }));
                            }}
                            className="w-full sm:w-[210px]"
                        >
                            <option value="">All service types</option>
                            {serviceTypeOptions.map((option) => (
                                <option
                                    key={option.value}
                                    value={String(option.value)}
                                >
                                    {option.label}
                                </option>
                            ))}
                        </FilterSelect>
                    </div>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="outline"
                                size="sm"
                                className="h-9 bg-background"
                            >
                                <Ellipsis />
                                Actions
                                <ChevronDown />
                            </Button>
                        </DropdownMenuTrigger>

                        <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem asChild>
                                <a href={toUrl(exportHref)}>
                                    <Download />
                                    Export CSV
                                </a>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                <CompactDataTable
                    footer={
                        <DataTablePaginationFooter
                            pagination={workOrders}
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
                                <th>Work order</th>
                                <th>Customer / site</th>
                                <th>Schedule</th>
                                <th>Priority</th>
                                <th>Status</th>
                                <th className="text-right">Attachments</th>
                                <th className="text-right">Actions</th>
                            </tr>
                        </thead>

                        <tbody>
                            {workOrders.data.length === 0 && (
                                <tr>
                                    <td
                                        colSpan={7}
                                        className="py-10 text-center text-sm text-muted-foreground"
                                    >
                                        No work orders matched the current
                                        filters.
                                    </td>
                                </tr>
                            )}

                            {workOrders.data.map((workOrder) => (
                                <tr key={workOrder.id}>
                                    <td>
                                        <div className="space-y-0.5">
                                            <p className="max-w-[16rem] truncate font-semibold text-foreground">
                                                {workOrder.work_order_no}
                                            </p>
                                            <p className="max-w-[18rem] truncate text-[13px] text-muted-foreground">
                                                {[
                                                    workOrder.summary,
                                                    workOrder.service_type_label,
                                                ]
                                                    .filter(Boolean)
                                                    .join(' • ')}
                                            </p>
                                        </div>
                                    </td>

                                    <td>
                                        <div className="space-y-0.5">
                                            <p className="max-w-[18rem] truncate font-medium text-foreground">
                                                {workOrder.customer
                                                    .company_name ??
                                                    'Unlinked customer'}
                                            </p>
                                            <p className="max-w-[18rem] truncate text-[13px] text-muted-foreground">
                                                {[
                                                    workOrder.customer
                                                        .customer_code,
                                                    workOrder.site.site_name,
                                                ]
                                                    .filter(Boolean)
                                                    .join(' • ') ||
                                                    'No site linked'}
                                            </p>
                                        </div>
                                    </td>

                                    <td className="text-[13px] text-muted-foreground">
                                        <div className="space-y-0.5 leading-5">
                                            <p className="max-w-[14rem] truncate">
                                                Scheduled:{' '}
                                                {formatDate(
                                                    workOrder.scheduled_date,
                                                )}
                                            </p>
                                            <p className="max-w-[14rem] truncate">
                                                {workOrder.project.project_no
                                                    ? `Project: ${workOrder.project.project_no}`
                                                    : 'No project linked'}
                                            </p>
                                        </div>
                                    </td>

                                    <td>
                                        <Badge
                                            variant="outline"
                                            className={priorityBadgeClass(
                                                workOrder.priority,
                                            )}
                                        >
                                            {workOrder.priority_label}
                                        </Badge>
                                    </td>

                                    <td>
                                        <Badge
                                            variant="outline"
                                            className={statusBadgeClass(
                                                workOrder.status,
                                            )}
                                        >
                                            {workOrder.status_label}
                                        </Badge>
                                    </td>

                                    <td className="text-right font-medium tabular-nums">
                                        {workOrder.attachment_count}
                                    </td>

                                    <td className="text-right">
                                        <div className="flex justify-end">
                                            <DataTableRowActions
                                                items={[
                                                    ...(workOrder.can.view
                                                        ? [
                                                              {
                                                                  key: 'open',
                                                                  label: 'Open',
                                                                  icon: Eye,
                                                                  href: workOrdersShow(
                                                                      workOrder.id,
                                                                  ),
                                                              },
                                                          ]
                                                        : []),
                                                    ...(workOrder.can.update
                                                        ? [
                                                              {
                                                                  key: 'edit',
                                                                  label: 'Edit',
                                                                  icon: Pencil,
                                                                  href: workOrdersEdit(
                                                                      workOrder.id,
                                                                  ),
                                                              },
                                                          ]
                                                        : []),
                                                    ...(workOrder.can.delete
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
                                                                                  workOrdersDestroy(
                                                                                      workOrder.id,
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
                                                label={`Open actions for ${workOrder.work_order_no}`}
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

WorkOrdersIndex.layout = {
    breadcrumbs: workOrderBreadcrumbs,
};
