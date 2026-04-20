<?php

namespace App\Http\Controllers\Purchasing;

use App\Actions\Purchasing\ReceivePurchaseOrderAction;
use App\Http\Controllers\Controller;
use App\Http\Requests\Purchasing\StorePurchaseReceiptRequest;
use App\Models\Attachment;
use App\Models\PurchaseOrder;
use App\Models\PurchaseReceipt;
use App\Models\Supplier;
use App\Models\Warehouse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PurchaseReceiptController extends Controller
{
    private const PER_PAGE = 15;

    /**
     * Display a listing of purchase receipts.
     */
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', PurchaseReceipt::class);

        $search = $request->string('search')->toString();
        $supplierId = $request->integer('supplier') ?: null;
        $warehouseId = $request->integer('warehouse') ?: null;

        $purchaseReceipts = PurchaseReceipt::query()
            ->with([
                'purchaseOrder:id,po_no,supplier_id',
                'purchaseOrder.supplier:id,supplier_code,company_name',
                'warehouse:id,warehouse_code,warehouse_name',
                'receivedBy:id,name',
            ])
            ->withCount(['items', 'attachments'])
            ->withSum('items as received_quantity_total', 'received_quantity')
            ->when($search !== '', function ($query) use ($search): void {
                $query->where(function ($builder) use ($search): void {
                    $builder
                        ->where('receipt_no', 'like', "%{$search}%")
                        ->orWhere('supplier_reference', 'like', "%{$search}%")
                        ->orWhere('remarks', 'like', "%{$search}%")
                        ->orWhereHas('purchaseOrder', function ($purchaseOrderQuery) use ($search): void {
                            $purchaseOrderQuery
                                ->where('po_no', 'like', "%{$search}%")
                                ->orWhereHas('supplier', function ($supplierQuery) use ($search): void {
                                    $supplierQuery
                                        ->where('supplier_code', 'like', "%{$search}%")
                                        ->orWhere('company_name', 'like', "%{$search}%");
                                });
                        })
                        ->orWhereHas('warehouse', function ($warehouseQuery) use ($search): void {
                            $warehouseQuery
                                ->where('warehouse_code', 'like', "%{$search}%")
                                ->orWhere('warehouse_name', 'like', "%{$search}%");
                        });
                });
            })
            ->when(filled($supplierId), fn ($query) => $query->whereHas(
                'purchaseOrder',
                fn ($purchaseOrderQuery) => $purchaseOrderQuery->where('supplier_id', $supplierId),
            ))
            ->when(filled($warehouseId), fn ($query) => $query->where('warehouse_id', $warehouseId))
            ->orderByDesc('received_date')
            ->orderByDesc('id')
            ->paginate(self::PER_PAGE)
            ->withQueryString()
            ->through(fn (PurchaseReceipt $purchaseReceipt) => $this->purchaseReceiptListItem($request, $purchaseReceipt));

        return Inertia::render('purchase-receipts/index', [
            'purchaseReceipts' => $purchaseReceipts,
            'filters' => [
                'search' => $search,
                'supplier' => $supplierId,
                'warehouse' => $warehouseId,
            ],
            'supplierOptions' => $this->supplierOptions(),
            'warehouseOptions' => $this->warehouseOptions(),
        ]);
    }

    /**
     * Show the receipt form for the selected purchase order.
     */
    public function create(PurchaseOrder $purchaseOrder): Response
    {
        $this->authorize('receive', $purchaseOrder);

        $purchaseOrder->load([
            'supplier:id,supplier_code,company_name',
            'items' => fn ($query) => $query
                ->with([
                    'inventoryItem:id,item_code,item_name,unit',
                ])
                ->withSum('receiptItems as received_quantity_total', 'received_quantity')
                ->orderBy('id'),
        ]);

        return Inertia::render('purchase-receipts/create', [
            'purchaseOrder' => [
                'id' => $purchaseOrder->getKey(),
                'po_no' => $purchaseOrder->po_no,
                'status' => $purchaseOrder->status->value,
                'status_label' => $purchaseOrder->status->label(),
                'supplier' => [
                    'id' => $purchaseOrder->supplier?->getKey(),
                    'supplier_code' => $purchaseOrder->supplier?->supplier_code,
                    'company_name' => $purchaseOrder->supplier?->company_name,
                ],
                'items' => $purchaseOrder->items
                    ->map(fn ($item) => [
                        'purchase_order_item_id' => $item->getKey(),
                        'inventory_item_id' => $item->inventory_item_id,
                        'item_description' => $item->item_description,
                        'unit' => $item->unit,
                        'ordered_quantity' => (float) $item->ordered_quantity,
                        'received_quantity_total' => (float) ($item->getAttribute('received_quantity_total') ?? 0),
                        'remaining_quantity' => round(
                            (float) $item->ordered_quantity - (float) ($item->getAttribute('received_quantity_total') ?? 0),
                            2,
                        ),
                        'unit_cost' => (float) $item->unit_cost,
                        'inventory_item' => [
                            'id' => $item->inventoryItem?->getKey(),
                            'item_code' => $item->inventoryItem?->item_code,
                            'item_name' => $item->inventoryItem?->item_name,
                            'unit' => $item->inventoryItem?->unit,
                        ],
                    ])
                    ->filter(fn (array $item) => $item['remaining_quantity'] > 0)
                    ->values()
                    ->all(),
            ],
            'warehouseOptions' => $this->warehouseOptions(),
            'defaults' => [
                'receipt_no' => 'RCV-'.now()->format('YmdHis'),
                'received_date' => now()->toDateString(),
                'supplier_reference' => $purchaseOrder->supplier_reference,
            ],
        ]);
    }

    /**
     * Store a new purchase receipt for the selected purchase order.
     */
    public function store(
        StorePurchaseReceiptRequest $request,
        PurchaseOrder $purchaseOrder,
        ReceivePurchaseOrderAction $receivePurchaseOrderAction,
    ): RedirectResponse {
        $this->authorize('receive', $purchaseOrder);

        $purchaseReceipt = $receivePurchaseOrderAction->handle(
            $purchaseOrder,
            $request->validated(),
            $request->user(),
        );

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => __('Purchase receipt recorded.'),
        ]);

        return to_route('purchase-receipts.show', $purchaseReceipt);
    }

    /**
     * Display the selected purchase receipt.
     */
    public function show(Request $request, PurchaseReceipt $purchaseReceipt): Response
    {
        $this->authorize('view', $purchaseReceipt);

        $purchaseReceipt->load([
            'purchaseOrder:id,po_no,supplier_id,purchase_request_id,project_id,work_order_id,status',
            'purchaseOrder.supplier:id,supplier_code,company_name',
            'purchaseOrder.purchaseRequest:id,request_no',
            'purchaseOrder.project:id,project_no,title',
            'purchaseOrder.workOrder:id,work_order_no,summary',
            'warehouse:id,warehouse_code,warehouse_name',
            'receivedBy:id,name',
            'attachments.uploadedBy',
            'items' => fn ($query) => $query
                ->with([
                    'inventoryItem:id,item_code,item_name,unit',
                    'purchaseOrderItem:id,purchase_order_id,ordered_quantity,unit_cost',
                ])
                ->orderBy('id'),
        ])->loadCount(['items', 'attachments']);

        return Inertia::render('purchase-receipts/show', [
            'purchaseReceipt' => $this->purchaseReceiptDetail($request, $purchaseReceipt),
        ]);
    }

    /**
     * Transform a purchase receipt into an index payload.
     *
     * @return array<string, mixed>
     */
    private function purchaseReceiptListItem(Request $request, PurchaseReceipt $purchaseReceipt): array
    {
        return [
            'id' => $purchaseReceipt->getKey(),
            'receipt_no' => $purchaseReceipt->receipt_no,
            'received_date' => optional($purchaseReceipt->received_date)?->toDateString(),
            'supplier_reference' => $purchaseReceipt->supplier_reference,
            'received_by' => $purchaseReceipt->receivedBy?->name,
            'item_count' => (int) ($purchaseReceipt->getAttribute('items_count') ?? 0),
            'attachment_count' => (int) ($purchaseReceipt->getAttribute('attachments_count') ?? 0),
            'received_quantity_total' => (float) ($purchaseReceipt->getAttribute('received_quantity_total') ?? 0),
            'purchase_order' => [
                'id' => $purchaseReceipt->purchaseOrder?->getKey(),
                'po_no' => $purchaseReceipt->purchaseOrder?->po_no,
            ],
            'supplier' => [
                'id' => $purchaseReceipt->purchaseOrder?->supplier?->getKey(),
                'supplier_code' => $purchaseReceipt->purchaseOrder?->supplier?->supplier_code,
                'company_name' => $purchaseReceipt->purchaseOrder?->supplier?->company_name,
            ],
            'warehouse' => [
                'id' => $purchaseReceipt->warehouse?->getKey(),
                'warehouse_code' => $purchaseReceipt->warehouse?->warehouse_code,
                'warehouse_name' => $purchaseReceipt->warehouse?->warehouse_name,
            ],
            'can' => [
                'view' => $request->user()?->can('view', $purchaseReceipt) ?? false,
            ],
        ];
    }

    /**
     * Transform a purchase receipt into a detailed payload.
     *
     * @return array<string, mixed>
     */
    private function purchaseReceiptDetail(Request $request, PurchaseReceipt $purchaseReceipt): array
    {
        return [
            'id' => $purchaseReceipt->getKey(),
            'receipt_no' => $purchaseReceipt->receipt_no,
            'purchase_order_id' => $purchaseReceipt->purchase_order_id,
            'warehouse_id' => $purchaseReceipt->warehouse_id,
            'received_date' => optional($purchaseReceipt->received_date)?->toDateString(),
            'supplier_reference' => $purchaseReceipt->supplier_reference,
            'remarks' => $purchaseReceipt->remarks,
            'received_by' => $purchaseReceipt->receivedBy?->name,
            'item_count' => (int) ($purchaseReceipt->getAttribute('items_count') ?? 0),
            'attachment_count' => (int) ($purchaseReceipt->getAttribute('attachments_count') ?? 0),
            'purchase_order' => [
                'id' => $purchaseReceipt->purchaseOrder?->getKey(),
                'po_no' => $purchaseReceipt->purchaseOrder?->po_no,
                'status' => $purchaseReceipt->purchaseOrder?->status?->value,
                'status_label' => $purchaseReceipt->purchaseOrder?->status?->label(),
            ],
            'supplier' => [
                'id' => $purchaseReceipt->purchaseOrder?->supplier?->getKey(),
                'supplier_code' => $purchaseReceipt->purchaseOrder?->supplier?->supplier_code,
                'company_name' => $purchaseReceipt->purchaseOrder?->supplier?->company_name,
            ],
            'purchase_request' => [
                'id' => $purchaseReceipt->purchaseOrder?->purchaseRequest?->getKey(),
                'request_no' => $purchaseReceipt->purchaseOrder?->purchaseRequest?->request_no,
            ],
            'project' => [
                'id' => $purchaseReceipt->purchaseOrder?->project?->getKey(),
                'project_no' => $purchaseReceipt->purchaseOrder?->project?->project_no,
                'title' => $purchaseReceipt->purchaseOrder?->project?->title,
            ],
            'work_order' => [
                'id' => $purchaseReceipt->purchaseOrder?->workOrder?->getKey(),
                'work_order_no' => $purchaseReceipt->purchaseOrder?->workOrder?->work_order_no,
                'summary' => $purchaseReceipt->purchaseOrder?->workOrder?->summary,
            ],
            'warehouse' => [
                'id' => $purchaseReceipt->warehouse?->getKey(),
                'warehouse_code' => $purchaseReceipt->warehouse?->warehouse_code,
                'warehouse_name' => $purchaseReceipt->warehouse?->warehouse_name,
            ],
            'attachments' => $purchaseReceipt->attachments
                ->map(fn (Attachment $attachment) => $this->attachmentPayload($attachment))
                ->all(),
            'items' => $purchaseReceipt->items
                ->map(fn ($item) => [
                    'id' => $item->getKey(),
                    'received_quantity' => (float) $item->received_quantity,
                    'unit_cost' => (float) $item->unit_cost,
                    'remarks' => $item->remarks,
                    'inventory_item' => [
                        'id' => $item->inventoryItem?->getKey(),
                        'item_code' => $item->inventoryItem?->item_code,
                        'item_name' => $item->inventoryItem?->item_name,
                        'unit' => $item->inventoryItem?->unit,
                    ],
                    'purchase_order_item' => [
                        'id' => $item->purchaseOrderItem?->getKey(),
                        'ordered_quantity' => $item->purchaseOrderItem === null
                            ? null
                            : (float) $item->purchaseOrderItem->ordered_quantity,
                    ],
                ])->all(),
            'can' => [
                'upload_attachments' => ($request->user()?->hasPermissionTo('attachments.create') ?? false)
                    && ($request->user()?->can('update', $purchaseReceipt) ?? false),
                'remove_attachments' => ($request->user()?->hasPermissionTo('attachments.delete') ?? false)
                    && ($request->user()?->can('update', $purchaseReceipt) ?? false),
            ],
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
     * Build supplier filter options.
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
     * Build warehouse options.
     *
     * @return array<int, array<string, int|string>>
     */
    private function warehouseOptions(): array
    {
        return Warehouse::query()
            ->where('is_active', true)
            ->orderBy('warehouse_name')
            ->get(['id', 'warehouse_code', 'warehouse_name'])
            ->map(fn (Warehouse $warehouse) => [
                'value' => $warehouse->getKey(),
                'label' => "{$warehouse->warehouse_code} - {$warehouse->warehouse_name}",
            ])->all();
    }
}
