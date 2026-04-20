<?php

namespace Database\Factories;

use App\Models\PayrollDeduction;
use App\Models\PayrollEntry;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<PayrollDeduction>
 */
class PayrollDeductionFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'payroll_entry_id' => PayrollEntry::factory(),
            'deduction_name' => fake()->randomElement([
                'Cash advance',
                'Loan amortization',
                'Uniform deduction',
                'Late penalty',
            ]),
            'amount' => fake()->randomFloat(2, 150, 2500),
            'remarks' => fake()->boolean(40) ? fake()->sentence() : null,
        ];
    }
}
