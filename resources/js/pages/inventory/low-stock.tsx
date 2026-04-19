import { Form, Head, Link } from '@inertiajs/react';
import { dashboard } from '@/routes';
import { index as inventoryIndex, lowStock as inventoryLowStock, show as inventoryShow } from '@/routes/inventory';
import { PaginationLinks } from '@/components/pagination-links';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import type { LowStockFilters, LowStockItem, PaginatedData, SelectOption } from '@/types';

type Props = {
    lowStockItems: PaginatedData<LowStockItem>;
    filters: LowStockFilters;
    categoryOptions: SelectOption[];
    warehouseOptions: SelectOption[];
};

export default function InventoryLowStock({ lowStockItems, filters, categoryOptions, warehouseOptions }: Props) {
    return (
        <>
            <Head title="Low Stock" />

            <div className="flex flex-1 flex-col gap-6 p-4">
                <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                    <div className="space-y-1">
                        <h1 className="text-2xl font-semibold tracking-tight">Low Stock</h1>
                        <p className="text-sm text-muted-foreground">
                            Review items already below reorder level, either across all warehouses or within a selected warehouse.
                        </p>
                    </div>

                    <Button variant="outline" asChild>
                        <Link href={inventoryIndex()}>Back to inventory</Link>
                    </Button>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Filters</CardTitle>
                        <CardDescription>Filter the low-stock view by item search, category, or warehouse.</CardDescription>
                    </CardHeader>

                    <CardContent>
                        <Form
                            action={inventoryLowStock()}
                            method="get"
                            options={{ preserveState: true, replace: true }}
                            className="grid gap-3 xl:grid-cols-[2fr_1.3fr_1.3fr_auto_auto]"
                        >
                            <Input name="search" defaultValue={filters.search} placeholder="Search low-stock items" />

                            <select
                                name="category"
                                defaultValue={filters.category ?? ''}
                                className="border-input focus-visible:border-ring focus-visible:ring-ring/50 h-9 rounded-md border bg-transparent px-3 text-sm outline-none focus-visible:ring-[3px]"
                            >
                                <option value="">All categories</option>
                                {categoryOptions.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>

                            <select
                                name="warehouse"
                                defaultValue={filters.warehouse ?? ''}
                                className="border-input focus-visible:border-ring focus-visible:ring-ring/50 h-9 rounded-md border bg-transparent px-3 text-sm outline-none focus-visible:ring-[3px]"
                            >
                                <option value="">All warehouses</option>
                                {warehouseOptions.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>

                            <Button type="submit">Apply</Button>

                            <Button variant="outline" asChild>
                                <Link href={inventoryLowStock()}>Reset</Link>
                            </Button>
                        </Form>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Low-stock list</CardTitle>
                        <CardDescription>{lowStockItems.total} low-stock records</CardDescription>
                    </CardHeader>

                    <CardContent className="overflow-x-auto px-0">
                        <table className="min-w-full text-sm">
                            <thead>
                                <tr className="border-b text-left text-muted-foreground">
                                    <th className="px-6 py-3 font-medium">Item</th>
                                    <th className="px-6 py-3 font-medium">Category</th>
                                    <th className="px-6 py-3 font-medium">On hand</th>
                                    <th className="px-6 py-3 font-medium">Reorder level</th>
                                    <th className="px-6 py-3 font-medium">Shortage</th>
                                    <th className="px-6 py-3 font-medium text-right">Actions</th>
                                </tr>
                            </thead>

                            <tbody>
                                {lowStockItems.data.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-10 text-center text-muted-foreground">
                                            No low-stock items matched the current filters.
                                        </td>
                                    </tr>
                                )}

                                {lowStockItems.data.map((item) => (
                                    <tr key={item.id} className="border-b align-top last:border-0">
                                        <td className="px-6 py-4">
                                            <div className="space-y-1">
                                                <p className="font-medium">{item.item_code}</p>
                                                <p className="text-muted-foreground">{item.item_name}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    {item.sku ?? 'No SKU'} • {item.unit}
                                                </p>
                                            </div>
                                        </td>

                                        <td className="px-6 py-4 text-muted-foreground">{item.category.name ?? 'Uncategorized'}</td>
                                        <td className="px-6 py-4 text-muted-foreground">{item.quantity_on_hand.toFixed(2)}</td>
                                        <td className="px-6 py-4 text-muted-foreground">{item.reorder_level.toFixed(2)}</td>
                                        <td className="px-6 py-4 font-medium text-amber-700">{item.shortage.toFixed(2)}</td>
                                        <td className="px-6 py-4 text-right">
                                            {item.can.view && (
                                                <Button variant="outline" size="sm" asChild>
                                                    <Link href={inventoryShow(item.id)}>Open</Link>
                                                </Button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </CardContent>

                    <PaginationLinks pagination={lowStockItems} />
                </Card>
            </div>
        </>
    );
}

InventoryLowStock.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: dashboard() },
        { title: 'Inventory', href: inventoryIndex() },
        { title: 'Low stock', href: inventoryLowStock() },
    ],
};
