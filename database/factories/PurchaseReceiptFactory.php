<?php

namespace Database\Factories;

use App\Models\PurchaseOrder;
use App\Models\PurchaseReceipt;
use App\Models\User;
use App\Models\Warehouse;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<PurchaseReceipt>
 */
class PurchaseReceiptFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'receipt_no' => 'RCV-'.fake()->unique()->numerify('#####'),
            'purchase_order_id' => PurchaseOrder::factory(),
            'warehouse_id' => Warehouse::factory(),
            'received_by_user_id' => User::factory(),
            'received_date' => fake()->dateTimeBetween('-2 weeks', 'now'),
            'supplier_reference' => fake()->boolean(60) ? fake()->bothify('DR-###-####') : null,
            'remarks' => fake()->boolean(35) ? fake()->sentence() : null,
        ];
    }
}
