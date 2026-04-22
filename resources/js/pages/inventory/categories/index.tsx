import { Head, Link } from '@inertiajs/react';
import { dashboard } from '@/routes';
import {
    create as inventoryCategoriesCreate,
    edit as inventoryCategoriesEdit,
    index as inventoryCategoriesIndex,
} from '@/routes/inventory-categories';
import { DataTableCard } from '@/components/data-table-card';
import { IndexFiltersCard } from '@/components/index-filters-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { InventoryCategoryListItem, PaginatedData } from '@/types';

type Props = {
    categories: PaginatedData<InventoryCategoryListItem>;
    filters: {
        search: string;
    };
    can: {
        create: boolean;
    };
};

export default function InventoryCategoriesIndex({
    categories,
    filters,
    can,
}: Props) {
    return (
        <>
            <Head title="Inventory Categories" />

            <div className="flex flex-1 flex-col gap-6 p-4">
                <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                    <div className="space-y-1">
                        <h1 className="text-2xl font-semibold tracking-tight">
                            Inventory Categories
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Keep item classification clean so inventory
                            reporting and low-stock review stay readable.
                        </p>
                    </div>

                    {can.create && (
                        <Button asChild>
                            <Link href={inventoryCategoriesCreate()}>
                                New category
                            </Link>
                        </Button>
                    )}
                </div>

                <IndexFiltersCard
                    action={inventoryCategoriesIndex()}
                    resetHref={inventoryCategoriesIndex()}
                    filters={filters}
                    description="Search inventory categories by name or description."
                >
                    <Input
                        name="search"
                        defaultValue={filters.search}
                        placeholder="Search categories"
                    />
                </IndexFiltersCard>

                <DataTableCard
                    title="Category registry"
                    description={`${categories.total} category records`}
                    pagination={categories}
                >
                    <table className="min-w-full text-sm">
                        <thead>
                            <tr className="border-b text-left text-muted-foreground">
                                <th className="px-6 py-3 font-medium">
                                    Category
                                </th>
                                <th className="px-6 py-3 font-medium">Items</th>
                                <th className="px-6 py-3 text-right font-medium">
                                    Actions
                                </th>
                            </tr>
                        </thead>

                        <tbody>
                            {categories.data.length === 0 && (
                                <tr>
                                    <td
                                        colSpan={3}
                                        className="px-6 py-10 text-center text-muted-foreground"
                                    >
                                        No categories matched the current
                                        filters.
                                    </td>
                                </tr>
                            )}

                            {categories.data.map((category) => (
                                <tr
                                    key={category.id}
                                    className="border-b align-top last:border-0"
                                >
                                    <td className="px-6 py-4">
                                        <p className="font-medium">
                                            {category.name}
                                        </p>
                                        <p className="mt-1 text-muted-foreground">
                                            {category.description ??
                                                'No description'}
                                        </p>
                                    </td>

                                    <td className="px-6 py-4 text-muted-foreground">
                                        {category.item_count}
                                    </td>

                                    <td className="px-6 py-4 text-right">
                                        {category.can.update && (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                asChild
                                            >
                                                <Link
                                                    href={inventoryCategoriesEdit(
                                                        category.id,
                                                    )}
                                                >
                                                    Edit
                                                </Link>
                                            </Button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </DataTableCard>
            </div>
        </>
    );
}

InventoryCategoriesIndex.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: dashboard() },
        { title: 'Inventory Categories', href: inventoryCategoriesIndex() },
    ],
};
