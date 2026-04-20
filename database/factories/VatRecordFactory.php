<?php

namespace Database\Factories;

use App\Enums\VatRecordType;
use App\Models\VatRecord;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<VatRecord>
 */
class VatRecordFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $netAmount = fake()->randomFloat(2, 10000, 150000);
        $vatAmount = round($netAmount * 0.12, 2);

        return [
            'record_type' => VatRecordType::OutputVat,
            'source_type' => 'invoice',
            'source_id' => fake()->numberBetween(1, 99999),
            'record_date' => fake()->dateTimeBetween('-6 months', 'now'),
            'reference_no' => 'INV-'.fake()->numerify('######'),
            'counterparty_name' => fake()->company(),
            'counterparty_tin' => fake()->boolean(75) ? fake()->numerify('###-###-###-###') : null,
            'net_amount' => $netAmount,
            'vat_amount' => $vatAmount,
            'gross_amount' => round($netAmount + $vatAmount, 2),
            'metadata' => [],
        ];
    }
}
