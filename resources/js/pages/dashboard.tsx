import { Head, Link } from '@inertiajs/react';
import type { LucideIcon } from 'lucide-react';
import {
    AlertTriangle,
    ArrowRightLeft,
    ArrowUpRight,
    CalendarDays,
    ClipboardList,
    FileText,
    FolderKanban,
    Package,
    ShieldCheck,
    Wallet,
} from 'lucide-react';
import {
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    Label,
    LabelList,
    Line,
    LineChart,
    Pie,
    PieChart,
    XAxis,
    YAxis,
} from 'recharts';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
    type ChartConfig,
} from '@/components/ui/chart';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { dashboard as dashboardRoute } from '@/routes';
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
import type { DashboardData, RecentMovement } from '@/types/dashboard';

type Props = {
    dashboard: DashboardData;
};

const warehouseActivityChartConfig = {
    stock_in: {
        label: 'Stock In',
        color: '#22c55e',
    },
    stock_out: {
        label: 'Stock Out',
        color: '#ef4444',
    },
    transfers: {
        label: 'Transfers',
        color: '#3b82f6',
    },
} satisfies ChartConfig;

const quotationChartConfig = {
    won: {
        label: 'Won',
        color: '#22c55e',
    },
    lost: {
        label: 'Lost',
        color: '#ef4444',
    },
    pending: {
        label: 'Pending',
        color: '#f59e0b',
    },
} satisfies ChartConfig;

const complianceChartConfig = {
    count: {
        label: 'Due items',
        color: '#2563eb',
    },
} satisfies ChartConfig;

const monthlyBillingChartConfig = {
    amount: {
        label: 'Billed amount',
        color: '#2563eb',
    },
} satisfies ChartConfig;

const arAgingChartConfig = {
    amount: {
        label: 'Outstanding',
        color: '#ef4444',
    },
} satisfies ChartConfig;

function formatCurrency(
    amount: number | null,
    maximumFractionDigits = 0,
): string {
    if (amount === null) {
        return 'Restricted';
    }

    return new Intl.NumberFormat('en-PH', {
        style: 'currency',
        currency: 'PHP',
        maximumFractionDigits,
    }).format(amount);
}

function formatCompactCurrency(amount: number): string {
    if (amount >= 1_000_000) {
        return `₱${stripTrailingZeros((amount / 1_000_000).toFixed(2))}M`;
    }

    if (amount >= 1_000) {
        return `₱${stripTrailingZeros((amount / 1_000).toFixed(0))}K`;
    }

    return `₱${stripTrailingZeros(amount.toFixed(0))}`;
}

function stripTrailingZeros(value: string): string {
    return value.replace(/\.0+$/, '').replace(/(\.\d*[1-9])0+$/, '$1');
}

function formatNumber(value: number | null): string {
    if (value === null) {
        return 'Restricted';
    }

    return new Intl.NumberFormat('en-PH').format(value);
}

function formatMetricQuantity(value: number): string {
    const formatted = value.toFixed(2);

    return formatted.endsWith('.00')
        ? formatted.slice(0, -3)
        : formatted.replace(/0$/, '');
}

function toNumericValue(
    value:
        | string
        | number
        | boolean
        | readonly (string | number)[]
        | null
        | undefined,
): number {
    if (Array.isArray(value)) {
        return Number(value[0] ?? 0);
    }

    return Number(value ?? 0);
}

function formatDateLabel(
    value: string | null,
    options?: { includeWeekday?: boolean },
): string {
    if (!value) {
        return 'Not scheduled';
    }

    const date = new Date(value);
    const baseLabel = new Intl.DateTimeFormat('en-PH', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    }).format(date);

    if (!options?.includeWeekday) {
        return baseLabel;
    }

    return `${baseLabel} (${new Intl.DateTimeFormat('en-PH', {
        weekday: 'short',
    }).format(date)})`;
}

function restrictedMessage(moduleLabel: string): string {
    return `Your role does not include ${moduleLabel} visibility.`;
}

function tableFooterLabel(
    count: number,
    total: number | null,
    label: string,
): string {
    if (total === null || total === 0 || count === 0) {
        return `No ${label} to show`;
    }

    return `Showing 1 to ${count} of ${total} ${label}`;
}

function movementBadgeClass(type: RecentMovement['type']): string {
    return (
        {
            IN: 'border-emerald-200 bg-emerald-50 text-emerald-700',
            ISS: 'border-rose-200 bg-rose-50 text-rose-700',
            TRF: 'border-sky-200 bg-sky-50 text-sky-700',
        }[type] ?? 'border-slate-200 bg-slate-100 text-slate-700'
    );
}

function AccessRestrictedPanel({
    message,
    className,
}: {
    message: string;
    className?: string;
}) {
    return (
        <div
            className={cn(
                'flex min-h-[112px] items-center justify-center rounded-xl border border-dashed bg-muted/10 px-4 text-center text-[11px] leading-5 text-muted-foreground sm:text-xs',
                className,
            )}
        >
            {message}
        </div>
    );
}

function SectionAction({
    href,
    label,
}: {
    href: React.ComponentProps<typeof Link>['href'];
    label: string;
}) {
    return (
        <Button
            variant="outline"
            size="sm"
            asChild
            className="h-7 gap-1.5 px-2.5 text-[11px]"
        >
            <Link href={href}>
                <ArrowUpRight />
                {label}
            </Link>
        </Button>
    );
}

function OverviewHeader({
    icon: Icon,
    title,
    description,
}: {
    icon: LucideIcon;
    title: string;
    description: string;
}) {
    return (
        <div className="space-y-1.5">
            <div className="flex items-center gap-1.5 text-sm font-medium">
                <Icon className="size-3.5 text-muted-foreground" />
                <span>{title}</span>
            </div>
            <CardDescription className="text-[11px] leading-4.5">
                {description}
            </CardDescription>
        </div>
    );
}

export default function Dashboard({ dashboard }: Props) {
    const quotationHasData = (dashboard.quotations.total_quotations ?? 0) > 0;
    const quotationChartData = dashboard.quotations.breakdown.map((item) => ({
        ...item,
        value: item.count,
        fill:
            item.key === 'won'
                ? 'var(--color-won)'
                : item.key === 'lost'
                  ? 'var(--color-lost)'
                  : 'var(--color-pending)',
    }));
    const inventoryHasMovementData =
        dashboard.inventory.warehouse_activity.length > 0;
    const complianceHasTrendData =
        dashboard.compliance.due_items_trend.length > 0;
    const compactTableClass =
        'text-[13px] [&_td]:px-4 [&_td]:py-3 [&_th]:h-9 [&_th]:px-4 [&_th]:text-[11px] [&_th]:tracking-[0.12em]';

    return (
        <>
            <Head title="Dashboard" />

            <div className="app-page flex flex-1 flex-col gap-5 lg:gap-6">
                <div className="space-y-1">
                    <h1 className="text-lg font-semibold tracking-tight sm:text-xl">
                        Dashboard
                    </h1>
                    <p className="text-xs text-muted-foreground sm:text-sm">
                        Daily view of sales, operations, and warehouse activity.
                    </p>
                </div>

                <div className="grid items-start gap-3 min-[1680px]:grid-cols-12 lg:grid-cols-2">
                    <Card className="gap-2 min-[1680px]:col-span-4 lg:col-span-2">
                        <CardHeader className="gap-2 px-4 pt-4 pb-0">
                            <OverviewHeader
                                icon={Package}
                                title="Inventory"
                                description="Low stock and recent warehouse movement."
                            />
                        </CardHeader>

                        <CardContent className="grid gap-3 px-4 pb-4">
                            <div className="grid gap-3 sm:grid-cols-2">
                                <div className="rounded-xl border bg-muted/10 p-3">
                                    <p className="text-xs font-medium tracking-[0.14em] text-muted-foreground uppercase">
                                        Low stock
                                    </p>
                                    <p className="mt-1.5 text-xl font-semibold tracking-tight sm:text-2xl">
                                        {formatNumber(
                                            dashboard.inventory.low_stock_count,
                                        )}
                                    </p>
                                    <p className="mt-2 text-xs text-muted-foreground">
                                        {dashboard.can.view_low_stock
                                            ? 'Items below reorder level.'
                                            : restrictedMessage(
                                                  'inventory snapshot',
                                              )}
                                    </p>

                                    {dashboard.can.view_low_stock ? (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            asChild
                                            className="mt-3 h-7 w-full text-[12px]"
                                        >
                                            <Link href={inventoryLowStock()}>
                                                <ArrowUpRight />
                                                View low stock
                                            </Link>
                                        </Button>
                                    ) : null}
                                </div>

                                <div className="rounded-xl border bg-muted/10 p-3">
                                    <p className="text-xs font-medium tracking-[0.14em] text-muted-foreground uppercase">
                                        Movements, 7 days
                                    </p>
                                    <p className="mt-1.5 text-xl font-semibold tracking-tight sm:text-2xl">
                                        {formatNumber(
                                            dashboard.inventory
                                                .movement_count_7_days,
                                        )}
                                    </p>
                                    <p className="mt-2 text-xs text-muted-foreground">
                                        {dashboard.can.view_stock_movements
                                            ? 'Stock in, out, issues, and returns.'
                                            : restrictedMessage(
                                                  'stock movement',
                                              )}
                                    </p>

                                    {dashboard.can.view_stock_movements ? (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            asChild
                                            className="mt-3 h-7 w-full text-[12px]"
                                        >
                                            <Link href={stockMovementsIndex()}>
                                                <ArrowUpRight />
                                                View movements
                                            </Link>
                                        </Button>
                                    ) : null}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <p className="text-[13px] font-medium">
                                        Warehouse activity (7 days)
                                    </p>
                                </div>

                                {dashboard.can.view_stock_movements &&
                                inventoryHasMovementData ? (
                                    <ChartContainer
                                        config={warehouseActivityChartConfig}
                                        className="min-h-[118px] w-full sm:min-h-[128px]"
                                    >
                                        <BarChart
                                            accessibilityLayer
                                            data={
                                                dashboard.inventory
                                                    .warehouse_activity
                                            }
                                            barGap={8}
                                        >
                                            <CartesianGrid vertical={false} />
                                            <XAxis
                                                dataKey="date"
                                                tickLine={false}
                                                axisLine={false}
                                                tickMargin={8}
                                            />
                                            <ChartTooltip
                                                content={
                                                    <ChartTooltipContent
                                                        formatter={(value) =>
                                                            formatMetricQuantity(
                                                                toNumericValue(
                                                                    value,
                                                                ),
                                                            )
                                                        }
                                                    />
                                                }
                                            />
                                            <Bar
                                                dataKey="stock_in"
                                                fill="var(--color-stock_in)"
                                                radius={[4, 4, 0, 0]}
                                            />
                                            <Bar
                                                dataKey="stock_out"
                                                fill="var(--color-stock_out)"
                                                radius={[4, 4, 0, 0]}
                                            />
                                            <Bar
                                                dataKey="transfers"
                                                fill="var(--color-transfers)"
                                                radius={[4, 4, 0, 0]}
                                            />
                                        </BarChart>
                                    </ChartContainer>
                                ) : (
                                    <AccessRestrictedPanel
                                        className="min-h-[118px] sm:min-h-[128px]"
                                        message={
                                            dashboard.can.view_stock_movements
                                                ? 'No warehouse activity in the last 7 days.'
                                                : restrictedMessage(
                                                      'stock movement',
                                                  )
                                        }
                                    />
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="gap-2 min-[1680px]:col-span-2">
                        <CardHeader className="gap-2 px-4 pt-4 pb-0">
                            <OverviewHeader
                                icon={FileText}
                                title="Quotations"
                                description="Total quotations this month"
                            />
                            <div>
                                <p className="text-xl font-semibold tracking-tight sm:text-2xl">
                                    {dashboard.can.view_quotations
                                        ? formatNumber(
                                              dashboard.quotations
                                                  .total_quotations,
                                          )
                                        : 'Restricted'}
                                </p>
                            </div>
                        </CardHeader>

                        <CardContent className="grid gap-3 px-4 pb-4">
                            {dashboard.can.view_quotations ? (
                                <>
                                    {quotationHasData ? (
                                        <div className="grid gap-3 sm:grid-cols-[118px_1fr] sm:items-center">
                                            <ChartContainer
                                                config={quotationChartConfig}
                                                className="mx-auto min-h-[112px] w-full max-w-[112px] sm:min-h-[124px] sm:max-w-[124px]"
                                            >
                                                <PieChart>
                                                    <ChartTooltip
                                                        content={
                                                            <ChartTooltipContent
                                                                formatter={(
                                                                    value,
                                                                ) =>
                                                                    formatNumber(
                                                                        toNumericValue(
                                                                            value,
                                                                        ),
                                                                    )
                                                                }
                                                            />
                                                        }
                                                    />
                                                    <Pie
                                                        data={
                                                            quotationChartData
                                                        }
                                                        dataKey="value"
                                                        nameKey="label"
                                                        innerRadius={32}
                                                        outerRadius={50}
                                                        strokeWidth={3}
                                                    >
                                                        {quotationChartData.map(
                                                            (item) => (
                                                                <Cell
                                                                    key={
                                                                        item.key
                                                                    }
                                                                    fill={
                                                                        item.fill
                                                                    }
                                                                />
                                                            ),
                                                        )}
                                                        <Label
                                                            content={({
                                                                viewBox,
                                                            }) => {
                                                                const centerX =
                                                                    viewBox &&
                                                                    'cx' in
                                                                        viewBox
                                                                        ? viewBox.cx
                                                                        : 0;
                                                                const centerY =
                                                                    viewBox &&
                                                                    'cy' in
                                                                        viewBox
                                                                        ? viewBox.cy
                                                                        : 0;

                                                                return (
                                                                    <text
                                                                        x={
                                                                            centerX
                                                                        }
                                                                        y={
                                                                            centerY
                                                                        }
                                                                        textAnchor="middle"
                                                                        dominantBaseline="middle"
                                                                    >
                                                                        <tspan
                                                                            x={
                                                                                centerX
                                                                            }
                                                                            y={
                                                                                centerY -
                                                                                6
                                                                            }
                                                                            className="fill-foreground text-base font-semibold"
                                                                        >
                                                                            {dashboard
                                                                                .quotations
                                                                                .conversion_rate ??
                                                                                0}
                                                                            %
                                                                        </tspan>
                                                                        <tspan
                                                                            x={
                                                                                centerX
                                                                            }
                                                                            y={
                                                                                centerY +
                                                                                14
                                                                            }
                                                                            className="fill-muted-foreground text-[9px]"
                                                                        >
                                                                            Conversion
                                                                        </tspan>
                                                                    </text>
                                                                );
                                                            }}
                                                        />
                                                    </Pie>
                                                </PieChart>
                                            </ChartContainer>

                                            <div className="grid gap-2 text-[13px]">
                                                {dashboard.quotations.breakdown.map(
                                                    (item) => (
                                                        <div
                                                            key={item.key}
                                                            className="flex items-center justify-between gap-2 rounded-lg border px-3 py-2"
                                                        >
                                                            <div className="flex items-center gap-2">
                                                                <span
                                                                    className={cn(
                                                                        'size-2.5 rounded-full',
                                                                        item.key ===
                                                                            'won' &&
                                                                            'bg-emerald-500',
                                                                        item.key ===
                                                                            'lost' &&
                                                                            'bg-rose-500',
                                                                        item.key ===
                                                                            'pending' &&
                                                                            'bg-amber-500',
                                                                    )}
                                                                />
                                                                <span className="font-medium">
                                                                    {item.label}
                                                                </span>
                                                            </div>
                                                            <span className="text-muted-foreground">
                                                                {item.count} (
                                                                {
                                                                    item.percentage
                                                                }
                                                                %)
                                                            </span>
                                                        </div>
                                                    ),
                                                )}
                                            </div>
                                        </div>
                                    ) : (
                                        <AccessRestrictedPanel
                                            className="min-h-[132px]"
                                            message="No quotation activity recorded for this month."
                                        />
                                    )}

                                    <div className="rounded-xl border bg-muted/10 px-3.5 py-3">
                                        <p className="text-xs font-medium tracking-[0.14em] text-muted-foreground uppercase">
                                            Total value
                                        </p>
                                        <p className="mt-1 text-lg font-semibold tracking-tight">
                                            {formatCurrency(
                                                dashboard.quotations
                                                    .total_value,
                                                0,
                                            )}
                                        </p>
                                    </div>
                                </>
                            ) : (
                                <AccessRestrictedPanel
                                    message={restrictedMessage('quotation')}
                                />
                            )}
                        </CardContent>

                        <CardFooter className="px-4 pt-0 pb-4">
                            {dashboard.can.view_quotations ? (
                                <Button
                                    variant="outline"
                                    asChild
                                    className="h-7 w-full text-[12px]"
                                >
                                    <Link href={quotationsIndex()}>
                                        <ArrowUpRight />
                                        View quotations
                                    </Link>
                                </Button>
                            ) : null}
                        </CardFooter>
                    </Card>

                    <Card className="gap-2 min-[1680px]:col-span-2">
                        <CardHeader className="gap-2 px-4 pt-4 pb-0">
                            <OverviewHeader
                                icon={FolderKanban}
                                title="Projects"
                                description="Active projects"
                            />
                            <div>
                                <p className="text-xl font-semibold tracking-tight sm:text-2xl">
                                    {dashboard.can.view_projects
                                        ? formatNumber(
                                              dashboard.projects
                                                  .active_projects,
                                          )
                                        : 'Restricted'}
                                </p>
                            </div>
                        </CardHeader>

                        <CardContent className="grid gap-3 px-4 pb-4">
                            {dashboard.can.view_projects ? (
                                <>
                                    <div className="grid gap-2">
                                        {dashboard.projects.statuses.map(
                                            (item) => (
                                                <div
                                                    key={item.key}
                                                    className="flex items-center justify-between gap-2 rounded-lg border px-3 py-2 text-[13px]"
                                                >
                                                    <div className="flex items-center gap-2">
                                                        <span
                                                            className={cn(
                                                                'size-2.5 rounded-full',
                                                                item.key ===
                                                                    'planning' &&
                                                                    'bg-blue-500',
                                                                item.key ===
                                                                    'in_progress' &&
                                                                    'bg-orange-500',
                                                                item.key ===
                                                                    'on_hold' &&
                                                                    'bg-amber-500',
                                                                item.key ===
                                                                    'completed' &&
                                                                    'bg-emerald-500',
                                                            )}
                                                        />
                                                        <span className="font-medium">
                                                            {item.label}
                                                        </span>
                                                    </div>
                                                    <span className="text-muted-foreground">
                                                        {item.count}
                                                    </span>
                                                </div>
                                            ),
                                        )}
                                    </div>

                                    <div className="rounded-xl border bg-muted/10 px-3.5 py-3">
                                        <p className="text-xs font-medium tracking-[0.14em] text-muted-foreground uppercase">
                                            Total project value
                                        </p>
                                        <p className="mt-1 text-lg font-semibold tracking-tight">
                                            {formatCurrency(
                                                dashboard.projects
                                                    .total_project_value,
                                                0,
                                            )}
                                        </p>
                                    </div>
                                </>
                            ) : (
                                <AccessRestrictedPanel
                                    message={restrictedMessage('project')}
                                />
                            )}
                        </CardContent>

                        <CardFooter className="px-4 pt-0 pb-4">
                            {dashboard.can.view_projects ? (
                                <Button
                                    variant="outline"
                                    asChild
                                    className="h-7 w-full text-[12px]"
                                >
                                    <Link href={projectsIndex()}>
                                        <ArrowUpRight />
                                        View projects
                                    </Link>
                                </Button>
                            ) : null}
                        </CardFooter>
                    </Card>

                    <Card className="gap-2 min-[1680px]:col-span-2">
                        <CardHeader className="gap-2 px-4 pt-4 pb-0">
                            <OverviewHeader
                                icon={ClipboardList}
                                title="Work orders"
                                description="Active service & execution work"
                            />
                            <div>
                                <p className="text-xl font-semibold tracking-tight sm:text-2xl">
                                    {dashboard.can.view_work_orders
                                        ? formatNumber(
                                              dashboard.work_orders
                                                  .active_work_orders,
                                          )
                                        : 'Restricted'}
                                </p>
                            </div>
                        </CardHeader>

                        <CardContent className="grid gap-3 px-4 pb-4">
                            {dashboard.can.view_work_orders ? (
                                <>
                                    <div className="space-y-3">
                                        <p className="text-[13px] font-medium">
                                            By status
                                        </p>

                                        <div className="space-y-2">
                                            {dashboard.work_orders.statuses.map(
                                                (item) => (
                                                    <div
                                                        key={item.key}
                                                        className="grid grid-cols-[72px_1fr_auto] items-center gap-2.5 text-[13px]"
                                                    >
                                                        <span className="font-medium text-foreground">
                                                            {item.label}
                                                        </span>
                                                        <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                                                            <div
                                                                className="h-full rounded-full transition-all"
                                                                style={{
                                                                    width: `${item.percentage}%`,
                                                                    backgroundColor:
                                                                        item.color,
                                                                }}
                                                            />
                                                        </div>
                                                        <span className="text-xs text-muted-foreground">
                                                            {item.count} (
                                                            {item.percentage}
                                                            %)
                                                        </span>
                                                    </div>
                                                ),
                                            )}
                                        </div>
                                    </div>

                                    <div className="rounded-xl border bg-muted/10 px-3.5 py-3">
                                        <p className="text-xs font-medium tracking-[0.14em] text-muted-foreground uppercase">
                                            For review
                                        </p>
                                        <p className="mt-1 text-lg font-semibold tracking-tight">
                                            {formatNumber(
                                                dashboard.work_orders
                                                    .for_review_count,
                                            )}
                                        </p>
                                        <p className="mt-1 text-xs text-muted-foreground">
                                            Awaiting review
                                        </p>
                                    </div>
                                </>
                            ) : (
                                <AccessRestrictedPanel
                                    message={restrictedMessage('work order')}
                                />
                            )}
                        </CardContent>

                        <CardFooter className="px-4 pt-0 pb-4">
                            {dashboard.can.view_work_orders ? (
                                <Button
                                    variant="outline"
                                    asChild
                                    className="h-7 w-full text-[12px]"
                                >
                                    <Link href={workOrdersIndex()}>
                                        <ArrowUpRight />
                                        View work orders
                                    </Link>
                                </Button>
                            ) : null}
                        </CardFooter>
                    </Card>

                    <Card className="gap-2 min-[1680px]:col-span-2">
                        <CardHeader className="gap-2 px-4 pt-4 pb-0">
                            <OverviewHeader
                                icon={ShieldCheck}
                                title="Compliance"
                                description="Items due soon"
                            />
                            <div>
                                <p className="text-xl font-semibold tracking-tight sm:text-2xl">
                                    {dashboard.can.view_compliance
                                        ? formatNumber(
                                              dashboard.compliance
                                                  .due_soon_count,
                                          )
                                        : 'Restricted'}
                                </p>
                            </div>
                        </CardHeader>

                        <CardContent className="grid gap-3 px-4 pb-4">
                            {dashboard.can.view_compliance ? (
                                <>
                                    <div className="space-y-2">
                                        <p className="text-[13px] font-medium">
                                            Due items (next 30 days)
                                        </p>

                                        {complianceHasTrendData ? (
                                            <ChartContainer
                                                config={complianceChartConfig}
                                                className="min-h-[72px] w-full sm:min-h-[84px]"
                                            >
                                                <LineChart
                                                    accessibilityLayer
                                                    data={
                                                        dashboard.compliance
                                                            .due_items_trend
                                                    }
                                                    margin={{
                                                        left: 4,
                                                        right: 4,
                                                        top: 8,
                                                        bottom: 0,
                                                    }}
                                                >
                                                    <ChartTooltip
                                                        content={
                                                            <ChartTooltipContent
                                                                formatter={(
                                                                    value,
                                                                ) =>
                                                                    formatNumber(
                                                                        toNumericValue(
                                                                            value,
                                                                        ),
                                                                    )
                                                                }
                                                            />
                                                        }
                                                    />
                                                    <Line
                                                        type="monotone"
                                                        dataKey="count"
                                                        stroke="var(--color-count)"
                                                        strokeWidth={2}
                                                        dot={false}
                                                    />
                                                    <XAxis
                                                        dataKey="label"
                                                        hide
                                                    />
                                                    <YAxis hide />
                                                </LineChart>
                                            </ChartContainer>
                                        ) : (
                                            <AccessRestrictedPanel
                                                className="min-h-[72px] sm:min-h-[84px]"
                                                message="No compliance deadlines in the next 30 days."
                                            />
                                        )}
                                    </div>

                                    <div className="grid gap-2 min-[1850px]:grid-cols-3 sm:grid-cols-2">
                                        <div className="rounded-xl border px-3 py-3">
                                            <p className="text-[11px] font-medium tracking-[0.14em] text-muted-foreground uppercase">
                                                For renewal
                                            </p>
                                            <p className="mt-1 text-lg font-semibold tracking-tight">
                                                {formatNumber(
                                                    dashboard.compliance
                                                        .for_renewal_count,
                                                )}
                                            </p>
                                        </div>

                                        <div className="rounded-xl border px-3 py-3">
                                            <p className="text-[11px] font-medium tracking-[0.14em] text-muted-foreground uppercase">
                                                Overdue
                                            </p>
                                            <p className="mt-1 text-lg font-semibold tracking-tight">
                                                {formatNumber(
                                                    dashboard.compliance
                                                        .overdue_count,
                                                )}
                                            </p>
                                        </div>

                                        <div className="rounded-xl border px-3 py-3">
                                            <p className="text-[11px] font-medium tracking-[0.14em] text-muted-foreground uppercase">
                                                Expired / Open alerts
                                            </p>
                                            <p className="mt-1 text-lg font-semibold tracking-tight">
                                                {formatNumber(
                                                    dashboard.compliance
                                                        .expired_count,
                                                )}
                                            </p>
                                            <p className="mt-1 text-xs text-muted-foreground">
                                                {dashboard.can
                                                    .view_compliance_alerts
                                                    ? `${formatNumber(dashboard.compliance.open_alert_count)} open alerts`
                                                    : 'Alert visibility is restricted'}
                                            </p>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <AccessRestrictedPanel
                                    message={restrictedMessage('compliance')}
                                />
                            )}
                        </CardContent>

                        <CardFooter className="gap-2 px-4 pt-0 pb-4">
                            {dashboard.can.view_compliance ? (
                                <>
                                    <Button
                                        variant="outline"
                                        asChild
                                        className="h-7 flex-1 text-[12px]"
                                    >
                                        <Link href={complianceRecordsIndex()}>
                                            <ArrowUpRight />
                                            Registry
                                        </Link>
                                    </Button>
                                    <Button
                                        variant="outline"
                                        asChild
                                        className="h-7 flex-1 text-[12px]"
                                    >
                                        <Link
                                            href={complianceRecordsCalendar()}
                                        >
                                            <ArrowUpRight />
                                            Calendar
                                        </Link>
                                    </Button>
                                </>
                            ) : null}
                        </CardFooter>
                    </Card>
                </div>

                <div className="grid items-start gap-3 xl:grid-cols-12">
                    <Card className="gap-3 xl:col-span-6">
                        <CardHeader className="flex flex-col gap-2 px-4 pt-4 pb-0 sm:flex-row sm:items-start sm:justify-between">
                            <div className="space-y-1">
                                <div className="flex items-center gap-1.5">
                                    <Wallet className="size-3.5 text-muted-foreground" />
                                    <CardTitle className="text-sm">
                                        Monthly Billing / Revenue
                                    </CardTitle>
                                </div>
                                <CardDescription className="text-[11px] leading-4.5">
                                    Billed amount per month (₱)
                                </CardDescription>
                            </div>

                            <Button
                                variant="outline"
                                size="sm"
                                className="h-7 self-start text-[11px]"
                            >
                                {dashboard.monthly_billing.range_label}
                            </Button>
                        </CardHeader>

                        <CardContent className="px-4 pb-4">
                            {dashboard.can.view_billing ? (
                                <ChartContainer
                                    config={monthlyBillingChartConfig}
                                    className="min-h-[180px] w-full sm:min-h-[192px]"
                                >
                                    <BarChart
                                        accessibilityLayer
                                        data={dashboard.monthly_billing.items}
                                        margin={{
                                            left: 8,
                                            right: 8,
                                            top: 16,
                                            bottom: 0,
                                        }}
                                    >
                                        <CartesianGrid vertical={false} />
                                        <XAxis
                                            dataKey="month"
                                            tickLine={false}
                                            axisLine={false}
                                            tickMargin={8}
                                        />
                                        <YAxis
                                            tickLine={false}
                                            axisLine={false}
                                            tickFormatter={(value) =>
                                                formatCompactCurrency(
                                                    Number(value),
                                                )
                                            }
                                            width={56}
                                        />
                                        <ChartTooltip
                                            content={
                                                <ChartTooltipContent
                                                    formatter={(value) =>
                                                        formatCurrency(
                                                            toNumericValue(
                                                                value,
                                                            ),
                                                            0,
                                                        )
                                                    }
                                                />
                                            }
                                        />
                                        <Bar
                                            dataKey="amount"
                                            fill="var(--color-amount)"
                                            radius={[6, 6, 0, 0]}
                                            maxBarSize={48}
                                        >
                                            <LabelList
                                                dataKey="amount"
                                                position="top"
                                                formatter={(value) =>
                                                    formatCompactCurrency(
                                                        toNumericValue(value),
                                                    )
                                                }
                                                className="fill-foreground text-[11px]"
                                            />
                                        </Bar>
                                    </BarChart>
                                </ChartContainer>
                            ) : (
                                <AccessRestrictedPanel
                                    className="min-h-[180px] sm:min-h-[192px]"
                                    message={restrictedMessage('billing')}
                                />
                            )}
                        </CardContent>
                    </Card>

                    <Card className="gap-3 xl:col-span-6">
                        <CardHeader className="flex flex-col gap-2 px-4 pt-4 pb-0 sm:flex-row sm:items-start sm:justify-between">
                            <div className="space-y-1">
                                <div className="flex items-center gap-1.5">
                                    <Wallet className="size-3.5 text-muted-foreground" />
                                    <CardTitle className="text-sm">
                                        AR Aging Summary
                                    </CardTitle>
                                </div>
                                <CardDescription className="text-[11px] leading-4.5">
                                    Outstanding receivables by aging (₱)
                                </CardDescription>
                            </div>

                            <Button
                                variant="outline"
                                size="sm"
                                className="h-7 self-start text-[11px]"
                            >
                                {dashboard.ar_aging.as_of_label}
                            </Button>
                        </CardHeader>

                        <CardContent className="space-y-2.5 px-4 pb-4">
                            {dashboard.can.view_billing ? (
                                <>
                                    <ChartContainer
                                        config={arAgingChartConfig}
                                        className="min-h-[180px] w-full sm:min-h-[192px]"
                                    >
                                        <BarChart
                                            accessibilityLayer
                                            data={dashboard.ar_aging.items}
                                            margin={{
                                                left: 8,
                                                right: 8,
                                                top: 16,
                                                bottom: 0,
                                            }}
                                        >
                                            <CartesianGrid vertical={false} />
                                            <XAxis
                                                dataKey="bucket"
                                                tickLine={false}
                                                axisLine={false}
                                                tickMargin={8}
                                            />
                                            <YAxis
                                                tickLine={false}
                                                axisLine={false}
                                                tickFormatter={(value) =>
                                                    formatCompactCurrency(
                                                        Number(value),
                                                    )
                                                }
                                                width={56}
                                            />
                                            <ChartTooltip
                                                content={
                                                    <ChartTooltipContent
                                                        formatter={(value) =>
                                                            formatCurrency(
                                                                toNumericValue(
                                                                    value,
                                                                ),
                                                                0,
                                                            )
                                                        }
                                                    />
                                                }
                                            />
                                            <Bar
                                                dataKey="amount"
                                                fill="var(--color-amount)"
                                                radius={[6, 6, 0, 0]}
                                                maxBarSize={48}
                                            >
                                                <LabelList
                                                    dataKey="amount"
                                                    position="top"
                                                    formatter={(value) =>
                                                        formatCompactCurrency(
                                                            toNumericValue(
                                                                value,
                                                            ),
                                                        )
                                                    }
                                                    className="fill-foreground text-[11px]"
                                                />
                                            </Bar>
                                        </BarChart>
                                    </ChartContainer>

                                    <p className="text-xs text-muted-foreground sm:text-sm">
                                        Total AR:{' '}
                                        <span className="font-medium text-foreground">
                                            {formatCurrency(
                                                dashboard.ar_aging.total_ar,
                                                0,
                                            )}
                                        </span>
                                    </p>
                                </>
                            ) : (
                                <AccessRestrictedPanel
                                    className="min-h-[180px] sm:min-h-[192px]"
                                    message={restrictedMessage('billing')}
                                />
                            )}
                        </CardContent>
                    </Card>
                </div>

                <div className="grid items-start gap-3 xl:grid-cols-12">
                    <Card className="gap-3 overflow-hidden xl:col-span-6">
                        <CardHeader className="flex flex-col gap-2 px-4 pt-4 pb-0 sm:flex-row sm:items-start sm:justify-between">
                            <div className="space-y-1">
                                <div className="flex items-center gap-1.5">
                                    <AlertTriangle className="size-3.5 text-muted-foreground" />
                                    <CardTitle className="text-sm">
                                        Low stock
                                    </CardTitle>
                                </div>
                                <CardDescription className="text-[11px] leading-4.5">
                                    Items to replenish or transfer.
                                </CardDescription>
                            </div>

                            {dashboard.can.view_low_stock ? (
                                <SectionAction
                                    href={inventoryLowStock()}
                                    label="View all"
                                />
                            ) : null}
                        </CardHeader>

                        <CardContent className="px-0">
                            {dashboard.can.view_low_stock ? (
                                <Table className={compactTableClass}>
                                    <TableHeader className="bg-muted/25">
                                        <TableRow className="hover:bg-transparent">
                                            <TableHead>Item</TableHead>
                                            <TableHead>Category</TableHead>
                                            <TableHead className="text-right">
                                                On hand
                                            </TableHead>
                                            <TableHead className="text-right">
                                                Reorder
                                            </TableHead>
                                            <TableHead className="text-right">
                                                Shortage
                                            </TableHead>
                                            <TableHead>Location</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {dashboard.low_stock.length > 0 ? (
                                            dashboard.low_stock.map((item) => (
                                                <TableRow
                                                    key={item.id}
                                                    className="hover:bg-muted/35"
                                                >
                                                    <TableCell className="min-w-0">
                                                        <Link
                                                            href={inventoryShow(
                                                                item.id,
                                                            )}
                                                            className="line-clamp-2 text-[13px] leading-5 font-medium hover:underline"
                                                        >
                                                            {item.item_name}
                                                        </Link>
                                                        <p className="text-xs text-muted-foreground">
                                                            {item.item_code}
                                                        </p>
                                                    </TableCell>
                                                    <TableCell className="text-muted-foreground">
                                                        {item.category ??
                                                            'Uncategorized'}
                                                    </TableCell>
                                                    <TableCell className="text-right text-muted-foreground">
                                                        {formatMetricQuantity(
                                                            item.on_hand,
                                                        )}{' '}
                                                        {item.unit}
                                                    </TableCell>
                                                    <TableCell className="text-right text-muted-foreground">
                                                        {formatMetricQuantity(
                                                            item.reorder,
                                                        )}{' '}
                                                        {item.unit}
                                                    </TableCell>
                                                    <TableCell className="text-right font-medium text-red-600">
                                                        {formatMetricQuantity(
                                                            item.shortage,
                                                        )}{' '}
                                                        {item.unit}
                                                    </TableCell>
                                                    <TableCell className="text-muted-foreground">
                                                        {item.location ??
                                                            'No location'}
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        ) : (
                                            <TableRow className="hover:bg-transparent">
                                                <TableCell
                                                    colSpan={6}
                                                    className="py-8 text-center text-xs text-muted-foreground sm:text-sm"
                                                >
                                                    No low-stock items right
                                                    now.
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            ) : (
                                <div className="px-4 pb-4">
                                    <AccessRestrictedPanel
                                        message={restrictedMessage('inventory')}
                                    />
                                </div>
                            )}
                        </CardContent>

                        {dashboard.can.view_low_stock ? (
                            <CardFooter className="border-t bg-muted/20 px-4 py-2.5 text-[11px] text-muted-foreground sm:text-xs">
                                {tableFooterLabel(
                                    dashboard.low_stock.length,
                                    dashboard.inventory.low_stock_total,
                                    'items',
                                )}
                            </CardFooter>
                        ) : null}
                    </Card>

                    <Card className="gap-3 overflow-hidden xl:col-span-6">
                        <CardHeader className="flex flex-col gap-2 px-4 pt-4 pb-0 sm:flex-row sm:items-start sm:justify-between">
                            <div className="space-y-1">
                                <div className="flex items-center gap-1.5">
                                    <ArrowRightLeft className="size-3.5 text-muted-foreground" />
                                    <CardTitle className="text-sm">
                                        Recent movements
                                    </CardTitle>
                                </div>
                                <CardDescription className="text-[11px] leading-4.5">
                                    Warehouse entries from the last 7 days.
                                </CardDescription>
                            </div>

                            {dashboard.can.view_stock_movements ? (
                                <SectionAction
                                    href={stockMovementsIndex()}
                                    label="View log"
                                />
                            ) : null}
                        </CardHeader>

                        <CardContent className="grid gap-3 px-4 pb-4">
                            {dashboard.can.view_stock_movements ? (
                                <>
                                    <ChartContainer
                                        config={warehouseActivityChartConfig}
                                        className="min-h-[84px] w-full sm:min-h-[96px]"
                                    >
                                        <LineChart
                                            accessibilityLayer
                                            data={
                                                dashboard.inventory
                                                    .warehouse_activity
                                            }
                                            margin={{
                                                left: 4,
                                                right: 4,
                                                top: 8,
                                                bottom: 0,
                                            }}
                                        >
                                            <CartesianGrid vertical={false} />
                                            <XAxis
                                                dataKey="date"
                                                tickLine={false}
                                                axisLine={false}
                                                tickMargin={8}
                                            />
                                            <YAxis hide />
                                            <ChartTooltip
                                                content={
                                                    <ChartTooltipContent
                                                        formatter={(value) =>
                                                            formatMetricQuantity(
                                                                toNumericValue(
                                                                    value,
                                                                ),
                                                            )
                                                        }
                                                    />
                                                }
                                            />
                                            <Line
                                                type="monotone"
                                                dataKey="stock_in"
                                                stroke="var(--color-stock_in)"
                                                strokeWidth={2}
                                                dot={false}
                                            />
                                            <Line
                                                type="monotone"
                                                dataKey="stock_out"
                                                stroke="var(--color-stock_out)"
                                                strokeWidth={2}
                                                dot={false}
                                            />
                                            <Line
                                                type="monotone"
                                                dataKey="transfers"
                                                stroke="var(--color-transfers)"
                                                strokeWidth={2}
                                                dot={false}
                                            />
                                        </LineChart>
                                    </ChartContainer>

                                    <Table className={compactTableClass}>
                                        <TableHeader className="bg-muted/25">
                                            <TableRow className="hover:bg-transparent">
                                                <TableHead>Date</TableHead>
                                                <TableHead>Type</TableHead>
                                                <TableHead>Reference</TableHead>
                                                <TableHead>Item</TableHead>
                                                <TableHead className="text-right">
                                                    Qty
                                                </TableHead>
                                                <TableHead>Location</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {dashboard.recent_movements.length >
                                            0 ? (
                                                dashboard.recent_movements.map(
                                                    (movement) => (
                                                        <TableRow
                                                            key={movement.id}
                                                            className="hover:bg-muted/35"
                                                        >
                                                            <TableCell className="text-muted-foreground">
                                                                {formatDateLabel(
                                                                    movement.date,
                                                                )}
                                                            </TableCell>
                                                            <TableCell>
                                                                <Badge
                                                                    variant="outline"
                                                                    className={cn(
                                                                        'text-[11px]',
                                                                        movementBadgeClass(
                                                                            movement.type,
                                                                        ),
                                                                    )}
                                                                >
                                                                    {
                                                                        movement.type
                                                                    }
                                                                </Badge>
                                                            </TableCell>
                                                            <TableCell className="text-muted-foreground">
                                                                {movement.reference ??
                                                                    'No reference'}
                                                            </TableCell>
                                                            <TableCell className="font-medium">
                                                                {movement.item}
                                                            </TableCell>
                                                            <TableCell className="text-right font-medium">
                                                                {
                                                                    movement.qty_display
                                                                }
                                                            </TableCell>
                                                            <TableCell className="text-muted-foreground">
                                                                {movement.location ??
                                                                    'No location'}
                                                            </TableCell>
                                                        </TableRow>
                                                    ),
                                                )
                                            ) : (
                                                <TableRow className="hover:bg-transparent">
                                                    <TableCell
                                                        colSpan={6}
                                                        className="py-8 text-center text-xs text-muted-foreground sm:text-sm"
                                                    >
                                                        No recent movements in
                                                        the last 7 days.
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                        </TableBody>
                                    </Table>
                                </>
                            ) : (
                                <AccessRestrictedPanel
                                    message={restrictedMessage(
                                        'stock movement',
                                    )}
                                />
                            )}
                        </CardContent>

                        {dashboard.can.view_stock_movements ? (
                            <CardFooter className="border-t bg-muted/20 px-4 py-2.5 text-[11px] text-muted-foreground sm:text-xs">
                                {tableFooterLabel(
                                    dashboard.recent_movements.length,
                                    dashboard.inventory.movement_count_7_days,
                                    'movements',
                                )}
                            </CardFooter>
                        ) : null}
                    </Card>
                </div>

                <div className="grid items-start gap-3 xl:grid-cols-12">
                    <Card className="gap-3 overflow-hidden xl:col-span-6">
                        <CardHeader className="flex flex-col gap-2 px-4 pt-4 pb-0 sm:flex-row sm:items-start sm:justify-between">
                            <div className="space-y-1">
                                <div className="flex items-center gap-1.5">
                                    <CalendarDays className="size-3.5 text-muted-foreground" />
                                    <CardTitle className="text-sm">
                                        Upcoming Jobs
                                    </CardTitle>
                                </div>
                                <CardDescription className="text-[11px] leading-4.5">
                                    Scheduled field activity ahead.
                                </CardDescription>
                            </div>

                            {dashboard.can.view_work_orders ? (
                                <SectionAction
                                    href={workOrdersIndex()}
                                    label="View all"
                                />
                            ) : null}
                        </CardHeader>

                        <CardContent className="px-0">
                            {dashboard.can.view_work_orders ? (
                                <Table className={compactTableClass}>
                                    <TableHeader className="bg-muted/25">
                                        <TableRow className="hover:bg-transparent">
                                            <TableHead>Customer</TableHead>
                                            <TableHead>Job Type</TableHead>
                                            <TableHead>Schedule Date</TableHead>
                                            <TableHead>Site</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {dashboard.upcoming_jobs.length > 0 ? (
                                            dashboard.upcoming_jobs.map(
                                                (job) => (
                                                    <TableRow
                                                        key={job.id}
                                                        className="hover:bg-muted/35"
                                                    >
                                                        <TableCell className="min-w-0">
                                                            <span className="line-clamp-2 text-[13px] leading-5 font-medium">
                                                                {job.customer}
                                                            </span>
                                                        </TableCell>
                                                        <TableCell className="min-w-0 text-muted-foreground">
                                                            <span className="line-clamp-2 leading-5">
                                                                {job.job_type}
                                                            </span>
                                                        </TableCell>
                                                        <TableCell>
                                                            <div className="flex items-center gap-2 text-muted-foreground">
                                                                <CalendarDays className="size-3" />
                                                                <span className="leading-5">
                                                                    {formatDateLabel(
                                                                        job.schedule_date,
                                                                        {
                                                                            includeWeekday: true,
                                                                        },
                                                                    )}
                                                                </span>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="min-w-0 text-muted-foreground">
                                                            <span className="line-clamp-2 leading-5">
                                                                {job.site}
                                                            </span>
                                                        </TableCell>
                                                    </TableRow>
                                                ),
                                            )
                                        ) : (
                                            <TableRow className="hover:bg-transparent">
                                                <TableCell
                                                    colSpan={4}
                                                    className="py-8 text-center text-xs text-muted-foreground sm:text-sm"
                                                >
                                                    No upcoming jobs scheduled.
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            ) : (
                                <div className="px-4 pb-4">
                                    <AccessRestrictedPanel
                                        message={restrictedMessage(
                                            'work order',
                                        )}
                                    />
                                </div>
                            )}
                        </CardContent>

                        {dashboard.can.view_work_orders ? (
                            <CardFooter className="border-t bg-muted/20 px-4 py-2.5 text-[11px] text-muted-foreground sm:text-xs">
                                {tableFooterLabel(
                                    dashboard.upcoming_jobs.length,
                                    dashboard.work_orders.upcoming_job_total,
                                    'jobs',
                                )}
                            </CardFooter>
                        ) : null}
                    </Card>

                    <Card className="gap-3 overflow-hidden xl:col-span-6">
                        <CardHeader className="flex flex-col gap-2 px-4 pt-4 pb-0 sm:flex-row sm:items-start sm:justify-between">
                            <div className="space-y-1">
                                <div className="flex items-center gap-1.5">
                                    <FileText className="size-3.5 text-muted-foreground" />
                                    <CardTitle className="text-sm">
                                        Pending Follow-ups
                                    </CardTitle>
                                </div>
                                <CardDescription className="text-[11px] leading-4.5">
                                    Quotations needing the next sales touch.
                                </CardDescription>
                            </div>

                            {dashboard.can.view_quotations ? (
                                <SectionAction
                                    href={quotationsIndex()}
                                    label="View all"
                                />
                            ) : null}
                        </CardHeader>

                        <CardContent className="px-0">
                            {dashboard.can.view_quotations ? (
                                <Table className={compactTableClass}>
                                    <TableHeader className="bg-muted/25">
                                        <TableRow className="hover:bg-transparent">
                                            <TableHead>
                                                Quotation / Customer
                                            </TableHead>
                                            <TableHead>Subject</TableHead>
                                            <TableHead>Due Date</TableHead>
                                            <TableHead>Sales Rep</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {dashboard.pending_follow_ups.length >
                                        0 ? (
                                            dashboard.pending_follow_ups.map(
                                                (followUp) => (
                                                    <TableRow
                                                        key={followUp.id}
                                                        className="hover:bg-muted/35"
                                                    >
                                                        <TableCell className="min-w-0">
                                                            <span className="line-clamp-2 text-[13px] leading-5 font-medium">
                                                                {
                                                                    followUp.quotation_customer
                                                                }
                                                            </span>
                                                        </TableCell>
                                                        <TableCell className="min-w-0 text-muted-foreground">
                                                            <span className="line-clamp-2 leading-5">
                                                                {
                                                                    followUp.subject
                                                                }
                                                            </span>
                                                        </TableCell>
                                                        <TableCell>
                                                            <div
                                                                className={cn(
                                                                    'flex items-center gap-1.5',
                                                                    followUp.is_urgent
                                                                        ? 'text-red-600'
                                                                        : 'text-muted-foreground',
                                                                )}
                                                            >
                                                                <CalendarDays className="size-3" />
                                                                <span className="leading-5 font-medium">
                                                                    {formatDateLabel(
                                                                        followUp.due_date,
                                                                    )}
                                                                </span>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="text-muted-foreground">
                                                            <span className="line-clamp-2 leading-5">
                                                                {
                                                                    followUp.sales_rep
                                                                }
                                                            </span>
                                                        </TableCell>
                                                    </TableRow>
                                                ),
                                            )
                                        ) : (
                                            <TableRow className="hover:bg-transparent">
                                                <TableCell
                                                    colSpan={4}
                                                    className="py-8 text-center text-xs text-muted-foreground sm:text-sm"
                                                >
                                                    No pending follow-ups right
                                                    now.
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            ) : (
                                <div className="px-4 pb-4">
                                    <AccessRestrictedPanel
                                        message={restrictedMessage('quotation')}
                                    />
                                </div>
                            )}
                        </CardContent>

                        {dashboard.can.view_quotations ? (
                            <CardFooter className="border-t bg-muted/20 px-4 py-2.5 text-[11px] text-muted-foreground sm:text-xs">
                                {tableFooterLabel(
                                    dashboard.pending_follow_ups.length,
                                    dashboard.quotations
                                        .pending_follow_up_total,
                                    'follow-ups',
                                )}
                            </CardFooter>
                        ) : null}
                    </Card>
                </div>
            </div>
        </>
    );
}

Dashboard.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: dashboardRoute(),
        },
    ],
};
