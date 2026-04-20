<?php

namespace App\Http\Controllers\Billing;

use App\Actions\Billing\RecalculateInvoiceTotalsAction;
use App\Enums\InvoiceStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\Billing\StoreInvoiceRequest;
use App\Http\Requests\Billing\UpdateInvoiceRequest;
use App\Models\Attachment;
use App\Models\Customer;
use App\Models\Invoice;
use App\Models\Payment;
use App\Models\PaymentAllocation;
use App\Models\Project;
use App\Models\Quotation;
use App\Models\WorkOrder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class InvoiceController extends Controller
{
    private const PER_PAGE = 15;

    /**
     * Display a listing of invoices.
     */
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', Invoice::class);

        $search = $request->string('search')->toString();
        $customerId = $request->integer('customer') ?: null;
        $status = $request->string('status')->toString();
        $from = $this->normalizeDateFilter($request->string('from')->toString());
        $to = $this->normalizeDateFilter($request->string('to')->toString());

        $invoices = Invoice::query()
            ->with([
                'customer:id,customer_code,company_name',
                'quotation:id,quotation_no,subject',
                'project:id,project_no,title',
                'workOrder:id,work_order_no,summary',
            ])
            ->withCount(['attachments', 'paymentAllocations'])
            ->search($search)
            ->forCustomer($customerId)
            ->status($status)
            ->betweenInvoiceDates($from, $to)
            ->orderByDesc('invoice_date')
            ->orderByDesc('id')
            ->paginate(self::PER_PAGE)
            ->withQueryString()
            ->through(fn (Invoice $invoice) => $this->invoiceListItem($request, $invoice));

        return Inertia::render('invoices/index', [
            'invoices' => $invoices,
            'filters' => [
                'search' => $search,
                'customer' => $customerId,
                'status' => $status,
                'from' => $from,
                'to' => $to,
            ],
            'customerOptions' => $this->customerOptions(),
            'statusOptions' => $this->statusOptions(),
            'can' => [
                'create' => $request->user()?->can('create', Invoice::class) ?? false,
            ],
        ]);
    }

    /**
     * Show the invoice creation form.
     */
    public function create(Request $request): Response
    {
        $this->authorize('create', Invoice::class);

        $quotation = filled($request->integer('quotation'))
            ? Quotation::query()->find($request->integer('quotation'))
            : null;
        $project = filled($request->integer('project'))
            ? Project::query()->find($request->integer('project'))
            : null;
        $workOrder = filled($request->integer('work_order'))
            ? WorkOrder::query()->find($request->integer('work_order'))
            : null;

        return Inertia::render('invoices/create', [
            'customerOptions' => $this->customerOptions(),
            'quotationOptions' => $this->quotationOptions(),
            'projectOptions' => $this->projectOptions(),
            'workOrderOptions' => $this->workOrderOptions(),
            'statusOptions' => $this->statusOptions(manualOnly: true),
            'defaults' => [
                'invoice_no' => 'INV-'.now()->format('YmdHis'),
                'quotation_id' => $quotation?->getKey(),
                'customer_id' => $workOrder?->customer_id
                    ?? $project?->customer_id
                    ?? $quotation?->customer_id
                    ?? ($request->integer('customer') ?: null),
                'project_id' => $workOrder?->project_id
                    ?? $project?->getKey()
                    ?? null,
                'work_order_id' => $workOrder?->getKey(),
                'invoice_date' => now()->toDateString(),
                'due_date' => now()->addDays(30)->toDateString(),
                'tax_amount' => 0,
                'status' => InvoiceStatus::Draft->value,
            ],
        ]);
    }

    /**
     * Store a new invoice.
     */
    public function store(
        StoreInvoiceRequest $request,
        RecalculateInvoiceTotalsAction $recalculateInvoiceTotalsAction,
    ): RedirectResponse {
        $this->authorize('create', Invoice::class);

        $invoice = DB::transaction(function () use ($request, $recalculateInvoiceTotalsAction): Invoice {
            $validated = $request->validated();

            /** @var Invoice $invoice */
            $invoice = Invoice::query()->create([
                'invoice_no' => $validated['invoice_no'],
                'quotation_id' => $validated['quotation_id'] ?? null,
                'customer_id' => $validated['customer_id'],
                'project_id' => $validated['project_id'] ?? null,
                'work_order_id' => $validated['work_order_id'] ?? null,
                'issued_by_user_id' => $request->user()?->getKey(),
                'invoice_date' => $validated['invoice_date'],
                'due_date' => $validated['due_date'] ?? null,
                'tax_amount' => $validated['tax_amount'],
                'status' => $validated['status'],
                'remarks' => $validated['remarks'] ?? null,
            ]);

            $this->syncItems($invoice, $validated['items']);

            return $recalculateInvoiceTotalsAction->handle($invoice);
        });

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => __('Invoice created.'),
        ]);

        return to_route('invoices.show', $invoice);
    }

    /**
     * Display the selected invoice.
     */
    public function show(Request $request, Invoice $invoice): Response
    {
        $this->authorize('view', $invoice);

        $invoice->load([
            'customer:id,customer_code,company_name',
            'quotation:id,quotation_no,subject',
            'project:id,project_no,title',
            'workOrder:id,work_order_no,summary',
            'issuedBy:id,name',
            'attachments.uploadedBy:id,name',
            'items' => fn ($query) => $query->orderBy('id'),
            'paymentAllocations' => fn ($query) => $query
                ->with([
                    'payment:id,payment_no,payment_date,payment_method,reference_no',
                ])
                ->orderByDesc('created_at')
                ->orderByDesc('id'),
        ])->loadCount(['attachments', 'paymentAllocations']);

        return Inertia::render('invoices/show', [
            'invoice' => $this->invoiceDetail($request, $invoice),
        ]);
    }

    /**
     * Show the invoice edit form.
     */
    public function edit(Request $request, Invoice $invoice): Response
    {
        $this->authorize('update', $invoice);

        abort_if($invoice->paymentAllocations()->exists(), 403);

        $invoice->load([
            'customer:id,customer_code,company_name',
            'quotation:id,quotation_no,subject',
            'project:id,project_no,title',
            'workOrder:id,work_order_no,summary',
            'items' => fn ($query) => $query->orderBy('id'),
        ])->loadCount(['attachments', 'paymentAllocations']);

        return Inertia::render('invoices/edit', [
            'invoice' => $this->invoiceDetail($request, $invoice, includeRelations: false),
            'customerOptions' => $this->customerOptions(),
            'quotationOptions' => $this->quotationOptions($invoice->quotation_id),
            'projectOptions' => $this->projectOptions($invoice->project_id),
            'workOrderOptions' => $this->workOrderOptions($invoice->work_order_id),
            'statusOptions' => $this->statusOptions(manualOnly: true),
        ]);
    }

    /**
     * Update the selected invoice.
     */
    public function update(
        UpdateInvoiceRequest $request,
        Invoice $invoice,
        RecalculateInvoiceTotalsAction $recalculateInvoiceTotalsAction,
    ): RedirectResponse {
        $this->authorize('update', $invoice);

        abort_if($invoice->paymentAllocations()->exists(), 403);

        DB::transaction(function () use ($request, $invoice, $recalculateInvoiceTotalsAction): void {
            $validated = $request->validated();

            $invoice->update([
                'invoice_no' => $validated['invoice_no'],
                'quotation_id' => $validated['quotation_id'] ?? null,
                'customer_id' => $validated['customer_id'],
                'project_id' => $validated['project_id'] ?? null,
                'work_order_id' => $validated['work_order_id'] ?? null,
                'invoice_date' => $validated['invoice_date'],
                'due_date' => $validated['due_date'] ?? null,
                'tax_amount' => $validated['tax_amount'],
                'status' => $validated['status'],
                'remarks' => $validated['remarks'] ?? null,
            ]);

            $this->syncItems($invoice, $validated['items']);
            $recalculateInvoiceTotalsAction->handle($invoice);
        });

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => __('Invoice updated.'),
        ]);

        return to_route('invoices.show', $invoice);
    }

    /**
     * Archive the selected invoice.
     */
    public function destroy(Invoice $invoice): RedirectResponse
    {
        $this->authorize('delete', $invoice);

        $invoice->delete();

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => __('Invoice archived.'),
        ]);

        return to_route('invoices.index');
    }

    /**
     * Sync invoice line items from validated input.
     *
     * @param  array<int, array<string, mixed>>  $items
     */
    private function syncItems(Invoice $invoice, array $items): void
    {
        $invoice->items()->delete();

        foreach ($items as $item) {
            $quantity = round((float) $item['quantity'], 2);
            $unitPrice = round((float) $item['unit_price'], 2);

            $invoice->items()->create([
                'description' => $item['description'],
                'unit' => $item['unit'] ?? null,
                'quantity' => $quantity,
                'unit_price' => $unitPrice,
                'line_total' => round($quantity * $unitPrice, 2),
                'remarks' => $item['remarks'] ?? null,
            ]);
        }
    }

    /**
     * Build the list payload for an invoice.
     *
     * @return array<string, mixed>
     */
    private function invoiceListItem(Request $request, Invoice $invoice): array
    {
        $status = $invoice->currentStatus();

        return [
            'id' => $invoice->getKey(),
            'invoice_no' => $invoice->invoice_no,
            'invoice_date' => optional($invoice->invoice_date)?->toDateString(),
            'due_date' => optional($invoice->due_date)?->toDateString(),
            'subtotal' => (float) $invoice->subtotal,
            'tax_amount' => (float) $invoice->tax_amount,
            'total_amount' => (float) $invoice->total_amount,
            'balance_amount' => (float) $invoice->balance_amount,
            'paid_amount' => $invoice->paidAmount(),
            'status' => $status->value,
            'status_label' => $status->label(),
            'attachment_count' => (int) ($invoice->getAttribute('attachments_count') ?? 0),
            'payment_count' => (int) ($invoice->getAttribute('payment_allocations_count') ?? 0),
            'customer' => [
                'id' => $invoice->customer?->getKey(),
                'customer_code' => $invoice->customer?->customer_code,
                'company_name' => $invoice->customer?->company_name,
            ],
            'quotation' => [
                'id' => $invoice->quotation?->getKey(),
                'quotation_no' => $invoice->quotation?->quotation_no,
                'subject' => $invoice->quotation?->subject,
            ],
            'project' => [
                'id' => $invoice->project?->getKey(),
                'project_no' => $invoice->project?->project_no,
                'title' => $invoice->project?->title,
            ],
            'work_order' => [
                'id' => $invoice->workOrder?->getKey(),
                'work_order_no' => $invoice->workOrder?->work_order_no,
                'summary' => $invoice->workOrder?->summary,
            ],
            'can' => [
                'view' => $request->user()?->can('view', $invoice) ?? false,
                'update' => $request->user()?->can('update', $invoice) ?? false,
                'delete' => $request->user()?->can('delete', $invoice) ?? false,
                'record_payment' => ($request->user()?->can('create', Payment::class) ?? false) && $invoice->allowsPayments(),
            ],
        ];
    }

    /**
     * Build the detailed payload for an invoice.
     *
     * @return array<string, mixed>
     */
    private function invoiceDetail(Request $request, Invoice $invoice, bool $includeRelations = true): array
    {
        $status = $invoice->currentStatus();

        return [
            'id' => $invoice->getKey(),
            'invoice_no' => $invoice->invoice_no,
            'quotation_id' => $invoice->quotation_id,
            'customer_id' => $invoice->customer_id,
            'project_id' => $invoice->project_id,
            'work_order_id' => $invoice->work_order_id,
            'invoice_date' => optional($invoice->invoice_date)?->toDateString(),
            'due_date' => optional($invoice->due_date)?->toDateString(),
            'subtotal' => (float) $invoice->subtotal,
            'tax_amount' => (float) $invoice->tax_amount,
            'total_amount' => (float) $invoice->total_amount,
            'balance_amount' => (float) $invoice->balance_amount,
            'paid_amount' => $invoice->paidAmount(),
            'status' => $status->value,
            'status_label' => $status->label(),
            'stored_status' => $invoice->status->value,
            'stored_status_label' => $invoice->status->label(),
            'remarks' => $invoice->remarks,
            'issued_by' => $invoice->issuedBy?->name,
            'attachment_count' => (int) ($invoice->getAttribute('attachments_count') ?? 0),
            'payment_count' => (int) ($invoice->getAttribute('payment_allocations_count') ?? 0),
            'customer' => [
                'id' => $invoice->customer?->getKey(),
                'customer_code' => $invoice->customer?->customer_code,
                'company_name' => $invoice->customer?->company_name,
            ],
            'quotation' => [
                'id' => $invoice->quotation?->getKey(),
                'quotation_no' => $invoice->quotation?->quotation_no,
                'subject' => $invoice->quotation?->subject,
            ],
            'project' => [
                'id' => $invoice->project?->getKey(),
                'project_no' => $invoice->project?->project_no,
                'title' => $invoice->project?->title,
            ],
            'work_order' => [
                'id' => $invoice->workOrder?->getKey(),
                'work_order_no' => $invoice->workOrder?->work_order_no,
                'summary' => $invoice->workOrder?->summary,
            ],
            'items' => $invoice->items
                ->map(fn ($item) => [
                    'id' => $item->getKey(),
                    'description' => $item->description,
                    'unit' => $item->unit,
                    'quantity' => (float) $item->quantity,
                    'unit_price' => (float) $item->unit_price,
                    'line_total' => (float) $item->line_total,
                    'remarks' => $item->remarks,
                ])
                ->values()
                ->all(),
            'payments' => ! $includeRelations
                ? []
                : $invoice->paymentAllocations
                    ->filter(fn (PaymentAllocation $allocation) => $allocation->payment !== null)
                    ->map(fn (PaymentAllocation $allocation) => [
                        'id' => $allocation->payment?->getKey(),
                        'payment_no' => $allocation->payment?->payment_no,
                        'payment_date' => optional($allocation->payment?->payment_date)?->toDateString(),
                        'payment_method' => $allocation->payment?->payment_method,
                        'reference_no' => $allocation->payment?->reference_no,
                        'allocated_amount' => (float) $allocation->allocated_amount,
                        'can' => [
                            'view' => $allocation->payment !== null
                                ? ($request->user()?->can('view', $allocation->payment) ?? false)
                                : false,
                        ],
                    ])
                    ->values()
                    ->all(),
            'attachments' => ! $includeRelations
                ? []
                : $invoice->attachments
                    ->map(fn (Attachment $attachment) => $this->attachmentItem($attachment))
                    ->values()
                    ->all(),
            'can' => [
                'update' => $request->user()?->can('update', $invoice) ?? false,
                'delete' => $request->user()?->can('delete', $invoice) ?? false,
                'record_payment' => ($request->user()?->can('create', Payment::class) ?? false) && $invoice->allowsPayments(),
                'upload_attachments' => $request->user()?->can('create', Attachment::class) ?? false,
                'remove_attachments' => $request->user()?->can('delete', Attachment::class) ?? false,
            ],
        ];
    }

    /**
     * Build shared customer options.
     *
     * @return array<int, array{value:int,label:string}>
     */
    private function customerOptions(): array
    {
        return Customer::query()
            ->orderBy('company_name')
            ->get(['id', 'customer_code', 'company_name'])
            ->map(fn (Customer $customer) => [
                'value' => $customer->getKey(),
                'label' => "{$customer->customer_code} - {$customer->company_name}",
            ])
            ->all();
    }

    /**
     * Build shared quotation options.
     *
     * @return array<int, array{value:int,label:string,customer_id:int|null}>
     */
    private function quotationOptions(?int $includeId = null): array
    {
        return Quotation::query()
            ->when($includeId !== null, fn ($query) => $query->orWhereKey($includeId))
            ->orderByDesc('quotation_date')
            ->orderByDesc('id')
            ->get(['id', 'quotation_no', 'subject', 'customer_id'])
            ->map(fn (Quotation $quotation) => [
                'value' => $quotation->getKey(),
                'label' => "{$quotation->quotation_no} - {$quotation->subject}",
                'customer_id' => $quotation->customer_id,
            ])
            ->all();
    }

    /**
     * Build shared project options.
     *
     * @return array<int, array{value:int,label:string,customer_id:int|null,quotation_id:int|null}>
     */
    private function projectOptions(?int $includeId = null): array
    {
        return Project::query()
            ->when($includeId !== null, fn ($query) => $query->orWhereKey($includeId))
            ->orderByDesc('start_date')
            ->orderByDesc('id')
            ->get(['id', 'project_no', 'title', 'customer_id', 'quotation_id'])
            ->map(fn (Project $project) => [
                'value' => $project->getKey(),
                'label' => "{$project->project_no} - {$project->title}",
                'customer_id' => $project->customer_id,
                'quotation_id' => $project->quotation_id,
            ])
            ->all();
    }

    /**
     * Build shared work-order options.
     *
     * @return array<int, array{value:int,label:string,customer_id:int|null,project_id:int|null,quotation_id:int|null}>
     */
    private function workOrderOptions(?int $includeId = null): array
    {
        return WorkOrder::query()
            ->when($includeId !== null, fn ($query) => $query->orWhereKey($includeId))
            ->orderByDesc('scheduled_date')
            ->orderByDesc('id')
            ->get(['id', 'work_order_no', 'summary', 'customer_id', 'project_id', 'quotation_id'])
            ->map(fn (WorkOrder $workOrder) => [
                'value' => $workOrder->getKey(),
                'label' => "{$workOrder->work_order_no} - {$workOrder->summary}",
                'customer_id' => $workOrder->customer_id,
                'project_id' => $workOrder->project_id,
                'quotation_id' => $workOrder->quotation_id,
            ])
            ->all();
    }

    /**
     * Build invoice status options.
     *
     * @return array<int, array{value:string,label:string}>
     */
    private function statusOptions(bool $manualOnly = false): array
    {
        return collect(InvoiceStatus::cases())
            ->filter(fn (InvoiceStatus $status) => ! $manualOnly || $status->isManualSelection())
            ->map(fn (InvoiceStatus $status) => [
                'value' => $status->value,
                'label' => $status->label(),
            ])
            ->values()
            ->all();
    }

    /**
     * Normalize a date filter string.
     */
    private function normalizeDateFilter(string $value): ?string
    {
        return filled($value) ? $value : null;
    }

    /**
     * Build a frontend attachment payload.
     *
     * @return array<string, mixed>
     */
    private function attachmentItem(Attachment $attachment): array
    {
        return [
            'id' => $attachment->getKey(),
            'original_name' => $attachment->original_name,
            'mime_type' => $attachment->mime_type,
            'extension' => $attachment->extension,
            'file_size' => $attachment->file_size,
            'uploaded_at' => optional($attachment->created_at)?->toDateTimeString(),
            'uploaded_by' => $attachment->uploadedBy?->name,
            'download_url' => route('attachments.download', $attachment),
        ];
    }
}
