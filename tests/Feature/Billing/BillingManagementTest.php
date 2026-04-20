<?php

use App\Actions\Billing\RecalculateInvoiceTotalsAction;
use App\Enums\InvoiceStatus;
use App\Enums\QuotationStatus;
use App\Models\Attachment;
use App\Models\Customer;
use App\Models\Invoice;
use App\Models\Payment;
use App\Models\Project;
use App\Models\Quotation;
use App\Models\Role;
use App\Models\User;
use App\Models\WorkOrder;
use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->seed(RolesAndPermissionsSeeder::class);
    $this->withoutVite();
});

function actingAsBillingRole(string $roleName = 'Billing / Accounting Staff'): User
{
    $user = User::factory()->create();
    $role = Role::query()->where('name', $roleName)->firstOrFail();

    $user->roles()->sync([$role->getKey()]);

    test()->actingAs($user);

    return $user;
}

/**
 * @return array{
 *     customer: Customer,
 *     quotation: Quotation,
 *     project: Project,
 *     workOrder: WorkOrder
 * }
 */
function billingContext(): array
{
    $customer = Customer::factory()->create();
    $quotation = Quotation::factory()->create([
        'customer_id' => $customer->getKey(),
        'status' => QuotationStatus::Awarded,
    ]);
    $project = Project::factory()->create([
        'customer_id' => $customer->getKey(),
        'quotation_id' => $quotation->getKey(),
    ]);
    $workOrder = WorkOrder::factory()->create([
        'customer_id' => $customer->getKey(),
        'project_id' => $project->getKey(),
        'quotation_id' => $quotation->getKey(),
    ]);

    return [
        'customer' => $customer,
        'quotation' => $quotation,
        'project' => $project,
        'workOrder' => $workOrder,
    ];
}

/**
 * @param  array<string, mixed>  $attributes
 * @param  array<int, array<string, mixed>>|null  $items
 */
function createInvoiceRecord(array $attributes = [], ?array $items = null): Invoice
{
    $customer = $attributes['customer'] ?? Customer::factory()->create();

    /** @var Invoice $invoice */
    $invoice = Invoice::query()->create([
        'invoice_no' => $attributes['invoice_no'] ?? 'INV-TEST-'.fake()->unique()->numerify('####'),
        'quotation_id' => $attributes['quotation_id'] ?? null,
        'customer_id' => $attributes['customer_id'] ?? $customer->getKey(),
        'project_id' => $attributes['project_id'] ?? null,
        'work_order_id' => $attributes['work_order_id'] ?? null,
        'issued_by_user_id' => $attributes['issued_by_user_id'] ?? User::factory()->create()->getKey(),
        'invoice_date' => $attributes['invoice_date'] ?? now()->toDateString(),
        'due_date' => $attributes['due_date'] ?? now()->addDays(15)->toDateString(),
        'tax_amount' => $attributes['tax_amount'] ?? '0.00',
        'status' => ($attributes['status'] ?? InvoiceStatus::Issued) instanceof InvoiceStatus
            ? ($attributes['status'] ?? InvoiceStatus::Issued)->value
            : $attributes['status'],
        'remarks' => $attributes['remarks'] ?? null,
    ]);

    $lines = $items ?? [
        [
            'description' => 'Billing line A',
            'unit' => 'lot',
            'quantity' => '1.00',
            'unit_price' => '1000.00',
            'remarks' => 'Primary line',
        ],
        [
            'description' => 'Billing line B',
            'unit' => 'lot',
            'quantity' => '1.00',
            'unit_price' => '500.00',
            'remarks' => 'Secondary line',
        ],
    ];

    foreach ($lines as $line) {
        $quantity = round((float) $line['quantity'], 2);
        $unitPrice = round((float) $line['unit_price'], 2);

        $invoice->items()->create([
            'description' => $line['description'],
            'unit' => $line['unit'] ?? null,
            'quantity' => $quantity,
            'unit_price' => $unitPrice,
            'line_total' => round($quantity * $unitPrice, 2),
            'remarks' => $line['remarks'] ?? null,
        ]);
    }

    app(RecalculateInvoiceTotalsAction::class)->handle($invoice);

    return $invoice->fresh(['items']);
}

test('billing users can browse and filter paginated invoices', function () {
    actingAsBillingRole();

    $customer = Customer::factory()->create([
        'customer_code' => 'CUST-BILL-001',
        'company_name' => 'Metro Fire Customer',
    ]);

    createInvoiceRecord([
        'customer' => $customer,
        'customer_id' => $customer->getKey(),
        'invoice_no' => 'INV-BILL-001',
    ]);

    createInvoiceRecord([
        'invoice_no' => 'INV-BILL-002',
        'due_date' => now()->subDays(5)->toDateString(),
    ]);

    createInvoiceRecord([
        'invoice_no' => 'INV-BILL-003',
        'status' => InvoiceStatus::Draft,
    ]);

    createInvoiceRecord([
        'invoice_no' => 'INV-BILL-004',
        'status' => InvoiceStatus::Paid,
        'tax_amount' => '0.00',
    ])->update([
        'balance_amount' => '0.00',
    ]);

    createInvoiceRecord([
        'invoice_no' => 'INV-BILL-005',
    ]);

    createInvoiceRecord([
        'invoice_no' => 'INV-BILL-006',
    ]);

    $this->get(route('invoices.index', [
        'search' => 'INV-BILL-001',
        'customer' => $customer->getKey(),
    ]))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('invoices/index')
            ->where('filters.search', 'INV-BILL-001')
            ->where('filters.customer', $customer->getKey())
            ->where('invoices.total', 1)
            ->where('invoices.data.0.invoice_no', 'INV-BILL-001')
            ->where('can.create', true),
        );
});

test('billing users can create and update invoices', function () {
    actingAsBillingRole();

    $context = billingContext();

    $response = $this->post(route('invoices.store'), [
        'invoice_no' => 'INV-2026-1001',
        'quotation_id' => $context['quotation']->getKey(),
        'customer_id' => $context['customer']->getKey(),
        'project_id' => $context['project']->getKey(),
        'work_order_id' => $context['workOrder']->getKey(),
        'invoice_date' => now()->toDateString(),
        'due_date' => now()->addDays(30)->toDateString(),
        'tax_amount' => 180,
        'status' => InvoiceStatus::Issued->value,
        'remarks' => 'Initial billing',
        'items' => [
            [
                'description' => 'Progress billing',
                'unit' => 'lot',
                'quantity' => 1,
                'unit_price' => 1000,
                'remarks' => 'Phase 1',
            ],
            [
                'description' => 'Additional material recovery',
                'unit' => 'lot',
                'quantity' => 1,
                'unit_price' => 500,
                'remarks' => null,
            ],
        ],
    ]);

    $invoice = Invoice::query()->firstOrFail();

    $response->assertRedirect(route('invoices.show', $invoice));

    expect((float) $invoice->total_amount)->toBe(1680.0);
    expect((float) $invoice->balance_amount)->toBe(1680.0);
    expect($invoice->status)->toBe(InvoiceStatus::Issued);

    $this->put(route('invoices.update', $invoice), [
        'invoice_no' => 'INV-2026-1001',
        'quotation_id' => $context['quotation']->getKey(),
        'customer_id' => $context['customer']->getKey(),
        'project_id' => $context['project']->getKey(),
        'work_order_id' => $context['workOrder']->getKey(),
        'invoice_date' => now()->toDateString(),
        'due_date' => now()->addDays(45)->toDateString(),
        'tax_amount' => 240,
        'status' => InvoiceStatus::Issued->value,
        'remarks' => 'Updated billing',
        'items' => [
            [
                'description' => 'Updated billing line',
                'unit' => 'lot',
                'quantity' => 1,
                'unit_price' => 1500,
                'remarks' => 'Adjusted',
            ],
        ],
    ])->assertRedirect(route('invoices.show', $invoice));

    $invoice = $invoice->fresh();

    expect((float) $invoice->subtotal)->toBe(1500.0);
    expect((float) $invoice->total_amount)->toBe(1740.0);
});

test('billing users can archive invoices without payment allocations', function () {
    actingAsBillingRole();

    $invoice = createInvoiceRecord([
        'invoice_no' => 'INV-DELETE-001',
    ]);

    $this->delete(route('invoices.destroy', $invoice))
        ->assertRedirect(route('invoices.index'));

    expect(Invoice::query()->whereKey($invoice->getKey())->exists())->toBeFalse();
    expect(Invoice::withTrashed()->whereKey($invoice->getKey())->exists())->toBeTrue();
});

test('invoice validation rejects mismatched linked customer records', function () {
    actingAsBillingRole();

    $customer = Customer::factory()->create();
    $otherCustomer = Customer::factory()->create();
    $quotation = Quotation::factory()->create([
        'customer_id' => $otherCustomer->getKey(),
    ]);

    $this->from(route('invoices.create'))
        ->post(route('invoices.store'), [
            'invoice_no' => 'INV-VAL-001',
            'quotation_id' => $quotation->getKey(),
            'customer_id' => $customer->getKey(),
            'project_id' => null,
            'work_order_id' => null,
            'invoice_date' => now()->toDateString(),
            'due_date' => now()->addDays(20)->toDateString(),
            'tax_amount' => 0,
            'status' => InvoiceStatus::Issued->value,
            'remarks' => null,
            'items' => [
                [
                    'description' => 'Validation line',
                    'unit' => 'lot',
                    'quantity' => 1,
                    'unit_price' => 1000,
                    'remarks' => null,
                ],
            ],
        ])
        ->assertRedirect(route('invoices.create'))
        ->assertSessionHasErrors('quotation_id');
});

test('attachments can be uploaded and unlinked from invoices', function () {
    actingAsBillingRole();

    Storage::fake('local');

    $invoice = createInvoiceRecord();
    $file = UploadedFile::fake()->create('invoice-support.pdf', 128, 'application/pdf');

    $this->from(route('invoices.show', $invoice))
        ->post(route('attachments.store'), [
            'attachable_type' => 'invoice',
            'attachable_id' => $invoice->getKey(),
            'file' => $file,
        ])
        ->assertRedirect(route('invoices.show', $invoice));

    $attachment = Attachment::query()->firstOrFail();

    $this->assertDatabaseHas('attachment_links', [
        'attachment_id' => $attachment->getKey(),
        'attachable_type' => Invoice::class,
        'attachable_id' => $invoice->getKey(),
    ]);

    $this->post(route('attachments.unlink', $attachment), [
        'attachable_type' => 'invoice',
        'attachable_id' => $invoice->getKey(),
    ])->assertRedirect();

    $this->assertDatabaseMissing('attachment_links', [
        'attachment_id' => $attachment->getKey(),
        'attachable_type' => Invoice::class,
        'attachable_id' => $invoice->getKey(),
    ]);
});

test('users without permissions cannot create invoices', function () {
    $user = User::factory()->create();
    $customer = Customer::factory()->create();

    $this->actingAs($user)
        ->post(route('invoices.store'), [
            'invoice_no' => 'INV-UNAUTH-001',
            'customer_id' => $customer->getKey(),
            'invoice_date' => now()->toDateString(),
            'due_date' => now()->addDays(15)->toDateString(),
            'tax_amount' => 0,
            'status' => InvoiceStatus::Issued->value,
            'items' => [
                [
                    'description' => 'Unauthorized line',
                    'unit' => 'lot',
                    'quantity' => 1,
                    'unit_price' => 500,
                    'remarks' => null,
                ],
            ],
        ])
        ->assertForbidden();
});

test('billing users can record payments and balances update for full partial and multi invoice allocations', function () {
    actingAsBillingRole();

    $customer = Customer::factory()->create();

    $invoicePaid = createInvoiceRecord([
        'customer' => $customer,
        'customer_id' => $customer->getKey(),
        'invoice_no' => 'INV-PAY-001',
        'tax_amount' => '0.00',
        'due_date' => now()->addDays(10)->toDateString(),
    ], [
        [
            'description' => 'Paid invoice line',
            'unit' => 'lot',
            'quantity' => '1.00',
            'unit_price' => '500.00',
            'remarks' => null,
        ],
    ]);

    $invoiceOverduePartial = createInvoiceRecord([
        'customer' => $customer,
        'customer_id' => $customer->getKey(),
        'invoice_no' => 'INV-PAY-002',
        'tax_amount' => '0.00',
        'due_date' => now()->subDays(5)->toDateString(),
    ], [
        [
            'description' => 'Overdue partial line',
            'unit' => 'lot',
            'quantity' => '1.00',
            'unit_price' => '1000.00',
            'remarks' => null,
        ],
    ]);

    $invoicePartial = createInvoiceRecord([
        'customer' => $customer,
        'customer_id' => $customer->getKey(),
        'invoice_no' => 'INV-PAY-003',
        'tax_amount' => '0.00',
        'due_date' => now()->addDays(20)->toDateString(),
    ], [
        [
            'description' => 'Current partial line',
            'unit' => 'lot',
            'quantity' => '1.00',
            'unit_price' => '1000.00',
            'remarks' => null,
        ],
    ]);

    $response = $this->post(route('payments.store'), [
        'payment_no' => 'PAY-2026-2001',
        'customer_id' => $customer->getKey(),
        'payment_date' => now()->toDateString(),
        'amount' => 1600,
        'payment_method' => 'Bank Transfer',
        'reference_no' => 'BANK-1234',
        'remarks' => 'Bulk collection',
        'allocations' => [
            [
                'invoice_id' => $invoicePaid->getKey(),
                'allocated_amount' => 500,
            ],
            [
                'invoice_id' => $invoiceOverduePartial->getKey(),
                'allocated_amount' => 600,
            ],
            [
                'invoice_id' => $invoicePartial->getKey(),
                'allocated_amount' => 500,
            ],
        ],
    ]);

    $payment = Payment::query()->firstOrFail();

    $response->assertRedirect(route('payments.show', $payment));

    $invoicePaid = $invoicePaid->fresh();
    $invoiceOverduePartial = $invoiceOverduePartial->fresh();
    $invoicePartial = $invoicePartial->fresh();

    expect((float) $invoicePaid->balance_amount)->toBe(0.0);
    expect($invoicePaid->status)->toBe(InvoiceStatus::Paid);

    expect((float) $invoiceOverduePartial->balance_amount)->toBe(400.0);
    expect($invoiceOverduePartial->status)->toBe(InvoiceStatus::PartiallyPaid);
    expect($invoiceOverduePartial->currentStatus())->toBe(InvoiceStatus::Overdue);

    expect((float) $invoicePartial->balance_amount)->toBe(500.0);
    expect($invoicePartial->status)->toBe(InvoiceStatus::PartiallyPaid);
    expect($invoicePartial->currentStatus())->toBe(InvoiceStatus::PartiallyPaid);

    expect($payment->allocations()->count())->toBe(3);
});

test('payment validation rejects customer mismatches and over-allocation', function () {
    actingAsBillingRole();

    $customerA = Customer::factory()->create();
    $customerB = Customer::factory()->create();
    $invoice = createInvoiceRecord([
        'customer' => $customerA,
        'customer_id' => $customerA->getKey(),
        'invoice_no' => 'INV-VAL-PAY',
        'tax_amount' => '0.00',
    ], [
        [
            'description' => 'Single invoice line',
            'unit' => 'lot',
            'quantity' => '1.00',
            'unit_price' => '500.00',
            'remarks' => null,
        ],
    ]);

    $this->from(route('payments.create'))
        ->post(route('payments.store'), [
            'payment_no' => 'PAY-VAL-001',
            'customer_id' => $customerB->getKey(),
            'payment_date' => now()->toDateString(),
            'amount' => 700,
            'payment_method' => 'Cash',
            'reference_no' => null,
            'remarks' => null,
            'allocations' => [
                [
                    'invoice_id' => $invoice->getKey(),
                    'allocated_amount' => 700,
                ],
            ],
        ])
        ->assertRedirect(route('payments.create'))
        ->assertSessionHasErrors([
            'allocations.0.invoice_id',
            'allocations.0.allocated_amount',
        ]);
});

test('users without permissions cannot record payments', function () {
    $user = User::factory()->create();
    $customer = Customer::factory()->create();
    $invoice = createInvoiceRecord([
        'customer' => $customer,
        'customer_id' => $customer->getKey(),
    ]);

    $this->actingAs($user)
        ->post(route('payments.store'), [
            'payment_no' => 'PAY-UNAUTH-001',
            'customer_id' => $customer->getKey(),
            'payment_date' => now()->toDateString(),
            'amount' => 100,
            'payment_method' => 'Cash',
            'allocations' => [
                [
                    'invoice_id' => $invoice->getKey(),
                    'allocated_amount' => 100,
                ],
            ],
        ])
        ->assertForbidden();
});

test('accounts receivable report is filterable by customer and status', function () {
    actingAsBillingRole();

    $customerA = Customer::factory()->create([
        'customer_code' => 'CUST-AR-001',
        'company_name' => 'AR Customer A',
    ]);
    $customerB = Customer::factory()->create([
        'customer_code' => 'CUST-AR-002',
        'company_name' => 'AR Customer B',
    ]);

    createInvoiceRecord([
        'customer' => $customerA,
        'customer_id' => $customerA->getKey(),
        'invoice_no' => 'INV-AR-001',
        'tax_amount' => '0.00',
        'due_date' => now()->subDays(8)->toDateString(),
    ], [
        [
            'description' => 'Overdue invoice',
            'unit' => 'lot',
            'quantity' => '1.00',
            'unit_price' => '900.00',
            'remarks' => null,
        ],
    ]);

    createInvoiceRecord([
        'customer' => $customerB,
        'customer_id' => $customerB->getKey(),
        'invoice_no' => 'INV-AR-002',
        'tax_amount' => '0.00',
        'due_date' => now()->addDays(12)->toDateString(),
    ], [
        [
            'description' => 'Current invoice',
            'unit' => 'lot',
            'quantity' => '1.00',
            'unit_price' => '700.00',
            'remarks' => null,
        ],
    ]);

    $this->get(route('accounts-receivable.index', [
        'customer' => $customerA->getKey(),
        'status' => InvoiceStatus::Overdue->value,
    ]))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('accounts-receivable/index')
            ->where('filters.customer', $customerA->getKey())
            ->where('filters.status', InvoiceStatus::Overdue->value)
            ->where('report.total', 1)
            ->where('report.data.0.invoice_no', 'INV-AR-001')
            ->where('report.data.0.status', InvoiceStatus::Overdue->value),
        );
});
