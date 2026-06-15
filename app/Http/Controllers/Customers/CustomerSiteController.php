<?php

namespace App\Http\Controllers\Customers;

use App\Actions\Documents\GenerateDocumentNumberAction;
use App\Actions\Exports\StreamCsvExportAction;
use App\Http\Controllers\Controller;
use App\Http\Requests\Customers\StoreCustomerSiteRequest;
use App\Http\Requests\Customers\UpdateCustomerSiteRequest;
use App\Models\Attachment;
use App\Models\Customer;
use App\Models\CustomerSite;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\LazyCollection;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class CustomerSiteController extends Controller
{
    private const PER_PAGE = 15;

    private const PER_PAGE_OPTIONS = [5, 10, 15, 25];

    /**
     * Display a listing of the resource.
     */
    public function index(
        Request $request,
        StreamCsvExportAction $streamCsvExportAction,
    ): Response|StreamedResponse {
        $this->authorize('viewAny', CustomerSite::class);

        $search = $request->string('search')->toString();
        $status = $request->string('status')->toString();
        $perPage = $this->resolvePerPage($request);

        $query = CustomerSite::query()
            ->with(['customer:id,customer_code,company_name'])
            ->withCount('attachments')
            ->search($search)
            ->active($status)
            ->orderBy('site_name')
            ->orderBy('id');

        if ($request->string('export')->toString() === 'csv') {
            return $this->exportIndex($request, $query->lazy(), $streamCsvExportAction);
        }

        $sites = (clone $query)
            ->paginate($perPage)
            ->withQueryString()
            ->through(fn (CustomerSite $site) => $this->siteListItem($request, $site));

        return Inertia::render('sites/index', [
            'sites' => $sites,
            'summary' => $this->siteSummary(),
            'filters' => [
                'search' => $search,
                'status' => $status,
                'per_page' => $perPage,
            ],
            'statusOptions' => $this->activityOptions(),
            'can' => [
                'create' => $request->user()?->can('create', CustomerSite::class) ?? false,
            ],
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(Request $request): Response
    {
        $this->authorize('create', CustomerSite::class);

        return Inertia::render('sites/create', [
            'customerOptions' => $this->customerOptions(),
            'activityOptions' => $this->activityOptions(),
            'defaults' => [
                'customer_id' => $request->integer('customer') ?: null,
                'is_active' => true,
            ],
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(
        StoreCustomerSiteRequest $request,
        GenerateDocumentNumberAction $generateDocumentNumberAction,
    ): RedirectResponse {
        $this->authorize('create', CustomerSite::class);

        $site = CustomerSite::query()->create([
            ...$request->validated(),
            'site_code' => $generateDocumentNumberAction->forSite(),
        ]);

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => __('Site created.'),
        ]);

        return to_route('sites.show', $site);
    }

    /**
     * Display the specified resource.
     */
    public function show(Request $request, CustomerSite $site): Response
    {
        $this->authorize('view', $site);

        $site->load([
            'customer:id,customer_code,company_name',
            'attachments.uploadedBy',
        ])->loadCount('attachments');

        return Inertia::render('sites/show', [
            'site' => $this->siteDetail($request, $site),
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Request $request, CustomerSite $site): Response
    {
        $this->authorize('update', $site);

        $site->load('customer:id,customer_code,company_name')->loadCount('attachments');

        return Inertia::render('sites/edit', [
            'site' => $this->siteDetail($request, $site, includeAttachments: false),
            'customerOptions' => $this->customerOptions(),
            'activityOptions' => $this->activityOptions(),
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateCustomerSiteRequest $request, CustomerSite $site): RedirectResponse
    {
        $this->authorize('update', $site);

        $site->update($request->validated());

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => __('Site updated.'),
        ]);

        return to_route('sites.show', $site);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(CustomerSite $site): RedirectResponse
    {
        $this->authorize('delete', $site);

        $site->delete();

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => __('Site archived.'),
        ]);

        return to_route('sites.index');
    }

    /**
     * Stream the filtered site registry as CSV.
     */
    private function exportIndex(
        Request $request,
        LazyCollection $sites,
        StreamCsvExportAction $streamCsvExportAction,
    ): StreamedResponse {
        return $streamCsvExportAction->handle(
            'sites-'.now()->format('Ymd-His').'.csv',
            [
                'Site Code',
                'Site Name',
                'Customer Code',
                'Customer',
                'Contact Person',
                'Contact Number',
                'Email',
                'City',
                'Province',
                'Status',
                'Attachments',
            ],
            $sites->map(function (CustomerSite $site) use ($request): array {
                $row = $this->siteListItem($request, $site);

                return [
                    $row['site_code'],
                    $row['site_name'],
                    $row['customer']['customer_code'],
                    $row['customer']['company_name'],
                    $row['contact_person'],
                    $row['contact_no'],
                    $row['email'],
                    $row['city'],
                    $row['province'],
                    $row['is_active'] ? 'Active' : 'Inactive',
                    $row['attachment_count'],
                ];
            }),
        );
    }

    /**
     * Transform a site into an index table row.
     *
     * @return array<string, mixed>
     */
    private function siteListItem(Request $request, CustomerSite $site): array
    {
        return [
            'id' => $site->getKey(),
            'site_code' => $site->site_code,
            'site_name' => $site->site_name,
            'contact_person' => $site->contact_person,
            'contact_no' => $site->contact_no,
            'email' => $site->email,
            'city' => $site->city,
            'province' => $site->province,
            'is_active' => $site->is_active,
            'attachment_count' => (int) $site->getAttribute('attachments_count'),
            'customer' => [
                'id' => $site->customer?->getKey(),
                'customer_code' => $site->customer?->customer_code,
                'company_name' => $site->customer?->company_name,
            ],
            'can' => [
                'view' => $request->user()?->can('view', $site) ?? false,
                'update' => $request->user()?->can('update', $site) ?? false,
                'delete' => $request->user()?->can('delete', $site) ?? false,
            ],
        ];
    }

    /**
     * Build the top-line site summary cards.
     *
     * @return array<string, int>
     */
    private function siteSummary(): array
    {
        return [
            'total_sites' => CustomerSite::query()->count(),
            'active_sites' => CustomerSite::query()
                ->where('is_active', true)
                ->count(),
            'inactive_sites' => CustomerSite::query()
                ->where('is_active', false)
                ->count(),
            'linked_customers' => CustomerSite::query()
                ->whereNotNull('customer_id')
                ->distinct()
                ->count('customer_id'),
        ];
    }

    /**
     * Transform a site into a detailed Inertia payload.
     *
     * @return array<string, mixed>
     */
    private function siteDetail(Request $request, CustomerSite $site, bool $includeAttachments = true): array
    {
        $detail = [
            'id' => $site->getKey(),
            'customer_id' => $site->customer_id,
            'site_code' => $site->site_code,
            'site_name' => $site->site_name,
            'contact_person' => $site->contact_person,
            'contact_no' => $site->contact_no,
            'email' => $site->email,
            'address' => $site->address,
            'city' => $site->city,
            'province' => $site->province,
            'notes' => $site->notes,
            'is_active' => $site->is_active,
            'attachment_count' => (int) ($site->getAttribute('attachments_count') ?? 0),
            'customer' => [
                'id' => $site->customer?->getKey(),
                'customer_code' => $site->customer?->customer_code,
                'company_name' => $site->customer?->company_name,
            ],
            'can' => [
                'update' => $request->user()?->can('update', $site) ?? false,
                'delete' => $request->user()?->can('delete', $site) ?? false,
                'upload_attachments' => ($request->user()?->hasPermissionTo('attachments.create') ?? false)
                    && ($request->user()?->can('update', $site) ?? false),
                'remove_attachments' => ($request->user()?->hasPermissionTo('attachments.delete') ?? false)
                    && ($request->user()?->can('update', $site) ?? false),
            ],
        ];

        if (! $includeAttachments) {
            return $detail;
        }

        return [
            ...$detail,
            'attachments' => $site->attachments
                ->map(fn (Attachment $attachment) => $this->attachmentPayload($attachment))
                ->all(),
        ];
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
     * Build the activity dropdown options.
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

    /**
     * Resolve the validated page size for the site table.
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
}
