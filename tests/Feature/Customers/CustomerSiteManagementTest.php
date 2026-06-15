<?php

use App\Models\Attachment;
use App\Models\Customer;
use App\Models\CustomerSite;
use App\Models\Role;
use App\Models\User;
use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->seed(RolesAndPermissionsSeeder::class);
    $this->withoutVite();
    Carbon::setTestNow();
});

function actingAsSiteRole(string $roleName): User
{
    $user = User::factory()->create();
    $role = Role::query()->where('name', $roleName)->firstOrFail();

    $user->roles()->sync([$role->getKey()]);

    test()->actingAs($user);

    return $user;
}

test('authorized users can browse paginated sites', function () {
    actingAsSiteRole('Sales Admin / Business Development');

    CustomerSite::factory()->count(12)->create([
        'is_active' => true,
    ]);

    CustomerSite::factory()->count(4)->create([
        'is_active' => false,
    ]);

    $this->get(route('sites.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('sites/index')
            ->where('sites.total', 16)
            ->where('sites.current_page', 1)
            ->where('sites.per_page', 15)
            ->has('sites.data', 15)
            ->has('sites.data.0.site_code')
            ->has('sites.data.0.contact_person')
            ->where('summary.total_sites', 16)
            ->where('summary.active_sites', 12)
            ->where('summary.inactive_sites', 4)
            ->where('summary.linked_customers', 16)
            ->where('filters.per_page', 15)
            ->where('can.create', true),
        );
});

test('site list supports custom page size', function () {
    actingAsSiteRole('Sales Admin / Business Development');

    CustomerSite::factory()->count(12)->create();

    $this->get(route('sites.index', [
        'per_page' => 5,
    ]))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('sites/index')
            ->where('sites.per_page', 5)
            ->has('sites.data', 5)
            ->where('filters.per_page', 5),
        );
});

test('site create form can preselect the customer from the query string', function () {
    actingAsSiteRole('Sales Admin / Business Development');

    $customer = Customer::factory()->create();

    $this->get(route('sites.create', [
        'customer' => $customer->getKey(),
    ]))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('sites/create')
            ->where('defaults.customer_id', $customer->getKey())
            ->where('defaults.is_active', true),
        );
});

test('site list can be filtered by search and status', function () {
    actingAsSiteRole('Sales Admin / Business Development');

    $customer = Customer::factory()->create([
        'company_name' => 'North Fire',
    ]);

    CustomerSite::factory()->create([
        'customer_id' => $customer->getKey(),
        'site_name' => 'HQ One',
        'is_active' => true,
    ]);

    CustomerSite::factory()->create([
        'site_name' => 'Dormant Branch',
        'is_active' => false,
    ]);

    $this->get(route('sites.index', [
        'search' => 'north',
        'status' => 'active',
    ]))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('sites/index')
            ->where('filters.search', 'north')
            ->where('filters.status', 'active')
            ->where('sites.total', 1)
            ->where('sites.data.0.site_name', 'HQ One'),
        );
});

test('site list search is case insensitive', function () {
    actingAsSiteRole('Sales Admin / Business Development');

    $customer = Customer::factory()->create([
        'company_name' => 'North Fire',
    ]);
    $otherCustomer = Customer::factory()->create([
        'company_name' => 'South Fire',
    ]);

    CustomerSite::factory()->create([
        'customer_id' => $customer->getKey(),
        'site_name' => 'North HQ',
        'city' => 'Quezon City',
        'province' => 'Metro Manila',
    ]);

    CustomerSite::factory()->create([
        'customer_id' => $otherCustomer->getKey(),
        'site_name' => 'South Branch',
        'city' => 'Pasig',
        'province' => 'Metro Manila',
    ]);

    $this->get(route('sites.index', [
        'search' => 'north',
    ]))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('sites/index')
            ->where('filters.search', 'north')
            ->where('sites.total', 1)
            ->where('sites.data.0.site_name', 'North HQ'),
        );
});

test('site export respects the active filters', function () {
    actingAsSiteRole('Sales Admin / Business Development');

    $customer = Customer::factory()->create([
        'company_name' => 'North Fire',
    ]);

    CustomerSite::factory()->create([
        'customer_id' => $customer->getKey(),
        'site_name' => 'North HQ',
        'is_active' => true,
    ]);

    CustomerSite::factory()->create([
        'site_name' => 'Dormant Branch',
        'is_active' => false,
    ]);

    $response = $this->get(route('sites.index', [
        'search' => 'North Fire',
        'status' => 'active',
        'export' => 'csv',
    ]));

    $response->assertOk()
        ->assertHeader('content-type', 'text/csv; charset=UTF-8');

    expect($response->streamedContent())
        ->toContain('North HQ')
        ->not->toContain('Dormant Branch');
});

test('authorized users can create sites', function () {
    actingAsSiteRole('Sales Admin / Business Development');
    Carbon::setTestNow('2026-06-14 09:00:00');

    $customer = Customer::factory()->create();

    $response = $this->post(route('sites.store'), [
        'customer_id' => $customer->getKey(),
        'site_name' => 'Main Office',
        'contact_person' => 'Jane Doe',
        'contact_no' => '09170000002',
        'email' => 'site@example.com',
        'address' => '456 Service Road',
        'city' => 'Quezon City',
        'province' => 'Metro Manila',
        'notes' => '24/7 access',
        'is_active' => true,
    ]);

    $site = CustomerSite::query()->firstOrFail();

    $response->assertRedirect(route('sites.show', $site));

    $this->assertDatabaseHas('customer_sites', [
        'id' => $site->getKey(),
        'customer_id' => $customer->getKey(),
        'site_code' => 'SITE-0626-0001',
        'site_name' => 'Main Office',
        'is_active' => true,
    ]);
});

test('site validation errors are returned', function () {
    actingAsSiteRole('Sales Admin / Business Development');

    $this->from(route('sites.create'))
        ->post(route('sites.store'), [
            'customer_id' => 999999,
            'site_name' => '',
            'address' => '',
            'is_active' => 'not-a-boolean',
        ])
        ->assertRedirect(route('sites.create'))
        ->assertSessionHasErrors([
            'customer_id',
            'site_name',
            'address',
            'is_active',
        ]);
});

test('users without permissions cannot create sites', function () {
    $user = User::factory()->create();
    $customer = Customer::factory()->create();

    $this->actingAs($user)
        ->post(route('sites.store'), [
            'customer_id' => $customer->getKey(),
            'site_name' => 'Unauthorized Site',
            'address' => 'Unknown address',
            'is_active' => true,
        ])
        ->assertForbidden();
});

test('authorized users can update sites', function () {
    actingAsSiteRole('Sales Admin / Business Development');

    $site = CustomerSite::factory()->create([
        'site_name' => 'Old Site',
    ]);

    $this->put(route('sites.update', $site), [
        'customer_id' => $site->customer_id,
        'site_code' => 'SITE-9999-OVERRIDE',
        'site_name' => 'Updated Site',
        'contact_person' => 'Updated Contact',
        'contact_no' => '09179999999',
        'email' => 'updated-site@example.com',
        'address' => 'Updated address',
        'city' => 'Pasig',
        'province' => 'Metro Manila',
        'notes' => 'Updated note',
        'is_active' => false,
    ])
        ->assertRedirect(route('sites.show', $site));

    expect($site->refresh()->site_name)->toBe('Updated Site');
    expect($site->is_active)->toBeFalse();
    expect($site->site_code)->not->toBe('SITE-9999-OVERRIDE');
});

test('authorized users can archive sites', function () {
    actingAsSiteRole('Sales Admin / Business Development');

    $site = CustomerSite::factory()->create();

    $this->delete(route('sites.destroy', $site))
        ->assertRedirect(route('sites.index'));

    $this->assertSoftDeleted($site);
});

test('attachments can be uploaded and unlinked from sites', function () {
    actingAsSiteRole('Sales Admin / Business Development');

    Storage::fake('local');

    $site = CustomerSite::factory()->create();
    $file = UploadedFile::fake()->create(
        'site-plan.pdf',
        96,
        'application/pdf',
    );

    $this->from(route('sites.show', $site))
        ->post(route('attachments.store'), [
            'attachable_type' => 'site',
            'attachable_id' => $site->getKey(),
            'file' => $file,
        ])
        ->assertRedirect(route('sites.show', $site));

    $attachment = Attachment::query()->firstOrFail();

    Storage::disk('local')->assertExists($attachment->path);

    $this->assertDatabaseHas('attachment_links', [
        'attachment_id' => $attachment->getKey(),
        'attachable_type' => CustomerSite::class,
        'attachable_id' => $site->getKey(),
    ]);

    $this->from(route('sites.show', $site))
        ->post(route('attachments.unlink', $attachment), [
            'attachable_type' => 'site',
            'attachable_id' => $site->getKey(),
        ])
        ->assertRedirect(route('sites.show', $site));

    $this->assertDatabaseMissing('attachments', [
        'id' => $attachment->getKey(),
    ]);

    Storage::disk('local')->assertMissing($attachment->path);
});
