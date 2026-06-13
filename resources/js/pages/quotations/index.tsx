import { Head, Link, router } from '@inertiajs/react';
import { Archive, Eye, Pencil, Plus } from 'lucide-react';
import { useEffect, useState } from 'react';
import { ClearableSearchInput } from '@/components/clearable-search-input';
import { CompactDataTable } from '@/components/compact-data-table';
import { DataTablePaginationFooter } from '@/components/data-table-pagination-footer';
import { DataTableRowActions } from '@/components/data-table-row-actions';
import { DateRangeFilter } from '@/components/date-range-filter';
import { FilterSelect } from '@/components/filter-select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cleanQueryParams, toUrl } from '@/lib/utils';
import { dashboard } from '@/routes';
import {
    create as quotationsCreate,
    destroy as quotationsDestroy,
    edit as quotationsEdit,
    index as quotationsIndex,
    show as quotationsShow,
} from '@/routes/quotations';
import type {
    PaginatedData,
    QuotationFilters,
    QuotationListItem,
    SelectOption,
} from '@/types';

type Props = {
    quotations: PaginatedData<QuotationListItem>;
    filters: QuotationFilters;
    statusOptions: SelectOption[];
    can: {
        create: boolean;
    };
};

const quotationBreadcrumbs = [
    {
        title: 'Dashboard',
        href: dashboard(),
    },
    {
        title: 'Quotations',
        href: quotationsIndex(),
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
            submitted: 'border-sky-200 bg-sky-50 text-sky-700',
            under_review: 'border-amber-200 bg-amber-50 text-amber-700',
            awarded: 'border-emerald-200 bg-emerald-50 text-emerald-700',
            lost: 'border-rose-200 bg-rose-50 text-rose-700',
            cancelled: 'border-stone-200 bg-stone-100 text-stone-700',
            expired: 'border-orange-200 bg-orange-50 text-orange-700',
        }[status] ?? 'border-slate-200 bg-slate-100 text-slate-700'
    );
}

export default function QuotationsIndex({
    quotations,
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
        const currentFrom = filters.from ?? '';
        const currentTo = filters.to ?? '';
        const currentPerPage = String(filters.per_page);

        if (
            normalizedSearch === filters.search &&
            tableFilters.status === filters.status &&
            tableFilters.from === currentFrom &&
            tableFilters.to === currentTo &&
            tableFilters.per_page === currentPerPage
        ) {
            return;
        }

        const timeout = window.setTimeout(() => {
            router.cancelAll();
            router.get(
                toUrl(quotationsIndex()),
                cleanQueryParams({
                    search: normalizedSearch,
                    status: tableFilters.status,
                    from: tableFilters.from || undefined,
                    to: tableFilters.to || undefined,
                    per_page: Number(tableFilters.per_page),
                    page: 1,
                }),
                {
                    only: ['quotations', 'filters'],
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
    const exportHref = quotationsIndex({
        query: cleanQueryParams({
            search: searchInput.trim(),
            status: tableFilters.status,
            from: tableFilters.from || undefined,
            to: tableFilters.to || undefined,
            export: 'csv',
        }),
    });

    return (
        <>
            <Head title="Quotations" />

            <div className="app-page flex flex-1 flex-col gap-6">
                <div className="space-y-1.5">
                    <h1 className="text-2xl font-semibold tracking-tight">
                        Quotations
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Track sales quotations and status movement.
                    </p>
                </div>

                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
                        <ClearableSearchInput
                            value={searchInput}
                            onChange={setSearchInput}
                            placeholder="Search quotations"
                        />

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
                            fromLabel="Quotation from"
                            toLabel="to"
                            placeholder="Quotation from - to"
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

                    {can.create ? (
                        <Button asChild className="lg:shrink-0">
                            <Link href={quotationsCreate()}>
                                <Plus />
                                New quotation
                            </Link>
                        </Button>
                    ) : null}
                </div>

                <CompactDataTable
                    footer={
                        <DataTablePaginationFooter
                            pagination={quotations}
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
                                <th>Quotation</th>
                                <th>Customer / site</th>
                                <th>Dates</th>
                                <th className="text-right">Amount</th>
                                <th>Status</th>
                                <th className="text-right">Attachments</th>
                                <th className="text-right">Actions</th>
                            </tr>
                        </thead>

                        <tbody>
                            {quotations.data.length === 0 && (
                                <tr>
                                    <td
                                        colSpan={7}
                                        className="py-10 text-center text-sm text-muted-foreground"
                                    >
                                        No quotations matched the current
                                        filters.
                                    </td>
                                </tr>
                            )}

                            {quotations.data.map((quotation) => (
                                <tr key={quotation.id}>
                                    <td>
                                        <div className="space-y-0.5">
                                            <p className="max-w-[18rem] truncate font-semibold text-foreground">
                                                {quotation.quotation_no}
                                            </p>
                                            <p className="max-w-[18rem] truncate text-[13px] text-muted-foreground">
                                                {quotation.subject}
                                            </p>
                                        </div>
                                    </td>

                                    <td>
                                        <div className="space-y-0.5">
                                            <p className="max-w-[18rem] truncate font-medium text-foreground">
                                                {quotation.customer
                                                    .company_name ??
                                                    'Unlinked customer'}
                                            </p>
                                            <p className="max-w-[18rem] truncate text-[13px] text-muted-foreground">
                                                {[
                                                    quotation.customer
                                                        .customer_code,
                                                    quotation.site.site_name,
                                                ]
                                                    .filter(Boolean)
                                                    .join(' • ') ||
                                                    'No site linked'}
                                            </p>
                                        </div>
                                    </td>

                                    <td className="text-[13px] text-muted-foreground">
                                        <div className="space-y-0.5 leading-5">
                                            <p className="max-w-[14rem] truncate">
                                                Quote:{' '}
                                                {formatDate(
                                                    quotation.quotation_date,
                                                )}
                                            </p>
                                            <p className="max-w-[14rem] truncate">
                                                Valid until:{' '}
                                                {formatDate(
                                                    quotation.valid_until,
                                                )}
                                            </p>
                                        </div>
                                    </td>

                                    <td className="text-right font-medium tabular-nums">
                                        {formatCurrency(
                                            quotation.quotation_amount,
                                        )}
                                    </td>

                                    <td>
                                        <Badge
                                            variant="outline"
                                            className={statusBadgeClass(
                                                quotation.status,
                                            )}
                                        >
                                            {quotation.status_label}
                                        </Badge>
                                    </td>

                                    <td className="text-right font-medium tabular-nums">
                                        {quotation.attachment_count}
                                    </td>

                                    <td className="text-right">
                                        <div className="flex justify-end">
                                            <DataTableRowActions
                                                resourceLabel="quotation"
                                                items={[
                                                    ...(quotation.can.view
                                                        ? [
                                                              {
                                                                  key: 'open',
                                                                  label: 'Open',
                                                                  icon: Eye,
                                                                  href: quotationsShow(
                                                                      quotation.id,
                                                                  ),
                                                              },
                                                          ]
                                                        : []),
                                                    ...(quotation.can.update
                                                        ? [
                                                              {
                                                                  key: 'edit',
                                                                  label: 'Edit',
                                                                  icon: Pencil,
                                                                  href: quotationsEdit(
                                                                      quotation.id,
                                                                  ),
                                                              },
                                                          ]
                                                        : []),
                                                    ...(quotation.can.delete
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
                                                                                  quotationsDestroy(
                                                                                      quotation.id,
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
                                                label={`Open actions for ${quotation.quotation_no}`}
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

QuotationsIndex.layout = {
    breadcrumbs: quotationBreadcrumbs,
};
