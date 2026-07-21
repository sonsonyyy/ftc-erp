import { Head } from '@inertiajs/react';
import { WarehouseForm } from '@/components/inventory/warehouse-form';
import { dashboard } from '@/routes';
import { index as warehousesIndex } from '@/routes/warehouses';

export default function WarehousesCreate() {
    return (
        <>
            <Head title="New Warehouse" />

            <div className="app-page flex flex-1 flex-col gap-6">
                <WarehouseForm
                    title="New warehouse"
                    description="Register a warehouse or stock room before recording balances, issuances, returns, or stock movements."
                    cancelHref={warehousesIndex()}
                />
            </div>
        </>
    );
}

WarehousesCreate.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: dashboard() },
        { title: 'Warehouses', href: warehousesIndex() },
        { title: 'New warehouse', href: warehousesIndex() },
    ],
};
