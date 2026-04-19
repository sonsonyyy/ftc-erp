<?php

use App\Enums\InventoryItemStatus;
use App\Models\InventoryCategory;
use App\Models\InventoryItem;
use App\Models\Role;
use App\Models\StockBalance;
use App\Models\User;
use App\Models\Warehouse;
use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->seed(RolesAndPermissionsSeeder::class);
    $this->withoutVite();
});

function actingAsInventoryItemRole(string $roleName): User
{
    $user = User::factory()->create();
    $role = Role::query()->where('name', $roleName)->firstOrFail();

    $user->roles()->sync([$role->getKey()]);

    test()->actingAs($user);

    return $user;
}

test('authorized users can browse paginated inventory items', function () {
    actingAsInventoryItemRole('Warehouse / Inventory Officer');

    InventoryItem::factory()->count(16)->create([
        'status' => InventoryItemStatus::Active,
    ]);

    $this->get(route('inventory.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('inventory/index')
            ->where('inventoryItems.total', 16)
            ->where('inventoryItems.current_page', 1)
            ->has('inventoryItems.data', 15)
            ->where('can.create', true),
        );
});

test('inventory list can be filtered by search category status and low stock flag', function () {
    actingAsInventoryItemRole('Warehouse / Inventory Officer');

    $warehouse = Warehouse::factory()->create();
    $sprinklerCategory = InventoryCategory::factory()->create([
        'name' => 'Sprinklers',
    ]);
    $alarmCategory = InventoryCategory::factory()->create([
        'name' => 'Alarm Devices',
    ]);

    $alphaItem = InventoryItem::factory()->create([
        'item_code' => 'ITM-ALPHA-001',
        'item_name' => 'Alpha Sprinkler Head',
        'inventory_category_id' => $sprinklerCategory->getKey(),
        'status' => InventoryItemStatus::Active,
        'reorder_level' => 10,
    ]);

    $betaItem = InventoryItem::factory()->create([
        'item_code' => 'ITM-BETA-001',
        'item_name' => 'Beta Smoke Detector',
        'inventory_category_id' => $alarmCategory->getKey(),
        'status' => InventoryItemStatus::Inactive,
        'reorder_level' => 5,
    ]);

    StockBalance::query()->create([
        'warehouse_id' => $warehouse->getKey(),
        'inventory_item_id' => $alphaItem->getKey(),
        'quantity_on_hand' => '2.00',
    ]);

    StockBalance::query()->create([
        'warehouse_id' => $warehouse->getKey(),
        'inventory_item_id' => $betaItem->getKey(),
        'quantity_on_hand' => '50.00',
    ]);

    $this->get(route('inventory.index', [
        'search' => 'Alpha',
        'category' => $sprinklerCategory->getKey(),
        'status' => InventoryItemStatus::Active->value,
        'low_stock' => '1',
    ]))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('inventory/index')
            ->where('filters.search', 'Alpha')
            ->where('filters.category', $sprinklerCategory->getKey())
            ->where('filters.status', InventoryItemStatus::Active->value)
            ->where('filters.low_stock', '1')
            ->where('inventoryItems.total', 1)
            ->where('inventoryItems.data.0.item_code', 'ITM-ALPHA-001'),
        );
});

test('low stock page can be filtered by warehouse', function () {
    actingAsInventoryItemRole('Warehouse / Inventory Officer');

    $mainWarehouse = Warehouse::factory()->create([
        'warehouse_code' => 'WH-MAIN',
    ]);
    $bufferWarehouse = Warehouse::factory()->create([
        'warehouse_code' => 'WH-BUFFER',
    ]);
    $category = InventoryCategory::factory()->create();

    $lowItem = InventoryItem::factory()->create([
        'item_code' => 'ITM-LOW-001',
        'inventory_category_id' => $category->getKey(),
        'status' => InventoryItemStatus::Active,
        'reorder_level' => 10,
    ]);

    $healthyItem = InventoryItem::factory()->create([
        'item_code' => 'ITM-OK-001',
        'inventory_category_id' => $category->getKey(),
        'status' => InventoryItemStatus::Active,
        'reorder_level' => 5,
    ]);

    StockBalance::query()->create([
        'warehouse_id' => $mainWarehouse->getKey(),
        'inventory_item_id' => $lowItem->getKey(),
        'quantity_on_hand' => '3.00',
    ]);

    StockBalance::query()->create([
        'warehouse_id' => $bufferWarehouse->getKey(),
        'inventory_item_id' => $lowItem->getKey(),
        'quantity_on_hand' => '20.00',
    ]);

    StockBalance::query()->create([
        'warehouse_id' => $mainWarehouse->getKey(),
        'inventory_item_id' => $healthyItem->getKey(),
        'quantity_on_hand' => '9.00',
    ]);

    $this->get(route('inventory.low-stock', [
        'warehouse' => $mainWarehouse->getKey(),
    ]))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('inventory/low-stock')
            ->where('filters.warehouse', $mainWarehouse->getKey())
            ->where('lowStockItems.total', 1)
            ->where('lowStockItems.data.0.item_code', 'ITM-LOW-001')
            ->where('lowStockItems.data.0.shortage', 7),
        );
});

test('authorized users can manage inventory categories and items', function () {
    actingAsInventoryItemRole('Warehouse / Inventory Officer');

    $this->post(route('inventory-categories.store'), [
        'name' => 'Valves',
        'description' => 'Mechanical stock items',
    ])->assertRedirect(route('inventory-categories.index'));

    $category = InventoryCategory::query()->where('name', 'Valves')->firstOrFail();

    $createResponse = $this->post(route('inventory.store'), [
        'sku' => 'VAL-150',
        'item_code' => 'ITM-VLV-150',
        'item_name' => '150mm butterfly valve',
        'inventory_category_id' => $category->getKey(),
        'unit' => 'pc',
        'reorder_level' => 3,
        'standard_cost' => 4250,
        'status' => InventoryItemStatus::Active->value,
        'notes' => 'Emergency stock item',
    ]);

    $inventoryItem = InventoryItem::query()->where('item_code', 'ITM-VLV-150')->firstOrFail();

    $createResponse->assertRedirect(route('inventory.show', $inventoryItem));

    $this->put(route('inventory.update', $inventoryItem), [
        'sku' => 'VAL-150',
        'item_code' => 'ITM-VLV-150',
        'item_name' => '150mm butterfly valve - updated',
        'inventory_category_id' => $category->getKey(),
        'unit' => 'pc',
        'reorder_level' => 5,
        'standard_cost' => 4300,
        'status' => InventoryItemStatus::Inactive->value,
        'notes' => 'Reserved for corrective service only',
    ])->assertRedirect(route('inventory.show', $inventoryItem));

    expect($inventoryItem->refresh()->item_name)->toBe('150mm butterfly valve - updated');
    expect($inventoryItem->status)->toBe(InventoryItemStatus::Inactive);
});

test('inventory item validation errors are returned', function () {
    actingAsInventoryItemRole('Warehouse / Inventory Officer');

    InventoryItem::factory()->create([
        'item_code' => 'ITM-DUP-001',
        'sku' => 'SKU-DUP-001',
    ]);

    $this->from(route('inventory.create'))
        ->post(route('inventory.store'), [
            'sku' => 'SKU-DUP-001',
            'item_code' => 'ITM-DUP-001',
            'item_name' => '',
            'unit' => '',
            'reorder_level' => -1,
            'status' => 'not-a-status',
        ])
        ->assertRedirect(route('inventory.create'))
        ->assertSessionHasErrors([
            'sku',
            'item_code',
            'item_name',
            'unit',
            'reorder_level',
            'status',
        ]);
});

test('users without inventory permissions cannot create items', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->post(route('inventory.store'), [
            'item_code' => 'ITM-UNAUTH-001',
            'item_name' => 'Unauthorized stock item',
            'unit' => 'pcs',
            'reorder_level' => 1,
            'status' => InventoryItemStatus::Active->value,
        ])
        ->assertForbidden();
});
