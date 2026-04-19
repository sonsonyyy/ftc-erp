<?php

use App\Enums\ProjectStatus;
use App\Enums\QuotationStatus;
use App\Models\Attachment;
use App\Models\Customer;
use App\Models\CustomerSite;
use App\Models\Project;
use App\Models\ProjectAssignment;
use App\Models\Quotation;
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

function actingAsProjectRole(string $roleName): User
{
    $user = User::factory()->create();
    $role = Role::query()->where('name', $roleName)->firstOrFail();

    $user->roles()->sync([$role->getKey()]);

    test()->actingAs($user);

    return $user;
}

test('authorized users can browse paginated projects', function () {
    actingAsProjectRole('Operations Admin');

    Project::factory()->count(16)->create();

    $this->get(route('projects.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('projects/index')
            ->where('projects.total', 16)
            ->where('projects.current_page', 1)
            ->has('projects.data', 15)
            ->where('can.create', true),
        );
});

test('project list can be filtered by search customer and status', function () {
    actingAsProjectRole('Operations Admin');

    $alphaCustomer = Customer::factory()->create([
        'customer_code' => 'CUST-ALPHA',
        'company_name' => 'Alpha Fire Systems',
    ]);
    $alphaSite = CustomerSite::factory()->create([
        'customer_id' => $alphaCustomer->getKey(),
        'site_name' => 'Alpha HQ',
    ]);

    $betaCustomer = Customer::factory()->create([
        'customer_code' => 'CUST-BETA',
        'company_name' => 'Beta Safety Corp',
    ]);
    $betaSite = CustomerSite::factory()->create([
        'customer_id' => $betaCustomer->getKey(),
        'site_name' => 'Beta Branch',
    ]);

    Project::factory()->create([
        'customer_id' => $alphaCustomer->getKey(),
        'customer_site_id' => $alphaSite->getKey(),
        'project_no' => 'PRJ-ALPHA-001',
        'title' => 'Alpha sprinkler retrofit',
        'status' => ProjectStatus::Open,
    ]);

    Project::factory()->create([
        'customer_id' => $betaCustomer->getKey(),
        'customer_site_id' => $betaSite->getKey(),
        'project_no' => 'PRJ-BETA-001',
        'title' => 'Beta detection renewal',
        'status' => ProjectStatus::Cancelled,
    ]);

    $this->get(route('projects.index', [
        'search' => 'Alpha',
        'customer' => $alphaCustomer->getKey(),
        'status' => ProjectStatus::Open->value,
    ]))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('projects/index')
            ->where('filters.search', 'Alpha')
            ->where('filters.customer', $alphaCustomer->getKey())
            ->where('filters.status', ProjectStatus::Open->value)
            ->where('projects.total', 1)
            ->where('projects.data.0.project_no', 'PRJ-ALPHA-001'),
        );
});

test('authorized users can create projects and initial status is logged', function () {
    actingAsProjectRole('Operations Admin');

    $customer = Customer::factory()->create();
    $site = CustomerSite::factory()->create([
        'customer_id' => $customer->getKey(),
    ]);
    $quotation = Quotation::factory()->create([
        'customer_id' => $customer->getKey(),
        'customer_site_id' => $site->getKey(),
        'status' => QuotationStatus::Awarded,
    ]);

    $response = $this->post(route('projects.store'), [
        'project_no' => 'PRJ-00001',
        'quotation_id' => $quotation->getKey(),
        'customer_id' => $customer->getKey(),
        'customer_site_id' => $site->getKey(),
        'title' => 'Main office sprinkler upgrade',
        'project_type' => 'Installation',
        'start_date' => '2026-04-19',
        'target_end_date' => '2026-05-19',
        'status' => ProjectStatus::Draft->value,
        'description' => 'Awarded job kickoff.',
    ]);

    $project = Project::query()->firstOrFail();

    $response->assertRedirect(route('projects.show', $project));

    $this->assertDatabaseHas('projects', [
        'id' => $project->getKey(),
        'project_no' => 'PRJ-00001',
        'quotation_id' => $quotation->getKey(),
        'status' => ProjectStatus::Draft->value,
    ]);

    $this->assertDatabaseHas('project_status_logs', [
        'project_id' => $project->getKey(),
        'from_status' => null,
        'to_status' => ProjectStatus::Draft->value,
    ]);
});

test('project validation errors are returned', function () {
    actingAsProjectRole('Operations Admin');

    $customer = Customer::factory()->create();
    $otherCustomer = Customer::factory()->create();
    $otherSite = CustomerSite::factory()->create([
        'customer_id' => $otherCustomer->getKey(),
    ]);
    $quotation = Quotation::factory()->create([
        'status' => QuotationStatus::Draft,
    ]);

    Project::factory()->create([
        'project_no' => 'PRJ-00001',
    ]);

    $this->from(route('projects.create'))
        ->post(route('projects.store'), [
            'project_no' => 'PRJ-00001',
            'quotation_id' => $quotation->getKey(),
            'customer_id' => $customer->getKey(),
            'customer_site_id' => $otherSite->getKey(),
            'title' => '',
            'project_type' => '',
            'status' => ProjectStatus::Draft->value,
        ])
        ->assertRedirect(route('projects.create'))
        ->assertSessionHasErrors([
            'project_no',
            'customer_site_id',
            'title',
            'project_type',
            'quotation_id',
        ]);
});

test('users without permissions cannot create projects', function () {
    $user = User::factory()->create();
    $customer = Customer::factory()->create();
    $site = CustomerSite::factory()->create([
        'customer_id' => $customer->getKey(),
    ]);

    $this->actingAs($user)
        ->post(route('projects.store'), [
            'project_no' => 'PRJ-UNAUTH-001',
            'customer_id' => $customer->getKey(),
            'customer_site_id' => $site->getKey(),
            'title' => 'Unauthorized project',
            'project_type' => 'Installation',
            'status' => ProjectStatus::Draft->value,
        ])
        ->assertForbidden();
});

test('authorized users can update projects and change status', function () {
    actingAsProjectRole('Operations Admin');

    $customer = Customer::factory()->create();
    $site = CustomerSite::factory()->create([
        'customer_id' => $customer->getKey(),
    ]);
    $project = Project::factory()->create([
        'customer_id' => $customer->getKey(),
        'customer_site_id' => $site->getKey(),
        'status' => ProjectStatus::Draft,
    ]);

    $this->put(route('projects.update', $project), [
        'project_no' => $project->project_no,
        'quotation_id' => null,
        'customer_id' => $customer->getKey(),
        'customer_site_id' => $site->getKey(),
        'title' => 'Updated project title',
        'project_type' => 'Retrofit',
        'start_date' => '2026-04-21',
        'target_end_date' => '2026-06-01',
        'description' => 'Updated notes',
    ])
        ->assertRedirect(route('projects.show', $project));

    $this->post(route('projects.update-status', $project), [
        'status' => ProjectStatus::Open->value,
        'remarks' => 'Released to operations.',
    ])->assertRedirect();

    expect($project->refresh()->title)->toBe('Updated project title');

    $this->assertDatabaseHas('project_status_logs', [
        'project_id' => $project->getKey(),
        'from_status' => ProjectStatus::Draft->value,
        'to_status' => ProjectStatus::Open->value,
    ]);
});

test('authorized users can manage project assignments', function () {
    actingAsProjectRole('Project Coordinator');

    $project = Project::factory()->create();
    $assignee = User::factory()->create();

    $this->post(route('projects.assignments.store', $project), [
        'user_id' => $assignee->getKey(),
        'assignment_role' => 'Project coordinator',
        'notes' => 'Primary owner',
    ])->assertRedirect();

    $assignment = ProjectAssignment::query()->firstOrFail();

    $this->assertDatabaseHas('project_assignments', [
        'project_id' => $project->getKey(),
        'user_id' => $assignee->getKey(),
        'assignment_role' => 'Project coordinator',
    ]);

    $this->delete(route('projects.assignments.destroy', [$project, $assignment]))
        ->assertRedirect();

    $this->assertDatabaseMissing('project_assignments', [
        'id' => $assignment->getKey(),
    ]);
});

test('attachments can be uploaded downloaded and unlinked from projects', function () {
    actingAsProjectRole('Operations Admin');

    Storage::fake('local');

    $project = Project::factory()->create();
    $file = UploadedFile::fake()->create('project-scope.pdf', 128, 'application/pdf');

    $this->from(route('projects.show', $project))
        ->post(route('attachments.store'), [
            'attachable_type' => 'project',
            'attachable_id' => $project->getKey(),
            'file' => $file,
        ])
        ->assertRedirect(route('projects.show', $project));

    $attachment = Attachment::query()->firstOrFail();

    Storage::disk('local')->assertExists($attachment->path);

    $this->assertDatabaseHas('attachment_links', [
        'attachment_id' => $attachment->getKey(),
        'attachable_type' => Project::class,
        'attachable_id' => $project->getKey(),
    ]);

    $this->get(route('attachments.download', $attachment))->assertOk();

    $this->from(route('projects.show', $project))
        ->post(route('attachments.unlink', $attachment), [
            'attachable_type' => 'project',
            'attachable_id' => $project->getKey(),
        ])
        ->assertRedirect(route('projects.show', $project));

    $this->assertDatabaseMissing('attachments', [
        'id' => $attachment->getKey(),
    ]);

    Storage::disk('local')->assertMissing($attachment->path);
});
