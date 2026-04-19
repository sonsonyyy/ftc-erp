<?php

namespace Database\Factories;

use App\Enums\InventoryItemStatus;
use App\Models\InventoryCategory;
use App\Models\InventoryItem;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<InventoryItem>
 */
class InventoryItemFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'sku' => fake()->boolean(65) ? fake()->unique()->bothify('SKU-#####') : null,
            'item_code' => 'ITM-'.fake()->unique()->numerify('#####'),
            'item_name' => fake()->words(3, true),
            'inventory_category_id' => fake()->boolean(80) ? InventoryCategory::factory() : null,
            'unit' => fake()->randomElement(['pcs', 'box', 'set', 'meter', 'roll']),
            'reorder_level' => fake()->randomFloat(2, 0, 50),
            'standard_cost' => fake()->boolean(80) ? fake()->randomFloat(2, 50, 10000) : null,
            'status' => fake()->randomElement(InventoryItemStatus::cases()),
            'notes' => fake()->boolean(35) ? fake()->sentence() : null,
        ];
    }
}
