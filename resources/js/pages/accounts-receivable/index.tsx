import { Head, router } from '@inertiajs/react';
import {
    BadgeCheck,
    ChevronDown,
    CircleAlert,
    Clock3,
    Eye,
    HandCoins,
    ReceiptText,
    Search,
    SlidersHorizontal,
    Wallet,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { CompactDataTable } from '@/components/compact-data-table';
import { DataTablePaginationFooter } from '@/components/data-table-pagination-footer';
import { DataTableRowActions } from '@/components/data-table-row-actions';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardTitle,
} from '@/components/ui/card';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuSeparator,
    DropdownMenuSub,
    DropdownMenuSubContent,
    DropdownMenuSubTrigger,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { cleanQueryParams, toUrl } from '@/lib/utils';
import { dashboard } from '@/routes';
import { index as accountsReceivableIndex } from '@/routes/accounts-receivable';
import { show as invoicesShow } from '@/routes/invoices';
import type {
    AccountsReceivableRow,
    AccountsReceivableSummary,
    InvoiceFilters,
    PaginatedData,
    SelectOption,
} from '@/types';

type Props = {
    report: PaginatedData<AccountsReceivableRow>;
    summary: AccountsReceivableSummary;
    filters: InvoiceFilters;
    customerOptions: SelectOption[];
    statusOptions: SelectOption[];
};

const accountsReceivableBreadcrumbs = [
    {
        title: 'Dashboard',
        href: dashboard(),
    },
    {
        title: 'Accounts Receivable',
        href: accountsReceivableIndex(),
    },
];

const perPageOptions = ['5', '10', '15', '25'];

function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-PH', {
        style: 'currency',
        currency: 'PHP',
        maximumFractionDigits: 2,
    }).format(amount);
}

function statusBadgeClass(status: string): string {
    return (
        {
            issued: 'border-sky-200 bg-sky-50 text-sky-700',
            partially_paid: 'border-amber-200 bg-amber-50 text-amber-700',
            paid: 'border-emerald-200 bg-emerald-50 text-emerald-700',
            overdue: 'border-rose-200 bg-rose-50 text-rose-700',
        }[status] ?? 'border-slate-200 bg-slate-100 text-slate-700'
    );
}

export default function AccountsReceivableIndex({
    report,
    summary,
    filters,
    customerOptions,
    statusOptions,
}: Props) {
    const [searchInput, setSearchInput] = useState(filters.search);
    const [tableFilters, setTableFilters] = useState({
        customer: filters.customer === null ? '' : String(filters.customer),
        status: filters.status,
        from: filters.from ?? '',
        to: filters.to ?? '',
        per_page: String(filters.per_page),
    });

    useEffect(() => {
        setTableFilters((currentFilters) => {
            const nextFilters = {
                customer:
                    filters.customer === null ? '' : String(filters.customer),
                status: filters.status,
                from: filters.from ?? '',
                to: filters.to ?? '',
                per_page: String(filters.per_page),
            };

            if (
                currentFilters.customer === nextFilters.customer &&
                currentFilters.status === nextFilters.status &&
                currentFilters.from === nextFilters.from &&
                currentFilters.to === nextFilters.to &&
                currentFilters.per_page === nextFilters.per_page
            ) {
                return currentFilters;
            }

            return nextFilters;
        });
    }, [
        filters.customer,
        filters.from,
        filters.per_page,
        filters.status,
        filters.to,
    ]);

    useEffect(() => {
        const normalizedSearch = searchInput.trim();
        const currentCustomer =
            filters.customer === null ? '' : String(filters.customer);
        const currentPerPage = String(filters.per_page);

        if (
            normalizedSearch === filters.search &&
            tableFilters.customer === currentCustomer &&
            tableFilters.status === filters.status &&
            tableFilters.from === (filters.from ?? '') &&
            tableFilters.to === (filters.to ?? '') &&
            tableFilters.per_page === currentPerPage
        ) {
            return;
        }

        const timeout = window.setTimeout(() => {
            router.cancelAll();
            router.get(
                toUrl(accountsReceivableIndex()),
                cleanQueryParams({
                    search: normalizedSearch,
                    customer:
                        tableFilters.customer === ''
                            ? undefined
                            : Number(tableFilters.customer),
                    status: tableFilters.status,
                    from: tableFilters.from,
                    to: tableFilters.to,
                    per_page: Number(tableFilters.per_page),
                    page: 1,
                }),
                {
                    only: ['report', 'filters', 'summary'],
                    replace: true,
                    preserveState: true,
                    preserveScroll: true,
                },
            );
        }, 300);

        return () => window.clearTimeout(timeout);
    }, [
        filters.customer,
        filters.from,
        filters.per_page,
        filters.search,
        filters.status,
        filters.to,
        searchInput,
        tableFilters,
    ]);

    const activeFilterCount =
        (tableFilters.customer === '' ? 0 : 1) +
        (tableFilters.status === '' ? 0 : 1) +
        (tableFilters.from === '' ? 0 : 1) +
        (tableFilters.to === '' ? 0 : 1);
    const summaryCards = [
        {
            title: 'Total outstanding',
            value: formatCurrency(summary.total_outstanding),
            icon: Wallet,
            iconClassName: 'bg-sky-50 text-sky-700',
        },
        {
            title: 'Current balance',
            value: formatCurrency(summary.current_balance),
            icon: Clock3,
            iconClassName: 'bg-indigo-50 text-indigo-700',
        },
        {
            title: 'Overdue balance',
            value: formatCurrency(summary.overdue_balance),
            icon: CircleAlert,
            iconClassName: 'bg-rose-50 text-rose-700',
        },
        {
            title: 'Partially paid',
            value: formatCurrency(summary.partially_paid_balance),
            icon: HandCoins,
            iconClassName: 'bg-amber-50 text-amber-700',
        },
        {
            title: 'Paid invoices',
            value: String(summary.paid_invoice_count),
            icon: BadgeCheck,
            iconClassName: 'bg-emerald-50 text-emerald-700',
        },
        {
            title: 'Paid value',
            value: formatCurrency(summary.paid_invoice_value),
            icon: ReceiptText,
            iconClassName: 'bg-teal-50 text-teal-700',
        },
    ];
    const bucketCards = [
        {
            title: 'Current',
            value: formatCurrency(summary.bucket_totals.current),
        },
        {
            title: '1-30 days',
            value: formatCurrency(summary.bucket_totals.days_1_30),
        },
        {
            title: '31-60 days',
            value: formatCurrency(summary.bucket_totals.days_31_60),
        },
        {
            title: '61-90 days',
            value: formatCurrency(summary.bucket_totals.days_61_90),
        },
        {
            title: '91+ days',
            value: formatCurrency(summary.bucket_totals.days_91_plus),
        },
    ];

    return (
        <>
            <Head title="AR Aging" />

            <div className="app-page flex flex-1 flex-col gap-6">
                <div className="space-y-1.5">
                    <h1 className="text-2xl font-semibold tracking-tight">
                        AR Aging
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Outstanding invoice aging and collection visibility.
                    </p>
                </div>

                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                    {summaryCards.map((card) => {
                        const Icon = card.icon;

                        return (
                            <Card
                                key={card.title}
                                className="border-border/70 py-4 shadow-sm"
                            >
                                <CardContent className="flex items-center gap-3">
                                    <div
                                        className={`flex size-11 shrink-0 items-center justify-center rounded-xl ${card.iconClassName}`}
                                    >
                                        <Icon className="size-5" />
                                    </div>

                                    <div className="space-y-1">
                                        <CardDescription>
                                            {card.title}
                                        </CardDescription>
                                        <CardTitle className="text-2xl tracking-tight">
                                            {card.value}
                                        </CardTitle>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>

                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
                    {bucketCards.map((card) => (
                        <Card
                            key={card.title}
                            className="border-border/70 py-4 shadow-sm"
                        >
                            <CardContent className="space-y-1">
                                <CardDescription>{card.title}</CardDescription>
                                <CardTitle className="text-xl tracking-tight">
                                    {card.value}
                                </CardTitle>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <div className="flex flex-col gap-3">
                    <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center">
                        <div className="relative w-full sm:max-w-sm">
                            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                value={searchInput}
                                onChange={(event) =>
                                    setSearchInput(event.currentTarget.value)
                                }
                                placeholder="Search AR rows"
                                className="h-9 pl-9"
                            />
                        </div>

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-9 bg-background"
                                >
                                    <SlidersHorizontal />
                                    Filters
                                    {activeFilterCount > 0 && (
                                        <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary">
                                            {activeFilterCount}
                                        </span>
                                    )}
                                    <ChevronDown />
                                </Button>
                            </DropdownMenuTrigger>

                            <DropdownMenuContent align="start" className="w-72">
                                <DropdownMenuLabel>Status</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuRadioGroup
                                    value={
                                        tableFilters.status === ''
                                            ? 'all'
                                            : tableFilters.status
                                    }
                                    onValueChange={(value) => {
                                        router.cancelAll();
                                        setTableFilters((currentFilters) => ({
                                            ...currentFilters,
                                            status:
                                                value === 'all' ? '' : value,
                                        }));
                                    }}
                                >
                                    <DropdownMenuRadioItem value="all">
                                        All statuses
                                    </DropdownMenuRadioItem>
                                    {statusOptions.map((option) => (
                                        <DropdownMenuRadioItem
                                            key={option.value}
                                            value={String(option.value)}
                                        >
                                            {option.label}
                                        </DropdownMenuRadioItem>
                                    ))}
                                </DropdownMenuRadioGroup>
                                <DropdownMenuSeparator />
                                <DropdownMenuSub>
                                    <DropdownMenuSubTrigger>
                                        Customer
                                    </DropdownMenuSubTrigger>
                                    <DropdownMenuSubContent className="max-h-80 w-80 overflow-y-auto">
                                        <DropdownMenuRadioGroup
                                            value={
                                                tableFilters.customer === ''
                                                    ? 'all'
                                                    : tableFilters.customer
                                            }
                                            onValueChange={(value) => {
                                                router.cancelAll();
                                                setTableFilters(
                                                    (currentFilters) => ({
                                                        ...currentFilters,
                                                        customer:
                                                            value === 'all'
                                                                ? ''
                                                                : value,
                                                    }),
                                                );
                                            }}
                                        >
                                            <DropdownMenuRadioItem value="all">
                                                All customers
                                            </DropdownMenuRadioItem>
                                            {customerOptions.map((option) => (
                                                <DropdownMenuRadioItem
                                                    key={option.value}
                                                    value={String(option.value)}
                                                >
                                                    {option.label}
                                                </DropdownMenuRadioItem>
                                            ))}
                                        </DropdownMenuRadioGroup>
                                    </DropdownMenuSubContent>
                                </DropdownMenuSub>
                                <DropdownMenuSeparator />
                                <div className="space-y-3 p-2">
                                    <div className="space-y-1">
                                        <p className="text-xs font-medium text-muted-foreground">
                                            Invoice date from
                                        </p>
                                        <Input
                                            type="date"
                                            value={tableFilters.from}
                                            onChange={(event) => {
                                                router.cancelAll();
                                                setTableFilters(
                                                    (currentFilters) => ({
                                                        ...currentFilters,
                                                        from: event
                                                            .currentTarget
                                                            .value,
                                                    }),
                                                );
                                            }}
                                            className="h-9"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-xs font-medium text-muted-foreground">
                                            Invoice date to
                                        </p>
                                        <Input
                                            type="date"
                                            value={tableFilters.to}
                                            onChange={(event) => {
                                                router.cancelAll();
                                                setTableFilters(
                                                    (currentFilters) => ({
                                                        ...currentFilters,
                                                        to: event.currentTarget
                                                            .value,
                                                    }),
                                                );
                                            }}
                                            className="h-9"
                                        />
                                    </div>
                                </div>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>

                <CompactDataTable
                    footer={
                        <DataTablePaginationFooter
                            pagination={report}
                            perPage={tableFilters.per_page}
                            perPageOptions={perPageOptions}
                            onPerPageChange={(value) => {
                                router.cancelAll();
                                setTableFilters((currentFilters) => ({
                                    ...currentFilters,
                                    per_page: value,
                                }));
                            }}
                        />
                    }
                >
                    <table>
                        <thead>
                            <tr>
                                <th>Invoice</th>
                                <th>Customer</th>
                                <th>Linked records</th>
                                <th>Aging</th>
                                <th className="text-right">Amounts</th>
                                <th>Status</th>
                                <th className="text-right">Actions</th>
                            </tr>
                        </thead>

                        <tbody>
                            {report.data.length === 0 && (
                                <tr>
                                    <td
                                        colSpan={7}
                                        className="py-10 text-center text-sm text-muted-foreground"
                                    >
                                        No AR rows matched the current filters.
                                    </td>
                                </tr>
                            )}

                            {report.data.map((row) => (
                                <tr key={row.id}>
                                    <td>
                                        <div className="space-y-0.5">
                                            <p className="max-w-[14rem] truncate font-semibold text-foreground">
                                                {row.invoice_no}
                                            </p>
                                            <p className="max-w-[16rem] truncate text-[13px] text-muted-foreground">
                                                {row.invoice_date ??
                                                    'No invoice date'}{' '}
                                                • Due{' '}
                                                {row.due_date ?? 'Not set'}
                                            </p>
                                        </div>
                                    </td>

                                    <td>
                                        <div className="space-y-0.5">
                                            <p className="max-w-[18rem] truncate font-medium text-foreground">
                                                {row.customer.company_name ??
                                                    'No customer linked'}
                                            </p>
                                            <p className="max-w-[18rem] truncate text-[13px] text-muted-foreground">
                                                {row.customer.customer_code ??
                                                    'No customer code'}
                                            </p>
                                        </div>
                                    </td>

                                    <td className="text-[13px] text-muted-foreground">
                                        <p className="max-w-[18rem] truncate">
                                            {row.project.project_no
                                                ? `${row.project.project_no} • ${row.project.title ?? 'Project'}`
                                                : 'No project linked'}
                                        </p>
                                        <p className="max-w-[18rem] truncate">
                                            {row.work_order.work_order_no
                                                ? `${row.work_order.work_order_no} • ${row.work_order.summary ?? 'Work order'}`
                                                : 'No work order linked'}
                                        </p>
                                    </td>

                                    <td className="text-[13px] text-muted-foreground">
                                        <p className="font-medium text-foreground">
                                            {row.aging_bucket}
                                        </p>
                                        <p>
                                            {row.age_days === null
                                                ? 'No overdue age'
                                                : `${row.age_days} day(s)`}
                                        </p>
                                    </td>

                                    <td className="text-right text-[13px] text-muted-foreground">
                                        <p className="font-medium text-foreground tabular-nums">
                                            {formatCurrency(row.total_amount)}
                                        </p>
                                        <p className="truncate">
                                            Bal{' '}
                                            {formatCurrency(row.balance_amount)}
                                        </p>
                                    </td>

                                    <td>
                                        <Badge
                                            variant="outline"
                                            className={statusBadgeClass(
                                                row.status,
                                            )}
                                        >
                                            {row.status_label}
                                        </Badge>
                                    </td>

                                    <td className="text-right">
                                        <div className="flex justify-end">
                                            <DataTableRowActions
                                                items={[
                                                    {
                                                        key: 'open',
                                                        label: 'Open',
                                                        icon: Eye,
                                                        href: invoicesShow(
                                                            row.id,
                                                        ),
                                                    },
                                                ]}
                                                label={`Open actions for ${row.invoice_no}`}
                                            />
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </CompactDataTable>
            </div>
        </>
    );
}

AccountsReceivableIndex.layout = {
    breadcrumbs: accountsReceivableBreadcrumbs,
};
