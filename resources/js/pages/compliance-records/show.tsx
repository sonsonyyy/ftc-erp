import { Head, Link, router, useForm } from '@inertiajs/react';
import ComplianceAlertController from '@/actions/App/Http/Controllers/Compliance/ComplianceAlertController';
import ComplianceRecordController from '@/actions/App/Http/Controllers/Compliance/ComplianceRecordController';
import ComplianceSubmissionController from '@/actions/App/Http/Controllers/Compliance/ComplianceSubmissionController';
import ComplianceTaskController from '@/actions/App/Http/Controllers/Compliance/ComplianceTaskController';
import { dashboard } from '@/routes';
import {
    calendar as complianceRecordsCalendar,
    edit as complianceRecordsEdit,
    index as complianceRecordsIndex,
} from '@/routes/compliance-records';
import { index as complianceAlertsIndex } from '@/routes/compliance-alerts';
import { RecordAttachmentsCard } from '@/components/attachments/record-attachments-card';
import InputError from '@/components/input-error';
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
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { ComplianceRecordDetail, SelectOption } from '@/types';

type Props = {
    complianceRecord: ComplianceRecordDetail;
    assignedUserOptions: SelectOption[];
    taskStatusOptions: SelectOption[];
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

function approvalBadgeClass(state: string): string {
    return {
        pending: 'border-amber-200 bg-amber-50 text-amber-700',
        approved: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    }[state] ?? 'border-slate-200 bg-slate-100 text-slate-700';
}

export default function ComplianceRecordsShow({
    complianceRecord,
    assignedUserOptions,
    taskStatusOptions,
}: Props) {
    const tasks = complianceRecord.tasks ?? [];
    const submissions = complianceRecord.submissions ?? [];
    const alerts = complianceRecord.alerts ?? [];
    const attachments = complianceRecord.attachments ?? [];

    const submissionForm = useForm({
        reference_no: '',
        submitted_at: new Date().toISOString().slice(0, 10),
        next_due_date: complianceRecord.due_date ?? '',
        next_expiry_date: complianceRecord.expiry_date ?? '',
        remarks: '',
    });

    const taskForm = useForm({
        title: '',
        due_date: complianceRecord.next_deadline_date ?? '',
        assigned_user_id: complianceRecord.assigned_user?.id
            ? String(complianceRecord.assigned_user.id)
            : '',
        status: 'open',
        notes: '',
    });

    function submitSubmission(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

        submissionForm.transform((data) => ({
            reference_no: data.reference_no,
            submitted_at: data.submitted_at,
            next_due_date: data.next_due_date || null,
            next_expiry_date: data.next_expiry_date || null,
            remarks: data.remarks || null,
        }));

        submissionForm.submit(ComplianceSubmissionController.store(complianceRecord.id), {
            preserveScroll: true,
        });
    }

    function submitTask(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

        taskForm.transform((data) => ({
            title: data.title,
            due_date: data.due_date || null,
            assigned_user_id: data.assigned_user_id === '' ? null : Number(data.assigned_user_id),
            status: data.status,
            notes: data.notes || null,
        }));

        taskForm.submit(ComplianceTaskController.store(complianceRecord.id), {
            preserveScroll: true,
        });
    }

    function toggleTaskStatus(taskId: number, status: string) {
        router.patch(
            ComplianceTaskController.update({
                compliance_record: complianceRecord.id,
                task: taskId,
            }),
            {
                status,
            },
            { preserveScroll: true },
        );
    }

    function deleteTask(taskId: number) {
        router.delete(ComplianceTaskController.destroy({
            compliance_record: complianceRecord.id,
            task: taskId,
        }), {
            preserveScroll: true,
        });
    }

    return (
        <>
            <Head title={complianceRecord.record_no} />

            <div className="flex flex-1 flex-col gap-6 p-4">
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                            <h1 className="text-2xl font-semibold tracking-tight">
                                {complianceRecord.record_no}
                            </h1>
                            <Badge
                                variant="outline"
                                className={statusBadgeClass(complianceRecord.display_status)}
                            >
                                {complianceRecord.display_status_label}
                            </Badge>
                        </div>

                        <p className="text-sm text-muted-foreground">
                            {complianceRecord.title}
                            {complianceRecord.template && ` • ${complianceRecord.template.name}`}
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        <Button variant="outline" asChild>
                            <Link href={complianceRecordsCalendar()}>Calendar</Link>
                        </Button>

                        <Button variant="outline" asChild>
                            <Link href={complianceAlertsIndex()}>Alerts</Link>
                        </Button>

                        {complianceRecord.can.update && (
                            <Button asChild>
                                <Link href={complianceRecordsEdit(complianceRecord.id)}>
                                    Edit record
                                </Link>
                            </Button>
                        )}

                        {complianceRecord.can.delete && (
                            <Button variant="outline" asChild>
                                <Link
                                    href={ComplianceRecordController.destroy(complianceRecord.id)}
                                    method="delete"
                                    as="button"
                                >
                                    Archive
                                </Link>
                            </Button>
                        )}
                    </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
                    <Card>
                        <CardHeader>
                            <CardDescription>Next deadline</CardDescription>
                            <CardTitle className="text-base">
                                {formatDate(complianceRecord.next_deadline_date)}
                            </CardTitle>
                        </CardHeader>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardDescription>Submissions</CardDescription>
                            <CardTitle>{complianceRecord.submission_count}</CardTitle>
                        </CardHeader>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardDescription>Tasks</CardDescription>
                            <CardTitle>{complianceRecord.task_count}</CardTitle>
                        </CardHeader>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardDescription>Open alerts</CardDescription>
                            <CardTitle>{complianceRecord.open_alert_count}</CardTitle>
                        </CardHeader>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardDescription>Attachments</CardDescription>
                            <CardTitle>{complianceRecord.attachment_count}</CardTitle>
                        </CardHeader>
                    </Card>
                </div>

                <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
                    <Card>
                        <CardHeader>
                            <CardTitle>Compliance information</CardTitle>
                            <CardDescription>
                                Core filing context, deadline tracking, and current ownership for this record.
                            </CardDescription>
                        </CardHeader>

                        <CardContent className="grid gap-5 md:grid-cols-2">
                            <div>
                                <p className="text-sm text-muted-foreground">Agency</p>
                                <p className="mt-1 font-medium">{complianceRecord.agency}</p>
                            </div>

                            <div>
                                <p className="text-sm text-muted-foreground">Category</p>
                                <p className="mt-1 font-medium">
                                    {complianceRecord.category ?? 'Not set'}
                                </p>
                            </div>

                            <div>
                                <p className="text-sm text-muted-foreground">Due date</p>
                                <p className="mt-1 font-medium">
                                    {formatDate(complianceRecord.due_date)}
                                </p>
                            </div>

                            <div>
                                <p className="text-sm text-muted-foreground">Expiry date</p>
                                <p className="mt-1 font-medium">
                                    {formatDate(complianceRecord.expiry_date)}
                                </p>
                            </div>

                            <div>
                                <p className="text-sm text-muted-foreground">Recurrence</p>
                                <p className="mt-1 font-medium">
                                    {complianceRecord.recurrence_unit_label}
                                </p>
                            </div>

                            <div>
                                <p className="text-sm text-muted-foreground">Responsible user</p>
                                <p className="mt-1 font-medium">
                                    {complianceRecord.assigned_user?.name ?? 'Unassigned'}
                                </p>
                            </div>

                            <div>
                                <p className="text-sm text-muted-foreground">
                                    Latest submission
                                </p>
                                <p className="mt-1 font-medium">
                                    {complianceRecord.latest_submission_reference ?? 'Not recorded'}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    {formatDate(complianceRecord.latest_submission_at)}
                                </p>
                            </div>

                            <div>
                                <p className="text-sm text-muted-foreground">Reminder cadence</p>
                                <p className="mt-1 font-medium">
                                    {complianceRecord.reminder_days.length > 0
                                        ? `${complianceRecord.reminder_days.join(', ')} days`
                                        : 'No reminders'}
                                </p>
                            </div>

                            <div className="md:col-span-2">
                                <p className="text-sm text-muted-foreground">Description</p>
                                <p className="mt-1 whitespace-pre-line font-medium">
                                    {complianceRecord.description ?? 'No description'}
                                </p>
                            </div>

                            <div className="md:col-span-2">
                                <p className="text-sm text-muted-foreground">Notes</p>
                                <p className="mt-1 whitespace-pre-line font-medium">
                                    {complianceRecord.notes ?? 'No notes'}
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Submission history</CardTitle>
                            <CardDescription>
                                Log each filing or renewal so the next cycle carries forward cleanly.
                            </CardDescription>
                        </CardHeader>

                        <CardContent className="space-y-4">
                            {!complianceRecord.can.create_submission && submissions.some((submission) => submission.approval_state === 'pending') && (
                                <div className="rounded-lg border border-dashed px-4 py-3 text-sm text-muted-foreground">
                                    A submission is waiting for approval. Approve it below before recording another cycle.
                                </div>
                            )}

                            {complianceRecord.can.create_submission && (
                                <form onSubmit={submitSubmission} className="space-y-4 rounded-lg border p-4">
                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div className="grid gap-2">
                                            <Label htmlFor="reference_no">Reference number</Label>
                                            <Input
                                                id="reference_no"
                                                value={submissionForm.data.reference_no}
                                                onChange={(event) =>
                                                    submissionForm.setData('reference_no', event.currentTarget.value)
                                                }
                                                placeholder="SUB-CMP-0003"
                                            />
                                            <InputError message={submissionForm.errors.reference_no} />
                                        </div>

                                        <div className="grid gap-2">
                                            <Label htmlFor="submitted_at">Submitted at</Label>
                                            <Input
                                                id="submitted_at"
                                                type="date"
                                                value={submissionForm.data.submitted_at}
                                                onChange={(event) =>
                                                    submissionForm.setData('submitted_at', event.currentTarget.value)
                                                }
                                            />
                                            <InputError message={submissionForm.errors.submitted_at} />
                                        </div>

                                        <div className="grid gap-2">
                                            <Label htmlFor="next_due_date">Next due date</Label>
                                            <Input
                                                id="next_due_date"
                                                type="date"
                                                value={submissionForm.data.next_due_date}
                                                onChange={(event) =>
                                                    submissionForm.setData('next_due_date', event.currentTarget.value)
                                                }
                                            />
                                            <InputError message={submissionForm.errors.next_due_date} />
                                        </div>

                                        <div className="grid gap-2">
                                            <Label htmlFor="next_expiry_date">Next expiry date</Label>
                                            <Input
                                                id="next_expiry_date"
                                                type="date"
                                                value={submissionForm.data.next_expiry_date}
                                                onChange={(event) =>
                                                    submissionForm.setData('next_expiry_date', event.currentTarget.value)
                                                }
                                            />
                                            <InputError message={submissionForm.errors.next_expiry_date} />
                                        </div>
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="submission_remarks">Remarks</Label>
                                        <Textarea
                                            id="submission_remarks"
                                            value={submissionForm.data.remarks}
                                            onChange={(event) =>
                                                submissionForm.setData('remarks', event.currentTarget.value)
                                            }
                                            placeholder="OR number, portal notes, or renewed permit details."
                                        />
                                        <InputError message={submissionForm.errors.remarks} />
                                    </div>

                                    <Button type="submit" disabled={submissionForm.processing}>
                                        Add submission
                                    </Button>
                                </form>
                            )}

                            {submissions.length === 0 && (
                                <div className="rounded-lg border border-dashed px-4 py-6 text-sm text-muted-foreground">
                                    No submissions recorded yet.
                                </div>
                            )}

                            {submissions.map((submission) => (
                                <div key={submission.id} className="rounded-lg border px-4 py-3">
                                    <div className="space-y-3">
                                        <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                                            <div className="space-y-2">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <p className="font-medium">
                                                        {submission.reference_no}
                                                    </p>
                                                    <Badge
                                                        variant="outline"
                                                        className={approvalBadgeClass(submission.approval_state)}
                                                    >
                                                        {submission.approval_state_label}
                                                    </Badge>
                                                    <p className="text-sm text-muted-foreground">
                                                        {formatDate(submission.submitted_at)}
                                                    </p>
                                                </div>

                                                <p className="text-sm text-muted-foreground">
                                                    Submitted by {submission.submitted_by ?? 'Unknown'}
                                                </p>
                                            </div>

                                            {submission.can.approve && (
                                                <Button size="sm" asChild>
                                                    <Link
                                                        href={ComplianceSubmissionController.approve({
                                                            compliance_record: complianceRecord.id,
                                                            submission: submission.id,
                                                        })}
                                                        method="patch"
                                                        as="button"
                                                    >
                                                        Approve submission
                                                    </Link>
                                                </Button>
                                            )}
                                        </div>

                                        <p className="text-xs text-muted-foreground">
                                            Snapshot due: {formatDate(submission.due_date_snapshot)} • Snapshot expiry: {formatDate(submission.expiry_date_snapshot)}
                                        </p>

                                        <p className="text-xs text-muted-foreground">
                                            Next due: {formatDate(submission.next_due_date)} • Next expiry: {formatDate(submission.next_expiry_date)}
                                        </p>

                                        {submission.remarks && (
                                            <p className="text-sm text-muted-foreground">
                                                {submission.remarks}
                                            </p>
                                        )}

                                        <div className="rounded-md bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
                                            {submission.approved_at
                                                ? `Approved ${formatDateTime(submission.approved_at)} by ${submission.approved_by ?? 'Unknown'}`
                                                : 'Awaiting approval before next dates are applied to the main record.'}
                                        </div>

                                        {submission.approval_notes && (
                                            <p className="text-sm text-muted-foreground">
                                                Approval notes: {submission.approval_notes}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>

                <div className="grid gap-6 xl:grid-cols-[1.1fr_1fr_1fr]">
                    <Card>
                        <CardHeader>
                            <CardTitle>Tasks</CardTitle>
                            <CardDescription>
                                Track the prep work that needs to happen before filing or renewal.
                            </CardDescription>
                        </CardHeader>

                        <CardContent className="space-y-4">
                            {complianceRecord.can.create_task && (
                                <form onSubmit={submitTask} className="space-y-4 rounded-lg border p-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="task_title">Task title</Label>
                                        <Input
                                            id="task_title"
                                            value={taskForm.data.title}
                                            onChange={(event) =>
                                                taskForm.setData('title', event.currentTarget.value)
                                            }
                                            placeholder="Prepare supporting documents"
                                        />
                                        <InputError message={taskForm.errors.title} />
                                    </div>

                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div className="grid gap-2">
                                            <Label htmlFor="task_due_date">Due date</Label>
                                            <Input
                                                id="task_due_date"
                                                type="date"
                                                value={taskForm.data.due_date}
                                                onChange={(event) =>
                                                    taskForm.setData('due_date', event.currentTarget.value)
                                                }
                                            />
                                            <InputError message={taskForm.errors.due_date} />
                                        </div>

                                        <div className="grid gap-2">
                                            <Label htmlFor="task_assigned_user_id">Assigned user</Label>
                                            <select
                                                id="task_assigned_user_id"
                                                value={taskForm.data.assigned_user_id}
                                                onChange={(event) =>
                                                    taskForm.setData('assigned_user_id', event.currentTarget.value)
                                                }
                                                className="border-input focus-visible:border-ring focus-visible:ring-ring/50 h-9 rounded-md border bg-transparent px-3 text-sm outline-none focus-visible:ring-[3px]"
                                            >
                                                <option value="">Unassigned</option>
                                                {assignedUserOptions.map((option) => (
                                                    <option key={option.value} value={option.value}>
                                                        {option.label}
                                                    </option>
                                                ))}
                                            </select>
                                            <InputError message={taskForm.errors.assigned_user_id} />
                                        </div>
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="task_status">Initial status</Label>
                                        <select
                                            id="task_status"
                                            value={taskForm.data.status}
                                            onChange={(event) =>
                                                taskForm.setData('status', event.currentTarget.value)
                                            }
                                            className="border-input focus-visible:border-ring focus-visible:ring-ring/50 h-9 rounded-md border bg-transparent px-3 text-sm outline-none focus-visible:ring-[3px]"
                                        >
                                            {taskStatusOptions.map((option) => (
                                                <option key={option.value} value={option.value}>
                                                    {option.label}
                                                </option>
                                            ))}
                                        </select>
                                        <InputError message={taskForm.errors.status} />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="task_notes">Notes</Label>
                                        <Textarea
                                            id="task_notes"
                                            value={taskForm.data.notes}
                                            onChange={(event) =>
                                                taskForm.setData('notes', event.currentTarget.value)
                                            }
                                            placeholder="Working notes for the assigned owner."
                                        />
                                        <InputError message={taskForm.errors.notes} />
                                    </div>

                                    <Button type="submit" disabled={taskForm.processing}>
                                        Add task
                                    </Button>
                                </form>
                            )}

                            {tasks.length === 0 && (
                                <div className="rounded-lg border border-dashed px-4 py-6 text-sm text-muted-foreground">
                                    No tasks added yet.
                                </div>
                            )}

                            {tasks.map((task) => (
                                <div key={task.id} className="rounded-lg border px-4 py-3">
                                    <div className="space-y-3">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <p className="font-medium">{task.title}</p>
                                            <Badge
                                                variant="outline"
                                                className={statusBadgeClass(task.status)}
                                            >
                                                {task.status_label}
                                            </Badge>
                                        </div>

                                        <p className="text-sm text-muted-foreground">
                                            Due {formatDate(task.due_date)} • {task.assigned_user?.name ?? 'Unassigned'}
                                        </p>

                                        {task.notes && (
                                            <p className="text-sm text-muted-foreground">
                                                {task.notes}
                                            </p>
                                        )}

                                        {task.completed_at && (
                                            <p className="text-xs text-muted-foreground">
                                                Completed {formatDateTime(task.completed_at)}
                                            </p>
                                        )}

                                        {complianceRecord.can.create_task && (
                                            <div className="flex flex-wrap gap-2">
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() =>
                                                        toggleTaskStatus(
                                                            task.id,
                                                            task.status === 'completed' ? 'open' : 'completed',
                                                        )
                                                    }
                                                >
                                                    {task.status === 'completed'
                                                        ? 'Reopen'
                                                        : 'Mark complete'}
                                                </Button>

                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => deleteTask(task.id)}
                                                >
                                                    Remove
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Recent alerts</CardTitle>
                            <CardDescription>
                                Reminder and escalation history generated by the scheduler.
                            </CardDescription>
                        </CardHeader>

                        <CardContent className="space-y-3">
                            {alerts.length === 0 && (
                                <div className="rounded-lg border border-dashed px-4 py-6 text-sm text-muted-foreground">
                                    No alerts recorded yet.
                                </div>
                            )}

                            {alerts.map((alert) => (
                                <div key={alert.id} className="rounded-lg border px-4 py-3">
                                    <div className="space-y-2">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <Badge
                                                variant="outline"
                                                className={statusBadgeClass(
                                                    alert.acknowledged_at ? 'submitted' : 'overdue',
                                                )}
                                            >
                                                {alert.alert_type_label}
                                            </Badge>
                                            <p className="text-xs text-muted-foreground">
                                                {formatDate(alert.scheduled_for)}
                                            </p>
                                        </div>

                                        <p className="text-sm text-muted-foreground">
                                            {alert.message}
                                        </p>

                                        <p className="text-xs text-muted-foreground">
                                            {alert.deadline_type} • reference {formatDate(alert.reference_date)}
                                        </p>

                                        {alert.acknowledged_at ? (
                                            <p className="text-xs text-muted-foreground">
                                                Acknowledged by {alert.acknowledged_by ?? 'Unknown'} on {formatDateTime(alert.acknowledged_at)}
                                            </p>
                                        ) : (
                                            alert.can_acknowledge && (
                                                <Button size="sm" asChild>
                                                    <Link
                                                        href={ComplianceAlertController.acknowledge(alert.id)}
                                                        method="patch"
                                                        as="button"
                                                    >
                                                        Acknowledge
                                                    </Link>
                                                </Button>
                                            )
                                        )}
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    <RecordAttachmentsCard
                        attachments={attachments}
                        attachableType="compliance_record"
                        attachableId={complianceRecord.id}
                        canUpload={complianceRecord.can.upload_attachments}
                        canUnlink={complianceRecord.can.remove_attachments}
                    />
                </div>
            </div>
        </>
    );
}

ComplianceRecordsShow.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: dashboard() },
        { title: 'Compliance', href: complianceRecordsIndex() },
        { title: 'Record details', href: complianceRecordsIndex() },
    ],
};
