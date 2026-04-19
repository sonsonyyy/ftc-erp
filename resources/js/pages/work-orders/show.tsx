import { Head, Link, useForm } from '@inertiajs/react';
import WorkOrderController from '@/actions/App/Http/Controllers/WorkOrders/WorkOrderController';
import { dashboard } from '@/routes';
import { show as customersShow } from '@/routes/customers';
import { show as projectsShow } from '@/routes/projects';
import { show as quotationsShow } from '@/routes/quotations';
import { show as sitesShow } from '@/routes/sites';
import { edit as workOrdersEdit, index as workOrdersIndex } from '@/routes/work-orders';
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
import type { SelectOption, WorkOrderDetail } from '@/types';

type Props = {
    workOrder: WorkOrderDetail;
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

function priorityBadgeClass(priority: string): string {
    return {
        low: 'border-slate-200 bg-slate-100 text-slate-700',
        normal: 'border-sky-200 bg-sky-50 text-sky-700',
        high: 'border-amber-200 bg-amber-50 text-amber-700',
        urgent: 'border-rose-200 bg-rose-50 text-rose-700',
    }[priority] ?? 'border-slate-200 bg-slate-100 text-slate-700';
}

function statusBadgeClass(status: string): string {
    return {
        draft: 'border-slate-200 bg-slate-100 text-slate-700',
        scheduled: 'border-sky-200 bg-sky-50 text-sky-700',
        in_progress: 'border-amber-200 bg-amber-50 text-amber-700',
        for_review: 'border-orange-200 bg-orange-50 text-orange-700',
        completed: 'border-emerald-200 bg-emerald-50 text-emerald-700',
        closed: 'border-stone-200 bg-stone-100 text-stone-700',
        cancelled: 'border-rose-200 bg-rose-50 text-rose-700',
    }[status] ?? 'border-slate-200 bg-slate-100 text-slate-700';
}

export default function WorkOrdersShow({ workOrder, statusOptions, userOptions }: Props) {
    const statusForm = useForm({
        status: workOrder.status,
        details: '',
        completion_date: workOrder.completion_date ?? '',
    });
    const assignmentForm = useForm({
        user_id: '',
        assignment_role: '',
        notes: '',
    });
    const noteForm = useForm({
        details: '',
    });
    const materialForm = useForm({
        item_code: '',
        item_name: '',
        quantity: '1',
        unit: '',
        notes: '',
    });

    function submitStatus(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

        statusForm.transform((data) => ({
            status: data.status,
            details: data.details || null,
            completion_date: data.completion_date || null,
        }));

        statusForm.submit(WorkOrderController.updateStatus(workOrder.id), {
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

        assignmentForm.submit(WorkOrderController.storeAssignment(workOrder.id), {
            preserveScroll: true,
            onSuccess: () => {
                assignmentForm.reset();
            },
        });
    }

    function submitNote(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

        noteForm.transform((data) => ({
            details: data.details,
        }));

        noteForm.submit(WorkOrderController.storeLog(workOrder.id), {
            preserveScroll: true,
            onSuccess: () => {
                noteForm.reset();
            },
        });
    }

    function submitMaterial(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

        materialForm.transform((data) => ({
            item_code: data.item_code || null,
            item_name: data.item_name,
            quantity: Number(data.quantity),
            unit: data.unit || null,
            notes: data.notes || null,
        }));

        materialForm.submit(WorkOrderController.storeMaterial(workOrder.id), {
            preserveScroll: true,
            onSuccess: () => {
                materialForm.reset();
                materialForm.setData('quantity', '1');
            },
        });
    }

    return (
        <>
            <Head title={workOrder.work_order_no} />

            <div className="flex flex-1 flex-col gap-6 p-4">
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                            <h1 className="text-2xl font-semibold tracking-tight">
                                {workOrder.work_order_no}
                            </h1>
                            <Badge
                                variant="outline"
                                className={statusBadgeClass(workOrder.status)}
                            >
                                {workOrder.status_label}
                            </Badge>
                            <Badge
                                variant="outline"
                                className={priorityBadgeClass(workOrder.priority)}
                            >
                                {workOrder.priority_label}
                            </Badge>
                        </div>

                        <p className="text-sm text-muted-foreground">{workOrder.summary}</p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        {workOrder.customer.id && (
                            <Button variant="outline" asChild>
                                <Link href={customersShow(workOrder.customer.id)}>View customer</Link>
                            </Button>
                        )}

                        {workOrder.can.update && (
                            <Button asChild>
                                <Link href={workOrdersEdit(workOrder.id)}>Edit work order</Link>
                            </Button>
                        )}

                        {workOrder.can.delete && (
                            <Button variant="outline" asChild>
                                <Link href={WorkOrderController.destroy(workOrder.id)} method="delete" as="button">
                                    Archive
                                </Link>
                            </Button>
                        )}
                    </div>
                </div>

                <div className="grid gap-4 md:grid-cols-4">
                    <Card>
                        <CardHeader>
                            <CardDescription>Service type</CardDescription>
                            <CardTitle className="text-base">{workOrder.service_type_label}</CardTitle>
                        </CardHeader>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardDescription>Scheduled date</CardDescription>
                            <CardTitle className="text-base">{formatDate(workOrder.scheduled_date)}</CardTitle>
                        </CardHeader>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardDescription>Completion date</CardDescription>
                            <CardTitle className="text-base">{formatDate(workOrder.completion_date)}</CardTitle>
                        </CardHeader>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardDescription>Attachments</CardDescription>
                            <CardTitle>{workOrder.attachment_count}</CardTitle>
                        </CardHeader>
                    </Card>
                </div>

                <div className="grid gap-6 xl:grid-cols-[1.55fr_1fr]">
                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Work order information</CardTitle>
                                <CardDescription>
                                    The main service record that operations, technicians, and office staff will keep current.
                                </CardDescription>
                            </CardHeader>

                            <CardContent className="grid gap-5 md:grid-cols-2">
                                <div>
                                    <p className="text-sm text-muted-foreground">Customer</p>
                                    {workOrder.customer.id ? (
                                        <Link
                                            href={customersShow(workOrder.customer.id)}
                                            className="mt-1 inline-flex font-medium hover:underline"
                                        >
                                            {workOrder.customer.customer_code} - {workOrder.customer.company_name}
                                        </Link>
                                    ) : (
                                        <p className="mt-1 font-medium">Not linked</p>
                                    )}
                                </div>

                                <div>
                                    <p className="text-sm text-muted-foreground">Site</p>
                                    {workOrder.site.id ? (
                                        <Link
                                            href={sitesShow(workOrder.site.id)}
                                            className="mt-1 inline-flex font-medium hover:underline"
                                        >
                                            {workOrder.site.site_name}
                                            {workOrder.site.site_code && ` (${workOrder.site.site_code})`}
                                        </Link>
                                    ) : (
                                        <p className="mt-1 font-medium">Not linked</p>
                                    )}
                                </div>

                                <div>
                                    <p className="text-sm text-muted-foreground">Project</p>
                                    {workOrder.project.id ? (
                                        <Link
                                            href={projectsShow(workOrder.project.id)}
                                            className="mt-1 inline-flex font-medium hover:underline"
                                        >
                                            {workOrder.project.project_no}
                                        </Link>
                                    ) : (
                                        <p className="mt-1 font-medium">No project linked</p>
                                    )}
                                </div>

                                <div>
                                    <p className="text-sm text-muted-foreground">Awarded quotation</p>
                                    {workOrder.quotation.id ? (
                                        <Link
                                            href={quotationsShow(workOrder.quotation.id)}
                                            className="mt-1 inline-flex font-medium hover:underline"
                                        >
                                            {workOrder.quotation.quotation_no}
                                        </Link>
                                    ) : (
                                        <p className="mt-1 font-medium">No quotation linked</p>
                                    )}
                                </div>

                                <div className="md:col-span-2">
                                    <p className="text-sm text-muted-foreground">Site address</p>
                                    <p className="mt-1 whitespace-pre-line font-medium">
                                        {workOrder.site.address ??
                                            ([workOrder.site.city, workOrder.site.province].filter(Boolean).join(', ') ||
                                                'Not set')}
                                    </p>
                                </div>

                                <div className="md:col-span-2">
                                    <p className="text-sm text-muted-foreground">Findings / notes</p>
                                    <p className="mt-1 whitespace-pre-line font-medium">
                                        {workOrder.findings ?? 'No findings recorded'}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Activity log</CardTitle>
                                <CardDescription>
                                    Status movement and operational notes are recorded here in time order.
                                </CardDescription>
                            </CardHeader>

                            <CardContent className="space-y-3">
                                {(workOrder.logs ?? []).length === 0 && (
                                    <div className="rounded-lg border border-dashed px-4 py-6 text-sm text-muted-foreground">
                                        No activity recorded yet.
                                    </div>
                                )}

                                {(workOrder.logs ?? []).map((log) => (
                                    <div key={log.id} className="rounded-lg border px-4 py-3">
                                        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <Badge variant="outline">{log.log_type_label}</Badge>
                                                {log.to_status_label && (
                                                    <Badge
                                                        variant="outline"
                                                        className={statusBadgeClass(log.to_status ?? workOrder.status)}
                                                    >
                                                        {log.to_status_label}
                                                    </Badge>
                                                )}
                                            </div>

                                            <p className="text-sm text-muted-foreground">
                                                {formatDateTime(log.logged_at)}
                                            </p>
                                        </div>

                                        <div className="mt-3 space-y-1 text-sm">
                                            <p className="text-muted-foreground">
                                                Recorded by:{' '}
                                                <span className="font-medium text-foreground">
                                                    {log.logged_by ?? 'System'}
                                                </span>
                                            </p>
                                            <p className="whitespace-pre-line text-muted-foreground">
                                                {log.details ?? 'No details'}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Materials</CardTitle>
                                <CardDescription>
                                    Track planned or actual material lines linked to this work order.
                                </CardDescription>
                            </CardHeader>

                            <CardContent className="space-y-3">
                                {(workOrder.materials ?? []).length === 0 && (
                                    <div className="rounded-lg border border-dashed px-4 py-6 text-sm text-muted-foreground">
                                        No materials recorded yet.
                                    </div>
                                )}

                                {(workOrder.materials ?? []).map((material) => (
                                    <div key={material.id} className="rounded-lg border px-4 py-3">
                                        <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                                            <div className="space-y-1">
                                                <p className="font-medium">{material.item_name}</p>
                                                <p className="text-sm text-muted-foreground">
                                                    {material.quantity} {material.unit ?? ''}
                                                    {material.item_code && ` • ${material.item_code}`}
                                                </p>
                                                <p className="whitespace-pre-line text-sm text-muted-foreground">
                                                    {material.notes ?? 'No notes'}
                                                </p>
                                            </div>

                                            {workOrder.can.manage_materials && (
                                                    <Button variant="outline" size="sm" asChild>
                                                        <Link
                                                            href={WorkOrderController.destroyMaterial({
                                                                work_order: workOrder.id,
                                                                material: material.id,
                                                            })}
                                                            method="delete"
                                                            as="button"
                                                        >
                                                        Remove
                                                    </Link>
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    </div>

                    <div className="space-y-6">
                        {workOrder.can.change_status && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Update status</CardTitle>
                                    <CardDescription>
                                        Record the next work order status transition and any closing notes.
                                    </CardDescription>
                                </CardHeader>

                                <CardContent>
                                    <form onSubmit={submitStatus} className="space-y-4">
                                        <div className="grid gap-2">
                                            <Label htmlFor="status">Next status</Label>
                                            <select
                                                id="status"
                                                value={statusForm.data.status}
                                                onChange={(event) =>
                                                    statusForm.setData('status', event.currentTarget.value)
                                                }
                                                className="border-input focus-visible:border-ring focus-visible:ring-ring/50 h-9 rounded-md border bg-transparent px-3 text-sm outline-none focus-visible:ring-[3px]"
                                            >
                                                {statusOptions.map((option) => (
                                                    <option key={option.value} value={option.value}>
                                                        {option.label}
                                                    </option>
                                                ))}
                                            </select>
                                            <InputError message={statusForm.errors.status} />
                                        </div>

                                        <div className="grid gap-2">
                                            <Label htmlFor="completion_date">Completion date</Label>
                                            <Input
                                                id="completion_date"
                                                type="date"
                                                value={statusForm.data.completion_date}
                                                onChange={(event) =>
                                                    statusForm.setData(
                                                        'completion_date',
                                                        event.currentTarget.value,
                                                    )
                                                }
                                            />
                                            <InputError message={statusForm.errors.completion_date} />
                                        </div>

                                        <div className="grid gap-2">
                                            <Label htmlFor="details">Details</Label>
                                            <Textarea
                                                id="details"
                                                value={statusForm.data.details}
                                                onChange={(event) =>
                                                    statusForm.setData('details', event.currentTarget.value)
                                                }
                                                rows={4}
                                            />
                                            <InputError message={statusForm.errors.details} />
                                        </div>

                                        <Button className="w-full" disabled={statusForm.processing}>
                                            {statusForm.processing ? 'Saving status...' : 'Update status'}
                                        </Button>
                                    </form>
                                </CardContent>
                            </Card>
                        )}

                        <Card>
                            <CardHeader>
                                <CardTitle>Assignments</CardTitle>
                                <CardDescription>
                                    Keep the active service team and coordination owner visible.
                                </CardDescription>
                            </CardHeader>

                            <CardContent className="space-y-4">
                                {workOrder.can.manage_assignments && (
                                    <form onSubmit={submitAssignment} className="space-y-3">
                                        <div className="grid gap-2">
                                            <Label htmlFor="user_id">Assigned user</Label>
                                            <select
                                                id="user_id"
                                                value={assignmentForm.data.user_id}
                                                onChange={(event) =>
                                                    assignmentForm.setData('user_id', event.currentTarget.value)
                                                }
                                                className="border-input focus-visible:border-ring focus-visible:ring-ring/50 h-9 rounded-md border bg-transparent px-3 text-sm outline-none focus-visible:ring-[3px]"
                                            >
                                                <option value="">Select user</option>
                                                {userOptions.map((option) => (
                                                    <option key={option.value} value={option.value}>
                                                        {option.label}
                                                    </option>
                                                ))}
                                            </select>
                                            <InputError message={assignmentForm.errors.user_id} />
                                        </div>

                                        <div className="grid gap-2">
                                            <Label htmlFor="assignment_role">Role</Label>
                                            <Input
                                                id="assignment_role"
                                                value={assignmentForm.data.assignment_role}
                                                onChange={(event) =>
                                                    assignmentForm.setData(
                                                        'assignment_role',
                                                        event.currentTarget.value,
                                                    )
                                                }
                                                placeholder="Lead technician"
                                            />
                                            <InputError message={assignmentForm.errors.assignment_role} />
                                        </div>

                                        <div className="grid gap-2">
                                            <Label htmlFor="assignment_notes">Notes</Label>
                                            <Textarea
                                                id="assignment_notes"
                                                value={assignmentForm.data.notes}
                                                onChange={(event) =>
                                                    assignmentForm.setData('notes', event.currentTarget.value)
                                                }
                                                rows={3}
                                            />
                                            <InputError message={assignmentForm.errors.notes} />
                                        </div>

                                        <Button className="w-full" disabled={assignmentForm.processing}>
                                            {assignmentForm.processing ? 'Saving assignment...' : 'Save assignment'}
                                        </Button>
                                    </form>
                                )}

                                <div className="space-y-3">
                                    {(workOrder.assignments ?? []).length === 0 && (
                                        <div className="rounded-lg border border-dashed px-4 py-6 text-sm text-muted-foreground">
                                            No team assignments recorded yet.
                                        </div>
                                    )}

                                    {(workOrder.assignments ?? []).map((assignment) => (
                                        <div key={assignment.id} className="rounded-lg border px-4 py-3">
                                            <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                                                <div className="space-y-1">
                                                    <p className="font-medium">{assignment.user.name ?? 'Unknown user'}</p>
                                                    <p className="text-sm text-muted-foreground">
                                                        {assignment.assignment_role ?? 'No role specified'}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">
                                                        Assigned: {formatDateTime(assignment.assigned_at)}
                                                    </p>
                                                </div>

                                                {workOrder.can.manage_assignments && (
                                                    <Button variant="outline" size="sm" asChild>
                                                        <Link
                                                            href={WorkOrderController.destroyAssignment({
                                                                work_order: workOrder.id,
                                                                assignment: assignment.id,
                                                            })}
                                                            method="delete"
                                                            as="button"
                                                        >
                                                            Remove
                                                        </Link>
                                                    </Button>
                                                )}
                                            </div>

                                            <p className="mt-3 whitespace-pre-line text-sm text-muted-foreground">
                                                {assignment.notes ?? 'No notes'}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        {workOrder.can.manage_logs && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Add note</CardTitle>
                                    <CardDescription>
                                        Record technician or office notes without changing status.
                                    </CardDescription>
                                </CardHeader>

                                <CardContent>
                                    <form onSubmit={submitNote} className="space-y-4">
                                        <div className="grid gap-2">
                                            <Label htmlFor="note_details">Note</Label>
                                            <Textarea
                                                id="note_details"
                                                value={noteForm.data.details}
                                                onChange={(event) => noteForm.setData('details', event.currentTarget.value)}
                                                rows={4}
                                            />
                                            <InputError message={noteForm.errors.details} />
                                        </div>

                                        <Button className="w-full" disabled={noteForm.processing}>
                                            {noteForm.processing ? 'Saving note...' : 'Save note'}
                                        </Button>
                                    </form>
                                </CardContent>
                            </Card>
                        )}

                        {workOrder.can.manage_materials && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Add material</CardTitle>
                                    <CardDescription>
                                        Capture planned or actual material usage one line at a time.
                                    </CardDescription>
                                </CardHeader>

                                <CardContent>
                                    <form onSubmit={submitMaterial} className="space-y-4">
                                        <div className="grid gap-2">
                                            <Label htmlFor="item_code">Item code</Label>
                                            <Input
                                                id="item_code"
                                                value={materialForm.data.item_code}
                                                onChange={(event) => materialForm.setData('item_code', event.currentTarget.value)}
                                            />
                                            <InputError message={materialForm.errors.item_code} />
                                        </div>

                                        <div className="grid gap-2">
                                            <Label htmlFor="item_name">Item name</Label>
                                            <Input
                                                id="item_name"
                                                value={materialForm.data.item_name}
                                                onChange={(event) => materialForm.setData('item_name', event.currentTarget.value)}
                                            />
                                            <InputError message={materialForm.errors.item_name} />
                                        </div>

                                        <div className="grid gap-2 md:grid-cols-[1fr_1fr]">
                                            <div className="grid gap-2">
                                                <Label htmlFor="quantity">Quantity</Label>
                                                <Input
                                                    id="quantity"
                                                    type="number"
                                                    min="0.01"
                                                    step="0.01"
                                                    value={materialForm.data.quantity}
                                                    onChange={(event) => materialForm.setData('quantity', event.currentTarget.value)}
                                                />
                                                <InputError message={materialForm.errors.quantity} />
                                            </div>

                                            <div className="grid gap-2">
                                                <Label htmlFor="unit">Unit</Label>
                                                <Input
                                                    id="unit"
                                                    value={materialForm.data.unit}
                                                    onChange={(event) => materialForm.setData('unit', event.currentTarget.value)}
                                                />
                                                <InputError message={materialForm.errors.unit} />
                                            </div>
                                        </div>

                                        <div className="grid gap-2">
                                            <Label htmlFor="material_notes">Notes</Label>
                                            <Textarea
                                                id="material_notes"
                                                value={materialForm.data.notes}
                                                onChange={(event) => materialForm.setData('notes', event.currentTarget.value)}
                                                rows={3}
                                            />
                                            <InputError message={materialForm.errors.notes} />
                                        </div>

                                        <Button className="w-full" disabled={materialForm.processing}>
                                            {materialForm.processing ? 'Saving material...' : 'Add material'}
                                        </Button>
                                    </form>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>

                <RecordAttachmentsCard
                    attachments={workOrder.attachments ?? []}
                    attachableType="work_order"
                    attachableId={workOrder.id}
                    canUpload={workOrder.can.upload_attachments}
                    canUnlink={workOrder.can.remove_attachments}
                />
            </div>
        </>
    );
}

WorkOrdersShow.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: dashboard() },
        { title: 'Work Orders', href: workOrdersIndex() },
        { title: 'Work order details', href: workOrdersIndex() },
    ],
};
