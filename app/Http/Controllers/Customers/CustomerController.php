<?php

namespace App\Http\Controllers\Customers;

use App\Enums\CustomerStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\Customers\StoreCustomerRequest;
use App\Http\Requests\Customers\UpdateCustomerRequest;
use App\Models\Attachment;
use App\Models\Customer;
use App\Models\CustomerSite;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CustomerController extends Controller
{
    private const PER_PAGE = 15;

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', Customer::class);

        $customers = Customer::query()
            ->withCount(['customerSites', 'attachments'])
            ->search($request->string('search')->toString())
            ->status($request->string('status')->toString())
            ->orderBy('company_name')
            ->paginate(self::PER_PAGE)
            ->withQueryString()
            ->through(fn (Customer $customer) => $this->customerListItem($request, $customer));

        return Inertia::render('customers/index', [
            'customers' => $customers,
            'filters' => [
                'search' => $request->string('search')->toString(),
                'status' => $request->string('status')->toString(),
            ],
            'statusOptions' => $this->statusOptions(),
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

        return Inertia::render('customers/create', [
            'statusOptions' => $this->statusOptions(),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreCustomerRequest $request): RedirectResponse
    {
        $this->authorize('create', Customer::class);

        $customer = Customer::query()->create($request->validated());

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => __('Customer created.'),
        ]);

        return to_route('customers.show', $customer);
    }

    /**
     * Display the specified resource.
     */
    public function show(Request $request, Customer $customer): Response
    {
        $this->authorize('view', $customer);

        $customer->load([
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

        $customer->loadCount(['customerSites', 'attachments']);

        return Inertia::render('customers/edit', [
            'customer' => $this->customerDetail($request, $customer, includeRelations: false),
            'statusOptions' => $this->statusOptions(),
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
            'status' => $customer->status->value,
            'status_label' => $customer->status->label(),
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
            'status' => $customer->status->value,
            'status_label' => $customer->status->label(),
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
     * Build the status dropdown options.
     *
     * @return array<int, array<string, string>>
     */
    private function statusOptions(): array
    {
        return collect(CustomerStatus::cases())
            ->map(fn (CustomerStatus $status) => [
                'value' => $status->value,
                'label' => $status->label(),
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
