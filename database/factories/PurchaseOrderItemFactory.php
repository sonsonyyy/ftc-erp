<?php

namespace Database\Factories;

use App\Models\InventoryItem;
use App\Models\PurchaseOrder;
use App\Models\PurchaseOrderItem;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<PurchaseOrderItem>
 */
class PurchaseOrderItemFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'purchase_order_id' => PurchaseOrder::factory(),
            'purchase_request_item_id' => null,
            'inventory_item_id' => InventoryItem::factory(),
            'item_description' => fake()->words(4, true),
            'unit' => fake()->randomElement(['pcs', 'set', 'roll', 'box']),
            'ordered_quantity' => fake()->randomFloat(2, 1, 25),
            'unit_cost' => fake()->randomFloat(2, 50, 5000),
            'remarks' => fake()->boolean(30) ? fake()->sentence() : null,
        ];
    }
}
