import { Form, Head, Link } from '@inertiajs/react';
import { dashboard } from '@/routes';
import {
    calendar as complianceRecordsCalendar,
    create as complianceRecordsCreate,
    index as complianceRecordsIndex,
    show as complianceRecordsShow,
} from '@/routes/compliance-records';
import { index as complianceAlertsIndex } from '@/routes/compliance-alerts';
import { PaginationLinks } from '@/components/pagination-links';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import type {
    ComplianceRecordFilters,
    ComplianceRecordListItem,
    ComplianceRecentAlertItem,
    ComplianceSummary,
    PaginatedData,
    SelectOption,
} from '@/types';

type Props = {
    complianceRecords: PaginatedData<ComplianceRecordListItem>;
    filters: ComplianceRecordFilters;
    summary: ComplianceSummary;
    recentAlerts: ComplianceRecentAlertItem[];
    statusOptions: SelectOption[];
    agencyOptions: SelectOption[];
    assignedUserOptions: SelectOption[];
    can: {
        create: boolean;
        view_alerts: boolean;
    };
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

function statusBadgeClass(status: string): string {
    return {
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
    }[status] ?? 'border-slate-200 bg-slate-100 text-slate-700';
}

export default function ComplianceRecordsIndex({
    complianceRecords,
    filters,
    summary,
    recentAlerts,
    statusOptions,
    agencyOptions,
    assignedUserOptions,
    can,
}: Props) {
    return (
        <>
            <Head title="Compliance" />

            <div className="flex flex-1 flex-col gap-6 p-4">
                <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                    <div className="space-y-1">
                        <h1 className="text-2xl font-semibold tracking-tight">Compliance</h1>
                        <p className="text-sm text-muted-foreground">
                            Track permits, licenses, renewals, and recurring filings in one practical registry.
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        <Button variant="outline" asChild>
                            <Link href={complianceRecordsCalendar()}>Calendar</Link>
                        </Button>

                        {can.view_alerts && (
                            <Button variant="outline" asChild>
                                <Link href={complianceAlertsIndex()}>Alerts</Link>
                            </Button>
                        )}

                        {can.create && (
                            <Button asChild>
                                <Link href={complianceRecordsCreate()}>New record</Link>
                            </Button>
                        )}
                    </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
                    <Card>
                        <CardHeader>
                            <CardDescription>Due soon</CardDescription>
                            <CardTitle>{summary.due_soon_count}</CardTitle>
                        </CardHeader>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardDescription>For renewal</CardDescription>
                            <CardTitle>{summary.for_renewal_count}</CardTitle>
                        </CardHeader>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardDescription>Overdue</CardDescription>
                            <CardTitle>{summary.overdue_count}</CardTitle>
                        </CardHeader>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardDescription>Expired</CardDescription>
                            <CardTitle>{summary.expired_count}</CardTitle>
                        </CardHeader>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardDescription>Open alerts</CardDescription>
                            <CardTitle>
                                {summary.open_alert_count ?? 'Restricted'}
                            </CardTitle>
                        </CardHeader>
                    </Card>
                </div>

                <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
                    <Card>
                        <CardHeader>
                            <CardTitle>Filters</CardTitle>
                            <CardDescription>
                                Search by record number, title, agency, or notes, then narrow by status and owner.
                            </CardDescription>
                        </CardHeader>

                        <CardContent>
                            <Form
                                action={complianceRecordsIndex()}
                                method="get"
                                options={{ preserveState: true, replace: true }}
                                className="grid gap-3 xl:grid-cols-[2fr_1fr_1fr_1fr_auto_auto]"
                            >
                                <Input
                                    name="search"
                                    defaultValue={filters.search}
                                    placeholder="Search compliance records"
                                />

                                <select
                                    name="status"
                                    defaultValue={filters.status}
                                    className="border-input focus-visible:border-ring focus-visible:ring-ring/50 h-9 rounded-md border bg-transparent px-3 text-sm outline-none focus-visible:ring-[3px]"
                                >
                                    <option value="">All statuses</option>
                                    {statusOptions.map((option) => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>

                                <select
                                    name="agency"
                                    defaultValue={filters.agency}
                                    className="border-input focus-visible:border-ring focus-visible:ring-ring/50 h-9 rounded-md border bg-transparent px-3 text-sm outline-none focus-visible:ring-[3px]"
                                >
                                    <option value="">All agencies</option>
                                    {agencyOptions.map((option) => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>

                                <select
                                    name="assigned"
                                    defaultValue={filters.assigned ?? ''}
                                    className="border-input focus-visible:border-ring focus-visible:ring-ring/50 h-9 rounded-md border bg-transparent px-3 text-sm outline-none focus-visible:ring-[3px]"
                                >
                                    <option value="">All owners</option>
                                    {assignedUserOptions.map((option) => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>

                                <Button type="submit">Apply</Button>

                                <Button variant="outline" asChild>
                                    <Link href={complianceRecordsIndex()}>Reset</Link>
                                </Button>
                            </Form>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-start justify-between gap-3">
                            <div>
                                <CardTitle>Recent alerts</CardTitle>
                                <CardDescription>
                                    The latest reminder items needing review.
                                </CardDescription>
                            </div>

                            {can.view_alerts && (
                                <Button variant="outline" size="sm" asChild>
                                    <Link href={complianceAlertsIndex()}>Open</Link>
                                </Button>
                            )}
                        </CardHeader>

                        <CardContent className="space-y-3">
                            {recentAlerts.length === 0 && (
                                <div className="rounded-lg border border-dashed px-4 py-6 text-sm text-muted-foreground">
                                    No open alerts right now.
                                </div>
                            )}

                            {recentAlerts.map((alert) => (
                                <div key={alert.id} className="rounded-lg border px-4 py-3">
                                    <p className="text-sm font-medium">{alert.alert_type_label}</p>
                                    <p className="mt-1 text-sm text-muted-foreground">{alert.message}</p>
                                    <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                                        <span>{formatDate(alert.scheduled_for)}</span>
                                        {alert.record && (
                                            <span>
                                                {alert.record.record_no} • {alert.record.title}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Compliance registry</CardTitle>
                        <CardDescription>
                            {complianceRecords.total} compliance records
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="overflow-x-auto px-0">
                        <table className="min-w-full text-sm">
                            <thead>
                                <tr className="border-b text-left text-muted-foreground">
                                    <th className="px-6 py-3 font-medium">Record</th>
                                    <th className="px-6 py-3 font-medium">Agency / category</th>
                                    <th className="px-6 py-3 font-medium">Next deadline</th>
                                    <th className="px-6 py-3 font-medium">Owner</th>
                                    <th className="px-6 py-3 font-medium">Signals</th>
                                    <th className="px-6 py-3 font-medium text-right">Actions</th>
                                </tr>
                            </thead>

                            <tbody>
                                {complianceRecords.data.length === 0 && (
                                    <tr>
                                        <td
                                            colSpan={6}
                                            className="px-6 py-10 text-center text-muted-foreground"
                                        >
                                            No compliance records matched the current filters.
                                        </td>
                                    </tr>
                                )}

                                {complianceRecords.data.map((record) => (
                                    <tr key={record.id} className="border-b align-top last:border-0">
                                        <td className="px-6 py-4">
                                            <div className="space-y-1">
                                                <p className="font-medium">{record.record_no}</p>
                                                <p className="text-muted-foreground">{record.title}</p>
                                                <Badge
                                                    variant="outline"
                                                    className={statusBadgeClass(record.status)}
                                                >
                                                    {record.status_label}
                                                </Badge>
                                            </div>
                                        </td>

                                        <td className="px-6 py-4 text-muted-foreground">
                                            <div className="space-y-1">
                                                <p>{record.agency}</p>
                                                <p>{record.category ?? 'No category'}</p>
                                            </div>
                                        </td>

                                        <td className="px-6 py-4 text-muted-foreground">
                                            <div className="space-y-1">
                                                <p>
                                                    {record.next_deadline_type
                                                        ? `${record.next_deadline_type} • ${formatDate(record.next_deadline_date)}`
                                                        : 'No deadline'}
                                                </p>
                                                <p className="text-xs">
                                                    Due: {formatDate(record.due_date)}
                                                </p>
                                                <p className="text-xs">
                                                    Expiry: {formatDate(record.expiry_date)}
                                                </p>
                                            </div>
                                        </td>

                                        <td className="px-6 py-4 text-muted-foreground">
                                            {record.assigned_user ?? 'Unassigned'}
                                        </td>

                                        <td className="px-6 py-4 text-muted-foreground">
                                            <div className="space-y-1">
                                                <p>{record.submission_count} submissions</p>
                                                <p>{record.open_alert_count} open alerts</p>
                                                <p>{record.attachment_count} attachments</p>
                                            </div>
                                        </td>

                                        <td className="px-6 py-4 text-right">
                                            {record.can.view && (
                                                <Button variant="outline" size="sm" asChild>
                                                    <Link href={complianceRecordsShow(record.id)}>Open</Link>
                                                </Button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </CardContent>

                    <PaginationLinks pagination={complianceRecords} />
                </Card>
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
