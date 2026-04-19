<?php

namespace App\Http\Controllers\Quotations;

use App\Actions\Quotations\UpdateQuotationStatusAction;
use App\Enums\QuotationStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\Quotations\StoreQuotationRequest;
use App\Http\Requests\Quotations\UpdateQuotationRequest;
use App\Http\Requests\Quotations\UpdateQuotationStatusRequest;
use App\Models\Attachment;
use App\Models\Customer;
use App\Models\CustomerSite;
use App\Models\Quotation;
use App\Models\QuotationStatusLog;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class QuotationController extends Controller
{
    private const PER_PAGE = 15;

    private const KPI_TOP_LIMIT = 5;

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', Quotation::class);

        $search = $request->string('search')->toString();
        $customerId = $request->integer('customer') ?: null;
        $status = $request->string('status')->toString();
        $from = $this->normalizeDateFilter($request->string('from')->toString());
        $to = $this->normalizeDateFilter($request->string('to')->toString());

        $quotations = Quotation::query()
            ->with([
                'customer:id,customer_code,company_name',
                'customerSite:id,customer_id,site_code,site_name',
                'assignedSalesUser:id,name',
            ])
            ->withCount('attachments')
            ->search($search)
            ->forCustomer($customerId)
            ->status($status)
            ->betweenQuotationDates($from, $to)
            ->orderByDesc('quotation_date')
            ->orderByDesc('id')
            ->paginate(self::PER_PAGE)
            ->withQueryString()
            ->through(fn (Quotation $quotation) => $this->quotationListItem($request, $quotation));

        return Inertia::render('quotations/index', [
            'quotations' => $quotations,
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
                'create' => $request->user()?->can('create', Quotation::class) ?? false,
                'view_kpi' => $request->user()?->can('viewAny', Quotation::class) ?? false,
            ],
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(Request $request): Response
    {
        $this->authorize('create', Quotation::class);

        return Inertia::render('quotations/create', [
            'customerOptions' => $this->customerOptions(),
            'siteOptions' => $this->siteOptions(),
            'userOptions' => $this->userOptions(),
            'statusOptions' => $this->statusOptions(),
            'defaults' => [
                'customer_id' => $request->integer('customer') ?: null,
                'customer_site_id' => $request->integer('site') ?: null,
                'status' => QuotationStatus::Draft->value,
                'quotation_date' => now()->toDateString(),
            ],
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(
        StoreQuotationRequest $request,
        UpdateQuotationStatusAction $updateQuotationStatusAction,
    ): RedirectResponse {
        $this->authorize('create', Quotation::class);

        $quotation = DB::transaction(function () use ($request, $updateQuotationStatusAction): Quotation {
            $validated = $request->validated();
            $status = QuotationStatus::from($validated['status']);

            if ($status->recordsMaterializedAt() && blank($validated['materialized_at'] ?? null)) {
                $validated['materialized_at'] = now();
            }

            /** @var Quotation $quotation */
            $quotation = Quotation::query()->create($validated);
            $updateQuotationStatusAction->recordInitialStatus($quotation, $request->user());

            return $quotation;
        });

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => __('Quotation record created.'),
        ]);

        return to_route('quotations.show', $quotation);
    }

    /**
     * Display the specified resource.
     */
    public function show(Request $request, Quotation $quotation): Response
    {
        $this->authorize('view', $quotation);

        $quotation->load([
            'customer:id,customer_code,company_name',
            'customerSite:id,customer_id,site_code,site_name,address,city,province',
            'preparedBy:id,name',
            'assignedSalesUser:id,name',
            'attachments.uploadedBy',
            'statusLogs.changedBy:id,name',
        ])->loadCount('attachments');

        return Inertia::render('quotations/show', [
            'quotation' => $this->quotationDetail($request, $quotation),
            'statusOptions' => $this->statusOptions(),
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Request $request, Quotation $quotation): Response
    {
        $this->authorize('update', $quotation);

        $quotation->load([
            'customer:id,customer_code,company_name',
            'customerSite:id,customer_id,site_code,site_name',
            'preparedBy:id,name',
            'assignedSalesUser:id,name',
        ])->loadCount('attachments');

        return Inertia::render('quotations/edit', [
            'quotation' => $this->quotationDetail($request, $quotation, includeRelations: false),
            'customerOptions' => $this->customerOptions(),
            'siteOptions' => $this->siteOptions(),
            'userOptions' => $this->userOptions(),
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateQuotationRequest $request, Quotation $quotation): RedirectResponse
    {
        $this->authorize('update', $quotation);

        $quotation->update($request->validated());

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => __('Quotation updated.'),
        ]);

        return to_route('quotations.show', $quotation);
    }

    /**
     * Update the quotation status and append a status log.
     */
    public function updateStatus(
        UpdateQuotationStatusRequest $request,
        Quotation $quotation,
        UpdateQuotationStatusAction $updateQuotationStatusAction,
    ): RedirectResponse {
        $this->authorize('changeStatus', $quotation);

        $validated = $request->validated();

        $updateQuotationStatusAction->handle(
            $quotation,
            QuotationStatus::from($validated['status']),
            $request->user(),
            $validated['remarks'] ?? null,
            $validated['lost_reason'] ?? null,
            $validated['materialized_at'] ?? null,
        );

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => __('Quotation status updated.'),
        ]);

        return back();
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Quotation $quotation): RedirectResponse
    {
        $this->authorize('delete', $quotation);

        $quotation->delete();

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => __('Quotation archived.'),
        ]);

        return to_route('quotations.index');
    }

    /**
     * Display the quotation KPI dashboard.
     */
    public function kpi(Request $request): Response
    {
        $this->authorize('viewAny', Quotation::class);

        $range = $this->resolveKpiRange($request);
        $customerId = $request->integer('customer') ?: null;
        $baseQuery = Quotation::query()
            ->forCustomer($customerId)
            ->betweenQuotationDates($range['from'], $range['to']);

        $submittedStatuses = $this->submittedStatuses();
        $pendingStatuses = $this->pendingStatuses();

        $statusBreakdownCounts = (clone $baseQuery)
            ->selectRaw('status, COUNT(*) as aggregate_count')
            ->groupBy('status')
            ->pluck('aggregate_count', 'status');

        $totalSubmitted = (clone $baseQuery)
            ->whereIn('status', $submittedStatuses)
            ->count();

        $totalAwarded = (clone $baseQuery)
            ->where('status', QuotationStatus::Awarded->value)
            ->count();

        $totalQuotationValue = (float) (clone $baseQuery)
            ->whereIn('status', $submittedStatuses)
            ->sum('quotation_amount');

        $awardedValue = (float) (clone $baseQuery)
            ->where('status', QuotationStatus::Awarded->value)
            ->sum('quotation_amount');

        $pendingCount = (clone $baseQuery)
            ->whereIn('status', $pendingStatuses)
            ->count();

        $lostCount = (clone $baseQuery)
            ->where('status', QuotationStatus::Lost->value)
            ->count();

        $averageDaysToMaterialize = (clone $baseQuery)
            ->where('status', QuotationStatus::Awarded->value)
            ->whereNotNull('materialized_at')
            ->get(['quotation_date', 'materialized_at'])
            ->avg(function (Quotation $quotation): int {
                return $quotation->quotation_date?->diffInDays($quotation->materialized_at ?? now()) ?? 0;
            });

        $topCustomersByQuotationValue = (clone $baseQuery)
            ->whereIn('status', $submittedStatuses)
            ->selectRaw('customer_id, COUNT(*) as quotation_count, SUM(quotation_amount) as total_value')
            ->with('customer:id,customer_code,company_name')
            ->groupBy('customer_id')
            ->orderByDesc('total_value')
            ->limit(self::KPI_TOP_LIMIT)
            ->get()
            ->map(fn (Quotation $quotation) => [
                'customer' => [
                    'id' => $quotation->customer?->getKey(),
                    'customer_code' => $quotation->customer?->customer_code,
                    'company_name' => $quotation->customer?->company_name,
                ],
                'quotation_count' => (int) $quotation->getAttribute('quotation_count'),
                'total_value' => (float) $quotation->getAttribute('total_value'),
            ])->all();

        $topCustomersByAwardedValue = (clone $baseQuery)
            ->where('status', QuotationStatus::Awarded->value)
            ->selectRaw('customer_id, COUNT(*) as quotation_count, SUM(quotation_amount) as total_value')
            ->with('customer:id,customer_code,company_name')
            ->groupBy('customer_id')
            ->orderByDesc('total_value')
            ->limit(self::KPI_TOP_LIMIT)
            ->get()
            ->map(fn (Quotation $quotation) => [
                'customer' => [
                    'id' => $quotation->customer?->getKey(),
                    'customer_code' => $quotation->customer?->customer_code,
                    'company_name' => $quotation->customer?->company_name,
                ],
                'quotation_count' => (int) $quotation->getAttribute('quotation_count'),
                'total_value' => (float) $quotation->getAttribute('total_value'),
            ])->all();

        $lostReasons = (clone $baseQuery)
            ->where('status', QuotationStatus::Lost->value)
            ->whereNotNull('lost_reason')
            ->where('lost_reason', '!=', '')
            ->selectRaw('lost_reason, COUNT(*) as lost_count')
            ->groupBy('lost_reason')
            ->orderByDesc('lost_count')
            ->limit(10)
            ->get()
            ->map(fn (Quotation $quotation) => [
                'lost_reason' => (string) $quotation->getAttribute('lost_reason'),
                'lost_count' => (int) $quotation->getAttribute('lost_count'),
            ])->all();

        return Inertia::render('quotations/kpi', [
            'filters' => [
                'customer' => $customerId,
                'range' => $range['range'],
                'from' => $range['from'],
                'to' => $range['to'],
            ],
            'rangeOptions' => $this->rangeOptions(),
            'customerOptions' => $this->customerOptions(),
            'metrics' => [
                'total_submitted' => $totalSubmitted,
                'total_awarded' => $totalAwarded,
                'conversion_rate' => $totalSubmitted > 0
                    ? round(($totalAwarded / $totalSubmitted) * 100, 2)
                    : 0.0,
                'total_quotation_value' => round($totalQuotationValue, 2),
                'awarded_value' => round($awardedValue, 2),
                'value_conversion_rate' => $totalQuotationValue > 0
                    ? round(($awardedValue / $totalQuotationValue) * 100, 2)
                    : 0.0,
                'pending_count' => $pendingCount,
                'lost_count' => $lostCount,
                'average_days_to_materialize' => $averageDaysToMaterialize !== null
                    ? round((float) $averageDaysToMaterialize, 1)
                    : null,
            ],
            'statusBreakdown' => collect(QuotationStatus::cases())
                ->map(fn (QuotationStatus $status) => [
                    'status' => $status->value,
                    'label' => $status->label(),
                    'count' => (int) ($statusBreakdownCounts[$status->value] ?? 0),
                ])->all(),
            'topCustomersByQuotationValue' => $topCustomersByQuotationValue,
            'topCustomersByAwardedValue' => $topCustomersByAwardedValue,
            'lostReasons' => $lostReasons,
            'can' => [
                'view_registry' => $request->user()?->can('viewAny', Quotation::class) ?? false,
            ],
        ]);
    }

    /**
     * Transform a quotation into an index table row.
     *
     * @return array<string, mixed>
     */
    private function quotationListItem(Request $request, Quotation $quotation): array
    {
        return [
            'id' => $quotation->getKey(),
            'quotation_no' => $quotation->quotation_no,
            'subject' => $quotation->subject,
            'quotation_date' => $quotation->quotation_date?->toDateString(),
            'valid_until' => $quotation->valid_until?->toDateString(),
            'quotation_amount' => (float) $quotation->quotation_amount,
            'status' => $quotation->status->value,
            'status_label' => $quotation->status->label(),
            'attachment_count' => (int) $quotation->getAttribute('attachments_count'),
            'customer' => [
                'id' => $quotation->customer?->getKey(),
                'customer_code' => $quotation->customer?->customer_code,
                'company_name' => $quotation->customer?->company_name,
            ],
            'site' => [
                'id' => $quotation->customerSite?->getKey(),
                'site_code' => $quotation->customerSite?->site_code,
                'site_name' => $quotation->customerSite?->site_name,
            ],
            'assigned_sales_user' => $quotation->assignedSalesUser?->name,
            'can' => [
                'view' => $request->user()?->can('view', $quotation) ?? false,
                'update' => $request->user()?->can('update', $quotation) ?? false,
                'change_status' => $request->user()?->can('changeStatus', $quotation) ?? false,
                'delete' => $request->user()?->can('delete', $quotation) ?? false,
            ],
        ];
    }

    /**
     * Transform a quotation into a detail payload.
     *
     * @return array<string, mixed>
     */
    private function quotationDetail(
        Request $request,
        Quotation $quotation,
        bool $includeRelations = true,
    ): array {
        $detail = [
            'id' => $quotation->getKey(),
            'quotation_no' => $quotation->quotation_no,
            'customer_id' => $quotation->customer_id,
            'customer_site_id' => $quotation->customer_site_id,
            'subject' => $quotation->subject,
            'quotation_date' => $quotation->quotation_date?->toDateString(),
            'valid_until' => $quotation->valid_until?->toDateString(),
            'quotation_amount' => (float) $quotation->quotation_amount,
            'status' => $quotation->status->value,
            'status_label' => $quotation->status->label(),
            'prepared_by_user_id' => $quotation->prepared_by_user_id,
            'assigned_sales_user_id' => $quotation->assigned_sales_user_id,
            'materialized_at' => $quotation->materialized_at?->toDateString(),
            'lost_reason' => $quotation->lost_reason,
            'remarks' => $quotation->remarks,
            'attachment_count' => (int) ($quotation->getAttribute('attachments_count') ?? 0),
            'customer' => [
                'id' => $quotation->customer?->getKey(),
                'customer_code' => $quotation->customer?->customer_code,
                'company_name' => $quotation->customer?->company_name,
            ],
            'site' => [
                'id' => $quotation->customerSite?->getKey(),
                'site_code' => $quotation->customerSite?->site_code,
                'site_name' => $quotation->customerSite?->site_name,
                'address' => $quotation->customerSite?->address,
                'city' => $quotation->customerSite?->city,
                'province' => $quotation->customerSite?->province,
            ],
            'prepared_by' => [
                'id' => $quotation->preparedBy?->getKey(),
                'name' => $quotation->preparedBy?->name,
            ],
            'assigned_sales_user' => [
                'id' => $quotation->assignedSalesUser?->getKey(),
                'name' => $quotation->assignedSalesUser?->name,
            ],
            'can' => [
                'update' => $request->user()?->can('update', $quotation) ?? false,
                'change_status' => $request->user()?->can('changeStatus', $quotation) ?? false,
                'delete' => $request->user()?->can('delete', $quotation) ?? false,
                'upload_attachments' => ($request->user()?->hasPermissionTo('attachments.create') ?? false)
                    && ($request->user()?->can('update', $quotation) ?? false),
                'remove_attachments' => ($request->user()?->hasPermissionTo('attachments.delete') ?? false)
                    && ($request->user()?->can('update', $quotation) ?? false),
            ],
        ];

        if (! $includeRelations) {
            return $detail;
        }

        return [
            ...$detail,
            'attachments' => $quotation->attachments
                ->map(fn (Attachment $attachment) => $this->attachmentPayload($attachment))
                ->all(),
            'status_history' => $quotation->statusLogs
                ->map(fn (QuotationStatusLog $statusLog) => [
                    'id' => $statusLog->getKey(),
                    'from_status' => $statusLog->from_status?->value,
                    'from_status_label' => $statusLog->from_status?->label(),
                    'to_status' => $statusLog->to_status?->value,
                    'to_status_label' => $statusLog->to_status?->label(),
                    'remarks' => $statusLog->remarks,
                    'changed_at' => $statusLog->changed_at?->toDateTimeString(),
                    'changed_by' => $statusLog->changedBy?->name,
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
            'uploaded_at' => $attachment->created_at?->toDateTimeString(),
            'uploaded_by' => $attachment->uploadedBy?->name,
            'download_url' => route('attachments.download', $attachment),
        ];
    }

    /**
     * Build the status dropdown options.
     *
     * @return array<int, array<string, string>>
     */
    private function statusOptions(): array
    {
        return collect(QuotationStatus::cases())
            ->map(fn (QuotationStatus $status) => [
                'value' => $status->value,
                'label' => $status->label(),
            ])->all();
    }

    /**
     * Build the customer dropdown options.
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
     * Build the customer site dropdown options.
     *
     * @return array<int, array<string, int|string|null>>
     */
    private function siteOptions(): array
    {
        return CustomerSite::query()
            ->with('customer:id,customer_code,company_name')
            ->orderBy('site_name')
            ->get(['id', 'customer_id', 'site_code', 'site_name'])
            ->map(fn (CustomerSite $site) => [
                'value' => $site->getKey(),
                'label' => trim(sprintf(
                    '%s%s%s',
                    $site->site_name,
                    $site->site_code ? " ({$site->site_code})" : '',
                    $site->customer?->company_name ? " - {$site->customer->company_name}" : '',
                )),
                'customer_id' => $site->customer_id,
            ])->all();
    }

    /**
     * Build the internal user dropdown options.
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
     * Build the KPI range dropdown options.
     *
     * @return array<int, array<string, string>>
     */
    private function rangeOptions(): array
    {
        return [
            ['value' => 'this_month', 'label' => 'This month'],
            ['value' => 'this_quarter', 'label' => 'This quarter'],
            ['value' => 'this_year', 'label' => 'This year'],
            ['value' => 'custom', 'label' => 'Custom range'],
            ['value' => 'all', 'label' => 'All dates'],
        ];
    }

    /**
     * Resolve the KPI date range from the incoming request.
     *
     * @return array{range: string, from: ?string, to: ?string}
     */
    private function resolveKpiRange(Request $request): array
    {
        $range = $request->string('range')->toString();

        return match ($range) {
            'custom' => [
                'range' => 'custom',
                'from' => $this->normalizeDateFilter($request->string('from')->toString()),
                'to' => $this->normalizeDateFilter($request->string('to')->toString()),
            ],
            'all' => [
                'range' => 'all',
                'from' => null,
                'to' => null,
            ],
            'this_quarter' => [
                'range' => 'this_quarter',
                'from' => now()->startOfQuarter()->toDateString(),
                'to' => now()->endOfQuarter()->toDateString(),
            ],
            'this_year' => [
                'range' => 'this_year',
                'from' => now()->startOfYear()->toDateString(),
                'to' => now()->endOfYear()->toDateString(),
            ],
            default => [
                'range' => 'this_month',
                'from' => now()->startOfMonth()->toDateString(),
                'to' => now()->endOfMonth()->toDateString(),
            ],
        };
    }

    /**
     * Normalize a date filter string from the request query.
     */
    private function normalizeDateFilter(?string $date): ?string
    {
        $value = trim((string) $date);

        if ($value === '' || ! preg_match('/^\d{4}-\d{2}-\d{2}$/', $value)) {
            return null;
        }

        return Carbon::parse($value)->toDateString();
    }

    /**
     * Get the statuses that count as submitted quotations.
     *
     * @return array<int, string>
     */
    private function submittedStatuses(): array
    {
        return [
            QuotationStatus::Submitted->value,
            QuotationStatus::UnderReview->value,
            QuotationStatus::Awarded->value,
            QuotationStatus::Lost->value,
            QuotationStatus::Cancelled->value,
            QuotationStatus::Expired->value,
        ];
    }

    /**
     * Get the statuses that count as pending quotations.
     *
     * @return array<int, string>
     */
    private function pendingStatuses(): array
    {
        return [
            QuotationStatus::Submitted->value,
            QuotationStatus::UnderReview->value,
        ];
    }
}
