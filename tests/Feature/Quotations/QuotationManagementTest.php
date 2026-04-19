<?php

use App\Enums\ProjectStatus;
use App\Enums\QuotationStatus;
use App\Enums\WorkOrderPriority;
use App\Enums\WorkOrderServiceType;
use App\Enums\WorkOrderStatus;
use App\Models\Attachment;
use App\Models\Customer;
use App\Models\CustomerSite;
use App\Models\Project;
use App\Models\Quotation;
use App\Models\QuotationStatusLog;
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

test('converted quotations cannot move away from awarded status', function () {
    actingAsQuotationRole('Operations Admin');

    $project = Project::factory()->create();
    $quotation = Quotation::factory()->create([
        'status' => QuotationStatus::Awarded,
        'converted_project_id' => $project->getKey(),
    ]);

    $this->from(route('quotations.show', $quotation))
        ->post(route('quotations.update-status', $quotation), [
            'status' => QuotationStatus::Lost->value,
            'lost_reason' => 'Client changed direction.',
            'remarks' => 'Attempted invalid downgrade.',
        ])
        ->assertRedirect(route('quotations.show', $quotation))
        ->assertSessionHasErrors(['status']);
});

test('authorized users can archive quotations', function () {
    actingAsQuotationRole('Sales Admin / Business Development');

    $quotation = Quotation::factory()->create();

    $this->delete(route('quotations.destroy', $quotation))
        ->assertRedirect(route('quotations.index'));

    $this->assertSoftDeleted($quotation);
});

test('awarded quotations can start the project conversion flow', function () {
    actingAsQuotationRole('Operations Admin');

    $quotation = Quotation::factory()->create([
        'status' => QuotationStatus::Awarded,
    ]);

    $this->get(route('quotations.convert-to-project', $quotation))
        ->assertRedirect(route('projects.create', [
            'quotation' => $quotation->getKey(),
        ]));
});

test('awarded quotations can start the work order conversion flow', function () {
    actingAsQuotationRole('Operations Admin');

    $quotation = Quotation::factory()->create([
        'status' => QuotationStatus::Awarded,
    ]);

    $this->get(route('quotations.convert-to-work-order', $quotation))
        ->assertRedirect(route('work-orders.create', [
            'quotation' => $quotation->getKey(),
        ]));
});

test('non-awarded quotations cannot start conversion flows', function () {
    actingAsQuotationRole('Operations Admin');

    $quotation = Quotation::factory()->create([
        'status' => QuotationStatus::Draft,
    ]);

    $this->get(route('quotations.convert-to-project', $quotation))
        ->assertRedirect(route('quotations.show', $quotation));

    $this->get(route('quotations.convert-to-work-order', $quotation))
        ->assertRedirect(route('quotations.show', $quotation));
});

test('creating a project from an awarded quotation stores the converted project link', function () {
    actingAsQuotationRole('Operations Admin');

    $customer = Customer::factory()->create();
    $site = CustomerSite::factory()->create([
        'customer_id' => $customer->getKey(),
    ]);
    $quotation = Quotation::factory()->create([
        'customer_id' => $customer->getKey(),
        'customer_site_id' => $site->getKey(),
        'status' => QuotationStatus::Awarded,
    ]);

    $this->post(route('projects.store'), [
        'project_no' => 'PRJ-CONVERT-001',
        'quotation_id' => $quotation->getKey(),
        'customer_id' => $customer->getKey(),
        'customer_site_id' => $site->getKey(),
        'title' => 'Converted awarded quotation',
        'project_type' => 'Installation',
        'start_date' => '2026-04-20',
        'target_end_date' => '2026-05-20',
        'status' => ProjectStatus::Draft->value,
        'description' => 'Created from quotation conversion.',
    ])->assertRedirect();

    $project = Project::query()->firstOrFail();

    expect($quotation->fresh()->converted_project_id)->toBe($project->getKey());
});

test('creating a work order from an awarded quotation stores the converted work order link', function () {
    actingAsQuotationRole('Operations Admin');

    $customer = Customer::factory()->create();
    $site = CustomerSite::factory()->create([
        'customer_id' => $customer->getKey(),
    ]);
    $quotation = Quotation::factory()->create([
        'customer_id' => $customer->getKey(),
        'customer_site_id' => $site->getKey(),
        'status' => QuotationStatus::Awarded,
    ]);

    $this->post(route('work-orders.store'), [
        'work_order_no' => 'WO-CONVERT-001',
        'quotation_id' => $quotation->getKey(),
        'project_id' => null,
        'customer_id' => $customer->getKey(),
        'customer_site_id' => $site->getKey(),
        'service_type' => WorkOrderServiceType::OtherServiceJob->value,
        'scheduled_date' => '2026-04-20',
        'priority' => WorkOrderPriority::Normal->value,
        'status' => WorkOrderStatus::Draft->value,
        'summary' => 'Converted quotation work order',
        'findings' => 'Created from quotation conversion.',
    ])->assertRedirect();

    $workOrder = WorkOrder::query()->firstOrFail();

    expect($quotation->fresh()->converted_work_order_id)->toBe($workOrder->getKey());
});

test('quotations already linked to a project cannot be linked to another project', function () {
    actingAsQuotationRole('Operations Admin');

    $customer = Customer::factory()->create();
    $site = CustomerSite::factory()->create([
        'customer_id' => $customer->getKey(),
    ]);
    $existingProject = Project::factory()->create([
        'customer_id' => $customer->getKey(),
        'customer_site_id' => $site->getKey(),
    ]);
    $quotation = Quotation::factory()->create([
        'customer_id' => $customer->getKey(),
        'customer_site_id' => $site->getKey(),
        'status' => QuotationStatus::Awarded,
        'converted_project_id' => $existingProject->getKey(),
    ]);

    $this->from(route('projects.create'))
        ->post(route('projects.store'), [
            'project_no' => 'PRJ-CONVERT-002',
            'quotation_id' => $quotation->getKey(),
            'customer_id' => $customer->getKey(),
            'customer_site_id' => $site->getKey(),
            'title' => 'Duplicate conversion',
            'project_type' => 'Installation',
            'start_date' => '2026-04-20',
            'target_end_date' => '2026-05-20',
            'status' => ProjectStatus::Draft->value,
        ])
        ->assertRedirect(route('projects.create'))
        ->assertSessionHasErrors(['quotation_id']);
});

test('quotations already linked to a work order cannot be linked to another work order', function () {
    actingAsQuotationRole('Operations Admin');

    $customer = Customer::factory()->create();
    $site = CustomerSite::factory()->create([
        'customer_id' => $customer->getKey(),
    ]);
    $existingWorkOrder = WorkOrder::factory()->create([
        'customer_id' => $customer->getKey(),
        'customer_site_id' => $site->getKey(),
    ]);
    $quotation = Quotation::factory()->create([
        'customer_id' => $customer->getKey(),
        'customer_site_id' => $site->getKey(),
        'status' => QuotationStatus::Awarded,
        'converted_work_order_id' => $existingWorkOrder->getKey(),
    ]);

    $this->from(route('work-orders.create'))
        ->post(route('work-orders.store'), [
            'work_order_no' => 'WO-CONVERT-002',
            'quotation_id' => $quotation->getKey(),
            'project_id' => null,
            'customer_id' => $customer->getKey(),
            'customer_site_id' => $site->getKey(),
            'service_type' => WorkOrderServiceType::OtherServiceJob->value,
            'scheduled_date' => '2026-04-20',
            'priority' => WorkOrderPriority::Normal->value,
            'status' => WorkOrderStatus::Draft->value,
            'summary' => 'Duplicate conversion',
            'findings' => null,
        ])
        ->assertRedirect(route('work-orders.create'))
        ->assertSessionHasErrors(['quotation_id']);
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
