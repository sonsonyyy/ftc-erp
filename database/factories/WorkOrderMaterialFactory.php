<?php

namespace Database\Factories;

use App\Models\WorkOrder;
use App\Models\WorkOrderMaterial;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<WorkOrderMaterial>
 */
class WorkOrderMaterialFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'work_order_id' => WorkOrder::factory(),
            'item_code' => fake()->boolean(60) ? fake()->bothify('MAT-###??') : null,
            'item_name' => fake()->randomElement([
                '1/2 HP jockey pump',
                'Smoke detector head',
                'Alarm bell',
                'Flexible conduit',
            ]),
            'quantity' => fake()->randomFloat(2, 1, 25),
            'unit' => fake()->randomElement(['pc', 'set', 'roll', 'box']),
            'notes' => fake()->boolean(20) ? fake()->sentence() : null,
        ];
    }
}
