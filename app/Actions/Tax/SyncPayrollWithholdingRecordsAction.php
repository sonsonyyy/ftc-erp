<?php

namespace App\Actions\Tax;

use App\Enums\PayrollRunStatus;
use App\Enums\WithholdingRecordType;
use App\Models\PayrollEntry;
use App\Models\PayrollRun;
use App\Models\WithholdingRecord;

class SyncPayrollWithholdingRecordsAction
{
    /**
     * Sync withholding and contribution records for one payroll run.
     */
    public function handle(PayrollRun $payrollRun): void
    {
        $payrollRun->loadMissing([
            'entries.employee',
        ]);

        $entryIds = $payrollRun->entries->modelKeys();

        $this->deleteForEntryIds($entryIds);

        if ($payrollRun->status !== PayrollRunStatus::Processed) {
            return;
        }

        foreach ($payrollRun->entries as $payrollEntry) {
            $this->createRecordsForEntry($payrollRun, $payrollEntry);
        }
    }

    /**
     * Sync withholding and contribution records for processed payroll runs in a date range.
     */
    public function syncPeriod(string $from, string $to): void
    {
        PayrollRun::query()
            ->status(PayrollRunStatus::Processed->value)
            ->betweenPayrollDates($from, $to)
            ->with([
                'entries.employee',
            ])
            ->get()
            ->each(fn (PayrollRun $payrollRun) => $this->handle($payrollRun));
    }

    /**
     * Delete synced withholding records for the provided payroll entry identifiers.
     *
     * @param  array<int, int>  $entryIds
     */
    public function deleteForEntryIds(array $entryIds): void
    {
        $filteredEntryIds = collect($entryIds)
            ->filter()
            ->map(fn (mixed $entryId): int => (int) $entryId)
            ->unique()
            ->values()
            ->all();

        if ($filteredEntryIds === []) {
            return;
        }

        WithholdingRecord::query()
            ->where('source_type', 'payroll_entry')
            ->whereIn('source_id', $filteredEntryIds)
            ->delete();
    }

    /**
     * Create the relevant statutory source records for a payroll entry.
     */
    private function createRecordsForEntry(PayrollRun $payrollRun, PayrollEntry $payrollEntry): void
    {
        $employee = $payrollEntry->employee;

        if ($employee === null) {
            return;
        }

        $recordDate = optional($payrollRun->payroll_date)?->toDateString();

        if ($recordDate === null) {
            return;
        }

        $metadata = [
            'payroll_run_id' => $payrollRun->getKey(),
            'payroll_run_no' => $payrollRun->payroll_run_no,
            'employee_id' => $employee->getKey(),
            'employee_no' => $employee->employee_no,
            'employee_name' => $employee->fullName(),
            'department_name' => $employee->department?->name,
            'position_title' => $employee->position?->title,
        ];

        $records = [
            [
                'type' => WithholdingRecordType::CompensationWithholding,
                'amount' => (float) $payrollEntry->tax_amount,
            ],
            [
                'type' => WithholdingRecordType::SssContribution,
                'amount' => (float) $payrollEntry->sss_amount,
            ],
            [
                'type' => WithholdingRecordType::PagibigContribution,
                'amount' => (float) $payrollEntry->pagibig_amount,
            ],
            [
                'type' => WithholdingRecordType::PhilhealthContribution,
                'amount' => (float) $payrollEntry->philhealth_amount,
            ],
        ];

        foreach ($records as $record) {
            if (round((float) $record['amount'], 2) <= 0) {
                continue;
            }

            WithholdingRecord::query()->create([
                'record_type' => $record['type']->value,
                'source_type' => 'payroll_entry',
                'source_id' => $payrollEntry->getKey(),
                'record_date' => $recordDate,
                'reference_no' => $payrollRun->payroll_run_no,
                'subject_name' => $employee->fullName(),
                'subject_tin' => $employee->tin,
                'subject_identifier' => $employee->employee_no,
                'base_amount' => $payrollEntry->gross_pay,
                'amount' => $record['amount'],
                'metadata' => $metadata,
            ]);
        }
    }
}
