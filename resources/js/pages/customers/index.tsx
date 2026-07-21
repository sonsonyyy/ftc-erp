import { Head, Link, router } from '@inertiajs/react';
import { Archive, Eye, Pencil, Plus } from 'lucide-react';
import { useEffect, useState } from 'react';
import { ClearableSearchInput } from '@/components/clearable-search-input';
import { CompactDataTable } from '@/components/compact-data-table';
import { DataTablePaginationFooter } from '@/components/data-table-pagination-footer';
import { DataTableRowActions } from '@/components/data-table-row-actions';
import { Button } from '@/components/ui/button';
import { cleanQueryParams, toUrl } from '@/lib/utils';
import { dashboard } from '@/routes';
import {
    create as customersCreate,
    destroy as customersDestroy,
    edit as customersEdit,
    index as customersIndex,
    show as customersShow,
} from '@/routes/customers';
import type { CustomerListItem, PaginatedData } from '@/types';

type Props = {
    customers: PaginatedData<CustomerListItem>;
    filters: {
        search: string;
        per_page: number;
    };
    can: {
        create: boolean;
    };
};

const customerBreadcrumbs = [
    {
        title: 'Dashboard',
        href: dashboard(),
    },
    {
        title: 'Customers',
        href: customersIndex(),
    },
];

const perPageOptions = ['5', '10', '15', '25'];

export default function CustomersIndex({ customers, filters, can }: Props) {
    const [searchInput, setSearchInput] = useState(filters.search);
    const [tableFilters, setTableFilters] = useState({
        per_page: String(filters.per_page),
    });

    useEffect(() => {
        const syncFilters = window.setTimeout(() => {
            setTableFilters((currentFilters) => {
                const nextFilters = {
                    per_page: String(filters.per_page),
                };

                if (currentFilters.per_page === nextFilters.per_page) {
                    return currentFilters;
                }

                return nextFilters;
            });
        }, 0);

        return () => window.clearTimeout(syncFilters);
    }, [filters.per_page]);

    useEffect(() => {
        const normalizedSearch = searchInput.trim();
        const currentPerPage = String(filters.per_page);

        if (
            normalizedSearch === filters.search &&
            tableFilters.per_page === currentPerPage
        ) {
            return;
        }

        const timeout = window.setTimeout(() => {
            router.cancelAll();
            router.get(
                toUrl(customersIndex()),
                cleanQueryParams({
                    search: normalizedSearch,
                    per_page: Number(tableFilters.per_page),
                    page: 1,
                }),
                {
                    only: ['customers', 'filters'],
                    replace: true,
                    preserveState: true,
                    preserveScroll: true,
                },
            );
        }, 300);

        return () => window.clearTimeout(timeout);
    }, [filters.per_page, filters.search, searchInput, tableFilters]);

    return (
        <>
            <Head title="Customers" />

            <div className="app-page flex flex-1 flex-col gap-6">
                <div className="space-y-1.5">
                    <h1 className="text-2xl font-semibold tracking-tight">
                        Customers
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Customer master records for sales, projects, and
                        billing.
                    </p>
                </div>

                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center">
                        <ClearableSearchInput
                            value={searchInput}
                            onChange={setSearchInput}
                            placeholder="Search customers"
                        />
                    </div>

                    {can.create ? (
                        <Button asChild className="lg:shrink-0">
                            <Link href={customersCreate()}>
                                <Plus />
                                New customer
                            </Link>
                        </Button>
                    ) : null}
                </div>

                <CompactDataTable
                    footer={
                        <DataTablePaginationFooter
                            pagination={customers}
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
                                <th>Number</th>
                                <th>Customer</th>
                                <th>Contact</th>
                                <th className="min-w-[11rem] whitespace-nowrap">
                                    Created by
                                </th>
                                <th className="min-w-[10rem] whitespace-nowrap">
                                    Date created
                                </th>
                                <th className="text-right">Sites</th>
                                <th className="text-right">Attachments</th>
                                <th className="text-right">Actions</th>
                            </tr>
                        </thead>

                        <tbody>
                            {customers.data.length === 0 && (
                                <tr>
                                    <td
                                        colSpan={8}
                                        className="py-10 text-center text-sm text-muted-foreground"
                                    >
                                        No customers matched the current
                                        filters.
                                    </td>
                                </tr>
                            )}

                            {customers.data.map((customer) => (
                                <tr key={customer.id}>
                                    <td className="text-[13px] text-muted-foreground">
                                        <p className="max-w-[10rem] truncate">
                                            {customer.customer_code}
                                        </p>
                                    </td>

                                    <td>
                                        <div className="space-y-0.5">
                                            <p className="max-w-[20rem] truncate font-semibold text-foreground">
                                                {customer.company_name}
                                            </p>
                                            <p className="max-w-[20rem] truncate text-[13px] text-muted-foreground">
                                                {customer.trade_name ??
                                                    'No trade name'}
                                            </p>
                                        </div>
                                    </td>

                                    <td>
                                        <div className="space-y-0.5 text-[13px] leading-5 text-muted-foreground">
                                            {customer.phone && (
                                                <p className="max-w-[16rem] truncate">
                                                    {customer.phone}
                                                </p>
                                            )}
                                            {customer.email && (
                                                <p className="max-w-[16rem] truncate">
                                                    {customer.email}
                                                </p>
                                            )}
                                            {!customer.phone &&
                                                !customer.email && (
                                                    <p className="max-w-[16rem] truncate">
                                                        No contact details
                                                    </p>
                                                )}
                                        </div>
                                    </td>

                                    <td className="min-w-[11rem]">
                                        <p className="max-w-[12rem] truncate text-[13px] text-muted-foreground">
                                            {customer.created_by ?? 'Unknown'}
                                        </p>
                                    </td>

                                    <td className="min-w-[10rem]">
                                        <p className="text-[13px] whitespace-nowrap text-muted-foreground">
                                            {customer.date_created ?? 'Unknown'}
                                        </p>
                                    </td>

                                    <td className="text-right font-medium tabular-nums">
                                        {customer.site_count}
                                    </td>

                                    <td className="text-right font-medium tabular-nums">
                                        {customer.attachment_count}
                                    </td>

                                    <td className="text-right">
                                        <div className="flex justify-end">
                                            <DataTableRowActions
                                                resourceLabel="customer"
                                                items={[
                                                    ...(customer.can.view
                                                        ? [
                                                              {
                                                                  key: 'open',
                                                                  label: 'Open',
                                                                  icon: Eye,
                                                                  href: customersShow(
                                                                      customer.id,
                                                                  ),
                                                              },
                                                          ]
                                                        : []),
                                                    ...(customer.can.update
                                                        ? [
                                                              {
                                                                  key: 'edit',
                                                                  label: 'Edit',
                                                                  icon: Pencil,
                                                                  href: customersEdit(
                                                                      customer.id,
                                                                  ),
                                                              },
                                                          ]
                                                        : []),
                                                    ...(customer.can.delete
                                                        ? [
                                                              {
                                                                  key: 'archive',
                                                                  label: 'Archive',
                                                                  icon: Archive,
                                                                  destructive: true,
                                                                  onSelect:
                                                                      () =>
                                                                          router.delete(
                                                                              toUrl(
                                                                                  customersDestroy(
                                                                                      customer.id,
                                                                                  ),
                                                                              ),
                                                                              {
                                                                                  preserveScroll: true,
                                                                              },
                                                                          ),
                                                              },
                                                          ]
                                                        : []),
                                                ]}
                                                label={`Open actions for ${customer.company_name}`}
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

CustomersIndex.layout = {
    breadcrumbs: customerBreadcrumbs,
};
