import { Head } from '@inertiajs/react';
import { PurchaseRequestForm } from '@/components/purchasing/purchase-request-form';
import { dashboard } from '@/routes';
import { index as purchaseRequestsIndex } from '@/routes/purchase-requests';
import type {
    PurchaseRequestFormDefaults,
    PurchasingItemOption,
    PurchasingWorkOrderOption,
    SelectOption,
} from '@/types';

type Props = {
    supplierOptions: SelectOption[];
    projectOptions: SelectOption[];
    workOrderOptions: PurchasingWorkOrderOption[];
    itemOptions: PurchasingItemOption[];
    statusOptions: SelectOption[];
    defaults: PurchaseRequestFormDefaults;
};

export default function PurchaseRequestsCreate(props: Props) {
    return (
        <>
            <Head title="New Purchase Request" />

            <div className="app-page flex flex-1 flex-col gap-6">
                <PurchaseRequestForm
                    {...props}
                    title="New purchase request"
                    description="Capture the sourcing request before converting it into one or more purchase orders."
                    cancelHref={purchaseRequestsIndex()}
                />
            </div>
        </>
    );
}

PurchaseRequestsCreate.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: dashboard() },
        { title: 'Purchase Requests', href: purchaseRequestsIndex() },
        { title: 'New request', href: purchaseRequestsIndex() },
    ],
};
