import { Head, Link, router } from '@inertiajs/react';
import { Eye, FileSpreadsheet, Plus, Search } from 'lucide-react';
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
import { show as employeesShow } from '@/routes/employees';
import { show as payrollRunsShow } from '@/routes/payroll-runs';
import {
    create as taxReportRunsCreate,
    index as taxReportRunsIndex,
} from '@/routes/tax-report-runs';
import { index as withholdingRecordsIndex } from '@/routes/withholding-records';
import type {
    PaginatedData,
    SelectOption,
    TaxSourceFilters,
    WithholdingRecordListItem,
} from '@/types';

type Props = {
    withholdingRecords: PaginatedData<WithholdingRecordListItem>;
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
            compensation_withholding: 'border-sky-200 bg-sky-50 text-sky-700',
            expanded_withholding:
                'border-indigo-200 bg-indigo-50 text-indigo-700',
            sss_contribution:
                'border-emerald-200 bg-emerald-50 text-emerald-700',
            pagibig_contribution: 'border-amber-200 bg-amber-50 text-amber-700',
            philhealth_contribution: 'border-rose-200 bg-rose-50 text-rose-700',
        }[type] ?? 'border-slate-200 bg-slate-100 text-slate-700'
    );
}

export default function WithholdingRecordsIndex({
    withholdingRecords,
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
                toUrl(withholdingRecordsIndex()),
                cleanQueryParams({
                    search: normalizedSearch,
                    type: tableFilters.type,
                    from: tableFilters.from,
                    to: tableFilters.to,
                    per_page: Number(tableFilters.per_page),
                    page: 1,
                }),
                {
                    only: ['withholdingRecords', 'filters'],
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

    return (
        <>
            <Head title="Withholding Records" />

            <div className="app-page flex flex-1 flex-col gap-6">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                    <div className="space-y-1.5">
                        <h1 className="text-2xl font-semibold tracking-tight">
                            Withholding Records
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Compensation withholding and payroll-linked
                            contribution source records.
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
                    <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
                        <div className="relative w-full sm:max-w-sm">
                            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                value={searchInput}
                                onChange={(event) =>
                                    setSearchInput(event.currentTarget.value)
                                }
                                placeholder="Search records"
                                className="h-9 pl-9"
                            />
                        </div>

                        <FilterSelect
                            value={tableFilters.type}
                            onChange={(event) => {
                                router.cancelAll();
                                setTableFilters((currentFilters) => ({
                                    ...currentFilters,
                                    type: event.currentTarget.value,
                                }));
                            }}
                            className="w-full sm:w-[220px]"
                        >
                            <option value="">All types</option>
                            {typeOptions.map((option) => (
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
                            fromLabel="Record from"
                            toLabel="to"
                            placeholder="Record from - to"
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
                            pagination={withholdingRecords}
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
                                <th>Subject</th>
                                <th>Reference</th>
                                <th className="text-right">Amounts</th>
                                <th className="text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {withholdingRecords.data.length === 0 && (
                                <tr>
                                    <td
                                        colSpan={5}
                                        className="py-10 text-center text-muted-foreground"
                                    >
                                        No withholding records matched the
                                        current filters.
                                    </td>
                                </tr>
                            )}

                            {withholdingRecords.data.map((record) => (
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
                                                {record.subject_name}
                                            </p>
                                            <p className="truncate text-[13px] text-muted-foreground">
                                                {record.subject_identifier ??
                                                    'No employee no.'}
                                            </p>
                                        </div>
                                    </td>

                                    <td>
                                        <div className="space-y-1">
                                            <p className="truncate font-medium text-foreground">
                                                {record.reference_no ??
                                                    'No reference'}
                                            </p>
                                            <p className="truncate text-[13px] text-muted-foreground">
                                                {record.subject_tin ?? 'No TIN'}
                                            </p>
                                        </div>
                                    </td>

                                    <td className="text-right text-[13px]">
                                        <p className="font-medium text-foreground tabular-nums">
                                            {formatCurrency(record.amount)}
                                        </p>
                                        <p className="text-muted-foreground">
                                            Base{' '}
                                            <span className="tabular-nums">
                                                {formatCurrency(
                                                    record.base_amount,
                                                )}
                                            </span>
                                        </p>
                                    </td>

                                    <td className="text-right">
                                        <div className="flex justify-end">
                                            <DataTableRowActions
                                                items={[
                                                    ...(record.source
                                                        .employee_id
                                                        ? [
                                                              {
                                                                  key: 'employee',
                                                                  label: 'Open employee',
                                                                  icon: Eye,
                                                                  href: employeesShow(
                                                                      record
                                                                          .source
                                                                          .employee_id,
                                                                  ),
                                                              },
                                                          ]
                                                        : []),
                                                    ...(record.source
                                                        .payroll_run_id
                                                        ? [
                                                              {
                                                                  key: 'payroll-run',
                                                                  label: 'Open payroll run',
                                                                  icon: FileSpreadsheet,
                                                                  href: payrollRunsShow(
                                                                      record
                                                                          .source
                                                                          .payroll_run_id,
                                                                  ),
                                                              },
                                                          ]
                                                        : []),
                                                ]}
                                                label={`Open actions for withholding record ${record.id}`}
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

WithholdingRecordsIndex.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: dashboard() },
        { title: 'Withholding Records', href: withholdingRecordsIndex() },
    ],
};
