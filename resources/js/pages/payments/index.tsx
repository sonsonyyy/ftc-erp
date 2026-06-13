import { Head, Link, router } from '@inertiajs/react';
import { Eye, Plus, Search } from 'lucide-react';
import { useEffect, useState } from 'react';
import { ClearableSearchInput } from '@/components/clearable-search-input';
import { CompactDataTable } from '@/components/compact-data-table';
import { DataTablePaginationFooter } from '@/components/data-table-pagination-footer';
import { DataTableRowActions } from '@/components/data-table-row-actions';
import { DateRangeFilter } from '@/components/date-range-filter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cleanQueryParams, toUrl } from '@/lib/utils';
import { dashboard } from '@/routes';
import {
    create as paymentsCreate,
    index as paymentsIndex,
    show as paymentsShow,
} from '@/routes/payments';
import type { PaginatedData, PaymentFilters, PaymentListItem } from '@/types';

type Props = {
    payments: PaginatedData<PaymentListItem>;
    filters: PaymentFilters;
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

export default function PaymentsIndex({ payments, filters, can }: Props) {
    const [searchInput, setSearchInput] = useState(filters.search);
    const [tableFilters, setTableFilters] = useState({
        from: filters.from ?? '',
        to: filters.to ?? '',
        per_page: String(filters.per_page),
    });

    useEffect(() => {
        setTableFilters((currentFilters) => {
            const nextFilters = {
                from: filters.from ?? '',
                to: filters.to ?? '',
                per_page: String(filters.per_page),
            };

            if (
                currentFilters.from === nextFilters.from &&
                currentFilters.to === nextFilters.to &&
                currentFilters.per_page === nextFilters.per_page
            ) {
                return currentFilters;
            }

            return nextFilters;
        });
    }, [filters.from, filters.per_page, filters.to]);

    useEffect(() => {
        const normalizedSearch = searchInput.trim();
        const currentPerPage = String(filters.per_page);

        if (
            normalizedSearch === filters.search &&
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
        filters.from,
        filters.per_page,
        filters.search,
        filters.to,
        searchInput,
        tableFilters,
    ]);

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
                    <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
                        <ClearableSearchInput
                            value={searchInput}
                            onChange={setSearchInput}
                            placeholder="Search payments or customers"
                        />

                        <DateRangeFilter
                            from={tableFilters.from}
                            to={tableFilters.to}
                            fromLabel="Payment from"
                            toLabel="Payment to"
                            placeholder="Payment from - Payment to"
                            onFromChange={(value) => {
                                router.cancelAll();
                                setTableFilters((currentFilters) => ({
                                    ...currentFilters,
                                    from: value,
                                }));
                            }}
                            onToChange={(value) => {
                                router.cancelAll();
                                setTableFilters((currentFilters) => ({
                                    ...currentFilters,
                                    to: value,
                                }));
                            }}
                        />
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
                                                resourceLabel="payment"
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
