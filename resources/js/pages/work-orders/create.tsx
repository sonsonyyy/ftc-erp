import { Head } from '@inertiajs/react';
import { dashboard } from '@/routes';
import { index as workOrdersIndex } from '@/routes/work-orders';
import { WorkOrderForm } from '@/components/work-orders/work-order-form';
import type {
    SelectOption,
    WorkOrderFormDefaults,
    WorkOrderProjectOption,
    WorkOrderQuotationOption,
    WorkOrderSiteOption,
} from '@/types';

type Props = {
    customerOptions: SelectOption[];
    siteOptions: WorkOrderSiteOption[];
    quotationOptions: WorkOrderQuotationOption[];
    projectOptions: WorkOrderProjectOption[];
    priorityOptions: SelectOption[];
    serviceTypeOptions: SelectOption[];
    statusOptions: SelectOption[];
    defaults: WorkOrderFormDefaults;
};

export default function WorkOrdersCreate({
    customerOptions,
    siteOptions,
    quotationOptions,
    projectOptions,
    priorityOptions,
    serviceTypeOptions,
    statusOptions,
    defaults,
}: Props) {
    return (
        <>
            <Head title="New Work Order" />

            <div className="app-page flex flex-1 flex-col gap-6">
                <WorkOrderForm
                    customerOptions={customerOptions}
                    siteOptions={siteOptions}
                    quotationOptions={quotationOptions}
                    projectOptions={projectOptions}
                    priorityOptions={priorityOptions}
                    serviceTypeOptions={serviceTypeOptions}
                    statusOptions={statusOptions}
                    defaults={defaults}
                    title="New work order"
                    description="Create a work order under the correct customer and project."
                    cancelHref={workOrdersIndex()}
                />
            </div>
        </>
    );
}

WorkOrdersCreate.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: dashboard() },
        { title: 'Work Orders', href: workOrdersIndex() },
        { title: 'New work order', href: workOrdersIndex() },
    ],
};
