import { Head } from '@inertiajs/react';
import { StockReturnForm } from '@/components/inventory/stock-return-form';
import { dashboard } from '@/routes';
import { index as stockReturnsIndex } from '@/routes/stock-returns';
import type {
    SelectOption,
    StockReturnDefaults,
    StockWorkOrderOption,
} from '@/types';

type Props = {
    warehouseOptions: SelectOption[];
    projectOptions: SelectOption[];
    workOrderOptions: StockWorkOrderOption[];
    itemOptions: SelectOption[];
    defaults: StockReturnDefaults;
};

export default function StockReturnsCreate({
    warehouseOptions,
    projectOptions,
    workOrderOptions,
    itemOptions,
    defaults,
}: Props) {
    return (
        <>
            <Head title="New Stock Return" />

            <div className="app-page flex flex-1 flex-col gap-6">
                <StockReturnForm
                    warehouseOptions={warehouseOptions}
                    projectOptions={projectOptions}
                    workOrderOptions={workOrderOptions}
                    itemOptions={itemOptions}
                    defaults={defaults}
                    title="New stock return"
                    description="Record company-owned stock that was returned from a project or work order back into warehouse inventory."
                    cancelHref={stockReturnsIndex()}
                />
            </div>
        </>
    );
}

StockReturnsCreate.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: dashboard() },
        { title: 'Stock Returns', href: stockReturnsIndex() },
        { title: 'New return', href: stockReturnsIndex() },
    ],
};
