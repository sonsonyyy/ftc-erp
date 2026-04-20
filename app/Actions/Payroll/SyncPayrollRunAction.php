<?php

namespace App\Actions\Payroll;

use App\Actions\Tax\SyncPayrollWithholdingRecordsAction;
use App\Models\PayrollRun;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class SyncPayrollRunAction
{
    public function __construct(
        private SyncPayrollWithholdingRecordsAction $syncPayrollWithholdingRecordsAction,
    ) {}

    /**
     * Persist a payroll run and recalculate entry and run totals.
     *
     * @param  array<string, mixed>  $validated
     */
    public function handle(array $validated, ?PayrollRun $payrollRun = null, ?User $user = null): PayrollRun
    {
        /** @var PayrollRun $resolvedPayrollRun */
        $resolvedPayrollRun = DB::transaction(function () use ($validated, $payrollRun, $user): PayrollRun {
            $resolvedPayrollRun = $payrollRun ?? new PayrollRun;
            $existingEntryIds = $resolvedPayrollRun->exists
                ? $resolvedPayrollRun->entries()->pluck('id')->all()
                : [];

            $resolvedPayrollRun->fill([
                'payroll_run_no' => $validated['payroll_run_no'],
                'period_from' => $validated['period_from'],
                'period_to' => $validated['period_to'],
                'payroll_date' => $validated['payroll_date'],
                'status' => $validated['status'],
                'remarks' => $validated['remarks'] ?? null,
            ]);

            if (! $resolvedPayrollRun->exists || $resolvedPayrollRun->prepared_by_user_id === null) {
                $resolvedPayrollRun->prepared_by_user_id = $user?->getKey();
            }

            $resolvedPayrollRun->save();
            $resolvedPayrollRun->entries()->delete();
            $this->syncPayrollWithholdingRecordsAction->deleteForEntryIds($existingEntryIds);

            $grossTotal = 0.0;
            $deductionsTotal = 0.0;
            $netTotal = 0.0;

            foreach ($validated['entries'] as $entryData) {
                $additionalDeductions = round((float) collect($entryData['deductions'] ?? [])->sum(
                    fn (array $deduction): float => (float) $deduction['amount'],
                ), 2);

                $totalDeductions = round(
                    (float) $entryData['tax_amount']
                    + (float) $entryData['sss_amount']
                    + (float) $entryData['pagibig_amount']
                    + (float) $entryData['philhealth_amount']
                    + $additionalDeductions,
                    2,
                );

                $netPay = max(round((float) $entryData['gross_pay'] - $totalDeductions, 2), 0);

                $entry = $resolvedPayrollRun->entries()->create([
                    'employee_id' => $entryData['employee_id'],
                    'gross_pay' => $entryData['gross_pay'],
                    'tax_amount' => $entryData['tax_amount'],
                    'sss_amount' => $entryData['sss_amount'],
                    'pagibig_amount' => $entryData['pagibig_amount'],
                    'philhealth_amount' => $entryData['philhealth_amount'],
                    'other_deductions_amount' => $additionalDeductions,
                    'total_deductions' => $totalDeductions,
                    'net_pay' => $netPay,
                    'remarks' => $entryData['remarks'] ?? null,
                ]);

                foreach ($entryData['deductions'] ?? [] as $deductionData) {
                    $entry->deductions()->create([
                        'deduction_name' => $deductionData['deduction_name'],
                        'amount' => $deductionData['amount'],
                        'remarks' => $deductionData['remarks'] ?? null,
                    ]);
                }

                $grossTotal += round((float) $entryData['gross_pay'], 2);
                $deductionsTotal += $totalDeductions;
                $netTotal += $netPay;
            }

            $resolvedPayrollRun->update([
                'gross_total' => round($grossTotal, 2),
                'total_deductions' => round($deductionsTotal, 2),
                'net_total' => round($netTotal, 2),
            ]);

            $resolvedPayrollRun = $resolvedPayrollRun->refresh();

            $this->syncPayrollWithholdingRecordsAction->handle($resolvedPayrollRun);

            return $resolvedPayrollRun;
        });

        return $resolvedPayrollRun->load([
            'preparedBy:id,name',
            'entries' => fn ($query) => $query
                ->with([
                    'employee:id,employee_no,first_name,last_name,middle_name,department_id,position_id',
                    'employee.department:id,name',
                    'employee.position:id,title',
                    'deductions:id,payroll_entry_id,deduction_name,amount,remarks',
                ])
                ->orderBy('id'),
        ]);
    }
}
