<?php

use App\Enums\ComplianceAlertType;
use App\Enums\ComplianceRecordStatus;
use App\Enums\ComplianceRecurrenceUnit;
use App\Enums\ComplianceTaskStatus;
use App\Models\Attachment;
use App\Models\ComplianceAlert;
use App\Models\ComplianceRecord;
use App\Models\ComplianceTask;
use App\Models\ComplianceTemplate;
use App\Models\Role;
use App\Models\User;
use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->seed(RolesAndPermissionsSeeder::class);
    $this->withoutVite();
});

afterEach(function () {
    Carbon::setTestNow();
});

test('compliance migration files are ordered by table dependencies', function () {
    $migrationFiles = collect(glob(database_path('migrations/*create_compliance_*_table.php')))
        ->map(fn (string $path) => basename($path))
        ->values();

    expect($migrationFiles->search('2026_04_21_023850_create_compliance_templates_table.php'))
        ->toBeLessThan($migrationFiles->search('2026_04_21_023851_create_compliance_records_table.php'));
});

function actingAsComplianceRole(string $roleName): User
{
    $user = User::factory()->create();
    $role = Role::query()->where('name', $roleName)->firstOrFail();

    $user->roles()->sync([$role->getKey()]);

    test()->actingAs($user);

    return $user;
}

test('authorized users can browse paginated compliance records with filters', function () {
    Carbon::setTestNow('2026-04-20 09:00:00');

    $assignee = actingAsComplianceRole('Compliance Officer / Corporate Admin');

    $matchingRecord = ComplianceRecord::factory()->create([
        'record_no' => 'CMP-ALPHA-001',
        'title' => 'Alpha GIS Filing',
        'agency' => 'SEC',
        'assigned_user_id' => $assignee->getKey(),
        'due_date' => '2026-05-05',
        'status' => ComplianceRecordStatus::Active,
    ]);

    ComplianceRecord::factory()->count(15)->create();

    $this->get(route('compliance-records.index', [
        'search' => 'Alpha',
        'status' => ComplianceRecordStatus::DueSoon->value,
        'agency' => 'SEC',
        'assigned' => $assignee->getKey(),
    ]))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('compliance-records/index')
            ->where('filters.search', 'Alpha')
            ->where('filters.status', ComplianceRecordStatus::DueSoon->value)
            ->where('filters.agency', 'SEC')
            ->where('filters.assigned', $assignee->getKey())
            ->where('complianceRecords.total', 1)
            ->where('complianceRecords.current_page', 1)
            ->where('complianceRecords.data.0.record_no', $matchingRecord->record_no)
            ->where('can.create', true),
        );
});

test('authorized users can create compliance records', function () {
    $assignee = User::factory()->create();
    $template = ComplianceTemplate::factory()->create([
        'name' => 'GIS',
        'agency' => 'SEC',
        'category' => 'Corporate Filing',
    ]);

    actingAsComplianceRole('Compliance Officer / Corporate Admin');

    $response = $this->post(route('compliance-records.store'), [
        'record_no' => 'CMP-2026-0101',
        'compliance_template_id' => $template->getKey(),
        'title' => '2026 GIS Filing',
        'agency' => 'SEC',
        'category' => 'Corporate Filing',
        'description' => 'Annual filing',
        'due_date' => '2026-05-05',
        'expiry_date' => null,
        'recurrence_unit' => ComplianceRecurrenceUnit::Annually->value,
        'reminder_days' => [30, 15, 7],
        'assigned_user_id' => $assignee->getKey(),
        'status' => ComplianceRecordStatus::Active->value,
        'notes' => 'Prepare board documents.',
    ]);

    $record = ComplianceRecord::query()->firstOrFail();

    $response->assertRedirect(route('compliance-records.show', $record));

    $this->assertDatabaseHas('compliance_records', [
        'id' => $record->getKey(),
        'record_no' => 'CMP-2026-0101',
        'agency' => 'SEC',
        'status' => ComplianceRecordStatus::Active->value,
    ]);
});

test('compliance record validation errors are returned', function () {
    actingAsComplianceRole('Compliance Officer / Corporate Admin');

    ComplianceRecord::factory()->create([
        'record_no' => 'CMP-2026-0101',
    ]);

    $this->from(route('compliance-records.create'))
        ->post(route('compliance-records.store'), [
            'record_no' => 'CMP-2026-0101',
            'title' => '',
            'agency' => '',
            'recurrence_unit' => 'invalid',
            'status' => 'invalid',
            'reminder_days' => [5],
        ])
        ->assertRedirect(route('compliance-records.create'))
        ->assertSessionHasErrors([
            'record_no',
            'title',
            'agency',
            'recurrence_unit',
            'status',
            'reminder_days.0',
            'due_date',
        ]);
});

test('users without permissions cannot create compliance records', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->post(route('compliance-records.store'), [
            'record_no' => 'CMP-UNAUTH-001',
            'title' => 'Unauthorized filing',
            'agency' => 'SEC',
            'due_date' => '2026-05-05',
            'recurrence_unit' => ComplianceRecurrenceUnit::Annually->value,
            'status' => ComplianceRecordStatus::Draft->value,
        ])
        ->assertForbidden();
});

test('authorized users can update records add submissions and manage tasks', function () {
    $assignee = User::factory()->create();

    actingAsComplianceRole('Compliance Officer / Corporate Admin');

    $record = ComplianceRecord::factory()->create([
        'status' => ComplianceRecordStatus::InProgress,
        'due_date' => '2026-04-30',
    ]);

    $this->put(route('compliance-records.update', $record), [
        'record_no' => $record->record_no,
        'compliance_template_id' => $record->compliance_template_id,
        'title' => 'Updated compliance title',
        'agency' => $record->agency,
        'category' => $record->category,
        'description' => 'Updated description',
        'due_date' => '2026-05-10',
        'expiry_date' => null,
        'recurrence_unit' => $record->recurrence_unit->value,
        'reminder_days' => [30, 15, 7],
        'assigned_user_id' => $assignee->getKey(),
        'status' => ComplianceRecordStatus::Active->value,
        'notes' => 'Updated notes',
    ])->assertRedirect(route('compliance-records.show', $record));

    $this->post(route('compliance-records.submissions.store', $record), [
        'reference_no' => 'SUB-CMP-1001',
        'submitted_at' => '2026-05-01',
        'next_due_date' => '2026-08-01',
        'next_expiry_date' => null,
        'remarks' => 'Filed successfully',
    ])->assertRedirect();

    $this->post(route('compliance-records.tasks.store', $record), [
        'title' => 'Prepare next renewal pack',
        'due_date' => '2026-07-15',
        'assigned_user_id' => $assignee->getKey(),
        'status' => ComplianceTaskStatus::Open->value,
        'notes' => 'Coordinate signed forms',
    ])->assertRedirect();

    $task = ComplianceTask::query()->firstOrFail();

    $this->patch(route('compliance-records.tasks.update', [$record, $task]), [
        'status' => ComplianceTaskStatus::Completed->value,
    ])->assertRedirect();

    $this->delete(route('compliance-records.tasks.destroy', [$record, $task]))
        ->assertRedirect();

    expect($record->refresh()->title)->toBe('Updated compliance title');
    expect($record->due_date?->toDateString())->toBe('2026-08-01');
    expect($record->latest_submission_reference)->toBe('SUB-CMP-1001');
    expect($record->status)->toBe(ComplianceRecordStatus::Renewed);

    $this->assertDatabaseHas('compliance_submissions', [
        'compliance_record_id' => $record->getKey(),
        'reference_no' => 'SUB-CMP-1001',
    ]);

    $this->assertDatabaseMissing('compliance_tasks', [
        'id' => $task->getKey(),
    ]);
});

test('attachments can be uploaded downloaded and unlinked from compliance records', function () {
    actingAsComplianceRole('Compliance Officer / Corporate Admin');

    Storage::fake('local');

    $record = ComplianceRecord::factory()->create();
    $file = UploadedFile::fake()->create('gis-filing.pdf', 128, 'application/pdf');

    $this->from(route('compliance-records.show', $record))
        ->post(route('attachments.store'), [
            'attachable_type' => 'compliance_record',
            'attachable_id' => $record->getKey(),
            'file' => $file,
        ])
        ->assertRedirect(route('compliance-records.show', $record));

    $attachment = Attachment::query()->firstOrFail();

    Storage::disk('local')->assertExists($attachment->path);

    $this->assertDatabaseHas('attachment_links', [
        'attachment_id' => $attachment->getKey(),
        'attachable_type' => ComplianceRecord::class,
        'attachable_id' => $record->getKey(),
    ]);

    $this->get(route('attachments.download', $attachment))->assertOk();

    $this->from(route('compliance-records.show', $record))
        ->post(route('attachments.unlink', $attachment), [
            'attachable_type' => 'compliance_record',
            'attachable_id' => $record->getKey(),
        ])
        ->assertRedirect(route('compliance-records.show', $record));

    $this->assertDatabaseMissing('attachments', [
        'id' => $attachment->getKey(),
    ]);

    Storage::disk('local')->assertMissing($attachment->path);
});

test('authorized users can browse and acknowledge compliance alerts', function () {
    actingAsComplianceRole('Compliance Officer / Corporate Admin');

    $record = ComplianceRecord::factory()->create([
        'record_no' => 'CMP-ALERT-001',
        'title' => 'Mayor permit renewal',
        'agency' => 'Mayor\'s Office',
    ]);

    $alert = ComplianceAlert::factory()->create([
        'compliance_record_id' => $record->getKey(),
        'alert_type' => ComplianceAlertType::ExpiryReminder,
        'deadline_type' => 'expiry',
        'scheduled_for' => '2026-04-20',
        'reference_date' => '2026-05-20',
        'days_before' => 30,
        'acknowledged_at' => null,
        'acknowledged_by_user_id' => null,
    ]);

    $this->get(route('compliance-alerts.index', [
        'search' => 'Mayor',
        'type' => ComplianceAlertType::ExpiryReminder->value,
        'acknowledged' => 'unacknowledged',
        'agency' => 'Mayor\'s Office',
    ]))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('compliance-alerts/index')
            ->where('filters.search', 'Mayor')
            ->where('filters.type', ComplianceAlertType::ExpiryReminder->value)
            ->where('filters.acknowledged', 'unacknowledged')
            ->where('filters.agency', 'Mayor\'s Office')
            ->where('alerts.total', 1)
            ->where('alerts.data.0.id', $alert->getKey()),
        );

    $this->patch(route('compliance-alerts.acknowledge', $alert))
        ->assertRedirect();

    expect($alert->refresh()->acknowledged_at)->not->toBeNull();
});

test('compliance calendar shows windowed events and overdue items', function () {
    Carbon::setTestNow('2026-04-20 09:00:00');

    actingAsComplianceRole('Compliance Officer / Corporate Admin');

    ComplianceRecord::factory()->create([
        'record_no' => 'CMP-CAL-001',
        'title' => 'Upcoming GIS',
        'agency' => 'SEC',
        'due_date' => '2026-04-25',
        'expiry_date' => null,
        'status' => ComplianceRecordStatus::Active,
    ]);

    ComplianceRecord::factory()->create([
        'record_no' => 'CMP-CAL-002',
        'title' => 'Expired permit',
        'agency' => 'Mayor\'s Office',
        'due_date' => null,
        'expiry_date' => '2026-04-15',
        'status' => ComplianceRecordStatus::Active,
    ]);

    $this->get(route('compliance-records.calendar', [
        'agency' => '',
        'status' => '',
        'from' => '2026-04-01',
        'to' => '2026-04-30',
    ]))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('compliance-records/calendar')
            ->where('filters.from', '2026-04-01')
            ->where('filters.to', '2026-04-30')
            ->where('events.0.record_no', 'CMP-CAL-001')
            ->where('overdueItems.0.record_no', 'CMP-CAL-002'),
        );
});

test('compliance alert generation command creates reminder and overdue alerts', function () {
    Carbon::setTestNow('2026-04-20 09:00:00');

    ComplianceRecord::factory()->create([
        'record_no' => 'CMP-CMD-001',
        'due_date' => '2026-05-05',
        'expiry_date' => null,
        'reminder_days' => [15],
        'status' => ComplianceRecordStatus::Active,
    ]);

    ComplianceRecord::factory()->create([
        'record_no' => 'CMP-CMD-002',
        'due_date' => '2026-04-18',
        'expiry_date' => null,
        'reminder_days' => [15],
        'status' => ComplianceRecordStatus::ForFiling,
    ]);

    $this->artisan('compliance:generate-alerts', [
        '--date' => '2026-04-20',
        '--sync' => true,
    ])->assertExitCode(0);

    $this->assertDatabaseHas('compliance_alerts', [
        'alert_type' => ComplianceAlertType::DueReminder->value,
        'scheduled_for' => '2026-04-20',
        'reference_date' => '2026-05-05',
    ]);

    $this->assertDatabaseHas('compliance_alerts', [
        'alert_type' => ComplianceAlertType::DueOverdue->value,
        'scheduled_for' => '2026-04-20',
        'reference_date' => '2026-04-18',
    ]);
});

test('compliance alert generation command exits cleanly when tables are not available yet', function () {
    Schema::withoutForeignKeyConstraints(function (): void {
        Schema::dropIfExists('compliance_alerts');
        Schema::dropIfExists('compliance_submissions');
        Schema::dropIfExists('compliance_tasks');
        Schema::dropIfExists('compliance_records');
        Schema::dropIfExists('compliance_templates');
    });

    $this->artisan('compliance:generate-alerts', [
        '--date' => '2026-04-20',
        '--sync' => true,
    ])->assertExitCode(0);
});

test('compliance routes redirect safely when module tables are not available yet', function (
    string $routeName,
    array $parameters = [],
) {
    actingAsComplianceRole('Compliance Officer / Corporate Admin');

    Schema::withoutForeignKeyConstraints(function (): void {
        Schema::dropIfExists('compliance_alerts');
        Schema::dropIfExists('compliance_submissions');
        Schema::dropIfExists('compliance_tasks');
        Schema::dropIfExists('compliance_records');
        Schema::dropIfExists('compliance_templates');
    });

    $this->get(route($routeName, $parameters))
        ->assertRedirect(route('dashboard'))
        ->assertSessionHas('inertia.flash_data.toast.type', 'warning')
        ->assertSessionHas(
            'inertia.flash_data.toast.message',
            'Compliance & Renewals is not available until its migrations are run.',
        );
})->with([
    'records index' => ['compliance-records.index'],
    'record show' => ['compliance-records.show', ['compliance_record' => 1]],
    'calendar' => ['compliance-records.calendar'],
    'alerts index' => ['compliance-alerts.index'],
]);
