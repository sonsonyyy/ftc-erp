import { Head, Link } from '@inertiajs/react';
import type { ComponentProps, ReactNode } from 'react';
import {
    AlertTriangle,
    ArrowRightLeft,
    ArrowUpRight,
    CalendarDays,
    ClipboardList,
    FileText,
    FolderKanban,
    type LucideIcon,
    Package,
    ShieldCheck,
    Wallet,
} from 'lucide-react';
import {
    Bar,
    BarChart,
    CartesianGrid,
    LabelList,
    Line,
    LineChart,
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

type LinkHref = ComponentProps<typeof Link>['href'];

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

const complianceChartConfig = {
    count: {
        label: 'Due items',
        color: '#2563eb',
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
                'flex min-h-[96px] items-center justify-center rounded-xl border border-dashed bg-muted/15 px-4 text-center text-[11px] leading-5 text-muted-foreground',
                className,
            )}
        >
            {message}
        </div>
    );
}

function SectionAction({ href, label }: { href: LinkHref; label: string }) {
    return (
        <Button
            variant="outline"
            size="sm"
            asChild
            className="h-8 gap-1.5 rounded-full px-3 text-[11px] font-medium"
        >
            <Link href={href}>
                <ArrowUpRight className="size-3.5" />
                {label}
            </Link>
        </Button>
    );
}

function CompactCard({
    icon: Icon,
    title,
    description,
    children,
}: {
    icon: LucideIcon;
    title: string;
    description: string;
    children: ReactNode;
}) {
    return (
        <Card className="h-full gap-3 py-4">
            <CardHeader className="space-y-1 px-4 pb-0">
                <div className="flex items-center gap-2">
                    <Icon className="size-4 text-muted-foreground" />
                    <CardTitle className="text-[15px]">{title}</CardTitle>
                </div>
                <CardDescription className="text-[12px] leading-5">
                    {description}
                </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3 px-4">{children}</CardContent>
        </Card>
    );
}

function DashboardSectionHeader({
    icon: Icon,
    title,
    description,
    action,
}: {
    icon: LucideIcon;
    title: string;
    description: string;
    action?: ReactNode;
}) {
    return (
        <CardHeader className="flex flex-row items-start justify-between gap-3 px-4 pb-0">
            <div className="space-y-1">
                <div className="flex items-center gap-2">
                    <Icon className="size-4 text-muted-foreground" />
                    <CardTitle className="text-[15px]">{title}</CardTitle>
                </div>
                <CardDescription className="text-[12px] leading-5">
                    {description}
                </CardDescription>
            </div>
            {action}
        </CardHeader>
    );
}

function StatBox({
    label,
    value,
    caption,
    className,
}: {
    label: string;
    value: string;
    caption?: string;
    className?: string;
}) {
    return (
        <div
            className={cn(
                'rounded-xl border bg-muted/10 px-3 py-2.5',
                className,
            )}
        >
            <p className="text-[10px] font-medium tracking-[0.18em] text-muted-foreground uppercase">
                {label}
            </p>
            <p className="mt-1 text-lg font-semibold tracking-tight">{value}</p>
            {caption ? (
                <p className="mt-1 text-[11px] leading-4.5 text-muted-foreground">
                    {caption}
                </p>
            ) : null}
        </div>
    );
}

function StatusTile({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex items-center justify-between rounded-lg border px-2.5 py-2 text-[11px]">
            <span className="truncate text-muted-foreground">{label}</span>
            <span className="font-medium text-foreground">{value}</span>
        </div>
    );
}

export default function Dashboard({ dashboard }: Props) {
    const inventoryHasMovementData =
        dashboard.inventory.warehouse_activity.length > 0;
    const complianceHasTrendData =
        dashboard.compliance.due_items_trend.length > 0;
    const compactTableClass =
        'text-[12px] [&_td]:align-middle [&_td]:px-4 [&_td]:py-2.5 [&_th]:h-8 [&_th]:px-4 [&_th]:text-[10px] [&_th]:tracking-[0.14em]';

    return (
        <>
            <Head title="Dashboard" />

            <div className="app-page flex flex-1 flex-col gap-5">
                <div className="space-y-1">
                    <h1 className="text-lg font-semibold tracking-tight sm:text-xl">
                        Dashboard
                    </h1>
                    <p className="text-xs text-muted-foreground sm:text-sm">
                        Daily view of sales, operations, and warehouse activity.
                    </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-2 xl:auto-rows-fr xl:grid-cols-4">
                    <CompactCard
                        icon={Package}
                        title="Inventory"
                        description="Warehouse stock and movement pulse."
                    >
                        {dashboard.can.view_low_stock ||
                        dashboard.can.view_stock_movements ? (
                            <>
                                <div className="grid grid-cols-2 gap-2">
                                    <StatBox
                                        label="Low stock"
                                        value={formatNumber(
                                            dashboard.inventory.low_stock_count,
                                        )}
                                        caption="Reorder watchlist"
                                    />
                                    <StatBox
                                        label="7d movements"
                                        value={formatNumber(
                                            dashboard.inventory
                                                .movement_count_7_days,
                                        )}
                                        caption="Warehouse activity"
                                    />
                                </div>

                                <div className="flex flex-wrap gap-1.5 border-t pt-2">
                                    {dashboard.can.view_low_stock ? (
                                        <SectionAction
                                            href={inventoryLowStock()}
                                            label="Low stock"
                                        />
                                    ) : null}
                                    {dashboard.can.view_stock_movements ? (
                                        <SectionAction
                                            href={stockMovementsIndex()}
                                            label="Movements"
                                        />
                                    ) : null}
                                </div>
                            </>
                        ) : (
                            <AccessRestrictedPanel
                                message={restrictedMessage('inventory')}
                            />
                        )}
                    </CompactCard>

                    <CompactCard
                        icon={FileText}
                        title="Quotations"
                        description="Pipeline volume and follow-ups."
                    >
                        {dashboard.can.view_quotations ? (
                            <>
                                <div className="flex items-start justify-between gap-3 rounded-xl border bg-muted/10 px-3 py-2.5">
                                    <div>
                                        <p className="text-[10px] font-medium tracking-[0.18em] text-muted-foreground uppercase">
                                            This month
                                        </p>
                                        <p className="mt-1 text-2xl font-semibold tracking-tight">
                                            {formatNumber(
                                                dashboard.quotations
                                                    .total_quotations,
                                            )}
                                        </p>
                                    </div>
                                    <Badge
                                        variant="outline"
                                        className="rounded-full px-2.5 py-1 text-[10px] font-medium"
                                    >
                                        {dashboard.quotations.conversion_rate}%
                                    </Badge>
                                </div>

                                <div className="grid grid-cols-3 gap-1.5">
                                    {dashboard.quotations.breakdown.map(
                                        (item) => (
                                            <StatusTile
                                                key={item.key}
                                                label={item.label}
                                                value={String(item.count)}
                                            />
                                        ),
                                    )}
                                </div>

                                <div className="flex items-center justify-between border-t pt-2 text-[11px]">
                                    <span className="text-muted-foreground">
                                        Pipeline value
                                    </span>
                                    <span className="font-medium">
                                        {formatCurrency(
                                            dashboard.quotations.total_value,
                                            0,
                                        )}
                                    </span>
                                </div>

                                <div className="flex flex-wrap gap-1.5">
                                    <SectionAction
                                        href={quotationsIndex()}
                                        label="Open quotations"
                                    />
                                </div>
                            </>
                        ) : (
                            <AccessRestrictedPanel
                                message={restrictedMessage('quotation')}
                            />
                        )}
                    </CompactCard>

                    <CompactCard
                        icon={FolderKanban}
                        title="Projects"
                        description="Awarded work and delivery status."
                    >
                        {dashboard.can.view_projects ? (
                            <>
                                <div className="flex items-start justify-between gap-3 rounded-xl border bg-muted/10 px-3 py-2.5">
                                    <div>
                                        <p className="text-[10px] font-medium tracking-[0.18em] text-muted-foreground uppercase">
                                            Active
                                        </p>
                                        <p className="mt-1 text-2xl font-semibold tracking-tight">
                                            {formatNumber(
                                                dashboard.projects
                                                    .active_projects,
                                            )}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] font-medium tracking-[0.18em] text-muted-foreground uppercase">
                                            Value
                                        </p>
                                        <p className="mt-1 text-sm font-semibold tracking-tight">
                                            {dashboard.projects
                                                .total_project_value === null
                                                ? 'Restricted'
                                                : formatCompactCurrency(
                                                      dashboard.projects
                                                          .total_project_value,
                                                  )}
                                        </p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-1.5">
                                    {dashboard.projects.statuses.map((item) => (
                                        <StatusTile
                                            key={item.key}
                                            label={item.label}
                                            value={String(item.count)}
                                        />
                                    ))}
                                </div>

                                <div className="flex flex-wrap gap-1.5 border-t pt-2">
                                    <SectionAction
                                        href={projectsIndex()}
                                        label="Open projects"
                                    />
                                </div>
                            </>
                        ) : (
                            <AccessRestrictedPanel
                                message={restrictedMessage('project')}
                            />
                        )}
                    </CompactCard>

                    <CompactCard
                        icon={ClipboardList}
                        title="Work orders"
                        description="Execution load and review queue."
                    >
                        {dashboard.can.view_work_orders ? (
                            <>
                                <div className="grid grid-cols-2 gap-2">
                                    <StatBox
                                        label="Active"
                                        value={formatNumber(
                                            dashboard.work_orders
                                                .active_work_orders,
                                        )}
                                        caption="Field and service work"
                                    />
                                    <StatBox
                                        label="For review"
                                        value={formatNumber(
                                            dashboard.work_orders
                                                .for_review_count,
                                        )}
                                        caption="Awaiting close-out"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-1.5">
                                    {dashboard.work_orders.statuses.map(
                                        (item) => (
                                            <StatusTile
                                                key={item.key}
                                                label={item.label}
                                                value={String(item.count)}
                                            />
                                        ),
                                    )}
                                </div>

                                <div className="flex flex-wrap gap-1.5 border-t pt-2">
                                    <SectionAction
                                        href={workOrdersIndex()}
                                        label="Open work orders"
                                    />
                                </div>
                            </>
                        ) : (
                            <AccessRestrictedPanel
                                message={restrictedMessage('work order')}
                            />
                        )}
                    </CompactCard>
                </div>

                <div className="grid gap-3 xl:grid-cols-[minmax(0,1.7fr)_minmax(340px,0.95fr)]">
                    <Card className="gap-3 py-4">
                        <DashboardSectionHeader
                            icon={Wallet}
                            title="Monthly Billing / Revenue"
                            description="Billed amount per month (₱)"
                            action={
                                <Badge
                                    variant="outline"
                                    className="rounded-full px-2.5 py-1 text-[10px] font-medium"
                                >
                                    {dashboard.monthly_billing.range_label}
                                </Badge>
                            }
                        />

                        <CardContent className="px-4 pb-1">
                            {dashboard.can.view_billing ? (
                                <ChartContainer
                                    config={monthlyBillingChartConfig}
                                    className="h-[220px] w-full sm:h-[240px]"
                                >
                                    <BarChart
                                        accessibilityLayer
                                        data={dashboard.monthly_billing.items}
                                        margin={{
                                            left: 4,
                                            right: 4,
                                            top: 16,
                                            bottom: 0,
                                        }}
                                    >
                                        <CartesianGrid
                                            vertical={false}
                                            strokeDasharray="3 3"
                                        />
                                        <XAxis
                                            dataKey="month"
                                            tickLine={false}
                                            axisLine={false}
                                            tickMargin={8}
                                            tick={{ fontSize: 10 }}
                                        />
                                        <YAxis
                                            tickLine={false}
                                            axisLine={false}
                                            tickFormatter={(value) =>
                                                formatCompactCurrency(
                                                    Number(value),
                                                )
                                            }
                                            width={52}
                                            tick={{ fontSize: 10 }}
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
                                            maxBarSize={46}
                                        >
                                            <LabelList
                                                dataKey="amount"
                                                position="top"
                                                formatter={(value) =>
                                                    formatCompactCurrency(
                                                        toNumericValue(value),
                                                    )
                                                }
                                                className="fill-foreground text-[10px]"
                                            />
                                        </Bar>
                                    </BarChart>
                                </ChartContainer>
                            ) : (
                                <AccessRestrictedPanel
                                    className="min-h-[220px]"
                                    message={restrictedMessage('billing')}
                                />
                            )}
                        </CardContent>
                    </Card>

                    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
                        <Card className="gap-3 py-4">
                            <DashboardSectionHeader
                                icon={Wallet}
                                title="AR Aging Summary"
                                description="Outstanding receivables by aging (₱)"
                                action={
                                    <Badge
                                        variant="outline"
                                        className="rounded-full px-2.5 py-1 text-[10px] font-medium"
                                    >
                                        {dashboard.ar_aging.as_of_label}
                                    </Badge>
                                }
                            />

                            <CardContent className="space-y-3 px-4 pb-1">
                                {dashboard.can.view_billing ? (
                                    <>
                                        <ChartContainer
                                            config={arAgingChartConfig}
                                            className="h-[170px] w-full"
                                        >
                                            <BarChart
                                                accessibilityLayer
                                                data={dashboard.ar_aging.items}
                                                margin={{
                                                    left: 4,
                                                    right: 4,
                                                    top: 16,
                                                    bottom: 0,
                                                }}
                                            >
                                                <CartesianGrid
                                                    vertical={false}
                                                    strokeDasharray="3 3"
                                                />
                                                <XAxis
                                                    dataKey="bucket"
                                                    tickLine={false}
                                                    axisLine={false}
                                                    tickMargin={8}
                                                    tick={{ fontSize: 10 }}
                                                />
                                                <YAxis
                                                    tickLine={false}
                                                    axisLine={false}
                                                    tickFormatter={(value) =>
                                                        formatCompactCurrency(
                                                            Number(value),
                                                        )
                                                    }
                                                    width={48}
                                                    tick={{ fontSize: 10 }}
                                                />
                                                <ChartTooltip
                                                    content={
                                                        <ChartTooltipContent
                                                            formatter={(
                                                                value,
                                                            ) =>
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
                                                    maxBarSize={40}
                                                />
                                            </BarChart>
                                        </ChartContainer>

                                        <div className="border-t pt-2 text-[11px] text-muted-foreground">
                                            Total AR:{' '}
                                            <span className="font-medium text-foreground">
                                                {formatCurrency(
                                                    dashboard.ar_aging.total_ar,
                                                    0,
                                                )}
                                            </span>
                                        </div>
                                    </>
                                ) : (
                                    <AccessRestrictedPanel
                                        className="min-h-[170px]"
                                        message={restrictedMessage('billing')}
                                    />
                                )}
                            </CardContent>
                        </Card>

                        <Card className="gap-3 py-4">
                            <DashboardSectionHeader
                                icon={ShieldCheck}
                                title="Compliance watch"
                                description="Deadlines building in the next 30 days."
                                action={
                                    dashboard.can.view_compliance ? (
                                        <SectionAction
                                            href={complianceRecordsIndex()}
                                            label="Open registry"
                                        />
                                    ) : undefined
                                }
                            />

                            <CardContent className="grid gap-3 px-4">
                                {dashboard.can.view_compliance ? (
                                    <>
                                        {complianceHasTrendData ? (
                                            <ChartContainer
                                                config={complianceChartConfig}
                                                className="h-[110px] w-full"
                                            >
                                                <LineChart
                                                    accessibilityLayer
                                                    data={
                                                        dashboard.compliance
                                                            .due_items_trend
                                                    }
                                                    margin={{
                                                        left: 2,
                                                        right: 2,
                                                        top: 8,
                                                        bottom: 0,
                                                    }}
                                                >
                                                    <CartesianGrid
                                                        vertical={false}
                                                        strokeDasharray="3 3"
                                                    />
                                                    <XAxis
                                                        dataKey="label"
                                                        tickLine={false}
                                                        axisLine={false}
                                                        tickMargin={8}
                                                        tick={{ fontSize: 10 }}
                                                    />
                                                    <YAxis hide />
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
                                                </LineChart>
                                            </ChartContainer>
                                        ) : (
                                            <AccessRestrictedPanel
                                                className="min-h-[110px]"
                                                message="No deadlines in the next 30 days."
                                            />
                                        )}

                                        <div className="grid grid-cols-3 gap-1.5">
                                            <StatusTile
                                                label="Renewal"
                                                value={formatNumber(
                                                    dashboard.compliance
                                                        .for_renewal_count,
                                                )}
                                            />
                                            <StatusTile
                                                label="Overdue"
                                                value={formatNumber(
                                                    dashboard.compliance
                                                        .overdue_count,
                                                )}
                                            />
                                            <StatusTile
                                                label="Expired"
                                                value={formatNumber(
                                                    dashboard.compliance
                                                        .expired_count,
                                                )}
                                            />
                                        </div>
                                    </>
                                ) : (
                                    <AccessRestrictedPanel
                                        className="min-h-[180px]"
                                        message={restrictedMessage(
                                            'compliance',
                                        )}
                                    />
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>

                <div className="grid gap-3 xl:grid-cols-[minmax(0,1.45fr)_minmax(340px,0.95fr)]">
                    <Card className="gap-3 overflow-hidden py-4">
                        <DashboardSectionHeader
                            icon={ArrowRightLeft}
                            title="Recent movements"
                            description="Warehouse entries from the last 7 days."
                            action={
                                dashboard.can.view_stock_movements ? (
                                    <SectionAction
                                        href={stockMovementsIndex()}
                                        label="View log"
                                    />
                                ) : undefined
                            }
                        />

                        <CardContent className="grid gap-3 px-4">
                            {dashboard.can.view_stock_movements ? (
                                <>
                                    {inventoryHasMovementData ? (
                                        <ChartContainer
                                            config={
                                                warehouseActivityChartConfig
                                            }
                                            className="h-[125px] w-full"
                                        >
                                            <LineChart
                                                accessibilityLayer
                                                data={
                                                    dashboard.inventory
                                                        .warehouse_activity
                                                }
                                                margin={{
                                                    left: 2,
                                                    right: 2,
                                                    top: 8,
                                                    bottom: 0,
                                                }}
                                            >
                                                <CartesianGrid
                                                    vertical={false}
                                                    strokeDasharray="3 3"
                                                />
                                                <XAxis
                                                    dataKey="date"
                                                    tickLine={false}
                                                    axisLine={false}
                                                    tickMargin={8}
                                                    tick={{ fontSize: 10 }}
                                                />
                                                <YAxis hide />
                                                <ChartTooltip
                                                    content={
                                                        <ChartTooltipContent
                                                            formatter={(
                                                                value,
                                                            ) =>
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
                                    ) : (
                                        <AccessRestrictedPanel
                                            className="min-h-[125px]"
                                            message="No warehouse activity in the last 7 days."
                                        />
                                    )}

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
                                                            className="hover:bg-muted/30"
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
                                                                        'text-[10px]',
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
                                                        className="py-6 text-center text-[11px] text-muted-foreground"
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
                            <CardFooter className="border-t bg-muted/20 px-4 py-2.5 text-[11px] text-muted-foreground">
                                {tableFooterLabel(
                                    dashboard.recent_movements.length,
                                    dashboard.inventory.movement_count_7_days,
                                    'movements',
                                )}
                            </CardFooter>
                        ) : null}
                    </Card>

                    <div className="grid gap-3">
                        <Card className="gap-3 overflow-hidden py-4">
                            <DashboardSectionHeader
                                icon={FileText}
                                title="Pending Follow-ups"
                                description="Quotations needing the next sales touch."
                                action={
                                    dashboard.can.view_quotations ? (
                                        <SectionAction
                                            href={quotationsIndex()}
                                            label="View all"
                                        />
                                    ) : undefined
                                }
                            />

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
                                            {dashboard.pending_follow_ups
                                                .length > 0 ? (
                                                dashboard.pending_follow_ups.map(
                                                    (followUp) => (
                                                        <TableRow
                                                            key={followUp.id}
                                                            className="hover:bg-muted/30"
                                                        >
                                                            <TableCell className="min-w-0">
                                                                <span className="line-clamp-2 text-[12px] leading-5 font-medium">
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
                                                        className="py-6 text-center text-[11px] text-muted-foreground"
                                                    >
                                                        No pending follow-ups
                                                        right now.
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                        </TableBody>
                                    </Table>
                                ) : (
                                    <div className="px-4 pb-4">
                                        <AccessRestrictedPanel
                                            message={restrictedMessage(
                                                'quotation',
                                            )}
                                        />
                                    </div>
                                )}
                            </CardContent>

                            {dashboard.can.view_quotations ? (
                                <CardFooter className="border-t bg-muted/20 px-4 py-2.5 text-[11px] text-muted-foreground">
                                    {tableFooterLabel(
                                        dashboard.pending_follow_ups.length,
                                        dashboard.quotations
                                            .pending_follow_up_total,
                                        'follow-ups',
                                    )}
                                </CardFooter>
                            ) : null}
                        </Card>

                        <Card className="gap-3 overflow-hidden py-4">
                            <DashboardSectionHeader
                                icon={CalendarDays}
                                title="Upcoming Jobs"
                                description="Scheduled field activity ahead."
                                action={
                                    dashboard.can.view_work_orders ? (
                                        <SectionAction
                                            href={workOrdersIndex()}
                                            label="View all"
                                        />
                                    ) : undefined
                                }
                            />

                            <CardContent className="px-0">
                                {dashboard.can.view_work_orders ? (
                                    <Table className={compactTableClass}>
                                        <TableHeader className="bg-muted/25">
                                            <TableRow className="hover:bg-transparent">
                                                <TableHead>Customer</TableHead>
                                                <TableHead>Job Type</TableHead>
                                                <TableHead>
                                                    Schedule Date
                                                </TableHead>
                                                <TableHead>Site</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {dashboard.upcoming_jobs.length >
                                            0 ? (
                                                dashboard.upcoming_jobs.map(
                                                    (job) => (
                                                        <TableRow
                                                            key={job.id}
                                                            className="hover:bg-muted/30"
                                                        >
                                                            <TableCell className="min-w-0">
                                                                <span className="line-clamp-2 text-[12px] leading-5 font-medium">
                                                                    {
                                                                        job.customer
                                                                    }
                                                                </span>
                                                            </TableCell>
                                                            <TableCell className="min-w-0 text-muted-foreground">
                                                                <span className="line-clamp-2 leading-5">
                                                                    {
                                                                        job.job_type
                                                                    }
                                                                </span>
                                                            </TableCell>
                                                            <TableCell>
                                                                <div className="flex items-center gap-1.5 text-muted-foreground">
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
                                                        className="py-6 text-center text-[11px] text-muted-foreground"
                                                    >
                                                        No upcoming jobs
                                                        scheduled.
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
                                <CardFooter className="border-t bg-muted/20 px-4 py-2.5 text-[11px] text-muted-foreground">
                                    {tableFooterLabel(
                                        dashboard.upcoming_jobs.length,
                                        dashboard.work_orders
                                            .upcoming_job_total,
                                        'jobs',
                                    )}
                                </CardFooter>
                            ) : null}
                        </Card>
                    </div>
                </div>

                <Card className="gap-3 overflow-hidden py-4">
                    <DashboardSectionHeader
                        icon={AlertTriangle}
                        title="Low stock"
                        description="Items to replenish or transfer."
                        action={
                            dashboard.can.view_low_stock ? (
                                <SectionAction
                                    href={inventoryLowStock()}
                                    label="View all"
                                />
                            ) : undefined
                        }
                    />

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
                                                className="hover:bg-muted/30"
                                            >
                                                <TableCell className="min-w-0">
                                                    <Link
                                                        href={inventoryShow(
                                                            item.id,
                                                        )}
                                                        className="line-clamp-2 text-[12px] leading-5 font-medium hover:underline"
                                                    >
                                                        {item.item_name}
                                                    </Link>
                                                    <p className="text-[11px] text-muted-foreground">
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
                                                className="py-6 text-center text-[11px] text-muted-foreground"
                                            >
                                                No low-stock items right now.
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
                        <CardFooter className="border-t bg-muted/20 px-4 py-2.5 text-[11px] text-muted-foreground">
                            {tableFooterLabel(
                                dashboard.low_stock.length,
                                dashboard.inventory.low_stock_total,
                                'items',
                            )}
                        </CardFooter>
                    ) : null}
                </Card>
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
