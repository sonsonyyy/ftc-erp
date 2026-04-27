import { Head, Link, router } from '@inertiajs/react';
import {
    Archive,
    ChevronDown,
    Eye,
    PencilRuler,
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
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { cleanQueryParams, toUrl } from '@/lib/utils';
import { dashboard } from '@/routes';
import {
    create as taxReportRunsCreate,
    destroy as taxReportRunsDestroy,
    index as taxReportRunsIndex,
    show as taxReportRunsShow,
} from '@/routes/tax-report-runs';
import type {
    PaginatedData,
    SelectOption,
    TaxReportRunFilters,
    TaxReportRunListItem,
} from '@/types';

type Props = {
    taxReportRuns: PaginatedData<TaxReportRunListItem>;
    filters: TaxReportRunFilters;
    reportTypeOptions: SelectOption[];
    can: {
        create: boolean;
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

function formatDateTime(date: string | null): string {
    if (!date) {
        return 'Not generated';
    }

    return new Intl.DateTimeFormat('en-PH', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
    }).format(new Date(date));
}

export default function TaxReportRunsIndex({
    taxReportRuns,
    filters,
    reportTypeOptions,
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
                toUrl(taxReportRunsIndex()),
                cleanQueryParams({
                    search: normalizedSearch,
                    type: tableFilters.type,
                    from: tableFilters.from,
                    to: tableFilters.to,
                    per_page: Number(tableFilters.per_page),
                    page: 1,
                }),
                {
                    only: ['taxReportRuns', 'filters'],
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
            <Head title="Tax Report Runs" />

            <div className="app-page flex flex-1 flex-col gap-6">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                    <div className="space-y-1.5">
                        <h1 className="text-2xl font-semibold tracking-tight">
                            Tax Report Runs
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Saved statutory snapshots from VAT and withholding
                            source records.
                        </p>
                    </div>

                    {can.create && (
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
                                placeholder="Search report runs"
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
                                        All report types
                                    </DropdownMenuRadioItem>
                                    <DropdownMenuSeparator />
                                    {reportTypeOptions.map((option) => (
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
                                            Covered from
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
                                            Covered to
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
                            pagination={taxReportRuns}
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
                                <th>Report</th>
                                <th>Covered period</th>
                                <th className="text-right">Totals</th>
                                <th>Generated</th>
                                <th className="text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {taxReportRuns.data.length === 0 && (
                                <tr>
                                    <td
                                        colSpan={5}
                                        className="py-10 text-center text-muted-foreground"
                                    >
                                        No tax report runs matched the current
                                        filters.
                                    </td>
                                </tr>
                            )}

                            {taxReportRuns.data.map((taxReportRun) => (
                                <tr key={taxReportRun.id}>
                                    <td>
                                        <div className="space-y-1">
                                            <p className="truncate font-medium text-foreground">
                                                {taxReportRun.report_no}
                                            </p>
                                            <p className="truncate text-[13px] text-muted-foreground">
                                                {taxReportRun.report_type_label}
                                            </p>
                                        </div>
                                    </td>

                                    <td>
                                        <div className="space-y-1 text-[13px]">
                                            <p className="font-medium text-foreground">
                                                {formatDate(
                                                    taxReportRun.period_from,
                                                )}
                                            </p>
                                            <p className="text-muted-foreground">
                                                to{' '}
                                                {formatDate(
                                                    taxReportRun.period_to,
                                                )}
                                            </p>
                                        </div>
                                    </td>

                                    <td className="text-right text-[13px]">
                                        <p className="font-medium text-foreground tabular-nums">
                                            {formatCurrency(
                                                taxReportRun.amount_total,
                                            )}
                                        </p>
                                        <p className="text-muted-foreground">
                                            <span className="tabular-nums">
                                                {taxReportRun.item_count}
                                            </span>{' '}
                                            items
                                        </p>
                                    </td>

                                    <td>
                                        <div className="space-y-1 text-[13px]">
                                            <p className="font-medium text-foreground">
                                                {formatDateTime(
                                                    taxReportRun.generated_at,
                                                )}
                                            </p>
                                            <p className="text-muted-foreground">
                                                {taxReportRun.generated_by ??
                                                    'Unknown user'}
                                            </p>
                                        </div>
                                    </td>

                                    <td className="text-right">
                                        <div className="flex justify-end">
                                            <DataTableRowActions
                                                items={[
                                                    ...(taxReportRun.can.view
                                                        ? [
                                                              {
                                                                  key: 'open',
                                                                  label: 'Open',
                                                                  icon: Eye,
                                                                  href: taxReportRunsShow(
                                                                      taxReportRun.id,
                                                                  ),
                                                              },
                                                          ]
                                                        : []),
                                                    ...(taxReportRun.can.delete
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
                                                                                  taxReportRunsDestroy(
                                                                                      taxReportRun.id,
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
                                                label={`Open actions for ${taxReportRun.report_no}`}
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

TaxReportRunsIndex.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: dashboard() },
        { title: 'Tax Report Runs', href: taxReportRunsIndex() },
    ],
};
