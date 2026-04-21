<?php

namespace App\Http\Controllers\Compliance;

use App\Enums\ComplianceRecordStatus;
use App\Enums\ComplianceRecurrenceUnit;
use App\Enums\ComplianceTaskStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\Compliance\StoreComplianceRecordRequest;
use App\Http\Requests\Compliance\UpdateComplianceRecordRequest;
use App\Models\Attachment;
use App\Models\ComplianceAlert;
use App\Models\ComplianceRecord;
use App\Models\ComplianceSubmission;
use App\Models\ComplianceTask;
use App\Models\ComplianceTemplate;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ComplianceRecordController extends Controller
{
    private const PER_PAGE = 15;

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', ComplianceRecord::class);

        $search = $request->string('search')->toString();
        $status = $request->string('status')->toString();
        $agency = $request->string('agency')->toString();
        $assigned = $request->integer('assigned');
        $today = now();
        $canViewAlerts = $request->user()?->can('viewAny', ComplianceAlert::class) ?? false;

        $complianceRecords = ComplianceRecord::query()
            ->with([
                'assignedUser:id,name',
                'complianceTemplate:id,name',
            ])
            ->withCount([
                'attachments',
                'submissions',
                'alerts as open_alert_count' => fn ($query) => $query->unacknowledged(),
            ])
            ->search($search)
            ->displayStatus($status, $today)
            ->agency($agency)
            ->assignedTo($assigned > 0 ? $assigned : null)
            ->orderByRaw('COALESCE(due_date, expiry_date) asc nulls last')
            ->orderBy('id')
            ->paginate(self::PER_PAGE)
            ->withQueryString()
            ->through(fn (ComplianceRecord $complianceRecord) => $this->recordListItem($request, $complianceRecord));

        return Inertia::render('compliance-records/index', [
            'complianceRecords' => $complianceRecords,
            'filters' => [
                'search' => $search,
                'status' => $status,
                'agency' => $agency,
                'assigned' => $assigned > 0 ? $assigned : null,
            ],
            'summary' => [
                'due_soon_count' => ComplianceRecord::query()
                    ->displayStatus(ComplianceRecordStatus::DueSoon->value, $today)
                    ->count(),
                'for_renewal_count' => ComplianceRecord::query()
                    ->displayStatus(ComplianceRecordStatus::ForRenewal->value, $today)
                    ->count(),
                'overdue_count' => ComplianceRecord::query()
                    ->displayStatus(ComplianceRecordStatus::Overdue->value, $today)
                    ->count(),
                'expired_count' => ComplianceRecord::query()
                    ->displayStatus(ComplianceRecordStatus::Expired->value, $today)
                    ->count(),
                'open_alert_count' => $canViewAlerts
                    ? ComplianceAlert::query()->unacknowledged()->count()
                    : null,
            ],
            'recentAlerts' => $canViewAlerts ? $this->recentAlertItems() : [],
            'statusOptions' => $this->statusOptions(),
            'agencyOptions' => $this->agencyOptions(),
            'assignedUserOptions' => $this->assignedUserOptions(),
            'can' => [
                'create' => $request->user()?->can('create', ComplianceRecord::class) ?? false,
                'view_alerts' => $canViewAlerts,
            ],
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(): Response
    {
        $this->authorize('create', ComplianceRecord::class);

        return Inertia::render('compliance-records/create', [
            'templateOptions' => $this->templateOptions(),
            'assignedUserOptions' => $this->assignedUserOptions(),
            'statusOptions' => $this->statusOptions(),
            'recurrenceOptions' => $this->recurrenceOptions(),
            'reminderDayOptions' => $this->reminderDayOptions(),
            'defaults' => [
                'record_no' => 'CMP-'.now()->format('YmdHis'),
                'compliance_template_id' => null,
                'title' => '',
                'agency' => '',
                'category' => '',
                'description' => '',
                'due_date' => null,
                'expiry_date' => null,
                'recurrence_unit' => ComplianceRecurrenceUnit::None->value,
                'reminder_days' => [90, 60, 30, 15, 7],
                'assigned_user_id' => null,
                'status' => ComplianceRecordStatus::Draft->value,
                'notes' => '',
            ],
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreComplianceRecordRequest $request): RedirectResponse
    {
        $this->authorize('create', ComplianceRecord::class);

        $complianceRecord = ComplianceRecord::query()->create([
            ...$request->safe()->except('reminder_days'),
            'reminder_days' => $this->normalizeReminderDays($request->input('reminder_days', [])),
        ]);

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => __('Compliance record created.'),
        ]);

        return to_route('compliance-records.show', $complianceRecord);
    }

    /**
     * Display the specified resource.
     */
    public function show(Request $request, ComplianceRecord $complianceRecord): Response
    {
        $this->authorize('view', $complianceRecord);

        $complianceRecord->load([
            'complianceTemplate:id,name,agency,category,description,default_recurrence_unit,default_reminder_days',
            'assignedUser:id,name',
            'tasks.assignedUser:id,name',
            'submissions.submittedBy:id,name',
            'alerts' => fn ($query) => $query
                ->with('acknowledgedBy:id,name')
                ->orderByDesc('scheduled_for')
                ->orderByDesc('id')
                ->limit(15),
            'attachments.uploadedBy:id,name',
        ])->loadCount([
            'attachments',
            'submissions',
            'tasks',
            'alerts as open_alert_count' => fn ($query) => $query->unacknowledged(),
        ]);

        return Inertia::render('compliance-records/show', [
            'complianceRecord' => $this->recordDetail($request, $complianceRecord),
            'assignedUserOptions' => $this->assignedUserOptions([
                $complianceRecord->assigned_user_id,
                ...$complianceRecord->tasks->pluck('assigned_user_id')->all(),
            ]),
            'taskStatusOptions' => collect(ComplianceTaskStatus::cases())
                ->map(fn (ComplianceTaskStatus $status) => [
                    'value' => $status->value,
                    'label' => $status->label(),
                ])->all(),
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(ComplianceRecord $complianceRecord): Response
    {
        $this->authorize('update', $complianceRecord);

        $complianceRecord->load('complianceTemplate:id,name,agency,category,description,default_recurrence_unit,default_reminder_days');

        return Inertia::render('compliance-records/edit', [
            'complianceRecord' => [
                'id' => $complianceRecord->getKey(),
                'record_no' => $complianceRecord->record_no,
                'compliance_template_id' => $complianceRecord->compliance_template_id,
                'title' => $complianceRecord->title,
                'agency' => $complianceRecord->agency,
                'category' => $complianceRecord->category,
                'description' => $complianceRecord->description,
                'due_date' => optional($complianceRecord->due_date)?->toDateString(),
                'expiry_date' => optional($complianceRecord->expiry_date)?->toDateString(),
                'recurrence_unit' => $complianceRecord->recurrence_unit->value,
                'reminder_days' => $complianceRecord->reminder_days ?? [],
                'assigned_user_id' => $complianceRecord->assigned_user_id,
                'status' => $complianceRecord->status->value,
                'notes' => $complianceRecord->notes,
            ],
            'templateOptions' => $this->templateOptions([
                $complianceRecord->compliance_template_id,
            ]),
            'assignedUserOptions' => $this->assignedUserOptions([
                $complianceRecord->assigned_user_id,
            ]),
            'statusOptions' => $this->statusOptions(),
            'recurrenceOptions' => $this->recurrenceOptions(),
            'reminderDayOptions' => $this->reminderDayOptions(),
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(
        UpdateComplianceRecordRequest $request,
        ComplianceRecord $complianceRecord,
    ): RedirectResponse {
        $this->authorize('update', $complianceRecord);

        $complianceRecord->update([
            ...$request->safe()->except('reminder_days'),
            'reminder_days' => $this->normalizeReminderDays($request->input('reminder_days', [])),
        ]);

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => __('Compliance record updated.'),
        ]);

        return to_route('compliance-records.show', $complianceRecord);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(ComplianceRecord $complianceRecord): RedirectResponse
    {
        $this->authorize('delete', $complianceRecord);

        $complianceRecord->delete();

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => __('Compliance record archived.'),
        ]);

        return to_route('compliance-records.index');
    }

    /**
     * Transform a compliance record for index rows.
     *
     * @return array<string, mixed>
     */
    private function recordListItem(Request $request, ComplianceRecord $complianceRecord): array
    {
        $displayStatus = $complianceRecord->displayStatus();

        return [
            'id' => $complianceRecord->getKey(),
            'record_no' => $complianceRecord->record_no,
            'title' => $complianceRecord->title,
            'agency' => $complianceRecord->agency,
            'category' => $complianceRecord->category,
            'due_date' => optional($complianceRecord->due_date)?->toDateString(),
            'expiry_date' => optional($complianceRecord->expiry_date)?->toDateString(),
            'next_deadline_type' => $complianceRecord->nextDeadlineType(),
            'next_deadline_date' => optional($complianceRecord->nextDeadlineDate())?->toDateString(),
            'status' => $displayStatus->value,
            'status_label' => $displayStatus->label(),
            'assigned_user' => $complianceRecord->assignedUser?->name,
            'submission_count' => (int) ($complianceRecord->getAttribute('submissions_count') ?? 0),
            'open_alert_count' => (int) ($complianceRecord->getAttribute('open_alert_count') ?? 0),
            'attachment_count' => (int) ($complianceRecord->getAttribute('attachments_count') ?? 0),
            'can' => [
                'view' => $request->user()?->can('view', $complianceRecord) ?? false,
                'update' => $request->user()?->can('update', $complianceRecord) ?? false,
                'delete' => $request->user()?->can('delete', $complianceRecord) ?? false,
            ],
        ];
    }

    /**
     * Transform a compliance record for the show page.
     *
     * @return array<string, mixed>
     */
    private function recordDetail(Request $request, ComplianceRecord $complianceRecord): array
    {
        $displayStatus = $complianceRecord->displayStatus();

        return [
            'id' => $complianceRecord->getKey(),
            'record_no' => $complianceRecord->record_no,
            'title' => $complianceRecord->title,
            'agency' => $complianceRecord->agency,
            'category' => $complianceRecord->category,
            'description' => $complianceRecord->description,
            'due_date' => optional($complianceRecord->due_date)?->toDateString(),
            'expiry_date' => optional($complianceRecord->expiry_date)?->toDateString(),
            'next_deadline_type' => $complianceRecord->nextDeadlineType(),
            'next_deadline_date' => optional($complianceRecord->nextDeadlineDate())?->toDateString(),
            'recurrence_unit' => $complianceRecord->recurrence_unit->value,
            'recurrence_unit_label' => $complianceRecord->recurrence_unit->label(),
            'reminder_days' => $complianceRecord->reminder_days ?? [],
            'status' => $complianceRecord->status->value,
            'status_label' => $complianceRecord->status->label(),
            'display_status' => $displayStatus->value,
            'display_status_label' => $displayStatus->label(),
            'latest_submission_at' => optional($complianceRecord->latest_submission_at)?->toDateString(),
            'latest_submission_reference' => $complianceRecord->latest_submission_reference,
            'notes' => $complianceRecord->notes,
            'attachment_count' => (int) ($complianceRecord->getAttribute('attachments_count') ?? 0),
            'submission_count' => (int) ($complianceRecord->getAttribute('submissions_count') ?? 0),
            'task_count' => (int) ($complianceRecord->getAttribute('tasks_count') ?? 0),
            'open_alert_count' => (int) ($complianceRecord->getAttribute('open_alert_count') ?? 0),
            'template' => $complianceRecord->complianceTemplate === null ? null : [
                'id' => $complianceRecord->complianceTemplate->getKey(),
                'name' => $complianceRecord->complianceTemplate->name,
                'agency' => $complianceRecord->complianceTemplate->agency,
            ],
            'assigned_user' => $complianceRecord->assignedUser === null ? null : [
                'id' => $complianceRecord->assignedUser->getKey(),
                'name' => $complianceRecord->assignedUser->name,
            ],
            'tasks' => $complianceRecord->tasks
                ->map(fn (ComplianceTask $task) => [
                    'id' => $task->getKey(),
                    'title' => $task->title,
                    'due_date' => optional($task->due_date)?->toDateString(),
                    'status' => $task->status->value,
                    'status_label' => $task->status->label(),
                    'completed_at' => optional($task->completed_at)?->toIso8601String(),
                    'notes' => $task->notes,
                    'assigned_user' => $task->assignedUser === null ? null : [
                        'id' => $task->assignedUser->getKey(),
                        'name' => $task->assignedUser->name,
                    ],
                ])->all(),
            'submissions' => $complianceRecord->submissions
                ->map(fn (ComplianceSubmission $submission) => [
                    'id' => $submission->getKey(),
                    'reference_no' => $submission->reference_no,
                    'submitted_at' => optional($submission->submitted_at)?->toDateString(),
                    'due_date_snapshot' => optional($submission->due_date_snapshot)?->toDateString(),
                    'expiry_date_snapshot' => optional($submission->expiry_date_snapshot)?->toDateString(),
                    'next_due_date' => optional($submission->next_due_date)?->toDateString(),
                    'next_expiry_date' => optional($submission->next_expiry_date)?->toDateString(),
                    'remarks' => $submission->remarks,
                    'submitted_by' => $submission->submittedBy?->name,
                ])->all(),
            'alerts' => $complianceRecord->alerts
                ->map(fn (ComplianceAlert $alert) => [
                    'id' => $alert->getKey(),
                    'alert_type' => $alert->alert_type->value,
                    'alert_type_label' => $alert->alert_type->label(),
                    'deadline_type' => $alert->deadline_type,
                    'scheduled_for' => optional($alert->scheduled_for)?->toDateString(),
                    'reference_date' => optional($alert->reference_date)?->toDateString(),
                    'days_before' => (int) $alert->days_before,
                    'message' => $alert->message,
                    'acknowledged_at' => optional($alert->acknowledged_at)?->toIso8601String(),
                    'acknowledged_by' => $alert->acknowledgedBy?->name,
                    'can_acknowledge' => ($request->user()?->can('update', $alert) ?? false)
                        && $alert->acknowledged_at === null,
                ])->all(),
            'attachments' => $complianceRecord->attachments
                ->map(fn (Attachment $attachment) => $this->attachmentPayload($attachment))
                ->all(),
            'can' => [
                'update' => $request->user()?->can('update', $complianceRecord) ?? false,
                'delete' => $request->user()?->can('delete', $complianceRecord) ?? false,
                'upload_attachments' => ($request->user()?->hasPermissionTo('attachments.create') ?? false)
                    && ($request->user()?->can('update', $complianceRecord) ?? false),
                'remove_attachments' => ($request->user()?->hasPermissionTo('attachments.delete') ?? false)
                    && ($request->user()?->can('update', $complianceRecord) ?? false),
                'create_submission' => $request->user()?->can('update', $complianceRecord) ?? false,
                'create_task' => $request->user()?->can('update', $complianceRecord) ?? false,
            ],
        ];
    }

    /**
     * Build select options for status filters and forms.
     *
     * @return array<int, array{value:string,label:string}>
     */
    private function statusOptions(): array
    {
        return collect(ComplianceRecordStatus::cases())
            ->map(fn (ComplianceRecordStatus $status) => [
                'value' => $status->value,
                'label' => $status->label(),
            ])->all();
    }

    /**
     * Build select options for recurrence units.
     *
     * @return array<int, array{value:string,label:string}>
     */
    private function recurrenceOptions(): array
    {
        return collect(ComplianceRecurrenceUnit::cases())
            ->map(fn (ComplianceRecurrenceUnit $unit) => [
                'value' => $unit->value,
                'label' => $unit->label(),
            ])->all();
    }

    /**
     * Build checkbox options for reminder days.
     *
     * @return array<int, array{value:int,label:string}>
     */
    private function reminderDayOptions(): array
    {
        return collect([90, 60, 30, 15, 7])
            ->map(fn (int $day) => [
                'value' => $day,
                'label' => "{$day} days before",
            ])->all();
    }

    /**
     * Build template options with defaults for the form.
     *
     * @param  array<int, int|null>  $includeIds
     * @return array<int, array<string, mixed>>
     */
    private function templateOptions(array $includeIds = []): array
    {
        $templateIds = collect($includeIds)
            ->filter()
            ->map(fn (mixed $id): int => (int) $id)
            ->all();

        return ComplianceTemplate::query()
            ->withTrashed()
            ->where(function ($query) use ($templateIds): void {
                $query->where('is_active', true);

                if ($templateIds !== []) {
                    $query->orWhereIn('id', $templateIds);
                }
            })
            ->orderBy('agency')
            ->orderBy('name')
            ->get()
            ->map(fn (ComplianceTemplate $template) => [
                'value' => $template->getKey(),
                'label' => "{$template->agency} • {$template->name}",
                'name' => $template->name,
                'agency' => $template->agency,
                'category' => $template->category,
                'description' => $template->description,
                'default_recurrence_unit' => $template->default_recurrence_unit->value,
                'default_reminder_days' => $template->default_reminder_days ?? [],
            ])->all();
    }

    /**
     * Build responsible-user select options.
     *
     * @param  array<int, int|null>  $includeIds
     * @return array<int, array{value:int,label:string}>
     */
    private function assignedUserOptions(array $includeIds = []): array
    {
        $userIds = collect($includeIds)
            ->filter()
            ->map(fn (mixed $id): int => (int) $id)
            ->all();

        return User::query()
            ->withTrashed()
            ->where(function ($query) use ($userIds): void {
                $query->where('is_active', true);

                if ($userIds !== []) {
                    $query->orWhereIn('id', $userIds);
                }
            })
            ->orderBy('name')
            ->get(['id', 'name'])
            ->map(fn (User $user) => [
                'value' => $user->getKey(),
                'label' => $user->name,
            ])->all();
    }

    /**
     * Build agency filter options.
     *
     * @return array<int, array{value:string,label:string}>
     */
    private function agencyOptions(): array
    {
        return collect([
            ...ComplianceRecord::query()->orderBy('agency')->pluck('agency')->all(),
            ...ComplianceTemplate::query()->orderBy('agency')->pluck('agency')->all(),
        ])->filter()
            ->unique()
            ->sort()
            ->values()
            ->map(fn (string $agency) => [
                'value' => $agency,
                'label' => $agency,
            ])->all();
    }

    /**
     * Build recent-alert preview items for the index page.
     *
     * @return array<int, array<string, mixed>>
     */
    private function recentAlertItems(): array
    {
        return ComplianceAlert::query()
            ->with('complianceRecord:id,record_no,title')
            ->unacknowledged()
            ->orderBy('scheduled_for')
            ->limit(5)
            ->get()
            ->map(fn (ComplianceAlert $alert) => [
                'id' => $alert->getKey(),
                'alert_type_label' => $alert->alert_type->label(),
                'message' => $alert->message,
                'scheduled_for' => optional($alert->scheduled_for)?->toDateString(),
                'record' => $alert->complianceRecord === null ? null : [
                    'id' => $alert->complianceRecord->getKey(),
                    'record_no' => $alert->complianceRecord->record_no,
                    'title' => $alert->complianceRecord->title,
                ],
            ])->all();
    }

    /**
     * Transform an attachment into a frontend-friendly payload.
     *
     * @return array<string, mixed>
     */
    private function attachmentPayload(Attachment $attachment): array
    {
        return [
            'id' => $attachment->getKey(),
            'original_name' => $attachment->original_name,
            'mime_type' => $attachment->mime_type,
            'extension' => $attachment->extension,
            'file_size' => (int) $attachment->file_size,
            'uploaded_at' => optional($attachment->created_at)?->toIso8601String(),
            'uploaded_by' => $attachment->uploadedBy?->name,
            'download_url' => route('attachments.download', $attachment),
        ];
    }

    /**
     * Normalize reminder-day input.
     *
     * @return array<int, int>
     */
    private function normalizeReminderDays(mixed $value): array
    {
        return collect((array) $value)
            ->map(fn (mixed $day): int => (int) $day)
            ->filter(fn (int $day): bool => in_array($day, [90, 60, 30, 15, 7], true))
            ->unique()
            ->sortDesc()
            ->values()
            ->all();
    }
}
