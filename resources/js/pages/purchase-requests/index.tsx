import { Head, Link } from '@inertiajs/react';
import { dashboard } from '@/routes';
import {
    create as purchaseRequestsCreate,
    edit as purchaseRequestsEdit,
    index as purchaseRequestsIndex,
    show as purchaseRequestsShow,
} from '@/routes/purchase-requests';
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
import { countActiveFilters } from '@/lib/utils';
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
    const activeFilterCount = countActiveFilters(filters);

    return (
        <>
            <Head title="Purchase Requests" />

            <div className="flex flex-1 flex-col gap-6 p-4">
                <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                    <div className="space-y-1">
                        <h1 className="text-2xl font-semibold tracking-tight">
                            Purchase Requests
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Track internal sourcing requests before they become
                            purchase orders.
                        </p>
                    </div>

                    {can.create && (
                        <Button asChild>
                            <Link href={purchaseRequestsCreate()}>
                                New request
                            </Link>
                        </Button>
                    )}
                </div>

                <IndexFiltersCard
                    action={purchaseRequestsIndex()}
                    resetHref={purchaseRequestsIndex()}
                    description="Search by request number, purpose, supplier, project, or work order."
                    activeFilterCount={activeFilterCount}
                    fieldsClassName="xl:grid-cols-[2fr_1.2fr_1fr]"
                >
                    <Input
                        name="search"
                        defaultValue={filters.search}
                        placeholder="Search purchase requests"
                    />

                    <FilterSelect
                        name="supplier"
                        defaultValue={filters.supplier ?? ''}
                    >
                        <option value="">All suppliers</option>
                        {supplierOptions.map((option) => (
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
                </IndexFiltersCard>

                <Card>
                    <CardHeader>
                        <CardTitle>Request registry</CardTitle>
                        <CardDescription>
                            {purchaseRequests.total} purchase requests
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="overflow-x-auto px-0">
                        <table className="min-w-full text-sm">
                            <thead>
                                <tr className="border-b text-left text-muted-foreground">
                                    <th className="px-6 py-3 font-medium">
                                        Request
                                    </th>
                                    <th className="px-6 py-3 font-medium">
                                        Supplier / context
                                    </th>
                                    <th className="px-6 py-3 font-medium">
                                        Dates
                                    </th>
                                    <th className="px-6 py-3 font-medium">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 font-medium">
                                        Lines
                                    </th>
                                    <th className="px-6 py-3 text-right font-medium">
                                        Actions
                                    </th>
                                </tr>
                            </thead>

                            <tbody>
                                {purchaseRequests.data.length === 0 && (
                                    <tr>
                                        <td
                                            colSpan={6}
                                            className="px-6 py-10 text-center text-muted-foreground"
                                        >
                                            No purchase requests matched the
                                            current filters.
                                        </td>
                                    </tr>
                                )}

                                {purchaseRequests.data.map(
                                    (purchaseRequest) => (
                                        <tr
                                            key={purchaseRequest.id}
                                            className="border-b align-top last:border-0"
                                        >
                                            <td className="px-6 py-4">
                                                <div className="space-y-1">
                                                    <p className="font-medium">
                                                        {
                                                            purchaseRequest.request_no
                                                        }
                                                    </p>
                                                    <p className="text-muted-foreground">
                                                        {
                                                            purchaseRequest.purpose
                                                        }
                                                    </p>
                                                </div>
                                            </td>

                                            <td className="px-6 py-4 text-muted-foreground">
                                                <div className="space-y-1">
                                                    <p>
                                                        {purchaseRequest
                                                            .supplier
                                                            .company_name
                                                            ? `${purchaseRequest.supplier.supplier_code} - ${purchaseRequest.supplier.company_name}`
                                                            : 'No supplier selected'}
                                                    </p>
                                                    <p>
                                                        {purchaseRequest.project
                                                            .project_no
                                                            ? `${purchaseRequest.project.project_no} - ${purchaseRequest.project.title}`
                                                            : 'No project'}
                                                    </p>
                                                    <p>
                                                        {purchaseRequest
                                                            .work_order
                                                            .work_order_no
                                                            ? `${purchaseRequest.work_order.work_order_no} - ${purchaseRequest.work_order.summary}`
                                                            : 'No work order'}
                                                    </p>
                                                </div>
                                            </td>

                                            <td className="px-6 py-4 text-muted-foreground">
                                                <div className="space-y-1">
                                                    <p>
                                                        Requested:{' '}
                                                        {purchaseRequest.request_date ??
                                                            'Not set'}
                                                    </p>
                                                    <p>
                                                        Needed by:{' '}
                                                        {purchaseRequest.needed_by ??
                                                            'Not set'}
                                                    </p>
                                                </div>
                                            </td>

                                            <td className="px-6 py-4">
                                                <Badge
                                                    variant="outline"
                                                    className={statusBadgeClass(
                                                        purchaseRequest.status,
                                                    )}
                                                >
                                                    {
                                                        purchaseRequest.status_label
                                                    }
                                                </Badge>
                                            </td>

                                            <td className="px-6 py-4 text-muted-foreground">
                                                <div className="space-y-1">
                                                    <p>
                                                        {
                                                            purchaseRequest.item_count
                                                        }{' '}
                                                        items
                                                    </p>
                                                    <p>
                                                        {
                                                            purchaseRequest.purchase_order_count
                                                        }{' '}
                                                        orders
                                                    </p>
                                                </div>
                                            </td>

                                            <td className="px-6 py-4">
                                                <div className="flex justify-end gap-2">
                                                    {purchaseRequest.can
                                                        .view && (
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            asChild
                                                        >
                                                            <Link
                                                                href={purchaseRequestsShow(
                                                                    purchaseRequest.id,
                                                                )}
                                                            >
                                                                Open
                                                            </Link>
                                                        </Button>
                                                    )}

                                                    {purchaseRequest.can
                                                        .update && (
                                                        <Button
                                                            size="sm"
                                                            asChild
                                                        >
                                                            <Link
                                                                href={purchaseRequestsEdit(
                                                                    purchaseRequest.id,
                                                                )}
                                                            >
                                                                Edit
                                                            </Link>
                                                        </Button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ),
                                )}
                            </tbody>
                        </table>
                    </CardContent>

                    <PaginationLinks pagination={purchaseRequests} />
                </Card>
            </div>
        </>
    );
}

PurchaseRequestsIndex.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: dashboard() },
        { title: 'Purchase Requests', href: purchaseRequestsIndex() },
    ],
};
