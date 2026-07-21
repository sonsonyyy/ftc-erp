import { Head, Link } from '@inertiajs/react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { dashboard } from '@/routes';
import {
    edit as inventoryEdit,
    index as inventoryIndex,
    lowStock as inventoryLowStock,
} from '@/routes/inventory';
import { create as stockMovementsCreate } from '@/routes/stock-movements';
import type { InventoryDetail } from '@/types';

type Props = {
    inventoryItem: InventoryDetail;
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

export default function InventoryShow({ inventoryItem }: Props) {
    return (
        <>
            <Head title={inventoryItem.item_code} />

            <div className="app-page flex flex-1 flex-col gap-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                            <h1 className="text-2xl font-semibold tracking-tight">
                                {inventoryItem.item_code}
                            </h1>
                            <Badge variant="outline">
                                {inventoryItem.status_label}
                            </Badge>
                            {inventoryItem.quantity_on_hand <
                                inventoryItem.reorder_level && (
                                <Badge
                                    variant="outline"
                                    className="border-amber-200 bg-amber-50 text-amber-700"
                                >
                                    Low stock
                                </Badge>
                            )}
                        </div>

                        <p className="text-sm text-muted-foreground">
                            {inventoryItem.item_name}
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        <Button variant="outline" asChild>
                            <Link href={inventoryLowStock()}>
                                Low stock list
                            </Link>
                        </Button>

                        {inventoryItem.can.create_movement && (
                            <Button variant="outline" asChild>
                                <Link
                                    href={stockMovementsCreate({
                                        query: { item: inventoryItem.id },
                                    })}
                                >
                                    Manual movement
                                </Link>
                            </Button>
                        )}

                        {inventoryItem.can.update && (
                            <Button asChild>
                                <Link href={inventoryEdit(inventoryItem.id)}>
                                    Edit item
                                </Link>
                            </Button>
                        )}
                    </div>
                </div>

                <div className="grid gap-4 md:grid-cols-4">
                    <Card>
                        <CardHeader>
                            <CardDescription>On-hand quantity</CardDescription>
                            <CardTitle>
                                {inventoryItem.quantity_on_hand.toFixed(2)}
                            </CardTitle>
                        </CardHeader>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardDescription>Reorder level</CardDescription>
                            <CardTitle>
                                {inventoryItem.reorder_level.toFixed(2)}
                            </CardTitle>
                        </CardHeader>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardDescription>Unit</CardDescription>
                            <CardTitle>{inventoryItem.unit}</CardTitle>
                        </CardHeader>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardDescription>Standard cost</CardDescription>
                            <CardTitle className="text-base">
                                {formatCurrency(inventoryItem.standard_cost)}
                            </CardTitle>
                        </CardHeader>
                    </Card>
                </div>

                <div className="grid gap-6 xl:grid-cols-[1.25fr_1fr]">
                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Item information</CardTitle>
                                <CardDescription>
                                    Core master data used by stock movement,
                                    issuance, and low-stock reporting.
                                </CardDescription>
                            </CardHeader>

                            <CardContent className="grid gap-5 md:grid-cols-2">
                                <div>
                                    <p className="text-sm text-muted-foreground">
                                        SKU
                                    </p>
                                    <p className="mt-1 font-medium">
                                        {inventoryItem.sku ?? 'Not set'}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-sm text-muted-foreground">
                                        Category
                                    </p>
                                    <p className="mt-1 font-medium">
                                        {inventoryItem.category.name ??
                                            'Uncategorized'}
                                    </p>
                                </div>

                                <div className="md:col-span-2">
                                    <p className="text-sm text-muted-foreground">
                                        Notes
                                    </p>
                                    <p className="mt-1 font-medium whitespace-pre-line">
                                        {inventoryItem.notes ??
                                            'No notes recorded'}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Recent movements</CardTitle>
                                <CardDescription>
                                    Latest stock movement history for this item
                                    across all warehouses.
                                </CardDescription>
                            </CardHeader>

                            <CardContent className="space-y-3">
                                {inventoryItem.recent_movements.length ===
                                    0 && (
                                    <div className="rounded-lg border border-dashed px-4 py-6 text-sm text-muted-foreground">
                                        No stock movements recorded yet.
                                    </div>
                                )}

                                {inventoryItem.recent_movements.map(
                                    (movement) => (
                                        <div
                                            key={movement.id}
                                            className="rounded-lg border px-4 py-3"
                                        >
                                            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <Badge variant="outline">
                                                        {
                                                            movement.movement_type_label
                                                        }
                                                    </Badge>
                                                    {movement.reference_number && (
                                                        <span className="text-sm text-muted-foreground">
                                                            {
                                                                movement.reference_number
                                                            }
                                                        </span>
                                                    )}
                                                </div>

                                                <p className="text-sm text-muted-foreground">
                                                    {movement.movement_date ??
                                                        'No date'}
                                                </p>
                                            </div>

                                            <div className="mt-3 grid gap-2 text-sm text-muted-foreground md:grid-cols-2">
                                                <p>
                                                    Warehouse:{' '}
                                                    <span className="font-medium text-foreground">
                                                        {
                                                            movement.warehouse
                                                                .warehouse_name
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
                                                {movement.remarks ??
                                                    'No remarks'}
                                            </p>
                                        </div>
                                    ),
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>Warehouse balances</CardTitle>
                            <CardDescription>
                                Current quantity on hand per warehouse for this
                                inventory item.
                            </CardDescription>
                        </CardHeader>

                        <CardContent className="space-y-3">
                            {inventoryItem.balances.length === 0 && (
                                <div className="rounded-lg border border-dashed px-4 py-6 text-sm text-muted-foreground">
                                    No warehouse balances recorded yet.
                                </div>
                            )}

                            {inventoryItem.balances.map((balance) => (
                                <div
                                    key={balance.id}
                                    className="rounded-lg border px-4 py-3"
                                >
                                    <div className="flex items-center justify-between gap-3">
                                        <div>
                                            <p className="font-medium">
                                                {
                                                    balance.warehouse
                                                        .warehouse_name
                                                }
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                {
                                                    balance.warehouse
                                                        .warehouse_code
                                                }
                                            </p>
                                        </div>

                                        <div className="text-right">
                                            <p className="font-medium">
                                                {balance.quantity_on_hand.toFixed(
                                                    2,
                                                )}
                                            </p>
                                            {balance.is_low_stock && (
                                                <p className="text-xs text-amber-700">
                                                    Below reorder level
                                                </p>
                                            )}
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

InventoryShow.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: dashboard() },
        { title: 'Inventory', href: inventoryIndex() },
        { title: 'Item details', href: inventoryIndex() },
    ],
};
