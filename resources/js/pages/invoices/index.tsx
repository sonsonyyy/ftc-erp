import { Head, Link, router } from '@inertiajs/react';
import {
    ChevronDown,
    CreditCard,
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
import { DateRangeFilter } from '@/components/date-range-filter';
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
    create as invoicesCreate,
    edit as invoicesEdit,
    index as invoicesIndex,
    show as invoicesShow,
} from '@/routes/invoices';
import { create as paymentsCreate } from '@/routes/payments';
import type {
    InvoiceFilters,
    InvoiceListItem,
    PaginatedData,
    SelectOption,
} from '@/types';

type Props = {
    invoices: PaginatedData<InvoiceListItem>;
    filters: InvoiceFilters;
    statusOptions: SelectOption[];
    can: {
        create: boolean;
    };
};

const invoiceBreadcrumbs = [
    {
        title: 'Dashboard',
        href: dashboard(),
    },
    {
        title: 'Invoices',
        href: invoicesIndex(),
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

function formatDate(date: string | null): string {
    if (!date) {
        return 'Not set';
    }

    return new Intl.DateTimeFormat('en-PH', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    }).format(new Date(date));
}

function statusBadgeClass(status: string): string {
    return (
        {
            draft: 'border-slate-200 bg-slate-100 text-slate-700',
            issued: 'border-sky-200 bg-sky-50 text-sky-700',
            partially_paid: 'border-amber-200 bg-amber-50 text-amber-700',
            paid: 'border-emerald-200 bg-emerald-50 text-emerald-700',
            overdue: 'border-rose-200 bg-rose-50 text-rose-700',
            cancelled: 'border-stone-200 bg-stone-100 text-stone-700',
        }[status] ?? 'border-slate-200 bg-slate-100 text-slate-700'
    );
}

export default function InvoicesIndex({
    invoices,
    filters,
    statusOptions,
    can,
}: Props) {
    const [searchInput, setSearchInput] = useState(filters.search);
    const [tableFilters, setTableFilters] = useState({
        status: filters.status,
        from: filters.from ?? '',
        to: filters.to ?? '',
        per_page: String(filters.per_page),
    });

    useEffect(() => {
        setTableFilters((currentFilters) => {
            const nextFilters = {
                status: filters.status,
                from: filters.from ?? '',
                to: filters.to ?? '',
                per_page: String(filters.per_page),
            };

            if (
                currentFilters.status === nextFilters.status &&
                currentFilters.from === nextFilters.from &&
                currentFilters.to === nextFilters.to &&
                currentFilters.per_page === nextFilters.per_page
            ) {
                return currentFilters;
            }

            return nextFilters;
        });
    }, [filters.from, filters.per_page, filters.status, filters.to]);

    useEffect(() => {
        const normalizedSearch = searchInput.trim();
        const currentPerPage = String(filters.per_page);

        if (
            normalizedSearch === filters.search &&
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
                toUrl(invoicesIndex()),
                cleanQueryParams({
                    search: normalizedSearch,
                    status: tableFilters.status,
                    from: tableFilters.from,
                    to: tableFilters.to,
                    per_page: Number(tableFilters.per_page),
                    page: 1,
                }),
                {
                    only: ['invoices', 'filters'],
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
        filters.status,
        filters.to,
        searchInput,
        tableFilters,
    ]);
    const exportHref = invoicesIndex({
        query: cleanQueryParams({
            search: searchInput.trim(),
            status: tableFilters.status,
            from: tableFilters.from,
            to: tableFilters.to,
            export: 'csv',
        }),
    });

    return (
        <>
            <Head title="Invoices" />

            <div className="app-page flex flex-1 flex-col gap-6">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                    <div className="space-y-1.5">
                        <h1 className="text-2xl font-semibold tracking-tight">
                            Invoices
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Billing records and receivable balances.
                        </p>
                    </div>

                    {can.create && (
                        <Button asChild>
                            <Link href={invoicesCreate()}>
                                <Plus />
                                New invoice
                            </Link>
                        </Button>
                    )}
                </div>

                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
                        <div className="relative w-full sm:max-w-sm">
                            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                value={searchInput}
                                onChange={(event) =>
                                    setSearchInput(event.currentTarget.value)
                                }
                                placeholder="Search invoices or customers"
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

                        <DateRangeFilter
                            from={tableFilters.from}
                            to={tableFilters.to}
                            fromLabel="Invoice from"
                            toLabel="Invoice to"
                            placeholder="Invoice from - Invoice to"
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
                            pagination={invoices}
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
                                <th>Linked records</th>
                                <th>Dates</th>
                                <th className="text-right">Amounts</th>
                                <th>Status</th>
                                <th className="text-right">Actions</th>
                            </tr>
                        </thead>

                        <tbody>
                            {invoices.data.length === 0 && (
                                <tr>
                                    <td
                                        colSpan={6}
                                        className="py-10 text-center text-sm text-muted-foreground"
                                    >
                                        No invoices matched the current filters.
                                    </td>
                                </tr>
                            )}

                            {invoices.data.map((invoice) => (
                                <tr key={invoice.id}>
                                    <td>
                                        <div className="space-y-0.5">
                                            <p className="max-w-[14rem] truncate font-semibold text-foreground">
                                                {invoice.invoice_no}
                                            </p>
                                            <p className="max-w-[18rem] truncate text-[13px] text-muted-foreground">
                                                {invoice.customer.company_name
                                                    ? `${invoice.customer.customer_code} • ${invoice.customer.company_name}`
                                                    : 'No customer linked'}
                                            </p>
                                        </div>
                                    </td>

                                    <td className="text-[13px] text-muted-foreground">
                                        <p className="max-w-[18rem] truncate">
                                            {invoice.quotation.quotation_no
                                                ? `Quote • ${invoice.quotation.quotation_no}`
                                                : 'No quotation linked'}
                                        </p>
                                        <p className="max-w-[18rem] truncate">
                                            {invoice.project.project_no
                                                ? `${invoice.project.project_no} • ${invoice.project.title ?? 'Project'}`
                                                : invoice.work_order
                                                        .work_order_no
                                                  ? `${invoice.work_order.work_order_no} • ${invoice.work_order.summary ?? 'Work order'}`
                                                  : 'No project or work order'}
                                        </p>
                                    </td>

                                    <td className="text-[13px] text-muted-foreground">
                                        <p>
                                            {formatDate(invoice.invoice_date)}
                                        </p>
                                        <p>
                                            Due {formatDate(invoice.due_date)}
                                        </p>
                                    </td>

                                    <td className="text-right text-[13px] text-muted-foreground">
                                        <p className="font-medium text-foreground tabular-nums">
                                            {formatCurrency(
                                                invoice.total_amount,
                                            )}
                                        </p>
                                        <p className="truncate">
                                            Bal{' '}
                                            {formatCurrency(
                                                invoice.balance_amount,
                                            )}
                                        </p>
                                    </td>

                                    <td>
                                        <Badge
                                            variant="outline"
                                            className={statusBadgeClass(
                                                invoice.status,
                                            )}
                                        >
                                            {invoice.status_label}
                                        </Badge>
                                    </td>

                                    <td className="text-right">
                                        <div className="flex justify-end">
                                            <DataTableRowActions
                                                items={[
                                                    ...(invoice.can
                                                        .record_payment
                                                        ? [
                                                              {
                                                                  key: 'collect',
                                                                  label: 'Collect',
                                                                  icon: CreditCard,
                                                                  href: paymentsCreate(
                                                                      {
                                                                          query: {
                                                                              invoice:
                                                                                  invoice.id,
                                                                          },
                                                                      },
                                                                  ),
                                                              },
                                                          ]
                                                        : []),
                                                    ...(invoice.can.view
                                                        ? [
                                                              {
                                                                  key: 'open',
                                                                  label: 'Open',
                                                                  icon: Eye,
                                                                  href: invoicesShow(
                                                                      invoice.id,
                                                                  ),
                                                              },
                                                          ]
                                                        : []),
                                                    ...(invoice.can.update
                                                        ? [
                                                              {
                                                                  key: 'edit',
                                                                  label: 'Edit',
                                                                  icon: Pencil,
                                                                  href: invoicesEdit(
                                                                      invoice.id,
                                                                  ),
                                                              },
                                                          ]
                                                        : []),
                                                ]}
                                                label={`Open actions for ${invoice.invoice_no}`}
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

InvoicesIndex.layout = {
    breadcrumbs: invoiceBreadcrumbs,
};
