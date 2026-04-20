<?php

namespace Database\Factories;

use App\Enums\PayrollRunStatus;
use App\Models\PayrollRun;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<PayrollRun>
 */
class PayrollRunFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $periodFrom = fake()->dateTimeBetween('-4 months', '-1 month');
        $periodTo = (clone $periodFrom)->modify('+13 days');

        return [
            'payroll_run_no' => 'PR-'.fake()->unique()->numerify('######'),
            'period_from' => $periodFrom,
            'period_to' => $periodTo,
            'payroll_date' => (clone $periodTo)->modify('+2 days'),
            'status' => fake()->randomElement(PayrollRunStatus::cases()),
            'gross_total' => fake()->randomFloat(2, 50000, 250000),
            'total_deductions' => fake()->randomFloat(2, 5000, 45000),
            'net_total' => fake()->randomFloat(2, 45000, 210000),
            'prepared_by_user_id' => User::factory(),
            'remarks' => fake()->boolean(50) ? fake()->sentence() : null,
        ];
    }
}
