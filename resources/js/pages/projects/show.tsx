import { Head, Link, useForm } from '@inertiajs/react';
import ProjectController from '@/actions/App/Http/Controllers/Projects/ProjectController';
import { dashboard } from '@/routes';
import { show as customersShow } from '@/routes/customers';
import {
    index as projectsIndex,
    edit as projectsEdit,
} from '@/routes/projects';
import { show as quotationsShow } from '@/routes/quotations';
import { show as sitesShow } from '@/routes/sites';
import { create as stockIssuancesCreate } from '@/routes/stock-issuances';
import { create as stockReturnsCreate } from '@/routes/stock-returns';
import {
    create as workOrdersCreate,
    show as workOrdersShow,
} from '@/routes/work-orders';
import { RecordAttachmentsCard } from '@/components/attachments/record-attachments-card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import InputError from '@/components/input-error';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { ProjectDetail, SelectOption } from '@/types';

type Props = {
    project: ProjectDetail;
    statusOptions: SelectOption[];
    userOptions: SelectOption[];
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

function formatDateTime(date: string | null): string {
    if (!date) {
        return 'Not recorded';
    }

    return new Intl.DateTimeFormat('en-PH', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
    }).format(new Date(date));
}

function statusBadgeClass(status: string): string {
    return (
        {
            draft: 'border-slate-200 bg-slate-100 text-slate-700',
            open: 'border-sky-200 bg-sky-50 text-sky-700',
            in_progress: 'border-amber-200 bg-amber-50 text-amber-700',
            on_hold: 'border-orange-200 bg-orange-50 text-orange-700',
            completed: 'border-emerald-200 bg-emerald-50 text-emerald-700',
            cancelled: 'border-rose-200 bg-rose-50 text-rose-700',
        }[status] ?? 'border-slate-200 bg-slate-100 text-slate-700'
    );
}

export default function ProjectsShow({
    project,
    statusOptions,
    userOptions,
}: Props) {
    const statusForm = useForm({
        status: project.status,
        remarks: '',
        actual_end_date: project.actual_end_date ?? '',
    });
    const assignmentForm = useForm({
        user_id: '',
        assignment_role: '',
        notes: '',
    });

    function submitStatus(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

        statusForm.transform((data) => ({
            status: data.status,
            remarks: data.remarks || null,
            actual_end_date: data.actual_end_date || null,
        }));

        statusForm.submit(ProjectController.updateStatus(project.id), {
            preserveScroll: true,
        });
    }

    function submitAssignment(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

        assignmentForm.transform((data) => ({
            user_id: data.user_id === '' ? null : Number(data.user_id),
            assignment_role: data.assignment_role || null,
            notes: data.notes || null,
        }));

        assignmentForm.submit(ProjectController.storeAssignment(project.id), {
            preserveScroll: true,
            onSuccess: () => {
                assignmentForm.reset();
            },
        });
    }

    return (
        <>
            <Head title={project.project_no} />

            <div className="app-page flex flex-1 flex-col gap-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                            <h1 className="text-2xl font-semibold tracking-tight">
                                {project.project_no}
                            </h1>
                            <Badge
                                variant="outline"
                                className={statusBadgeClass(project.status)}
                            >
                                {project.status_label}
                            </Badge>
                        </div>

                        <p className="text-sm text-muted-foreground">
                            {project.title}
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        {project.customer.id && (
                            <Button variant="outline" asChild>
                                <Link href={customersShow(project.customer.id)}>
                                    View customer
                                </Link>
                            </Button>
                        )}

                        {project.site.id && (
                            <Button variant="outline" asChild>
                                <Link href={sitesShow(project.site.id)}>
                                    View site
                                </Link>
                            </Button>
                        )}

                        {project.quotation.id && (
                            <Button variant="outline" asChild>
                                <Link
                                    href={quotationsShow(project.quotation.id)}
                                >
                                    View quotation
                                </Link>
                            </Button>
                        )}

                        {project.can.create_work_order && (
                            <Button variant="outline" asChild>
                                <Link
                                    href={workOrdersCreate({
                                        query: {
                                            project: project.id,
                                            customer:
                                                project.customer.id ??
                                                undefined,
                                            site: project.site.id ?? undefined,
                                            quotation:
                                                project.quotation.id ??
                                                undefined,
                                        },
                                    })}
                                >
                                    New work order
                                </Link>
                            </Button>
                        )}

                        {project.can.create_stock_issuance && (
                            <Button variant="outline" asChild>
                                <Link
                                    href={stockIssuancesCreate({
                                        query: {
                                            project: project.id,
                                        },
                                    })}
                                >
                                    Stock issuance
                                </Link>
                            </Button>
                        )}

                        {project.can.create_stock_return && (
                            <Button variant="outline" asChild>
                                <Link
                                    href={stockReturnsCreate({
                                        query: {
                                            project: project.id,
                                        },
                                    })}
                                >
                                    Stock return
                                </Link>
                            </Button>
                        )}

                        {project.can.update && (
                            <Button asChild>
                                <Link href={projectsEdit(project.id)}>
                                    Edit project
                                </Link>
                            </Button>
                        )}

                        {project.can.delete && (
                            <Button variant="outline" asChild>
                                <Link
                                    href={ProjectController.destroy(project.id)}
                                    method="delete"
                                    as="button"
                                >
                                    Archive
                                </Link>
                            </Button>
                        )}
                    </div>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                    <Card>
                        <CardHeader>
                            <CardDescription>Project type</CardDescription>
                            <CardTitle className="text-base">
                                {project.project_type}
                            </CardTitle>
                        </CardHeader>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardDescription>
                                Linked work orders
                            </CardDescription>
                            <CardTitle>{project.work_order_count}</CardTitle>
                        </CardHeader>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardDescription>Attachments</CardDescription>
                            <CardTitle>{project.attachment_count}</CardTitle>
                        </CardHeader>
                    </Card>
                </div>

                <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Project information</CardTitle>
                                <CardDescription>
                                    Operational project details used by
                                    planning, staffing, and downstream work
                                    orders.
                                </CardDescription>
                            </CardHeader>

                            <CardContent className="grid gap-5 md:grid-cols-2">
                                <div>
                                    <p className="text-sm text-muted-foreground">
                                        Customer
                                    </p>
                                    {project.customer.id ? (
                                        <Link
                                            href={customersShow(
                                                project.customer.id,
                                            )}
                                            className="mt-1 inline-flex font-medium hover:underline"
                                        >
                                            {project.customer.customer_code} -{' '}
                                            {project.customer.company_name}
                                        </Link>
                                    ) : (
                                        <p className="mt-1 font-medium">
                                            Not linked
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <p className="text-sm text-muted-foreground">
                                        Site
                                    </p>
                                    {project.site.id ? (
                                        <Link
                                            href={sitesShow(project.site.id)}
                                            className="mt-1 inline-flex font-medium hover:underline"
                                        >
                                            {project.site.site_name}
                                            {project.site.site_code &&
                                                ` (${project.site.site_code})`}
                                        </Link>
                                    ) : (
                                        <p className="mt-1 font-medium">
                                            Not linked
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <p className="text-sm text-muted-foreground">
                                        Awarded quotation
                                    </p>
                                    {project.quotation.id ? (
                                        <Link
                                            href={quotationsShow(
                                                project.quotation.id,
                                            )}
                                            className="mt-1 inline-flex font-medium hover:underline"
                                        >
                                            {project.quotation.quotation_no}
                                        </Link>
                                    ) : (
                                        <p className="mt-1 font-medium">
                                            No quotation linked
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <p className="text-sm text-muted-foreground">
                                        Quotation status
                                    </p>
                                    <p className="mt-1 font-medium">
                                        {project.quotation.status_label ??
                                            'Not applicable'}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-sm text-muted-foreground">
                                        Start date
                                    </p>
                                    <p className="mt-1 font-medium">
                                        {formatDate(project.start_date)}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-sm text-muted-foreground">
                                        Target end date
                                    </p>
                                    <p className="mt-1 font-medium">
                                        {formatDate(project.target_end_date)}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-sm text-muted-foreground">
                                        Actual end date
                                    </p>
                                    <p className="mt-1 font-medium">
                                        {formatDate(project.actual_end_date)}
                                    </p>
                                </div>

                                <div className="md:col-span-2">
                                    <p className="text-sm text-muted-foreground">
                                        Site address
                                    </p>
                                    <p className="mt-1 font-medium whitespace-pre-line">
                                        {project.site.address ??
                                            ([
                                                project.site.city,
                                                project.site.province,
                                            ]
                                                .filter(Boolean)
                                                .join(', ') ||
                                                'Not set')}
                                    </p>
                                </div>

                                <div className="md:col-span-2">
                                    <p className="text-sm text-muted-foreground">
                                        Description
                                    </p>
                                    <p className="mt-1 font-medium whitespace-pre-line">
                                        {project.description ??
                                            'No description'}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Status history</CardTitle>
                                <CardDescription>
                                    Every recorded project status transition
                                    appears here.
                                </CardDescription>
                            </CardHeader>

                            <CardContent className="space-y-3">
                                {(project.status_history ?? []).map((entry) => (
                                    <div
                                        key={entry.id}
                                        className="rounded-lg border px-4 py-3"
                                    >
                                        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <Badge variant="outline">
                                                    {entry.from_status_label ??
                                                        'Created'}
                                                </Badge>
                                                <span className="text-muted-foreground">
                                                    to
                                                </span>
                                                <Badge
                                                    variant="outline"
                                                    className={statusBadgeClass(
                                                        entry.to_status ??
                                                            project.status,
                                                    )}
                                                >
                                                    {entry.to_status_label}
                                                </Badge>
                                            </div>

                                            <p className="text-sm text-muted-foreground">
                                                {formatDateTime(
                                                    entry.changed_at,
                                                )}
                                            </p>
                                        </div>

                                        <div className="mt-3 space-y-1 text-sm">
                                            <p className="text-muted-foreground">
                                                Changed by:{' '}
                                                <span className="font-medium text-foreground">
                                                    {entry.changed_by ??
                                                        'System'}
                                                </span>
                                            </p>
                                            <p className="whitespace-pre-line text-muted-foreground">
                                                {entry.remarks ??
                                                    'No remarks recorded.'}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Linked work orders</CardTitle>
                                <CardDescription>
                                    Service and execution work already scheduled
                                    under this project.
                                </CardDescription>
                            </CardHeader>

                            <CardContent className="space-y-3">
                                {(project.work_orders ?? []).length === 0 && (
                                    <div className="rounded-lg border border-dashed px-4 py-6 text-sm text-muted-foreground">
                                        No work orders linked yet.
                                    </div>
                                )}

                                {(project.work_orders ?? []).map(
                                    (workOrder) => (
                                        <div
                                            key={workOrder.id}
                                            className="flex flex-col gap-3 rounded-lg border px-4 py-3 md:flex-row md:items-center md:justify-between"
                                        >
                                            <div className="space-y-1">
                                                <p className="font-medium">
                                                    {workOrder.work_order_no}
                                                </p>
                                                <p className="text-sm text-muted-foreground">
                                                    {workOrder.summary}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    Scheduled:{' '}
                                                    {formatDate(
                                                        workOrder.scheduled_date,
                                                    )}
                                                </p>
                                            </div>

                                            <div className="flex flex-wrap items-center gap-2">
                                                <Badge
                                                    variant="outline"
                                                    className={statusBadgeClass(
                                                        workOrder.status,
                                                    )}
                                                >
                                                    {workOrder.status_label}
                                                </Badge>

                                                {workOrder.can.view && (
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        asChild
                                                    >
                                                        <Link
                                                            href={workOrdersShow(
                                                                workOrder.id,
                                                            )}
                                                        >
                                                            Open
                                                        </Link>
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    ),
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    <div className="space-y-6">
                        {project.can.change_status && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Update status</CardTitle>
                                    <CardDescription>
                                        Record the next project status change
                                        and keep the audit trail current.
                                    </CardDescription>
                                </CardHeader>

                                <CardContent>
                                    <form
                                        onSubmit={submitStatus}
                                        className="space-y-4"
                                    >
                                        <div className="grid gap-2">
                                            <Label htmlFor="status">
                                                Next status
                                            </Label>
                                            <select
                                                id="status"
                                                value={statusForm.data.status}
                                                onChange={(event) =>
                                                    statusForm.setData(
                                                        'status',
                                                        event.currentTarget
                                                            .value,
                                                    )
                                                }
                                                className="h-9 rounded-md border border-input bg-transparent px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                                            >
                                                {statusOptions.map((option) => (
                                                    <option
                                                        key={option.value}
                                                        value={option.value}
                                                    >
                                                        {option.label}
                                                    </option>
                                                ))}
                                            </select>
                                            <InputError
                                                message={
                                                    statusForm.errors.status
                                                }
                                            />
                                        </div>

                                        <div className="grid gap-2">
                                            <Label htmlFor="actual_end_date">
                                                Actual end date
                                            </Label>
                                            <Input
                                                id="actual_end_date"
                                                type="date"
                                                value={
                                                    statusForm.data
                                                        .actual_end_date
                                                }
                                                onChange={(event) =>
                                                    statusForm.setData(
                                                        'actual_end_date',
                                                        event.currentTarget
                                                            .value,
                                                    )
                                                }
                                            />
                                            <InputError
                                                message={
                                                    statusForm.errors
                                                        .actual_end_date
                                                }
                                            />
                                        </div>

                                        <div className="grid gap-2">
                                            <Label htmlFor="remarks">
                                                Remarks
                                            </Label>
                                            <Textarea
                                                id="remarks"
                                                value={statusForm.data.remarks}
                                                onChange={(event) =>
                                                    statusForm.setData(
                                                        'remarks',
                                                        event.currentTarget
                                                            .value,
                                                    )
                                                }
                                                rows={4}
                                            />
                                            <InputError
                                                message={
                                                    statusForm.errors.remarks
                                                }
                                            />
                                        </div>

                                        <Button
                                            className="w-full"
                                            disabled={statusForm.processing}
                                        >
                                            {statusForm.processing
                                                ? 'Saving status...'
                                                : 'Update status'}
                                        </Button>
                                    </form>
                                </CardContent>
                            </Card>
                        )}

                        <Card>
                            <CardHeader>
                                <CardTitle>Assignments</CardTitle>
                                <CardDescription>
                                    Keep the current project staffing and
                                    coordination ownership visible.
                                </CardDescription>
                            </CardHeader>

                            <CardContent className="space-y-4">
                                {project.can.manage_assignments && (
                                    <form
                                        onSubmit={submitAssignment}
                                        className="space-y-3"
                                    >
                                        <div className="grid gap-2">
                                            <Label htmlFor="user_id">
                                                Assigned user
                                            </Label>
                                            <select
                                                id="user_id"
                                                value={
                                                    assignmentForm.data.user_id
                                                }
                                                onChange={(event) =>
                                                    assignmentForm.setData(
                                                        'user_id',
                                                        event.currentTarget
                                                            .value,
                                                    )
                                                }
                                                className="h-9 rounded-md border border-input bg-transparent px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                                            >
                                                <option value="">
                                                    Select user
                                                </option>
                                                {userOptions.map((option) => (
                                                    <option
                                                        key={option.value}
                                                        value={option.value}
                                                    >
                                                        {option.label}
                                                    </option>
                                                ))}
                                            </select>
                                            <InputError
                                                message={
                                                    assignmentForm.errors
                                                        .user_id
                                                }
                                            />
                                        </div>

                                        <div className="grid gap-2">
                                            <Label htmlFor="assignment_role">
                                                Role
                                            </Label>
                                            <Input
                                                id="assignment_role"
                                                value={
                                                    assignmentForm.data
                                                        .assignment_role
                                                }
                                                onChange={(event) =>
                                                    assignmentForm.setData(
                                                        'assignment_role',
                                                        event.currentTarget
                                                            .value,
                                                    )
                                                }
                                                placeholder="Project coordinator"
                                            />
                                            <InputError
                                                message={
                                                    assignmentForm.errors
                                                        .assignment_role
                                                }
                                            />
                                        </div>

                                        <div className="grid gap-2">
                                            <Label htmlFor="notes">Notes</Label>
                                            <Textarea
                                                id="notes"
                                                value={
                                                    assignmentForm.data.notes
                                                }
                                                onChange={(event) =>
                                                    assignmentForm.setData(
                                                        'notes',
                                                        event.currentTarget
                                                            .value,
                                                    )
                                                }
                                                rows={3}
                                            />
                                            <InputError
                                                message={
                                                    assignmentForm.errors.notes
                                                }
                                            />
                                        </div>

                                        <Button
                                            className="w-full"
                                            disabled={assignmentForm.processing}
                                        >
                                            {assignmentForm.processing
                                                ? 'Saving assignment...'
                                                : 'Save assignment'}
                                        </Button>
                                    </form>
                                )}

                                <div className="space-y-3">
                                    {(project.assignments ?? []).length ===
                                        0 && (
                                        <div className="rounded-lg border border-dashed px-4 py-6 text-sm text-muted-foreground">
                                            No team assignments recorded yet.
                                        </div>
                                    )}

                                    {(project.assignments ?? []).map(
                                        (assignment) => (
                                            <div
                                                key={assignment.id}
                                                className="rounded-lg border px-4 py-3"
                                            >
                                                <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                                                    <div className="space-y-1">
                                                        <p className="font-medium">
                                                            {assignment.user
                                                                .name ??
                                                                'Unknown user'}
                                                        </p>
                                                        <p className="text-sm text-muted-foreground">
                                                            {assignment.assignment_role ??
                                                                'No role specified'}
                                                        </p>
                                                        <p className="text-xs text-muted-foreground">
                                                            Assigned:{' '}
                                                            {formatDateTime(
                                                                assignment.assigned_at,
                                                            )}
                                                        </p>
                                                    </div>

                                                    {project.can
                                                        .manage_assignments && (
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            asChild
                                                        >
                                                            <Link
                                                                href={ProjectController.destroyAssignment(
                                                                    {
                                                                        project:
                                                                            project.id,
                                                                        assignment:
                                                                            assignment.id,
                                                                    },
                                                                )}
                                                                method="delete"
                                                                as="button"
                                                            >
                                                                Remove
                                                            </Link>
                                                        </Button>
                                                    )}
                                                </div>

                                                <p className="mt-3 text-sm whitespace-pre-line text-muted-foreground">
                                                    {assignment.notes ??
                                                        'No notes'}
                                                </p>
                                            </div>
                                        ),
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                <RecordAttachmentsCard
                    attachments={project.attachments ?? []}
                    attachableType="project"
                    attachableId={project.id}
                    canUpload={project.can.upload_attachments}
                    canUnlink={project.can.remove_attachments}
                />
            </div>
        </>
    );
}

ProjectsShow.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: dashboard() },
        { title: 'Projects', href: projectsIndex() },
        { title: 'Project details', href: projectsIndex() },
    ],
};
