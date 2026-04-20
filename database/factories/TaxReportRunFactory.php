<?php

namespace Database\Factories;

use App\Enums\TaxReportType;
use App\Models\TaxReportRun;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<TaxReportRun>
 */
class TaxReportRunFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $periodFrom = fake()->dateTimeBetween('-6 months', '-1 month');
        $periodTo = (clone $periodFrom)->modify('+29 days');

        return [
            'report_no' => 'TAX-'.fake()->unique()->numerify('######'),
            'report_type' => fake()->randomElement(TaxReportType::cases()),
            'period_from' => $periodFrom,
            'period_to' => $periodTo,
            'generated_by_user_id' => User::factory(),
            'generated_at' => (clone $periodTo)->modify('+3 days'),
            'item_count' => fake()->numberBetween(0, 25),
            'base_amount_total' => fake()->randomFloat(2, 0, 500000),
            'amount_total' => fake()->randomFloat(2, 0, 50000),
            'vat_amount_total' => fake()->randomFloat(2, 0, 60000),
            'gross_amount_total' => fake()->randomFloat(2, 0, 560000),
            'remarks' => fake()->boolean(40) ? fake()->sentence() : null,
        ];
    }
}
