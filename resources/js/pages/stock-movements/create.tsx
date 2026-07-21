import { Head } from '@inertiajs/react';
import { StockMovementForm } from '@/components/inventory/stock-movement-form';
import { dashboard } from '@/routes';
import { index as stockMovementsIndex } from '@/routes/stock-movements';
import type { SelectOption, StockMovementFormDefaults } from '@/types';

type Props = {
    warehouseOptions: SelectOption[];
    itemOptions: SelectOption[];
    movementTypeOptions: SelectOption[];
    defaults: StockMovementFormDefaults;
};

export default function StockMovementsCreate({
    warehouseOptions,
    itemOptions,
    movementTypeOptions,
    defaults,
}: Props) {
    return (
        <>
            <Head title="Manual Stock Movement" />

            <div className="app-page flex flex-1 flex-col gap-6">
                <StockMovementForm
                    warehouseOptions={warehouseOptions}
                    itemOptions={itemOptions}
                    movementTypeOptions={movementTypeOptions}
                    defaults={defaults}
                    title="Manual stock movement"
                    description="Use this for direct stock in, stock out, and adjustment entries that are not tied to an issuance or return."
                    cancelHref={stockMovementsIndex()}
                />
            </div>
        </>
    );
}

StockMovementsCreate.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: dashboard() },
        { title: 'Stock Movements', href: stockMovementsIndex() },
        { title: 'Manual movement', href: stockMovementsIndex() },
    ],
};
