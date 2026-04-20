<?php

namespace Database\Factories;

use App\Models\InventoryItem;
use App\Models\PurchaseRequest;
use App\Models\PurchaseRequestItem;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<PurchaseRequestItem>
 */
class PurchaseRequestItemFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'purchase_request_id' => PurchaseRequest::factory(),
            'inventory_item_id' => InventoryItem::factory(),
            'item_description' => fake()->words(4, true),
            'unit' => fake()->randomElement(['pcs', 'set', 'roll', 'box']),
            'requested_quantity' => fake()->randomFloat(2, 1, 25),
            'estimated_unit_cost' => fake()->boolean(85) ? fake()->randomFloat(2, 50, 5000) : null,
            'remarks' => fake()->boolean(30) ? fake()->sentence() : null,
        ];
    }
}
