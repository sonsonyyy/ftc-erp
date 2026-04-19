<?php

namespace Database\Factories;

use App\Enums\StockMovementType;
use App\Models\InventoryItem;
use App\Models\StockMovement;
use App\Models\User;
use App\Models\Warehouse;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Carbon;

/**
 * @extends Factory<StockMovement>
 */
class StockMovementFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $movementType = fake()->randomElement(StockMovementType::cases());
        $quantity = fake()->randomFloat(2, 1, 20);

        return [
            'inventory_item_id' => InventoryItem::factory(),
            'warehouse_id' => Warehouse::factory(),
            'project_id' => null,
            'work_order_id' => null,
            'reference_type' => 'manual',
            'reference_id' => null,
            'reference_number' => fake()->boolean(60) ? fake()->bothify('REF-#####') : null,
            'movement_type' => $movementType,
            'quantity' => $quantity,
            'balance_after' => $movementType->isInbound()
                ? fake()->randomFloat(2, $quantity, 100)
                : fake()->randomFloat(2, 0, 100),
            'unit_cost' => fake()->boolean(70) ? fake()->randomFloat(2, 50, 1000) : null,
            'movement_date' => Carbon::instance(fake()->dateTimeBetween('-2 months', 'now'))->toDateString(),
            'remarks' => fake()->boolean(35) ? fake()->sentence() : null,
            'created_by' => User::factory(),
        ];
    }
}
