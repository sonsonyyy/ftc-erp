<?php

namespace Database\Seeders;

use App\Enums\QuotationStatus;
use App\Models\Quotation;
use App\Models\QuotationStatusLog;
use App\Models\User;
use Illuminate\Database\Seeder;
use RuntimeException;

class DemoQuotationsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $quotations = [
            [
                'quotation_no' => 'QTN-2026-0001',
                'customer_alias' => 'metrobuild',
                'site_alias' => 'metrobuild_makati_corporate_center',
                'subject' => 'Tower A sprinkler retrofit and alarm device replacement',
                'quotation_date' => '2026-01-08',
                'valid_until' => '2026-02-07',
                'quotation_amount' => '1250000.00',
                'prepared_by_email' => 'sales@example.com',
                'assigned_sales_email' => 'sales@example.com',
                'remarks' => 'Priority commercial retrofit package for occupied tenant floors.',
                'materialized_at' => '2026-01-22 16:20:00',
                'status_history' => [
                    [
                        'to_status' => QuotationStatus::Draft,
                        'remarks' => 'Initial costing and site walk notes encoded.',
                        'changed_at' => '2026-01-08 09:00:00',
                    ],
                    [
                        'to_status' => QuotationStatus::Submitted,
                        'remarks' => 'Formal proposal submitted to client engineering.',
                        'changed_at' => '2026-01-10 11:30:00',
                    ],
                    [
                        'to_status' => QuotationStatus::UnderReview,
                        'remarks' => 'Client requested revised phasing and access plan.',
                        'changed_at' => '2026-01-15 14:00:00',
                    ],
                    [
                        'to_status' => QuotationStatus::Awarded,
                        'remarks' => 'Client issued notice to proceed.',
                        'changed_at' => '2026-01-22 16:20:00',
                    ],
                ],
            ],
            [
                'quotation_no' => 'QTN-2026-0002',
                'customer_alias' => 'harbor_view',
                'site_alias' => 'harbor_view_pasig_east_tower',
                'subject' => 'Basement pump room upgrade and zone monitoring improvements',
                'quotation_date' => '2026-02-04',
                'valid_until' => '2026-03-05',
                'quotation_amount' => '845000.00',
                'prepared_by_email' => 'sales@example.com',
                'assigned_sales_email' => 'sales.coordinator@example.com',
                'remarks' => 'Pending owner committee sign-off.',
                'status_history' => [
                    [
                        'to_status' => QuotationStatus::Draft,
                        'remarks' => 'Initial scope compiled after property walk-through.',
                        'changed_at' => '2026-02-04 08:45:00',
                    ],
                    [
                        'to_status' => QuotationStatus::Submitted,
                        'remarks' => 'Issued to property management for technical review.',
                        'changed_at' => '2026-02-06 10:10:00',
                    ],
                    [
                        'to_status' => QuotationStatus::UnderReview,
                        'remarks' => 'Awaiting owner comments on weekend shutdown window.',
                        'changed_at' => '2026-02-11 15:20:00',
                    ],
                ],
            ],
            [
                'quotation_no' => 'QTN-2026-0003',
                'customer_alias' => 'san_isidro_medical',
                'site_alias' => 'san_isidro_main_hospital_campus',
                'subject' => 'Annual fire alarm preventive maintenance contract',
                'quotation_date' => '2026-02-18',
                'valid_until' => '2026-03-20',
                'quotation_amount' => '392000.00',
                'prepared_by_email' => 'sales.coordinator@example.com',
                'assigned_sales_email' => 'sales@example.com',
                'remarks' => 'Awaiting purchase request release from hospital admin.',
                'status_history' => [
                    [
                        'to_status' => QuotationStatus::Draft,
                        'remarks' => 'Annual maintenance package prepared from prior service history.',
                        'changed_at' => '2026-02-18 09:30:00',
                    ],
                    [
                        'to_status' => QuotationStatus::Submitted,
                        'remarks' => 'Submitted to biomedical and facilities teams.',
                        'changed_at' => '2026-02-19 13:15:00',
                    ],
                ],
            ],
            [
                'quotation_no' => 'QTN-2026-0004',
                'customer_alias' => 'northpoint_foods',
                'site_alias' => 'northpoint_bulacan_cold_storage_plant',
                'subject' => 'Warehouse detection panel replacement and cable rectification',
                'quotation_date' => '2026-03-12',
                'valid_until' => '2026-04-11',
                'quotation_amount' => '618000.00',
                'prepared_by_email' => 'sales@example.com',
                'assigned_sales_email' => 'sales@example.com',
                'remarks' => 'Draft kept pending because client requested alternate panel brand.',
                'status_history' => [
                    [
                        'to_status' => QuotationStatus::Draft,
                        'remarks' => 'Draft remains pending final equipment option.',
                        'changed_at' => '2026-03-12 16:00:00',
                    ],
                ],
            ],
            [
                'quotation_no' => 'QTN-2026-0005',
                'customer_alias' => 'metrobuild',
                'site_alias' => 'metrobuild_laguna_fabrication_yard',
                'subject' => 'Fabrication yard fire pump controller and hydrant repairs',
                'quotation_date' => '2026-01-20',
                'valid_until' => '2026-02-19',
                'quotation_amount' => '287500.00',
                'prepared_by_email' => 'sales.coordinator@example.com',
                'assigned_sales_email' => 'sales@example.com',
                'remarks' => 'Lost to a lower-priced local contractor.',
                'lost_reason' => 'Client awarded the job to a local contractor on lower price.',
                'status_history' => [
                    [
                        'to_status' => QuotationStatus::Draft,
                        'remarks' => 'Repair scope consolidated from maintenance observations.',
                        'changed_at' => '2026-01-20 10:00:00',
                    ],
                    [
                        'to_status' => QuotationStatus::Submitted,
                        'remarks' => 'Commercial proposal issued for review.',
                        'changed_at' => '2026-01-22 13:40:00',
                    ],
                    [
                        'to_status' => QuotationStatus::UnderReview,
                        'remarks' => 'Client benchmarked against two local contractors.',
                        'changed_at' => '2026-01-28 09:15:00',
                    ],
                    [
                        'to_status' => QuotationStatus::Lost,
                        'remarks' => 'Lost after commercial evaluation.',
                        'changed_at' => '2026-02-03 17:10:00',
                    ],
                ],
            ],
            [
                'quotation_no' => 'QTN-2026-0006',
                'customer_alias' => 'san_isidro_medical',
                'site_alias' => 'san_isidro_annex_diagnostic_wing',
                'subject' => 'Clean agent room restoration and follow-up service visit',
                'quotation_date' => '2026-02-28',
                'valid_until' => '2026-03-30',
                'quotation_amount' => '468000.00',
                'prepared_by_email' => 'sales@example.com',
                'assigned_sales_email' => 'sales.coordinator@example.com',
                'remarks' => 'Awarded service scope that will convert directly into a work order.',
                'materialized_at' => '2026-03-08 10:30:00',
                'status_history' => [
                    [
                        'to_status' => QuotationStatus::Draft,
                        'remarks' => 'Service restoration scope documented after emergency visit.',
                        'changed_at' => '2026-02-28 08:20:00',
                    ],
                    [
                        'to_status' => QuotationStatus::Submitted,
                        'remarks' => 'Issued to facilities manager for urgent approval.',
                        'changed_at' => '2026-03-01 09:45:00',
                    ],
                    [
                        'to_status' => QuotationStatus::UnderReview,
                        'remarks' => 'Client requested one round of clarifications.',
                        'changed_at' => '2026-03-04 15:00:00',
                    ],
                    [
                        'to_status' => QuotationStatus::Awarded,
                        'remarks' => 'Award confirmed and service mobilization cleared.',
                        'changed_at' => '2026-03-08 10:30:00',
                    ],
                ],
            ],
        ];

        foreach ($quotations as $demoQuotation) {
            $finalStatus = $demoQuotation['status_history'][array_key_last($demoQuotation['status_history'])]['to_status'];

            $quotation = Quotation::query()->updateOrCreate(
                ['quotation_no' => $demoQuotation['quotation_no']],
                [
                    'customer_id' => $this->customerId($demoQuotation['customer_alias']),
                    'customer_site_id' => $this->siteId($demoQuotation['site_alias']),
                    'subject' => $demoQuotation['subject'],
                    'quotation_date' => $demoQuotation['quotation_date'],
                    'valid_until' => $demoQuotation['valid_until'],
                    'quotation_amount' => $demoQuotation['quotation_amount'],
                    'status' => $finalStatus->value,
                    'prepared_by_user_id' => $this->userId($demoQuotation['prepared_by_email']),
                    'assigned_sales_user_id' => $this->userId($demoQuotation['assigned_sales_email']),
                    'materialized_at' => $finalStatus === QuotationStatus::Awarded
                        ? $demoQuotation['materialized_at']
                        : null,
                    'converted_project_id' => null,
                    'converted_work_order_id' => null,
                    'lost_reason' => $finalStatus === QuotationStatus::Lost
                        ? ($demoQuotation['lost_reason'] ?? null)
                        : null,
                    'remarks' => $demoQuotation['remarks'],
                ],
            );

            $quotation->statusLogs()->delete();

            $fromStatus = null;

            foreach ($demoQuotation['status_history'] as $statusEntry) {
                QuotationStatusLog::query()->create([
                    'quotation_id' => $quotation->getKey(),
                    'from_status' => $fromStatus,
                    'to_status' => $statusEntry['to_status']->value,
                    'changed_by' => $this->userId($demoQuotation['assigned_sales_email']),
                    'remarks' => $statusEntry['remarks'],
                    'changed_at' => $statusEntry['changed_at'],
                ]);

                $fromStatus = $statusEntry['to_status']->value;
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

    private function userId(string $email): int
    {
        $userId = User::query()
            ->where('email', $email)
            ->value('id');

        if ($userId === null) {
            throw new RuntimeException("User [{$email}] was not found while seeding quotations.");
        }

        return (int) $userId;
    }
}
