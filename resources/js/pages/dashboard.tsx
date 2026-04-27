import { Head, Link } from '@inertiajs/react';
import type { ComponentProps } from 'react';
import type { LucideIcon } from 'lucide-react';
import {
    ArrowRightLeft,
    ArrowUpRight,
    BarChart3,
    Boxes,
    ClipboardList,
    FolderKanban,
    Package,
    ShieldCheck,
    TriangleAlert,
} from 'lucide-react';
import { dashboard } from '@/routes';
import {
    calendar as complianceRecordsCalendar,
    index as complianceRecordsIndex,
} from '@/routes/compliance-records';
import {
    lowStock as inventoryLowStock,
    show as inventoryShow,
} from '@/routes/inventory';
import { index as projectsIndex } from '@/routes/projects';
import { index as quotationsIndex } from '@/routes/quotations';
import { index as stockMovementsIndex } from '@/routes/stock-movements';
import { index as workOrdersIndex } from '@/routes/work-orders';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import type {
    DashboardComplianceSnapshot,
    DashboardLowStockSnapshot,
    DashboardMetricSnapshot,
    DashboardStockMovementSnapshot,
} from '@/types';

type Props = {
    lowStockSnapshot: DashboardLowStockSnapshot;
    movementSnapshot: DashboardStockMovementSnapshot;
    quotationSnapshot: DashboardMetricSnapshot;
    projectSnapshot: DashboardMetricSnapshot;
    workOrderSnapshot: DashboardMetricSnapshot;
    complianceSnapshot: DashboardComplianceSnapshot;
    can: {
        view_low_stock: boolean;
        view_stock_movements: boolean;
        view_quotations: boolean;
        view_projects: boolean;
        view_work_orders: boolean;
        view_compliance: boolean;
        view_compliance_alerts: boolean;
    };
};

type ModuleSnapshotCardProps = {
    icon: LucideIcon;
    title: string;
    valueLabel: string;
    description: string;
    restrictedDescription: string;
    secondaryLabel: string;
    actionLabel: string;
    href: ComponentProps<typeof Link>['href'];
    snapshot: DashboardMetricSnapshot;
    canView: boolean;
};

function movementBadgeClass(movementType: string): string {
    return (
        {
            stock_in: 'border-emerald-200 bg-emerald-50 text-emerald-700',
            adjustment_increase: 'border-sky-200 bg-sky-50 text-sky-700',
            return: 'border-cyan-200 bg-cyan-50 text-cyan-700',
            stock_out: 'border-amber-200 bg-amber-50 text-amber-700',
            adjustment_decrease:
                'border-orange-200 bg-orange-50 text-orange-700',
            issuance: 'border-rose-200 bg-rose-50 text-rose-700',
        }[movementType] ?? 'border-slate-200 bg-slate-100 text-slate-700'
    );
}

function formatDate(date: string | null): string {
    if (!date) {
        return 'No date';
    }

    return new Intl.DateTimeFormat('en-PH', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    }).format(new Date(date));
}

function ModuleSnapshotCard({
    icon: Icon,
    title,
    valueLabel,
    description,
    restrictedDescription,
    secondaryLabel,
    actionLabel,
    href,
    snapshot,
    canView,
}: ModuleSnapshotCardProps) {
    return (
        <Card>
            <CardHeader className="gap-3">
                <div className="space-y-1">
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <Icon className="size-4" />
                        <CardDescription>{title}</CardDescription>
                    </div>
                    <CardTitle className="text-2xl tracking-tight">
                        {canView ? (snapshot.count ?? 0) : 'Restricted'}
                    </CardTitle>
                </div>

                <p className="text-[13px] text-muted-foreground">
                    {canView ? description : restrictedDescription}
                </p>
            </CardHeader>

            <CardContent className="space-y-3">
                {canView ? (
                    <>
                        <div className="rounded-lg border bg-muted/20 px-4 py-3">
                            <p className="text-xs tracking-[0.2em] text-muted-foreground uppercase">
                                {secondaryLabel}
                            </p>
                            <p className="mt-1 text-lg font-semibold tracking-tight">
                                {snapshot.secondary_count ?? 0}
                            </p>
                        </div>

                        <Button variant="outline" asChild className="w-full">
                            <Link href={href}>
                                <ArrowUpRight />
                                {actionLabel}
                            </Link>
                        </Button>
                    </>
                ) : (
                    <div className="rounded-lg border border-dashed px-4 py-4 text-[13px] text-muted-foreground">
                        Access is limited to roles with {valueLabel} visibility.
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

function ComplianceSnapshotCard({
    snapshot,
    canView,
    canViewAlerts,
}: {
    snapshot: DashboardComplianceSnapshot;
    canView: boolean;
    canViewAlerts: boolean;
}) {
    return (
        <Card>
            <CardHeader className="gap-3">
                <div className="space-y-1">
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <ShieldCheck className="size-4" />
                        <CardDescription>Compliance</CardDescription>
                    </div>
                    <CardTitle className="text-2xl tracking-tight">
                        {canView
                            ? (snapshot.due_soon_count ?? 0)
                            : 'Restricted'}
                    </CardTitle>
                </div>

                <p className="text-[13px] text-muted-foreground">
                    {canView
                        ? 'Records due soon, for renewal, or overdue.'
                        : 'Your role does not include compliance visibility.'}
                </p>
            </CardHeader>

            <CardContent className="space-y-3">
                {canView ? (
                    <>
                        <div className="grid gap-3 sm:grid-cols-2">
                            <div className="rounded-lg border bg-muted/20 px-4 py-3">
                                <p className="text-xs tracking-[0.2em] text-muted-foreground uppercase">
                                    For renewal
                                </p>
                                <p className="mt-1 text-lg font-semibold tracking-tight">
                                    {snapshot.for_renewal_count ?? 0}
                                </p>
                            </div>

                            <div className="rounded-lg border bg-muted/20 px-4 py-3">
                                <p className="text-xs tracking-[0.2em] text-muted-foreground uppercase">
                                    Overdue
                                </p>
                                <p className="mt-1 text-lg font-semibold tracking-tight">
                                    {snapshot.overdue_count ?? 0}
                                </p>
                            </div>
                        </div>

                        <div className="rounded-lg border bg-muted/20 px-4 py-3">
                            <p className="text-xs tracking-[0.2em] text-muted-foreground uppercase">
                                Expired / Open alerts
                            </p>
                            <p className="mt-1 text-lg font-semibold tracking-tight">
                                {snapshot.expired_count ?? 0}
                                <span className="ml-2 text-sm font-normal text-muted-foreground">
                                    expired
                                </span>
                            </p>
                            <p className="mt-1 text-sm text-muted-foreground">
                                {canViewAlerts
                                    ? `${snapshot.open_alert_count ?? 0} open alerts`
                                    : 'Alert visibility is restricted'}
                            </p>
                        </div>

                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                asChild
                                className="flex-1"
                            >
                                <Link href={complianceRecordsIndex()}>
                                    <ArrowUpRight />
                                    Registry
                                </Link>
                            </Button>

                            <Button
                                variant="outline"
                                asChild
                                className="flex-1"
                            >
                                <Link href={complianceRecordsCalendar()}>
                                    <ArrowUpRight />
                                    Calendar
                                </Link>
                            </Button>
                        </div>
                    </>
                ) : (
                    <div className="rounded-lg border border-dashed px-4 py-4 text-[13px] text-muted-foreground">
                        Access is limited to roles with compliance visibility.
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

export default function Dashboard({
    lowStockSnapshot,
    movementSnapshot,
    quotationSnapshot,
    projectSnapshot,
    workOrderSnapshot,
    complianceSnapshot,
    can,
}: Props) {
    return (
        <>
            <Head title="Dashboard" />

            <div className="app-page flex flex-1 flex-col gap-6">
                <div className="space-y-1">
                    <h1 className="text-2xl font-semibold tracking-tight">
                        Dashboard
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Daily view of sales, operations, and warehouse activity.
                    </p>
                </div>

                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
                    <Card className="md:col-span-2 xl:col-span-2">
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <Package className="size-4 text-muted-foreground" />
                                <CardTitle>Inventory</CardTitle>
                            </div>
                            <CardDescription>
                                Low stock and recent warehouse movement.
                            </CardDescription>
                        </CardHeader>

                        <CardContent className="grid gap-3 sm:grid-cols-2">
                            <div className="rounded-lg border px-4 py-4">
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <TriangleAlert className="size-4" />
                                    <p>Low stock</p>
                                </div>
                                <p className="mt-2 text-2xl font-semibold tracking-tight">
                                    {can.view_low_stock
                                        ? (lowStockSnapshot.count ?? 0)
                                        : 'Restricted'}
                                </p>
                                <p className="mt-2 text-[13px] text-muted-foreground">
                                    {can.view_low_stock
                                        ? 'Items already below reorder level.'
                                        : 'Your role does not include inventory snapshot access.'}
                                </p>

                                {can.view_low_stock && (
                                    <Button
                                        variant="outline"
                                        asChild
                                        className="mt-4 w-full"
                                    >
                                        <Link href={inventoryLowStock()}>
                                            <ArrowUpRight />
                                            View low stock
                                        </Link>
                                    </Button>
                                )}
                            </div>

                            <div className="rounded-lg border px-4 py-4">
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <ArrowRightLeft className="size-4" />
                                    <p>Movements, 7 days</p>
                                </div>
                                <p className="mt-2 text-2xl font-semibold tracking-tight">
                                    {can.view_stock_movements
                                        ? (movementSnapshot.last_7_days_count ??
                                          0)
                                        : 'Restricted'}
                                </p>
                                <p className="mt-2 text-[13px] text-muted-foreground">
                                    {can.view_stock_movements
                                        ? 'Recent stock in, stock out, issuances, and returns.'
                                        : 'Your role does not include stock movement visibility.'}
                                </p>

                                {can.view_stock_movements && (
                                    <Button
                                        variant="outline"
                                        asChild
                                        className="mt-4 w-full"
                                    >
                                        <Link href={stockMovementsIndex()}>
                                            <ArrowUpRight />
                                            View movements
                                        </Link>
                                    </Button>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    <ModuleSnapshotCard
                        icon={BarChart3}
                        title="Quotations"
                        valueLabel="quotation"
                        description="Sales records still moving through the pipeline."
                        restrictedDescription="Your role does not include quotation visibility."
                        secondaryLabel="Awarded"
                        actionLabel="View quotations"
                        href={quotationsIndex()}
                        snapshot={quotationSnapshot}
                        canView={can.view_quotations}
                    />

                    <ModuleSnapshotCard
                        icon={FolderKanban}
                        title="Projects"
                        valueLabel="project"
                        description="Awarded jobs that still need delivery follow-through."
                        restrictedDescription="Your role does not include project visibility."
                        secondaryLabel="On hold"
                        actionLabel="View projects"
                        href={projectsIndex()}
                        snapshot={projectSnapshot}
                        canView={can.view_projects}
                    />

                    <ModuleSnapshotCard
                        icon={ClipboardList}
                        title="Work orders"
                        valueLabel="work order"
                        description="Active service and execution work in the field."
                        restrictedDescription="Your role does not include work-order visibility."
                        secondaryLabel="For review"
                        actionLabel="View work orders"
                        href={workOrdersIndex()}
                        snapshot={workOrderSnapshot}
                        canView={can.view_work_orders}
                    />

                    <ComplianceSnapshotCard
                        snapshot={complianceSnapshot}
                        canView={can.view_compliance}
                        canViewAlerts={can.view_compliance_alerts}
                    />
                </div>

                <div className="grid gap-6 xl:grid-cols-[1.15fr_1fr]">
                    {can.view_low_stock && (
                        <Card>
                            <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <TriangleAlert className="size-4 text-muted-foreground" />
                                        <CardTitle>Low stock</CardTitle>
                                    </div>
                                    <CardDescription>
                                        Items to replenish or transfer.
                                    </CardDescription>
                                </div>

                                <Button variant="outline" asChild>
                                    <Link href={inventoryLowStock()}>
                                        <ArrowUpRight />
                                        View all
                                    </Link>
                                </Button>
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
                                                On hand
                                            </th>
                                            <th className="px-6 py-3 font-medium">
                                                Reorder
                                            </th>
                                            <th className="px-6 py-3 font-medium">
                                                Shortage
                                            </th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {lowStockSnapshot.items.length ===
                                            0 && (
                                            <tr>
                                                <td
                                                    colSpan={5}
                                                    className="px-6 py-10 text-center text-muted-foreground"
                                                >
                                                    No low-stock items right
                                                    now.
                                                </td>
                                            </tr>
                                        )}

                                        {lowStockSnapshot.items.map((item) => (
                                            <tr
                                                key={item.id}
                                                className="border-b align-top last:border-0"
                                            >
                                                <td className="px-6 py-4">
                                                    <Link
                                                        href={inventoryShow(
                                                            item.id,
                                                        )}
                                                        className="font-medium hover:underline"
                                                    >
                                                        {item.item_code}
                                                    </Link>
                                                    <p className="text-muted-foreground">
                                                        {item.item_name}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">
                                                        Unit: {item.unit}
                                                    </p>
                                                </td>
                                                <td className="px-6 py-4 text-muted-foreground">
                                                    {item.category.name ??
                                                        'Uncategorized'}
                                                </td>
                                                <td className="px-6 py-4 text-muted-foreground">
                                                    {item.quantity_on_hand.toFixed(
                                                        2,
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 text-muted-foreground">
                                                    {item.reorder_level.toFixed(
                                                        2,
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 font-medium text-amber-700">
                                                    {item.shortage.toFixed(2)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </CardContent>
                        </Card>
                    )}

                    {can.view_stock_movements && (
                        <Card>
                            <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <Boxes className="size-4 text-muted-foreground" />
                                        <CardTitle>Recent movements</CardTitle>
                                    </div>
                                    <CardDescription>
                                        Warehouse entries from the last 7 days.
                                    </CardDescription>
                                </div>

                                <Button variant="outline" asChild>
                                    <Link href={stockMovementsIndex()}>
                                        <ArrowUpRight />
                                        View log
                                    </Link>
                                </Button>
                            </CardHeader>

                            <CardContent className="space-y-3">
                                {movementSnapshot.items.length === 0 && (
                                    <div className="flex items-center gap-2 rounded-lg border border-dashed px-4 py-6 text-sm text-muted-foreground">
                                        <Boxes className="size-4" />
                                        No stock movements in the last 7 days.
                                    </div>
                                )}

                                {movementSnapshot.items.map((movement) => (
                                    <div
                                        key={movement.id}
                                        className="rounded-lg border px-4 py-3"
                                    >
                                        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <Badge
                                                    variant="outline"
                                                    className={movementBadgeClass(
                                                        movement.movement_type,
                                                    )}
                                                >
                                                    {
                                                        movement.movement_type_label
                                                    }
                                                </Badge>
                                                <span className="text-sm text-muted-foreground">
                                                    {movement.reference_number ??
                                                        'No reference number'}
                                                </span>
                                            </div>

                                            <p className="text-sm text-muted-foreground">
                                                {formatDate(
                                                    movement.movement_date,
                                                )}
                                            </p>
                                        </div>

                                        <div className="mt-3 grid gap-2 text-sm text-muted-foreground">
                                            <p>
                                                Item:{' '}
                                                <span className="font-medium text-foreground">
                                                    {movement.inventory_item
                                                        .item_code ??
                                                        'No code'}{' '}
                                                    -{' '}
                                                    {movement.inventory_item
                                                        .item_name ?? 'No item'}
                                                </span>
                                            </p>
                                            <p>
                                                Warehouse:{' '}
                                                <span className="font-medium text-foreground">
                                                    {movement.warehouse
                                                        .warehouse_code ??
                                                        'No code'}{' '}
                                                    -{' '}
                                                    {movement.warehouse
                                                        .warehouse_name ??
                                                        'No warehouse'}
                                                </span>
                                            </p>
                                        </div>

                                        <div className="mt-3 flex flex-wrap gap-4 text-sm">
                                            <p className="text-muted-foreground">
                                                Quantity:{' '}
                                                <span className="font-medium text-foreground">
                                                    {movement.quantity.toFixed(
                                                        2,
                                                    )}
                                                </span>
                                            </p>
                                            <p className="text-muted-foreground">
                                                Balance after:{' '}
                                                <span className="font-medium text-foreground">
                                                    {movement.balance_after.toFixed(
                                                        2,
                                                    )}
                                                </span>
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </>
    );
}

Dashboard.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: dashboard(),
        },
    ],
};
