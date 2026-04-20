<?php

namespace Database\Factories;

use App\Models\Invoice;
use App\Models\InvoiceItem;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<InvoiceItem>
 */
class InvoiceItemFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $quantity = fake()->randomFloat(2, 1, 8);
        $unitPrice = fake()->randomFloat(2, 1_000, 12_000);

        return [
            'invoice_id' => Invoice::factory(),
            'description' => fake()->sentence(4),
            'unit' => fake()->randomElement(['lot', 'job', 'pc', 'set']),
            'quantity' => $quantity,
            'unit_price' => $unitPrice,
            'line_total' => round($quantity * $unitPrice, 2),
            'remarks' => fake()->boolean(40) ? fake()->sentence() : null,
        ];
    }
}
