import { Head, Link, router } from '@inertiajs/react';
import {
    ChevronDown,
    Eye,
    FileSpreadsheet,
    Plus,
    Search,
    SlidersHorizontal,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { CompactDataTable } from '@/components/compact-data-table';
import { DataTablePaginationFooter } from '@/components/data-table-pagination-footer';
import { DataTableRowActions } from '@/components/data-table-row-actions';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { cleanQueryParams, toUrl } from '@/lib/utils';
import { dashboard } from '@/routes';
import { show as customersShow } from '@/routes/customers';
import { show as invoicesShow } from '@/routes/invoices';
import {
    create as taxReportRunsCreate,
    index as taxReportRunsIndex,
} from '@/routes/tax-report-runs';
import { index as vatRecordsIndex } from '@/routes/vat-records';
import type {
    PaginatedData,
    SelectOption,
    TaxSourceFilters,
    VatRecordListItem,
} from '@/types';

type Props = {
    vatRecords: PaginatedData<VatRecordListItem>;
    filters: TaxSourceFilters;
    typeOptions: SelectOption[];
    can: {
        generate_reports: boolean;
    };
};

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

function recordBadgeClass(type: string): string {
    return (
        {
            output_vat: 'border-sky-200 bg-sky-50 text-sky-700',
            input_vat: 'border-emerald-200 bg-emerald-50 text-emerald-700',
        }[type] ?? 'border-slate-200 bg-slate-100 text-slate-700'
    );
}

export default function VatRecordsIndex({
    vatRecords,
    filters,
    typeOptions,
    can,
}: Props) {
    const [searchInput, setSearchInput] = useState(filters.search);
    const [tableFilters, setTableFilters] = useState({
        type: filters.type,
        from: filters.from ?? '',
        to: filters.to ?? '',
        per_page: String(filters.per_page),
    });

    useEffect(() => {
        setTableFilters((currentFilters) => {
            const nextFilters = {
                type: filters.type,
                from: filters.from ?? '',
                to: filters.to ?? '',
                per_page: String(filters.per_page),
            };

            if (
                currentFilters.type === nextFilters.type &&
                currentFilters.from === nextFilters.from &&
                currentFilters.to === nextFilters.to &&
                currentFilters.per_page === nextFilters.per_page
            ) {
                return currentFilters;
            }

            return nextFilters;
        });
    }, [filters.from, filters.per_page, filters.to, filters.type]);

    useEffect(() => {
        const normalizedSearch = searchInput.trim();
        const currentPerPage = String(filters.per_page);

        if (
            normalizedSearch === filters.search &&
            tableFilters.type === filters.type &&
            tableFilters.from === (filters.from ?? '') &&
            tableFilters.to === (filters.to ?? '') &&
            tableFilters.per_page === currentPerPage
        ) {
            return;
        }

        const timeout = window.setTimeout(() => {
            router.cancelAll();
            router.get(
                toUrl(vatRecordsIndex()),
                cleanQueryParams({
                    search: normalizedSearch,
                    type: tableFilters.type,
                    from: tableFilters.from,
                    to: tableFilters.to,
                    per_page: Number(tableFilters.per_page),
                    page: 1,
                }),
                {
                    only: ['vatRecords', 'filters'],
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
        filters.type,
        searchInput,
        tableFilters,
    ]);

    const activeFilterCount =
        (tableFilters.type === '' ? 0 : 1) +
        (tableFilters.from === '' ? 0 : 1) +
        (tableFilters.to === '' ? 0 : 1);

    return (
        <>
            <Head title="VAT Records" />

            <div className="app-page flex flex-1 flex-col gap-6">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                    <div className="space-y-1.5">
                        <h1 className="text-2xl font-semibold tracking-tight">
                            VAT Records
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Invoice-derived VAT source records before summary
                            runs are generated.
                        </p>
                    </div>

                    {can.generate_reports && (
                        <Button asChild>
                            <Link href={taxReportRunsCreate()}>
                                <Plus />
                                New report run
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
                                placeholder="Search VAT records"
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
                                <DropdownMenuRadioGroup
                                    value={
                                        tableFilters.type === ''
                                            ? 'all'
                                            : tableFilters.type
                                    }
                                    onValueChange={(value) => {
                                        router.cancelAll();
                                        setTableFilters((currentFilters) => ({
                                            ...currentFilters,
                                            type: value === 'all' ? '' : value,
                                        }));
                                    }}
                                >
                                    <DropdownMenuRadioItem value="all">
                                        All types
                                    </DropdownMenuRadioItem>
                                    <DropdownMenuSeparator />
                                    {typeOptions.map((option) => (
                                        <DropdownMenuRadioItem
                                            key={option.value}
                                            value={String(option.value)}
                                        >
                                            {option.label}
                                        </DropdownMenuRadioItem>
                                    ))}
                                </DropdownMenuRadioGroup>

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
                            pagination={vatRecords}
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
                                <th>Date / type</th>
                                <th>Reference</th>
                                <th>Counterparty</th>
                                <th className="text-right">Amounts</th>
                                <th className="text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {vatRecords.data.length === 0 && (
                                <tr>
                                    <td
                                        colSpan={5}
                                        className="py-10 text-center text-muted-foreground"
                                    >
                                        No VAT records matched the current
                                        filters.
                                    </td>
                                </tr>
                            )}

                            {vatRecords.data.map((record) => (
                                <tr key={record.id}>
                                    <td>
                                        <div className="space-y-1">
                                            <p className="font-medium text-foreground">
                                                {formatDate(record.record_date)}
                                            </p>
                                            <Badge
                                                variant="outline"
                                                className={recordBadgeClass(
                                                    record.record_type,
                                                )}
                                            >
                                                {record.record_type_label}
                                            </Badge>
                                        </div>
                                    </td>

                                    <td>
                                        <div className="space-y-1">
                                            <p className="truncate font-medium text-foreground">
                                                {record.reference_no ??
                                                    'No reference'}
                                            </p>
                                            <p className="truncate text-[13px] text-muted-foreground">
                                                {record.source.invoice_no ??
                                                    'No invoice no.'}
                                            </p>
                                        </div>
                                    </td>

                                    <td>
                                        <div className="space-y-1">
                                            <p className="truncate font-medium text-foreground">
                                                {record.counterparty_name}
                                            </p>
                                            <p className="truncate text-[13px] text-muted-foreground">
                                                {record.counterparty_tin ??
                                                    'No TIN'}
                                            </p>
                                        </div>
                                    </td>

                                    <td className="text-right text-[13px]">
                                        <p className="font-medium text-foreground tabular-nums">
                                            {formatCurrency(
                                                record.gross_amount,
                                            )}
                                        </p>
                                        <p className="text-muted-foreground">
                                            VAT{' '}
                                            <span className="tabular-nums">
                                                {formatCurrency(
                                                    record.vat_amount,
                                                )}
                                            </span>
                                        </p>
                                    </td>

                                    <td className="text-right">
                                        <div className="flex justify-end">
                                            <DataTableRowActions
                                                items={[
                                                    ...(record.source
                                                        .customer_id
                                                        ? [
                                                              {
                                                                  key: 'customer',
                                                                  label: 'Open customer',
                                                                  icon: Eye,
                                                                  href: customersShow(
                                                                      record
                                                                          .source
                                                                          .customer_id,
                                                                  ),
                                                              },
                                                          ]
                                                        : []),
                                                    ...(record.source.invoice_id
                                                        ? [
                                                              {
                                                                  key: 'invoice',
                                                                  label: 'Open invoice',
                                                                  icon: FileSpreadsheet,
                                                                  href: invoicesShow(
                                                                      record
                                                                          .source
                                                                          .invoice_id,
                                                                  ),
                                                              },
                                                          ]
                                                        : []),
                                                ]}
                                                label={`Open actions for VAT record ${record.id}`}
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

VatRecordsIndex.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: dashboard() },
        { title: 'VAT Records', href: vatRecordsIndex() },
    ],
};
