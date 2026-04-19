<?php

use App\Models\Role;
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

function actingAsWarehouseInventoryRole(string $roleName): User
{
    $user = User::factory()->create();
    $role = Role::query()->where('name', $roleName)->firstOrFail();

    $user->roles()->sync([$role->getKey()]);

    test()->actingAs($user);

    return $user;
}

test('authorized users can browse paginated warehouses', function () {
    actingAsWarehouseInventoryRole('Warehouse / Inventory Officer');

    Warehouse::factory()->count(16)->create();

    $this->get(route('warehouses.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('warehouses/index')
            ->where('warehouses.total', 16)
            ->where('warehouses.current_page', 1)
            ->has('warehouses.data', 15)
            ->where('can.create', true),
        );
});

test('warehouse list can be filtered by search and activity', function () {
    actingAsWarehouseInventoryRole('Warehouse / Inventory Officer');

    Warehouse::factory()->create([
        'warehouse_code' => 'WH-ACTIVE',
        'warehouse_name' => 'Main Active Warehouse',
        'is_active' => true,
    ]);

    Warehouse::factory()->create([
        'warehouse_code' => 'WH-INACTIVE',
        'warehouse_name' => 'Dormant Warehouse',
        'is_active' => false,
    ]);

    $this->get(route('warehouses.index', [
        'search' => 'Main',
        'activity' => 'active',
    ]))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('warehouses/index')
            ->where('filters.search', 'Main')
            ->where('filters.activity', 'active')
            ->where('warehouses.total', 1)
            ->where('warehouses.data.0.warehouse_code', 'WH-ACTIVE'),
        );
});

test('authorized users can create update and archive warehouses', function () {
    actingAsWarehouseInventoryRole('Warehouse / Inventory Officer');

    $createResponse = $this->post(route('warehouses.store'), [
        'warehouse_code' => 'WH-OPS',
        'warehouse_name' => 'Operations Warehouse',
        'address' => 'Operations Compound',
        'contact_person' => 'Carla Gomez',
        'contact_no' => '09170000001',
        'is_active' => true,
        'notes' => 'Primary stock location',
    ]);

    $warehouse = Warehouse::query()->where('warehouse_code', 'WH-OPS')->firstOrFail();

    $createResponse->assertRedirect(route('warehouses.show', $warehouse));

    $this->put(route('warehouses.update', $warehouse), [
        'warehouse_code' => 'WH-OPS',
        'warehouse_name' => 'Operations Warehouse Updated',
        'address' => 'Updated Operations Compound',
        'contact_person' => 'Carla Gomez',
        'contact_no' => '09171111111',
        'is_active' => false,
        'notes' => 'Temporarily closed for audit',
    ])->assertRedirect(route('warehouses.show', $warehouse));

    expect($warehouse->refresh()->warehouse_name)->toBe('Operations Warehouse Updated');
    expect($warehouse->is_active)->toBeFalse();

    $this->delete(route('warehouses.destroy', $warehouse))
        ->assertRedirect(route('warehouses.index'));

    $this->assertSoftDeleted($warehouse);
});

test('warehouse validation errors are returned', function () {
    actingAsWarehouseInventoryRole('Warehouse / Inventory Officer');

    Warehouse::factory()->create([
        'warehouse_code' => 'WH-DUP',
    ]);

    $this->from(route('warehouses.create'))
        ->post(route('warehouses.store'), [
            'warehouse_code' => 'WH-DUP',
            'warehouse_name' => '',
            'is_active' => 'not-bool',
        ])
        ->assertRedirect(route('warehouses.create'))
        ->assertSessionHasErrors([
            'warehouse_code',
            'warehouse_name',
            'is_active',
        ]);
});

test('users without warehouse permissions cannot create warehouses', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->post(route('warehouses.store'), [
            'warehouse_code' => 'WH-UNAUTH',
            'warehouse_name' => 'Unauthorized Warehouse',
            'is_active' => true,
        ])
        ->assertForbidden();
});
