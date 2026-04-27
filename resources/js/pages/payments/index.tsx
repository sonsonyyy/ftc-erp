import { Head, Link, router } from '@inertiajs/react';
import {
    ChevronDown,
    Eye,
    Plus,
    Search,
    SlidersHorizontal,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { CompactDataTable } from '@/components/compact-data-table';
import { DataTablePaginationFooter } from '@/components/data-table-pagination-footer';
import { DataTableRowActions } from '@/components/data-table-row-actions';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
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
import {
    create as paymentsCreate,
    index as paymentsIndex,
    show as paymentsShow,
} from '@/routes/payments';
import type {
    PaginatedData,
    PaymentFilters,
    PaymentListItem,
    SelectOption,
} from '@/types';

type Props = {
    payments: PaginatedData<PaymentListItem>;
    filters: PaymentFilters;
    customerOptions: SelectOption[];
    can: {
        create: boolean;
    };
};

const paymentBreadcrumbs = [
    {
        title: 'Dashboard',
        href: dashboard(),
    },
    {
        title: 'Payments',
        href: paymentsIndex(),
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

export default function PaymentsIndex({
    payments,
    filters,
    customerOptions,
    can,
}: Props) {
    const [searchInput, setSearchInput] = useState(filters.search);
    const [tableFilters, setTableFilters] = useState({
        customer: filters.customer === null ? '' : String(filters.customer),
        from: filters.from ?? '',
        to: filters.to ?? '',
        per_page: String(filters.per_page),
    });

    useEffect(() => {
        setTableFilters((currentFilters) => {
            const nextFilters = {
                customer:
                    filters.customer === null ? '' : String(filters.customer),
                from: filters.from ?? '',
                to: filters.to ?? '',
                per_page: String(filters.per_page),
            };

            if (
                currentFilters.customer === nextFilters.customer &&
                currentFilters.from === nextFilters.from &&
                currentFilters.to === nextFilters.to &&
                currentFilters.per_page === nextFilters.per_page
            ) {
                return currentFilters;
            }

            return nextFilters;
        });
    }, [filters.customer, filters.from, filters.per_page, filters.to]);

    useEffect(() => {
        const normalizedSearch = searchInput.trim();
        const currentCustomer =
            filters.customer === null ? '' : String(filters.customer);
        const currentPerPage = String(filters.per_page);

        if (
            normalizedSearch === filters.search &&
            tableFilters.customer === currentCustomer &&
            tableFilters.from === (filters.from ?? '') &&
            tableFilters.to === (filters.to ?? '') &&
            tableFilters.per_page === currentPerPage
        ) {
            return;
        }

        const timeout = window.setTimeout(() => {
            router.cancelAll();
            router.get(
                toUrl(paymentsIndex()),
                cleanQueryParams({
                    search: normalizedSearch,
                    customer:
                        tableFilters.customer === ''
                            ? undefined
                            : Number(tableFilters.customer),
                    from: tableFilters.from,
                    to: tableFilters.to,
                    per_page: Number(tableFilters.per_page),
                    page: 1,
                }),
                {
                    only: ['payments', 'filters'],
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
        filters.to,
        searchInput,
        tableFilters,
    ]);

    const activeFilterCount =
        (tableFilters.customer === '' ? 0 : 1) +
        (tableFilters.from === '' ? 0 : 1) +
        (tableFilters.to === '' ? 0 : 1);

    return (
        <>
            <Head title="Payments" />

            <div className="app-page flex flex-1 flex-col gap-6">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                    <div className="space-y-1.5">
                        <h1 className="text-2xl font-semibold tracking-tight">
                            Payments
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Customer collections and invoice allocations.
                        </p>
                    </div>

                    {can.create && (
                        <Button asChild>
                            <Link href={paymentsCreate()}>
                                <Plus />
                                Record payment
                            </Link>
                        </Button>
                    )}
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
                                placeholder="Search payments"
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
                                            Payment date from
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
                                            Payment date to
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
                            pagination={payments}
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
                                <th>Payment</th>
                                <th>Customer</th>
                                <th className="text-right">Amount</th>
                                <th className="text-right">Allocations</th>
                                <th className="text-right">Actions</th>
                            </tr>
                        </thead>

                        <tbody>
                            {payments.data.length === 0 && (
                                <tr>
                                    <td
                                        colSpan={5}
                                        className="py-10 text-center text-sm text-muted-foreground"
                                    >
                                        No payments matched the current filters.
                                    </td>
                                </tr>
                            )}

                            {payments.data.map((payment) => (
                                <tr key={payment.id}>
                                    <td>
                                        <div className="space-y-0.5">
                                            <p className="max-w-[14rem] truncate font-semibold text-foreground">
                                                {payment.payment_no}
                                            </p>
                                            <p className="max-w-[18rem] truncate text-[13px] text-muted-foreground">
                                                {[
                                                    payment.payment_method,
                                                    payment.reference_no,
                                                    payment.payment_date,
                                                ]
                                                    .filter(Boolean)
                                                    .join(' • ') ||
                                                    'No payment date'}
                                            </p>
                                        </div>
                                    </td>

                                    <td>
                                        <div className="space-y-0.5">
                                            <p className="max-w-[18rem] truncate font-medium text-foreground">
                                                {payment.customer
                                                    .company_name ??
                                                    'No customer linked'}
                                            </p>
                                            <p className="max-w-[18rem] truncate text-[13px] text-muted-foreground">
                                                {payment.customer
                                                    .customer_code ??
                                                    'No customer code'}
                                            </p>
                                        </div>
                                    </td>

                                    <td className="text-right font-medium text-foreground tabular-nums">
                                        {formatCurrency(payment.amount)}
                                    </td>

                                    <td className="text-right text-[13px] text-muted-foreground">
                                        <p className="font-medium text-foreground tabular-nums">
                                            {payment.allocation_count}
                                        </p>
                                        <p>
                                            {payment.recorded_by ??
                                                'No recorder'}
                                        </p>
                                    </td>

                                    <td className="text-right">
                                        <div className="flex justify-end">
                                            <DataTableRowActions
                                                items={
                                                    payment.can.view
                                                        ? [
                                                              {
                                                                  key: 'open',
                                                                  label: 'Open',
                                                                  icon: Eye,
                                                                  href: paymentsShow(
                                                                      payment.id,
                                                                  ),
                                                              },
                                                          ]
                                                        : []
                                                }
                                                label={`Open actions for ${payment.payment_no}`}
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

PaymentsIndex.layout = {
    breadcrumbs: paymentBreadcrumbs,
};
