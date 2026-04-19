<?php

namespace Database\Factories;

use App\Models\InventoryItem;
use App\Models\StockIssuance;
use App\Models\StockIssuanceItem;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<StockIssuanceItem>
 */
class StockIssuanceItemFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'stock_issuance_id' => StockIssuance::factory(),
            'inventory_item_id' => InventoryItem::factory(),
            'quantity' => fake()->randomFloat(2, 1, 10),
            'remarks' => fake()->boolean(25) ? fake()->sentence() : null,
        ];
    }
}
