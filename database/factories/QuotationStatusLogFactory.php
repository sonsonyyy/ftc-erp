<?php

namespace Database\Factories;

use App\Enums\QuotationStatus;
use App\Models\Quotation;
use App\Models\QuotationStatusLog;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<QuotationStatusLog>
 */
class QuotationStatusLogFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'quotation_id' => Quotation::factory(),
            'from_status' => QuotationStatus::Draft,
            'to_status' => QuotationStatus::Submitted,
            'changed_by' => User::factory(),
            'remarks' => fake()->sentence(),
            'changed_at' => fake()->dateTimeBetween('-3 months', 'now'),
        ];
    }
}
