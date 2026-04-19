import { Head } from '@inertiajs/react';
import { dashboard } from '@/routes';
import { index as inventoryCategoriesIndex } from '@/routes/inventory-categories';
import { InventoryCategoryForm } from '@/components/inventory/inventory-category-form';
import type { InventoryCategoryFormData } from '@/types';

type Props = {
    inventoryCategory: InventoryCategoryFormData;
};

export default function InventoryCategoriesEdit({ inventoryCategory }: Props) {
    return (
        <>
            <Head title={`Edit ${inventoryCategory.name}`} />

            <div className="flex flex-1 flex-col gap-6 p-4">
                <InventoryCategoryForm
                    inventoryCategory={inventoryCategory}
                    title={`Edit ${inventoryCategory.name}`}
                    description="Update the inventory category label used by filters and reporting."
                    cancelHref={inventoryCategoriesIndex()}
                />
            </div>
        </>
    );
}

InventoryCategoriesEdit.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: dashboard() },
        { title: 'Inventory Categories', href: inventoryCategoriesIndex() },
        { title: 'Edit category', href: inventoryCategoriesIndex() },
    ],
};
