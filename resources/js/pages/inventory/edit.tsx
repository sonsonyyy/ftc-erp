import { Head } from '@inertiajs/react';
import { dashboard } from '@/routes';
import { index as inventoryIndex, show as inventoryShow } from '@/routes/inventory';
import { InventoryItemForm } from '@/components/inventory/inventory-item-form';
import type { InventoryFormData, SelectOption } from '@/types';

type Props = {
    inventoryItem: InventoryFormData;
    categoryOptions: SelectOption[];
    statusOptions: SelectOption[];
};

export default function InventoryEdit({ inventoryItem, categoryOptions, statusOptions }: Props) {
    return (
        <>
            <Head title={`Edit ${inventoryItem.item_code}`} />

            <div className="flex flex-1 flex-col gap-6 p-4">
                <InventoryItemForm
                    inventoryItem={inventoryItem}
                    categoryOptions={categoryOptions}
                    statusOptions={statusOptions}
                    title={`Edit ${inventoryItem.item_code}`}
                    description="Update the stock master details used by warehouse balances, issuances, returns, and low-stock reporting."
                    cancelHref={inventoryShow(inventoryItem.id ?? 0)}
                />
            </div>
        </>
    );
}

InventoryEdit.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: dashboard() },
        { title: 'Inventory', href: inventoryIndex() },
        { title: 'Edit item', href: inventoryIndex() },
    ],
};
