import { Head } from '@inertiajs/react';
import { WarehouseForm } from '@/components/inventory/warehouse-form';
import { dashboard } from '@/routes';
import {
    index as warehousesIndex,
    show as warehousesShow,
} from '@/routes/warehouses';
import type { WarehouseFormData } from '@/types';

type Props = {
    warehouse: WarehouseFormData;
};

export default function WarehousesEdit({ warehouse }: Props) {
    return (
        <>
            <Head title={`Edit ${warehouse.warehouse_code}`} />

            <div className="app-page flex flex-1 flex-col gap-6">
                <WarehouseForm
                    warehouse={warehouse}
                    title={`Edit ${warehouse.warehouse_code}`}
                    description="Update the warehouse details used by inventory balances and stock movements."
                    cancelHref={warehousesShow(warehouse.id ?? 0)}
                />
            </div>
        </>
    );
}

WarehousesEdit.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: dashboard() },
        { title: 'Warehouses', href: warehousesIndex() },
        { title: 'Edit warehouse', href: warehousesIndex() },
    ],
};
