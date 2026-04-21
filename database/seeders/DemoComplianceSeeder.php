<?php

namespace Database\Seeders;

use App\Actions\Compliance\GenerateComplianceAlertsAction;
use App\Enums\ComplianceRecordStatus;
use App\Enums\ComplianceRecurrenceUnit;
use App\Enums\ComplianceTaskStatus;
use App\Models\ComplianceAlert;
use App\Models\ComplianceRecord;
use App\Models\ComplianceSubmission;
use App\Models\ComplianceTask;
use App\Models\ComplianceTemplate;
use App\Models\User;
use Carbon\CarbonImmutable;
use Illuminate\Database\Seeder;

class DemoComplianceSeeder extends Seeder
{
    /**
     * Seed compliance templates, records, history, and alerts.
     */
    public function run(): void
    {
        $today = CarbonImmutable::today();
        $complianceOfficer = User::query()->where('email', 'compliance@example.com')->first();
        $managementUser = User::query()->where('email', 'ceo@example.com')->first();

        $templates = collect([
            [
                'name' => 'GIS',
                'agency' => 'SEC',
                'category' => 'Corporate Filing',
                'description' => 'General Information Sheet filing and annual submission tracking.',
                'default_recurrence_unit' => ComplianceRecurrenceUnit::Annually->value,
            ],
            [
                'name' => 'PCAB License',
                'agency' => 'PCAB',
                'category' => 'License Renewal',
                'description' => 'Annual contractor license renewal and supporting documents.',
                'default_recurrence_unit' => ComplianceRecurrenceUnit::Annually->value,
            ],
            [
                'name' => 'Mayor\'s Permit',
                'agency' => 'Mayor\'s Office',
                'category' => 'Permit Renewal',
                'description' => 'Business permit renewal with city-level filing requirements.',
                'default_recurrence_unit' => ComplianceRecurrenceUnit::Annually->value,
            ],
            [
                'name' => 'SSS Employer Compliance',
                'agency' => 'SSS',
                'category' => 'Employer Compliance',
                'description' => 'Quarterly employer filing and proof-of-payment monitoring.',
                'default_recurrence_unit' => ComplianceRecurrenceUnit::Quarterly->value,
            ],
            [
                'name' => 'Pag-IBIG Employer Compliance',
                'agency' => 'Pag-IBIG',
                'category' => 'Employer Compliance',
                'description' => 'Monthly employer filing and payment compliance tracking.',
                'default_recurrence_unit' => ComplianceRecurrenceUnit::Monthly->value,
            ],
            [
                'name' => 'PhilHealth Employer Compliance',
                'agency' => 'PhilHealth',
                'category' => 'Employer Compliance',
                'description' => 'Monthly employer filing and remittance monitoring.',
                'default_recurrence_unit' => ComplianceRecurrenceUnit::Monthly->value,
            ],
        ])->mapWithKeys(function (array $template): array {
            $model = ComplianceTemplate::query()->updateOrCreate(
                ['name' => $template['name']],
                [
                    ...$template,
                    'default_reminder_days' => [90, 60, 30, 15, 7],
                    'is_active' => true,
                ],
            );

            return [$template['name'] => $model];
        });

        $records = [
            [
                'record_no' => 'CMP-2026-0001',
                'template' => 'GIS',
                'title' => '2026 GIS Filing',
                'due_date' => $today->addDays(15),
                'expiry_date' => null,
                'status' => ComplianceRecordStatus::Active->value,
                'notes' => 'Prepare board resolution attachment before submission.',
            ],
            [
                'record_no' => 'CMP-2026-0002',
                'template' => 'PCAB License',
                'title' => 'PCAB License Renewal',
                'due_date' => null,
                'expiry_date' => $today->addDays(30),
                'status' => ComplianceRecordStatus::Active->value,
                'notes' => 'Renewal package needs updated audited financial statements.',
            ],
            [
                'record_no' => 'CMP-2026-0003',
                'template' => 'Mayor\'s Permit',
                'title' => 'Business Permit 2026',
                'due_date' => null,
                'expiry_date' => $today->subDays(5),
                'status' => ComplianceRecordStatus::Active->value,
                'notes' => 'Expired and awaiting payment clearance.',
            ],
            [
                'record_no' => 'CMP-2026-0004',
                'template' => 'SSS Employer Compliance',
                'title' => 'SSS Quarterly Filing Q1 2026',
                'due_date' => $today->subDays(3),
                'expiry_date' => null,
                'status' => ComplianceRecordStatus::ForFiling->value,
                'notes' => 'Coordinate corrected contribution schedule before resubmission.',
            ],
            [
                'record_no' => 'CMP-2026-0005',
                'template' => 'Pag-IBIG Employer Compliance',
                'title' => 'Pag-IBIG Monthly Filing April 2026',
                'due_date' => $today->addDays(7),
                'expiry_date' => null,
                'status' => ComplianceRecordStatus::InProgress->value,
                'notes' => 'Pending proof-of-payment upload from accounting.',
            ],
            [
                'record_no' => 'CMP-2026-0006',
                'template' => 'PhilHealth Employer Compliance',
                'title' => 'PhilHealth Monthly Filing April 2026',
                'due_date' => $today->addDays(60),
                'expiry_date' => null,
                'status' => ComplianceRecordStatus::Active->value,
                'notes' => 'Recurring monthly employer filing schedule.',
            ],
        ];

        foreach ($records as $record) {
            /** @var ComplianceTemplate $template */
            $template = $templates->get($record['template']);

            ComplianceRecord::query()->updateOrCreate(
                ['record_no' => $record['record_no']],
                [
                    'compliance_template_id' => $template->getKey(),
                    'title' => $record['title'],
                    'agency' => $template->agency,
                    'category' => $template->category,
                    'description' => $template->description,
                    'due_date' => $record['due_date'],
                    'expiry_date' => $record['expiry_date'],
                    'recurrence_unit' => $template->default_recurrence_unit->value,
                    'reminder_days' => [90, 60, 30, 15, 7],
                    'assigned_user_id' => $complianceOfficer?->getKey(),
                    'status' => $record['status'],
                    'notes' => $record['notes'],
                ],
            );
        }

        /** @var ComplianceRecord $pagibigRecord */
        $pagibigRecord = ComplianceRecord::query()->where('record_no', 'CMP-2026-0005')->firstOrFail();
        /** @var ComplianceRecord $pcabRecord */
        $pcabRecord = ComplianceRecord::query()->where('record_no', 'CMP-2026-0002')->firstOrFail();

        ComplianceSubmission::query()->updateOrCreate(
            [
                'compliance_record_id' => $pagibigRecord->getKey(),
                'reference_no' => 'SUB-CMP-0001',
            ],
            [
                'submitted_at' => $today->subDays(23),
                'submitted_by_user_id' => $complianceOfficer?->getKey(),
                'due_date_snapshot' => $today->subDays(23),
                'expiry_date_snapshot' => null,
                'next_due_date' => $pagibigRecord->due_date,
                'next_expiry_date' => null,
                'remarks' => 'Prior month filing posted with OR reference.',
            ],
        );

        $pagibigRecord->update([
            'latest_submission_at' => $today->subDays(23),
            'latest_submission_reference' => 'SUB-CMP-0001',
        ]);

        ComplianceSubmission::query()->updateOrCreate(
            [
                'compliance_record_id' => $pcabRecord->getKey(),
                'reference_no' => 'SUB-CMP-0002',
            ],
            [
                'submitted_at' => $today->subMonths(10),
                'submitted_by_user_id' => $complianceOfficer?->getKey(),
                'due_date_snapshot' => null,
                'expiry_date_snapshot' => $today->subMonths(10),
                'next_due_date' => null,
                'next_expiry_date' => $pcabRecord->expiry_date,
                'remarks' => 'Previous annual license renewal completed.',
            ],
        );

        $pcabRecord->update([
            'latest_submission_at' => $today->subMonths(10),
            'latest_submission_reference' => 'SUB-CMP-0002',
        ]);

        foreach ([
            [
                'record_no' => 'CMP-2026-0001',
                'title' => 'Finalize GIS exhibits',
                'due_date' => $today->addDays(10),
                'status' => ComplianceTaskStatus::Open->value,
                'notes' => 'Collect signed secretary certificate and board details.',
            ],
            [
                'record_no' => 'CMP-2026-0002',
                'title' => 'Prepare PCAB renewal package',
                'due_date' => $today->addDays(21),
                'status' => ComplianceTaskStatus::Open->value,
                'notes' => 'Coordinate audited FS and project track record summary.',
            ],
            [
                'record_no' => 'CMP-2026-0004',
                'title' => 'Submit corrected SSS filing',
                'due_date' => $today->addDay(),
                'status' => ComplianceTaskStatus::Completed->value,
                'notes' => 'Recomputed delinquent filing was already endorsed for sign-off.',
            ],
        ] as $task) {
            $recordId = ComplianceRecord::query()
                ->where('record_no', $task['record_no'])
                ->value('id');

            ComplianceTask::query()->updateOrCreate(
                [
                    'compliance_record_id' => $recordId,
                    'title' => $task['title'],
                ],
                [
                    'due_date' => $task['due_date'],
                    'assigned_user_id' => $complianceOfficer?->getKey(),
                    'status' => $task['status'],
                    'completed_at' => $task['status'] === ComplianceTaskStatus::Completed->value
                        ? $today->subDay()
                        : null,
                    'notes' => $task['notes'],
                ],
            );
        }

        app(GenerateComplianceAlertsAction::class)->handle($today);

        $firstAlert = ComplianceAlert::query()
            ->orderBy('scheduled_for')
            ->orderBy('id')
            ->first();

        if ($firstAlert !== null && $managementUser !== null) {
            $firstAlert->update([
                'acknowledged_at' => $today->startOfDay(),
                'acknowledged_by_user_id' => $managementUser->getKey(),
            ]);
        }
    }
}
