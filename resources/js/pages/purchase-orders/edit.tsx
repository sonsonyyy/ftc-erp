import { Head } from '@inertiajs/react';
import { dashboard } from '@/routes';
import {
    index as purchaseOrdersIndex,
    show as purchaseOrdersShow,
} from '@/routes/purchase-orders';
import { PurchaseOrderForm } from '@/components/purchasing/purchase-order-form';
import type {
    PurchaseOrderDetail,
    PurchaseOrderRequestOption,
    PurchasingItemOption,
    PurchasingWorkOrderOption,
    SelectOption,
} from '@/types';

type Props = {
    purchaseOrder: PurchaseOrderDetail;
    supplierOptions: SelectOption[];
    purchaseRequestOptions: PurchaseOrderRequestOption[];
    projectOptions: SelectOption[];
    workOrderOptions: PurchasingWorkOrderOption[];
    itemOptions: PurchasingItemOption[];
    statusOptions: SelectOption[];
};

export default function PurchaseOrdersEdit(props: Props) {
    return (
        <>
            <Head title={`Edit ${props.purchaseOrder.po_no}`} />

            <div className="app-page flex flex-1 flex-col gap-6">
                <PurchaseOrderForm
                    {...props}
                    title={`Edit ${props.purchaseOrder.po_no}`}
                    description="Adjust the PO before any receipt is recorded against it."
                    cancelHref={purchaseOrdersShow(props.purchaseOrder.id)}
                />
            </div>
        </>
    );
}

PurchaseOrdersEdit.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: dashboard() },
        { title: 'Purchase Orders', href: purchaseOrdersIndex() },
        { title: 'Edit purchase order', href: purchaseOrdersIndex() },
    ],
};
