import { Head } from '@inertiajs/react';
import { dashboard } from '@/routes';
import { index as stockIssuancesIndex } from '@/routes/stock-issuances';
import { StockIssuanceForm } from '@/components/inventory/stock-issuance-form';
import type { SelectOption, StockIssuanceDefaults, StockWorkOrderOption } from '@/types';

type Props = {
    warehouseOptions: SelectOption[];
    projectOptions: SelectOption[];
    workOrderOptions: StockWorkOrderOption[];
    itemOptions: SelectOption[];
    defaults: StockIssuanceDefaults;
};

export default function StockIssuancesCreate({
    warehouseOptions,
    projectOptions,
    workOrderOptions,
    itemOptions,
    defaults,
}: Props) {
    return (
        <>
            <Head title="New Stock Issuance" />

            <div className="flex flex-1 flex-col gap-6 p-4">
                <StockIssuanceForm
                    warehouseOptions={warehouseOptions}
                    projectOptions={projectOptions}
                    workOrderOptions={workOrderOptions}
                    itemOptions={itemOptions}
                    defaults={defaults}
                    title="New stock issuance"
                    description="Release company-owned stock from the warehouse to a project or work order and update balances in one transaction."
                    cancelHref={stockIssuancesIndex()}
                />
            </div>
        </>
    );
}

StockIssuancesCreate.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: dashboard() },
        { title: 'Stock Issuances', href: stockIssuancesIndex() },
        { title: 'New issuance', href: stockIssuancesIndex() },
    ],
};
