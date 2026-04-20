<?php

namespace Database\Seeders;

use App\Actions\Tax\GenerateTaxReportRunAction;
use App\Actions\Tax\SyncInvoiceVatRecordsAction;
use App\Actions\Tax\SyncPayrollWithholdingRecordsAction;
use App\Enums\TaxReportType;
use App\Models\TaxReportItem;
use App\Models\TaxReportRun;
use App\Models\User;
use App\Models\VatRecord;
use App\Models\WithholdingRecord;
use Illuminate\Database\Seeder;
use RuntimeException;

class DemoTaxStatutorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(
        SyncPayrollWithholdingRecordsAction $syncPayrollWithholdingRecordsAction,
        SyncInvoiceVatRecordsAction $syncInvoiceVatRecordsAction,
        GenerateTaxReportRunAction $generateTaxReportRunAction,
    ): void {
        TaxReportItem::query()->delete();
        TaxReportRun::query()->withTrashed()->forceDelete();
        VatRecord::query()->delete();
        WithholdingRecord::query()->delete();

        $syncPayrollWithholdingRecordsAction->syncPeriod('2026-01-01', '2026-12-31');
        $syncInvoiceVatRecordsAction->syncPeriod('2026-01-01', '2026-12-31');

        $generateTaxReportRunAction->handle([
            'report_type' => TaxReportType::Form1601C->value,
            'period_from' => '2026-03-01',
            'period_to' => '2026-03-31',
            'remarks' => 'Demo March compensation withholding run derived from processed payroll.',
        ], $this->userByEmail('hr@example.com'));

        $generateTaxReportRunAction->handle([
            'report_type' => TaxReportType::VatSummary->value,
            'period_from' => '2026-01-01',
            'period_to' => '2026-04-30',
            'remarks' => 'Demo VAT summary derived from issued invoice records.',
        ], $this->userByEmail('billing@example.com'));
    }

    /**
     * Resolve the demo user by email.
     */
    private function userByEmail(string $email): User
    {
        $user = User::query()
            ->where('email', $email)
            ->first();

        if (! $user instanceof User) {
            throw new RuntimeException("User [{$email}] was not found while seeding tax/statutory data.");
        }

        return $user;
    }
}
