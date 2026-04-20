import { Head } from '@inertiajs/react';
import { dashboard } from '@/routes';
import { show as purchaseOrdersShow } from '@/routes/purchase-orders';
import { PurchaseReceiptForm } from '@/components/purchasing/purchase-receipt-form';
import type { PurchaseReceiptFormDefaults, PurchaseReceiptSourceOrder, SelectOption } from '@/types';

type Props = {
    purchaseOrder: PurchaseReceiptSourceOrder;
    warehouseOptions: SelectOption[];
    defaults: PurchaseReceiptFormDefaults;
};

export default function PurchaseReceiptsCreate(props: Props) {
    return (
        <>
            <Head title={`Receive ${props.purchaseOrder.po_no}`} />

            <div className="flex flex-1 flex-col gap-6 p-4">
                <PurchaseReceiptForm
                    {...props}
                    title={`Record receipt for ${props.purchaseOrder.po_no}`}
                    description="Capture the actual delivered quantities and post them into the selected warehouse."
                    cancelHref={purchaseOrdersShow(props.purchaseOrder.id)}
                />
            </div>
        </>
    );
}

PurchaseReceiptsCreate.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: dashboard() },
        { title: 'Purchase Receipts', href: '#' },
        { title: 'Record receipt', href: '#' },
    ],
};
