<?php

namespace Database\Seeders;

use App\Enums\WorkOrderLogType;
use App\Enums\WorkOrderPriority;
use App\Enums\WorkOrderServiceType;
use App\Enums\WorkOrderStatus;
use App\Models\Project;
use App\Models\Quotation;
use App\Models\User;
use App\Models\WorkOrder;
use App\Models\WorkOrderAssignment;
use App\Models\WorkOrderLog;
use App\Models\WorkOrderMaterial;
use Illuminate\Database\Seeder;
use RuntimeException;

class DemoWorkOrdersSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $workOrders = [
            [
                'work_order_no' => 'WO-2026-0001',
                'quotation_no' => 'QTN-2026-0001',
                'project_no' => 'PRJ-2026-0001',
                'customer_alias' => 'metrobuild',
                'site_alias' => 'metrobuild_makati_corporate_center',
                'service_type' => WorkOrderServiceType::InstallationSupport,
                'scheduled_date' => '2026-02-10',
                'priority' => WorkOrderPriority::High,
                'summary' => 'Install main line sprinkler heads for Tower A',
                'findings' => 'Ceiling void congestion requires phased installation by floor.',
                'status_history' => [
                    [
                        'to_status' => WorkOrderStatus::Draft,
                        'details' => 'Work order drafted from awarded retrofit package.',
                        'logged_at' => '2026-02-03 08:30:00',
                    ],
                    [
                        'to_status' => WorkOrderStatus::Scheduled,
                        'details' => 'Weekend access window approved by tower admin.',
                        'logged_at' => '2026-02-07 09:30:00',
                    ],
                    [
                        'to_status' => WorkOrderStatus::InProgress,
                        'details' => 'Installation crew mobilized to site.',
                        'logged_at' => '2026-02-10 08:15:00',
                    ],
                ],
                'notes' => [
                    [
                        'details' => 'Weekend permit cleared and material staging approved.',
                        'logged_at' => '2026-02-10 13:45:00',
                        'logged_by_email' => 'operations@example.com',
                    ],
                ],
                'assignments' => [
                    [
                        'email' => 'operations@example.com',
                        'assignment_role' => 'Field supervisor',
                        'notes' => 'Leads daily manpower and safety briefings.',
                        'assigned_at' => '2026-02-07 09:00:00',
                    ],
                    [
                        'email' => 'warehouse@example.com',
                        'assignment_role' => 'Material support',
                        'notes' => 'Coordinates pull-out of sprinkler heads and fittings.',
                        'assigned_at' => '2026-02-07 09:10:00',
                    ],
                ],
                'materials' => [
                    [
                        'item_code' => 'SPR-QR-68',
                        'item_name' => 'Quick-response sprinkler head',
                        'quantity' => '48.00',
                        'unit' => 'pcs',
                        'notes' => 'For tenant floor replacements.',
                    ],
                    [
                        'item_code' => 'CLP-HGR-01',
                        'item_name' => 'Pipe hanger clamp',
                        'quantity' => '60.00',
                        'unit' => 'pcs',
                        'notes' => 'For ceiling void supports.',
                    ],
                ],
            ],
            [
                'work_order_no' => 'WO-2026-0002',
                'quotation_no' => 'QTN-2026-0001',
                'project_no' => 'PRJ-2026-0001',
                'customer_alias' => 'metrobuild',
                'site_alias' => 'metrobuild_makati_corporate_center',
                'service_type' => WorkOrderServiceType::InspectionRelatedWork,
                'scheduled_date' => '2026-02-24',
                'priority' => WorkOrderPriority::Normal,
                'summary' => 'Pressure test and zone verification for retrofit areas',
                'findings' => 'Zone 3 drain line requires another witness test before closeout.',
                'status_history' => [
                    [
                        'to_status' => WorkOrderStatus::Draft,
                        'details' => 'Inspection work order created for QA turnover.',
                        'logged_at' => '2026-02-17 08:20:00',
                    ],
                    [
                        'to_status' => WorkOrderStatus::Scheduled,
                        'details' => 'Testing schedule aligned with tenant blackout period.',
                        'logged_at' => '2026-02-20 09:00:00',
                    ],
                    [
                        'to_status' => WorkOrderStatus::InProgress,
                        'details' => 'Testing started across completed floors.',
                        'logged_at' => '2026-02-24 07:50:00',
                    ],
                    [
                        'to_status' => WorkOrderStatus::ForReview,
                        'details' => 'Pending client witness on final zone test.',
                        'logged_at' => '2026-02-24 17:15:00',
                    ],
                ],
                'notes' => [
                    [
                        'details' => 'Zone 3 retest queued for client witness next visit.',
                        'logged_at' => '2026-02-24 17:20:00',
                        'logged_by_email' => 'coordinator@example.com',
                    ],
                ],
                'assignments' => [
                    [
                        'email' => 'coordinator@example.com',
                        'assignment_role' => 'Client witness coordinator',
                        'notes' => 'Handles final review and turnover documents.',
                        'assigned_at' => '2026-02-20 08:45:00',
                    ],
                ],
                'materials' => [],
            ],
            [
                'work_order_no' => 'WO-2026-0003',
                'quotation_no' => 'QTN-2026-0006',
                'project_no' => null,
                'customer_alias' => 'san_isidro_medical',
                'site_alias' => 'san_isidro_annex_diagnostic_wing',
                'service_type' => WorkOrderServiceType::PreventiveMaintenance,
                'scheduled_date' => '2026-03-15',
                'priority' => WorkOrderPriority::Normal,
                'summary' => 'Clean agent room restoration and post-service maintenance visit',
                'findings' => 'Control panel restored, cylinders verified, and PM checklist turned over.',
                'completion_date' => '2026-03-15',
                'status_history' => [
                    [
                        'to_status' => WorkOrderStatus::Draft,
                        'details' => 'Direct service work order created from awarded quotation.',
                        'logged_at' => '2026-03-08 11:00:00',
                    ],
                    [
                        'to_status' => WorkOrderStatus::Scheduled,
                        'details' => 'Service schedule confirmed with data room owner.',
                        'logged_at' => '2026-03-10 09:10:00',
                    ],
                    [
                        'to_status' => WorkOrderStatus::InProgress,
                        'details' => 'Technicians mobilized to restore clean agent controls.',
                        'logged_at' => '2026-03-15 08:05:00',
                    ],
                    [
                        'to_status' => WorkOrderStatus::Completed,
                        'details' => 'Restoration completed and room returned to service.',
                        'logged_at' => '2026-03-15 15:30:00',
                    ],
                    [
                        'to_status' => WorkOrderStatus::Closed,
                        'details' => 'Documentation accepted by hospital facilities.',
                        'logged_at' => '2026-03-16 10:15:00',
                    ],
                ],
                'notes' => [
                    [
                        'details' => 'Monthly PM checklist and service report turned over to facilities desk.',
                        'logged_at' => '2026-03-16 10:20:00',
                        'logged_by_email' => 'operations@example.com',
                    ],
                ],
                'assignments' => [
                    [
                        'email' => 'operations@example.com',
                        'assignment_role' => 'Service supervisor',
                        'notes' => 'Leads restoration activity and turnover.',
                        'assigned_at' => '2026-03-10 08:45:00',
                    ],
                ],
                'materials' => [
                    [
                        'item_code' => 'BAT-12V-7AH',
                        'item_name' => '12V 7Ah battery',
                        'quantity' => '2.00',
                        'unit' => 'pcs',
                        'notes' => 'Panel battery replacement.',
                    ],
                ],
            ],
            [
                'work_order_no' => 'WO-2026-0004',
                'quotation_no' => null,
                'project_no' => null,
                'customer_alias' => 'northpoint_foods',
                'site_alias' => 'northpoint_bulacan_cold_storage_plant',
                'service_type' => WorkOrderServiceType::CorrectiveService,
                'scheduled_date' => '2026-04-05',
                'priority' => WorkOrderPriority::Urgent,
                'summary' => 'Emergency valve replacement for warehouse riser line',
                'findings' => 'Damaged butterfly valve replaced and riser restored to normal pressure.',
                'completion_date' => '2026-04-05',
                'status_history' => [
                    [
                        'to_status' => WorkOrderStatus::Draft,
                        'details' => 'Urgent service record opened after after-hours callout.',
                        'logged_at' => '2026-04-05 02:15:00',
                    ],
                    [
                        'to_status' => WorkOrderStatus::InProgress,
                        'details' => 'Emergency response team deployed immediately.',
                        'logged_at' => '2026-04-05 03:10:00',
                    ],
                    [
                        'to_status' => WorkOrderStatus::Completed,
                        'details' => 'Replacement completed and line repressurized.',
                        'logged_at' => '2026-04-05 11:40:00',
                    ],
                ],
                'notes' => [
                    [
                        'details' => 'Temporary bypass removed after final leak test.',
                        'logged_at' => '2026-04-05 12:00:00',
                        'logged_by_email' => 'operations@example.com',
                    ],
                ],
                'assignments' => [
                    [
                        'email' => 'operations@example.com',
                        'assignment_role' => 'Response lead',
                        'notes' => 'Owned emergency deployment and closeout.',
                        'assigned_at' => '2026-04-05 02:20:00',
                    ],
                ],
                'materials' => [
                    [
                        'item_code' => 'VLV-BF-150',
                        'item_name' => '150mm butterfly valve',
                        'quantity' => '1.00',
                        'unit' => 'pc',
                        'notes' => 'Emergency replacement stock.',
                    ],
                ],
            ],
            [
                'work_order_no' => 'WO-2026-0005',
                'quotation_no' => null,
                'project_no' => 'PRJ-2026-0002',
                'customer_alias' => 'harbor_view',
                'site_alias' => 'harbor_view_pasig_east_tower',
                'service_type' => WorkOrderServiceType::InstallationSupport,
                'scheduled_date' => '2026-04-22',
                'priority' => WorkOrderPriority::High,
                'summary' => 'Weekend mobilization for East Tower pump room upgrade',
                'findings' => null,
                'status_history' => [
                    [
                        'to_status' => WorkOrderStatus::Draft,
                        'details' => 'Mobilization work order staged for upcoming shutdown.',
                        'logged_at' => '2026-04-15 08:00:00',
                    ],
                    [
                        'to_status' => WorkOrderStatus::Scheduled,
                        'details' => 'Weekend shutdown window confirmed by tower admin.',
                        'logged_at' => '2026-04-18 14:25:00',
                    ],
                ],
                'notes' => [],
                'assignments' => [
                    [
                        'email' => 'coordinator@example.com',
                        'assignment_role' => 'Tower coordinator',
                        'notes' => 'Coordinates shutdown notices and access clearance.',
                        'assigned_at' => '2026-04-18 14:00:00',
                    ],
                ],
                'materials' => [],
            ],
            [
                'work_order_no' => 'WO-2026-0006',
                'quotation_no' => null,
                'project_no' => null,
                'customer_alias' => 'metrobuild',
                'site_alias' => 'metrobuild_laguna_fabrication_yard',
                'service_type' => WorkOrderServiceType::OtherServiceJob,
                'scheduled_date' => null,
                'priority' => WorkOrderPriority::Low,
                'summary' => 'Prepare scope walk for fabrication yard fire pump room',
                'findings' => null,
                'status_history' => [
                    [
                        'to_status' => WorkOrderStatus::Draft,
                        'details' => 'Draft work order prepared for site validation visit.',
                        'logged_at' => '2026-04-19 09:00:00',
                    ],
                ],
                'notes' => [],
                'assignments' => [],
                'materials' => [],
            ],
        ];

        foreach ($workOrders as $demoWorkOrder) {
            $finalStatus = $demoWorkOrder['status_history'][array_key_last($demoWorkOrder['status_history'])]['to_status'];
            $quotationId = $demoWorkOrder['quotation_no'] !== null
                ? $this->quotationId($demoWorkOrder['quotation_no'])
                : null;
            $projectId = $demoWorkOrder['project_no'] !== null
                ? $this->projectId($demoWorkOrder['project_no'])
                : null;

            $workOrder = WorkOrder::query()->updateOrCreate(
                ['work_order_no' => $demoWorkOrder['work_order_no']],
                [
                    'quotation_id' => $quotationId,
                    'project_id' => $projectId,
                    'customer_id' => $this->customerId($demoWorkOrder['customer_alias']),
                    'customer_site_id' => $this->siteId($demoWorkOrder['site_alias']),
                    'service_type' => $demoWorkOrder['service_type']->value,
                    'scheduled_date' => $demoWorkOrder['scheduled_date'],
                    'priority' => $demoWorkOrder['priority']->value,
                    'status' => $finalStatus->value,
                    'summary' => $demoWorkOrder['summary'],
                    'findings' => $demoWorkOrder['findings'],
                    'completion_date' => in_array($finalStatus, [WorkOrderStatus::Completed, WorkOrderStatus::Closed], true)
                        ? ($demoWorkOrder['completion_date'] ?? null)
                        : null,
                ],
            );

            if ($quotationId !== null && $projectId === null) {
                Quotation::query()
                    ->whereKey($quotationId)
                    ->update(['converted_work_order_id' => $workOrder->getKey()]);
            }

            $workOrder->logs()->delete();
            $workOrder->assignments()->delete();
            $workOrder->materials()->delete();

            $fromStatus = null;

            foreach ($demoWorkOrder['status_history'] as $statusEntry) {
                WorkOrderLog::query()->create([
                    'work_order_id' => $workOrder->getKey(),
                    'log_type' => WorkOrderLogType::StatusChange->value,
                    'from_status' => $fromStatus,
                    'to_status' => $statusEntry['to_status']->value,
                    'details' => $statusEntry['details'],
                    'logged_by' => $this->userId('operations@example.com'),
                    'logged_at' => $statusEntry['logged_at'],
                ]);

                $fromStatus = $statusEntry['to_status']->value;
            }

            foreach ($demoWorkOrder['notes'] as $noteEntry) {
                WorkOrderLog::query()->create([
                    'work_order_id' => $workOrder->getKey(),
                    'log_type' => WorkOrderLogType::Note->value,
                    'from_status' => null,
                    'to_status' => null,
                    'details' => $noteEntry['details'],
                    'logged_by' => $this->userId($noteEntry['logged_by_email']),
                    'logged_at' => $noteEntry['logged_at'],
                ]);
            }

            foreach ($demoWorkOrder['assignments'] as $assignment) {
                WorkOrderAssignment::query()->create([
                    'work_order_id' => $workOrder->getKey(),
                    'user_id' => $this->userId($assignment['email']),
                    'assignment_role' => $assignment['assignment_role'],
                    'notes' => $assignment['notes'],
                    'assigned_at' => $assignment['assigned_at'],
                ]);
            }

            foreach ($demoWorkOrder['materials'] as $material) {
                WorkOrderMaterial::query()->create([
                    'work_order_id' => $workOrder->getKey(),
                    'item_code' => $material['item_code'],
                    'item_name' => $material['item_name'],
                    'quantity' => $material['quantity'],
                    'unit' => $material['unit'],
                    'notes' => $material['notes'],
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
            throw new RuntimeException("Quotation [{$quotationNo}] was not found while seeding work orders.");
        }

        return (int) $quotationId;
    }

    private function projectId(string $projectNo): int
    {
        $projectId = Project::query()
            ->where('project_no', $projectNo)
            ->value('id');

        if ($projectId === null) {
            throw new RuntimeException("Project [{$projectNo}] was not found while seeding work orders.");
        }

        return (int) $projectId;
    }

    private function userId(string $email): int
    {
        $userId = User::query()
            ->where('email', $email)
            ->value('id');

        if ($userId === null) {
            throw new RuntimeException("User [{$email}] was not found while seeding work orders.");
        }

        return (int) $userId;
    }
}
