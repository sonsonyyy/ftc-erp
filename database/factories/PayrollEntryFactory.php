<?php

namespace Database\Factories;

use App\Models\Employee;
use App\Models\PayrollEntry;
use App\Models\PayrollRun;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<PayrollEntry>
 */
class PayrollEntryFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $grossPay = fake()->randomFloat(2, 15000, 45000);
        $taxAmount = round($grossPay * 0.05, 2);
        $sssAmount = round($grossPay * 0.02, 2);
        $pagibigAmount = round($grossPay * 0.01, 2);
        $philhealthAmount = round($grossPay * 0.015, 2);
        $otherDeductions = fake()->randomFloat(2, 0, 1500);
        $totalDeductions = round(
            $taxAmount + $sssAmount + $pagibigAmount + $philhealthAmount + $otherDeductions,
            2,
        );

        return [
            'payroll_run_id' => PayrollRun::factory(),
            'employee_id' => Employee::factory(),
            'gross_pay' => $grossPay,
            'tax_amount' => $taxAmount,
            'sss_amount' => $sssAmount,
            'pagibig_amount' => $pagibigAmount,
            'philhealth_amount' => $philhealthAmount,
            'other_deductions_amount' => $otherDeductions,
            'total_deductions' => $totalDeductions,
            'net_pay' => round($grossPay - $totalDeductions, 2),
            'remarks' => fake()->boolean(35) ? fake()->sentence() : null,
        ];
    }
}
