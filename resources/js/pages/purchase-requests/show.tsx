import { Head, Link } from '@inertiajs/react';
import PurchaseRequestController from '@/actions/App/Http/Controllers/Purchasing/PurchaseRequestController';
import { dashboard } from '@/routes';
import {
    create as purchaseOrdersCreate,
    show as purchaseOrdersShow,
} from '@/routes/purchase-orders';
import {
    edit as purchaseRequestsEdit,
    index as purchaseRequestsIndex,
} from '@/routes/purchase-requests';
import { RecordAttachmentsCard } from '@/components/attachments/record-attachments-card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import type { PurchaseRequestDetail } from '@/types';

type Props = {
    purchaseRequest: PurchaseRequestDetail;
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

export default function PurchaseRequestsShow({ purchaseRequest }: Props) {
    const attachments = purchaseRequest.attachments ?? [];
    const purchaseOrders = purchaseRequest.purchase_orders ?? [];
    const items = purchaseRequest.items ?? [];

    return (
        <>
            <Head title={purchaseRequest.request_no} />

            <div className="app-page flex flex-1 flex-col gap-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                            <h1 className="text-2xl font-semibold tracking-tight">
                                {purchaseRequest.request_no}
                            </h1>
                            <Badge
                                variant="outline"
                                className={statusBadgeClass(
                                    purchaseRequest.status,
                                )}
                            >
                                {purchaseRequest.status_label}
                            </Badge>
                        </div>

                        <p className="text-sm text-muted-foreground">
                            {purchaseRequest.purpose}
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        {purchaseRequest.can.create_purchase_order && (
                            <Button variant="outline" asChild>
                                <Link
                                    href={purchaseOrdersCreate({
                                        query: {
                                            purchase_request:
                                                purchaseRequest.id,
                                        },
                                    })}
                                >
                                    Create purchase order
                                </Link>
                            </Button>
                        )}

                        {purchaseRequest.can.update && (
                            <Button asChild>
                                <Link
                                    href={purchaseRequestsEdit(
                                        purchaseRequest.id,
                                    )}
                                >
                                    Edit request
                                </Link>
                            </Button>
                        )}

                        {purchaseRequest.can.delete && (
                            <Button variant="outline" asChild>
                                <Link
                                    href={PurchaseRequestController.destroy(
                                        purchaseRequest.id,
                                    )}
                                    method="delete"
                                    as="button"
                                >
                                    Archive
                                </Link>
                            </Button>
                        )}
                    </div>
                </div>

                <div className="grid gap-4 md:grid-cols-4">
                    <Card>
                        <CardHeader>
                            <CardDescription>Items</CardDescription>
                            <CardTitle>{purchaseRequest.item_count}</CardTitle>
                        </CardHeader>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardDescription>Purchase orders</CardDescription>
                            <CardTitle>
                                {purchaseRequest.purchase_order_count}
                            </CardTitle>
                        </CardHeader>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardDescription>Attachments</CardDescription>
                            <CardTitle>
                                {purchaseRequest.attachment_count}
                            </CardTitle>
                        </CardHeader>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardDescription>Requested by</CardDescription>
                            <CardTitle className="text-base">
                                {purchaseRequest.requested_by ?? 'Not recorded'}
                            </CardTitle>
                        </CardHeader>
                    </Card>
                </div>

                <div className="grid gap-6 xl:grid-cols-[1.35fr_1fr]">
                    <Card>
                        <CardHeader>
                            <CardTitle>Request information</CardTitle>
                            <CardDescription>
                                Purchasing context and operational linkage for
                                this sourcing request.
                            </CardDescription>
                        </CardHeader>

                        <CardContent className="grid gap-5 md:grid-cols-2">
                            <div>
                                <p className="text-sm text-muted-foreground">
                                    Supplier
                                </p>
                                <p className="mt-1 font-medium">
                                    {purchaseRequest.supplier.company_name
                                        ? `${purchaseRequest.supplier.supplier_code} - ${purchaseRequest.supplier.company_name}`
                                        : 'Not set'}
                                </p>
                            </div>

                            <div>
                                <p className="text-sm text-muted-foreground">
                                    Project
                                </p>
                                <p className="mt-1 font-medium">
                                    {purchaseRequest.project.project_no
                                        ? `${purchaseRequest.project.project_no} - ${purchaseRequest.project.title}`
                                        : 'Not set'}
                                </p>
                            </div>

                            <div>
                                <p className="text-sm text-muted-foreground">
                                    Work order
                                </p>
                                <p className="mt-1 font-medium">
                                    {purchaseRequest.work_order.work_order_no
                                        ? `${purchaseRequest.work_order.work_order_no} - ${purchaseRequest.work_order.summary}`
                                        : 'Not set'}
                                </p>
                            </div>

                            <div>
                                <p className="text-sm text-muted-foreground">
                                    Needed by
                                </p>
                                <p className="mt-1 font-medium">
                                    {purchaseRequest.needed_by ?? 'Not set'}
                                </p>
                            </div>

                            <div className="md:col-span-2">
                                <p className="text-sm text-muted-foreground">
                                    Remarks
                                </p>
                                <p className="mt-1 font-medium whitespace-pre-line">
                                    {purchaseRequest.remarks ?? 'No remarks'}
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Linked purchase orders</CardTitle>
                            <CardDescription>
                                Orders created from this request.
                            </CardDescription>
                        </CardHeader>

                        <CardContent className="space-y-3">
                            {purchaseOrders.length === 0 && (
                                <div className="rounded-lg border border-dashed px-4 py-6 text-sm text-muted-foreground">
                                    No purchase orders created yet.
                                </div>
                            )}

                            {purchaseOrders.map((purchaseOrder) => (
                                <div
                                    key={purchaseOrder.id}
                                    className="rounded-lg border px-4 py-3"
                                >
                                    <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                                        <div className="space-y-1">
                                            <p className="font-medium">
                                                {purchaseOrder.po_no}
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                {purchaseOrder.supplier
                                                    .company_name
                                                    ? `${purchaseOrder.supplier.supplier_code} - ${purchaseOrder.supplier.company_name}`
                                                    : 'No supplier'}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {purchaseOrder.receipt_count}{' '}
                                                receipts •{' '}
                                                {purchaseOrder.attachment_count}{' '}
                                                attachments
                                            </p>
                                        </div>

                                        <Badge variant="outline">
                                            {purchaseOrder.status_label}
                                        </Badge>
                                    </div>

                                    {purchaseOrder.can.view && (
                                        <div className="mt-3">
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
                                        </div>
                                    )}
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Requested items</CardTitle>
                        <CardDescription>
                            Line-level material or stock requirements for this
                            request.
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="overflow-x-auto px-0">
                        <table className="min-w-full text-sm">
                            <thead>
                                <tr className="border-b text-left text-muted-foreground">
                                    <th className="px-6 py-3 font-medium">
                                        Item
                                    </th>
                                    <th className="px-6 py-3 font-medium">
                                        Unit
                                    </th>
                                    <th className="px-6 py-3 font-medium">
                                        Quantity
                                    </th>
                                    <th className="px-6 py-3 font-medium">
                                        Est. cost
                                    </th>
                                    <th className="px-6 py-3 font-medium">
                                        Remarks
                                    </th>
                                </tr>
                            </thead>

                            <tbody>
                                {items.map((item) => (
                                    <tr
                                        key={item.id}
                                        className="border-b last:border-0"
                                    >
                                        <td className="px-6 py-4">
                                            <div className="space-y-1">
                                                <p className="font-medium">
                                                    {item.item_description}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    {
                                                        item.inventory_item
                                                            .item_code
                                                    }{' '}
                                                    -{' '}
                                                    {
                                                        item.inventory_item
                                                            .item_name
                                                    }
                                                </p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {item.unit}
                                        </td>
                                        <td className="px-6 py-4">
                                            {item.requested_quantity}
                                        </td>
                                        <td className="px-6 py-4">
                                            {item.estimated_unit_cost === null
                                                ? 'Not set'
                                                : item.estimated_unit_cost}
                                        </td>
                                        <td className="px-6 py-4 text-muted-foreground">
                                            {item.remarks ?? 'No remarks'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </CardContent>
                </Card>

                <RecordAttachmentsCard
                    attachments={attachments}
                    attachableType="purchase_request"
                    attachableId={purchaseRequest.id}
                    canUpload={purchaseRequest.can.upload_attachments}
                    canUnlink={purchaseRequest.can.remove_attachments}
                />
            </div>
        </>
    );
}

PurchaseRequestsShow.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: dashboard() },
        { title: 'Purchase Requests', href: purchaseRequestsIndex() },
        { title: 'Request details', href: purchaseRequestsIndex() },
    ],
};
