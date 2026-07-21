import { Form, Head, Link } from '@inertiajs/react';
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
import { SelectInput } from '@/components/ui/select-input';
import { dashboard } from '@/routes';
import { index as complianceAlertsIndex } from '@/routes/compliance-alerts';
import {
    calendar as complianceRecordsCalendar,
    index as complianceRecordsIndex,
    show as complianceRecordsShow,
} from '@/routes/compliance-records';
import type {
    ComplianceCalendarEvent,
    ComplianceCalendarFilters,
    ComplianceCalendarRecord,
    ComplianceCalendarWindow,
    ComplianceSummary,
    SelectOption,
} from '@/types';

type Props = {
    filters: ComplianceCalendarFilters;
    window: ComplianceCalendarWindow;
    summary: ComplianceSummary;
    events: ComplianceCalendarEvent[];
    overdueItems: ComplianceCalendarRecord[];
    statusOptions: SelectOption[];
    agencyOptions: SelectOption[];
};

function formatDate(date: string | null): string {
    if (!date) {
        return 'Not set';
    }

    return new Intl.DateTimeFormat('en-PH', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
    }).format(new Date(date));
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

export default function ComplianceCalendar({
    filters,
    window,
    summary,
    events,
    overdueItems,
    statusOptions,
    agencyOptions,
}: Props) {
    const groupedEvents = events.reduce<
        Record<string, ComplianceCalendarEvent[]>
    >((carry, event) => {
        carry[event.date] = carry[event.date] ?? [];
        carry[event.date].push(event);

        return carry;
    }, {});

    return (
        <>
            <Head title="Compliance Calendar" />

            <div className="app-page flex flex-1 flex-col gap-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                    <div className="space-y-1">
                        <h1 className="text-2xl font-semibold tracking-tight">
                            Compliance calendar
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Review upcoming due dates, expiring permits, and
                            overdue filings in a readable schedule.
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        <Button variant="outline" asChild>
                            <Link href={complianceAlertsIndex()}>Alerts</Link>
                        </Button>

                        <Button variant="outline" asChild>
                            <Link href={complianceRecordsIndex()}>
                                Registry
                            </Link>
                        </Button>
                    </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
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
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Calendar filters</CardTitle>
                        <CardDescription>
                            Showing deadlines between {formatDate(window.from)}{' '}
                            and {formatDate(window.to)}.
                        </CardDescription>
                    </CardHeader>

                    <CardContent>
                        <Form
                            action={complianceRecordsCalendar()}
                            method="get"
                            options={{ preserveState: true, replace: true }}
                            className="grid gap-3 xl:grid-cols-[1fr_1fr_1fr_1fr_auto_auto]"
                        >
                            <SelectInput
                                name="agency"
                                defaultValue={filters.agency}
                                className="h-9 rounded-md border border-input bg-transparent px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                            >
                                <option value="">All agencies</option>
                                {agencyOptions.map((option) => (
                                    <option
                                        key={option.value}
                                        value={option.value}
                                    >
                                        {option.label}
                                    </option>
                                ))}
                            </SelectInput>

                            <SelectInput
                                name="status"
                                defaultValue={filters.status}
                                className="h-9 rounded-md border border-input bg-transparent px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                            >
                                <option value="">All statuses</option>
                                {statusOptions.map((option) => (
                                    <option
                                        key={option.value}
                                        value={option.value}
                                    >
                                        {option.label}
                                    </option>
                                ))}
                            </SelectInput>

                            <Input
                                name="from"
                                type="date"
                                defaultValue={filters.from}
                            />
                            <Input
                                name="to"
                                type="date"
                                defaultValue={filters.to}
                            />

                            <Button type="submit">Apply</Button>

                            <Button variant="outline" asChild>
                                <Link href={complianceRecordsCalendar()}>
                                    Reset
                                </Link>
                            </Button>
                        </Form>
                    </CardContent>
                </Card>

                <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
                    <Card>
                        <CardHeader>
                            <CardTitle>Deadline window</CardTitle>
                            <CardDescription>
                                Upcoming due and expiry events grouped by date.
                            </CardDescription>
                        </CardHeader>

                        <CardContent className="space-y-4">
                            {Object.keys(groupedEvents).length === 0 && (
                                <div className="rounded-lg border border-dashed px-4 py-6 text-sm text-muted-foreground">
                                    No deadline events matched the selected
                                    window.
                                </div>
                            )}

                            {Object.entries(groupedEvents).map(
                                ([date, dateEvents]) => (
                                    <div
                                        key={date}
                                        className="rounded-xl border"
                                    >
                                        <div className="border-b bg-muted/20 px-4 py-3">
                                            <p className="font-medium">
                                                {formatDate(date)}
                                            </p>
                                        </div>

                                        <div className="space-y-3 p-4">
                                            {dateEvents.map((event) => (
                                                <div
                                                    key={`${event.id}-${event.deadline_type}-${event.date}`}
                                                    className="rounded-lg border px-4 py-3"
                                                >
                                                    <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                                                        <div className="space-y-2">
                                                            <div className="flex flex-wrap items-center gap-2">
                                                                <p className="font-medium">
                                                                    {
                                                                        event.record_no
                                                                    }
                                                                </p>
                                                                <Badge
                                                                    variant="outline"
                                                                    className={statusBadgeClass(
                                                                        event.display_status,
                                                                    )}
                                                                >
                                                                    {
                                                                        event.display_status_label
                                                                    }
                                                                </Badge>
                                                            </div>

                                                            <p className="text-sm text-muted-foreground">
                                                                {event.title}
                                                            </p>

                                                            <p className="text-xs text-muted-foreground">
                                                                {event.agency}
                                                                {event.category &&
                                                                    ` • ${event.category}`}
                                                                {event.assigned_user &&
                                                                    ` • ${event.assigned_user}`}
                                                            </p>
                                                        </div>

                                                        <div className="flex flex-col items-start gap-2 md:items-end">
                                                            <Badge variant="secondary">
                                                                {
                                                                    event.deadline_type_label
                                                                }
                                                            </Badge>

                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                asChild
                                                            >
                                                                <Link
                                                                    href={complianceRecordsShow(
                                                                        event.id,
                                                                    )}
                                                                >
                                                                    Open
                                                                </Link>
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ),
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Overdue and expired</CardTitle>
                            <CardDescription>
                                Items already past deadline and needing
                                immediate attention.
                            </CardDescription>
                        </CardHeader>

                        <CardContent className="space-y-3">
                            {overdueItems.length === 0 && (
                                <div className="rounded-lg border border-dashed px-4 py-6 text-sm text-muted-foreground">
                                    No overdue or expired items under the
                                    current filters.
                                </div>
                            )}

                            {overdueItems.map((item) => (
                                <div
                                    key={item.id}
                                    className="rounded-lg border px-4 py-3"
                                >
                                    <div className="flex flex-col gap-3">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <p className="font-medium">
                                                {item.record_no}
                                            </p>
                                            <Badge
                                                variant="outline"
                                                className={statusBadgeClass(
                                                    item.display_status,
                                                )}
                                            >
                                                {item.display_status_label}
                                            </Badge>
                                        </div>

                                        <p className="text-sm text-muted-foreground">
                                            {item.title}
                                        </p>

                                        <p className="text-xs text-muted-foreground">
                                            Due: {formatDate(item.due_date)} •
                                            Expiry:{' '}
                                            {formatDate(item.expiry_date)}
                                        </p>

                                        <Button
                                            variant="outline"
                                            size="sm"
                                            asChild
                                        >
                                            <Link
                                                href={complianceRecordsShow(
                                                    item.id,
                                                )}
                                            >
                                                Open
                                            </Link>
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    );
}

ComplianceCalendar.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: dashboard() },
        { title: 'Compliance', href: complianceRecordsIndex() },
        { title: 'Calendar', href: complianceRecordsCalendar() },
    ],
};
