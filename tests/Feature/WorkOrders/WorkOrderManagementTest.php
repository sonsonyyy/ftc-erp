<?php

use App\Enums\ProjectStatus;
use App\Enums\QuotationStatus;
use App\Enums\WorkOrderLogType;
use App\Enums\WorkOrderPriority;
use App\Enums\WorkOrderServiceType;
use App\Enums\WorkOrderStatus;
use App\Models\Attachment;
use App\Models\Customer;
use App\Models\CustomerSite;
use App\Models\Project;
use App\Models\Quotation;
use App\Models\Role;
use App\Models\User;
use App\Models\WorkOrder;
use App\Models\WorkOrderAssignment;
use App\Models\WorkOrderMaterial;
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

function actingAsWorkOrderRole(string $roleName): User
{
    $user = User::factory()->create();
    $role = Role::query()->where('name', $roleName)->firstOrFail();

    $user->roles()->sync([$role->getKey()]);

    test()->actingAs($user);

    return $user;
}

test('authorized users can browse paginated work orders', function () {
    actingAsWorkOrderRole('Operations Admin');

    WorkOrder::factory()->count(16)->create();

    $this->get(route('work-orders.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('work-orders/index')
            ->where('workOrders.total', 16)
            ->where('workOrders.current_page', 1)
            ->has('workOrders.data', 15)
            ->where('can.create', true),
        );
});

test('work order list can be filtered by search customer project status priority and service type', function () {
    actingAsWorkOrderRole('Operations Admin');

    $alphaCustomer = Customer::factory()->create([
        'customer_code' => 'CUST-ALPHA',
        'company_name' => 'Alpha Fire Systems',
    ]);
    $alphaSite = CustomerSite::factory()->create([
        'customer_id' => $alphaCustomer->getKey(),
    ]);
    $alphaProject = Project::factory()->create([
        'customer_id' => $alphaCustomer->getKey(),
        'customer_site_id' => $alphaSite->getKey(),
        'project_no' => 'PRJ-ALPHA-001',
    ]);

    $betaCustomer = Customer::factory()->create([
        'customer_code' => 'CUST-BETA',
        'company_name' => 'Beta Safety Corp',
    ]);
    $betaSite = CustomerSite::factory()->create([
        'customer_id' => $betaCustomer->getKey(),
    ]);
    $betaProject = Project::factory()->create([
        'customer_id' => $betaCustomer->getKey(),
        'customer_site_id' => $betaSite->getKey(),
        'project_no' => 'PRJ-BETA-001',
    ]);

    WorkOrder::factory()->create([
        'customer_id' => $alphaCustomer->getKey(),
        'customer_site_id' => $alphaSite->getKey(),
        'project_id' => $alphaProject->getKey(),
        'work_order_no' => 'WO-ALPHA-001',
        'summary' => 'Alpha preventive maintenance',
        'status' => WorkOrderStatus::Scheduled,
        'priority' => WorkOrderPriority::High,
        'service_type' => WorkOrderServiceType::PreventiveMaintenance,
    ]);

    WorkOrder::factory()->create([
        'customer_id' => $betaCustomer->getKey(),
        'customer_site_id' => $betaSite->getKey(),
        'project_id' => $betaProject->getKey(),
        'work_order_no' => 'WO-BETA-001',
        'summary' => 'Beta emergency callout',
        'status' => WorkOrderStatus::Cancelled,
        'priority' => WorkOrderPriority::Urgent,
        'service_type' => WorkOrderServiceType::EmergencyService,
    ]);

    $this->get(route('work-orders.index', [
        'search' => 'Alpha',
        'customer' => $alphaCustomer->getKey(),
        'project' => $alphaProject->getKey(),
        'status' => WorkOrderStatus::Scheduled->value,
        'priority' => WorkOrderPriority::High->value,
        'service_type' => WorkOrderServiceType::PreventiveMaintenance->value,
    ]))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('work-orders/index')
            ->where('filters.search', 'Alpha')
            ->where('filters.customer', $alphaCustomer->getKey())
            ->where('filters.project', $alphaProject->getKey())
            ->where('filters.status', WorkOrderStatus::Scheduled->value)
            ->where('filters.priority', WorkOrderPriority::High->value)
            ->where('filters.service_type', WorkOrderServiceType::PreventiveMaintenance->value)
            ->where('workOrders.total', 1)
            ->where('workOrders.data.0.work_order_no', 'WO-ALPHA-001'),
        );
});

test('work order export respects the active filters', function () {
    actingAsWorkOrderRole('Operations Admin');

    $alphaCustomer = Customer::factory()->create([
        'customer_code' => 'CUST-ALPHA',
        'company_name' => 'Alpha Fire Systems',
    ]);
    $alphaSite = CustomerSite::factory()->create([
        'customer_id' => $alphaCustomer->getKey(),
    ]);
    $alphaProject = Project::factory()->create([
        'customer_id' => $alphaCustomer->getKey(),
        'customer_site_id' => $alphaSite->getKey(),
        'project_no' => 'PRJ-ALPHA-001',
    ]);

    $betaCustomer = Customer::factory()->create([
        'customer_code' => 'CUST-BETA',
        'company_name' => 'Beta Safety Corp',
    ]);
    $betaSite = CustomerSite::factory()->create([
        'customer_id' => $betaCustomer->getKey(),
    ]);
    $betaProject = Project::factory()->create([
        'customer_id' => $betaCustomer->getKey(),
        'customer_site_id' => $betaSite->getKey(),
        'project_no' => 'PRJ-BETA-001',
    ]);

    WorkOrder::factory()->create([
        'customer_id' => $alphaCustomer->getKey(),
        'customer_site_id' => $alphaSite->getKey(),
        'project_id' => $alphaProject->getKey(),
        'work_order_no' => 'WO-ALPHA-001',
        'summary' => 'Alpha preventive maintenance',
        'status' => WorkOrderStatus::Scheduled,
        'priority' => WorkOrderPriority::High,
        'service_type' => WorkOrderServiceType::PreventiveMaintenance,
    ]);

    WorkOrder::factory()->create([
        'customer_id' => $betaCustomer->getKey(),
        'customer_site_id' => $betaSite->getKey(),
        'project_id' => $betaProject->getKey(),
        'work_order_no' => 'WO-BETA-001',
        'summary' => 'Beta emergency callout',
        'status' => WorkOrderStatus::Cancelled,
        'priority' => WorkOrderPriority::Urgent,
        'service_type' => WorkOrderServiceType::EmergencyService,
    ]);

    $response = $this->get(route('work-orders.index', [
        'search' => 'Alpha',
        'customer' => $alphaCustomer->getKey(),
        'project' => $alphaProject->getKey(),
        'status' => WorkOrderStatus::Scheduled->value,
        'priority' => WorkOrderPriority::High->value,
        'service_type' => WorkOrderServiceType::PreventiveMaintenance->value,
        'export' => 'csv',
    ]));

    $response->assertOk()
        ->assertHeader('content-type', 'text/csv; charset=UTF-8');

    expect($response->streamedContent())
        ->toContain('WO-ALPHA-001')
        ->not->toContain('WO-BETA-001');
});

test('authorized users can create work orders and initial log is recorded', function () {
    actingAsWorkOrderRole('Operations Admin');

    $customer = Customer::factory()->create();
    $site = CustomerSite::factory()->create([
        'customer_id' => $customer->getKey(),
    ]);
    $quotation = Quotation::factory()->create([
        'customer_id' => $customer->getKey(),
        'customer_site_id' => $site->getKey(),
        'status' => QuotationStatus::Awarded,
    ]);
    $project = Project::factory()->create([
        'customer_id' => $customer->getKey(),
        'customer_site_id' => $site->getKey(),
        'quotation_id' => $quotation->getKey(),
        'status' => ProjectStatus::Open,
    ]);

    $response = $this->post(route('work-orders.store'), [
        'work_order_no' => 'WO-00001',
        'quotation_id' => $quotation->getKey(),
        'project_id' => $project->getKey(),
        'customer_id' => $customer->getKey(),
        'customer_site_id' => $site->getKey(),
        'service_type' => WorkOrderServiceType::PreventiveMaintenance->value,
        'scheduled_date' => '2026-04-21',
        'priority' => WorkOrderPriority::Normal->value,
        'status' => WorkOrderStatus::Draft->value,
        'summary' => 'Initial service handoff',
        'findings' => 'No findings yet.',
    ]);

    $workOrder = WorkOrder::query()->firstOrFail();

    $response->assertRedirect(route('work-orders.show', ['work_order' => $workOrder->getKey()]));

    $this->assertDatabaseHas('work_orders', [
        'id' => $workOrder->getKey(),
        'project_id' => $project->getKey(),
        'quotation_id' => $quotation->getKey(),
        'status' => WorkOrderStatus::Draft->value,
    ]);

    $this->assertDatabaseHas('work_order_logs', [
        'work_order_id' => $workOrder->getKey(),
        'log_type' => WorkOrderLogType::StatusChange->value,
        'from_status' => null,
        'to_status' => WorkOrderStatus::Draft->value,
    ]);
});

test('work order validation errors are returned', function () {
    actingAsWorkOrderRole('Operations Admin');

    $customer = Customer::factory()->create();
    $otherCustomer = Customer::factory()->create();
    $site = CustomerSite::factory()->create([
        'customer_id' => $otherCustomer->getKey(),
    ]);
    $project = Project::factory()->create([
        'customer_id' => $otherCustomer->getKey(),
        'customer_site_id' => $site->getKey(),
    ]);
    $quotation = Quotation::factory()->create([
        'status' => QuotationStatus::Draft,
    ]);

    WorkOrder::factory()->create([
        'work_order_no' => 'WO-00001',
    ]);

    $this->from(route('work-orders.create'))
        ->post(route('work-orders.store'), [
            'work_order_no' => 'WO-00001',
            'quotation_id' => $quotation->getKey(),
            'project_id' => $project->getKey(),
            'customer_id' => $customer->getKey(),
            'customer_site_id' => $site->getKey(),
            'service_type' => WorkOrderServiceType::PreventiveMaintenance->value,
            'priority' => WorkOrderPriority::Normal->value,
            'status' => WorkOrderStatus::Draft->value,
            'summary' => '',
        ])
        ->assertRedirect(route('work-orders.create'))
        ->assertSessionHasErrors([
            'work_order_no',
            'customer_id',
            'quotation_id',
            'summary',
        ]);
});

test('users without permissions cannot create work orders', function () {
    $user = User::factory()->create();
    $customer = Customer::factory()->create();
    $site = CustomerSite::factory()->create([
        'customer_id' => $customer->getKey(),
    ]);

    $this->actingAs($user)
        ->post(route('work-orders.store'), [
            'work_order_no' => 'WO-UNAUTH-001',
            'customer_id' => $customer->getKey(),
            'customer_site_id' => $site->getKey(),
            'service_type' => WorkOrderServiceType::PreventiveMaintenance->value,
            'priority' => WorkOrderPriority::Normal->value,
            'status' => WorkOrderStatus::Draft->value,
            'summary' => 'Unauthorized work order',
        ])
        ->assertForbidden();
});

test('authorized users can update work orders and change status', function () {
    actingAsWorkOrderRole('Operations Admin');

    $workOrder = WorkOrder::factory()->create([
        'status' => WorkOrderStatus::Draft,
    ]);

    $this->put(route('work-orders.update', $workOrder), [
        'work_order_no' => $workOrder->work_order_no,
        'quotation_id' => null,
        'project_id' => null,
        'customer_id' => $workOrder->customer_id,
        'customer_site_id' => $workOrder->customer_site_id,
        'service_type' => WorkOrderServiceType::CorrectiveService->value,
        'scheduled_date' => '2026-04-23',
        'priority' => WorkOrderPriority::High->value,
        'summary' => 'Updated work summary',
        'findings' => 'Updated findings',
    ])->assertRedirect(route('work-orders.show', ['work_order' => $workOrder->getKey()]));

    $this->post(route('work-orders.update-status', $workOrder), [
        'status' => WorkOrderStatus::Scheduled->value,
        'details' => 'Team scheduled for dispatch.',
    ])->assertRedirect();

    expect($workOrder->refresh()->summary)->toBe('Updated work summary');

    $this->assertDatabaseHas('work_order_logs', [
        'work_order_id' => $workOrder->getKey(),
        'log_type' => WorkOrderLogType::StatusChange->value,
        'from_status' => WorkOrderStatus::Draft->value,
        'to_status' => WorkOrderStatus::Scheduled->value,
    ]);
});

test('authorized users can manage work order assignments notes and materials', function () {
    actingAsWorkOrderRole('Project Coordinator');

    $workOrder = WorkOrder::factory()->create();
    $assignee = User::factory()->create();

    $this->post(route('work-orders.assignments.store', $workOrder), [
        'user_id' => $assignee->getKey(),
        'assignment_role' => 'Lead technician',
        'notes' => 'Assigned to the first shift',
    ])->assertRedirect();

    $this->post(route('work-orders.logs.store', $workOrder), [
        'details' => 'Confirmed scope with site contact.',
    ])->assertRedirect();

    $this->post(route('work-orders.materials.store', $workOrder), [
        'item_code' => 'MAT-001',
        'item_name' => 'Smoke detector head',
        'quantity' => 4,
        'unit' => 'pc',
        'notes' => 'Prepared for replacement',
    ])->assertRedirect();

    $assignment = WorkOrderAssignment::query()->firstOrFail();
    $material = WorkOrderMaterial::query()->firstOrFail();

    $this->assertDatabaseHas('work_order_assignments', [
        'work_order_id' => $workOrder->getKey(),
        'user_id' => $assignee->getKey(),
    ]);

    $this->assertDatabaseHas('work_order_logs', [
        'work_order_id' => $workOrder->getKey(),
        'log_type' => WorkOrderLogType::Note->value,
        'details' => 'Confirmed scope with site contact.',
    ]);

    $this->assertDatabaseHas('work_order_materials', [
        'work_order_id' => $workOrder->getKey(),
        'item_code' => 'MAT-001',
        'item_name' => 'Smoke detector head',
    ]);

    $this->delete(route('work-orders.assignments.destroy', [$workOrder, $assignment]))
        ->assertRedirect();

    $this->delete(route('work-orders.materials.destroy', [$workOrder, $material]))
        ->assertRedirect();

    $this->assertDatabaseMissing('work_order_assignments', [
        'id' => $assignment->getKey(),
    ]);

    $this->assertDatabaseMissing('work_order_materials', [
        'id' => $material->getKey(),
    ]);
});

test('attachments can be uploaded downloaded and unlinked from work orders', function () {
    actingAsWorkOrderRole('Operations Admin');

    Storage::fake('local');

    $workOrder = WorkOrder::factory()->create();
    $file = UploadedFile::fake()->create('service-report.pdf', 128, 'application/pdf');

    $this->from(route('work-orders.show', ['work_order' => $workOrder->getKey()]))
        ->post(route('attachments.store'), [
            'attachable_type' => 'work_order',
            'attachable_id' => $workOrder->getKey(),
            'file' => $file,
        ])
        ->assertRedirect(route('work-orders.show', ['work_order' => $workOrder->getKey()]));

    $attachment = Attachment::query()->firstOrFail();

    Storage::disk('local')->assertExists($attachment->path);

    $this->assertDatabaseHas('attachment_links', [
        'attachment_id' => $attachment->getKey(),
        'attachable_type' => WorkOrder::class,
        'attachable_id' => $workOrder->getKey(),
    ]);

    $this->get(route('attachments.download', $attachment))->assertOk();

    $this->from(route('work-orders.show', ['work_order' => $workOrder->getKey()]))
        ->post(route('attachments.unlink', $attachment), [
            'attachable_type' => 'work_order',
            'attachable_id' => $workOrder->getKey(),
        ])
        ->assertRedirect(route('work-orders.show', ['work_order' => $workOrder->getKey()]));

    $this->assertDatabaseMissing('attachments', [
        'id' => $attachment->getKey(),
    ]);

    Storage::disk('local')->assertMissing($attachment->path);
});
