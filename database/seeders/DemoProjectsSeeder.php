<?php

namespace Database\Seeders;

use App\Enums\ProjectStatus;
use App\Models\Project;
use App\Models\ProjectAssignment;
use App\Models\ProjectStatusLog;
use App\Models\Quotation;
use App\Models\User;
use Illuminate\Database\Seeder;
use RuntimeException;

class DemoProjectsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $projects = [
            [
                'project_no' => 'PRJ-2026-0001',
                'quotation_no' => 'QTN-2026-0001',
                'customer_alias' => 'metrobuild',
                'site_alias' => 'metrobuild_makati_corporate_center',
                'title' => 'Tower A sprinkler retrofit',
                'project_type' => 'Retrofit / Installation',
                'start_date' => '2026-02-05',
                'target_end_date' => '2026-04-30',
                'description' => 'Awarded retrofit package covering common areas and selected tenant floors.',
                'status_history' => [
                    [
                        'to_status' => ProjectStatus::Draft,
                        'remarks' => 'Project shell opened after award confirmation.',
                        'changed_at' => '2026-01-27 09:00:00',
                    ],
                    [
                        'to_status' => ProjectStatus::Open,
                        'remarks' => 'Released to operations for planning.',
                        'changed_at' => '2026-02-03 10:30:00',
                    ],
                    [
                        'to_status' => ProjectStatus::InProgress,
                        'remarks' => 'Mobilization and ceiling works started on site.',
                        'changed_at' => '2026-02-10 08:00:00',
                    ],
                ],
                'assignments' => [
                    [
                        'email' => 'operations@example.com',
                        'assignment_role' => 'Operations lead',
                        'notes' => 'Owns site coordination and manpower scheduling.',
                        'assigned_at' => '2026-02-03 09:00:00',
                    ],
                    [
                        'email' => 'coordinator@example.com',
                        'assignment_role' => 'Project coordinator',
                        'notes' => 'Tracks billing milestones and document turnover.',
                        'assigned_at' => '2026-02-03 09:15:00',
                    ],
                ],
            ],
            [
                'project_no' => 'PRJ-2026-0002',
                'quotation_no' => null,
                'customer_alias' => 'harbor_view',
                'site_alias' => 'harbor_view_pasig_east_tower',
                'title' => 'East Tower pump room upgrade',
                'project_type' => 'Corrective Work',
                'start_date' => '2026-04-12',
                'target_end_date' => '2026-06-20',
                'description' => 'Operations-led upgrade package awaiting weekend shutdown schedule.',
                'status_history' => [
                    [
                        'to_status' => ProjectStatus::Draft,
                        'remarks' => 'Project record staged for scheduling review.',
                        'changed_at' => '2026-04-05 11:00:00',
                    ],
                    [
                        'to_status' => ProjectStatus::Open,
                        'remarks' => 'Released after client confirmed access windows.',
                        'changed_at' => '2026-04-12 08:30:00',
                    ],
                ],
                'assignments' => [
                    [
                        'email' => 'operations@example.com',
                        'assignment_role' => 'Operations lead',
                        'notes' => 'Coordinates shutdown permits and permits to work.',
                        'assigned_at' => '2026-04-12 08:00:00',
                    ],
                    [
                        'email' => 'coordinator@example.com',
                        'assignment_role' => 'Client coordinator',
                        'notes' => 'Handles tower admin and owner coordination.',
                        'assigned_at' => '2026-04-12 08:10:00',
                    ],
                ],
            ],
            [
                'project_no' => 'PRJ-2026-0003',
                'quotation_no' => null,
                'customer_alias' => 'northpoint_foods',
                'site_alias' => 'northpoint_bulacan_cold_storage_plant',
                'title' => 'Cold storage detection panel replacement',
                'project_type' => 'Upgrade',
                'start_date' => '2026-04-25',
                'target_end_date' => '2026-05-30',
                'description' => 'Pending release for hardware replacement in the warehouse zone.',
                'status_history' => [
                    [
                        'to_status' => ProjectStatus::Draft,
                        'remarks' => 'Project staged while procurement options are finalized.',
                        'changed_at' => '2026-04-18 16:00:00',
                    ],
                ],
                'assignments' => [
                    [
                        'email' => 'operations@example.com',
                        'assignment_role' => 'Operations lead',
                        'notes' => 'Awaiting procurement confirmation before release.',
                        'assigned_at' => '2026-04-18 16:15:00',
                    ],
                ],
            ],
            [
                'project_no' => 'PRJ-2026-0004',
                'quotation_no' => null,
                'customer_alias' => 'san_isidro_medical',
                'site_alias' => 'san_isidro_main_hospital_campus',
                'title' => 'Main campus alarm device audit and rectification',
                'project_type' => 'Contract Job',
                'start_date' => '2026-01-12',
                'target_end_date' => '2026-02-28',
                'description' => 'Completed hospital compliance package used as a reference project.',
                'actual_end_date' => '2026-02-26',
                'status_history' => [
                    [
                        'to_status' => ProjectStatus::Draft,
                        'remarks' => 'Project created from compliance scope.',
                        'changed_at' => '2026-01-10 08:30:00',
                    ],
                    [
                        'to_status' => ProjectStatus::Open,
                        'remarks' => 'Released after kick-off with facilities team.',
                        'changed_at' => '2026-01-12 09:00:00',
                    ],
                    [
                        'to_status' => ProjectStatus::InProgress,
                        'remarks' => 'Rectification works underway across occupied areas.',
                        'changed_at' => '2026-01-17 07:45:00',
                    ],
                    [
                        'to_status' => ProjectStatus::Completed,
                        'remarks' => 'Punch list cleared and turnover accepted.',
                        'changed_at' => '2026-02-26 16:45:00',
                    ],
                ],
                'assignments' => [
                    [
                        'email' => 'coordinator@example.com',
                        'assignment_role' => 'Project coordinator',
                        'notes' => 'Managed turnover and compliance checklist closeout.',
                        'assigned_at' => '2026-01-12 08:30:00',
                    ],
                ],
            ],
        ];

        foreach ($projects as $demoProject) {
            $finalStatus = $demoProject['status_history'][array_key_last($demoProject['status_history'])]['to_status'];
            $quotationId = $demoProject['quotation_no'] !== null
                ? $this->quotationId($demoProject['quotation_no'])
                : null;

            $project = Project::query()->updateOrCreate(
                ['project_no' => $demoProject['project_no']],
                [
                    'quotation_id' => $quotationId,
                    'customer_id' => $this->customerId($demoProject['customer_alias']),
                    'customer_site_id' => $this->siteId($demoProject['site_alias']),
                    'title' => $demoProject['title'],
                    'project_type' => $demoProject['project_type'],
                    'start_date' => $demoProject['start_date'],
                    'target_end_date' => $demoProject['target_end_date'],
                    'actual_end_date' => $finalStatus === ProjectStatus::Completed
                        ? ($demoProject['actual_end_date'] ?? null)
                        : null,
                    'status' => $finalStatus->value,
                    'description' => $demoProject['description'],
                ],
            );

            if ($quotationId !== null) {
                Quotation::query()
                    ->whereKey($quotationId)
                    ->update(['converted_project_id' => $project->getKey()]);
            }

            $project->statusLogs()->delete();
            $project->assignments()->delete();

            $fromStatus = null;

            foreach ($demoProject['status_history'] as $statusEntry) {
                ProjectStatusLog::query()->create([
                    'project_id' => $project->getKey(),
                    'from_status' => $fromStatus,
                    'to_status' => $statusEntry['to_status']->value,
                    'changed_by' => $this->userId('operations@example.com'),
                    'remarks' => $statusEntry['remarks'],
                    'changed_at' => $statusEntry['changed_at'],
                ]);

                $fromStatus = $statusEntry['to_status']->value;
            }

            foreach ($demoProject['assignments'] as $assignment) {
                ProjectAssignment::query()->create([
                    'project_id' => $project->getKey(),
                    'user_id' => $this->userId($assignment['email']),
                    'assignment_role' => $assignment['assignment_role'],
                    'notes' => $assignment['notes'],
                    'assigned_at' => $assignment['assigned_at'],
                ]);
            }
        }
    }

    private function customerId(string $customerAlias): int
    {
        return DemoCustomersAndSitesSeeder::customerId($customerAlias);
    }

    private function siteId(string $siteAlias): int
    {
        return DemoCustomersAndSitesSeeder::siteId($siteAlias);
    }

    private function quotationId(string $quotationNo): int
    {
        $quotationId = Quotation::query()
            ->where('quotation_no', $quotationNo)
            ->value('id');

        if ($quotationId === null) {
            throw new RuntimeException("Quotation [{$quotationNo}] was not found while seeding projects.");
        }

        return (int) $quotationId;
    }

    private function userId(string $email): int
    {
        $userId = User::query()
            ->where('email', $email)
            ->value('id');

        if ($userId === null) {
            throw new RuntimeException("User [{$email}] was not found while seeding projects.");
        }

        return (int) $userId;
    }
}
