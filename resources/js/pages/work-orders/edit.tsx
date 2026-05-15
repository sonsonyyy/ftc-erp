import { Head } from '@inertiajs/react';
import { dashboard } from '@/routes';
import {
    index as workOrdersIndex,
    show as workOrdersShow,
} from '@/routes/work-orders';
import { WorkOrderForm } from '@/components/work-orders/work-order-form';
import type {
    SelectOption,
    WorkOrderDetail,
    WorkOrderProjectOption,
    WorkOrderQuotationOption,
    WorkOrderSiteOption,
} from '@/types';

type Props = {
    workOrder: WorkOrderDetail;
    customerOptions: SelectOption[];
    siteOptions: WorkOrderSiteOption[];
    quotationOptions: WorkOrderQuotationOption[];
    projectOptions: WorkOrderProjectOption[];
    priorityOptions: SelectOption[];
    serviceTypeOptions: SelectOption[];
};

export default function WorkOrdersEdit({
    workOrder,
    customerOptions,
    siteOptions,
    quotationOptions,
    projectOptions,
    priorityOptions,
    serviceTypeOptions,
}: Props) {
    return (
        <>
            <Head title={`Edit ${workOrder.work_order_no}`} />

            <div className="app-page flex flex-1 flex-col gap-6">
                <WorkOrderForm
                    workOrder={workOrder}
                    customerOptions={customerOptions}
                    siteOptions={siteOptions}
                    quotationOptions={quotationOptions}
                    projectOptions={projectOptions}
                    priorityOptions={priorityOptions}
                    serviceTypeOptions={serviceTypeOptions}
                    title={`Edit ${workOrder.work_order_no}`}
                    description="Update the work order record details."
                    cancelHref={workOrdersShow(workOrder.id)}
                />
            </div>
        </>
    );
}

WorkOrdersEdit.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: dashboard() },
        { title: 'Work Orders', href: workOrdersIndex() },
        { title: 'Edit work order', href: workOrdersIndex() },
    ],
};
