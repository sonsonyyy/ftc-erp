import { Head } from '@inertiajs/react';
import { dashboard } from '@/routes';
import { index as inventoryIndex } from '@/routes/inventory';
import { InventoryItemForm } from '@/components/inventory/inventory-item-form';
import type { SelectOption } from '@/types';

type Props = {
    categoryOptions: SelectOption[];
    statusOptions: SelectOption[];
};

export default function InventoryCreate({ categoryOptions, statusOptions }: Props) {
    return (
        <>
            <Head title="New Inventory Item" />

            <div className="flex flex-1 flex-col gap-6 p-4">
                <InventoryItemForm
                    categoryOptions={categoryOptions}
                    statusOptions={statusOptions}
                    title="New inventory item"
                    description="Register a company-owned stock item before any warehouse balance or issuance is recorded."
                    cancelHref={inventoryIndex()}
                />
            </div>
        </>
    );
}

InventoryCreate.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: dashboard() },
        { title: 'Inventory', href: inventoryIndex() },
        { title: 'New item', href: inventoryIndex() },
    ],
};
