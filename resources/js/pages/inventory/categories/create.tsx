import { Head } from '@inertiajs/react';
import { dashboard } from '@/routes';
import { index as inventoryCategoriesIndex } from '@/routes/inventory-categories';
import { InventoryCategoryForm } from '@/components/inventory/inventory-category-form';

export default function InventoryCategoriesCreate() {
    return (
        <>
            <Head title="New Inventory Category" />

            <div className="app-page flex flex-1 flex-col gap-6">
                <InventoryCategoryForm
                    title="New inventory category"
                    description="Create a reusable category for inventory filtering, item organization, and low-stock reporting."
                    cancelHref={inventoryCategoriesIndex()}
                />
            </div>
        </>
    );
}

InventoryCategoriesCreate.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: dashboard() },
        { title: 'Inventory Categories', href: inventoryCategoriesIndex() },
        { title: 'New category', href: inventoryCategoriesIndex() },
    ],
};
