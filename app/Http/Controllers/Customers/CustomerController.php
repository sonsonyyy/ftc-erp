<?php

namespace App\Http\Controllers\Customers;

use App\Actions\Documents\GenerateDocumentNumberAction;
use App\Actions\Exports\StreamCsvExportAction;
use App\Http\Controllers\Controller;
use App\Http\Requests\Customers\StoreCustomerRequest;
use App\Http\Requests\Customers\UpdateCustomerRequest;
use App\Models\Attachment;
use App\Models\Customer;
use App\Models\CustomerSite;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\LazyCollection;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class CustomerController extends Controller
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
        $this->authorize('viewAny', Customer::class);

        $search = $request->string('search')->toString();
        $perPage = $this->resolvePerPage($request);

        $query = Customer::query()
            ->with('createdBy:id,name')
            ->withCount(['customerSites', 'attachments'])
            ->search($search)
            ->orderBy('company_name')
            ->orderBy('id');

        if ($request->string('export')->toString() === 'csv') {
            return $this->exportIndex($request, $query->lazy(), $streamCsvExportAction);
        }

        $customers = (clone $query)
            ->paginate($perPage)
            ->withQueryString()
            ->through(fn (Customer $customer) => $this->customerListItem($request, $customer));

        return Inertia::render('customers/index', [
            'customers' => $customers,
            'filters' => [
                'search' => $search,
                'per_page' => $perPage,
            ],
            'can' => [
                'create' => $request->user()?->can('create', Customer::class) ?? false,
            ],
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(): Response
    {
        $this->authorize('create', Customer::class);

        return Inertia::render('customers/create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(
        StoreCustomerRequest $request,
        GenerateDocumentNumberAction $generateDocumentNumberAction,
    ): RedirectResponse {
        $this->authorize('create', Customer::class);

        $customer = Customer::query()->create([
            ...$request->validated(),
            'customer_code' => $generateDocumentNumberAction->forCustomer(),
            'created_by' => $request->user()?->getKey(),
        ]);

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => __('Customer created.'),
        ]);

        return to_route('sites.create', [
            'customer' => $customer->getKey(),
        ]);
    }

    /**
     * Display the specified resource.
     */
    public function show(Request $request, Customer $customer): Response
    {
        $this->authorize('view', $customer);

        $customer->load([
            'createdBy:id,name',
            'attachments.uploadedBy',
            'customerSites' => fn ($query) => $query->withCount('attachments')->orderBy('site_name'),
        ])->loadCount(['customerSites', 'attachments']);

        return Inertia::render('customers/show', [
            'customer' => $this->customerDetail($request, $customer),
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Request $request, Customer $customer): Response
    {
        $this->authorize('update', $customer);

        $customer->load('createdBy:id,name')->loadCount(['customerSites', 'attachments']);

        return Inertia::render('customers/edit', [
            'customer' => $this->customerDetail($request, $customer, includeRelations: false),
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateCustomerRequest $request, Customer $customer): RedirectResponse
    {
        $this->authorize('update', $customer);

        $customer->update($request->validated());

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => __('Customer updated.'),
        ]);

        return to_route('customers.show', $customer);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Customer $customer): RedirectResponse
    {
        $this->authorize('delete', $customer);

        $customer->delete();

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => __('Customer archived.'),
        ]);

        return to_route('customers.index');
    }

    /**
     * Stream the filtered customer registry as CSV.
     */
    private function exportIndex(
        Request $request,
        LazyCollection $customers,
        StreamCsvExportAction $streamCsvExportAction,
    ): StreamedResponse {
        return $streamCsvExportAction->handle(
            'customers-'.now()->format('Ymd-His').'.csv',
            [
                'Customer Code',
                'Company Name',
                'Trade Name',
                'TIN',
                'Phone',
                'Email',
                'Created By',
                'Date Created',
                'Sites',
                'Attachments',
            ],
            $customers->map(function (Customer $customer) use ($request): array {
                $row = $this->customerListItem($request, $customer);

                return [
                    $row['customer_code'],
                    $row['company_name'],
                    $row['trade_name'],
                    $row['tin'],
                    $row['phone'],
                    $row['email'],
                    $row['created_by'],
                    $row['date_created'],
                    $row['site_count'],
                    $row['attachment_count'],
                ];
            }),
        );
    }

    /**
     * Transform a customer into an index table row.
     *
     * @return array<string, mixed>
     */
    private function customerListItem(Request $request, Customer $customer): array
    {
        return [
            'id' => $customer->getKey(),
            'customer_code' => $customer->customer_code,
            'company_name' => $customer->company_name,
            'trade_name' => $customer->trade_name,
            'tin' => $customer->tin,
            'phone' => $customer->phone,
            'email' => $customer->email,
            'created_by' => $customer->createdBy?->name,
            'date_created' => $customer->created_at?->format('M d, Y'),
            'site_count' => (int) $customer->getAttribute('customer_sites_count'),
            'attachment_count' => (int) $customer->getAttribute('attachments_count'),
            'can' => [
                'view' => $request->user()?->can('view', $customer) ?? false,
                'update' => $request->user()?->can('update', $customer) ?? false,
                'delete' => $request->user()?->can('delete', $customer) ?? false,
            ],
        ];
    }

    /**
     * Transform a customer into a detailed Inertia payload.
     *
     * @return array<string, mixed>
     */
    private function customerDetail(Request $request, Customer $customer, bool $includeRelations = true): array
    {
        $detail = [
            'id' => $customer->getKey(),
            'customer_code' => $customer->customer_code,
            'company_name' => $customer->company_name,
            'trade_name' => $customer->trade_name,
            'tin' => $customer->tin,
            'phone' => $customer->phone,
            'email' => $customer->email,
            'billing_address' => $customer->billing_address,
            'notes' => $customer->notes,
            'site_count' => (int) ($customer->getAttribute('customer_sites_count') ?? 0),
            'attachment_count' => (int) ($customer->getAttribute('attachments_count') ?? 0),
            'can' => [
                'update' => $request->user()?->can('update', $customer) ?? false,
                'delete' => $request->user()?->can('delete', $customer) ?? false,
                'create_site' => $request->user()?->can('create', CustomerSite::class) ?? false,
                'upload_attachments' => ($request->user()?->hasPermissionTo('attachments.create') ?? false)
                    && ($request->user()?->can('update', $customer) ?? false),
                'remove_attachments' => ($request->user()?->hasPermissionTo('attachments.delete') ?? false)
                    && ($request->user()?->can('update', $customer) ?? false),
            ],
        ];

        if (! $includeRelations) {
            return $detail;
        }

        return [
            ...$detail,
            'attachments' => $customer->attachments
                ->map(fn (Attachment $attachment) => $this->attachmentPayload($attachment))
                ->all(),
            'sites' => $customer->customerSites
                ->map(fn (CustomerSite $site) => [
                    'id' => $site->getKey(),
                    'site_code' => $site->site_code,
                    'site_name' => $site->site_name,
                    'city' => $site->city,
                    'province' => $site->province,
                    'is_active' => $site->is_active,
                    'attachment_count' => (int) $site->getAttribute('attachments_count'),
                    'can' => [
                        'view' => $request->user()?->can('view', $site) ?? false,
                        'update' => $request->user()?->can('update', $site) ?? false,
                    ],
                ])->all(),
        ];
    }

    /**
     * Resolve the validated page size for the customer table.
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
