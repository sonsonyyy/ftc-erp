<?php

namespace App\Http\Controllers\Purchasing;

use App\Enums\InventoryItemStatus;
use App\Enums\PurchaseRequestStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\Purchasing\StorePurchaseRequest as StorePurchaseRequestData;
use App\Http\Requests\Purchasing\UpdatePurchaseRequest as UpdatePurchaseRequestData;
use App\Models\Attachment;
use App\Models\InventoryItem;
use App\Models\Project;
use App\Models\PurchaseOrder;
use App\Models\PurchaseRequest;
use App\Models\Supplier;
use App\Models\WorkOrder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class PurchaseRequestController extends Controller
{
    private const PER_PAGE = 15;

    private const PER_PAGE_OPTIONS = [5, 10, 15, 25];

    /**
     * Display a listing of purchase requests.
     */
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', PurchaseRequest::class);

        $search = $request->string('search')->toString();
        $supplierId = $request->integer('supplier') ?: null;
        $status = $request->string('status')->toString();
        $perPage = $this->resolvePerPage($request);

        $purchaseRequests = PurchaseRequest::query()
            ->with([
                'supplier:id,supplier_code,company_name',
                'project:id,project_no,title',
                'workOrder:id,work_order_no,summary',
            ])
            ->withCount(['items', 'purchaseOrders', 'attachments'])
            ->search($search)
            ->forSupplier($supplierId)
            ->status($status)
            ->orderByDesc('request_date')
            ->orderByDesc('id')
            ->paginate($perPage)
            ->withQueryString()
            ->through(fn (PurchaseRequest $purchaseRequest) => $this->purchaseRequestListItem($request, $purchaseRequest));

        return Inertia::render('purchase-requests/index', [
            'purchaseRequests' => $purchaseRequests,
            'filters' => [
                'search' => $search,
                'supplier' => $supplierId,
                'status' => $status,
                'per_page' => $perPage,
            ],
            'supplierOptions' => $this->supplierOptions(),
            'statusOptions' => $this->statusOptions(includeOrdered: true),
            'can' => [
                'create' => $request->user()?->can('create', PurchaseRequest::class) ?? false,
            ],
        ]);
    }

    /**
     * Show the purchase-request creation form.
     */
    public function create(Request $request): Response
    {
        $this->authorize('create', PurchaseRequest::class);

        $workOrder = filled($request->integer('work_order'))
            ? WorkOrder::query()->find($request->integer('work_order'))
            : null;

        return Inertia::render('purchase-requests/create', [
            'supplierOptions' => $this->supplierOptions(),
            'projectOptions' => $this->projectOptions(),
            'workOrderOptions' => $this->workOrderOptions(),
            'itemOptions' => $this->itemOptions(),
            'statusOptions' => $this->statusOptions(),
            'defaults' => [
                'request_no' => 'PR-'.now()->format('YmdHis'),
                'supplier_id' => $request->integer('supplier') ?: null,
                'project_id' => $workOrder?->project_id ?? ($request->integer('project') ?: null),
                'work_order_id' => $workOrder?->getKey() ?? null,
                'request_date' => now()->toDateString(),
                'status' => PurchaseRequestStatus::Draft->value,
            ],
        ]);
    }

    /**
     * Store a new purchase request.
     */
    public function store(StorePurchaseRequestData $request): RedirectResponse
    {
        $this->authorize('create', PurchaseRequest::class);

        $purchaseRequest = DB::transaction(function () use ($request): PurchaseRequest {
            $validated = $request->validated();

            $purchaseRequest = PurchaseRequest::query()->create([
                'request_no' => $validated['request_no'],
                'supplier_id' => $validated['supplier_id'] ?? null,
                'project_id' => $validated['project_id'] ?? null,
                'work_order_id' => $validated['work_order_id'] ?? null,
                'requested_by_user_id' => $request->user()?->getKey(),
                'request_date' => $validated['request_date'],
                'needed_by' => $validated['needed_by'] ?? null,
                'status' => $validated['status'],
                'purpose' => $validated['purpose'],
                'remarks' => $validated['remarks'] ?? null,
            ]);

            $this->syncItems($purchaseRequest, $validated['items']);

            return $purchaseRequest;
        });

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => __('Purchase request created.'),
        ]);

        return to_route('purchase-requests.show', $purchaseRequest);
    }

    /**
     * Display the selected purchase request.
     */
    public function show(Request $request, PurchaseRequest $purchaseRequest): Response
    {
        $this->authorize('view', $purchaseRequest);

        $purchaseRequest->load([
            'supplier:id,supplier_code,company_name',
            'project:id,project_no,title',
            'workOrder:id,work_order_no,summary,project_id',
            'requestedBy:id,name',
            'attachments.uploadedBy',
            'items.inventoryItem:id,item_code,item_name,unit',
            'purchaseOrders' => fn ($query) => $query
                ->with([
                    'supplier:id,supplier_code,company_name',
                ])
                ->withCount(['receipts', 'attachments'])
                ->orderByDesc('order_date')
                ->orderByDesc('id'),
        ])->loadCount(['items', 'purchaseOrders', 'attachments']);

        return Inertia::render('purchase-requests/show', [
            'purchaseRequest' => $this->purchaseRequestDetail($request, $purchaseRequest),
        ]);
    }

    /**
     * Show the edit form for the selected purchase request.
     */
    public function edit(Request $request, PurchaseRequest $purchaseRequest): Response
    {
        $this->authorize('update', $purchaseRequest);

        $purchaseRequest->load([
            'items.inventoryItem:id,item_code,item_name,unit',
        ])->loadCount(['items', 'purchaseOrders', 'attachments']);

        abort_if((int) $purchaseRequest->getAttribute('purchase_orders_count') > 0, 403);

        return Inertia::render('purchase-requests/edit', [
            'purchaseRequest' => $this->purchaseRequestDetail($request, $purchaseRequest, includeRelations: false),
            'supplierOptions' => $this->supplierOptions(),
            'projectOptions' => $this->projectOptions(),
            'workOrderOptions' => $this->workOrderOptions(),
            'itemOptions' => $this->itemOptions(),
            'statusOptions' => $this->statusOptions(),
        ]);
    }

    /**
     * Update the selected purchase request.
     */
    public function update(
        UpdatePurchaseRequestData $request,
        PurchaseRequest $purchaseRequest,
    ): RedirectResponse {
        $this->authorize('update', $purchaseRequest);

        abort_if($purchaseRequest->purchaseOrders()->exists(), 403);

        DB::transaction(function () use ($request, $purchaseRequest): void {
            $validated = $request->validated();

            $purchaseRequest->update([
                'request_no' => $validated['request_no'],
                'supplier_id' => $validated['supplier_id'] ?? null,
                'project_id' => $validated['project_id'] ?? null,
                'work_order_id' => $validated['work_order_id'] ?? null,
                'request_date' => $validated['request_date'],
                'needed_by' => $validated['needed_by'] ?? null,
                'status' => $validated['status'],
                'purpose' => $validated['purpose'],
                'remarks' => $validated['remarks'] ?? null,
            ]);

            $this->syncItems($purchaseRequest, $validated['items']);
        });

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => __('Purchase request updated.'),
        ]);

        return to_route('purchase-requests.show', $purchaseRequest);
    }

    /**
     * Archive the selected purchase request.
     */
    public function destroy(PurchaseRequest $purchaseRequest): RedirectResponse
    {
        $this->authorize('delete', $purchaseRequest);

        $purchaseRequest->delete();

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => __('Purchase request archived.'),
        ]);

        return to_route('purchase-requests.index');
    }

    /**
     * Replace the purchase-request line items.
     *
     * @param  array<int, array<string, mixed>>  $items
     */
    private function syncItems(PurchaseRequest $purchaseRequest, array $items): void
    {
        $inventoryItems = InventoryItem::query()
            ->whereIn('id', collect($items)->pluck('inventory_item_id')->all())
            ->get(['id', 'item_name', 'unit'])
            ->keyBy('id');

        $purchaseRequest->items()->delete();

        foreach ($items as $item) {
            /** @var InventoryItem $inventoryItem */
            $inventoryItem = $inventoryItems->get((int) $item['inventory_item_id']);

            $purchaseRequest->items()->create([
                'inventory_item_id' => $inventoryItem->getKey(),
                'item_description' => $inventoryItem->item_name,
                'unit' => $inventoryItem->unit,
                'requested_quantity' => $item['requested_quantity'],
                'estimated_unit_cost' => $item['estimated_unit_cost'] ?? null,
                'remarks' => $item['remarks'] ?? null,
            ]);
        }
    }

    /**
     * Transform a purchase request into an index payload.
     *
     * @return array<string, mixed>
     */
    private function purchaseRequestListItem(Request $request, PurchaseRequest $purchaseRequest): array
    {
        $editable = ($request->user()?->can('update', $purchaseRequest) ?? false)
            && (int) ($purchaseRequest->getAttribute('purchase_orders_count') ?? 0) === 0;

        return [
            'id' => $purchaseRequest->getKey(),
            'request_no' => $purchaseRequest->request_no,
            'request_date' => optional($purchaseRequest->request_date)?->toDateString(),
            'needed_by' => optional($purchaseRequest->needed_by)?->toDateString(),
            'status' => $purchaseRequest->status->value,
            'status_label' => $purchaseRequest->status->label(),
            'purpose' => $purchaseRequest->purpose,
            'item_count' => (int) ($purchaseRequest->getAttribute('items_count') ?? 0),
            'purchase_order_count' => (int) ($purchaseRequest->getAttribute('purchase_orders_count') ?? 0),
            'attachment_count' => (int) ($purchaseRequest->getAttribute('attachments_count') ?? 0),
            'supplier' => [
                'id' => $purchaseRequest->supplier?->getKey(),
                'supplier_code' => $purchaseRequest->supplier?->supplier_code,
                'company_name' => $purchaseRequest->supplier?->company_name,
            ],
            'project' => [
                'id' => $purchaseRequest->project?->getKey(),
                'project_no' => $purchaseRequest->project?->project_no,
                'title' => $purchaseRequest->project?->title,
            ],
            'work_order' => [
                'id' => $purchaseRequest->workOrder?->getKey(),
                'work_order_no' => $purchaseRequest->workOrder?->work_order_no,
                'summary' => $purchaseRequest->workOrder?->summary,
            ],
            'can' => [
                'view' => $request->user()?->can('view', $purchaseRequest) ?? false,
                'update' => $editable,
                'delete' => $request->user()?->can('delete', $purchaseRequest) ?? false,
            ],
        ];
    }

    /**
     * Transform a purchase request into a detailed payload.
     *
     * @return array<string, mixed>
     */
    private function purchaseRequestDetail(
        Request $request,
        PurchaseRequest $purchaseRequest,
        bool $includeRelations = true,
    ): array {
        $purchaseOrderCount = (int) ($purchaseRequest->getAttribute('purchase_orders_count') ?? 0);
        $editable = ($request->user()?->can('update', $purchaseRequest) ?? false)
            && $purchaseOrderCount === 0;

        $detail = [
            'id' => $purchaseRequest->getKey(),
            'request_no' => $purchaseRequest->request_no,
            'supplier_id' => $purchaseRequest->supplier_id,
            'project_id' => $purchaseRequest->project_id,
            'work_order_id' => $purchaseRequest->work_order_id,
            'request_date' => optional($purchaseRequest->request_date)?->toDateString(),
            'needed_by' => optional($purchaseRequest->needed_by)?->toDateString(),
            'status' => $purchaseRequest->status->value,
            'status_label' => $purchaseRequest->status->label(),
            'purpose' => $purchaseRequest->purpose,
            'remarks' => $purchaseRequest->remarks,
            'item_count' => (int) ($purchaseRequest->getAttribute('items_count') ?? 0),
            'purchase_order_count' => $purchaseOrderCount,
            'attachment_count' => (int) ($purchaseRequest->getAttribute('attachments_count') ?? 0),
            'requested_by' => $purchaseRequest->requestedBy?->name,
            'supplier' => [
                'id' => $purchaseRequest->supplier?->getKey(),
                'supplier_code' => $purchaseRequest->supplier?->supplier_code,
                'company_name' => $purchaseRequest->supplier?->company_name,
            ],
            'project' => [
                'id' => $purchaseRequest->project?->getKey(),
                'project_no' => $purchaseRequest->project?->project_no,
                'title' => $purchaseRequest->project?->title,
            ],
            'work_order' => [
                'id' => $purchaseRequest->workOrder?->getKey(),
                'work_order_no' => $purchaseRequest->workOrder?->work_order_no,
                'summary' => $purchaseRequest->workOrder?->summary,
            ],
            'can' => [
                'update' => $editable,
                'delete' => $request->user()?->can('delete', $purchaseRequest) ?? false,
                'create_purchase_order' => ($request->user()?->can('create', PurchaseOrder::class) ?? false)
                    && $purchaseRequest->status !== PurchaseRequestStatus::Cancelled,
                'upload_attachments' => ($request->user()?->hasPermissionTo('attachments.create') ?? false)
                    && ($request->user()?->can('update', $purchaseRequest) ?? false),
                'remove_attachments' => ($request->user()?->hasPermissionTo('attachments.delete') ?? false)
                    && ($request->user()?->can('update', $purchaseRequest) ?? false),
            ],
        ];

        if (! $includeRelations) {
            return [
                ...$detail,
                'items' => $purchaseRequest->relationLoaded('items')
                    ? $purchaseRequest->items
                        ->map(fn ($item) => [
                            'id' => $item->getKey(),
                            'inventory_item_id' => $item->inventory_item_id,
                            'item_description' => $item->item_description,
                            'unit' => $item->unit,
                            'requested_quantity' => (float) $item->requested_quantity,
                            'estimated_unit_cost' => $item->estimated_unit_cost === null
                                ? null
                                : (float) $item->estimated_unit_cost,
                            'remarks' => $item->remarks,
                            'inventory_item' => [
                                'id' => $item->inventoryItem?->getKey(),
                                'item_code' => $item->inventoryItem?->item_code,
                                'item_name' => $item->inventoryItem?->item_name,
                                'unit' => $item->inventoryItem?->unit,
                            ],
                        ])->all()
                    : [],
            ];
        }

        return [
            ...$detail,
            'attachments' => $purchaseRequest->attachments
                ->map(fn (Attachment $attachment) => $this->attachmentPayload($attachment))
                ->all(),
            'items' => $purchaseRequest->items
                ->map(fn ($item) => [
                    'id' => $item->getKey(),
                    'inventory_item_id' => $item->inventory_item_id,
                    'item_description' => $item->item_description,
                    'unit' => $item->unit,
                    'requested_quantity' => (float) $item->requested_quantity,
                    'estimated_unit_cost' => $item->estimated_unit_cost === null
                        ? null
                        : (float) $item->estimated_unit_cost,
                    'remarks' => $item->remarks,
                    'inventory_item' => [
                        'id' => $item->inventoryItem?->getKey(),
                        'item_code' => $item->inventoryItem?->item_code,
                        'item_name' => $item->inventoryItem?->item_name,
                        'unit' => $item->inventoryItem?->unit,
                    ],
                ])->all(),
            'purchase_orders' => $purchaseRequest->purchaseOrders
                ->map(fn (PurchaseOrder $purchaseOrder) => [
                    'id' => $purchaseOrder->getKey(),
                    'po_no' => $purchaseOrder->po_no,
                    'status' => $purchaseOrder->status->value,
                    'status_label' => $purchaseOrder->status->label(),
                    'order_date' => optional($purchaseOrder->order_date)?->toDateString(),
                    'supplier' => [
                        'id' => $purchaseOrder->supplier?->getKey(),
                        'supplier_code' => $purchaseOrder->supplier?->supplier_code,
                        'company_name' => $purchaseOrder->supplier?->company_name,
                    ],
                    'receipt_count' => (int) ($purchaseOrder->getAttribute('receipts_count') ?? 0),
                    'attachment_count' => (int) ($purchaseOrder->getAttribute('attachments_count') ?? 0),
                    'can' => [
                        'view' => $request->user()?->can('view', $purchaseOrder) ?? false,
                    ],
                ])->all(),
        ];
    }

    /**
     * Resolve a supported page size for paginated listings.
     */
    private function resolvePerPage(Request $request): int
    {
        $perPage = $request->integer('per_page', self::PER_PAGE);

        return in_array($perPage, self::PER_PAGE_OPTIONS, true)
            ? $perPage
            : self::PER_PAGE;
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
     * Build purchase-request status filter or form options.
     *
     * @return array<int, array<string, string>>
     */
    private function statusOptions(bool $includeOrdered = false): array
    {
        return collect(PurchaseRequestStatus::cases())
            ->filter(fn (PurchaseRequestStatus $status) => $includeOrdered || $status !== PurchaseRequestStatus::Ordered)
            ->map(fn (PurchaseRequestStatus $status) => [
                'value' => $status->value,
                'label' => $status->label(),
            ])->values()->all();
    }

    /**
     * Build supplier select options.
     *
     * @return array<int, array<string, int|string>>
     */
    private function supplierOptions(): array
    {
        return Supplier::query()
            ->where('is_active', true)
            ->orderBy('company_name')
            ->get(['id', 'supplier_code', 'company_name'])
            ->map(fn (Supplier $supplier) => [
                'value' => $supplier->getKey(),
                'label' => "{$supplier->supplier_code} - {$supplier->company_name}",
            ])->all();
    }

    /**
     * Build project select options.
     *
     * @return array<int, array<string, int|string>>
     */
    private function projectOptions(): array
    {
        return Project::query()
            ->orderByDesc('start_date')
            ->orderByDesc('id')
            ->get(['id', 'project_no', 'title'])
            ->map(fn (Project $project) => [
                'value' => $project->getKey(),
                'label' => "{$project->project_no} - {$project->title}",
            ])->all();
    }

    /**
     * Build work-order select options.
     *
     * @return array<int, array<string, int|string|null>>
     */
    private function workOrderOptions(): array
    {
        return WorkOrder::query()
            ->orderByDesc('scheduled_date')
            ->orderByDesc('id')
            ->get(['id', 'project_id', 'work_order_no', 'summary'])
            ->map(fn (WorkOrder $workOrder) => [
                'value' => $workOrder->getKey(),
                'label' => "{$workOrder->work_order_no} - {$workOrder->summary}",
                'project_id' => $workOrder->project_id,
            ])->all();
    }

    /**
     * Build inventory-item select options.
     *
     * @return array<int, array<string, int|string|float|null>>
     */
    private function itemOptions(): array
    {
        return InventoryItem::query()
            ->status(InventoryItemStatus::Active->value)
            ->orderBy('item_name')
            ->get(['id', 'item_code', 'item_name', 'unit', 'standard_cost'])
            ->map(fn (InventoryItem $inventoryItem) => [
                'value' => $inventoryItem->getKey(),
                'label' => "{$inventoryItem->item_code} - {$inventoryItem->item_name} ({$inventoryItem->unit})",
                'unit' => $inventoryItem->unit,
                'standard_cost' => $inventoryItem->standard_cost === null
                    ? null
                    : (float) $inventoryItem->standard_cost,
            ])->all();
    }
}
