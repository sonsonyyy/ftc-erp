import { Head, Link, router } from '@inertiajs/react';
import { Archive, Eye, Pencil, Plus, Search } from 'lucide-react';
import { useEffect, useState } from 'react';
import { CompactDataTable } from '@/components/compact-data-table';
import { DataTablePaginationFooter } from '@/components/data-table-pagination-footer';
import { DataTableRowActions } from '@/components/data-table-row-actions';
import { DateRangeFilter } from '@/components/date-range-filter';
import { FilterSelect } from '@/components/filter-select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cleanQueryParams, toUrl } from '@/lib/utils';
import { dashboard } from '@/routes';
import {
    create as payrollRunsCreate,
    destroy as payrollRunsDestroy,
    edit as payrollRunsEdit,
    index as payrollRunsIndex,
    show as payrollRunsShow,
} from '@/routes/payroll-runs';
import type { PaginatedData, PayrollRunListItem, SelectOption } from '@/types';

type Props = {
    payrollRuns: PaginatedData<PayrollRunListItem>;
    filters: {
        search: string;
        status: string;
        from: string | null;
        to: string | null;
        per_page: number;
    };
    statusOptions: SelectOption[];
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

function statusBadgeClass(status: string): string {
    return (
        {
            draft: 'border-slate-200 bg-slate-100 text-slate-700',
            processed: 'border-emerald-200 bg-emerald-50 text-emerald-700',
            cancelled: 'border-rose-200 bg-rose-50 text-rose-700',
        }[status] ?? 'border-slate-200 bg-slate-100 text-slate-700'
    );
}

export default function PayrollRunsIndex({
    payrollRuns,
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
                toUrl(payrollRunsIndex()),
                cleanQueryParams({
                    search: normalizedSearch,
                    status: tableFilters.status,
                    from: tableFilters.from,
                    to: tableFilters.to,
                    per_page: Number(tableFilters.per_page),
                    page: 1,
                }),
                {
                    only: ['payrollRuns', 'filters'],
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

    return (
        <>
            <Head title="Payroll Runs" />

            <div className="app-page flex flex-1 flex-col gap-6">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                    <div className="space-y-1.5">
                        <h1 className="text-2xl font-semibold tracking-tight">
                            Payroll Runs
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Payroll batches, coverage dates, and payout totals.
                        </p>
                    </div>

                    {can.create && (
                        <Button asChild>
                            <Link href={payrollRunsCreate()}>
                                <Plus />
                                New payroll run
                            </Link>
                        </Button>
                    )}
                </div>

                <div className="flex flex-col gap-3">
                    <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
                        <div className="relative w-full sm:max-w-sm">
                            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                value={searchInput}
                                onChange={(event) =>
                                    setSearchInput(event.currentTarget.value)
                                }
                                placeholder="Search payroll runs"
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
                            fromLabel="Payroll date from"
                            toLabel="Payroll date to"
                            placeholder="Payroll date from - Payroll date to"
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
                            pagination={payrollRuns}
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
                                <th>Run</th>
                                <th>Coverage</th>
                                <th className="text-right">Totals</th>
                                <th>Status</th>
                                <th>Prepared by</th>
                                <th className="text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {payrollRuns.data.length === 0 && (
                                <tr>
                                    <td
                                        colSpan={6}
                                        className="py-10 text-center text-muted-foreground"
                                    >
                                        No payroll runs matched the current
                                        filters.
                                    </td>
                                </tr>
                            )}

                            {payrollRuns.data.map((payrollRun) => (
                                <tr key={payrollRun.id}>
                                    <td>
                                        <div className="space-y-1">
                                            <p className="truncate font-medium text-foreground">
                                                {payrollRun.payroll_run_no}
                                            </p>
                                            <p className="truncate text-[13px] text-muted-foreground">
                                                Payroll date:{' '}
                                                {formatDate(
                                                    payrollRun.payroll_date,
                                                )}
                                            </p>
                                        </div>
                                    </td>

                                    <td>
                                        <div className="space-y-1 text-[13px]">
                                            <p className="truncate font-medium text-foreground">
                                                {formatDate(
                                                    payrollRun.period_from,
                                                )}
                                            </p>
                                            <p className="truncate text-muted-foreground">
                                                to{' '}
                                                {formatDate(
                                                    payrollRun.period_to,
                                                )}
                                            </p>
                                        </div>
                                    </td>

                                    <td className="text-right text-[13px]">
                                        <p className="font-medium text-foreground tabular-nums">
                                            {formatCurrency(
                                                payrollRun.gross_total,
                                            )}
                                        </p>
                                        <p className="text-muted-foreground">
                                            Net{' '}
                                            <span className="tabular-nums">
                                                {formatCurrency(
                                                    payrollRun.net_total,
                                                )}
                                            </span>
                                        </p>
                                    </td>

                                    <td>
                                        <div className="space-y-1">
                                            <Badge
                                                variant="outline"
                                                className={statusBadgeClass(
                                                    payrollRun.status,
                                                )}
                                            >
                                                {payrollRun.status_label}
                                            </Badge>
                                            <p className="text-[13px] text-muted-foreground">
                                                <span className="tabular-nums">
                                                    {payrollRun.entry_count}
                                                </span>{' '}
                                                employees
                                            </p>
                                        </div>
                                    </td>

                                    <td className="text-[13px] text-muted-foreground">
                                        {payrollRun.prepared_by ??
                                            'Not recorded'}
                                    </td>

                                    <td className="text-right">
                                        <div className="flex justify-end">
                                            <DataTableRowActions
                                                items={[
                                                    ...(payrollRun.can.view
                                                        ? [
                                                              {
                                                                  key: 'open',
                                                                  label: 'Open',
                                                                  icon: Eye,
                                                                  href: payrollRunsShow(
                                                                      payrollRun.id,
                                                                  ),
                                                              },
                                                          ]
                                                        : []),
                                                    ...(payrollRun.can.update
                                                        ? [
                                                              {
                                                                  key: 'edit',
                                                                  label: 'Edit',
                                                                  icon: Pencil,
                                                                  href: payrollRunsEdit(
                                                                      payrollRun.id,
                                                                  ),
                                                              },
                                                          ]
                                                        : []),
                                                    ...(payrollRun.can.delete
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
                                                                                  payrollRunsDestroy(
                                                                                      payrollRun.id,
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
                                                label={`Open actions for ${payrollRun.payroll_run_no}`}
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

PayrollRunsIndex.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: dashboard() },
        { title: 'Payroll Runs', href: payrollRunsIndex() },
    ],
};
