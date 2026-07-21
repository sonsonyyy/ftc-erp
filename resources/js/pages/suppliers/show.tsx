import { Head, Link } from '@inertiajs/react';
import SupplierController from '@/actions/App/Http/Controllers/Purchasing/SupplierController';
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
import { dashboard } from '@/routes';
import {
    create as purchaseOrdersCreate,
    show as purchaseOrdersShow,
} from '@/routes/purchase-orders';
import {
    create as purchaseRequestsCreate,
    show as purchaseRequestsShow,
} from '@/routes/purchase-requests';
import {
    edit as suppliersEdit,
    index as suppliersIndex,
} from '@/routes/suppliers';
import type { SupplierDetail } from '@/types';

type Props = {
    supplier: SupplierDetail;
};

function badgeClass(isActive: boolean): string {
    return isActive
        ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
        : 'border-slate-200 bg-slate-100 text-slate-700';
}

export default function SuppliersShow({ supplier }: Props) {
    const purchaseRequests = supplier.purchase_requests ?? [];
    const purchaseOrders = supplier.purchase_orders ?? [];
    const attachments = supplier.attachments ?? [];

    return (
        <>
            <Head title={supplier.company_name} />

            <div className="app-page flex flex-1 flex-col gap-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                            <h1 className="text-2xl font-semibold tracking-tight">
                                {supplier.company_name}
                            </h1>
                            <Badge
                                variant="outline"
                                className={badgeClass(supplier.is_active)}
                            >
                                {supplier.activity_label}
                            </Badge>
                        </div>

                        <p className="text-sm text-muted-foreground">
                            {supplier.supplier_code}
                            {supplier.payment_terms &&
                                ` • ${supplier.payment_terms}`}
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        {supplier.can.create_purchase_request && (
                            <Button variant="outline" asChild>
                                <Link
                                    href={purchaseRequestsCreate({
                                        query: { supplier: supplier.id },
                                    })}
                                >
                                    New request
                                </Link>
                            </Button>
                        )}

                        {supplier.can.create_purchase_order && (
                            <Button variant="outline" asChild>
                                <Link
                                    href={purchaseOrdersCreate({
                                        query: { supplier: supplier.id },
                                    })}
                                >
                                    New purchase order
                                </Link>
                            </Button>
                        )}

                        {supplier.can.update && (
                            <Button asChild>
                                <Link href={suppliersEdit(supplier.id)}>
                                    Edit supplier
                                </Link>
                            </Button>
                        )}

                        {supplier.can.delete && (
                            <Button variant="outline" asChild>
                                <Link
                                    href={SupplierController.destroy(
                                        supplier.id,
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

                <div className="grid gap-4 md:grid-cols-3">
                    <Card>
                        <CardHeader>
                            <CardDescription>Purchase requests</CardDescription>
                            <CardTitle>
                                {supplier.purchase_request_count}
                            </CardTitle>
                        </CardHeader>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardDescription>Purchase orders</CardDescription>
                            <CardTitle>
                                {supplier.purchase_order_count}
                            </CardTitle>
                        </CardHeader>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardDescription>Attachments</CardDescription>
                            <CardTitle>{supplier.attachment_count}</CardTitle>
                        </CardHeader>
                    </Card>
                </div>

                <div className="grid gap-6 xl:grid-cols-[1.35fr_1fr]">
                    <Card>
                        <CardHeader>
                            <CardTitle>Supplier information</CardTitle>
                            <CardDescription>
                                Core record details used by procurement and
                                receiving.
                            </CardDescription>
                        </CardHeader>

                        <CardContent className="grid gap-5 md:grid-cols-2">
                            <div>
                                <p className="text-sm text-muted-foreground">
                                    Contact person
                                </p>
                                <p className="mt-1 font-medium">
                                    {supplier.contact_person ?? 'Not set'}
                                </p>
                            </div>

                            <div>
                                <p className="text-sm text-muted-foreground">
                                    Phone
                                </p>
                                <p className="mt-1 font-medium">
                                    {supplier.phone ?? 'Not set'}
                                </p>
                            </div>

                            <div>
                                <p className="text-sm text-muted-foreground">
                                    Email
                                </p>
                                <p className="mt-1 font-medium">
                                    {supplier.email ?? 'Not set'}
                                </p>
                            </div>

                            <div>
                                <p className="text-sm text-muted-foreground">
                                    TIN
                                </p>
                                <p className="mt-1 font-medium">
                                    {supplier.tin ?? 'Not set'}
                                </p>
                            </div>

                            <div className="md:col-span-2">
                                <p className="text-sm text-muted-foreground">
                                    Address
                                </p>
                                <p className="mt-1 font-medium whitespace-pre-line">
                                    {supplier.address ?? 'Not set'}
                                </p>
                            </div>

                            <div className="md:col-span-2">
                                <p className="text-sm text-muted-foreground">
                                    Notes
                                </p>
                                <p className="mt-1 font-medium whitespace-pre-line">
                                    {supplier.notes ?? 'No notes'}
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Recent purchase requests</CardTitle>
                            <CardDescription>
                                The latest sourcing requests tied to this
                                supplier.
                            </CardDescription>
                        </CardHeader>

                        <CardContent className="space-y-3">
                            {purchaseRequests.length === 0 && (
                                <div className="rounded-lg border border-dashed px-4 py-6 text-sm text-muted-foreground">
                                    No purchase requests linked yet.
                                </div>
                            )}

                            {purchaseRequests.map((purchaseRequest) => (
                                <div
                                    key={purchaseRequest.id}
                                    className="rounded-lg border px-4 py-3"
                                >
                                    <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                                        <div className="space-y-1">
                                            <p className="font-medium">
                                                {purchaseRequest.request_no}
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                {purchaseRequest.purpose}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {purchaseRequest.item_count}{' '}
                                                items •{' '}
                                                {
                                                    purchaseRequest.purchase_order_count
                                                }{' '}
                                                orders
                                            </p>
                                        </div>

                                        <Badge
                                            variant="outline"
                                            className="w-fit"
                                        >
                                            {purchaseRequest.status_label}
                                        </Badge>
                                    </div>

                                    {purchaseRequest.can.view && (
                                        <div className="mt-3">
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
                                        </div>
                                    )}
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Recent purchase orders</CardTitle>
                        <CardDescription>
                            Recent POs and receiving progress tied to this
                            supplier.
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-3">
                        {purchaseOrders.length === 0 && (
                            <div className="rounded-lg border border-dashed px-4 py-6 text-sm text-muted-foreground">
                                No purchase orders linked yet.
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
                                            Ordered:{' '}
                                            {
                                                purchaseOrder.ordered_quantity_total
                                            }{' '}
                                            • Received:{' '}
                                            {
                                                purchaseOrder.received_quantity_total
                                            }
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

                <RecordAttachmentsCard
                    attachments={attachments}
                    attachableType="supplier"
                    attachableId={supplier.id}
                    canUpload={supplier.can.upload_attachments}
                    canUnlink={supplier.can.remove_attachments}
                />
            </div>
        </>
    );
}

SuppliersShow.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: dashboard() },
        { title: 'Suppliers', href: suppliersIndex() },
        { title: 'Supplier details', href: suppliersIndex() },
    ],
};
