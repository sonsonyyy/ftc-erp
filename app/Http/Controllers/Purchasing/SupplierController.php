<?php

namespace App\Http\Controllers\Purchasing;

use App\Http\Controllers\Controller;
use App\Http\Requests\Suppliers\StoreSupplierRequest;
use App\Http\Requests\Suppliers\UpdateSupplierRequest;
use App\Models\Attachment;
use App\Models\PurchaseOrder;
use App\Models\PurchaseRequest;
use App\Models\Supplier;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SupplierController extends Controller
{
    private const PER_PAGE = 15;

    /**
     * Display a listing of suppliers.
     */
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', Supplier::class);

        $search = $request->string('search')->toString();
        $activity = $request->string('activity')->toString();

        $suppliers = Supplier::query()
            ->withCount(['purchaseRequests', 'purchaseOrders', 'attachments'])
            ->search($search)
            ->active($activity)
            ->orderBy('company_name')
            ->orderBy('supplier_code')
            ->paginate(self::PER_PAGE)
            ->withQueryString()
            ->through(fn (Supplier $supplier) => $this->supplierListItem($request, $supplier));

        return Inertia::render('suppliers/index', [
            'suppliers' => $suppliers,
            'filters' => [
                'search' => $search,
                'activity' => $activity,
            ],
            'activityOptions' => $this->activityOptions(),
            'can' => [
                'create' => $request->user()?->can('create', Supplier::class) ?? false,
            ],
        ]);
    }

    /**
     * Show the supplier creation form.
     */
    public function create(): Response
    {
        $this->authorize('create', Supplier::class);

        return Inertia::render('suppliers/create');
    }

    /**
     * Store a newly created supplier.
     */
    public function store(StoreSupplierRequest $request): RedirectResponse
    {
        $this->authorize('create', Supplier::class);

        $supplier = Supplier::query()->create($request->validated());

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => __('Supplier created.'),
        ]);

        return to_route('suppliers.show', $supplier);
    }

    /**
     * Display the selected supplier.
     */
    public function show(Request $request, Supplier $supplier): Response
    {
        $this->authorize('view', $supplier);

        $supplier->load([
            'attachments.uploadedBy',
            'purchaseRequests' => fn ($query) => $query
                ->withCount(['items', 'purchaseOrders', 'attachments'])
                ->orderByDesc('request_date')
                ->orderByDesc('id')
                ->limit(8),
            'purchaseOrders' => fn ($query) => $query
                ->withCount(['receipts', 'attachments'])
                ->withSum('items as ordered_quantity_total', 'ordered_quantity')
                ->withSum('receiptItems as received_quantity_total', 'received_quantity')
                ->orderByDesc('order_date')
                ->orderByDesc('id')
                ->limit(8),
        ])->loadCount(['purchaseRequests', 'purchaseOrders', 'attachments']);

        return Inertia::render('suppliers/show', [
            'supplier' => $this->supplierDetail($request, $supplier),
        ]);
    }

    /**
     * Show the edit form for the selected supplier.
     */
    public function edit(Request $request, Supplier $supplier): Response
    {
        $this->authorize('update', $supplier);

        $supplier->loadCount(['purchaseRequests', 'purchaseOrders', 'attachments']);

        return Inertia::render('suppliers/edit', [
            'supplier' => $this->supplierDetail($request, $supplier, includeRelations: false),
        ]);
    }

    /**
     * Update the selected supplier.
     */
    public function update(UpdateSupplierRequest $request, Supplier $supplier): RedirectResponse
    {
        $this->authorize('update', $supplier);

        $supplier->update($request->validated());

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => __('Supplier updated.'),
        ]);

        return to_route('suppliers.show', $supplier);
    }

    /**
     * Archive the selected supplier.
     */
    public function destroy(Supplier $supplier): RedirectResponse
    {
        $this->authorize('delete', $supplier);

        $supplier->delete();

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => __('Supplier archived.'),
        ]);

        return to_route('suppliers.index');
    }

    /**
     * Transform a supplier into a list row payload.
     *
     * @return array<string, mixed>
     */
    private function supplierListItem(Request $request, Supplier $supplier): array
    {
        return [
            'id' => $supplier->getKey(),
            'supplier_code' => $supplier->supplier_code,
            'company_name' => $supplier->company_name,
            'contact_person' => $supplier->contact_person,
            'phone' => $supplier->phone,
            'email' => $supplier->email,
            'payment_terms' => $supplier->payment_terms,
            'is_active' => $supplier->is_active,
            'activity_label' => $supplier->is_active ? 'Active' : 'Inactive',
            'purchase_request_count' => (int) ($supplier->getAttribute('purchase_requests_count') ?? 0),
            'purchase_order_count' => (int) ($supplier->getAttribute('purchase_orders_count') ?? 0),
            'attachment_count' => (int) ($supplier->getAttribute('attachments_count') ?? 0),
            'can' => [
                'view' => $request->user()?->can('view', $supplier) ?? false,
                'update' => $request->user()?->can('update', $supplier) ?? false,
                'delete' => $request->user()?->can('delete', $supplier) ?? false,
            ],
        ];
    }

    /**
     * Transform a supplier into a detailed Inertia payload.
     *
     * @return array<string, mixed>
     */
    private function supplierDetail(
        Request $request,
        Supplier $supplier,
        bool $includeRelations = true,
    ): array {
        $detail = [
            'id' => $supplier->getKey(),
            'supplier_code' => $supplier->supplier_code,
            'company_name' => $supplier->company_name,
            'contact_person' => $supplier->contact_person,
            'phone' => $supplier->phone,
            'email' => $supplier->email,
            'tin' => $supplier->tin,
            'address' => $supplier->address,
            'payment_terms' => $supplier->payment_terms,
            'is_active' => $supplier->is_active,
            'activity_label' => $supplier->is_active ? 'Active' : 'Inactive',
            'notes' => $supplier->notes,
            'purchase_request_count' => (int) ($supplier->getAttribute('purchase_requests_count') ?? 0),
            'purchase_order_count' => (int) ($supplier->getAttribute('purchase_orders_count') ?? 0),
            'attachment_count' => (int) ($supplier->getAttribute('attachments_count') ?? 0),
            'can' => [
                'update' => $request->user()?->can('update', $supplier) ?? false,
                'delete' => $request->user()?->can('delete', $supplier) ?? false,
                'create_purchase_request' => $request->user()?->can('create', PurchaseRequest::class) ?? false,
                'create_purchase_order' => $request->user()?->can('create', PurchaseOrder::class) ?? false,
                'upload_attachments' => ($request->user()?->hasPermissionTo('attachments.create') ?? false)
                    && ($request->user()?->can('update', $supplier) ?? false),
                'remove_attachments' => ($request->user()?->hasPermissionTo('attachments.delete') ?? false)
                    && ($request->user()?->can('update', $supplier) ?? false),
            ],
        ];

        if (! $includeRelations) {
            return $detail;
        }

        return [
            ...$detail,
            'attachments' => $supplier->attachments
                ->map(fn (Attachment $attachment) => $this->attachmentPayload($attachment))
                ->all(),
            'purchase_requests' => $supplier->purchaseRequests
                ->map(fn (PurchaseRequest $purchaseRequest) => [
                    'id' => $purchaseRequest->getKey(),
                    'request_no' => $purchaseRequest->request_no,
                    'status' => $purchaseRequest->status->value,
                    'status_label' => $purchaseRequest->status->label(),
                    'request_date' => optional($purchaseRequest->request_date)?->toDateString(),
                    'purpose' => $purchaseRequest->purpose,
                    'item_count' => (int) ($purchaseRequest->getAttribute('items_count') ?? 0),
                    'purchase_order_count' => (int) ($purchaseRequest->getAttribute('purchase_orders_count') ?? 0),
                    'attachment_count' => (int) ($purchaseRequest->getAttribute('attachments_count') ?? 0),
                    'can' => [
                        'view' => $request->user()?->can('view', $purchaseRequest) ?? false,
                    ],
                ])->all(),
            'purchase_orders' => $supplier->purchaseOrders
                ->map(fn (PurchaseOrder $purchaseOrder) => [
                    'id' => $purchaseOrder->getKey(),
                    'po_no' => $purchaseOrder->po_no,
                    'status' => $purchaseOrder->status->value,
                    'status_label' => $purchaseOrder->status->label(),
                    'order_date' => optional($purchaseOrder->order_date)?->toDateString(),
                    'receipt_count' => (int) ($purchaseOrder->getAttribute('receipts_count') ?? 0),
                    'attachment_count' => (int) ($purchaseOrder->getAttribute('attachments_count') ?? 0),
                    'ordered_quantity_total' => (float) ($purchaseOrder->getAttribute('ordered_quantity_total') ?? 0),
                    'received_quantity_total' => (float) ($purchaseOrder->getAttribute('received_quantity_total') ?? 0),
                    'can' => [
                        'view' => $request->user()?->can('view', $purchaseOrder) ?? false,
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
     * Build supplier activity filter options.
     *
     * @return array<int, array<string, string>>
     */
    private function activityOptions(): array
    {
        return [
            ['value' => 'active', 'label' => 'Active'],
            ['value' => 'inactive', 'label' => 'Inactive'],
        ];
    }
}
