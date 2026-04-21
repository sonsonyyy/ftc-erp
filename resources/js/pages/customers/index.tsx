import { Head, Link } from '@inertiajs/react';
import { dashboard } from '@/routes';
import {
    create as customersCreate,
    index as customersIndex,
    show as customersShow,
    edit as customersEdit,
} from '@/routes/customers';
import { FilterSelect } from '@/components/filter-select';
import { IndexFiltersCard } from '@/components/index-filters-card';
import { PaginationLinks } from '@/components/pagination-links';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { cleanQueryParams, countActiveFilters } from '@/lib/utils';
import type { CustomerListItem, PaginatedData, SelectOption } from '@/types';

type Props = {
    customers: PaginatedData<CustomerListItem>;
    filters: {
        search: string;
        status: string;
    };
    statusOptions: SelectOption[];
    can: {
        create: boolean;
    };
};

function statusBadgeClass(status: string): string {
    return status === 'active'
        ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
        : 'border-slate-200 bg-slate-100 text-slate-700';
}

export default function CustomersIndex({
    customers,
    filters,
    statusOptions,
    can,
}: Props) {
    const activeFilterCount = countActiveFilters(filters);
    const exportHref = customersIndex({
        query: cleanQueryParams({
            ...filters,
            export: 'csv',
        }),
    });

    return (
        <>
            <Head title="Customers" />

            <div className="flex flex-1 flex-col gap-6 p-4">
                <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                    <div className="space-y-1">
                        <h1 className="text-2xl font-semibold tracking-tight">
                            Customers
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Manage customer master records and keep downstream
                            modules tied to clean source data.
                        </p>
                    </div>

                    {can.create && (
                        <Button asChild>
                            <Link href={customersCreate()}>New customer</Link>
                        </Button>
                    )}
                </div>

                <IndexFiltersCard
                    action={customersIndex()}
                    resetHref={customersIndex()}
                    exportHref={exportHref}
                    description="Search by code, company, trade name, TIN, phone, or email."
                    activeFilterCount={activeFilterCount}
                    fieldsClassName="md:grid-cols-[2fr_1fr]"
                >
                    <Input
                        name="search"
                        defaultValue={filters.search}
                        placeholder="Search customers"
                    />

                    <FilterSelect name="status" defaultValue={filters.status}>
                        <option value="">All statuses</option>
                        {statusOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </FilterSelect>
                </IndexFiltersCard>

                <Card>
                    <CardHeader>
                        <CardTitle>Customer list</CardTitle>
                        <CardDescription>
                            {customers.total} total customer records
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="overflow-x-auto px-0">
                        <table className="min-w-full text-sm">
                            <thead>
                                <tr className="border-b text-left text-muted-foreground">
                                    <th className="px-6 py-3 font-medium">
                                        Customer
                                    </th>
                                    <th className="px-6 py-3 font-medium">
                                        Contact
                                    </th>
                                    <th className="px-6 py-3 font-medium">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 font-medium">
                                        Sites
                                    </th>
                                    <th className="px-6 py-3 font-medium">
                                        Attachments
                                    </th>
                                    <th className="px-6 py-3 text-right font-medium">
                                        Actions
                                    </th>
                                </tr>
                            </thead>

                            <tbody>
                                {customers.data.length === 0 && (
                                    <tr>
                                        <td
                                            colSpan={6}
                                            className="px-6 py-10 text-center text-muted-foreground"
                                        >
                                            No customers matched the current
                                            filters.
                                        </td>
                                    </tr>
                                )}

                                {customers.data.map((customer) => (
                                    <tr
                                        key={customer.id}
                                        className="border-b align-top last:border-0"
                                    >
                                        <td className="px-6 py-4">
                                            <div className="space-y-1">
                                                <p className="font-medium">
                                                    {customer.company_name}
                                                </p>
                                                <p className="text-muted-foreground">
                                                    {customer.customer_code}
                                                    {customer.trade_name &&
                                                        ` • ${customer.trade_name}`}
                                                </p>
                                            </div>
                                        </td>

                                        <td className="px-6 py-4 text-muted-foreground">
                                            <div className="space-y-1">
                                                {customer.phone && (
                                                    <p>{customer.phone}</p>
                                                )}
                                                {customer.email && (
                                                    <p>{customer.email}</p>
                                                )}
                                                {!customer.phone &&
                                                    !customer.email &&
                                                    'No contact details'}
                                            </div>
                                        </td>

                                        <td className="px-6 py-4">
                                            <Badge
                                                variant="outline"
                                                className={statusBadgeClass(
                                                    customer.status,
                                                )}
                                            >
                                                {customer.status_label}
                                            </Badge>
                                        </td>

                                        <td className="px-6 py-4">
                                            {customer.site_count}
                                        </td>
                                        <td className="px-6 py-4">
                                            {customer.attachment_count}
                                        </td>

                                        <td className="px-6 py-4">
                                            <div className="flex justify-end gap-2">
                                                {customer.can.view && (
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        asChild
                                                    >
                                                        <Link
                                                            href={customersShow(
                                                                customer.id,
                                                            )}
                                                        >
                                                            Open
                                                        </Link>
                                                    </Button>
                                                )}

                                                {customer.can.update && (
                                                    <Button size="sm" asChild>
                                                        <Link
                                                            href={customersEdit(
                                                                customer.id,
                                                            )}
                                                        >
                                                            Edit
                                                        </Link>
                                                    </Button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </CardContent>

                    <PaginationLinks pagination={customers} />
                </Card>
            </div>
        </>
    );
}

CustomersIndex.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: dashboard(),
        },
        {
            title: 'Customers',
            href: customersIndex(),
        },
    ],
};
