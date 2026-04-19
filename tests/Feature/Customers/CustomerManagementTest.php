<?php

use App\Enums\CustomerStatus;
use App\Models\Attachment;
use App\Models\Customer;
use App\Models\CustomerSite;
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

function actingAsRole(string $roleName): User
{
    $user = User::factory()->create();
    $role = Role::query()->where('name', $roleName)->firstOrFail();

    $user->roles()->sync([$role->getKey()]);

    test()->actingAs($user);

    return $user;
}

test('authorized users can browse paginated customers', function () {
    actingAsRole('Sales Admin / Business Development');

    Customer::factory()->count(16)->create();

    $this->get(route('customers.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('customers/index')
            ->where('customers.total', 16)
            ->where('customers.current_page', 1)
            ->has('customers.data', 15)
            ->where('can.create', true),
        );
});

test('customer list can be filtered by search and status', function () {
    actingAsRole('Sales Admin / Business Development');

    Customer::factory()->create([
        'customer_code' => 'CUST-ALPHA',
        'company_name' => 'Alpha Fire Systems',
        'status' => CustomerStatus::Active,
    ]);

    Customer::factory()->create([
        'customer_code' => 'CUST-BETA',
        'company_name' => 'Beta Safety Corp',
        'status' => CustomerStatus::Inactive,
    ]);

    $this->get(route('customers.index', [
        'search' => 'Alpha',
        'status' => CustomerStatus::Active->value,
    ]))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('customers/index')
            ->where('filters.search', 'Alpha')
            ->where('filters.status', CustomerStatus::Active->value)
            ->where('customers.total', 1)
            ->where('customers.data.0.company_name', 'Alpha Fire Systems'),
        );
});

test('authorized users can create customers', function () {
    actingAsRole('Sales Admin / Business Development');

    $response = $this->post(route('customers.store'), [
        'customer_code' => 'CUST-00001',
        'company_name' => 'Prime Fire Solutions',
        'trade_name' => 'Prime Fire',
        'tin' => '123-456-789-000',
        'phone' => '09170000001',
        'email' => 'prime@example.com',
        'billing_address' => '123 Main Street',
        'status' => CustomerStatus::Active->value,
        'notes' => 'Priority account',
    ]);

    $customer = Customer::query()->firstOrFail();

    $response->assertRedirect(route('customers.show', $customer));

    $this->assertDatabaseHas('customers', [
        'id' => $customer->getKey(),
        'customer_code' => 'CUST-00001',
        'company_name' => 'Prime Fire Solutions',
        'status' => CustomerStatus::Active->value,
    ]);
});

test('customer validation errors are returned', function () {
    actingAsRole('Sales Admin / Business Development');

    Customer::factory()->create([
        'customer_code' => 'CUST-00001',
    ]);

    $this->from(route('customers.create'))
        ->post(route('customers.store'), [
            'customer_code' => 'CUST-00001',
            'company_name' => '',
            'status' => 'invalid-status',
        ])
        ->assertRedirect(route('customers.create'))
        ->assertSessionHasErrors([
            'customer_code',
            'company_name',
            'status',
        ]);
});

test('users without permissions cannot create customers', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->post(route('customers.store'), [
            'customer_code' => 'CUST-UNAUTH',
            'company_name' => 'Unauthorized Customer',
            'status' => CustomerStatus::Active->value,
        ])
        ->assertForbidden();
});

test('authorized users can update customers', function () {
    actingAsRole('Sales Admin / Business Development');

    $customer = Customer::factory()->create();

    $this->put(route('customers.update', $customer), [
        'customer_code' => $customer->customer_code,
        'company_name' => 'Updated Fire Protection',
        'trade_name' => null,
        'tin' => null,
        'phone' => '09171111111',
        'email' => 'updated@example.com',
        'billing_address' => 'Updated address',
        'status' => CustomerStatus::Inactive->value,
        'notes' => 'Updated note',
    ])
        ->assertRedirect(route('customers.show', $customer));

    expect($customer->refresh()->company_name)->toBe('Updated Fire Protection');
    expect($customer->status)->toBe(CustomerStatus::Inactive);
});

test('authorized users can archive customers without linked sites', function () {
    actingAsRole('Sales Admin / Business Development');

    $customer = Customer::factory()->create();

    $this->delete(route('customers.destroy', $customer))
        ->assertRedirect(route('customers.index'));

    $this->assertSoftDeleted($customer);
});

test('customers with linked sites cannot be archived', function () {
    actingAsRole('Sales Admin / Business Development');

    $customer = Customer::factory()->create();
    CustomerSite::factory()->create([
        'customer_id' => $customer->getKey(),
    ]);

    $this->delete(route('customers.destroy', $customer))
        ->assertForbidden();

    expect($customer->fresh())->not->toBeNull();
});

test('attachments can be uploaded downloaded and unlinked from customers', function () {
    actingAsRole('Sales Admin / Business Development');

    Storage::fake('local');

    $customer = Customer::factory()->create();
    $file = UploadedFile::fake()->create(
        'customer-brief.pdf',
        128,
        'application/pdf',
    );

    $this->from(route('customers.show', $customer))
        ->post(route('attachments.store'), [
            'attachable_type' => 'customer',
            'attachable_id' => $customer->getKey(),
            'file' => $file,
        ])
        ->assertRedirect(route('customers.show', $customer));

    $attachment = Attachment::query()->firstOrFail();

    Storage::disk('local')->assertExists($attachment->path);

    $this->assertDatabaseHas('attachment_links', [
        'attachment_id' => $attachment->getKey(),
        'attachable_type' => Customer::class,
        'attachable_id' => $customer->getKey(),
    ]);

    $this->get(route('attachments.download', $attachment))
        ->assertOk();

    $this->from(route('customers.show', $customer))
        ->post(route('attachments.unlink', $attachment), [
            'attachable_type' => 'customer',
            'attachable_id' => $customer->getKey(),
        ])
        ->assertRedirect(route('customers.show', $customer));

    $this->assertDatabaseMissing('attachments', [
        'id' => $attachment->getKey(),
    ]);

    $this->assertDatabaseMissing('attachment_links', [
        'attachment_id' => $attachment->getKey(),
        'attachable_type' => Customer::class,
        'attachable_id' => $customer->getKey(),
    ]);

    Storage::disk('local')->assertMissing($attachment->path);
});
