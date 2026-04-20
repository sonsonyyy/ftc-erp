<?php

namespace App\Http\Controllers\Billing;

use App\Actions\Billing\RecordPaymentAction;
use App\Enums\InvoiceStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\Billing\StorePaymentRequest;
use App\Models\Customer;
use App\Models\Invoice;
use App\Models\Payment;
use App\Models\PaymentAllocation;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PaymentController extends Controller
{
    private const PER_PAGE = 15;

    /**
     * Display a listing of payments.
     */
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', Payment::class);

        $search = $request->string('search')->toString();
        $customerId = $request->integer('customer') ?: null;
        $from = $this->normalizeDateFilter($request->string('from')->toString());
        $to = $this->normalizeDateFilter($request->string('to')->toString());

        $payments = Payment::query()
            ->with([
                'customer:id,customer_code,company_name',
                'receivedBy:id,name',
            ])
            ->withCount('allocations')
            ->search($search)
            ->forCustomer($customerId)
            ->betweenPaymentDates($from, $to)
            ->orderByDesc('payment_date')
            ->orderByDesc('id')
            ->paginate(self::PER_PAGE)
            ->withQueryString()
            ->through(fn (Payment $payment) => $this->paymentListItem($request, $payment));

        return Inertia::render('payments/index', [
            'payments' => $payments,
            'filters' => [
                'search' => $search,
                'customer' => $customerId,
                'from' => $from,
                'to' => $to,
            ],
            'customerOptions' => $this->customerOptions(),
            'can' => [
                'create' => $request->user()?->can('create', Payment::class) ?? false,
            ],
        ]);
    }

    /**
     * Show the payment creation form.
     */
    public function create(Request $request): Response
    {
        $this->authorize('create', Payment::class);

        $invoice = filled($request->integer('invoice'))
            ? Invoice::query()->find($request->integer('invoice'))
            : null;

        return Inertia::render('payments/create', [
            'customerOptions' => $this->customerOptions(),
            'invoiceOptions' => $this->invoiceOptions($invoice?->getKey()),
            'paymentMethodOptions' => $this->paymentMethodOptions(),
            'defaults' => [
                'payment_no' => 'PAY-'.now()->format('YmdHis'),
                'customer_id' => $invoice?->customer_id ?? ($request->integer('customer') ?: null),
                'payment_date' => now()->toDateString(),
                'amount' => $invoice === null ? 0 : (float) $invoice->balance_amount,
                'payment_method' => 'Cash',
                'reference_no' => '',
                'remarks' => '',
                'allocations' => $invoice === null ? [] : [[
                    'invoice_id' => $invoice->getKey(),
                    'allocated_amount' => (float) $invoice->balance_amount,
                ]],
            ],
        ]);
    }

    /**
     * Store a new payment with allocations.
     */
    public function store(
        StorePaymentRequest $request,
        RecordPaymentAction $recordPaymentAction,
    ): RedirectResponse {
        $this->authorize('create', Payment::class);

        $payment = $recordPaymentAction->handle(
            $request->validated(),
            $request->user(),
        );

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => __('Payment recorded.'),
        ]);

        return to_route('payments.show', $payment);
    }

    /**
     * Display the selected payment.
     */
    public function show(Request $request, Payment $payment): Response
    {
        $this->authorize('view', $payment);

        $payment->load([
            'customer:id,customer_code,company_name',
            'receivedBy:id,name',
            'allocations' => fn ($query) => $query
                ->with([
                    'invoice:id,invoice_no,quotation_id,project_id,work_order_id,invoice_date,due_date,total_amount,balance_amount,status',
                    'invoice.quotation:id,quotation_no,subject',
                    'invoice.project:id,project_no,title',
                    'invoice.workOrder:id,work_order_no,summary',
                ])
                ->orderByDesc('created_at')
                ->orderByDesc('id'),
        ])->loadCount('allocations');

        return Inertia::render('payments/show', [
            'payment' => $this->paymentDetail($request, $payment),
        ]);
    }

    /**
     * Build the list payload for a payment.
     *
     * @return array<string, mixed>
     */
    private function paymentListItem(Request $request, Payment $payment): array
    {
        return [
            'id' => $payment->getKey(),
            'payment_no' => $payment->payment_no,
            'payment_date' => optional($payment->payment_date)?->toDateString(),
            'amount' => (float) $payment->amount,
            'payment_method' => $payment->payment_method,
            'reference_no' => $payment->reference_no,
            'allocation_count' => (int) ($payment->getAttribute('allocations_count') ?? 0),
            'recorded_by' => $payment->receivedBy?->name,
            'customer' => [
                'id' => $payment->customer?->getKey(),
                'customer_code' => $payment->customer?->customer_code,
                'company_name' => $payment->customer?->company_name,
            ],
            'can' => [
                'view' => $request->user()?->can('view', $payment) ?? false,
            ],
        ];
    }

    /**
     * Build the detailed payload for a payment.
     *
     * @return array<string, mixed>
     */
    private function paymentDetail(Request $request, Payment $payment): array
    {
        return [
            'id' => $payment->getKey(),
            'payment_no' => $payment->payment_no,
            'customer_id' => $payment->customer_id,
            'payment_date' => optional($payment->payment_date)?->toDateString(),
            'amount' => (float) $payment->amount,
            'payment_method' => $payment->payment_method,
            'reference_no' => $payment->reference_no,
            'remarks' => $payment->remarks,
            'allocation_count' => (int) ($payment->getAttribute('allocations_count') ?? 0),
            'recorded_by' => $payment->receivedBy?->name,
            'customer' => [
                'id' => $payment->customer?->getKey(),
                'customer_code' => $payment->customer?->customer_code,
                'company_name' => $payment->customer?->company_name,
            ],
            'allocations' => $payment->allocations
                ->filter(fn (PaymentAllocation $allocation) => $allocation->invoice !== null)
                ->map(function (PaymentAllocation $allocation) use ($request): array {
                    $invoice = $allocation->invoice;
                    $status = $invoice?->currentStatus();

                    return [
                        'id' => $allocation->getKey(),
                        'allocated_amount' => (float) $allocation->allocated_amount,
                        'invoice' => [
                            'id' => $invoice?->getKey(),
                            'invoice_no' => $invoice?->invoice_no,
                            'invoice_date' => optional($invoice?->invoice_date)?->toDateString(),
                            'due_date' => optional($invoice?->due_date)?->toDateString(),
                            'total_amount' => $invoice === null ? 0 : (float) $invoice->total_amount,
                            'balance_amount' => $invoice === null ? 0 : (float) $invoice->balance_amount,
                            'status' => $status?->value,
                            'status_label' => $status?->label(),
                            'quotation' => [
                                'id' => $invoice?->quotation?->getKey(),
                                'quotation_no' => $invoice?->quotation?->quotation_no,
                                'subject' => $invoice?->quotation?->subject,
                            ],
                            'project' => [
                                'id' => $invoice?->project?->getKey(),
                                'project_no' => $invoice?->project?->project_no,
                                'title' => $invoice?->project?->title,
                            ],
                            'work_order' => [
                                'id' => $invoice?->workOrder?->getKey(),
                                'work_order_no' => $invoice?->workOrder?->work_order_no,
                                'summary' => $invoice?->workOrder?->summary,
                            ],
                        ],
                        'can' => [
                            'view_invoice' => $invoice !== null
                                ? ($request->user()?->can('view', $invoice) ?? false)
                                : false,
                        ],
                    ];
                })
                ->values()
                ->all(),
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
     * Build open-invoice options for payment allocation.
     *
     * @return array<int, array<string, mixed>>
     */
    private function invoiceOptions(?int $includeId = null): array
    {
        return Invoice::query()
            ->with([
                'customer:id,customer_code,company_name',
            ])
            ->where(function ($query) use ($includeId): void {
                $query
                    ->where('balance_amount', '>', 0)
                    ->whereNotIn('status', [
                        InvoiceStatus::Draft->value,
                        InvoiceStatus::Cancelled->value,
                        InvoiceStatus::Paid->value,
                    ]);

                if ($includeId !== null) {
                    $query->orWhereKey($includeId);
                }
            })
            ->orderByDesc('invoice_date')
            ->orderByDesc('id')
            ->get()
            ->map(function (Invoice $invoice): array {
                $status = $invoice->currentStatus();

                return [
                    'value' => $invoice->getKey(),
                    'label' => "{$invoice->invoice_no} - {$invoice->customer?->company_name}",
                    'customer_id' => $invoice->customer_id,
                    'remaining_balance' => (float) $invoice->balance_amount,
                    'invoice_date' => optional($invoice->invoice_date)?->toDateString(),
                    'due_date' => optional($invoice->due_date)?->toDateString(),
                    'status' => $status->value,
                    'status_label' => $status->label(),
                ];
            })
            ->all();
    }

    /**
     * Build shared payment method options.
     *
     * @return array<int, array{value:string,label:string}>
     */
    private function paymentMethodOptions(): array
    {
        return collect([
            'Cash',
            'Check',
            'Bank Transfer',
            'Online Transfer',
        ])->map(fn (string $method) => [
            'value' => $method,
            'label' => $method,
        ])->all();
    }

    /**
     * Normalize a date filter string.
     */
    private function normalizeDateFilter(string $value): ?string
    {
        return filled($value) ? $value : null;
    }
}
