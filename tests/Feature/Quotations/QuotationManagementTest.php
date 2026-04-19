<?php

use App\Enums\QuotationStatus;
use App\Models\Attachment;
use App\Models\Customer;
use App\Models\CustomerSite;
use App\Models\Quotation;
use App\Models\QuotationStatusLog;
use App\Models\Role;
use App\Models\User;
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

function actingAsQuotationRole(string $roleName): User
{
    $user = User::factory()->create();
    $role = Role::query()->where('name', $roleName)->firstOrFail();

    $user->roles()->sync([$role->getKey()]);

    test()->actingAs($user);

    return $user;
}

test('authorized users can browse paginated quotations', function () {
    actingAsQuotationRole('Sales Admin / Business Development');

    Quotation::factory()->count(16)->create();

    $this->get(route('quotations.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('quotations/index')
            ->where('quotations.total', 16)
            ->where('quotations.current_page', 1)
            ->has('quotations.data', 15)
            ->where('can.create', true),
        );
});

test('quotation list can be filtered by search customer status and date range', function () {
    actingAsQuotationRole('Sales Admin / Business Development');

    $alphaCustomer = Customer::factory()->create([
        'customer_code' => 'CUST-ALPHA',
        'company_name' => 'Alpha Fire Systems',
    ]);

    $betaCustomer = Customer::factory()->create([
        'customer_code' => 'CUST-BETA',
        'company_name' => 'Beta Safety Corp',
    ]);

    Quotation::factory()->create([
        'customer_id' => $alphaCustomer->getKey(),
        'quotation_no' => 'QTN-ALPHA-001',
        'subject' => 'Alpha HQ upgrade',
        'quotation_date' => '2026-04-05',
        'status' => QuotationStatus::Submitted,
    ]);

    Quotation::factory()->create([
        'customer_id' => $betaCustomer->getKey(),
        'quotation_no' => 'QTN-BETA-001',
        'subject' => 'Beta branch renewal',
        'quotation_date' => '2026-03-12',
        'status' => QuotationStatus::Lost,
    ]);

    $this->get(route('quotations.index', [
        'search' => 'Alpha',
        'customer' => $alphaCustomer->getKey(),
        'status' => QuotationStatus::Submitted->value,
        'from' => '2026-04-01',
        'to' => '2026-04-30',
    ]))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('quotations/index')
            ->where('filters.search', 'Alpha')
            ->where('filters.customer', $alphaCustomer->getKey())
            ->where('filters.status', QuotationStatus::Submitted->value)
            ->where('filters.from', '2026-04-01')
            ->where('filters.to', '2026-04-30')
            ->where('quotations.total', 1)
            ->where('quotations.data.0.quotation_no', 'QTN-ALPHA-001'),
        );
});

test('authorized users can create quotations and initial status is logged', function () {
    actingAsQuotationRole('Sales Admin / Business Development');

    $customer = Customer::factory()->create();
    $site = CustomerSite::factory()->create([
        'customer_id' => $customer->getKey(),
    ]);
    $preparedBy = User::factory()->create();
    $assignedSalesUser = User::factory()->create();

    $response = $this->post(route('quotations.store'), [
        'quotation_no' => 'QTN-00001',
        'customer_id' => $customer->getKey(),
        'customer_site_id' => $site->getKey(),
        'subject' => 'Main office sprinkler retrofit',
        'quotation_date' => '2026-04-19',
        'valid_until' => '2026-05-19',
        'quotation_amount' => '125000.50',
        'status' => QuotationStatus::Draft->value,
        'prepared_by_user_id' => $preparedBy->getKey(),
        'assigned_sales_user_id' => $assignedSalesUser->getKey(),
        'remarks' => 'Prepared from Excel estimate.',
    ]);

    $quotation = Quotation::query()->firstOrFail();

    $response->assertRedirect(route('quotations.show', $quotation));

    $this->assertDatabaseHas('quotations', [
        'id' => $quotation->getKey(),
        'quotation_no' => 'QTN-00001',
        'customer_id' => $customer->getKey(),
        'customer_site_id' => $site->getKey(),
        'status' => QuotationStatus::Draft->value,
    ]);

    $this->assertDatabaseHas('quotation_status_logs', [
        'quotation_id' => $quotation->getKey(),
        'from_status' => null,
        'to_status' => QuotationStatus::Draft->value,
    ]);
});

test('quotation validation errors are returned', function () {
    actingAsQuotationRole('Sales Admin / Business Development');

    $customer = Customer::factory()->create();
    $otherCustomer = Customer::factory()->create();
    $otherCustomerSite = CustomerSite::factory()->create([
        'customer_id' => $otherCustomer->getKey(),
    ]);

    Quotation::factory()->create([
        'quotation_no' => 'QTN-00001',
    ]);

    $this->from(route('quotations.create'))
        ->post(route('quotations.store'), [
            'quotation_no' => 'QTN-00001',
            'customer_id' => $customer->getKey(),
            'customer_site_id' => $otherCustomerSite->getKey(),
            'subject' => '',
            'quotation_date' => '2026-04-19',
            'quotation_amount' => '',
            'status' => QuotationStatus::Lost->value,
            'lost_reason' => '',
        ])
        ->assertRedirect(route('quotations.create'))
        ->assertSessionHasErrors([
            'quotation_no',
            'customer_site_id',
            'subject',
            'quotation_amount',
            'lost_reason',
        ]);
});

test('users without permissions cannot create quotations', function () {
    $user = User::factory()->create();
    $customer = Customer::factory()->create();

    $this->actingAs($user)
        ->post(route('quotations.store'), [
            'quotation_no' => 'QTN-UNAUTH-001',
            'customer_id' => $customer->getKey(),
            'subject' => 'Unauthorized quotation',
            'quotation_date' => '2026-04-19',
            'quotation_amount' => 1000,
            'status' => QuotationStatus::Draft->value,
        ])
        ->assertForbidden();
});

test('authorized users can update quotations', function () {
    actingAsQuotationRole('Sales Admin / Business Development');

    $customer = Customer::factory()->create();
    $site = CustomerSite::factory()->create([
        'customer_id' => $customer->getKey(),
    ]);
    $quotation = Quotation::factory()->create([
        'customer_id' => $customer->getKey(),
        'customer_site_id' => $site->getKey(),
    ]);

    $this->put(route('quotations.update', $quotation), [
        'quotation_no' => $quotation->quotation_no,
        'customer_id' => $customer->getKey(),
        'customer_site_id' => $site->getKey(),
        'subject' => 'Updated fire pump package',
        'quotation_date' => '2026-04-18',
        'valid_until' => '2026-05-18',
        'quotation_amount' => '450000.00',
        'prepared_by_user_id' => null,
        'assigned_sales_user_id' => null,
        'remarks' => 'Updated notes',
    ])
        ->assertRedirect(route('quotations.show', $quotation));

    expect($quotation->refresh()->subject)->toBe('Updated fire pump package');
    expect((string) $quotation->quotation_amount)->toBe('450000.00');
});

test('lost status updates require a lost reason', function () {
    actingAsQuotationRole('Sales Admin / Business Development');

    $quotation = Quotation::factory()->create([
        'status' => QuotationStatus::Draft,
    ]);

    $this->from(route('quotations.show', $quotation))
        ->post(route('quotations.update-status', $quotation), [
            'status' => QuotationStatus::Lost->value,
            'lost_reason' => '',
            'remarks' => 'Client declined proposal.',
        ])
        ->assertRedirect(route('quotations.show', $quotation))
        ->assertSessionHasErrors(['lost_reason']);
});

test('authorized users can update quotation status and status history is shown', function () {
    actingAsQuotationRole('Sales Admin / Business Development');

    $quotation = Quotation::factory()->create([
        'status' => QuotationStatus::Draft,
        'materialized_at' => null,
    ]);
    QuotationStatusLog::factory()->create([
        'quotation_id' => $quotation->getKey(),
        'from_status' => null,
        'to_status' => QuotationStatus::Draft,
    ]);

    $this->post(route('quotations.update-status', $quotation), [
        'status' => QuotationStatus::Awarded->value,
        'materialized_at' => '2026-04-20',
        'remarks' => 'Client approved the quotation.',
    ])
        ->assertRedirect();

    $quotation->refresh();

    expect($quotation->status)->toBe(QuotationStatus::Awarded);
    expect($quotation->materialized_at?->toDateString())->toBe('2026-04-20');

    $this->assertDatabaseHas('quotation_status_logs', [
        'quotation_id' => $quotation->getKey(),
        'from_status' => QuotationStatus::Draft->value,
        'to_status' => QuotationStatus::Awarded->value,
        'remarks' => 'Client approved the quotation.',
    ]);

    $this->get(route('quotations.show', $quotation))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('quotations/show')
            ->has('quotation.status_history', 2)
            ->where('quotation.status', QuotationStatus::Awarded->value),
        );
});

test('users without status permission cannot update quotation status', function () {
    $user = User::factory()->create();
    $quotation = Quotation::factory()->create([
        'status' => QuotationStatus::Draft,
    ]);

    $this->actingAs($user)
        ->post(route('quotations.update-status', $quotation), [
            'status' => QuotationStatus::Submitted->value,
        ])
        ->assertForbidden();
});

test('authorized users can archive quotations', function () {
    actingAsQuotationRole('Sales Admin / Business Development');

    $quotation = Quotation::factory()->create();

    $this->delete(route('quotations.destroy', $quotation))
        ->assertRedirect(route('quotations.index'));

    $this->assertSoftDeleted($quotation);
});

test('attachments can be uploaded downloaded and unlinked from quotations', function () {
    actingAsQuotationRole('Sales Admin / Business Development');

    Storage::fake('local');

    $quotation = Quotation::factory()->create();
    $file = UploadedFile::fake()->create(
        'quotation-register.xlsx',
        128,
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );

    $this->from(route('quotations.show', $quotation))
        ->post(route('attachments.store'), [
            'attachable_type' => 'quotation',
            'attachable_id' => $quotation->getKey(),
            'file' => $file,
        ])
        ->assertRedirect(route('quotations.show', $quotation));

    $attachment = Attachment::query()->firstOrFail();

    Storage::disk('local')->assertExists($attachment->path);

    $this->assertDatabaseHas('attachment_links', [
        'attachment_id' => $attachment->getKey(),
        'attachable_type' => Quotation::class,
        'attachable_id' => $quotation->getKey(),
    ]);

    $this->get(route('attachments.download', $attachment))
        ->assertOk();

    $this->from(route('quotations.show', $quotation))
        ->post(route('attachments.unlink', $attachment), [
            'attachable_type' => 'quotation',
            'attachable_id' => $quotation->getKey(),
        ])
        ->assertRedirect(route('quotations.show', $quotation));

    $this->assertDatabaseMissing('attachments', [
        'id' => $attachment->getKey(),
    ]);

    Storage::disk('local')->assertMissing($attachment->path);
});
