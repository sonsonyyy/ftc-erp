<?php

namespace App\Http\Controllers\Projects;

use App\Actions\Projects\UpdateProjectStatusAction;
use App\Enums\ProjectStatus;
use App\Enums\QuotationStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\Projects\StoreProjectAssignmentRequest;
use App\Http\Requests\Projects\StoreProjectRequest;
use App\Http\Requests\Projects\UpdateProjectRequest;
use App\Http\Requests\Projects\UpdateProjectStatusRequest;
use App\Models\Attachment;
use App\Models\Customer;
use App\Models\CustomerSite;
use App\Models\Project;
use App\Models\ProjectAssignment;
use App\Models\ProjectStatusLog;
use App\Models\Quotation;
use App\Models\User;
use App\Models\WorkOrder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class ProjectController extends Controller
{
    private const PER_PAGE = 15;

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', Project::class);

        $search = $request->string('search')->toString();
        $customerId = $request->integer('customer') ?: null;
        $status = $request->string('status')->toString();

        $projects = Project::query()
            ->with([
                'customer:id,customer_code,company_name',
                'customerSite:id,customer_id,site_code,site_name',
                'quotation:id,quotation_no,subject',
            ])
            ->withCount(['attachments', 'workOrders'])
            ->search($search)
            ->forCustomer($customerId)
            ->status($status)
            ->orderByDesc('start_date')
            ->orderByDesc('id')
            ->paginate(self::PER_PAGE)
            ->withQueryString()
            ->through(fn (Project $project) => $this->projectListItem($request, $project));

        return Inertia::render('projects/index', [
            'projects' => $projects,
            'filters' => [
                'search' => $search,
                'customer' => $customerId,
                'status' => $status,
            ],
            'customerOptions' => $this->customerOptions(),
            'statusOptions' => $this->statusOptions(),
            'can' => [
                'create' => $request->user()?->can('create', Project::class) ?? false,
            ],
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(Request $request): Response
    {
        $this->authorize('create', Project::class);

        return Inertia::render('projects/create', [
            'customerOptions' => $this->customerOptions(),
            'siteOptions' => $this->siteOptions(),
            'quotationOptions' => $this->quotationOptions(),
            'statusOptions' => $this->statusOptions(),
            'defaults' => [
                'customer_id' => $request->integer('customer') ?: null,
                'customer_site_id' => $request->integer('site') ?: null,
                'quotation_id' => $request->integer('quotation') ?: null,
                'status' => ProjectStatus::Draft->value,
                'start_date' => now()->toDateString(),
            ],
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(
        StoreProjectRequest $request,
        UpdateProjectStatusAction $updateProjectStatusAction,
    ): RedirectResponse {
        $this->authorize('create', Project::class);

        $project = DB::transaction(function () use ($request, $updateProjectStatusAction): Project {
            $validated = $request->validated();
            $status = ProjectStatus::from($validated['status']);

            if ($status->recordsActualEndDate()) {
                $validated['actual_end_date'] = now()->toDateString();
            }

            /** @var Project $project */
            $project = Project::query()->create($validated);
            $updateProjectStatusAction->recordInitialStatus($project, $request->user());

            return $project;
        });

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => __('Project created.'),
        ]);

        return to_route('projects.show', $project);
    }

    /**
     * Display the specified resource.
     */
    public function show(Request $request, Project $project): Response
    {
        $this->authorize('view', $project);

        $project->load([
            'customer:id,customer_code,company_name',
            'customerSite:id,customer_id,site_code,site_name,address,city,province',
            'quotation:id,quotation_no,subject,status',
            'attachments.uploadedBy:id,name',
            'statusLogs.changedBy:id,name',
            'assignments.user:id,name',
            'workOrders:id,project_id,work_order_no,summary,status,scheduled_date',
        ])->loadCount(['attachments', 'workOrders']);

        return Inertia::render('projects/show', [
            'project' => $this->projectDetail($request, $project),
            'statusOptions' => $this->statusOptions(),
            'userOptions' => $this->userOptions(),
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Request $request, Project $project): Response
    {
        $this->authorize('update', $project);

        $project->load([
            'customer:id,customer_code,company_name',
            'customerSite:id,customer_id,site_code,site_name',
            'quotation:id,quotation_no,subject,status',
        ])->loadCount(['attachments', 'workOrders']);

        return Inertia::render('projects/edit', [
            'project' => $this->projectDetail($request, $project, includeRelations: false),
            'customerOptions' => $this->customerOptions(),
            'siteOptions' => $this->siteOptions(),
            'quotationOptions' => $this->quotationOptions(),
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateProjectRequest $request, Project $project): RedirectResponse
    {
        $this->authorize('update', $project);

        $project->update($request->validated());

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => __('Project updated.'),
        ]);

        return to_route('projects.show', $project);
    }

    /**
     * Update the project status and append the status history entry.
     */
    public function updateStatus(
        UpdateProjectStatusRequest $request,
        Project $project,
        UpdateProjectStatusAction $updateProjectStatusAction,
    ): RedirectResponse {
        $this->authorize('changeStatus', $project);

        $validated = $request->validated();

        $updateProjectStatusAction->handle(
            $project,
            ProjectStatus::from($validated['status']),
            $request->user(),
            $validated['remarks'] ?? null,
            $validated['actual_end_date'] ?? null,
        );

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => __('Project status updated.'),
        ]);

        return back();
    }

    /**
     * Add or update a project assignment.
     */
    public function storeAssignment(
        StoreProjectAssignmentRequest $request,
        Project $project,
    ): RedirectResponse {
        $this->authorize('update', $project);

        $validated = $request->validated();

        ProjectAssignment::query()->updateOrCreate(
            [
                'project_id' => $project->getKey(),
                'user_id' => $validated['user_id'],
            ],
            [
                'assignment_role' => $validated['assignment_role'] ?? null,
                'notes' => $validated['notes'] ?? null,
                'assigned_at' => now(),
            ],
        );

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => __('Project assignment saved.'),
        ]);

        return back();
    }

    /**
     * Remove an assignment from the project.
     */
    public function destroyAssignment(
        Project $project,
        ProjectAssignment $assignment,
    ): RedirectResponse {
        $this->authorize('update', $project);

        abort_unless($assignment->project_id === $project->getKey(), 404);

        $assignment->delete();

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => __('Project assignment removed.'),
        ]);

        return back();
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Project $project): RedirectResponse
    {
        $this->authorize('delete', $project);

        $project->delete();

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => __('Project archived.'),
        ]);

        return to_route('projects.index');
    }

    /**
     * Transform a project into an index table row.
     *
     * @return array<string, mixed>
     */
    private function projectListItem(Request $request, Project $project): array
    {
        return [
            'id' => $project->getKey(),
            'project_no' => $project->project_no,
            'title' => $project->title,
            'project_type' => $project->project_type,
            'start_date' => optional($project->start_date)?->toDateString(),
            'target_end_date' => optional($project->target_end_date)?->toDateString(),
            'status' => $project->status->value,
            'status_label' => $project->status->label(),
            'attachment_count' => (int) $project->getAttribute('attachments_count'),
            'work_order_count' => (int) $project->getAttribute('work_orders_count'),
            'customer' => [
                'id' => $project->customer?->getKey(),
                'customer_code' => $project->customer?->customer_code,
                'company_name' => $project->customer?->company_name,
            ],
            'site' => [
                'id' => $project->customerSite?->getKey(),
                'site_code' => $project->customerSite?->site_code,
                'site_name' => $project->customerSite?->site_name,
            ],
            'quotation' => [
                'id' => $project->quotation?->getKey(),
                'quotation_no' => $project->quotation?->quotation_no,
                'subject' => $project->quotation?->subject,
            ],
            'can' => [
                'view' => $request->user()?->can('view', $project) ?? false,
                'update' => $request->user()?->can('update', $project) ?? false,
                'change_status' => $request->user()?->can('changeStatus', $project) ?? false,
                'delete' => $request->user()?->can('delete', $project) ?? false,
            ],
        ];
    }

    /**
     * Transform a project into a detailed Inertia payload.
     *
     * @return array<string, mixed>
     */
    private function projectDetail(
        Request $request,
        Project $project,
        bool $includeRelations = true,
    ): array {
        $detail = [
            'id' => $project->getKey(),
            'quotation_id' => $project->quotation_id,
            'customer_id' => $project->customer_id,
            'customer_site_id' => $project->customer_site_id,
            'project_no' => $project->project_no,
            'title' => $project->title,
            'project_type' => $project->project_type,
            'start_date' => optional($project->start_date)?->toDateString(),
            'target_end_date' => optional($project->target_end_date)?->toDateString(),
            'actual_end_date' => optional($project->actual_end_date)?->toDateString(),
            'status' => $project->status->value,
            'status_label' => $project->status->label(),
            'description' => $project->description,
            'attachment_count' => (int) ($project->getAttribute('attachments_count') ?? 0),
            'work_order_count' => (int) ($project->getAttribute('work_orders_count') ?? 0),
            'customer' => [
                'id' => $project->customer?->getKey(),
                'customer_code' => $project->customer?->customer_code,
                'company_name' => $project->customer?->company_name,
            ],
            'site' => [
                'id' => $project->customerSite?->getKey(),
                'site_code' => $project->customerSite?->site_code,
                'site_name' => $project->customerSite?->site_name,
                'address' => $project->customerSite?->address,
                'city' => $project->customerSite?->city,
                'province' => $project->customerSite?->province,
            ],
            'quotation' => [
                'id' => $project->quotation?->getKey(),
                'quotation_no' => $project->quotation?->quotation_no,
                'subject' => $project->quotation?->subject,
                'status' => $project->quotation?->status?->value,
                'status_label' => $project->quotation?->status?->label(),
            ],
            'can' => [
                'update' => $request->user()?->can('update', $project) ?? false,
                'change_status' => $request->user()?->can('changeStatus', $project) ?? false,
                'delete' => $request->user()?->can('delete', $project) ?? false,
                'manage_assignments' => $request->user()?->can('update', $project) ?? false,
                'create_work_order' => $request->user()?->can('create', WorkOrder::class) ?? false,
                'upload_attachments' => ($request->user()?->hasPermissionTo('attachments.create') ?? false)
                    && ($request->user()?->can('update', $project) ?? false),
                'remove_attachments' => ($request->user()?->hasPermissionTo('attachments.delete') ?? false)
                    && ($request->user()?->can('update', $project) ?? false),
            ],
        ];

        if (! $includeRelations) {
            return $detail;
        }

        return [
            ...$detail,
            'attachments' => $project->attachments
                ->map(fn (Attachment $attachment) => $this->attachmentPayload($attachment))
                ->all(),
            'status_history' => $project->statusLogs
                ->map(fn (ProjectStatusLog $log) => [
                    'id' => $log->getKey(),
                    'from_status' => $log->from_status?->value,
                    'from_status_label' => $log->from_status?->label(),
                    'to_status' => $log->to_status?->value,
                    'to_status_label' => $log->to_status?->label(),
                    'remarks' => $log->remarks,
                    'changed_at' => optional($log->changed_at)?->toIso8601String(),
                    'changed_by' => $log->changedBy?->name,
                ])->all(),
            'assignments' => $project->assignments
                ->map(fn (ProjectAssignment $assignment) => [
                    'id' => $assignment->getKey(),
                    'assignment_role' => $assignment->assignment_role,
                    'notes' => $assignment->notes,
                    'assigned_at' => optional($assignment->assigned_at)?->toIso8601String(),
                    'user' => [
                        'id' => $assignment->user?->getKey(),
                        'name' => $assignment->user?->name,
                    ],
                ])->all(),
            'work_orders' => $project->workOrders
                ->map(fn (WorkOrder $workOrder) => [
                    'id' => $workOrder->getKey(),
                    'work_order_no' => $workOrder->work_order_no,
                    'summary' => $workOrder->summary,
                    'status' => $workOrder->status->value,
                    'status_label' => $workOrder->status->label(),
                    'scheduled_date' => optional($workOrder->scheduled_date)?->toDateString(),
                    'can' => [
                        'view' => $request->user()?->can('view', $workOrder) ?? false,
                    ],
                ])->all(),
        ];
    }

    /**
     * Build customer dropdown options.
     *
     * @return array<int, array<string, int|string>>
     */
    private function customerOptions(): array
    {
        return Customer::query()
            ->orderBy('company_name')
            ->get(['id', 'customer_code', 'company_name'])
            ->map(fn (Customer $customer) => [
                'value' => $customer->getKey(),
                'label' => "{$customer->customer_code} - {$customer->company_name}",
            ])->all();
    }

    /**
     * Build site dropdown options.
     *
     * @return array<int, array<string, int|string>>
     */
    private function siteOptions(): array
    {
        return CustomerSite::query()
            ->orderBy('site_name')
            ->get(['id', 'customer_id', 'site_code', 'site_name'])
            ->map(fn (CustomerSite $site) => [
                'value' => $site->getKey(),
                'label' => trim(($site->site_code ? "{$site->site_code} - " : '').$site->site_name),
                'customer_id' => $site->customer_id,
            ])->all();
    }

    /**
     * Build awarded quotation dropdown options.
     *
     * @return array<int, array<string, int|string|null>>
     */
    private function quotationOptions(): array
    {
        return Quotation::query()
            ->where('status', QuotationStatus::Awarded->value)
            ->orderByDesc('quotation_date')
            ->orderByDesc('id')
            ->get(['id', 'customer_id', 'customer_site_id', 'quotation_no', 'subject'])
            ->map(fn (Quotation $quotation) => [
                'value' => $quotation->getKey(),
                'label' => "{$quotation->quotation_no} - {$quotation->subject}",
                'customer_id' => $quotation->customer_id,
                'customer_site_id' => $quotation->customer_site_id,
            ])->all();
    }

    /**
     * Build status dropdown options.
     *
     * @return array<int, array<string, string>>
     */
    private function statusOptions(): array
    {
        return collect(ProjectStatus::cases())
            ->map(fn (ProjectStatus $status) => [
                'value' => $status->value,
                'label' => $status->label(),
            ])->all();
    }

    /**
     * Build user dropdown options for assignments.
     *
     * @return array<int, array<string, int|string>>
     */
    private function userOptions(): array
    {
        return User::query()
            ->orderBy('name')
            ->get(['id', 'name'])
            ->map(fn (User $user) => [
                'value' => $user->getKey(),
                'label' => $user->name,
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
}
