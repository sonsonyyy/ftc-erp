<?php

namespace Database\Factories;

use App\Models\TaxReportItem;
use App\Models\TaxReportRun;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<TaxReportItem>
 */
class TaxReportItemFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $baseAmount = fake()->randomFloat(2, 1000, 50000);
        $amount = fake()->randomFloat(2, 0, 5000);
        $vatAmount = fake()->randomFloat(2, 0, 6000);

        return [
            'tax_report_run_id' => TaxReportRun::factory(),
            'source_record_type' => fake()->randomElement(['withholding_record', 'vat_record']),
            'source_record_id' => fake()->numberBetween(1, 99999),
            'line_type' => fake()->word(),
            'record_date' => fake()->dateTimeBetween('-6 months', 'now'),
            'reference_no' => fake()->boolean(80) ? fake()->bothify('REF-#####') : null,
            'subject_name' => fake()->name(),
            'subject_tin' => fake()->boolean(70) ? fake()->numerify('###-###-###-###') : null,
            'base_amount' => $baseAmount,
            'amount' => $amount,
            'vat_amount' => $vatAmount,
            'gross_amount' => round($baseAmount + $vatAmount, 2),
            'payload' => [],
        ];
    }
}
