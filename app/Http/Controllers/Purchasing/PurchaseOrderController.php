<?php

namespace App\Http\Controllers\Purchasing;

use App\Enums\InventoryItemStatus;
use App\Enums\PurchaseOrderStatus;
use App\Enums\PurchaseRequestStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\Purchasing\StorePurchaseOrderRequest;
use App\Http\Requests\Purchasing\UpdatePurchaseOrderRequest;
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

class PurchaseOrderController extends Controller
{
    private const PER_PAGE = 15;

    /**
     * Display a listing of purchase orders.
     */
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', PurchaseOrder::class);

        $search = $request->string('search')->toString();
        $supplierId = $request->integer('supplier') ?: null;
        $status = $request->string('status')->toString();

        $purchaseOrders = PurchaseOrder::query()
            ->with([
                'supplier:id,supplier_code,company_name',
                'purchaseRequest:id,request_no,purpose',
                'project:id,project_no,title',
                'workOrder:id,work_order_no,summary',
            ])
            ->withCount(['receipts', 'attachments'])
            ->withSum('items as ordered_quantity_total', 'ordered_quantity')
            ->withSum('receiptItems as received_quantity_total', 'received_quantity')
            ->search($search)
            ->forSupplier($supplierId)
            ->status($status)
            ->orderByDesc('order_date')
            ->orderByDesc('id')
            ->paginate(self::PER_PAGE)
            ->withQueryString()
            ->through(fn (PurchaseOrder $purchaseOrder) => $this->purchaseOrderListItem($request, $purchaseOrder));

        return Inertia::render('purchase-orders/index', [
            'purchaseOrders' => $purchaseOrders,
            'filters' => [
                'search' => $search,
                'supplier' => $supplierId,
                'status' => $status,
            ],
            'supplierOptions' => $this->supplierOptions(),
            'statusOptions' => $this->statusOptions(includeDerived: true),
            'can' => [
                'create' => $request->user()?->can('create', PurchaseOrder::class) ?? false,
            ],
        ]);
    }

    /**
     * Show the purchase-order creation form.
     */
    public function create(Request $request): Response
    {
        $this->authorize('create', PurchaseOrder::class);

        $selectedPurchaseRequest = filled($request->integer('purchase_request'))
            ? PurchaseRequest::query()
                ->with(['items.inventoryItem:id,item_code,item_name,unit,standard_cost'])
                ->find($request->integer('purchase_request'))
            : null;

        $workOrder = $selectedPurchaseRequest === null && filled($request->integer('work_order'))
            ? WorkOrder::query()->find($request->integer('work_order'))
            : null;

        return Inertia::render('purchase-orders/create', [
            'supplierOptions' => $this->supplierOptions(),
            'purchaseRequestOptions' => $this->purchaseRequestOptions(),
            'projectOptions' => $this->projectOptions(),
            'workOrderOptions' => $this->workOrderOptions(),
            'itemOptions' => $this->itemOptions(),
            'statusOptions' => $this->statusOptions(),
            'defaults' => [
                'po_no' => 'PO-'.now()->format('YmdHis'),
                'purchase_request_id' => $selectedPurchaseRequest?->getKey() ?? null,
                'supplier_id' => $selectedPurchaseRequest?->supplier_id ?? ($request->integer('supplier') ?: null),
                'project_id' => $selectedPurchaseRequest?->project_id ?? ($workOrder?->project_id ?? ($request->integer('project') ?: null)),
                'work_order_id' => $selectedPurchaseRequest?->work_order_id ?? ($workOrder?->getKey() ?? null),
                'order_date' => now()->toDateString(),
                'status' => PurchaseOrderStatus::Draft->value,
                'items' => $selectedPurchaseRequest?->items
                    ->map(fn ($item) => [
                        'purchase_request_item_id' => $item->getKey(),
                        'inventory_item_id' => $item->inventory_item_id,
                        'ordered_quantity' => (float) $item->requested_quantity,
                        'unit_cost' => $item->estimated_unit_cost === null
                            ? (float) ($item->inventoryItem?->standard_cost ?? 0)
                            : (float) $item->estimated_unit_cost,
                        'remarks' => $item->remarks,
                    ])->all() ?? [],
            ],
        ]);
    }

    /**
     * Store a new purchase order.
     */
    public function store(StorePurchaseOrderRequest $request): RedirectResponse
    {
        $this->authorize('create', PurchaseOrder::class);

        $purchaseOrder = DB::transaction(function () use ($request): PurchaseOrder {
            $validated = $request->validated();

            $purchaseOrder = PurchaseOrder::query()->create([
                'po_no' => $validated['po_no'],
                'purchase_request_id' => $validated['purchase_request_id'] ?? null,
                'supplier_id' => $validated['supplier_id'],
                'project_id' => $validated['project_id'] ?? null,
                'work_order_id' => $validated['work_order_id'] ?? null,
                'ordered_by_user_id' => $request->user()?->getKey(),
                'order_date' => $validated['order_date'],
                'expected_date' => $validated['expected_date'] ?? null,
                'status' => $validated['status'],
                'supplier_reference' => $validated['supplier_reference'] ?? null,
                'remarks' => $validated['remarks'] ?? null,
            ]);

            $this->syncItems($purchaseOrder, $validated['items']);
            $this->syncPurchaseRequestStatus($purchaseOrder->purchase_request_id);

            return $purchaseOrder;
        });

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => __('Purchase order created.'),
        ]);

        return to_route('purchase-orders.show', $purchaseOrder);
    }

    /**
     * Display the selected purchase order.
     */
    public function show(Request $request, PurchaseOrder $purchaseOrder): Response
    {
        $this->authorize('view', $purchaseOrder);

        $purchaseOrder->load([
            'supplier:id,supplier_code,company_name',
            'purchaseRequest:id,request_no,purpose,status',
            'project:id,project_no,title',
            'workOrder:id,work_order_no,summary',
            'orderedBy:id,name',
            'attachments.uploadedBy',
            'items' => fn ($query) => $query
                ->with([
                    'inventoryItem:id,item_code,item_name,unit',
                    'purchaseRequestItem:id,purchase_request_id',
                ])
                ->withSum('receiptItems as received_quantity_total', 'received_quantity')
                ->orderBy('id'),
            'receipts' => fn ($query) => $query
                ->with([
                    'warehouse:id,warehouse_code,warehouse_name',
                    'receivedBy:id,name',
                ])
                ->withCount(['items', 'attachments'])
                ->withSum('items as received_quantity_total', 'received_quantity')
                ->orderByDesc('received_date')
                ->orderByDesc('id'),
        ])->loadCount(['receipts', 'attachments']);

        return Inertia::render('purchase-orders/show', [
            'purchaseOrder' => $this->purchaseOrderDetail($request, $purchaseOrder),
        ]);
    }

    /**
     * Show the edit form for the selected purchase order.
     */
    public function edit(Request $request, PurchaseOrder $purchaseOrder): Response
    {
        $this->authorize('update', $purchaseOrder);

        $purchaseOrder->load([
            'items.inventoryItem:id,item_code,item_name,unit',
        ])->loadCount(['receipts', 'attachments']);

        abort_if((int) $purchaseOrder->getAttribute('receipts_count') > 0, 403);

        return Inertia::render('purchase-orders/edit', [
            'purchaseOrder' => $this->purchaseOrderDetail($request, $purchaseOrder, includeRelations: false),
            'supplierOptions' => $this->supplierOptions(),
            'purchaseRequestOptions' => $this->purchaseRequestOptions(),
            'projectOptions' => $this->projectOptions(),
            'workOrderOptions' => $this->workOrderOptions(),
            'itemOptions' => $this->itemOptions(),
            'statusOptions' => $this->statusOptions(),
        ]);
    }

    /**
     * Update the selected purchase order.
     */
    public function update(
        UpdatePurchaseOrderRequest $request,
        PurchaseOrder $purchaseOrder,
    ): RedirectResponse {
        $this->authorize('update', $purchaseOrder);

        abort_if($purchaseOrder->receipts()->exists(), 403);

        $previousPurchaseRequestId = $purchaseOrder->purchase_request_id;

        DB::transaction(function () use ($request, $purchaseOrder, $previousPurchaseRequestId): void {
            $validated = $request->validated();

            $purchaseOrder->update([
                'po_no' => $validated['po_no'],
                'purchase_request_id' => $validated['purchase_request_id'] ?? null,
                'supplier_id' => $validated['supplier_id'],
                'project_id' => $validated['project_id'] ?? null,
                'work_order_id' => $validated['work_order_id'] ?? null,
                'order_date' => $validated['order_date'],
                'expected_date' => $validated['expected_date'] ?? null,
                'status' => $validated['status'],
                'supplier_reference' => $validated['supplier_reference'] ?? null,
                'remarks' => $validated['remarks'] ?? null,
            ]);

            $this->syncItems($purchaseOrder, $validated['items']);
            $this->syncPurchaseRequestStatus($previousPurchaseRequestId);
            $this->syncPurchaseRequestStatus($purchaseOrder->purchase_request_id);
        });

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => __('Purchase order updated.'),
        ]);

        return to_route('purchase-orders.show', $purchaseOrder);
    }

    /**
     * Archive the selected purchase order.
     */
    public function destroy(PurchaseOrder $purchaseOrder): RedirectResponse
    {
        $this->authorize('delete', $purchaseOrder);

        $purchaseRequestId = $purchaseOrder->purchase_request_id;

        $purchaseOrder->delete();
        $this->syncPurchaseRequestStatus($purchaseRequestId);

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => __('Purchase order archived.'),
        ]);

        return to_route('purchase-orders.index');
    }

    /**
     * Replace the purchase-order line items.
     *
     * @param  array<int, array<string, mixed>>  $items
     */
    private function syncItems(PurchaseOrder $purchaseOrder, array $items): void
    {
        $inventoryItems = InventoryItem::query()
            ->whereIn('id', collect($items)->pluck('inventory_item_id')->all())
            ->get(['id', 'item_name', 'unit'])
            ->keyBy('id');

        $purchaseOrder->items()->delete();

        foreach ($items as $item) {
            /** @var InventoryItem $inventoryItem */
            $inventoryItem = $inventoryItems->get((int) $item['inventory_item_id']);

            $purchaseOrder->items()->create([
                'purchase_request_item_id' => $item['purchase_request_item_id'] ?? null,
                'inventory_item_id' => $inventoryItem->getKey(),
                'item_description' => $inventoryItem->item_name,
                'unit' => $inventoryItem->unit,
                'ordered_quantity' => $item['ordered_quantity'],
                'unit_cost' => $item['unit_cost'],
                'remarks' => $item['remarks'] ?? null,
            ]);
        }
    }

    /**
     * Keep the linked purchase-request status aligned with existing purchase orders.
     */
    private function syncPurchaseRequestStatus(?int $purchaseRequestId): void
    {
        if (! filled($purchaseRequestId)) {
            return;
        }

        $purchaseRequest = PurchaseRequest::query()->find($purchaseRequestId);

        if ($purchaseRequest === null || $purchaseRequest->status === PurchaseRequestStatus::Cancelled) {
            return;
        }

        $hasOpenOrders = $purchaseRequest->purchaseOrders()
            ->where('status', '!=', PurchaseOrderStatus::Cancelled->value)
            ->exists();

        $nextStatus = $hasOpenOrders
            ? PurchaseRequestStatus::Ordered
            : ($purchaseRequest->status === PurchaseRequestStatus::Ordered
                ? PurchaseRequestStatus::Submitted
                : $purchaseRequest->status);

        if ($purchaseRequest->status !== $nextStatus) {
            $purchaseRequest->update([
                'status' => $nextStatus,
            ]);
        }
    }

    /**
     * Transform a purchase order into an index payload.
     *
     * @return array<string, mixed>
     */
    private function purchaseOrderListItem(Request $request, PurchaseOrder $purchaseOrder): array
    {
        $receiptCount = (int) ($purchaseOrder->getAttribute('receipts_count') ?? 0);
        $editable = ($request->user()?->can('update', $purchaseOrder) ?? false) && $receiptCount === 0;

        return [
            'id' => $purchaseOrder->getKey(),
            'po_no' => $purchaseOrder->po_no,
            'order_date' => optional($purchaseOrder->order_date)?->toDateString(),
            'expected_date' => optional($purchaseOrder->expected_date)?->toDateString(),
            'status' => $purchaseOrder->status->value,
            'status_label' => $purchaseOrder->status->label(),
            'supplier_reference' => $purchaseOrder->supplier_reference,
            'receipt_count' => $receiptCount,
            'attachment_count' => (int) ($purchaseOrder->getAttribute('attachments_count') ?? 0),
            'ordered_quantity_total' => (float) ($purchaseOrder->getAttribute('ordered_quantity_total') ?? 0),
            'received_quantity_total' => (float) ($purchaseOrder->getAttribute('received_quantity_total') ?? 0),
            'supplier' => [
                'id' => $purchaseOrder->supplier?->getKey(),
                'supplier_code' => $purchaseOrder->supplier?->supplier_code,
                'company_name' => $purchaseOrder->supplier?->company_name,
            ],
            'purchase_request' => [
                'id' => $purchaseOrder->purchaseRequest?->getKey(),
                'request_no' => $purchaseOrder->purchaseRequest?->request_no,
            ],
            'project' => [
                'id' => $purchaseOrder->project?->getKey(),
                'project_no' => $purchaseOrder->project?->project_no,
                'title' => $purchaseOrder->project?->title,
            ],
            'work_order' => [
                'id' => $purchaseOrder->workOrder?->getKey(),
                'work_order_no' => $purchaseOrder->workOrder?->work_order_no,
                'summary' => $purchaseOrder->workOrder?->summary,
            ],
            'can' => [
                'view' => $request->user()?->can('view', $purchaseOrder) ?? false,
                'update' => $editable,
                'delete' => $request->user()?->can('delete', $purchaseOrder) ?? false,
                'receive' => $request->user()?->can('receive', $purchaseOrder) ?? false,
            ],
        ];
    }

    /**
     * Transform a purchase order into a detailed payload.
     *
     * @return array<string, mixed>
     */
    private function purchaseOrderDetail(
        Request $request,
        PurchaseOrder $purchaseOrder,
        bool $includeRelations = true,
    ): array {
        $receiptCount = (int) ($purchaseOrder->getAttribute('receipts_count') ?? 0);
        $editable = ($request->user()?->can('update', $purchaseOrder) ?? false) && $receiptCount === 0;

        $detail = [
            'id' => $purchaseOrder->getKey(),
            'po_no' => $purchaseOrder->po_no,
            'purchase_request_id' => $purchaseOrder->purchase_request_id,
            'supplier_id' => $purchaseOrder->supplier_id,
            'project_id' => $purchaseOrder->project_id,
            'work_order_id' => $purchaseOrder->work_order_id,
            'order_date' => optional($purchaseOrder->order_date)?->toDateString(),
            'expected_date' => optional($purchaseOrder->expected_date)?->toDateString(),
            'status' => $purchaseOrder->status->value,
            'status_label' => $purchaseOrder->status->label(),
            'supplier_reference' => $purchaseOrder->supplier_reference,
            'remarks' => $purchaseOrder->remarks,
            'ordered_by' => $purchaseOrder->orderedBy?->name,
            'receipt_count' => $receiptCount,
            'attachment_count' => (int) ($purchaseOrder->getAttribute('attachments_count') ?? 0),
            'supplier' => [
                'id' => $purchaseOrder->supplier?->getKey(),
                'supplier_code' => $purchaseOrder->supplier?->supplier_code,
                'company_name' => $purchaseOrder->supplier?->company_name,
            ],
            'purchase_request' => [
                'id' => $purchaseOrder->purchaseRequest?->getKey(),
                'request_no' => $purchaseOrder->purchaseRequest?->request_no,
                'purpose' => $purchaseOrder->purchaseRequest?->purpose,
                'status' => $purchaseOrder->purchaseRequest?->status?->value,
                'status_label' => $purchaseOrder->purchaseRequest?->status?->label(),
            ],
            'project' => [
                'id' => $purchaseOrder->project?->getKey(),
                'project_no' => $purchaseOrder->project?->project_no,
                'title' => $purchaseOrder->project?->title,
            ],
            'work_order' => [
                'id' => $purchaseOrder->workOrder?->getKey(),
                'work_order_no' => $purchaseOrder->workOrder?->work_order_no,
                'summary' => $purchaseOrder->workOrder?->summary,
            ],
            'can' => [
                'update' => $editable,
                'delete' => $request->user()?->can('delete', $purchaseOrder) ?? false,
                'receive' => $request->user()?->can('receive', $purchaseOrder) ?? false,
                'upload_attachments' => ($request->user()?->hasPermissionTo('attachments.create') ?? false)
                    && ($request->user()?->can('update', $purchaseOrder) ?? false),
                'remove_attachments' => ($request->user()?->hasPermissionTo('attachments.delete') ?? false)
                    && ($request->user()?->can('update', $purchaseOrder) ?? false),
            ],
        ];

        $itemsPayload = $purchaseOrder->relationLoaded('items')
            ? $purchaseOrder->items->map(fn ($item) => [
                'id' => $item->getKey(),
                'purchase_request_item_id' => $item->purchase_request_item_id,
                'inventory_item_id' => $item->inventory_item_id,
                'item_description' => $item->item_description,
                'unit' => $item->unit,
                'ordered_quantity' => (float) $item->ordered_quantity,
                'unit_cost' => (float) $item->unit_cost,
                'received_quantity_total' => (float) ($item->getAttribute('received_quantity_total') ?? 0),
                'remaining_quantity' => round(
                    (float) $item->ordered_quantity - (float) ($item->getAttribute('received_quantity_total') ?? 0),
                    2,
                ),
                'remarks' => $item->remarks,
                'inventory_item' => [
                    'id' => $item->inventoryItem?->getKey(),
                    'item_code' => $item->inventoryItem?->item_code,
                    'item_name' => $item->inventoryItem?->item_name,
                    'unit' => $item->inventoryItem?->unit,
                ],
            ])->all()
            : [];

        if (! $includeRelations) {
            return [
                ...$detail,
                'items' => $itemsPayload,
            ];
        }

        return [
            ...$detail,
            'items' => $itemsPayload,
            'attachments' => $purchaseOrder->attachments
                ->map(fn (Attachment $attachment) => $this->attachmentPayload($attachment))
                ->all(),
            'receipts' => $purchaseOrder->receipts
                ->map(fn ($purchaseReceipt) => [
                    'id' => $purchaseReceipt->getKey(),
                    'receipt_no' => $purchaseReceipt->receipt_no,
                    'received_date' => optional($purchaseReceipt->received_date)?->toDateString(),
                    'received_by' => $purchaseReceipt->receivedBy?->name,
                    'received_quantity_total' => (float) ($purchaseReceipt->getAttribute('received_quantity_total') ?? 0),
                    'item_count' => (int) ($purchaseReceipt->getAttribute('items_count') ?? 0),
                    'attachment_count' => (int) ($purchaseReceipt->getAttribute('attachments_count') ?? 0),
                    'warehouse' => [
                        'id' => $purchaseReceipt->warehouse?->getKey(),
                        'warehouse_code' => $purchaseReceipt->warehouse?->warehouse_code,
                        'warehouse_name' => $purchaseReceipt->warehouse?->warehouse_name,
                    ],
                    'can' => [
                        'view' => $request->user()?->can('view', $purchaseReceipt) ?? false,
                    ],
                ])->all(),
        ];
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
     * Build purchase-order status options.
     *
     * @return array<int, array<string, string>>
     */
    private function statusOptions(bool $includeDerived = false): array
    {
        return collect(PurchaseOrderStatus::cases())
            ->filter(
                fn (PurchaseOrderStatus $status) => $includeDerived || ! in_array($status, [
                    PurchaseOrderStatus::PartiallyReceived,
                    PurchaseOrderStatus::FullyReceived,
                ], true),
            )
            ->map(fn (PurchaseOrderStatus $status) => [
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
     * Build purchase-request select options including line defaults.
     *
     * @return array<int, array<string, mixed>>
     */
    private function purchaseRequestOptions(): array
    {
        return PurchaseRequest::query()
            ->where('status', '!=', PurchaseRequestStatus::Cancelled->value)
            ->with(['items.inventoryItem:id,item_code,item_name,unit,standard_cost'])
            ->orderByDesc('request_date')
            ->orderByDesc('id')
            ->get(['id', 'supplier_id', 'project_id', 'work_order_id', 'request_no', 'purpose'])
            ->map(fn (PurchaseRequest $purchaseRequest) => [
                'value' => $purchaseRequest->getKey(),
                'label' => "{$purchaseRequest->request_no} - {$purchaseRequest->purpose}",
                'supplier_id' => $purchaseRequest->supplier_id,
                'project_id' => $purchaseRequest->project_id,
                'work_order_id' => $purchaseRequest->work_order_id,
                'items' => $purchaseRequest->items->map(fn ($item) => [
                    'purchase_request_item_id' => $item->getKey(),
                    'inventory_item_id' => $item->inventory_item_id,
                    'ordered_quantity' => (float) $item->requested_quantity,
                    'unit_cost' => $item->estimated_unit_cost === null
                        ? (float) ($item->inventoryItem?->standard_cost ?? 0)
                        : (float) $item->estimated_unit_cost,
                    'remarks' => $item->remarks,
                ])->all(),
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
