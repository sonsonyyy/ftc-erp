import { Head } from '@inertiajs/react';
import { dashboard } from '@/routes';
import { index as purchaseRequestsIndex, show as purchaseRequestsShow } from '@/routes/purchase-requests';
import { PurchaseRequestForm } from '@/components/purchasing/purchase-request-form';
import type {
    PurchaseRequestDetail,
    PurchasingItemOption,
    PurchasingWorkOrderOption,
    SelectOption,
} from '@/types';

type Props = {
    purchaseRequest: PurchaseRequestDetail;
    supplierOptions: SelectOption[];
    projectOptions: SelectOption[];
    workOrderOptions: PurchasingWorkOrderOption[];
    itemOptions: PurchasingItemOption[];
    statusOptions: SelectOption[];
};

export default function PurchaseRequestsEdit(props: Props) {
    return (
        <>
            <Head title={`Edit ${props.purchaseRequest.request_no}`} />

            <div className="flex flex-1 flex-col gap-6 p-4">
                <PurchaseRequestForm
                    {...props}
                    title={`Edit ${props.purchaseRequest.request_no}`}
                    description="Adjust the purchase request before it is turned into an active purchase order."
                    cancelHref={purchaseRequestsShow(props.purchaseRequest.id)}
                />
            </div>
        </>
    );
}

PurchaseRequestsEdit.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: dashboard() },
        { title: 'Purchase Requests', href: purchaseRequestsIndex() },
        { title: 'Edit request', href: purchaseRequestsIndex() },
    ],
};
