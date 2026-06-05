import { Head, Link, router } from '@inertiajs/react';
import {
    Archive,
    ChevronDown,
    Download,
    Ellipsis,
    Eye,
    Pencil,
    Plus,
    Search,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { CompactDataTable } from '@/components/compact-data-table';
import { DataTablePaginationFooter } from '@/components/data-table-pagination-footer';
import { DataTableRowActions } from '@/components/data-table-row-actions';
import { FilterSelect } from '@/components/filter-select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { cleanQueryParams, toUrl } from '@/lib/utils';
import { dashboard } from '@/routes';
import {
    create as customersCreate,
    destroy as customersDestroy,
    edit as customersEdit,
    index as customersIndex,
    show as customersShow,
} from '@/routes/customers';
import type { CustomerListItem, PaginatedData, SelectOption } from '@/types';

type Props = {
    customers: PaginatedData<CustomerListItem>;
    filters: {
        search: string;
        status: string;
        per_page: number;
    };
    statusOptions: SelectOption[];
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
    const [searchInput, setSearchInput] = useState(filters.search);
    const [tableFilters, setTableFilters] = useState({
        status: filters.status,
        per_page: String(filters.per_page),
    });

    useEffect(() => {
        setTableFilters((currentFilters) => {
            const nextFilters = {
                status: filters.status,
                per_page: String(filters.per_page),
            };

            if (
                currentFilters.status === nextFilters.status &&
                currentFilters.per_page === nextFilters.per_page
            ) {
                return currentFilters;
            }

            return nextFilters;
        });
    }, [filters.per_page, filters.status]);

    useEffect(() => {
        const normalizedSearch = searchInput.trim();
        const currentPerPage = String(filters.per_page);

        if (
            normalizedSearch === filters.search &&
            tableFilters.status === filters.status &&
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
                    status: tableFilters.status,
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
    }, [
        filters.per_page,
        filters.search,
        filters.status,
        searchInput,
        tableFilters,
    ]);

    const exportHref = customersIndex({
        query: cleanQueryParams({
            search: searchInput.trim(),
            status: tableFilters.status,
            export: 'csv',
        }),
    });

    return (
        <>
            <Head title="Customers" />

            <div className="app-page flex flex-1 flex-col gap-6">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                    <div className="space-y-1.5">
                        <h1 className="text-2xl font-semibold tracking-tight">
                            Customers
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Customer master records for sales, projects, and
                            billing.
                        </p>
                    </div>

                    {can.create && (
                        <Button asChild>
                            <Link href={customersCreate()}>
                                <Plus />
                                New customer
                            </Link>
                        </Button>
                    )}
                </div>

                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center">
                        <div className="relative w-full sm:max-w-sm">
                            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                value={searchInput}
                                onChange={(event) =>
                                    setSearchInput(event.currentTarget.value)
                                }
                                placeholder="Search customers"
                                className="h-9 pl-9"
                            />
                        </div>

                        <FilterSelect
                            value={tableFilters.status}
                            onChange={(event) => {
                                router.cancelAll();
                                setTableFilters((currentFilters) => ({
                                    ...currentFilters,
                                    status: event.currentTarget.value,
                                }));
                            }}
                            className="w-full sm:w-[180px]"
                        >
                            <option value="">All statuses</option>
                            {statusOptions.map((option) => (
                                <option
                                    key={option.value}
                                    value={String(option.value)}
                                >
                                    {option.label}
                                </option>
                            ))}
                        </FilterSelect>
                    </div>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="outline"
                                size="sm"
                                className="h-9 bg-background"
                            >
                                <Ellipsis />
                                Actions
                                <ChevronDown />
                            </Button>
                        </DropdownMenuTrigger>

                        <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem asChild>
                                <a href={toUrl(exportHref)}>
                                    <Download />
                                    Export CSV
                                </a>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
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
                                <th>Customer</th>
                                <th>Contact</th>
                                <th>Status</th>
                                <th className="text-right">Sites</th>
                                <th className="text-right">Attachments</th>
                                <th className="text-right">Actions</th>
                            </tr>
                        </thead>

                        <tbody>
                            {customers.data.length === 0 && (
                                <tr>
                                    <td
                                        colSpan={6}
                                        className="py-10 text-center text-sm text-muted-foreground"
                                    >
                                        No customers matched the current
                                        filters.
                                    </td>
                                </tr>
                            )}

                            {customers.data.map((customer) => (
                                <tr key={customer.id}>
                                    <td>
                                        <div className="space-y-0.5">
                                            <p className="max-w-[20rem] truncate font-semibold text-foreground">
                                                {customer.company_name}
                                            </p>
                                            <p className="max-w-[20rem] truncate text-[13px] text-muted-foreground">
                                                {[
                                                    customer.customer_code,
                                                    customer.trade_name,
                                                ]
                                                    .filter(Boolean)
                                                    .join(' • ') ||
                                                    customer.customer_code}
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

                                    <td>
                                        <Badge
                                            variant="outline"
                                            className={statusBadgeClass(
                                                customer.status,
                                            )}
                                        >
                                            {customer.status_label}
                                        </Badge>
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
