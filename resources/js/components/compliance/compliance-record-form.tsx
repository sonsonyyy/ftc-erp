import type { InertiaLinkProps } from '@inertiajs/react';
import { Link, useForm } from '@inertiajs/react';
import type { CheckedState } from '@radix-ui/react-checkbox';
import ComplianceRecordController from '@/actions/App/Http/Controllers/Compliance/ComplianceRecordController';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SelectInput } from '@/components/ui/select-input';
import { Textarea } from '@/components/ui/textarea';
import type {
    ComplianceRecordDetail,
    ComplianceRecordFormDefaults,
    ComplianceTemplateOption,
    SelectOption,
} from '@/types';

type Props = {
    complianceRecord?: ComplianceRecordDetail;
    defaults?: ComplianceRecordFormDefaults;
    templateOptions: ComplianceTemplateOption[];
    assignedUserOptions: SelectOption[];
    statusOptions: SelectOption[];
    recurrenceOptions: SelectOption[];
    reminderDayOptions: Array<{
        value: number;
        label: string;
    }>;
    title: string;
    description: string;
    cancelHref: NonNullable<InertiaLinkProps['href']>;
};

export function ComplianceRecordForm({
    complianceRecord,
    defaults,
    templateOptions,
    assignedUserOptions,
    statusOptions,
    recurrenceOptions,
    reminderDayOptions,
    title,
    description,
    cancelHref,
}: Props) {
    const form = useForm({
        record_no: complianceRecord?.record_no ?? defaults?.record_no ?? '',
        compliance_template_id: complianceRecord?.template?.id
            ? String(complianceRecord.template.id)
            : defaults?.compliance_template_id
              ? String(defaults.compliance_template_id)
              : '',
        title: complianceRecord?.title ?? defaults?.title ?? '',
        agency: complianceRecord?.agency ?? defaults?.agency ?? '',
        category: complianceRecord?.category ?? defaults?.category ?? '',
        description:
            complianceRecord?.description ?? defaults?.description ?? '',
        due_date: complianceRecord?.due_date ?? defaults?.due_date ?? '',
        expiry_date:
            complianceRecord?.expiry_date ?? defaults?.expiry_date ?? '',
        recurrence_unit:
            complianceRecord?.recurrence_unit ??
            defaults?.recurrence_unit ??
            'none',
        reminder_days: complianceRecord?.reminder_days ??
            defaults?.reminder_days ?? [90, 60, 30, 15, 7],
        assigned_user_id: complianceRecord?.assigned_user?.id
            ? String(complianceRecord.assigned_user.id)
            : defaults?.assigned_user_id
              ? String(defaults.assigned_user_id)
              : '',
        status: complianceRecord?.status ?? defaults?.status ?? 'draft',
        notes: complianceRecord?.notes ?? defaults?.notes ?? '',
    });

    const selectedTemplate = templateOptions.find(
        (option) => String(option.value) === form.data.compliance_template_id,
    );
    const selectedAssignedUser = assignedUserOptions.find(
        (option) => String(option.value) === form.data.assigned_user_id,
    );

    function handleTemplateChange(templateId: string) {
        form.setData('compliance_template_id', templateId);

        if (templateId === '') {
            return;
        }

        const template = templateOptions.find(
            (option) => String(option.value) === templateId,
        );

        if (!template) {
            return;
        }

        form.setData((data) => ({
            ...data,
            title: data.title === '' ? template.name : data.title,
            agency: template.agency,
            category: template.category ?? '',
            description:
                data.description === ''
                    ? (template.description ?? '')
                    : data.description,
            recurrence_unit: template.default_recurrence_unit,
            reminder_days: template.default_reminder_days,
        }));
    }

    function toggleReminderDay(day: number, checked: CheckedState) {
        const nextReminderDays =
            checked === true
                ? [...form.data.reminder_days, day]
                : form.data.reminder_days.filter((value) => value !== day);

        form.setData(
            'reminder_days',
            Array.from(new Set(nextReminderDays)).sort(
                (left, right) => right - left,
            ),
        );
    }

    function submit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

        form.transform((data) => ({
            record_no: data.record_no,
            compliance_template_id:
                data.compliance_template_id === ''
                    ? null
                    : Number(data.compliance_template_id),
            title: data.title,
            agency: data.agency,
            category: data.category || null,
            description: data.description || null,
            due_date: data.due_date || null,
            expiry_date: data.expiry_date || null,
            recurrence_unit: data.recurrence_unit,
            reminder_days: data.reminder_days,
            assigned_user_id:
                data.assigned_user_id === ''
                    ? null
                    : Number(data.assigned_user_id),
            status: data.status,
            notes: data.notes || null,
        }));

        if (complianceRecord) {
            form.submit(
                ComplianceRecordController.update(complianceRecord.id),
                {
                    preserveScroll: true,
                },
            );

            return;
        }

        form.submit(ComplianceRecordController.store(), {
            preserveScroll: true,
        });
    }

    return (
        <div className="space-y-6">
            <Heading title={title} description={description} />

            <form
                onSubmit={submit}
                className="grid gap-6 xl:grid-cols-[2fr_1fr]"
            >
                <Card>
                    <CardHeader>
                        <CardTitle>Compliance details</CardTitle>
                        <CardDescription>
                            Track the filing, renewal, or permit record that the
                            compliance team needs to monitor.
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="grid gap-5 md:grid-cols-2">
                        <div className="grid gap-2">
                            <Label htmlFor="record_no">Record number</Label>
                            <Input
                                id="record_no"
                                value={form.data.record_no}
                                onChange={(event) =>
                                    form.setData(
                                        'record_no',
                                        event.currentTarget.value,
                                    )
                                }
                                placeholder="CMP-2026-0001"
                            />
                            <InputError message={form.errors.record_no} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="compliance_template_id">
                                Template
                            </Label>
                            <SelectInput
                                id="compliance_template_id"
                                value={form.data.compliance_template_id}
                                onChange={(event) =>
                                    handleTemplateChange(
                                        event.currentTarget.value,
                                    )
                                }
                                className="h-9 rounded-md border border-input bg-transparent px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                            >
                                <option value="">Custom record</option>
                                {templateOptions.map((option) => (
                                    <option
                                        key={option.value}
                                        value={option.value}
                                    >
                                        {option.label}
                                    </option>
                                ))}
                            </SelectInput>
                            <InputError
                                message={form.errors.compliance_template_id}
                            />
                        </div>

                        <div className="grid gap-2 md:col-span-2">
                            <Label htmlFor="title">Title</Label>
                            <Input
                                id="title"
                                value={form.data.title}
                                onChange={(event) =>
                                    form.setData(
                                        'title',
                                        event.currentTarget.value,
                                    )
                                }
                                placeholder="2026 GIS Filing"
                            />
                            <InputError message={form.errors.title} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="agency">Agency</Label>
                            <Input
                                id="agency"
                                value={form.data.agency}
                                onChange={(event) =>
                                    form.setData(
                                        'agency',
                                        event.currentTarget.value,
                                    )
                                }
                                placeholder="SEC"
                            />
                            <InputError message={form.errors.agency} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="category">Category</Label>
                            <Input
                                id="category"
                                value={form.data.category}
                                onChange={(event) =>
                                    form.setData(
                                        'category',
                                        event.currentTarget.value,
                                    )
                                }
                                placeholder="Corporate Filing"
                            />
                            <InputError message={form.errors.category} />
                        </div>

                        <div className="grid gap-2 md:col-span-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                value={form.data.description}
                                onChange={(event) =>
                                    form.setData(
                                        'description',
                                        event.currentTarget.value,
                                    )
                                }
                                placeholder="Describe the filing or permit requirement."
                            />
                            <InputError message={form.errors.description} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="due_date">Due date</Label>
                            <Input
                                id="due_date"
                                type="date"
                                value={form.data.due_date ?? ''}
                                onChange={(event) =>
                                    form.setData(
                                        'due_date',
                                        event.currentTarget.value,
                                    )
                                }
                            />
                            <InputError message={form.errors.due_date} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="expiry_date">Expiry date</Label>
                            <Input
                                id="expiry_date"
                                type="date"
                                value={form.data.expiry_date ?? ''}
                                onChange={(event) =>
                                    form.setData(
                                        'expiry_date',
                                        event.currentTarget.value,
                                    )
                                }
                            />
                            <InputError message={form.errors.expiry_date} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="recurrence_unit">Recurrence</Label>
                            <SelectInput
                                id="recurrence_unit"
                                value={form.data.recurrence_unit}
                                onChange={(event) =>
                                    form.setData(
                                        'recurrence_unit',
                                        event.currentTarget.value,
                                    )
                                }
                                className="h-9 rounded-md border border-input bg-transparent px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                            >
                                {recurrenceOptions.map((option) => (
                                    <option
                                        key={option.value}
                                        value={option.value}
                                    >
                                        {option.label}
                                    </option>
                                ))}
                            </SelectInput>
                            <InputError message={form.errors.recurrence_unit} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="assigned_user_id">
                                Responsible user
                            </Label>
                            <SelectInput
                                id="assigned_user_id"
                                value={form.data.assigned_user_id}
                                onChange={(event) =>
                                    form.setData(
                                        'assigned_user_id',
                                        event.currentTarget.value,
                                    )
                                }
                                className="h-9 rounded-md border border-input bg-transparent px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                            >
                                <option value="">Unassigned</option>
                                {assignedUserOptions.map((option) => (
                                    <option
                                        key={option.value}
                                        value={option.value}
                                    >
                                        {option.label}
                                    </option>
                                ))}
                            </SelectInput>
                            <InputError
                                message={form.errors.assigned_user_id}
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="status">Status</Label>
                            <SelectInput
                                id="status"
                                value={form.data.status}
                                onChange={(event) =>
                                    form.setData(
                                        'status',
                                        event.currentTarget.value,
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
                            </SelectInput>
                            <InputError message={form.errors.status} />
                        </div>

                        <div className="grid gap-2 md:col-span-2">
                            <div className="space-y-1">
                                <Label>Reminder schedule</Label>
                                <p className="text-sm text-muted-foreground">
                                    Upcoming reminders generate alerts before
                                    the due or expiry date.
                                </p>
                            </div>

                            <div className="grid gap-3 md:grid-cols-3">
                                {reminderDayOptions.map((option) => (
                                    <label
                                        key={option.value}
                                        className="flex items-center gap-3 rounded-lg border px-3 py-2"
                                    >
                                        <Checkbox
                                            checked={form.data.reminder_days.includes(
                                                option.value,
                                            )}
                                            onCheckedChange={(checked) =>
                                                toggleReminderDay(
                                                    option.value,
                                                    checked,
                                                )
                                            }
                                        />
                                        <span className="text-sm">
                                            {option.label}
                                        </span>
                                    </label>
                                ))}
                            </div>

                            <InputError message={form.errors.reminder_days} />
                        </div>

                        <div className="grid gap-2 md:col-span-2">
                            <Label htmlFor="notes">Notes</Label>
                            <Textarea
                                id="notes"
                                value={form.data.notes}
                                onChange={(event) =>
                                    form.setData(
                                        'notes',
                                        event.currentTarget.value,
                                    )
                                }
                                placeholder="Internal notes, missing requirements, or filing context."
                            />
                            <InputError message={form.errors.notes} />
                        </div>
                    </CardContent>
                </Card>

                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Quick context</CardTitle>
                            <CardDescription>
                                A practical summary so office users can confirm
                                the record before saving.
                            </CardDescription>
                        </CardHeader>

                        <CardContent className="space-y-4">
                            <div>
                                <p className="text-sm text-muted-foreground">
                                    Template
                                </p>
                                <p className="mt-1 font-medium">
                                    {selectedTemplate?.label ?? 'Custom record'}
                                </p>
                            </div>

                            <div>
                                <p className="text-sm text-muted-foreground">
                                    Responsible user
                                </p>
                                <p className="mt-1 font-medium">
                                    {selectedAssignedUser?.label ??
                                        'Unassigned'}
                                </p>
                            </div>

                            <div>
                                <p className="text-sm text-muted-foreground">
                                    Next due date
                                </p>
                                <p className="mt-1 font-medium">
                                    {form.data.due_date || 'Not set'}
                                </p>
                            </div>

                            <div>
                                <p className="text-sm text-muted-foreground">
                                    Next expiry date
                                </p>
                                <p className="mt-1 font-medium">
                                    {form.data.expiry_date || 'Not set'}
                                </p>
                            </div>

                            <div>
                                <p className="text-sm text-muted-foreground">
                                    Reminders
                                </p>
                                <p className="mt-1 font-medium">
                                    {form.data.reminder_days.length > 0
                                        ? form.data.reminder_days.join(', ') +
                                          ' days'
                                        : 'No reminders selected'}
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="flex gap-3">
                        <Button type="submit" disabled={form.processing}>
                            {complianceRecord
                                ? 'Save changes'
                                : 'Create record'}
                        </Button>

                        <Button variant="outline" asChild>
                            <Link href={cancelHref}>Cancel</Link>
                        </Button>
                    </div>
                </div>
            </form>
        </div>
    );
}
