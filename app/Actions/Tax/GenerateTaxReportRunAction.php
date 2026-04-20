<?php

namespace App\Actions\Tax;

use App\Enums\TaxReportType;
use App\Enums\VatRecordType;
use App\Enums\WithholdingRecordType;
use App\Models\TaxReportRun;
use App\Models\User;
use App\Models\VatRecord;
use App\Models\WithholdingRecord;
use Illuminate\Support\Facades\DB;

class GenerateTaxReportRunAction
{
    public function __construct(
        private SyncPayrollWithholdingRecordsAction $syncPayrollWithholdingRecordsAction,
        private SyncInvoiceVatRecordsAction $syncInvoiceVatRecordsAction,
    ) {}

    /**
     * Generate a report-run snapshot from current statutory source records.
     *
     * @param  array<string, mixed>  $validated
     */
    public function handle(array $validated, ?User $user = null): TaxReportRun
    {
        $reportType = TaxReportType::from($validated['report_type']);
        $periodFrom = (string) $validated['period_from'];
        $periodTo = (string) $validated['period_to'];

        if ($reportType->usesWithholdingRecords()) {
            $this->syncPayrollWithholdingRecordsAction->syncPeriod($periodFrom, $periodTo);
        }

        if ($reportType->usesVatRecords()) {
            $this->syncInvoiceVatRecordsAction->syncPeriod($periodFrom, $periodTo);
        }

        /** @var TaxReportRun $taxReportRun */
        $taxReportRun = DB::transaction(function () use ($validated, $user, $reportType, $periodFrom, $periodTo): TaxReportRun {
            $reportRun = TaxReportRun::query()->create([
                'report_no' => $this->reportNumber($reportType),
                'report_type' => $reportType->value,
                'period_from' => $periodFrom,
                'period_to' => $periodTo,
                'generated_by_user_id' => $user?->getKey(),
                'generated_at' => now(),
                'remarks' => $validated['remarks'] ?? null,
            ]);

            $items = [
                ...$this->withholdingItems($reportType, $periodFrom, $periodTo),
                ...$this->vatItems($reportType, $periodFrom, $periodTo),
            ];

            if ($items !== []) {
                $reportRun->items()->createMany($items);
            }

            $reportRun->update([
                'item_count' => count($items),
                'base_amount_total' => round((float) collect($items)->sum('base_amount'), 2),
                'amount_total' => round((float) collect($items)->sum('amount'), 2),
                'vat_amount_total' => round((float) collect($items)->sum('vat_amount'), 2),
                'gross_amount_total' => round((float) collect($items)->sum('gross_amount'), 2),
            ]);

            return $reportRun->refresh();
        });

        return $taxReportRun->load([
            'generatedBy:id,name',
            'items' => fn ($query) => $query
                ->orderBy('record_date')
                ->orderBy('id'),
        ]);
    }

    /**
     * Build withholding-backed line items for the report.
     *
     * @return array<int, array<string, mixed>>
     */
    private function withholdingItems(TaxReportType $reportType, string $periodFrom, string $periodTo): array
    {
        if (! $reportType->usesWithholdingRecords()) {
            return [];
        }

        $types = match ($reportType) {
            TaxReportType::Form1601C,
            TaxReportType::Form1604C,
            TaxReportType::Form2316 => [
                WithholdingRecordType::CompensationWithholding->value,
            ],
            TaxReportType::Form2307,
            TaxReportType::Form1601E,
            TaxReportType::Form1601EQ => [
                WithholdingRecordType::ExpandedWithholding->value,
            ],
            TaxReportType::VatSummary => [],
        };

        if ($types === []) {
            return [];
        }

        return WithholdingRecord::query()
            ->betweenRecordDates($periodFrom, $periodTo)
            ->whereIn('record_type', $types)
            ->orderBy('record_date')
            ->orderBy('id')
            ->get()
            ->map(fn (WithholdingRecord $record) => [
                'source_record_type' => 'withholding_record',
                'source_record_id' => $record->getKey(),
                'line_type' => $record->record_type->value,
                'record_date' => optional($record->record_date)?->toDateString(),
                'reference_no' => $record->reference_no,
                'subject_name' => $record->subject_name,
                'subject_tin' => $record->subject_tin,
                'base_amount' => $record->base_amount,
                'amount' => $record->amount,
                'vat_amount' => 0,
                'gross_amount' => $record->base_amount,
                'payload' => [
                    ...($record->metadata ?? []),
                    'record_type_label' => $record->record_type->label(),
                ],
            ])
            ->all();
    }

    /**
     * Build VAT-backed line items for the report.
     *
     * @return array<int, array<string, mixed>>
     */
    private function vatItems(TaxReportType $reportType, string $periodFrom, string $periodTo): array
    {
        if (! $reportType->usesVatRecords()) {
            return [];
        }

        return VatRecord::query()
            ->where('record_type', VatRecordType::OutputVat->value)
            ->betweenRecordDates($periodFrom, $periodTo)
            ->orderBy('record_date')
            ->orderBy('id')
            ->get()
            ->map(fn (VatRecord $record) => [
                'source_record_type' => 'vat_record',
                'source_record_id' => $record->getKey(),
                'line_type' => $record->record_type->value,
                'record_date' => optional($record->record_date)?->toDateString(),
                'reference_no' => $record->reference_no,
                'subject_name' => $record->counterparty_name,
                'subject_tin' => $record->counterparty_tin,
                'base_amount' => $record->net_amount,
                'amount' => 0,
                'vat_amount' => $record->vat_amount,
                'gross_amount' => $record->gross_amount,
                'payload' => [
                    ...($record->metadata ?? []),
                    'record_type_label' => $record->record_type->label(),
                ],
            ])
            ->all();
    }

    /**
     * Build a readable report number.
     */
    private function reportNumber(TaxReportType $reportType): string
    {
        $prefix = match ($reportType) {
            TaxReportType::Form1601C => 'TAX-1601C',
            TaxReportType::Form1604C => 'TAX-1604C',
            TaxReportType::Form2316 => 'TAX-2316',
            TaxReportType::Form2307 => 'TAX-2307',
            TaxReportType::Form1601E => 'TAX-1601E',
            TaxReportType::Form1601EQ => 'TAX-1601EQ',
            TaxReportType::VatSummary => 'TAX-VAT',
        };

        return $prefix.'-'.now()->format('YmdHis');
    }
}
