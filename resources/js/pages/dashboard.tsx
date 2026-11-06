import { Head, Link } from '@inertiajs/react';
import {
    AlertTriangle,
    ArrowUpRight,
    CalendarDays,
    ClipboardList,
    FileText,
    FolderKanban,
    Package,
    ShieldCheck,
    Wallet,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { ComponentProps, ReactNode } from 'react';
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
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from '@/components/ui/chart';
import type { ChartConfig } from '@/components/ui/chart';
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
import { index as complianceRecordsIndex } from '@/routes/compliance-records';
import {
    lowStock as inventoryLowStock,
    show as inventoryShow,
} from '@/routes/inventory';
import { index as projectsIndex } from '@/routes/projects';
import { index as quotationsIndex } from '@/routes/quotations';
import { index as stockMovementsIndex } from '@/routes/stock-movements';
import { index as workOrdersIndex } from '@/routes/work-orders';
import type { DashboardData } from '@/types/dashboard';

type Props = {
    dashboard: DashboardData;
};

type LinkHref = ComponentProps<typeof Link>['href'];

const monthlyBillingChartConfig = {
    amount: {
        label: 'Billed amount',
        color: '#0f766e',
    },
} satisfies ChartConfig;

const arAgingChartConfig = {
    amount: {
        label: 'Outstanding',
        color: '#d9485f',
    },
} satisfies ChartConfig;

const complianceChartConfig = {
    count: {
        label: 'Due items',
        color: '#d97706',
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
                'flex min-h-[96px] items-center justify-center rounded-lg border border-dashed bg-muted/25 px-4 text-center text-[11px] leading-5 text-muted-foreground',
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
            className="h-8 gap-1.5 rounded-md px-3 text-[11px] font-medium"
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
    children,
    className,
    iconWrapperClassName,
    iconClassName,
    accentClassName,
    glowClassName,
}: {
    icon: LucideIcon;
    title: string;
    children: ReactNode;
    className?: string;
    iconWrapperClassName?: string;
    iconClassName?: string;
    accentClassName?: string;
    glowClassName?: string;
}) {
    return (
        <Card
            className={cn(
                'relative h-full gap-3 overflow-hidden border-transparent bg-white/96 py-4',
                className,
            )}
        >
            {accentClassName ? (
                <div
                    className={cn(
                        'pointer-events-none absolute inset-x-0 top-0 h-1.5 rounded-t-lg',
                        accentClassName,
                    )}
                />
            ) : null}
            {glowClassName ? (
                <div
                    className={cn(
                        'pointer-events-none absolute -top-6 -right-6 h-24 w-24 rounded-full opacity-80 blur-3xl',
                        glowClassName,
                    )}
                />
            ) : null}

            <CardHeader className="space-y-1.5 px-4 pt-1 pb-0">
                <div className="flex items-center gap-3">
                    <div
                        className={cn(
                            'flex size-9 shrink-0 items-center justify-center rounded-lg border border-transparent bg-foreground shadow-[0_16px_32px_-20px_rgba(15,23,42,0.28)]',
                            iconWrapperClassName,
                        )}
                    >
                        <Icon
                            className={cn(
                                'size-[18px] text-foreground/70',
                                iconClassName,
                            )}
                        />
                    </div>
                    <div className="min-w-0">
                        <CardTitle className="text-[15px]">{title}</CardTitle>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="grid gap-3 px-4">{children}</CardContent>
        </Card>
    );
}

function DashboardSectionHeader({
    icon: Icon,
    title,
    action,
    iconWrapperClassName,
    iconClassName,
}: {
    icon: LucideIcon;
    title: string;
    action?: ReactNode;
    iconWrapperClassName?: string;
    iconClassName?: string;
}) {
    return (
        <CardHeader className="flex flex-row items-center justify-between gap-3 px-4 pb-0">
            <div className="flex min-w-0 items-center gap-3">
                <div
                    className={cn(
                        'flex size-9 shrink-0 items-center justify-center rounded-lg border bg-background/92 shadow-[0_12px_24px_-20px_rgba(15,23,42,0.18)]',
                        iconWrapperClassName,
                    )}
                >
                    <Icon
                        className={cn(
                            'size-[18px] text-foreground/70',
                            iconClassName,
                        )}
                    />
                </div>
                <div className="min-w-0">
                    <CardTitle className="text-[15px]">{title}</CardTitle>
                </div>
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
                'rounded-lg bg-background/92 px-3 py-2.5 shadow-[0_10px_20px_-18px_rgba(15,23,42,0.18)]',
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

function StatusTile({
    label,
    value,
    className,
}: {
    label: string;
    value: string;
    className?: string;
}) {
    return (
        <div
            className={cn(
                'flex items-center justify-between rounded-lg bg-background/88 px-2.5 py-2 text-[11px] shadow-[0_10px_20px_-18px_rgba(15,23,42,0.16)]',
                className,
            )}
        >
            <span className="truncate text-muted-foreground">{label}</span>
            <span className="font-medium text-foreground">{value}</span>
        </div>
    );
}

export default function Dashboard({ dashboard }: Props) {
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

                <div className="grid gap-3 sm:grid-cols-2 md:auto-rows-fr xl:grid-cols-4">
                    <CompactCard
                        icon={Package}
                        title="Inventory"
                        className="shadow-[0_22px_48px_-34px_rgba(4,120,87,0.26)]"
                        accentClassName="bg-linear-to-r from-emerald-700 via-emerald-600 to-emerald-500"
                        glowClassName="bg-emerald-200/55"
                        iconWrapperClassName="bg-emerald-700 shadow-[0_16px_32px_-20px_rgba(4,120,87,0.52)]"
                        iconClassName="text-white"
                    >
                        {dashboard.can.view_low_stock ||
                        dashboard.can.view_stock_movements ? (
                            <>
                                <div className="grid grid-cols-2 gap-2">
                                    <StatBox
                                        className="bg-background/94"
                                        label="Low stock"
                                        value={formatNumber(
                                            dashboard.inventory.low_stock_count,
                                        )}
                                    />
                                    <StatBox
                                        className="bg-background/94"
                                        label="7 Days"
                                        value={formatNumber(
                                            dashboard.inventory
                                                .movement_count_7_days,
                                        )}
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
                        className="shadow-[0_22px_48px_-34px_rgba(13,148,136,0.26)]"
                        accentClassName="bg-linear-to-r from-teal-700 via-teal-600 to-cyan-500"
                        glowClassName="bg-teal-200/55"
                        iconWrapperClassName="bg-teal-700 shadow-[0_16px_32px_-20px_rgba(15,118,110,0.5)]"
                        iconClassName="text-white"
                    >
                        {dashboard.can.view_quotations ? (
                            <>
                                <div className="grid grid-cols-2 gap-2">
                                    <StatBox
                                        className="bg-background/94"
                                        label="This month"
                                        value={formatNumber(
                                            dashboard.quotations
                                                .total_quotations,
                                        )}
                                    />
                                    <StatBox
                                        className="bg-background/94"
                                        label="Conversion"
                                        value={`${dashboard.quotations.conversion_rate}%`}
                                    />
                                </div>

                                <div className="flex flex-wrap gap-1.5 border-t pt-2">
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
                        className="shadow-[0_22px_48px_-34px_rgba(8,145,178,0.24)]"
                        accentClassName="bg-linear-to-r from-cyan-700 via-sky-600 to-sky-500"
                        glowClassName="bg-cyan-200/55"
                        iconWrapperClassName="bg-cyan-700 shadow-[0_16px_32px_-20px_rgba(8,145,178,0.48)]"
                        iconClassName="text-white"
                    >
                        {dashboard.can.view_projects ? (
                            <>
                                <div className="grid grid-cols-2 gap-2">
                                    <StatBox
                                        className="bg-background/94"
                                        label="Active"
                                        value={formatNumber(
                                            dashboard.projects.active_projects,
                                        )}
                                    />
                                    <StatBox
                                        className="bg-background/94"
                                        label="Value"
                                        value={
                                            dashboard.projects
                                                .total_project_value === null
                                                ? 'Restricted'
                                                : formatCompactCurrency(
                                                      dashboard.projects
                                                          .total_project_value,
                                                  )
                                        }
                                    />
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
                        className="shadow-[0_22px_48px_-34px_rgba(217,119,6,0.24)]"
                        accentClassName="bg-linear-to-r from-amber-700 via-amber-600 to-orange-500"
                        glowClassName="bg-amber-200/55"
                        iconWrapperClassName="bg-amber-700 shadow-[0_16px_32px_-20px_rgba(180,83,9,0.46)]"
                        iconClassName="text-white"
                    >
                        {dashboard.can.view_work_orders ? (
                            <>
                                <div className="grid grid-cols-2 gap-2">
                                    <StatBox
                                        className="bg-background/94"
                                        label="Active"
                                        value={formatNumber(
                                            dashboard.work_orders
                                                .active_work_orders,
                                        )}
                                    />
                                    <StatBox
                                        className="bg-background/94"
                                        label="For review"
                                        value={formatNumber(
                                            dashboard.work_orders
                                                .for_review_count,
                                        )}
                                    />
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

                <Card className="gap-3 border-transparent bg-white/95 py-4">
                    <DashboardSectionHeader
                        icon={Wallet}
                        title="Monthly Billing / Revenue"
                        iconWrapperClassName="border-emerald-100/80 bg-emerald-50 text-emerald-700"
                        iconClassName="text-emerald-700"
                        action={
                            <Badge
                                variant="outline"
                                className="rounded-md border-emerald-100 bg-white/92 px-2.5 py-1 text-[10px] font-medium text-emerald-700"
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
                                            formatCompactCurrency(Number(value))
                                        }
                                        width={52}
                                        tick={{ fontSize: 10 }}
                                    />
                                    <ChartTooltip
                                        content={
                                            <ChartTooltipContent
                                                formatter={(value) =>
                                                    formatCurrency(
                                                        toNumericValue(value),
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

                <div className="grid gap-3 xl:grid-cols-2">
                    <Card className="gap-3 border-transparent bg-white/95 py-4">
                        <DashboardSectionHeader
                            icon={Wallet}
                            title="AR Aging Summary"
                            iconWrapperClassName="border-rose-100/80 bg-rose-50 text-rose-700"
                            iconClassName="text-rose-700"
                            action={
                                <Badge
                                    variant="outline"
                                    className="rounded-md border-rose-100 bg-white/92 px-2.5 py-1 text-[10px] font-medium text-rose-700"
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

                    {dashboard.can.view_compliance && (
                        <Card className="gap-3 border-transparent bg-white/95 py-4">
                            <DashboardSectionHeader
                                icon={ShieldCheck}
                                title="Compliance watch"
                                iconWrapperClassName="border-amber-100/80 bg-amber-50 text-amber-700"
                                iconClassName="text-amber-700"
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
                                                className="bg-muted/50"
                                            />
                                            <StatusTile
                                                label="Overdue"
                                                value={formatNumber(
                                                    dashboard.compliance
                                                        .overdue_count,
                                                )}
                                                className="bg-muted/50"
                                            />
                                            <StatusTile
                                                label="Expired"
                                                value={formatNumber(
                                                    dashboard.compliance
                                                        .expired_count,
                                                )}
                                                className="bg-muted/50"
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
                    )}
                </div>

                <Card className="gap-3 overflow-hidden border-transparent bg-white/95 py-4">
                    <DashboardSectionHeader
                        icon={FileText}
                        title="Pending Follow-ups"
                        iconWrapperClassName="border-teal-100/80 bg-teal-50 text-teal-700"
                        iconClassName="text-teal-700"
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
                                <TableHeader className="bg-muted/40">
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
                                    {dashboard.pending_follow_ups.length > 0 ? (
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
                                                            {followUp.subject}
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
                                                            {followUp.sales_rep}
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
                                                No pending follow-ups right now.
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
                        <CardFooter className="border-t bg-muted/35 px-4 py-2.5 text-[11px] text-muted-foreground">
                            {tableFooterLabel(
                                dashboard.pending_follow_ups.length,
                                dashboard.quotations.pending_follow_up_total,
                                'follow-ups',
                            )}
                        </CardFooter>
                    ) : null}
                </Card>

                <Card className="gap-3 overflow-hidden border-transparent bg-white/95 py-4">
                    <DashboardSectionHeader
                        icon={AlertTriangle}
                        title="Low stock"
                        iconWrapperClassName="border-amber-100/80 bg-amber-50 text-amber-700"
                        iconClassName="text-amber-700"
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
                                <TableHeader className="bg-muted/40">
                                    <TableRow className="hover:bg-transparent">
                                        <TableHead>Item</TableHead>
                                        <TableHead>Category</TableHead>
                                        <TableHead>Location</TableHead>
                                        <TableHead className="text-right">
                                            On hand
                                        </TableHead>
                                        <TableHead className="text-right">
                                            Reorder
                                        </TableHead>
                                        <TableHead className="text-right">
                                            Shortage
                                        </TableHead>
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
                                                <TableCell className="text-muted-foreground">
                                                    {item.location ??
                                                        'No location'}
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
                        <CardFooter className="border-t bg-muted/35 px-4 py-2.5 text-[11px] text-muted-foreground">
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
