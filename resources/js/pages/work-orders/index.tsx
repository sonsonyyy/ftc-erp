import { Head, Link } from '@inertiajs/react';
import { dashboard } from '@/routes';
import {
    create as workOrdersCreate,
    index as workOrdersIndex,
    show as workOrdersShow,
} from '@/routes/work-orders';
import { FilterSelect } from '@/components/filter-select';
import { IndexFiltersCard } from '@/components/index-filters-card';
import { PaginationLinks } from '@/components/pagination-links';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { cleanQueryParams, countActiveFilters } from '@/lib/utils';
import type {
    PaginatedData,
    SelectOption,
    WorkOrderFilters,
    WorkOrderListItem,
} from '@/types';

type Props = {
    workOrders: PaginatedData<WorkOrderListItem>;
    filters: WorkOrderFilters;
    customerOptions: SelectOption[];
    projectOptions: SelectOption[];
    statusOptions: SelectOption[];
    priorityOptions: SelectOption[];
    serviceTypeOptions: SelectOption[];
    can: {
        create: boolean;
    };
};

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
    customerOptions,
    projectOptions,
    statusOptions,
    priorityOptions,
    serviceTypeOptions,
    can,
}: Props) {
    const activeFilterCount = countActiveFilters(filters);
    const exportHref = workOrdersIndex({
        query: cleanQueryParams({
            ...filters,
            export: 'csv',
        }),
    });

    return (
        <>
            <Head title="Work Orders" />

            <div className="flex flex-1 flex-col gap-6 p-4">
                <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                    <div className="space-y-1">
                        <h1 className="text-2xl font-semibold tracking-tight">
                            Work Orders
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Coordinate service jobs, execution tasks, technician
                            notes, and material usage in one place.
                        </p>
                    </div>

                    {can.create && (
                        <Button asChild>
                            <Link href={workOrdersCreate()}>
                                New work order
                            </Link>
                        </Button>
                    )}
                </div>

                <IndexFiltersCard
                    action={workOrdersIndex()}
                    resetHref={workOrdersIndex()}
                    exportHref={exportHref}
                    description="Search by work order number, summary, customer, site, quotation, or project."
                    activeFilterCount={activeFilterCount}
                    fieldsClassName="xl:grid-cols-[2fr_1.4fr_1.4fr_1fr_1fr_1.4fr]"
                >
                    <Input
                        name="search"
                        defaultValue={filters.search}
                        placeholder="Search work orders"
                    />

                    <FilterSelect
                        name="customer"
                        defaultValue={filters.customer ?? ''}
                    >
                        <option value="">All customers</option>
                        {customerOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </FilterSelect>

                    <FilterSelect
                        name="project"
                        defaultValue={filters.project ?? ''}
                    >
                        <option value="">All projects</option>
                        {projectOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </FilterSelect>

                    <FilterSelect name="status" defaultValue={filters.status}>
                        <option value="">All statuses</option>
                        {statusOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </FilterSelect>

                    <FilterSelect
                        name="priority"
                        defaultValue={filters.priority}
                    >
                        <option value="">All priorities</option>
                        {priorityOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </FilterSelect>

                    <FilterSelect
                        name="service_type"
                        defaultValue={filters.service_type}
                    >
                        <option value="">All service types</option>
                        {serviceTypeOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </FilterSelect>
                </IndexFiltersCard>

                <Card>
                    <CardHeader>
                        <CardTitle>Work order registry</CardTitle>
                        <CardDescription>
                            {workOrders.total} work order records
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="overflow-x-auto px-0">
                        <table className="min-w-full text-sm">
                            <thead>
                                <tr className="border-b text-left text-muted-foreground">
                                    <th className="px-6 py-3 font-medium">
                                        Work order
                                    </th>
                                    <th className="px-6 py-3 font-medium">
                                        Customer / site
                                    </th>
                                    <th className="px-6 py-3 font-medium">
                                        Schedule
                                    </th>
                                    <th className="px-6 py-3 font-medium">
                                        Priority
                                    </th>
                                    <th className="px-6 py-3 font-medium">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-right font-medium">
                                        Actions
                                    </th>
                                </tr>
                            </thead>

                            <tbody>
                                {workOrders.data.length === 0 && (
                                    <tr>
                                        <td
                                            colSpan={6}
                                            className="px-6 py-10 text-center text-muted-foreground"
                                        >
                                            No work orders matched the current
                                            filters.
                                        </td>
                                    </tr>
                                )}

                                {workOrders.data.map((workOrder) => (
                                    <tr
                                        key={workOrder.id}
                                        className="border-b align-top last:border-0"
                                    >
                                        <td className="px-6 py-4">
                                            <div className="space-y-1">
                                                <p className="font-medium">
                                                    {workOrder.work_order_no}
                                                </p>
                                                <p className="text-muted-foreground">
                                                    {workOrder.summary}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    {
                                                        workOrder.service_type_label
                                                    }
                                                </p>
                                            </div>
                                        </td>

                                        <td className="px-6 py-4 text-muted-foreground">
                                            <div className="space-y-1">
                                                <p>
                                                    {
                                                        workOrder.customer
                                                            .customer_code
                                                    }{' '}
                                                    -{' '}
                                                    {
                                                        workOrder.customer
                                                            .company_name
                                                    }
                                                </p>
                                                <p>
                                                    {workOrder.site.site_name ??
                                                        'No site linked'}
                                                </p>
                                                {workOrder.project
                                                    .project_no && (
                                                    <p className="text-xs">
                                                        Project:{' '}
                                                        {
                                                            workOrder.project
                                                                .project_no
                                                        }
                                                    </p>
                                                )}
                                            </div>
                                        </td>

                                        <td className="px-6 py-4 text-muted-foreground">
                                            <div className="space-y-1">
                                                <p>
                                                    Scheduled:{' '}
                                                    {formatDate(
                                                        workOrder.scheduled_date,
                                                    )}
                                                </p>
                                                <p>
                                                    {workOrder.attachment_count}{' '}
                                                    attachments
                                                </p>
                                            </div>
                                        </td>

                                        <td className="px-6 py-4">
                                            <Badge
                                                variant="outline"
                                                className={priorityBadgeClass(
                                                    workOrder.priority,
                                                )}
                                            >
                                                {workOrder.priority_label}
                                            </Badge>
                                        </td>

                                        <td className="px-6 py-4">
                                            <Badge
                                                variant="outline"
                                                className={statusBadgeClass(
                                                    workOrder.status,
                                                )}
                                            >
                                                {workOrder.status_label}
                                            </Badge>
                                        </td>

                                        <td className="px-6 py-4 text-right">
                                            {workOrder.can.view && (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    asChild
                                                >
                                                    <Link
                                                        href={workOrdersShow(
                                                            workOrder.id,
                                                        )}
                                                    >
                                                        Open
                                                    </Link>
                                                </Button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </CardContent>

                    <PaginationLinks pagination={workOrders} />
                </Card>
            </div>
        </>
    );
}

WorkOrdersIndex.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: dashboard() },
        { title: 'Work Orders', href: workOrdersIndex() },
    ],
};
