import { Head, Link } from '@inertiajs/react';
import PurchaseOrderController from '@/actions/App/Http/Controllers/Purchasing/PurchaseOrderController';
import PurchaseReceiptController from '@/actions/App/Http/Controllers/Purchasing/PurchaseReceiptController';
import { dashboard } from '@/routes';
import { show as purchaseReceiptsShow } from '@/routes/purchase-receipts';
import { edit as purchaseOrdersEdit, index as purchaseOrdersIndex } from '@/routes/purchase-orders';
import { RecordAttachmentsCard } from '@/components/attachments/record-attachments-card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { PurchaseOrderDetail } from '@/types';

type Props = {
    purchaseOrder: PurchaseOrderDetail;
};

function statusBadgeClass(status: string): string {
    return {
        draft: 'border-slate-200 bg-slate-100 text-slate-700',
        submitted: 'border-sky-200 bg-sky-50 text-sky-700',
        approved: 'border-emerald-200 bg-emerald-50 text-emerald-700',
        partially_received: 'border-amber-200 bg-amber-50 text-amber-700',
        fully_received: 'border-teal-200 bg-teal-50 text-teal-700',
        cancelled: 'border-rose-200 bg-rose-50 text-rose-700',
    }[status] ?? 'border-slate-200 bg-slate-100 text-slate-700';
}

export default function PurchaseOrdersShow({ purchaseOrder }: Props) {
    const items = purchaseOrder.items ?? [];
    const receipts = purchaseOrder.receipts ?? [];
    const attachments = purchaseOrder.attachments ?? [];

    return (
        <>
            <Head title={purchaseOrder.po_no} />

            <div className="flex flex-1 flex-col gap-6 p-4">
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                            <h1 className="text-2xl font-semibold tracking-tight">{purchaseOrder.po_no}</h1>
                            <Badge variant="outline" className={statusBadgeClass(purchaseOrder.status)}>
                                {purchaseOrder.status_label}
                            </Badge>
                        </div>

                        <p className="text-sm text-muted-foreground">
                            {purchaseOrder.supplier.company_name
                                ? `${purchaseOrder.supplier.supplier_code} - ${purchaseOrder.supplier.company_name}`
                                : 'No supplier linked'}
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        {purchaseOrder.can.receive && (
                            <Button variant="outline" asChild>
                                <Link href={PurchaseReceiptController.create(purchaseOrder.id)}>
                                    Record receipt
                                </Link>
                            </Button>
                        )}

                        {purchaseOrder.can.update && (
                            <Button asChild>
                                <Link href={purchaseOrdersEdit(purchaseOrder.id)}>Edit purchase order</Link>
                            </Button>
                        )}

                        {purchaseOrder.can.delete && (
                            <Button variant="outline" asChild>
                                <Link href={PurchaseOrderController.destroy(purchaseOrder.id)} method="delete" as="button">
                                    Archive
                                </Link>
                            </Button>
                        )}
                    </div>
                </div>

                <div className="grid gap-4 md:grid-cols-4">
                    <Card>
                        <CardHeader>
                            <CardDescription>Receipts</CardDescription>
                            <CardTitle>{purchaseOrder.receipt_count}</CardTitle>
                        </CardHeader>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardDescription>Attachments</CardDescription>
                            <CardTitle>{purchaseOrder.attachment_count}</CardTitle>
                        </CardHeader>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardDescription>Ordered by</CardDescription>
                            <CardTitle className="text-base">{purchaseOrder.ordered_by ?? 'Not recorded'}</CardTitle>
                        </CardHeader>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardDescription>Supplier reference</CardDescription>
                            <CardTitle className="text-base">
                                {purchaseOrder.supplier_reference ?? 'Not set'}
                            </CardTitle>
                        </CardHeader>
                    </Card>
                </div>

                <div className="grid gap-6 xl:grid-cols-[1.35fr_1fr]">
                    <Card>
                        <CardHeader>
                            <CardTitle>Order information</CardTitle>
                            <CardDescription>
                                PO linkage and operational context used for receiving and stock posting.
                            </CardDescription>
                        </CardHeader>

                        <CardContent className="grid gap-5 md:grid-cols-2">
                            <div>
                                <p className="text-sm text-muted-foreground">Purchase request</p>
                                <p className="mt-1 font-medium">
                                    {purchaseOrder.purchase_request.request_no ?? 'Not linked'}
                                </p>
                            </div>

                            <div>
                                <p className="text-sm text-muted-foreground">Project</p>
                                <p className="mt-1 font-medium">
                                    {purchaseOrder.project.project_no
                                        ? `${purchaseOrder.project.project_no} - ${purchaseOrder.project.title}`
                                        : 'Not linked'}
                                </p>
                            </div>

                            <div>
                                <p className="text-sm text-muted-foreground">Work order</p>
                                <p className="mt-1 font-medium">
                                    {purchaseOrder.work_order.work_order_no
                                        ? `${purchaseOrder.work_order.work_order_no} - ${purchaseOrder.work_order.summary}`
                                        : 'Not linked'}
                                </p>
                            </div>

                            <div>
                                <p className="text-sm text-muted-foreground">Expected date</p>
                                <p className="mt-1 font-medium">{purchaseOrder.expected_date ?? 'Not set'}</p>
                            </div>

                            <div className="md:col-span-2">
                                <p className="text-sm text-muted-foreground">Remarks</p>
                                <p className="mt-1 whitespace-pre-line font-medium">
                                    {purchaseOrder.remarks ?? 'No remarks'}
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Recorded receipts</CardTitle>
                            <CardDescription>
                                Receiving entries already posted against this purchase order.
                            </CardDescription>
                        </CardHeader>

                        <CardContent className="space-y-3">
                            {receipts.length === 0 && (
                                <div className="rounded-lg border border-dashed px-4 py-6 text-sm text-muted-foreground">
                                    No receipts recorded yet.
                                </div>
                            )}

                            {receipts.map((receipt) => (
                                <div key={receipt.id} className="rounded-lg border px-4 py-3">
                                    <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                                        <div className="space-y-1">
                                            <p className="font-medium">{receipt.receipt_no}</p>
                                            <p className="text-sm text-muted-foreground">
                                                {receipt.warehouse.warehouse_code} - {receipt.warehouse.warehouse_name}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {receipt.received_quantity_total} received • {receipt.item_count} items
                                            </p>
                                        </div>

                                        <p className="text-sm text-muted-foreground">{receipt.received_date ?? 'No date'}</p>
                                    </div>

                                    {receipt.can.view && (
                                        <div className="mt-3">
                                            <Button variant="outline" size="sm" asChild>
                                                <Link href={purchaseReceiptsShow(receipt.id)}>Open</Link>
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
                        <CardTitle>Ordered items</CardTitle>
                        <CardDescription>
                            Item-level quantities, unit costs, and current receiving progress.
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="overflow-x-auto px-0">
                        <table className="min-w-full text-sm">
                            <thead>
                                <tr className="border-b text-left text-muted-foreground">
                                    <th className="px-6 py-3 font-medium">Item</th>
                                    <th className="px-6 py-3 font-medium">Ordered</th>
                                    <th className="px-6 py-3 font-medium">Received</th>
                                    <th className="px-6 py-3 font-medium">Remaining</th>
                                    <th className="px-6 py-3 font-medium">Unit cost</th>
                                    <th className="px-6 py-3 font-medium">Remarks</th>
                                </tr>
                            </thead>

                            <tbody>
                                {items.map((item) => (
                                    <tr key={item.id} className="border-b last:border-0">
                                        <td className="px-6 py-4">
                                            <div className="space-y-1">
                                                <p className="font-medium">{item.item_description}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    {item.inventory_item.item_code} - {item.inventory_item.item_name}
                                                </p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">{item.ordered_quantity}</td>
                                        <td className="px-6 py-4">{item.received_quantity_total}</td>
                                        <td className="px-6 py-4">{item.remaining_quantity}</td>
                                        <td className="px-6 py-4">{item.unit_cost}</td>
                                        <td className="px-6 py-4 text-muted-foreground">{item.remarks ?? 'No remarks'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </CardContent>
                </Card>

                <RecordAttachmentsCard
                    attachments={attachments}
                    attachableType="purchase_order"
                    attachableId={purchaseOrder.id}
                    canUpload={purchaseOrder.can.upload_attachments}
                    canUnlink={purchaseOrder.can.remove_attachments}
                />
            </div>
        </>
    );
}

PurchaseOrdersShow.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: dashboard() },
        { title: 'Purchase Orders', href: purchaseOrdersIndex() },
        { title: 'PO details', href: purchaseOrdersIndex() },
    ],
};
