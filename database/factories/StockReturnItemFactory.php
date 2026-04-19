<?php

namespace Database\Factories;

use App\Models\InventoryItem;
use App\Models\StockReturn;
use App\Models\StockReturnItem;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<StockReturnItem>
 */
class StockReturnItemFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'stock_return_id' => StockReturn::factory(),
            'inventory_item_id' => InventoryItem::factory(),
            'quantity' => fake()->randomFloat(2, 1, 10),
            'remarks' => fake()->boolean(25) ? fake()->sentence() : null,
        ];
    }
}
