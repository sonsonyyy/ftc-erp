import { Head, Link } from '@inertiajs/react';
import { dashboard } from '@/routes';
import {
    create as inventoryCreate,
    index as inventoryIndex,
    lowStock as inventoryLowStock,
    show as inventoryShow,
} from '@/routes/inventory';
import {
    create as inventoryCategoriesCreate,
    index as inventoryCategoriesIndex,
} from '@/routes/inventory-categories';
import { FilterSelect } from '@/components/filter-select';
import { IndexFiltersCard } from '@/components/index-filters-card';
import { PaginationLinks } from '@/components/pagination-links';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { cleanQueryParams, countActiveFilters } from '@/lib/utils';
import type {
    InventoryFilters,
    InventoryListItem,
    InventorySummary,
    PaginatedData,
    SelectOption,
} from '@/types';

type Props = {
    inventoryItems: PaginatedData<InventoryListItem>;
    filters: InventoryFilters;
    categoryOptions: SelectOption[];
    statusOptions: SelectOption[];
    summary: InventorySummary;
    can: {
        create: boolean;
        manage_categories: boolean;
        view_low_stock: boolean;
    };
};

function formatCurrency(amount: number | null): string {
    if (amount === null) {
        return 'Not set';
    }

    return new Intl.NumberFormat('en-PH', {
        style: 'currency',
        currency: 'PHP',
        maximumFractionDigits: 2,
    }).format(amount);
}

function statusBadgeClass(status: string): string {
    return (
        {
            active: 'border-emerald-200 bg-emerald-50 text-emerald-700',
            inactive: 'border-slate-200 bg-slate-100 text-slate-700',
        }[status] ?? 'border-slate-200 bg-slate-100 text-slate-700'
    );
}

export default function InventoryIndex({
    inventoryItems,
    filters,
    categoryOptions,
    statusOptions,
    summary,
    can,
}: Props) {
    const activeFilterCount = countActiveFilters(filters);
    const exportHref = inventoryIndex({
        query: cleanQueryParams({
            ...filters,
            export: 'csv',
        }),
    });

    return (
        <>
            <Head title="Inventory" />

            <div className="flex flex-1 flex-col gap-6 p-4">
                <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                    <div className="space-y-1">
                        <h1 className="text-2xl font-semibold tracking-tight">
                            Inventory
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Maintain the company-owned stock master and watch
                            which items are already below reorder level.
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        {can.manage_categories && (
                            <Button variant="outline" asChild>
                                <Link href={inventoryCategoriesIndex()}>
                                    Categories
                                </Link>
                            </Button>
                        )}

                        {can.view_low_stock && (
                            <Button variant="outline" asChild>
                                <Link href={inventoryLowStock()}>
                                    Low stock
                                </Link>
                            </Button>
                        )}

                        {can.create && (
                            <Button asChild>
                                <Link href={inventoryCreate()}>New item</Link>
                            </Button>
                        )}
                    </div>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                    <Card>
                        <CardHeader>
                            <CardDescription>Inventory items</CardDescription>
                            <CardTitle>{summary.item_count}</CardTitle>
                        </CardHeader>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardDescription>Warehouses</CardDescription>
                            <CardTitle>{summary.warehouse_count}</CardTitle>
                        </CardHeader>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardDescription>Low-stock items</CardDescription>
                            <CardTitle>{summary.low_stock_count}</CardTitle>
                        </CardHeader>
                    </Card>
                </div>

                <IndexFiltersCard
                    action={inventoryIndex()}
                    resetHref={inventoryIndex()}
                    exportHref={exportHref}
                    description="Search by SKU, code, item name, unit, or category, and optionally narrow the list to low-stock items only."
                    activeFilterCount={activeFilterCount}
                    fieldsClassName="xl:grid-cols-[2fr_1.3fr_1fr_1fr]"
                >
                    <Input
                        name="search"
                        defaultValue={filters.search}
                        placeholder="Search inventory"
                    />

                    <FilterSelect
                        name="category"
                        defaultValue={filters.category ?? ''}
                    >
                        <option value="">All categories</option>
                        {categoryOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </FilterSelect>

                    <FilterSelect name="status" defaultValue={filters.status}>
                        <option value="">All statuses</option>
                        {statusOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </FilterSelect>

                    <FilterSelect
                        name="low_stock"
                        defaultValue={filters.low_stock}
                    >
                        <option value="">All stock levels</option>
                        <option value="1">Low stock only</option>
                    </FilterSelect>
                </IndexFiltersCard>

                <Card>
                    <CardHeader>
                        <CardTitle>Inventory registry</CardTitle>
                        <CardDescription>
                            {inventoryItems.total} inventory records
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="overflow-x-auto px-0">
                        <table className="min-w-full text-sm">
                            <thead>
                                <tr className="border-b text-left text-muted-foreground">
                                    <th className="px-6 py-3 font-medium">
                                        Item
                                    </th>
                                    <th className="px-6 py-3 font-medium">
                                        Category
                                    </th>
                                    <th className="px-6 py-3 font-medium">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 font-medium">
                                        Balances
                                    </th>
                                    <th className="px-6 py-3 font-medium">
                                        Cost
                                    </th>
                                    <th className="px-6 py-3 text-right font-medium">
                                        Actions
                                    </th>
                                </tr>
                            </thead>

                            <tbody>
                                {inventoryItems.data.length === 0 && (
                                    <tr>
                                        <td
                                            colSpan={6}
                                            className="px-6 py-10 text-center text-muted-foreground"
                                        >
                                            No inventory items matched the
                                            current filters.
                                        </td>
                                    </tr>
                                )}

                                {inventoryItems.data.map((inventoryItem) => (
                                    <tr
                                        key={inventoryItem.id}
                                        className="border-b align-top last:border-0"
                                    >
                                        <td className="px-6 py-4">
                                            <div className="space-y-1">
                                                <p className="font-medium">
                                                    {inventoryItem.item_code}
                                                </p>
                                                <p className="text-muted-foreground">
                                                    {inventoryItem.item_name}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    {inventoryItem.sku ??
                                                        'No SKU'}{' '}
                                                    • Unit: {inventoryItem.unit}
                                                </p>
                                            </div>
                                        </td>

                                        <td className="px-6 py-4 text-muted-foreground">
                                            {inventoryItem.category.name ??
                                                'Uncategorized'}
                                        </td>

                                        <td className="px-6 py-4">
                                            <div className="flex flex-col gap-2">
                                                <Badge
                                                    variant="outline"
                                                    className={statusBadgeClass(
                                                        inventoryItem.status,
                                                    )}
                                                >
                                                    {inventoryItem.status_label}
                                                </Badge>
                                                {inventoryItem.is_low_stock && (
                                                    <Badge
                                                        variant="outline"
                                                        className="border-amber-200 bg-amber-50 text-amber-700"
                                                    >
                                                        Low stock
                                                    </Badge>
                                                )}
                                            </div>
                                        </td>

                                        <td className="px-6 py-4 text-muted-foreground">
                                            <div className="space-y-1">
                                                <p>
                                                    On hand:{' '}
                                                    {inventoryItem.quantity_on_hand.toFixed(
                                                        2,
                                                    )}
                                                </p>
                                                <p>
                                                    Reorder:{' '}
                                                    {inventoryItem.reorder_level.toFixed(
                                                        2,
                                                    )}
                                                </p>
                                            </div>
                                        </td>

                                        <td className="px-6 py-4 text-muted-foreground">
                                            {formatCurrency(
                                                inventoryItem.standard_cost,
                                            )}
                                        </td>

                                        <td className="px-6 py-4 text-right">
                                            {inventoryItem.can.view && (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    asChild
                                                >
                                                    <Link
                                                        href={inventoryShow(
                                                            inventoryItem.id,
                                                        )}
                                                    >
                                                        Open
                                                    </Link>
                                                </Button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </CardContent>

                    <PaginationLinks pagination={inventoryItems} />
                </Card>
            </div>
        </>
    );
}

InventoryIndex.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: dashboard() },
        { title: 'Inventory', href: inventoryIndex() },
    ],
};
