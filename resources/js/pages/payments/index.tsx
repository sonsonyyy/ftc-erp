import { Head, Link } from '@inertiajs/react';
import { dashboard } from '@/routes';
import {
    create as paymentsCreate,
    index as paymentsIndex,
    show as paymentsShow,
} from '@/routes/payments';
import { FilterSelect } from '@/components/filter-select';
import { DataTableCard } from '@/components/data-table-card';
import { IndexFiltersCard } from '@/components/index-filters-card';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { countActiveFilters } from '@/lib/utils';
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
    const activeFilterCount = countActiveFilters(filters);

    return (
        <>
            <Head title="Payments" />

            <div className="flex flex-1 flex-col gap-6 p-4">
                <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                    <div className="space-y-1">
                        <h1 className="text-2xl font-semibold tracking-tight">
                            Payments
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Record customer collections and keep invoice
                            allocations tied to the source receipt.
                        </p>
                    </div>

                    {can.create && (
                        <Button asChild>
                            <Link href={paymentsCreate()}>Record payment</Link>
                        </Button>
                    )}
                </div>

                <IndexFiltersCard
                    action={paymentsIndex()}
                    resetHref={paymentsIndex()}
                    filters={filters}
                    description="Search by payment number, customer, reference number, or invoice number."
                    activeFilterCount={activeFilterCount}
                >
                    <Input
                        name="search"
                        defaultValue={filters.search}
                        placeholder="Search payments"
                    />

                    <FilterSelect
                        name="customer"
                        defaultValue={filters.customer ?? ''}
                    >
                        <option value="">All customers</option>
                        {customerOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </FilterSelect>

                    <Input
                        name="from"
                        type="date"
                        defaultValue={filters.from ?? ''}
                    />
                    <Input
                        name="to"
                        type="date"
                        defaultValue={filters.to ?? ''}
                    />
                </IndexFiltersCard>

                <DataTableCard
                    title="Payment list"
                    description={`${payments.total} payment records`}
                    pagination={payments}
                >
                    <table className="min-w-full text-sm">
                        <thead>
                            <tr className="border-b text-left text-muted-foreground">
                                <th className="px-6 py-3 font-medium">
                                    Payment
                                </th>
                                <th className="px-6 py-3 font-medium">
                                    Customer
                                </th>
                                <th className="px-6 py-3 font-medium">
                                    Amount
                                </th>
                                <th className="px-6 py-3 font-medium">
                                    Allocations
                                </th>
                                <th className="px-6 py-3 text-right font-medium">
                                    Actions
                                </th>
                            </tr>
                        </thead>

                        <tbody>
                            {payments.data.length === 0 && (
                                <tr>
                                    <td
                                        colSpan={5}
                                        className="px-6 py-10 text-center text-muted-foreground"
                                    >
                                        No payments matched the current filters.
                                    </td>
                                </tr>
                            )}

                            {payments.data.map((payment) => (
                                <tr
                                    key={payment.id}
                                    className="border-b align-top last:border-0"
                                >
                                    <td className="px-6 py-4">
                                        <div className="space-y-1">
                                            <p className="font-medium">
                                                {payment.payment_no}
                                            </p>
                                            <p className="text-muted-foreground">
                                                {payment.payment_method}
                                                {payment.reference_no &&
                                                    ` • ${payment.reference_no}`}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {payment.payment_date ??
                                                    'No date'}{' '}
                                                •{' '}
                                                {payment.recorded_by ??
                                                    'No recorder'}
                                            </p>
                                        </div>
                                    </td>

                                    <td className="px-6 py-4 text-muted-foreground">
                                        {payment.customer.customer_code} -{' '}
                                        {payment.customer.company_name}
                                    </td>

                                    <td className="px-6 py-4 font-medium">
                                        {formatCurrency(payment.amount)}
                                    </td>

                                    <td className="px-6 py-4">
                                        {payment.allocation_count}
                                    </td>

                                    <td className="px-6 py-4">
                                        <div className="flex justify-end gap-2">
                                            {payment.can.view && (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    asChild
                                                >
                                                    <Link
                                                        href={paymentsShow(
                                                            payment.id,
                                                        )}
                                                    >
                                                        Open
                                                    </Link>
                                                </Button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </DataTableCard>
            </div>
        </>
    );
}

PaymentsIndex.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: dashboard(),
        },
        {
            title: 'Payments',
            href: paymentsIndex(),
        },
    ],
};
