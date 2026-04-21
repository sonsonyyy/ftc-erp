<?php

use App\Enums\ComplianceAlertType;
use App\Enums\ComplianceRecordStatus;
use App\Enums\InventoryItemStatus;
use App\Enums\ProjectStatus;
use App\Enums\QuotationStatus;
use App\Enums\StockMovementType;
use App\Enums\WorkOrderStatus;
use App\Models\ComplianceAlert;
use App\Models\ComplianceRecord;
use App\Models\InventoryItem;
use App\Models\Project;
use App\Models\Quotation;
use App\Models\Role;
use App\Models\StockBalance;
use App\Models\StockMovement;
use App\Models\User;
use App\Models\Warehouse;
use App\Models\WorkOrder;
use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Schema;
use Inertia\Testing\AssertableInertia as Assert;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->seed(RolesAndPermissionsSeeder::class);
    $this->withoutVite();
});

afterEach(function () {
    Carbon::setTestNow();
});

function actingAsDashboardRole(string $roleName): User
{
    $user = User::factory()->create();
    $role = Role::query()->where('name', $roleName)->firstOrFail();

    $user->roles()->sync([$role->getKey()]);

    test()->actingAs($user);

    return $user;
}

test('home route redirects guests to the login page', function () {
    $this->get(route('home'))->assertRedirect(route('login'));
});

test('guests are redirected to the login page', function () {
    $this->get(route('dashboard'))->assertRedirect(route('login'));
});

test('authorized users can visit the dashboard', function () {
    actingAsDashboardRole(Role::SUPER_ADMIN);

    $this->get(route('dashboard'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->component('dashboard'));
});

test('users without dashboard permission cannot visit the dashboard', function () {
    $this->actingAs(User::factory()->create())
        ->get(route('dashboard'))
        ->assertForbidden();
});

test('dashboard shows operational snapshots for roles with module visibility', function () {
    Carbon::setTestNow('2026-04-20 09:00:00');

    $user = actingAsDashboardRole('Warehouse / Inventory Officer');

    $warehouse = Warehouse::factory()->create([
        'warehouse_code' => 'WH-MAIN',
        'warehouse_name' => 'Main Warehouse',
    ]);

    $lowStockItem = InventoryItem::factory()->create([
        'item_code' => 'ITM-LOW-001',
        'item_name' => 'Low Stock Sprinkler Head',
        'status' => InventoryItemStatus::Active,
        'reorder_level' => 10,
    ]);

    $healthyItem = InventoryItem::factory()->create([
        'item_code' => 'ITM-OK-001',
        'item_name' => 'Healthy Stock Detector',
        'status' => InventoryItemStatus::Active,
        'reorder_level' => 5,
    ]);

    StockBalance::query()->create([
        'warehouse_id' => $warehouse->getKey(),
        'inventory_item_id' => $lowStockItem->getKey(),
        'quantity_on_hand' => '3.00',
    ]);

    StockBalance::query()->create([
        'warehouse_id' => $warehouse->getKey(),
        'inventory_item_id' => $healthyItem->getKey(),
        'quantity_on_hand' => '8.00',
    ]);

    StockMovement::query()->create([
        'inventory_item_id' => $lowStockItem->getKey(),
        'warehouse_id' => $warehouse->getKey(),
        'project_id' => null,
        'work_order_id' => null,
        'reference_type' => 'manual',
        'reference_id' => null,
        'reference_number' => 'ADJ-2026-0001',
        'movement_type' => StockMovementType::StockOut,
        'quantity' => '4.00',
        'balance_after' => '3.00',
        'unit_cost' => '250.00',
        'movement_date' => '2026-04-19',
        'remarks' => 'Urgent field release',
        'created_by' => $user->getKey(),
    ]);

    StockMovement::query()->create([
        'inventory_item_id' => $healthyItem->getKey(),
        'warehouse_id' => $warehouse->getKey(),
        'project_id' => null,
        'work_order_id' => null,
        'reference_type' => 'manual',
        'reference_id' => null,
        'reference_number' => 'ADJ-2026-OLD',
        'movement_type' => StockMovementType::StockIn,
        'quantity' => '10.00',
        'balance_after' => '18.00',
        'unit_cost' => '900.00',
        'movement_date' => '2026-04-01',
        'remarks' => 'Outside dashboard window',
        'created_by' => $user->getKey(),
    ]);

    Quotation::factory()->create([
        'quotation_no' => 'QTN-DASH-001',
        'status' => QuotationStatus::Draft,
    ]);

    Quotation::factory()->create([
        'quotation_no' => 'QTN-DASH-002',
        'status' => QuotationStatus::Awarded,
    ]);

    Quotation::factory()->create([
        'quotation_no' => 'QTN-DASH-003',
        'status' => QuotationStatus::Lost,
    ]);

    Project::factory()->create([
        'project_no' => 'PRJ-DASH-001',
        'status' => ProjectStatus::Open,
    ]);

    Project::factory()->create([
        'project_no' => 'PRJ-DASH-002',
        'status' => ProjectStatus::OnHold,
    ]);

    Project::factory()->create([
        'project_no' => 'PRJ-DASH-003',
        'status' => ProjectStatus::Completed,
    ]);

    WorkOrder::factory()->create([
        'work_order_no' => 'WO-DASH-001',
        'status' => WorkOrderStatus::Scheduled,
    ]);

    WorkOrder::factory()->create([
        'work_order_no' => 'WO-DASH-002',
        'status' => WorkOrderStatus::ForReview,
    ]);

    WorkOrder::factory()->create([
        'work_order_no' => 'WO-DASH-003',
        'status' => WorkOrderStatus::Closed,
    ]);

    $this->get(route('dashboard'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('dashboard')
            ->where('can.view_low_stock', true)
            ->where('can.view_stock_movements', true)
            ->where('can.view_quotations', true)
            ->where('can.view_projects', true)
            ->where('can.view_work_orders', true)
            ->where('can.view_compliance', false)
            ->where('can.view_compliance_alerts', false)
            ->where('lowStockSnapshot.count', 1)
            ->where('lowStockSnapshot.items.0.item_code', 'ITM-LOW-001')
            ->where('lowStockSnapshot.items.0.shortage', 7)
            ->where('movementSnapshot.last_7_days_count', 1)
            ->where('movementSnapshot.items.0.reference_number', 'ADJ-2026-0001')
            ->where('movementSnapshot.items.0.inventory_item.item_code', 'ITM-LOW-001')
            ->where('quotationSnapshot.count', 2)
            ->where('quotationSnapshot.secondary_count', 1)
            ->where('projectSnapshot.count', 2)
            ->where('projectSnapshot.secondary_count', 1)
            ->where('workOrderSnapshot.count', 2)
            ->where('workOrderSnapshot.secondary_count', 1)
            ->where('complianceSnapshot.due_soon_count', null)
            ->where('complianceSnapshot.for_renewal_count', null)
            ->where('complianceSnapshot.overdue_count', null)
            ->where('complianceSnapshot.expired_count', null)
            ->where('complianceSnapshot.open_alert_count', null),
        );
});

test('dashboard shows compliance deadline snapshots for compliance roles', function () {
    Carbon::setTestNow('2026-04-20 09:00:00');

    actingAsDashboardRole('Compliance Officer / Corporate Admin');

    $dueSoonRecord = ComplianceRecord::factory()->create([
        'record_no' => 'CMP-DASH-001',
        'due_date' => '2026-04-25',
        'expiry_date' => null,
        'status' => ComplianceRecordStatus::Active,
    ]);

    ComplianceRecord::factory()->create([
        'record_no' => 'CMP-DASH-002',
        'due_date' => null,
        'expiry_date' => '2026-04-30',
        'status' => ComplianceRecordStatus::Active,
    ]);

    ComplianceRecord::factory()->create([
        'record_no' => 'CMP-DASH-003',
        'due_date' => '2026-04-10',
        'expiry_date' => null,
        'status' => ComplianceRecordStatus::ForFiling,
    ]);

    ComplianceRecord::factory()->create([
        'record_no' => 'CMP-DASH-004',
        'due_date' => null,
        'expiry_date' => '2026-04-15',
        'status' => ComplianceRecordStatus::Active,
    ]);

    ComplianceAlert::factory()->create([
        'compliance_record_id' => $dueSoonRecord->getKey(),
        'alert_type' => ComplianceAlertType::DueReminder,
        'deadline_type' => 'due',
        'scheduled_for' => '2026-04-20',
        'reference_date' => '2026-04-25',
        'days_before' => 5,
        'acknowledged_at' => null,
        'acknowledged_by_user_id' => null,
    ]);

    $this->get(route('dashboard'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('dashboard')
            ->where('can.view_compliance', true)
            ->where('can.view_compliance_alerts', true)
            ->where('complianceSnapshot.due_soon_count', 1)
            ->where('complianceSnapshot.for_renewal_count', 1)
            ->where('complianceSnapshot.overdue_count', 1)
            ->where('complianceSnapshot.expired_count', 1)
            ->where('complianceSnapshot.open_alert_count', 1),
        );
});

test('dashboard hides restricted module snapshots for roles without view permissions', function () {
    Quotation::factory()->create(['status' => QuotationStatus::Awarded]);
    Project::factory()->create(['status' => ProjectStatus::InProgress]);
    WorkOrder::factory()->create(['status' => WorkOrderStatus::ForReview]);

    actingAsDashboardRole('HR / Payroll Officer');

    $this->get(route('dashboard'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('dashboard')
            ->where('can.view_low_stock', false)
            ->where('can.view_stock_movements', false)
            ->where('can.view_quotations', false)
            ->where('can.view_projects', false)
            ->where('can.view_work_orders', false)
            ->where('can.view_compliance', false)
            ->where('can.view_compliance_alerts', false)
            ->where('lowStockSnapshot.count', null)
            ->where('lowStockSnapshot.items', [])
            ->where('movementSnapshot.last_7_days_count', null)
            ->where('movementSnapshot.items', [])
            ->where('quotationSnapshot.count', null)
            ->where('quotationSnapshot.secondary_count', null)
            ->where('projectSnapshot.count', null)
            ->where('projectSnapshot.secondary_count', null)
            ->where('workOrderSnapshot.count', null)
            ->where('workOrderSnapshot.secondary_count', null)
            ->where('complianceSnapshot.due_soon_count', null)
            ->where('complianceSnapshot.for_renewal_count', null)
            ->where('complianceSnapshot.overdue_count', null)
            ->where('complianceSnapshot.expired_count', null)
            ->where('complianceSnapshot.open_alert_count', null),
        );
});

test('dashboard remains accessible when compliance tables are not migrated yet', function () {
    actingAsDashboardRole('Compliance Officer / Corporate Admin');

    Schema::withoutForeignKeyConstraints(function (): void {
        Schema::dropIfExists('compliance_alerts');
        Schema::dropIfExists('compliance_submissions');
        Schema::dropIfExists('compliance_tasks');
        Schema::dropIfExists('compliance_records');
        Schema::dropIfExists('compliance_templates');
    });

    $this->get(route('dashboard'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('dashboard')
            ->where('can.view_compliance', false)
            ->where('can.view_compliance_alerts', false)
            ->where('complianceSnapshot.due_soon_count', null)
            ->where('complianceSnapshot.for_renewal_count', null)
            ->where('complianceSnapshot.overdue_count', null)
            ->where('complianceSnapshot.expired_count', null)
            ->where('complianceSnapshot.open_alert_count', null),
        );
});
