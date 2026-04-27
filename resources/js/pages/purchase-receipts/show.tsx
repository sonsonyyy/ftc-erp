import { Head, Link } from '@inertiajs/react';
import { dashboard } from '@/routes';
import { show as purchaseOrdersShow } from '@/routes/purchase-orders';
import { index as purchaseReceiptsIndex } from '@/routes/purchase-receipts';
import { RecordAttachmentsCard } from '@/components/attachments/record-attachments-card';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import type { PurchaseReceiptDetail } from '@/types';

type Props = {
    purchaseReceipt: PurchaseReceiptDetail;
};

export default function PurchaseReceiptsShow({ purchaseReceipt }: Props) {
    const attachments = purchaseReceipt.attachments ?? [];

    return (
        <>
            <Head title={purchaseReceipt.receipt_no} />

            <div className="app-page flex flex-1 flex-col gap-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div className="space-y-2">
                        <h1 className="text-2xl font-semibold tracking-tight">
                            {purchaseReceipt.receipt_no}
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            {purchaseReceipt.supplier.company_name
                                ? `${purchaseReceipt.supplier.supplier_code} - ${purchaseReceipt.supplier.company_name}`
                                : 'Supplier not linked'}
                        </p>
                    </div>

                    {purchaseReceipt.purchase_order.id && (
                        <Button variant="outline" asChild>
                            <Link
                                href={purchaseOrdersShow(
                                    purchaseReceipt.purchase_order.id,
                                )}
                            >
                                View purchase order
                            </Link>
                        </Button>
                    )}
                </div>

                <div className="grid gap-4 md:grid-cols-4">
                    <Card>
                        <CardHeader>
                            <CardDescription>Receipt items</CardDescription>
                            <CardTitle>{purchaseReceipt.item_count}</CardTitle>
                        </CardHeader>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardDescription>Attachments</CardDescription>
                            <CardTitle>
                                {purchaseReceipt.attachment_count}
                            </CardTitle>
                        </CardHeader>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardDescription>Received date</CardDescription>
                            <CardTitle className="text-base">
                                {purchaseReceipt.received_date ?? 'Not set'}
                            </CardTitle>
                        </CardHeader>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardDescription>Received by</CardDescription>
                            <CardTitle className="text-base">
                                {purchaseReceipt.received_by ?? 'Not recorded'}
                            </CardTitle>
                        </CardHeader>
                    </Card>
                </div>

                <div className="grid gap-6 xl:grid-cols-[1.35fr_1fr]">
                    <Card>
                        <CardHeader>
                            <CardTitle>Receipt information</CardTitle>
                            <CardDescription>
                                Delivery and warehouse posting details for this
                                receipt.
                            </CardDescription>
                        </CardHeader>

                        <CardContent className="grid gap-5 md:grid-cols-2">
                            <div>
                                <p className="text-sm text-muted-foreground">
                                    Purchase order
                                </p>
                                <p className="mt-1 font-medium">
                                    {purchaseReceipt.purchase_order.po_no ??
                                        'Not linked'}
                                </p>
                            </div>

                            <div>
                                <p className="text-sm text-muted-foreground">
                                    Warehouse
                                </p>
                                <p className="mt-1 font-medium">
                                    {purchaseReceipt.warehouse.warehouse_code} -{' '}
                                    {purchaseReceipt.warehouse.warehouse_name}
                                </p>
                            </div>

                            <div>
                                <p className="text-sm text-muted-foreground">
                                    Purchase request
                                </p>
                                <p className="mt-1 font-medium">
                                    {purchaseReceipt.purchase_request
                                        .request_no ?? 'Not linked'}
                                </p>
                            </div>

                            <div>
                                <p className="text-sm text-muted-foreground">
                                    Supplier reference
                                </p>
                                <p className="mt-1 font-medium">
                                    {purchaseReceipt.supplier_reference ??
                                        'Not set'}
                                </p>
                            </div>

                            <div>
                                <p className="text-sm text-muted-foreground">
                                    Project
                                </p>
                                <p className="mt-1 font-medium">
                                    {purchaseReceipt.project.project_no
                                        ? `${purchaseReceipt.project.project_no} - ${purchaseReceipt.project.title}`
                                        : 'Not linked'}
                                </p>
                            </div>

                            <div>
                                <p className="text-sm text-muted-foreground">
                                    Work order
                                </p>
                                <p className="mt-1 font-medium">
                                    {purchaseReceipt.work_order.work_order_no
                                        ? `${purchaseReceipt.work_order.work_order_no} - ${purchaseReceipt.work_order.summary}`
                                        : 'Not linked'}
                                </p>
                            </div>

                            <div className="md:col-span-2">
                                <p className="text-sm text-muted-foreground">
                                    Remarks
                                </p>
                                <p className="mt-1 font-medium whitespace-pre-line">
                                    {purchaseReceipt.remarks ?? 'No remarks'}
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Receipt lines</CardTitle>
                            <CardDescription>
                                Line-level quantities captured for this
                                delivery.
                            </CardDescription>
                        </CardHeader>

                        <CardContent className="space-y-3">
                            {purchaseReceipt.items.map((item) => (
                                <div
                                    key={item.id}
                                    className="rounded-lg border px-4 py-3"
                                >
                                    <p className="font-medium">
                                        {item.inventory_item.item_code} -{' '}
                                        {item.inventory_item.item_name}
                                    </p>
                                    <p className="mt-1 text-sm text-muted-foreground">
                                        Received: {item.received_quantity}{' '}
                                        {item.inventory_item.unit}
                                        {' • '}Ordered:{' '}
                                        {item.purchase_order_item
                                            .ordered_quantity ?? 'N/A'}
                                    </p>
                                    <p className="mt-1 text-sm text-muted-foreground">
                                        Unit cost: {item.unit_cost}
                                    </p>
                                    {item.remarks && (
                                        <p className="mt-1 text-sm text-muted-foreground">
                                            {item.remarks}
                                        </p>
                                    )}
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>

                <RecordAttachmentsCard
                    attachments={attachments}
                    attachableType="purchase_receipt"
                    attachableId={purchaseReceipt.id}
                    canUpload={purchaseReceipt.can.upload_attachments}
                    canUnlink={purchaseReceipt.can.remove_attachments}
                />
            </div>
        </>
    );
}

PurchaseReceiptsShow.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: dashboard() },
        { title: 'Purchase Receipts', href: purchaseReceiptsIndex() },
        { title: 'Receipt details', href: purchaseReceiptsIndex() },
    ],
};
