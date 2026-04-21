import { Head, Link } from '@inertiajs/react';
import { dashboard } from '@/routes';
import {
    create as purchaseOrdersCreate,
    edit as purchaseOrdersEdit,
    index as purchaseOrdersIndex,
    show as purchaseOrdersShow,
} from '@/routes/purchase-orders';
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
    PurchaseOrderFilters,
    PurchaseOrderListItem,
    SelectOption,
} from '@/types';

type Props = {
    purchaseOrders: PaginatedData<PurchaseOrderListItem>;
    filters: PurchaseOrderFilters;
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
    supplierOptions,
    statusOptions,
    can,
}: Props) {
    const activeFilterCount = countActiveFilters(filters);
    const exportHref = purchaseOrdersIndex({
        query: cleanQueryParams({
            ...filters,
            export: 'csv',
        }),
    });

    return (
        <>
            <Head title="Purchase Orders" />

            <div className="flex flex-1 flex-col gap-6 p-4">
                <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                    <div className="space-y-1">
                        <h1 className="text-2xl font-semibold tracking-tight">
                            Purchase Orders
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Track ordering progress and receiving readiness
                            against approved sourcing needs.
                        </p>
                    </div>

                    {can.create && (
                        <Button asChild>
                            <Link href={purchaseOrdersCreate()}>
                                New purchase order
                            </Link>
                        </Button>
                    )}
                </div>

                <IndexFiltersCard
                    action={purchaseOrdersIndex()}
                    resetHref={purchaseOrdersIndex()}
                    exportHref={exportHref}
                    description="Search by PO number, supplier reference, supplier, request, project, or work order."
                    activeFilterCount={activeFilterCount}
                    fieldsClassName="xl:grid-cols-[2fr_1.2fr_1fr]"
                >
                    <Input
                        name="search"
                        defaultValue={filters.search}
                        placeholder="Search purchase orders"
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
                        <CardTitle>Purchase-order registry</CardTitle>
                        <CardDescription>
                            {purchaseOrders.total} purchase orders
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="overflow-x-auto px-0">
                        <table className="min-w-full text-sm">
                            <thead>
                                <tr className="border-b text-left text-muted-foreground">
                                    <th className="px-6 py-3 font-medium">
                                        PO
                                    </th>
                                    <th className="px-6 py-3 font-medium">
                                        Supplier / linkage
                                    </th>
                                    <th className="px-6 py-3 font-medium">
                                        Dates
                                    </th>
                                    <th className="px-6 py-3 font-medium">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 font-medium">
                                        Receiving
                                    </th>
                                    <th className="px-6 py-3 text-right font-medium">
                                        Actions
                                    </th>
                                </tr>
                            </thead>

                            <tbody>
                                {purchaseOrders.data.length === 0 && (
                                    <tr>
                                        <td
                                            colSpan={6}
                                            className="px-6 py-10 text-center text-muted-foreground"
                                        >
                                            No purchase orders matched the
                                            current filters.
                                        </td>
                                    </tr>
                                )}

                                {purchaseOrders.data.map((purchaseOrder) => (
                                    <tr
                                        key={purchaseOrder.id}
                                        className="border-b align-top last:border-0"
                                    >
                                        <td className="px-6 py-4">
                                            <div className="space-y-1">
                                                <p className="font-medium">
                                                    {purchaseOrder.po_no}
                                                </p>
                                                <p className="text-muted-foreground">
                                                    {purchaseOrder.supplier_reference ??
                                                        'No supplier reference'}
                                                </p>
                                            </div>
                                        </td>

                                        <td className="px-6 py-4 text-muted-foreground">
                                            <div className="space-y-1">
                                                <p>
                                                    {purchaseOrder.supplier
                                                        .company_name
                                                        ? `${purchaseOrder.supplier.supplier_code} - ${purchaseOrder.supplier.company_name}`
                                                        : 'No supplier'}
                                                </p>
                                                <p>
                                                    {purchaseOrder
                                                        .purchase_request
                                                        .request_no
                                                        ? `PR: ${purchaseOrder.purchase_request.request_no}`
                                                        : 'No purchase request'}
                                                </p>
                                                <p>
                                                    {purchaseOrder.project
                                                        .project_no
                                                        ? `${purchaseOrder.project.project_no} - ${purchaseOrder.project.title}`
                                                        : purchaseOrder
                                                                .work_order
                                                                .work_order_no
                                                          ? `${purchaseOrder.work_order.work_order_no} - ${purchaseOrder.work_order.summary}`
                                                          : 'No project / work order'}
                                                </p>
                                            </div>
                                        </td>

                                        <td className="px-6 py-4 text-muted-foreground">
                                            <div className="space-y-1">
                                                <p>
                                                    Order date:{' '}
                                                    {purchaseOrder.order_date ??
                                                        'Not set'}
                                                </p>
                                                <p>
                                                    Expected:{' '}
                                                    {purchaseOrder.expected_date ??
                                                        'Not set'}
                                                </p>
                                            </div>
                                        </td>

                                        <td className="px-6 py-4">
                                            <Badge
                                                variant="outline"
                                                className={statusBadgeClass(
                                                    purchaseOrder.status,
                                                )}
                                            >
                                                {purchaseOrder.status_label}
                                            </Badge>
                                        </td>

                                        <td className="px-6 py-4 text-muted-foreground">
                                            <div className="space-y-1">
                                                <p>
                                                    Ordered:{' '}
                                                    {
                                                        purchaseOrder.ordered_quantity_total
                                                    }
                                                </p>
                                                <p>
                                                    Received:{' '}
                                                    {
                                                        purchaseOrder.received_quantity_total
                                                    }
                                                </p>
                                                <p>
                                                    {
                                                        purchaseOrder.receipt_count
                                                    }{' '}
                                                    receipts
                                                </p>
                                            </div>
                                        </td>

                                        <td className="px-6 py-4">
                                            <div className="flex justify-end gap-2">
                                                {purchaseOrder.can.view && (
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        asChild
                                                    >
                                                        <Link
                                                            href={purchaseOrdersShow(
                                                                purchaseOrder.id,
                                                            )}
                                                        >
                                                            Open
                                                        </Link>
                                                    </Button>
                                                )}

                                                {purchaseOrder.can.update && (
                                                    <Button size="sm" asChild>
                                                        <Link
                                                            href={purchaseOrdersEdit(
                                                                purchaseOrder.id,
                                                            )}
                                                        >
                                                            Edit
                                                        </Link>
                                                    </Button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </CardContent>

                    <PaginationLinks pagination={purchaseOrders} />
                </Card>
            </div>
        </>
    );
}

PurchaseOrdersIndex.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: dashboard() },
        { title: 'Purchase Orders', href: purchaseOrdersIndex() },
    ],
};
