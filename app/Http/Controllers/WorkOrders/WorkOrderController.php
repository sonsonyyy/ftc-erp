<?php

namespace App\Http\Controllers\WorkOrders;

use App\Actions\WorkOrders\UpdateWorkOrderStatusAction;
use App\Enums\QuotationStatus;
use App\Enums\WorkOrderLogType;
use App\Enums\WorkOrderPriority;
use App\Enums\WorkOrderServiceType;
use App\Enums\WorkOrderStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\WorkOrders\StoreWorkOrderAssignmentRequest;
use App\Http\Requests\WorkOrders\StoreWorkOrderLogRequest;
use App\Http\Requests\WorkOrders\StoreWorkOrderMaterialRequest;
use App\Http\Requests\WorkOrders\StoreWorkOrderRequest;
use App\Http\Requests\WorkOrders\UpdateWorkOrderRequest;
use App\Http\Requests\WorkOrders\UpdateWorkOrderStatusRequest;
use App\Models\Attachment;
use App\Models\Customer;
use App\Models\CustomerSite;
use App\Models\Project;
use App\Models\Quotation;
use App\Models\User;
use App\Models\WorkOrder;
use App\Models\WorkOrderAssignment;
use App\Models\WorkOrderLog;
use App\Models\WorkOrderMaterial;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class WorkOrderController extends Controller
{
    private const PER_PAGE = 15;

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', WorkOrder::class);

        $search = $request->string('search')->toString();
        $customerId = $request->integer('customer') ?: null;
        $projectId = $request->integer('project') ?: null;
        $status = $request->string('status')->toString();
        $priority = $request->string('priority')->toString();
        $serviceType = $request->string('service_type')->toString();

        $workOrders = WorkOrder::query()
            ->with([
                'customer:id,customer_code,company_name',
                'customerSite:id,customer_id,site_code,site_name',
                'project:id,project_no,title',
                'quotation:id,quotation_no,subject',
            ])
            ->withCount('attachments')
            ->search($search)
            ->forCustomer($customerId)
            ->forProject($projectId)
            ->status($status)
            ->priority($priority)
            ->serviceType($serviceType)
            ->orderByDesc('scheduled_date')
            ->orderByDesc('id')
            ->paginate(self::PER_PAGE)
            ->withQueryString()
            ->through(fn (WorkOrder $workOrder) => $this->workOrderListItem($request, $workOrder));

        return Inertia::render('work-orders/index', [
            'workOrders' => $workOrders,
            'filters' => [
                'search' => $search,
                'customer' => $customerId,
                'project' => $projectId,
                'status' => $status,
                'priority' => $priority,
                'service_type' => $serviceType,
            ],
            'customerOptions' => $this->customerOptions(),
            'projectOptions' => $this->projectOptions(),
            'statusOptions' => $this->statusOptions(),
            'priorityOptions' => $this->priorityOptions(),
            'serviceTypeOptions' => $this->serviceTypeOptions(),
            'can' => [
                'create' => $request->user()?->can('create', WorkOrder::class) ?? false,
            ],
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(Request $request): Response
    {
        $this->authorize('create', WorkOrder::class);

        return Inertia::render('work-orders/create', [
            'customerOptions' => $this->customerOptions(),
            'siteOptions' => $this->siteOptions(),
            'quotationOptions' => $this->quotationOptions(),
            'projectOptions' => $this->projectOptions(),
            'priorityOptions' => $this->priorityOptions(),
            'serviceTypeOptions' => $this->serviceTypeOptions(),
            'statusOptions' => $this->statusOptions(),
            'defaults' => [
                'customer_id' => $request->integer('customer') ?: null,
                'customer_site_id' => $request->integer('site') ?: null,
                'quotation_id' => $request->integer('quotation') ?: null,
                'project_id' => $request->integer('project') ?: null,
                'priority' => WorkOrderPriority::Normal->value,
                'status' => WorkOrderStatus::Draft->value,
                'scheduled_date' => now()->toDateString(),
            ],
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(
        StoreWorkOrderRequest $request,
        UpdateWorkOrderStatusAction $updateWorkOrderStatusAction,
    ): RedirectResponse {
        $this->authorize('create', WorkOrder::class);

        $workOrder = DB::transaction(function () use ($request, $updateWorkOrderStatusAction): WorkOrder {
            $validated = $request->validated();
            $status = WorkOrderStatus::from($validated['status']);

            if ($status->recordsCompletionDate() && blank($validated['completion_date'] ?? null)) {
                $validated['completion_date'] = now()->toDateString();
            }

            /** @var WorkOrder $workOrder */
            $workOrder = WorkOrder::query()->create($validated);
            $updateWorkOrderStatusAction->recordInitialLog($workOrder, $request->user());

            return $workOrder;
        });

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => __('Work order created.'),
        ]);

        return to_route('work-orders.show', $workOrder);
    }

    /**
     * Display the specified resource.
     */
    public function show(Request $request, WorkOrder $workOrder): Response
    {
        $this->authorize('view', $workOrder);

        $workOrder->load([
            'customer:id,customer_code,company_name',
            'customerSite:id,customer_id,site_code,site_name,address,city,province',
            'project:id,project_no,title,status',
            'quotation:id,quotation_no,subject,status',
            'attachments.uploadedBy:id,name',
            'assignments.user:id,name',
            'logs.loggedBy:id,name',
            'materials',
        ])->loadCount('attachments');

        return Inertia::render('work-orders/show', [
            'workOrder' => $this->workOrderDetail($request, $workOrder),
            'statusOptions' => $this->statusOptions(),
            'userOptions' => $this->userOptions(),
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Request $request, WorkOrder $workOrder): Response
    {
        $this->authorize('update', $workOrder);

        $workOrder->load([
            'customer:id,customer_code,company_name',
            'customerSite:id,customer_id,site_code,site_name',
            'project:id,project_no,title,status',
            'quotation:id,quotation_no,subject,status',
        ])->loadCount('attachments');

        return Inertia::render('work-orders/edit', [
            'workOrder' => $this->workOrderDetail($request, $workOrder, includeRelations: false),
            'customerOptions' => $this->customerOptions(),
            'siteOptions' => $this->siteOptions(),
            'quotationOptions' => $this->quotationOptions(),
            'projectOptions' => $this->projectOptions(),
            'priorityOptions' => $this->priorityOptions(),
            'serviceTypeOptions' => $this->serviceTypeOptions(),
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(
        UpdateWorkOrderRequest $request,
        WorkOrder $workOrder,
    ): RedirectResponse {
        $this->authorize('update', $workOrder);

        $workOrder->update($request->validated());

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => __('Work order updated.'),
        ]);

        return to_route('work-orders.show', $workOrder);
    }

    /**
     * Update the work order status and append a status log.
     */
    public function updateStatus(
        UpdateWorkOrderStatusRequest $request,
        WorkOrder $workOrder,
        UpdateWorkOrderStatusAction $updateWorkOrderStatusAction,
    ): RedirectResponse {
        $this->authorize('changeStatus', $workOrder);

        $validated = $request->validated();

        $updateWorkOrderStatusAction->handle(
            $workOrder,
            WorkOrderStatus::from($validated['status']),
            $request->user(),
            $validated['details'] ?? null,
            $validated['completion_date'] ?? null,
        );

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => __('Work order status updated.'),
        ]);

        return back();
    }

    /**
     * Add or update a work order assignment.
     */
    public function storeAssignment(
        StoreWorkOrderAssignmentRequest $request,
        WorkOrder $workOrder,
    ): RedirectResponse {
        $this->authorize('update', $workOrder);

        $validated = $request->validated();

        WorkOrderAssignment::query()->updateOrCreate(
            [
                'work_order_id' => $workOrder->getKey(),
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
            'message' => __('Work order assignment saved.'),
        ]);

        return back();
    }

    /**
     * Remove an assignment from the work order.
     */
    public function destroyAssignment(
        WorkOrder $workOrder,
        WorkOrderAssignment $assignment,
    ): RedirectResponse {
        $this->authorize('update', $workOrder);

        abort_unless($assignment->work_order_id === $workOrder->getKey(), 404);

        $assignment->delete();

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => __('Work order assignment removed.'),
        ]);

        return back();
    }

    /**
     * Append a note to the work order log.
     */
    public function storeLog(
        StoreWorkOrderLogRequest $request,
        WorkOrder $workOrder,
    ): RedirectResponse {
        $this->authorize('update', $workOrder);

        WorkOrderLog::query()->create([
            'work_order_id' => $workOrder->getKey(),
            'log_type' => WorkOrderLogType::Note,
            'details' => $request->validated()['details'],
            'logged_by' => $request->user()->getKey(),
            'logged_at' => now(),
        ]);

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => __('Work order note recorded.'),
        ]);

        return back();
    }

    /**
     * Add a material line to the work order.
     */
    public function storeMaterial(
        StoreWorkOrderMaterialRequest $request,
        WorkOrder $workOrder,
    ): RedirectResponse {
        $this->authorize('update', $workOrder);

        $workOrder->materials()->create($request->validated());

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => __('Material line added.'),
        ]);

        return back();
    }

    /**
     * Remove a material line from the work order.
     */
    public function destroyMaterial(
        WorkOrder $workOrder,
        WorkOrderMaterial $material,
    ): RedirectResponse {
        $this->authorize('update', $workOrder);

        abort_unless($material->work_order_id === $workOrder->getKey(), 404);

        $material->delete();

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => __('Material line removed.'),
        ]);

        return back();
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(WorkOrder $workOrder): RedirectResponse
    {
        $this->authorize('delete', $workOrder);

        $workOrder->delete();

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => __('Work order archived.'),
        ]);

        return to_route('work-orders.index');
    }

    /**
     * Transform a work order into an index table row.
     *
     * @return array<string, mixed>
     */
    private function workOrderListItem(Request $request, WorkOrder $workOrder): array
    {
        return [
            'id' => $workOrder->getKey(),
            'work_order_no' => $workOrder->work_order_no,
            'summary' => $workOrder->summary,
            'service_type' => $workOrder->service_type->value,
            'service_type_label' => $workOrder->service_type->label(),
            'scheduled_date' => optional($workOrder->scheduled_date)?->toDateString(),
            'priority' => $workOrder->priority->value,
            'priority_label' => $workOrder->priority->label(),
            'status' => $workOrder->status->value,
            'status_label' => $workOrder->status->label(),
            'attachment_count' => (int) $workOrder->getAttribute('attachments_count'),
            'customer' => [
                'id' => $workOrder->customer?->getKey(),
                'customer_code' => $workOrder->customer?->customer_code,
                'company_name' => $workOrder->customer?->company_name,
            ],
            'site' => [
                'id' => $workOrder->customerSite?->getKey(),
                'site_code' => $workOrder->customerSite?->site_code,
                'site_name' => $workOrder->customerSite?->site_name,
            ],
            'project' => [
                'id' => $workOrder->project?->getKey(),
                'project_no' => $workOrder->project?->project_no,
                'title' => $workOrder->project?->title,
            ],
            'quotation' => [
                'id' => $workOrder->quotation?->getKey(),
                'quotation_no' => $workOrder->quotation?->quotation_no,
                'subject' => $workOrder->quotation?->subject,
            ],
            'can' => [
                'view' => $request->user()?->can('view', $workOrder) ?? false,
                'update' => $request->user()?->can('update', $workOrder) ?? false,
                'change_status' => $request->user()?->can('changeStatus', $workOrder) ?? false,
                'delete' => $request->user()?->can('delete', $workOrder) ?? false,
            ],
        ];
    }

    /**
     * Transform a work order into a detailed Inertia payload.
     *
     * @return array<string, mixed>
     */
    private function workOrderDetail(
        Request $request,
        WorkOrder $workOrder,
        bool $includeRelations = true,
    ): array {
        $detail = [
            'id' => $workOrder->getKey(),
            'quotation_id' => $workOrder->quotation_id,
            'project_id' => $workOrder->project_id,
            'customer_id' => $workOrder->customer_id,
            'customer_site_id' => $workOrder->customer_site_id,
            'work_order_no' => $workOrder->work_order_no,
            'service_type' => $workOrder->service_type->value,
            'service_type_label' => $workOrder->service_type->label(),
            'scheduled_date' => optional($workOrder->scheduled_date)?->toDateString(),
            'priority' => $workOrder->priority->value,
            'priority_label' => $workOrder->priority->label(),
            'status' => $workOrder->status->value,
            'status_label' => $workOrder->status->label(),
            'summary' => $workOrder->summary,
            'findings' => $workOrder->findings,
            'completion_date' => optional($workOrder->completion_date)?->toDateString(),
            'attachment_count' => (int) ($workOrder->getAttribute('attachments_count') ?? 0),
            'customer' => [
                'id' => $workOrder->customer?->getKey(),
                'customer_code' => $workOrder->customer?->customer_code,
                'company_name' => $workOrder->customer?->company_name,
            ],
            'site' => [
                'id' => $workOrder->customerSite?->getKey(),
                'site_code' => $workOrder->customerSite?->site_code,
                'site_name' => $workOrder->customerSite?->site_name,
                'address' => $workOrder->customerSite?->address,
                'city' => $workOrder->customerSite?->city,
                'province' => $workOrder->customerSite?->province,
            ],
            'project' => [
                'id' => $workOrder->project?->getKey(),
                'project_no' => $workOrder->project?->project_no,
                'title' => $workOrder->project?->title,
                'status' => $workOrder->project?->status?->value,
                'status_label' => $workOrder->project?->status?->label(),
            ],
            'quotation' => [
                'id' => $workOrder->quotation?->getKey(),
                'quotation_no' => $workOrder->quotation?->quotation_no,
                'subject' => $workOrder->quotation?->subject,
                'status' => $workOrder->quotation?->status?->value,
                'status_label' => $workOrder->quotation?->status?->label(),
            ],
            'can' => [
                'update' => $request->user()?->can('update', $workOrder) ?? false,
                'change_status' => $request->user()?->can('changeStatus', $workOrder) ?? false,
                'delete' => $request->user()?->can('delete', $workOrder) ?? false,
                'manage_assignments' => $request->user()?->can('update', $workOrder) ?? false,
                'manage_logs' => $request->user()?->can('update', $workOrder) ?? false,
                'manage_materials' => $request->user()?->can('update', $workOrder) ?? false,
                'upload_attachments' => ($request->user()?->hasPermissionTo('attachments.create') ?? false)
                    && ($request->user()?->can('update', $workOrder) ?? false),
                'remove_attachments' => ($request->user()?->hasPermissionTo('attachments.delete') ?? false)
                    && ($request->user()?->can('update', $workOrder) ?? false),
            ],
        ];

        if (! $includeRelations) {
            return $detail;
        }

        return [
            ...$detail,
            'attachments' => $workOrder->attachments
                ->map(fn (Attachment $attachment) => $this->attachmentPayload($attachment))
                ->all(),
            'assignments' => $workOrder->assignments
                ->map(fn (WorkOrderAssignment $assignment) => [
                    'id' => $assignment->getKey(),
                    'assignment_role' => $assignment->assignment_role,
                    'notes' => $assignment->notes,
                    'assigned_at' => optional($assignment->assigned_at)?->toIso8601String(),
                    'user' => [
                        'id' => $assignment->user?->getKey(),
                        'name' => $assignment->user?->name,
                    ],
                ])->all(),
            'logs' => $workOrder->logs
                ->map(fn (WorkOrderLog $log) => [
                    'id' => $log->getKey(),
                    'log_type' => $log->log_type->value,
                    'log_type_label' => $log->log_type->label(),
                    'from_status' => $log->from_status?->value,
                    'from_status_label' => $log->from_status?->label(),
                    'to_status' => $log->to_status?->value,
                    'to_status_label' => $log->to_status?->label(),
                    'details' => $log->details,
                    'logged_at' => optional($log->logged_at)?->toIso8601String(),
                    'logged_by' => $log->loggedBy?->name,
                ])->all(),
            'materials' => $workOrder->materials
                ->map(fn (WorkOrderMaterial $material) => [
                    'id' => $material->getKey(),
                    'item_code' => $material->item_code,
                    'item_name' => $material->item_name,
                    'quantity' => (float) $material->quantity,
                    'unit' => $material->unit,
                    'notes' => $material->notes,
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
     * Build project dropdown options.
     *
     * @return array<int, array<string, int|string|null>>
     */
    private function projectOptions(): array
    {
        return Project::query()
            ->orderByDesc('start_date')
            ->orderByDesc('id')
            ->get(['id', 'customer_id', 'customer_site_id', 'quotation_id', 'project_no', 'title'])
            ->map(fn (Project $project) => [
                'value' => $project->getKey(),
                'label' => "{$project->project_no} - {$project->title}",
                'customer_id' => $project->customer_id,
                'customer_site_id' => $project->customer_site_id,
                'quotation_id' => $project->quotation_id,
            ])->all();
    }

    /**
     * Build status dropdown options.
     *
     * @return array<int, array<string, string>>
     */
    private function statusOptions(): array
    {
        return collect(WorkOrderStatus::cases())
            ->map(fn (WorkOrderStatus $status) => [
                'value' => $status->value,
                'label' => $status->label(),
            ])->all();
    }

    /**
     * Build priority dropdown options.
     *
     * @return array<int, array<string, string>>
     */
    private function priorityOptions(): array
    {
        return collect(WorkOrderPriority::cases())
            ->map(fn (WorkOrderPriority $priority) => [
                'value' => $priority->value,
                'label' => $priority->label(),
            ])->all();
    }

    /**
     * Build service type dropdown options.
     *
     * @return array<int, array<string, string>>
     */
    private function serviceTypeOptions(): array
    {
        return collect(WorkOrderServiceType::cases())
            ->map(fn (WorkOrderServiceType $serviceType) => [
                'value' => $serviceType->value,
                'label' => $serviceType->label(),
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
