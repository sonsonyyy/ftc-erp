<?php

namespace Database\Factories;

use App\Enums\WithholdingRecordType;
use App\Models\WithholdingRecord;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<WithholdingRecord>
 */
class WithholdingRecordFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $baseAmount = fake()->randomFloat(2, 10000, 45000);
        $amount = round($baseAmount * fake()->randomFloat(2, 0.01, 0.12), 2);

        return [
            'record_type' => fake()->randomElement(WithholdingRecordType::cases()),
            'source_type' => 'payroll_entry',
            'source_id' => fake()->numberBetween(1, 99999),
            'record_date' => fake()->dateTimeBetween('-6 months', 'now'),
            'reference_no' => 'PR-'.fake()->numerify('######'),
            'subject_name' => fake()->name(),
            'subject_tin' => fake()->boolean(75) ? fake()->numerify('###-###-###-###') : null,
            'subject_identifier' => fake()->boolean(75) ? 'EMP-'.fake()->numerify('#####') : null,
            'base_amount' => $baseAmount,
            'amount' => $amount,
            'metadata' => [],
        ];
    }
}
