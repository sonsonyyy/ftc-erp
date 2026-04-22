import { Head, Link } from '@inertiajs/react';
import ComplianceAlertController from '@/actions/App/Http/Controllers/Compliance/ComplianceAlertController';
import { dashboard } from '@/routes';
import {
    calendar as complianceRecordsCalendar,
    index as complianceRecordsIndex,
    show as complianceRecordsShow,
} from '@/routes/compliance-records';
import { index as complianceAlertsIndex } from '@/routes/compliance-alerts';
import { DataTableCard } from '@/components/data-table-card';
import { FilterSelect } from '@/components/filter-select';
import { IndexFiltersCard } from '@/components/index-filters-card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
    agencyOptions: SelectOption[];
};

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
    agencyOptions,
}: Props) {
    return (
        <>
            <Head title="Compliance Alerts" />

            <div className="flex flex-1 flex-col gap-6 p-4">
                <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                    <div className="space-y-1">
                        <h1 className="text-2xl font-semibold tracking-tight">
                            Compliance alerts
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Review generated reminders, overdue notices, and
                            expiry warnings from the scheduler.
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        <Button variant="outline" asChild>
                            <Link href={complianceRecordsCalendar()}>
                                Calendar
                            </Link>
                        </Button>

                        <Button variant="outline" asChild>
                            <Link href={complianceRecordsIndex()}>
                                Registry
                            </Link>
                        </Button>
                    </div>
                </div>

                <IndexFiltersCard
                    action={complianceAlertsIndex()}
                    resetHref={complianceAlertsIndex()}
                    filters={filters}
                    description="Search by message or record, then narrow by alert type, acknowledgement, and agency."
                >
                    <Input
                        name="search"
                        defaultValue={filters.search}
                        placeholder="Search alerts"
                    />

                    <FilterSelect name="type" defaultValue={filters.type}>
                        <option value="">All alert types</option>
                        {typeOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </FilterSelect>

                    <FilterSelect
                        name="acknowledged"
                        defaultValue={filters.acknowledged}
                    >
                        <option value="">All states</option>
                        {acknowledgementOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </FilterSelect>

                    <FilterSelect name="agency" defaultValue={filters.agency}>
                        <option value="">All agencies</option>
                        {agencyOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </FilterSelect>
                </IndexFiltersCard>

                <DataTableCard
                    title="Alert queue"
                    description={`${alerts.total} alert records`}
                    pagination={alerts}
                >
                    <table className="min-w-full text-sm">
                        <thead>
                            <tr className="border-b text-left text-muted-foreground">
                                <th className="px-6 py-3 font-medium">Alert</th>
                                <th className="px-6 py-3 font-medium">
                                    Record
                                </th>
                                <th className="px-6 py-3 font-medium">
                                    Schedule
                                </th>
                                <th className="px-6 py-3 font-medium">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-right font-medium">
                                    Actions
                                </th>
                            </tr>
                        </thead>

                        <tbody>
                            {alerts.data.length === 0 && (
                                <tr>
                                    <td
                                        colSpan={5}
                                        className="px-6 py-10 text-center text-muted-foreground"
                                    >
                                        No alerts matched the current filters.
                                    </td>
                                </tr>
                            )}

                            {alerts.data.map((alert) => (
                                <tr
                                    key={alert.id}
                                    className="border-b align-top last:border-0"
                                >
                                    <td className="px-6 py-4">
                                        <div className="space-y-2">
                                            <Badge
                                                variant="outline"
                                                className={alertBadgeClass(
                                                    alert.alert_type,
                                                )}
                                            >
                                                {alert.alert_type_label}
                                            </Badge>
                                            <p className="text-muted-foreground">
                                                {alert.message}
                                            </p>
                                        </div>
                                    </td>

                                    <td className="px-6 py-4 text-muted-foreground">
                                        {alert.record ? (
                                            <div className="space-y-1">
                                                <p className="font-medium text-foreground">
                                                    {alert.record.record_no}
                                                </p>
                                                <p>{alert.record.title}</p>
                                                <p className="text-xs">
                                                    {alert.record.agency}
                                                </p>
                                            </div>
                                        ) : (
                                            'Record unavailable'
                                        )}
                                    </td>

                                    <td className="px-6 py-4 text-muted-foreground">
                                        <div className="space-y-1">
                                            <p>
                                                {formatDate(
                                                    alert.scheduled_for,
                                                )}
                                            </p>
                                            <p className="text-xs">
                                                {alert.deadline_type} •
                                                reference{' '}
                                                {formatDate(
                                                    alert.reference_date,
                                                )}
                                            </p>
                                            <p className="text-xs">
                                                {alert.days_before > 0
                                                    ? `${alert.days_before} days before`
                                                    : 'Overdue/expired signal'}
                                            </p>
                                        </div>
                                    </td>

                                    <td className="px-6 py-4 text-muted-foreground">
                                        {alert.acknowledged_at ? (
                                            <div className="space-y-1">
                                                <p>Acknowledged</p>
                                                <p className="text-xs">
                                                    {alert.acknowledged_by ??
                                                        'Unknown'}{' '}
                                                    •{' '}
                                                    {formatDate(
                                                        alert.acknowledged_at,
                                                    )}
                                                </p>
                                            </div>
                                        ) : (
                                            'Pending'
                                        )}
                                    </td>

                                    <td className="px-6 py-4">
                                        <div className="flex justify-end gap-2">
                                            {alert.record && (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    asChild
                                                >
                                                    <Link
                                                        href={complianceRecordsShow(
                                                            alert.record.id,
                                                        )}
                                                    >
                                                        Open
                                                    </Link>
                                                </Button>
                                            )}

                                            {alert.can.acknowledge && (
                                                <Button size="sm" asChild>
                                                    <Link
                                                        href={ComplianceAlertController.acknowledge(
                                                            alert.id,
                                                        )}
                                                        method="patch"
                                                        as="button"
                                                    >
                                                        Acknowledge
                                                    </Link>
                                                </Button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </DataTableCard>
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
