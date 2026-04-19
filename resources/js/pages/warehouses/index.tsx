import { Form, Head, Link } from '@inertiajs/react';
import { dashboard } from '@/routes';
import { create as warehousesCreate, index as warehousesIndex, show as warehousesShow } from '@/routes/warehouses';
import { PaginationLinks } from '@/components/pagination-links';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import type { PaginatedData, WarehouseFilters, WarehouseListItem } from '@/types';

type Props = {
    warehouses: PaginatedData<WarehouseListItem>;
    filters: WarehouseFilters;
    activityOptions: Array<{ value: string; label: string }>;
    can: {
        create: boolean;
    };
};

export default function WarehousesIndex({ warehouses, filters, activityOptions, can }: Props) {
    return (
        <>
            <Head title="Warehouses" />

            <div className="flex flex-1 flex-col gap-6 p-4">
                <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                    <div className="space-y-1">
                        <h1 className="text-2xl font-semibold tracking-tight">Warehouses</h1>
                        <p className="text-sm text-muted-foreground">
                            Manage the physical stock locations used by inventory balances, stock movements, issuances, and returns.
                        </p>
                    </div>

                    {can.create && (
                        <Button asChild>
                            <Link href={warehousesCreate()}>New warehouse</Link>
                        </Button>
                    )}
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Filters</CardTitle>
                        <CardDescription>Search warehouse records and narrow by active or inactive status.</CardDescription>
                    </CardHeader>

                    <CardContent>
                        <Form
                            action={warehousesIndex()}
                            method="get"
                            options={{ preserveState: true, replace: true }}
                            className="grid gap-3 xl:grid-cols-[2fr_1fr_auto_auto]"
                        >
                            <Input name="search" defaultValue={filters.search} placeholder="Search warehouses" />

                            <select
                                name="activity"
                                defaultValue={filters.activity}
                                className="border-input focus-visible:border-ring focus-visible:ring-ring/50 h-9 rounded-md border bg-transparent px-3 text-sm outline-none focus-visible:ring-[3px]"
                            >
                                <option value="">All activity</option>
                                {activityOptions.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>

                            <Button type="submit">Apply</Button>

                            <Button variant="outline" asChild>
                                <Link href={warehousesIndex()}>Reset</Link>
                            </Button>
                        </Form>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Warehouse registry</CardTitle>
                        <CardDescription>{warehouses.total} warehouse records</CardDescription>
                    </CardHeader>

                    <CardContent className="overflow-x-auto px-0">
                        <table className="min-w-full text-sm">
                            <thead>
                                <tr className="border-b text-left text-muted-foreground">
                                    <th className="px-6 py-3 font-medium">Warehouse</th>
                                    <th className="px-6 py-3 font-medium">Contact</th>
                                    <th className="px-6 py-3 font-medium">Status</th>
                                    <th className="px-6 py-3 font-medium">Stock</th>
                                    <th className="px-6 py-3 font-medium text-right">Actions</th>
                                </tr>
                            </thead>

                            <tbody>
                                {warehouses.data.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-10 text-center text-muted-foreground">
                                            No warehouses matched the current filters.
                                        </td>
                                    </tr>
                                )}

                                {warehouses.data.map((warehouse) => (
                                    <tr key={warehouse.id} className="border-b align-top last:border-0">
                                        <td className="px-6 py-4">
                                            <p className="font-medium">{warehouse.warehouse_code}</p>
                                            <p className="text-muted-foreground">{warehouse.warehouse_name}</p>
                                        </td>

                                        <td className="px-6 py-4 text-muted-foreground">
                                            <div className="space-y-1">
                                                <p>{warehouse.contact_person ?? 'No contact person'}</p>
                                                <p>{warehouse.contact_no ?? 'No contact number'}</p>
                                            </div>
                                        </td>

                                        <td className="px-6 py-4">
                                            <Badge variant="outline">
                                                {warehouse.is_active ? 'Active' : 'Inactive'}
                                            </Badge>
                                        </td>

                                        <td className="px-6 py-4 text-muted-foreground">
                                            <div className="space-y-1">
                                                <p>{warehouse.stocked_item_count} stock items</p>
                                                <p>{warehouse.quantity_on_hand.toFixed(2)} total quantity</p>
                                            </div>
                                        </td>

                                        <td className="px-6 py-4 text-right">
                                            {warehouse.can.view && (
                                                <Button variant="outline" size="sm" asChild>
                                                    <Link href={warehousesShow(warehouse.id)}>Open</Link>
                                                </Button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </CardContent>

                    <PaginationLinks pagination={warehouses} />
                </Card>
            </div>
        </>
    );
}

WarehousesIndex.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: dashboard() },
        { title: 'Warehouses', href: warehousesIndex() },
    ],
};
