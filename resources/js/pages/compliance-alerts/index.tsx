import { Head, router } from '@inertiajs/react';
import { BellRing, Eye } from 'lucide-react';
import { useEffect, useState } from 'react';
import { ClearableSearchInput } from '@/components/clearable-search-input';
import { CompactDataTable } from '@/components/compact-data-table';
import { DataTablePaginationFooter } from '@/components/data-table-pagination-footer';
import { DataTableRowActions } from '@/components/data-table-row-actions';
import { FilterSelect } from '@/components/filter-select';
import { Badge } from '@/components/ui/badge';
import { cleanQueryParams, toUrl } from '@/lib/utils';
import { dashboard } from '@/routes';
import {
    acknowledge as complianceAlertsAcknowledge,
    index as complianceAlertsIndex,
} from '@/routes/compliance-alerts';
import {
    index as complianceRecordsIndex,
    show as complianceRecordsShow,
} from '@/routes/compliance-records';
import type {
    ComplianceAlertFilters,
    ComplianceAlertListItem,
    PaginatedData,
    SelectOption,
} from '@/types';

type Props = {
    alerts: PaginatedData<ComplianceAlertListItem>;
    filters: ComplianceAlertFilters;
    typeOptions: SelectOption[];
    acknowledgementOptions: SelectOption[];
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

function alertBadgeClass(type: string): string {
    return (
        {
            due_reminder: 'border-amber-200 bg-amber-50 text-amber-700',
            expiry_reminder: 'border-violet-200 bg-violet-50 text-violet-700',
            due_overdue: 'border-rose-200 bg-rose-50 text-rose-700',
            expiry_expired: 'border-rose-200 bg-rose-50 text-rose-700',
        }[type] ?? 'border-slate-200 bg-slate-100 text-slate-700'
    );
}

export default function ComplianceAlertsIndex({
    alerts,
    filters,
    typeOptions,
    acknowledgementOptions,
}: Props) {
    const [searchInput, setSearchInput] = useState(filters.search);
    const [tableFilters, setTableFilters] = useState({
        type: filters.type,
        acknowledged: filters.acknowledged,
        per_page: String(filters.per_page),
    });

    useEffect(() => {
        const syncFilters = window.setTimeout(() => {
            setTableFilters((currentFilters) => {
                const nextFilters = {
                    type: filters.type,
                    acknowledged: filters.acknowledged,
                    per_page: String(filters.per_page),
                };

                if (
                    currentFilters.type === nextFilters.type &&
                    currentFilters.acknowledged === nextFilters.acknowledged &&
                    currentFilters.per_page === nextFilters.per_page
                ) {
                    return currentFilters;
                }

                return nextFilters;
            });
        }, 0);

        return () => window.clearTimeout(syncFilters);
    }, [filters.acknowledged, filters.per_page, filters.type]);

    useEffect(() => {
        const normalizedSearch = searchInput.trim();
        const currentPerPage = String(filters.per_page);

        if (
            normalizedSearch === filters.search &&
            tableFilters.type === filters.type &&
            tableFilters.acknowledged === filters.acknowledged &&
            tableFilters.per_page === currentPerPage
        ) {
            return;
        }

        const timeout = window.setTimeout(() => {
            router.cancelAll();
            router.get(
                toUrl(complianceAlertsIndex()),
                cleanQueryParams({
                    search: normalizedSearch,
                    type: tableFilters.type,
                    acknowledged: tableFilters.acknowledged,
                    per_page: Number(tableFilters.per_page),
                    page: 1,
                }),
                {
                    only: ['alerts', 'filters'],
                    replace: true,
                    preserveState: true,
                    preserveScroll: true,
                },
            );
        }, 300);

        return () => window.clearTimeout(timeout);
    }, [
        filters.acknowledged,
        filters.per_page,
        filters.search,
        filters.type,
        searchInput,
        tableFilters,
    ]);

    return (
        <>
            <Head title="Compliance Alerts" />

            <div className="app-page flex flex-1 flex-col gap-6">
                <div className="space-y-1.5">
                    <h1 className="text-2xl font-semibold tracking-tight">
                        Compliance Alerts
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Generated reminders, overdue notices, and expiry
                        warnings.
                    </p>
                </div>

                <div className="flex flex-col gap-3">
                    <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
                        <ClearableSearchInput
                            value={searchInput}
                            onChange={setSearchInput}
                            placeholder="Search alerts"
                        />

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
                            <option value="">All alert types</option>
                            {typeOptions.map((option) => (
                                <option
                                    key={option.value}
                                    value={String(option.value)}
                                >
                                    {option.label}
                                </option>
                            ))}
                        </FilterSelect>

                        <FilterSelect
                            value={tableFilters.acknowledged}
                            onChange={(event) => {
                                router.cancelAll();
                                setTableFilters((currentFilters) => ({
                                    ...currentFilters,
                                    acknowledged: event.currentTarget.value,
                                }));
                            }}
                            className="w-full sm:w-[180px]"
                        >
                            <option value="">All states</option>
                            {acknowledgementOptions.map((option) => (
                                <option
                                    key={option.value}
                                    value={String(option.value)}
                                >
                                    {option.label}
                                </option>
                            ))}
                        </FilterSelect>
                    </div>
                </div>

                <CompactDataTable
                    footer={
                        <DataTablePaginationFooter
                            pagination={alerts}
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
                                <th>Alert</th>
                                <th>Record</th>
                                <th>Schedule</th>
                                <th>Status</th>
                                <th className="text-right">Actions</th>
                            </tr>
                        </thead>

                        <tbody>
                            {alerts.data.length === 0 && (
                                <tr>
                                    <td
                                        colSpan={5}
                                        className="py-10 text-center text-muted-foreground"
                                    >
                                        No alerts matched the current filters.
                                    </td>
                                </tr>
                            )}

                            {alerts.data.map((alert) => (
                                <tr key={alert.id}>
                                    <td>
                                        <div className="space-y-1">
                                            <Badge
                                                variant="outline"
                                                className={alertBadgeClass(
                                                    alert.alert_type,
                                                )}
                                            >
                                                {alert.alert_type_label}
                                            </Badge>
                                            <p className="line-clamp-2 text-[13px] text-muted-foreground">
                                                {alert.message}
                                            </p>
                                        </div>
                                    </td>

                                    <td>
                                        {alert.record ? (
                                            <div className="space-y-1">
                                                <p className="truncate font-medium text-foreground">
                                                    {alert.record.record_no}
                                                </p>
                                                <p className="truncate text-[13px] text-muted-foreground">
                                                    {alert.record.title}
                                                </p>
                                            </div>
                                        ) : (
                                            <p className="text-[13px] text-muted-foreground">
                                                Record unavailable
                                            </p>
                                        )}
                                    </td>

                                    <td>
                                        <div className="space-y-1 text-[13px]">
                                            <p className="font-medium text-foreground">
                                                {formatDate(
                                                    alert.scheduled_for,
                                                )}
                                            </p>
                                            <p className="text-muted-foreground">
                                                {alert.days_before > 0
                                                    ? `${alert.days_before} days before`
                                                    : 'Overdue / expired'}
                                            </p>
                                        </div>
                                    </td>

                                    <td className="text-[13px] text-muted-foreground">
                                        {alert.acknowledged_at ? (
                                            <div className="space-y-1">
                                                <p className="font-medium text-foreground">
                                                    Acknowledged
                                                </p>
                                                <p>
                                                    {alert.acknowledged_by ??
                                                        'Unknown'}
                                                </p>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-2">
                                                <BellRing className="size-4 text-amber-600" />
                                                Pending
                                            </div>
                                        )}
                                    </td>

                                    <td className="text-right">
                                        <div className="flex justify-end">
                                            <DataTableRowActions
                                                items={[
                                                    ...(alert.record
                                                        ? [
                                                              {
                                                                  key: 'open',
                                                                  label: 'Open record',
                                                                  icon: Eye,
                                                                  href: complianceRecordsShow(
                                                                      alert
                                                                          .record
                                                                          .id,
                                                                  ),
                                                              },
                                                          ]
                                                        : []),
                                                    ...(alert.can.acknowledge
                                                        ? [
                                                              {
                                                                  key: 'acknowledge',
                                                                  label: 'Acknowledge',
                                                                  icon: BellRing,
                                                                  onSelect:
                                                                      () =>
                                                                          router.patch(
                                                                              toUrl(
                                                                                  complianceAlertsAcknowledge(
                                                                                      alert.id,
                                                                                  ),
                                                                              ),
                                                                              {},
                                                                              {
                                                                                  preserveScroll: true,
                                                                              },
                                                                          ),
                                                              },
                                                          ]
                                                        : []),
                                                ]}
                                                label={`Open actions for alert ${alert.id}`}
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

ComplianceAlertsIndex.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: dashboard() },
        { title: 'Compliance', href: complianceRecordsIndex() },
        { title: 'Alerts', href: complianceAlertsIndex() },
    ],
};
