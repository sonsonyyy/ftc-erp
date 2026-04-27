<?php

use App\Models\Role;
use App\Models\User;
use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Inertia\Testing\AssertableInertia as Assert;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->seed(RolesAndPermissionsSeeder::class);
    $this->withoutVite();
});

function actingAsSuperAdmin(): User
{
    $user = User::factory()->create();
    $role = Role::query()->where('name', Role::SUPER_ADMIN)->firstOrFail();

    $user->roles()->sync([$role->getKey()]);

    test()->actingAs($user);

    return $user;
}

function roleId(string $roleName): int
{
    return (int) Role::query()->where('name', $roleName)->value('id');
}

test('authorized users can browse paginated users', function () {
    actingAsSuperAdmin();

    User::factory()->count(15)->create()->each(function (User $user): void {
        $user->roles()->sync([roleId('Sales Admin / Business Development')]);
    });

    $this->get(route('users.index', [
        'per_page' => 5,
    ]))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('users/index')
            ->where('users.total', 16)
            ->where('users.current_page', 1)
            ->has('users.data', 5)
            ->where('filters.per_page', 5)
            ->where('summary.total_users', 16)
            ->where('summary.active_users', 16)
            ->where('summary.inactive_users', 0)
            ->where('summary.roles_in_use', 2)
            ->where('can.create', true),
        );
});

test('user list can be filtered by role and activity', function () {
    actingAsSuperAdmin();

    $salesRoleId = roleId('Sales Admin / Business Development');
    $operationsRoleId = roleId('Operations Admin');

    $activeSalesUser = User::factory()->create([
        'name' => 'Alpha Sales',
        'is_active' => true,
    ]);
    $activeSalesUser->roles()->sync([$salesRoleId]);

    $inactiveOperationsUser = User::factory()->inactive()->create([
        'name' => 'Dormant Operations',
    ]);
    $inactiveOperationsUser->roles()->sync([$operationsRoleId]);

    $this->get(route('users.index', [
        'search' => 'alpha',
        'role' => $salesRoleId,
        'active' => 'active',
        'per_page' => 5,
    ]))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('users/index')
            ->where('filters.search', 'alpha')
            ->where('filters.role', $salesRoleId)
            ->where('filters.active', 'active')
            ->where('filters.per_page', 5)
            ->where('users.total', 1)
            ->where('users.data.0.name', 'Alpha Sales'),
        );
});

test('authorized users can create managed users with roles', function () {
    actingAsSuperAdmin();

    $salesRoleId = roleId('Sales Admin / Business Development');
    $operationsRoleId = roleId('Operations Admin');

    $response = $this->post(route('users.store'), [
        'name' => 'Operations Clerk',
        'email' => 'operations@example.com',
        'password' => 'password',
        'password_confirmation' => 'password',
        'is_active' => true,
        'role_ids' => [$salesRoleId, $operationsRoleId],
    ]);

    $managedUser = User::query()->where('email', 'operations@example.com')->firstOrFail();

    $response->assertRedirect(route('users.show', $managedUser));

    $this->assertDatabaseHas('users', [
        'id' => $managedUser->getKey(),
        'email' => 'operations@example.com',
        'is_active' => true,
    ]);

    expect($managedUser->email_verified_at)->not->toBeNull();
    expect($managedUser->roles()->count())->toBe(2);
});

test('user validation errors are returned', function () {
    actingAsSuperAdmin();

    User::factory()->create([
        'email' => 'duplicate@example.com',
    ]);

    $this->from(route('users.create'))
        ->post(route('users.store'), [
            'name' => '',
            'email' => 'duplicate@example.com',
            'password' => '',
            'password_confirmation' => '',
            'is_active' => true,
            'role_ids' => [],
        ])
        ->assertRedirect(route('users.create'))
        ->assertSessionHasErrors([
            'name',
            'email',
            'password',
            'role_ids',
        ]);
});

test('users without permission cannot create managed users', function () {
    $this->actingAs(User::factory()->create())
        ->post(route('users.store'), [
            'name' => 'Unauthorized User',
            'email' => 'unauthorized@example.com',
            'password' => 'password',
            'password_confirmation' => 'password',
            'is_active' => true,
            'role_ids' => [roleId('Sales Admin / Business Development')],
        ])
        ->assertForbidden();
});

test('authorized users can update managed users', function () {
    actingAsSuperAdmin();

    $managedUser = User::factory()->create([
        'email' => 'staff@example.com',
    ]);
    $managedUser->roles()->sync([
        roleId('Sales Admin / Business Development'),
    ]);

    $this->put(route('users.update', $managedUser), [
        'name' => 'Updated Staff',
        'email' => 'updated-staff@example.com',
        'password' => 'new-password',
        'password_confirmation' => 'new-password',
        'is_active' => true,
        'role_ids' => [roleId('Operations Admin')],
    ])->assertRedirect(route('users.show', $managedUser));

    $managedUser->refresh();

    expect($managedUser->name)->toBe('Updated Staff');
    expect($managedUser->email)->toBe('updated-staff@example.com');
    expect($managedUser->roles()->pluck('name')->all())->toBe(['Operations Admin']);
    expect(Hash::check('new-password', $managedUser->password))->toBeTrue();
});

test('super admins cannot deactivate their own account', function () {
    $admin = actingAsSuperAdmin();

    $this->from(route('users.edit', $admin))
        ->put(route('users.update', $admin), [
            'name' => $admin->name,
            'email' => $admin->email,
            'password' => '',
            'password_confirmation' => '',
            'is_active' => false,
            'role_ids' => [roleId(Role::SUPER_ADMIN)],
        ])
        ->assertRedirect(route('users.edit', $admin))
        ->assertSessionHasErrors(['is_active']);
});

test('super admins cannot archive their own account', function () {
    $admin = actingAsSuperAdmin();

    $this->delete(route('users.destroy', $admin))
        ->assertForbidden();

    expect($admin->fresh())->not->toBeNull();
});

test('authorized users can archive other users', function () {
    actingAsSuperAdmin();

    $managedUser = User::factory()->create();
    $managedUser->roles()->sync([
        roleId('Sales Admin / Business Development'),
    ]);

    $this->delete(route('users.destroy', $managedUser))
        ->assertRedirect(route('users.index'));

    $this->assertSoftDeleted($managedUser);
});
