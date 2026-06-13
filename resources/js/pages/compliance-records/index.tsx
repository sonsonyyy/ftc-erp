import { Head, Link, router } from '@inertiajs/react';
import {
    Archive,
    BellRing,
    ChevronDown,
    Clock3,
    Download,
    Ellipsis,
    Eye,
    Pencil,
    Plus,
    RefreshCw,
    ShieldAlert,
    TriangleAlert,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { ClearableSearchInput } from '@/components/clearable-search-input';
import { CompactDataTable } from '@/components/compact-data-table';
import { DataTablePaginationFooter } from '@/components/data-table-pagination-footer';
import { DataTableRowActions } from '@/components/data-table-row-actions';
import { FilterSelect } from '@/components/filter-select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardTitle,
} from '@/components/ui/card';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cleanQueryParams, toUrl } from '@/lib/utils';
import { dashboard } from '@/routes';
import {
    create as complianceRecordsCreate,
    destroy as complianceRecordsDestroy,
    edit as complianceRecordsEdit,
    index as complianceRecordsIndex,
    show as complianceRecordsShow,
} from '@/routes/compliance-records';
import type {
    ComplianceRecordFilters,
    ComplianceRecordListItem,
    ComplianceSummary,
    PaginatedData,
    SelectOption,
} from '@/types';

type Props = {
    complianceRecords: PaginatedData<ComplianceRecordListItem>;
    filters: ComplianceRecordFilters;
    summary: ComplianceSummary;
    statusOptions: SelectOption[];
    can: {
        create: boolean;
        view_alerts: boolean;
    };
};

const perPageOptions = ['5', '10', '15', '25'];

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

function formatDeadlineType(type: string | null): string {
    if (!type) {
        return 'No deadline';
    }

    return type
        .replace(/_/g, ' ')
        .replace(/\b\w/g, (character) => character.toUpperCase());
}

function statusBadgeClass(status: string): string {
    return (
        {
            draft: 'border-slate-200 bg-slate-100 text-slate-700',
            active: 'border-sky-200 bg-sky-50 text-sky-700',
            due_soon: 'border-amber-200 bg-amber-50 text-amber-700',
            for_renewal: 'border-violet-200 bg-violet-50 text-violet-700',
            for_filing: 'border-cyan-200 bg-cyan-50 text-cyan-700',
            in_progress: 'border-indigo-200 bg-indigo-50 text-indigo-700',
            submitted: 'border-emerald-200 bg-emerald-50 text-emerald-700',
            renewed: 'border-emerald-200 bg-emerald-50 text-emerald-700',
            expired: 'border-rose-200 bg-rose-50 text-rose-700',
            overdue: 'border-rose-200 bg-rose-50 text-rose-700',
            archived: 'border-stone-200 bg-stone-100 text-stone-700',
        }[status] ?? 'border-slate-200 bg-slate-100 text-slate-700'
    );
}

export default function ComplianceRecordsIndex({
    complianceRecords,
    filters,
    summary,
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
                toUrl(complianceRecordsIndex()),
                cleanQueryParams({
                    search: normalizedSearch,
                    status: tableFilters.status,
                    per_page: Number(tableFilters.per_page),
                    page: 1,
                }),
                {
                    only: ['complianceRecords', 'filters', 'summary'],
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

    const exportHref = complianceRecordsIndex({
        query: cleanQueryParams({
            search: searchInput.trim(),
            status: tableFilters.status,
            export: 'csv',
        }),
    });

    const summaryCards = [
        {
            title: 'Due soon',
            value: summary.due_soon_count,
            icon: Clock3,
            iconClassName: 'bg-amber-50 text-amber-700',
        },
        {
            title: 'For renewal',
            value: summary.for_renewal_count,
            icon: RefreshCw,
            iconClassName: 'bg-violet-50 text-violet-700',
        },
        {
            title: 'Overdue',
            value: summary.overdue_count,
            icon: TriangleAlert,
            iconClassName: 'bg-rose-50 text-rose-700',
        },
        {
            title: 'Expired',
            value: summary.expired_count,
            icon: ShieldAlert,
            iconClassName: 'bg-rose-50 text-rose-700',
        },
        {
            title: 'Open alerts',
            value: summary.open_alert_count ?? 'Restricted',
            icon: BellRing,
            iconClassName: 'bg-sky-50 text-sky-700',
        },
    ];

    return (
        <>
            <Head title="Compliance" />

            <div className="app-page flex flex-1 flex-col gap-6">
                <div className="space-y-1.5">
                    <h1 className="text-2xl font-semibold tracking-tight">
                        Compliance
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Permits, licenses, renewals, and recurring filings in
                        one registry.
                    </p>
                </div>

                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
                    {summaryCards.map((card) => {
                        const Icon = card.icon;

                        return (
                            <Card
                                key={card.title}
                                className="border-border/70 py-4 shadow-sm"
                            >
                                <CardContent className="flex items-center gap-3">
                                    <div
                                        className={`flex size-11 shrink-0 items-center justify-center rounded-xl ${card.iconClassName}`}
                                    >
                                        <Icon className="size-5" />
                                    </div>

                                    <div className="space-y-1">
                                        <CardDescription>
                                            {card.title}
                                        </CardDescription>
                                        <CardTitle className="text-2xl tracking-tight">
                                            {card.value}
                                        </CardTitle>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>

                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
                        <ClearableSearchInput
                            value={searchInput}
                            onChange={setSearchInput}
                            placeholder="Search compliance records"
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
                    </div>

                    {can.create ? (
                        <Button asChild className="lg:shrink-0">
                            <Link href={complianceRecordsCreate()}>
                                <Plus />
                                New record
                            </Link>
                        </Button>
                    ) : null}
                </div>

                <CompactDataTable
                    footer={
                        <DataTablePaginationFooter
                            pagination={complianceRecords}
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
                                <th>Record</th>
                                <th>Agency / category</th>
                                <th>Next deadline</th>
                                <th>Owner</th>
                                <th className="text-right">Signals</th>
                                <th className="text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {complianceRecords.data.length === 0 && (
                                <tr>
                                    <td
                                        colSpan={6}
                                        className="py-10 text-center text-muted-foreground"
                                    >
                                        No compliance records matched the
                                        current filters.
                                    </td>
                                </tr>
                            )}

                            {complianceRecords.data.map((record) => (
                                <tr key={record.id}>
                                    <td>
                                        <div className="space-y-1">
                                            <p className="truncate font-medium text-foreground">
                                                {record.record_no}
                                            </p>
                                            <p className="truncate text-[13px] text-muted-foreground">
                                                {record.title}
                                            </p>
                                            <Badge
                                                variant="outline"
                                                className={statusBadgeClass(
                                                    record.status,
                                                )}
                                            >
                                                {record.status_label}
                                            </Badge>
                                        </div>
                                    </td>

                                    <td>
                                        <div className="space-y-1">
                                            <p className="truncate text-[13px] font-medium text-foreground">
                                                {record.agency}
                                            </p>
                                            <p className="truncate text-[13px] text-muted-foreground">
                                                {record.category ??
                                                    'No category'}
                                            </p>
                                        </div>
                                    </td>

                                    <td>
                                        <div className="space-y-1 text-[13px]">
                                            <p className="truncate font-medium text-foreground">
                                                {record.next_deadline_type
                                                    ? `${formatDeadlineType(record.next_deadline_type)} • ${formatDate(record.next_deadline_date)}`
                                                    : 'No deadline'}
                                            </p>
                                            <p className="truncate text-muted-foreground">
                                                Due{' '}
                                                {formatDate(record.due_date)}
                                            </p>
                                        </div>
                                    </td>

                                    <td className="text-[13px] text-muted-foreground">
                                        {record.assigned_user ?? 'Unassigned'}
                                    </td>

                                    <td className="text-right text-[13px]">
                                        <p className="font-medium text-foreground tabular-nums">
                                            {record.submission_count}
                                        </p>
                                        <p className="text-muted-foreground">
                                            {record.open_alert_count} alerts
                                        </p>
                                    </td>

                                    <td className="text-right">
                                        <div className="flex justify-end">
                                            <DataTableRowActions
                                                resourceLabel="compliance record"
                                                items={[
                                                    ...(record.can.view
                                                        ? [
                                                              {
                                                                  key: 'open',
                                                                  label: 'Open',
                                                                  icon: Eye,
                                                                  href: complianceRecordsShow(
                                                                      record.id,
                                                                  ),
                                                              },
                                                          ]
                                                        : []),
                                                    ...(record.can.update
                                                        ? [
                                                              {
                                                                  key: 'edit',
                                                                  label: 'Edit',
                                                                  icon: Pencil,
                                                                  href: complianceRecordsEdit(
                                                                      record.id,
                                                                  ),
                                                              },
                                                          ]
                                                        : []),
                                                    ...(record.can.delete
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
                                                                                  complianceRecordsDestroy(
                                                                                      record.id,
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
                                                label={`Open actions for ${record.record_no}`}
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

ComplianceRecordsIndex.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: dashboard() },
        { title: 'Compliance', href: complianceRecordsIndex() },
    ],
};
