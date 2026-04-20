<?php

namespace Database\Factories;

use App\Models\InventoryItem;
use App\Models\PurchaseOrderItem;
use App\Models\PurchaseReceipt;
use App\Models\PurchaseReceiptItem;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<PurchaseReceiptItem>
 */
class PurchaseReceiptItemFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'purchase_receipt_id' => PurchaseReceipt::factory(),
            'purchase_order_item_id' => PurchaseOrderItem::factory(),
            'inventory_item_id' => InventoryItem::factory(),
            'received_quantity' => fake()->randomFloat(2, 1, 15),
            'unit_cost' => fake()->randomFloat(2, 50, 5000),
            'remarks' => fake()->boolean(30) ? fake()->sentence() : null,
        ];
    }
}
