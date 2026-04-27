import { Head, Link } from '@inertiajs/react';
import { dashboard } from '@/routes';
import { create as stockMovementsCreate } from '@/routes/stock-movements';
import {
    edit as warehousesEdit,
    index as warehousesIndex,
} from '@/routes/warehouses';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import type { WarehouseDetail } from '@/types';

type Props = {
    warehouse: WarehouseDetail;
};

export default function WarehousesShow({ warehouse }: Props) {
    return (
        <>
            <Head title={warehouse.warehouse_code} />

            <div className="app-page flex flex-1 flex-col gap-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div className="space-y-1">
                        <h1 className="text-2xl font-semibold tracking-tight">
                            {warehouse.warehouse_code}
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            {warehouse.warehouse_name}
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        {warehouse.can.create_movement && (
                            <Button variant="outline" asChild>
                                <Link
                                    href={stockMovementsCreate({
                                        query: { warehouse: warehouse.id },
                                    })}
                                >
                                    Manual movement
                                </Link>
                            </Button>
                        )}

                        {warehouse.can.update && (
                            <Button asChild>
                                <Link href={warehousesEdit(warehouse.id)}>
                                    Edit warehouse
                                </Link>
                            </Button>
                        )}
                    </div>
                </div>

                <div className="grid gap-6 xl:grid-cols-[1.2fr_1fr]">
                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Warehouse information</CardTitle>
                                <CardDescription>
                                    Operational warehouse details and balance
                                    context for the stock location.
                                </CardDescription>
                            </CardHeader>

                            <CardContent className="grid gap-5 md:grid-cols-2">
                                <div>
                                    <p className="text-sm text-muted-foreground">
                                        Address
                                    </p>
                                    <p className="mt-1 font-medium whitespace-pre-line">
                                        {warehouse.address ?? 'Not set'}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-sm text-muted-foreground">
                                        Contact person
                                    </p>
                                    <p className="mt-1 font-medium">
                                        {warehouse.contact_person ?? 'Not set'}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-sm text-muted-foreground">
                                        Contact number
                                    </p>
                                    <p className="mt-1 font-medium">
                                        {warehouse.contact_no ?? 'Not set'}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-sm text-muted-foreground">
                                        Availability
                                    </p>
                                    <p className="mt-1 font-medium">
                                        {warehouse.is_active
                                            ? 'Active'
                                            : 'Inactive'}
                                    </p>
                                </div>

                                <div className="md:col-span-2">
                                    <p className="text-sm text-muted-foreground">
                                        Notes
                                    </p>
                                    <p className="mt-1 font-medium whitespace-pre-line">
                                        {warehouse.notes ?? 'No notes recorded'}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Recent movements</CardTitle>
                                <CardDescription>
                                    Latest stock activity recorded for this
                                    warehouse.
                                </CardDescription>
                            </CardHeader>

                            <CardContent className="space-y-3">
                                {warehouse.recent_movements.length === 0 && (
                                    <div className="rounded-lg border border-dashed px-4 py-6 text-sm text-muted-foreground">
                                        No stock movements recorded yet.
                                    </div>
                                )}

                                {warehouse.recent_movements.map((movement) => (
                                    <div
                                        key={movement.id}
                                        className="rounded-lg border px-4 py-3"
                                    >
                                        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                                            <p className="font-medium">
                                                {
                                                    movement.inventory_item
                                                        .item_code
                                                }{' '}
                                                -{' '}
                                                {
                                                    movement.inventory_item
                                                        .item_name
                                                }
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                {movement.movement_date ??
                                                    'No date'}
                                            </p>
                                        </div>

                                        <div className="mt-3 grid gap-2 text-sm text-muted-foreground md:grid-cols-2">
                                            <p>
                                                Type:{' '}
                                                <span className="font-medium text-foreground">
                                                    {
                                                        movement.movement_type_label
                                                    }
                                                </span>
                                            </p>
                                            <p>
                                                Quantity:{' '}
                                                <span className="font-medium text-foreground">
                                                    {movement.quantity.toFixed(
                                                        2,
                                                    )}
                                                </span>
                                            </p>
                                            <p>
                                                Balance after:{' '}
                                                <span className="font-medium text-foreground">
                                                    {movement.balance_after.toFixed(
                                                        2,
                                                    )}
                                                </span>
                                            </p>
                                            <p>
                                                Recorded by:{' '}
                                                <span className="font-medium text-foreground">
                                                    {movement.created_by ??
                                                        'System'}
                                                </span>
                                            </p>
                                        </div>

                                        <p className="mt-3 text-sm whitespace-pre-line text-muted-foreground">
                                            {movement.remarks ?? 'No remarks'}
                                        </p>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>Current balances</CardTitle>
                            <CardDescription>
                                Inventory quantities currently held in this
                                warehouse.
                            </CardDescription>
                        </CardHeader>

                        <CardContent className="space-y-3">
                            {warehouse.balances.length === 0 && (
                                <div className="rounded-lg border border-dashed px-4 py-6 text-sm text-muted-foreground">
                                    No balance records yet.
                                </div>
                            )}

                            {warehouse.balances.map((balance) => (
                                <div
                                    key={balance.id}
                                    className="rounded-lg border px-4 py-3"
                                >
                                    <div className="flex items-center justify-between gap-3">
                                        <div>
                                            <p className="font-medium">
                                                {
                                                    balance.inventory_item
                                                        .item_code
                                                }
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                {
                                                    balance.inventory_item
                                                        .item_name
                                                }
                                            </p>
                                        </div>

                                        <div className="text-right">
                                            <p className="font-medium">
                                                {balance.quantity_on_hand.toFixed(
                                                    2,
                                                )}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {balance.inventory_item.unit}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    );
}

WarehousesShow.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: dashboard() },
        { title: 'Warehouses', href: warehousesIndex() },
        { title: 'Warehouse details', href: warehousesIndex() },
    ],
};
