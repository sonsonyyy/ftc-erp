<?php

use App\Enums\InventoryItemStatus;
use App\Enums\ProjectStatus;
use App\Enums\StockMovementType;
use App\Enums\WorkOrderPriority;
use App\Enums\WorkOrderServiceType;
use App\Enums\WorkOrderStatus;
use App\Models\Customer;
use App\Models\CustomerSite;
use App\Models\InventoryItem;
use App\Models\Project;
use App\Models\Role;
use App\Models\StockBalance;
use App\Models\StockIssuance;
use App\Models\StockReturn;
use App\Models\User;
use App\Models\Warehouse;
use App\Models\WorkOrder;
use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->seed(RolesAndPermissionsSeeder::class);
    $this->withoutVite();
});

function actingAsStockFlowRole(string $roleName): User
{
    $user = User::factory()->create();
    $role = Role::query()->where('name', $roleName)->firstOrFail();

    $user->roles()->sync([$role->getKey()]);

    test()->actingAs($user);

    return $user;
}

test('authorized users can record manual stock movements and filter the movement log', function () {
    actingAsStockFlowRole('Warehouse / Inventory Officer');

    $warehouse = Warehouse::factory()->create([
        'warehouse_code' => 'WH-MAIN',
        'is_active' => true,
    ]);
    $inventoryItem = InventoryItem::factory()->create([
        'item_code' => 'ITM-STOCK-001',
        'status' => InventoryItemStatus::Active,
    ]);

    $this->post(route('stock-movements.store'), [
        'warehouse_id' => $warehouse->getKey(),
        'inventory_item_id' => $inventoryItem->getKey(),
        'movement_type' => StockMovementType::StockIn->value,
        'quantity' => 25,
        'unit_cost' => 120.5,
        'movement_date' => '2026-04-19',
        'reference_number' => 'DR-2026-0001',
        'remarks' => 'Initial replenishment',
    ])->assertRedirect(route('stock-movements.index'));

    $this->post(route('stock-movements.store'), [
        'warehouse_id' => $warehouse->getKey(),
        'inventory_item_id' => $inventoryItem->getKey(),
        'movement_type' => StockMovementType::StockOut->value,
        'quantity' => 5,
        'movement_date' => '2026-04-20',
        'reference_number' => 'ADJ-2026-0001',
        'remarks' => 'Issued for urgent field use',
    ])->assertRedirect(route('stock-movements.index'));

    expect(StockBalance::query()->firstOrFail()->quantity_on_hand)->toEqual('20.00');

    $this->get(route('stock-movements.index', [
        'warehouse' => $warehouse->getKey(),
        'item' => $inventoryItem->getKey(),
        'type' => StockMovementType::StockOut->value,
    ]))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('stock-movements/index')
            ->where('filters.warehouse', $warehouse->getKey())
            ->where('filters.item', $inventoryItem->getKey())
            ->where('filters.type', StockMovementType::StockOut->value)
            ->where('movements.total', 1)
            ->where('movements.data.0.reference_number', 'ADJ-2026-0001'),
        );
});

test('manual stock movement blocks insufficient stock', function () {
    actingAsStockFlowRole('Warehouse / Inventory Officer');

    $warehouse = Warehouse::factory()->create([
        'is_active' => true,
    ]);
    $inventoryItem = InventoryItem::factory()->create([
        'status' => InventoryItemStatus::Active,
    ]);

    StockBalance::query()->create([
        'warehouse_id' => $warehouse->getKey(),
        'inventory_item_id' => $inventoryItem->getKey(),
        'quantity_on_hand' => '3.00',
    ]);

    $this->from(route('stock-movements.create'))
        ->post(route('stock-movements.store'), [
            'warehouse_id' => $warehouse->getKey(),
            'inventory_item_id' => $inventoryItem->getKey(),
            'movement_type' => StockMovementType::StockOut->value,
            'quantity' => 5,
            'movement_date' => '2026-04-19',
        ])
        ->assertRedirect(route('stock-movements.create'))
        ->assertSessionHasErrors('quantity');
});

test('authorized users can create stock issuances that reduce balances and log project context', function () {
    actingAsStockFlowRole('Warehouse / Inventory Officer');

    $customer = Customer::factory()->create();
    $site = CustomerSite::factory()->create([
        'customer_id' => $customer->getKey(),
    ]);
    $project = Project::factory()->create([
        'customer_id' => $customer->getKey(),
        'customer_site_id' => $site->getKey(),
        'status' => ProjectStatus::Open,
    ]);
    $workOrder = WorkOrder::factory()->create([
        'customer_id' => $customer->getKey(),
        'customer_site_id' => $site->getKey(),
        'project_id' => $project->getKey(),
        'service_type' => WorkOrderServiceType::CorrectiveService,
        'priority' => WorkOrderPriority::High,
        'status' => WorkOrderStatus::Scheduled,
    ]);
    $warehouse = Warehouse::factory()->create([
        'is_active' => true,
    ]);
    $inventoryItem = InventoryItem::factory()->create([
        'status' => InventoryItemStatus::Active,
        'standard_cost' => 99.5,
    ]);

    StockBalance::query()->create([
        'warehouse_id' => $warehouse->getKey(),
        'inventory_item_id' => $inventoryItem->getKey(),
        'quantity_on_hand' => '12.00',
    ]);

    $response = $this->post(route('stock-issuances.store'), [
        'issuance_no' => 'ISS-2026-0001',
        'warehouse_id' => $warehouse->getKey(),
        'project_id' => $project->getKey(),
        'work_order_id' => $workOrder->getKey(),
        'issued_date' => '2026-04-19',
        'remarks' => 'Project issue',
        'items' => [
            [
                'inventory_item_id' => $inventoryItem->getKey(),
                'quantity' => 5,
                'remarks' => 'Field use',
            ],
        ],
    ]);

    $stockIssuance = StockIssuance::query()->firstOrFail();

    $response->assertRedirect(route('stock-issuances.show', $stockIssuance));

    expect(StockBalance::query()->firstOrFail()->quantity_on_hand)->toEqual('7.00');

    $this->assertDatabaseHas('stock_movements', [
        'reference_type' => 'stock_issuance',
        'reference_id' => $stockIssuance->getKey(),
        'reference_number' => 'ISS-2026-0001',
        'project_id' => $project->getKey(),
        'work_order_id' => $workOrder->getKey(),
        'movement_type' => StockMovementType::Issuance->value,
    ]);
});

test('stock issuance validation rejects a work order that does not belong to the selected project', function () {
    actingAsStockFlowRole('Warehouse / Inventory Officer');

    $customer = Customer::factory()->create();
    $site = CustomerSite::factory()->create([
        'customer_id' => $customer->getKey(),
    ]);
    $project = Project::factory()->create([
        'customer_id' => $customer->getKey(),
        'customer_site_id' => $site->getKey(),
    ]);
    $otherProject = Project::factory()->create();
    $workOrder = WorkOrder::factory()->create([
        'project_id' => $otherProject->getKey(),
    ]);
    $warehouse = Warehouse::factory()->create([
        'is_active' => true,
    ]);
    $inventoryItem = InventoryItem::factory()->create([
        'status' => InventoryItemStatus::Active,
    ]);

    $this->from(route('stock-issuances.create'))
        ->post(route('stock-issuances.store'), [
            'issuance_no' => 'ISS-2026-0009',
            'warehouse_id' => $warehouse->getKey(),
            'project_id' => $project->getKey(),
            'work_order_id' => $workOrder->getKey(),
            'issued_date' => '2026-04-19',
            'items' => [
                [
                    'inventory_item_id' => $inventoryItem->getKey(),
                    'quantity' => 1,
                ],
            ],
        ])
        ->assertRedirect(route('stock-issuances.create'))
        ->assertSessionHasErrors('work_order_id');
});

test('authorized users can create stock returns that increase balances', function () {
    actingAsStockFlowRole('Warehouse / Inventory Officer');

    $customer = Customer::factory()->create();
    $site = CustomerSite::factory()->create([
        'customer_id' => $customer->getKey(),
    ]);
    $project = Project::factory()->create([
        'customer_id' => $customer->getKey(),
        'customer_site_id' => $site->getKey(),
        'status' => ProjectStatus::Open,
    ]);
    $workOrder = WorkOrder::factory()->create([
        'customer_id' => $customer->getKey(),
        'customer_site_id' => $site->getKey(),
        'project_id' => $project->getKey(),
        'service_type' => WorkOrderServiceType::PreventiveMaintenance,
        'priority' => WorkOrderPriority::Normal,
        'status' => WorkOrderStatus::InProgress,
    ]);
    $warehouse = Warehouse::factory()->create([
        'is_active' => true,
    ]);
    $inventoryItem = InventoryItem::factory()->create([
        'status' => InventoryItemStatus::Active,
    ]);

    StockBalance::query()->create([
        'warehouse_id' => $warehouse->getKey(),
        'inventory_item_id' => $inventoryItem->getKey(),
        'quantity_on_hand' => '4.00',
    ]);

    $response = $this->post(route('stock-returns.store'), [
        'return_no' => 'RET-2026-0001',
        'warehouse_id' => $warehouse->getKey(),
        'project_id' => $project->getKey(),
        'work_order_id' => $workOrder->getKey(),
        'returned_date' => '2026-04-20',
        'remarks' => 'Unused materials returned',
        'items' => [
            [
                'inventory_item_id' => $inventoryItem->getKey(),
                'quantity' => 2,
                'remarks' => 'Unused stock',
            ],
        ],
    ]);

    $stockReturn = StockReturn::query()->firstOrFail();

    $response->assertRedirect(route('stock-returns.show', $stockReturn));

    expect(StockBalance::query()->firstOrFail()->quantity_on_hand)->toEqual('6.00');

    $this->assertDatabaseHas('stock_movements', [
        'reference_type' => 'stock_return',
        'reference_id' => $stockReturn->getKey(),
        'reference_number' => 'RET-2026-0001',
        'movement_type' => StockMovementType::Return->value,
    ]);
});

test('users without stock permissions cannot issue stock', function () {
    $user = User::factory()->create();
    $customer = Customer::factory()->create();
    $site = CustomerSite::factory()->create([
        'customer_id' => $customer->getKey(),
    ]);
    $project = Project::factory()->create([
        'customer_id' => $customer->getKey(),
        'customer_site_id' => $site->getKey(),
    ]);
    $warehouse = Warehouse::factory()->create([
        'is_active' => true,
    ]);
    $inventoryItem = InventoryItem::factory()->create([
        'status' => InventoryItemStatus::Active,
    ]);

    $this->actingAs($user)
        ->post(route('stock-issuances.store'), [
            'issuance_no' => 'ISS-UNAUTH-001',
            'warehouse_id' => $warehouse->getKey(),
            'project_id' => $project->getKey(),
            'issued_date' => '2026-04-19',
            'items' => [
                [
                    'inventory_item_id' => $inventoryItem->getKey(),
                    'quantity' => 1,
                ],
            ],
        ])
        ->assertForbidden();
});
