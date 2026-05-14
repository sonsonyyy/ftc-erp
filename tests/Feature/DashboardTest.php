<?php

use App\Enums\ComplianceAlertType;
use App\Enums\ComplianceRecordStatus;
use App\Enums\InventoryItemStatus;
use App\Enums\InvoiceStatus;
use App\Enums\ProjectStatus;
use App\Enums\QuotationStatus;
use App\Enums\StockMovementType;
use App\Enums\WorkOrderStatus;
use App\Models\ComplianceAlert;
use App\Models\ComplianceRecord;
use App\Models\InventoryItem;
use App\Models\Invoice;
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
    $salesRepresentative = User::factory()->create([
        'name' => 'Maria Santos',
    ]);

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
        'quotation_date' => '2026-04-18',
        'valid_until' => '2026-04-23',
        'assigned_sales_user_id' => $salesRepresentative->getKey(),
    ]);

    Quotation::factory()->create([
        'quotation_no' => 'QTN-DASH-002',
        'status' => QuotationStatus::Awarded,
        'quotation_date' => '2026-04-16',
    ]);

    Quotation::factory()->create([
        'quotation_no' => 'QTN-DASH-003',
        'status' => QuotationStatus::Lost,
        'quotation_date' => '2026-04-15',
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
        'scheduled_date' => '2026-04-21',
        'summary' => 'Fire Alarm Inspection',
    ]);

    WorkOrder::factory()->create([
        'work_order_no' => 'WO-DASH-002',
        'status' => WorkOrderStatus::ForReview,
        'scheduled_date' => '2026-04-22',
        'summary' => 'Sprinkler Rectification',
    ]);

    WorkOrder::factory()->create([
        'work_order_no' => 'WO-DASH-003',
        'status' => WorkOrderStatus::Closed,
        'scheduled_date' => '2026-04-18',
        'summary' => 'Pump Room Close-out',
    ]);

    $this->get(route('dashboard'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('dashboard')
            ->where('dashboard.can.view_low_stock', true)
            ->where('dashboard.can.view_stock_movements', true)
            ->where('dashboard.can.view_quotations', true)
            ->where('dashboard.can.view_projects', true)
            ->where('dashboard.can.view_work_orders', true)
            ->where('dashboard.can.view_billing', true)
            ->where('dashboard.can.view_compliance', false)
            ->where('dashboard.can.view_compliance_alerts', false)
            ->where('dashboard.inventory.low_stock_count', 1)
            ->where('dashboard.low_stock.0.item_code', 'ITM-LOW-001')
            ->where('dashboard.low_stock.0.shortage', 7)
            ->where('dashboard.low_stock.0.location', 'WH-MAIN')
            ->where('dashboard.inventory.movement_count_7_days', 1)
            ->where('dashboard.recent_movements.0.reference', 'ADJ-2026-0001')
            ->where('dashboard.recent_movements.0.type', 'ISS')
            ->where('dashboard.quotations.total_quotations', 3)
            ->where('dashboard.quotations.conversion_rate', 33)
            ->where('dashboard.quotations.pending_follow_up_total', 1)
            ->where('dashboard.projects.active_projects', 2)
            ->where('dashboard.projects.statuses.0.count', 1)
            ->where('dashboard.projects.statuses.2.count', 1)
            ->where('dashboard.work_orders.active_work_orders', 2)
            ->where('dashboard.work_orders.for_review_count', 1)
            ->where('dashboard.work_orders.upcoming_job_total', 2)
            ->where('dashboard.compliance.due_soon_count', null)
            ->where('dashboard.compliance.for_renewal_count', null)
            ->where('dashboard.compliance.overdue_count', null)
            ->where('dashboard.compliance.expired_count', null)
            ->where('dashboard.compliance.open_alert_count', null),
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
            ->where('dashboard.can.view_compliance', true)
            ->where('dashboard.can.view_compliance_alerts', true)
            ->where('dashboard.compliance.due_soon_count', 1)
            ->where('dashboard.compliance.for_renewal_count', 1)
            ->where('dashboard.compliance.overdue_count', 1)
            ->where('dashboard.compliance.expired_count', 1)
            ->where('dashboard.compliance.open_alert_count', 1)
            ->has('dashboard.compliance.due_items_trend', 7),
        );
});

test('dashboard shows billing and receivable summaries for billing roles', function () {
    Carbon::setTestNow('2026-04-20 09:00:00');

    actingAsDashboardRole('Billing / Accounting Staff');

    Invoice::factory()->create([
        'invoice_no' => 'INV-DASH-001',
        'invoice_date' => '2026-04-05',
        'due_date' => '2026-04-28',
        'total_amount' => '1000.00',
        'balance_amount' => '1000.00',
        'status' => InvoiceStatus::Issued,
    ]);

    Invoice::factory()->create([
        'invoice_no' => 'INV-DASH-002',
        'invoice_date' => '2026-03-10',
        'due_date' => '2026-03-25',
        'total_amount' => '500.00',
        'balance_amount' => '500.00',
        'status' => InvoiceStatus::Issued,
    ]);

    $this->get(route('dashboard'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('dashboard')
            ->where('dashboard.can.view_billing', true)
            ->has('dashboard.monthly_billing.items', 6)
            ->where('dashboard.monthly_billing.items.4.amount', 500)
            ->where('dashboard.monthly_billing.items.5.amount', 1000)
            ->where('dashboard.ar_aging.total_ar', 1500)
            ->where('dashboard.ar_aging.items.0.amount', 1000)
            ->where('dashboard.ar_aging.items.1.amount', 500),
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
            ->where('dashboard.can.view_low_stock', false)
            ->where('dashboard.can.view_stock_movements', false)
            ->where('dashboard.can.view_quotations', false)
            ->where('dashboard.can.view_projects', false)
            ->where('dashboard.can.view_work_orders', false)
            ->where('dashboard.can.view_compliance', false)
            ->where('dashboard.can.view_compliance_alerts', false)
            ->where('dashboard.can.view_billing', false)
            ->where('dashboard.inventory.low_stock_count', null)
            ->where('dashboard.low_stock', [])
            ->where('dashboard.inventory.movement_count_7_days', null)
            ->where('dashboard.recent_movements', [])
            ->where('dashboard.quotations.total_quotations', null)
            ->where('dashboard.quotations.breakdown', [])
            ->where('dashboard.projects.active_projects', null)
            ->where('dashboard.work_orders.active_work_orders', null)
            ->where('dashboard.compliance.due_soon_count', null)
            ->where('dashboard.monthly_billing.items', [])
            ->where('dashboard.ar_aging.total_ar', null),
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
            ->where('dashboard.can.view_compliance', false)
            ->where('dashboard.can.view_compliance_alerts', false)
            ->where('dashboard.compliance.due_soon_count', null)
            ->where('dashboard.compliance.for_renewal_count', null)
            ->where('dashboard.compliance.overdue_count', null)
            ->where('dashboard.compliance.expired_count', null)
            ->where('dashboard.compliance.open_alert_count', null)
            ->where('dashboard.compliance.due_items_trend', []),
        );
});
