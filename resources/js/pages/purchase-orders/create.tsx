import { Head } from '@inertiajs/react';
import { dashboard } from '@/routes';
import { index as purchaseOrdersIndex } from '@/routes/purchase-orders';
import { PurchaseOrderForm } from '@/components/purchasing/purchase-order-form';
import type {
    PurchaseOrderFormDefaults,
    PurchaseOrderRequestOption,
    PurchasingItemOption,
    PurchasingWorkOrderOption,
    SelectOption,
} from '@/types';

type Props = {
    supplierOptions: SelectOption[];
    purchaseRequestOptions: PurchaseOrderRequestOption[];
    projectOptions: SelectOption[];
    workOrderOptions: PurchasingWorkOrderOption[];
    itemOptions: PurchasingItemOption[];
    statusOptions: SelectOption[];
    defaults: PurchaseOrderFormDefaults;
};

export default function PurchaseOrdersCreate(props: Props) {
    return (
        <>
            <Head title="New Purchase Order" />

            <div className="flex flex-1 flex-col gap-6 p-4">
                <PurchaseOrderForm
                    {...props}
                    title="New purchase order"
                    description="Create the supplier-facing order record and prepare it for approval and receiving."
                    cancelHref={purchaseOrdersIndex()}
                />
            </div>
        </>
    );
}

PurchaseOrdersCreate.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: dashboard() },
        { title: 'Purchase Orders', href: purchaseOrdersIndex() },
        { title: 'New purchase order', href: purchaseOrdersIndex() },
    ],
};
